import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from 'pdfjs-dist'

const MAX_CHARS = 400_000
export const BASE_PREVIEW_SCALE = 1.65
export const MIN_PREVIEW_EDGE = 760
export const MAX_PREVIEW_SCALE = 3.4
export const THUMBNAIL_MAX_WIDTH = 88
export const SPARSE_PAGE_EDGE = 360
export const BASE_THUMB_CONTRAST = 1.18
export const SPARSE_THUMB_CONTRAST = 1.48

type PdfJs = typeof import('pdfjs-dist')

type OpenPdf = {
  bytes: Uint8Array
  pdf: PDFDocumentProxy
  loadingTask: PDFDocumentLoadingTask
}

let pdfjsPromise: Promise<PdfJs> | null = null
let open: OpenPdf | null = null
let loadGen = 0
let opening: { bytes: Uint8Array; promise: Promise<PDFDocumentProxy> } | null = null
let activeRender: RenderTask | null = null
let renderSeq = 0

async function loadPdfJs(): Promise<PdfJs> {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const pdfjs = await import('pdfjs-dist')
      const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default
      return pdfjs
    })()
  }
  return pdfjsPromise
}

function isCancelled(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'name' in error &&
      error.name === 'RenderingCancelledException',
  )
}

async function cancelActiveRender(): Promise<void> {
  const task = activeRender
  if (!task) {
    return
  }
  activeRender = null
  task.cancel()
  try {
    await task.promise
  } catch (error) {
    if (!isCancelled(error)) {
      throw error
    }
  }
}

export function previewScaleForPage(widthPt: number, heightPt: number): number {
  const minEdge = Math.min(widthPt, heightPt)
  const maxEdge = Math.max(widthPt, heightPt)
  const byMin = MIN_PREVIEW_EDGE / Math.max(minEdge, 1)
  const byMax = 1200 / Math.max(maxEdge, 1)
  return Math.min(
    MAX_PREVIEW_SCALE,
    Math.max(BASE_PREVIEW_SCALE, Math.min(byMin, byMax * 1.35)),
  )
}

export function isSparsePage(widthPt: number, heightPt: number): boolean {
  return Math.min(widthPt, heightPt) < SPARSE_PAGE_EDGE
}

export function thumbnailScaleForPage(widthPt: number, heightPt = widthPt): number {
  const boost = isSparsePage(widthPt, heightPt) ? 1.5 : 1
  return (THUMBNAIL_MAX_WIDTH * boost) / Math.max(widthPt, 1)
}

export function thumbnailContrastForPage(widthPt: number, heightPt: number): number {
  return isSparsePage(widthPt, heightPt) ? SPARSE_THUMB_CONTRAST : BASE_THUMB_CONTRAST
}

async function openPdf(bytes: Uint8Array): Promise<PDFDocumentProxy> {
  const cached = open
  if (cached && cached.bytes === bytes) {
    return cached.pdf
  }
  if (opening && opening.bytes === bytes) {
    return opening.promise
  }
  const gen = ++loadGen
  const promise: Promise<PDFDocumentProxy> = (async (): Promise<PDFDocumentProxy> => {
    await cancelActiveRender()
    const pdfjs = await loadPdfJs()
    const loadingTask = pdfjs.getDocument({ data: bytes.slice() })
    try {
      const pdf = await loadingTask.promise
      if (gen !== loadGen) {
        await loadingTask.destroy().catch(() => undefined)
        if (open && open.bytes === bytes) {
          return open.pdf
        }
        throw new Error('Đã hủy tải PDF.')
      }
      open = { bytes, pdf, loadingTask }
      if (cached && cached.bytes !== bytes) {
        await cached.loadingTask.destroy().catch(() => undefined)
      }
      return pdf
    } catch (error) {
      if (gen === loadGen) {
        await loadingTask.destroy().catch(() => undefined)
      }
      throw error
    }
  })()
  opening = { bytes, promise }
  try {
    return await promise
  } finally {
    if (opening?.promise === promise) {
      opening = null
    }
  }
}

export const BLANK_PAGE_MIN_CHARS = 1

