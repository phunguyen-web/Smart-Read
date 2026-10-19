import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import type { PDFDocumentLoadingTask, RenderTask } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerSrc = workerUrl

const MAX_CHARS = 400_000

let activeRender: RenderTask | null = null
let renderSeq = 0

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

export async function extractPageTexts(bytes: Uint8Array): Promise<string[]> {
  const loadingTask = getDocument({ data: bytes.slice() })
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
  let loadingTask: PDFDocumentLoadingTask | undefined
  try {
    loadingTask = getDocument({ data: bytes.slice() })
    const pdf = await loadingTask.promise
    if (seq !== renderSeq) {
      return
    }
    const page = await pdf.getPage(pageNumber)
    const viewport = page.getViewport({ scale: 1.15 })
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
    await loadingTask?.destroy()
  }
}
