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
  const gen = ++loadGen
  await cancelActiveRender()
  const pdfjs = await loadPdfJs()
  const loadingTask = pdfjs.getDocument({ data: bytes.slice() })
  try {
    const pdf = await loadingTask.promise
    if (gen !== loadGen) {
      await loadingTask.destroy()
      if (open) {
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