export function foldSearch(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

export function findPagesWithText(pages: readonly string[], query: string): number[] {
  const needle = foldSearch(query).trim()
  if (!needle) {
    return []
  }
  return pages.flatMap((text, index) => (foldSearch(text).includes(needle) ? [index] : []))
}

export function blankPageIndexes(
  pages: readonly string[],
  minChars = BLANK_PAGE_MIN_CHARS,
): number[] {
  return pages.flatMap((text, index) => (text.trim().length < minChars ? [index] : []))
}

/** Later pages whose folded text already appeared earlier. Keeps the first copy. */
export function repeatedPageIndexes(pages: readonly string[]): number[] {
  const seen = new Set<string>()
  const dups: number[] = []
  for (let index = 0; index < pages.length; index += 1) {
    const key = foldSearch(pages[index] ?? '')
      .replace(/\s+/g, ' ')
      .trim()
    if (seen.has(key)) {
      dups.push(index)
    } else {
      seen.add(key)
    }
  }
  return dups
}

export async function extractPageTexts(bytes: Uint8Array): Promise<string[]> {
  const pdfjs = await loadPdfJs()
  const loadingTask = pdfjs.getDocument({ data: bytes.slice() })
  const pdf = await loadingTask.promise
  try {
    const pages: string[] = []
    let used = 0
    for (let number = 1; number <= pdf.numPages; number += 1) {
      const page = await pdf.getPage(number)
      const content = await page.getTextContent()
      const text = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
        .replaceAll('\u0000', '')
        .replace(/\s+/g, ' ')
        .trim()
      used += text.length
      if (used > MAX_CHARS) {
        pages.push(text.slice(0, Math.max(0, MAX_CHARS - (used - text.length))))
        break
      }
      pages.push(text)
    }
    return pages
  } finally {
    await loadingTask.destroy()
  }
}

export async function renderPageToCanvas(
  bytes: Uint8Array,
  pageNumber: number,
  canvas: HTMLCanvasElement,
): Promise<void> {
  const seq = ++renderSeq
  await cancelActiveRender()
  if (seq !== renderSeq) {
    return
  }
  try {
    const pdf = await openPdf(bytes)
    if (seq !== renderSeq) {
      return
    }
    const page = await pdf.getPage(pageNumber)
    const base = page.getViewport({ scale: 1 })
    const viewport = page.getViewport({
      scale: previewScaleForPage(base.width, base.height),
    })
    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Không vẽ được trang PDF.')
    }
    canvas.width = viewport.width
    canvas.height = viewport.height
    const task = page.render({ canvasContext: context, viewport, canvas })
    activeRender = task
    await task.promise
  } catch (error) {
    if (isCancelled(error) || seq !== renderSeq) {
      return
    }
    throw error
  } finally {
    if (activeRender && seq === renderSeq) {
      activeRender = null
    }
  }
}

export async function renderPageThumbnail(
  bytes: Uint8Array,
  pageNumber: number,
  canvas: HTMLCanvasElement,
): Promise<void> {
  const pdf = await openPdf(bytes)
  const page = await pdf.getPage(pageNumber)
  const base = page.getViewport({ scale: 1 })
  const viewport = page.getViewport({
    scale: thumbnailScaleForPage(base.width, base.height),
  })
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Không vẽ được thumbnail.')
  }
  canvas.width = viewport.width
  canvas.height = viewport.height
  const sparse = isSparsePage(base.width, base.height)
  canvas.dataset.sparse = sparse ? '1' : '0'
  context.filter = `contrast(${thumbnailContrastForPage(base.width, base.height)}) saturate(1.12)`
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  await page.render({ canvasContext: context, viewport, canvas }).promise
  context.filter = 'none'
  context.strokeStyle = sparse ? 'rgba(31, 26, 22, 0.45)' : 'rgba(31, 26, 22, 0.22)'
  context.lineWidth = sparse ? 2 : 1
  context.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1)
}

export type PageImageType = 'image/png' | 'image/jpeg'

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: PageImageType,
  quality = 0.86,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Không xuất được ảnh trang.'))
          return
        }
        resolve(blob)
      },
      type,
      quality,
    )
  })
}

export async function renderPageToBlob(
  bytes: Uint8Array,
  pageNumber: number,
  type: PageImageType,
  quality = 0.86,
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  await renderPageToCanvas(bytes, pageNumber, canvas)
  if (type === 'image/jpeg') {
    const stamped = document.createElement('canvas')
    stamped.width = canvas.width
    stamped.height = canvas.height
    const context = stamped.getContext('2d')
    if (!context) {
      throw new Error('Không xuất được ảnh JPEG.')
    }
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, stamped.width, stamped.height)
    context.drawImage(canvas, 0, 0)
    return canvasToBlob(stamped, type, quality)
  }
  return canvasToBlob(canvas, type, quality)
}

export function luma(r: number, g: number, b: number): number {
  return Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b)
}

export function grayscaleRgba(data: Uint8Array | Uint8ClampedArray): void {
  for (let index = 0; index + 3 < data.length; index += 4) {
    const gray = luma(data[index]!, data[index + 1]!, data[index + 2]!)
    data[index] = gray
    data[index + 1] = gray
    data[index + 2] = gray
  }
}

async function renderPageToScratch(
  bytes: Uint8Array,
  pageNumber: number,
): Promise<HTMLCanvasElement> {
  const pdf = await openPdf(bytes)
  const page = await pdf.getPage(pageNumber)
  const base = page.getViewport({ scale: 1 })
  const viewport = page.getViewport({
    scale: previewScaleForPage(base.width, base.height),
  })
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Không vẽ được trang PDF.')
  }
  canvas.width = viewport.width
  canvas.height = viewport.height
  await page.render({ canvasContext: context, viewport, canvas }).promise
  return canvas
}

export async function grayscalePagePngs(
  bytes: Uint8Array,
  pageIndexes: number[],
): Promise<{ index: number; png: Uint8Array }[]> {
  const unique = [
    ...new Set(
      pageIndexes.filter((index) => Number.isInteger(index) && index >= 0),
    ),
  ].sort((a, b) => a - b)
  if (unique.length === 0) {
    throw new Error('Chọn ít nhất một trang để chuyển xám.')
  }
  const replacements: { index: number; png: Uint8Array }[] = []
  for (const index of unique) {
    const canvas = await renderPageToScratch(bytes, index + 1)
    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Không chuyển xám được trang.')
    }
    const image = context.getImageData(0, 0, canvas.width, canvas.height)
    grayscaleRgba(image.data)
    context.putImageData(image, 0, 0)
    const blob = await canvasToBlob(canvas, 'image/png')
    replacements.push({ index, png: new Uint8Array(await blob.arrayBuffer()) })
  }
  return replacements
}
