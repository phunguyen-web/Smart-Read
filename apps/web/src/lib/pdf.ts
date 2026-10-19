import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib'

export type OverlayPosition = {
  /** 0–1 from the left edge */
  xRatio: number
  /** 0–1 from the top edge */
  yRatio: number
}

export const OVERLAY_PRESETS = {
  'top-left': { xRatio: 0.08, yRatio: 0.08 },
  'top-center': { xRatio: 0.5, yRatio: 0.08 },
  center: { xRatio: 0.5, yRatio: 0.5 },
  'bottom-left': { xRatio: 0.08, yRatio: 0.88 },
} as const

export type OverlayPresetId = keyof typeof OVERLAY_PRESETS

export type MergeWhere = 'start' | 'after' | 'end'

let overlayFontBytes: Uint8Array | null | undefined

async function loadOverlayFontBytes(): Promise<Uint8Array | null> {
  if (overlayFontBytes !== undefined) {
    return overlayFontBytes
  }
  try {
    const url = new URL('../assets/LiberationSans-Regular.ttf', import.meta.url)
    const response = await fetch(url)
    if (!response.ok) {
      overlayFontBytes = null
      return null
    }
    overlayFontBytes = new Uint8Array(await response.arrayBuffer())
    return overlayFontBytes
  } catch {
    overlayFontBytes = null
    return null
  }
}

export async function pageCount(bytes: Uint8Array): Promise<number> {
  const doc = await PDFDocument.load(bytes)
  return doc.getPageCount()
}

export async function rotatePages(
  bytes: Uint8Array,
  pageIndexes: number[],
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes)
  for (const index of uniqueSorted(pageIndexes, false)) {
    const page = doc.getPage(index)
    page.setRotation(degrees((page.getRotation().angle + 90) % 360))
  }
  return new Uint8Array(await doc.save())
}

export async function deletePages(
  bytes: Uint8Array,
  pageIndexes: number[],
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes)
  const unique = uniqueSorted(pageIndexes, true)
  if (doc.getPageCount() - unique.length < 1) {
    throw new Error('Phải giữ lại ít nhất một trang.')
  }
  for (const index of unique) {
    doc.removePage(index)
  }
  return new Uint8Array(await doc.save())
}

export async function movePage(
  bytes: Uint8Array,
  from: number,
  to: number,
): Promise<Uint8Array> {
  const src = await PDFDocument.load(bytes)
  const count = src.getPageCount()
  if (from < 0 || from >= count || to < 0 || to >= count || from === to) {
    return bytes
  }
  const order = src.getPageIndices()
  const [item] = order.splice(from, 1)
  order.splice(to, 0, item)
  const dst = await PDFDocument.create()
  const copied = await dst.copyPages(src, order)
  for (const page of copied) {
    dst.addPage(page)
  }
  return new Uint8Array(await dst.save())
}

export function mergeInsertIndex(
  pageCountValue: number,
  currentPage: number,
  where: MergeWhere,
): number {
  if (where === 'start') {
    return 0
  }
  if (where === 'after') {
    return Math.min(pageCountValue, Math.max(0, currentPage + 1))
  }
  return pageCountValue
}

export async function mergePdf(
  base: Uint8Array,
  extra: Uint8Array,
  insertAt?: number,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(base)
  const other = await PDFDocument.load(extra)
  const copied = await doc.copyPages(other, other.getPageIndices())
  const count = doc.getPageCount()
  const at = insertAt == null ? count : Math.max(0, Math.min(insertAt, count))
  for (let index = 0; index < copied.length; index += 1) {
    doc.insertPage(at + index, copied[index])
  }
  return new Uint8Array(await doc.save())
}

export async function addTextOverlay(
  bytes: Uint8Array,
  pageIndex: number,
  text: string,
  position: OverlayPosition = OVERLAY_PRESETS['top-left'],
): Promise<Uint8Array> {
  const trimmed = text.trim()
  if (!trimmed) {
    throw new Error('Nhập nội dung chữ cần chèn.')
  }
  const doc = await PDFDocument.load(bytes)
  const page = doc.getPage(pageIndex)
  const size = 16
  const { width, height } = page.getSize()
  const x = clamp(position.xRatio, 0, 1) * width
  const y = clamp(1 - position.yRatio, 0, 1) * height - size
  const font = await embedOverlayFont(doc)
  page.drawText(trimmed, {
    x: Math.max(8, Math.min(width - 8, x)),
    y: Math.max(8, Math.min(height - 8, y)),
    size,
    font,
    color: rgb(0.22, 0.12, 0.08),
  })
  return new Uint8Array(await doc.save())
}

async function embedOverlayFont(doc: PDFDocument) {
  try {
    const fontkit = (await import('@pdf-lib/fontkit')).default
    const bytes = await loadOverlayFontBytes()
    if (!bytes) {
      return doc.embedFont(StandardFonts.Helvetica)
    }
    doc.registerFontkit(fontkit)
    return await doc.embedFont(bytes, { subset: true })
  } catch {
    return doc.embedFont(StandardFonts.Helvetica)
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function uniqueSorted(indexes: number[], descending: boolean): number[] {
  const unique = [...new Set(indexes)]
  unique.sort((a, b) => (descending ? b - a : a - b))
  return unique
}
