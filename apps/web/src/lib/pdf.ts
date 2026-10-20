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

export async function rotatePagesBy(
  bytes: Uint8Array,
  pageIndexes: number[],
  delta = 90,
): Promise<Uint8Array> {
  const step = ((Math.trunc(delta) % 360) + 360) % 360
  if (step === 0) {
    return bytes
  }
  const doc = await PDFDocument.load(bytes)
  for (const index of uniqueSorted(pageIndexes, false)) {
    const page = doc.getPage(index)
    page.setRotation(degrees((page.getRotation().angle + step) % 360))
  }
  return new Uint8Array(await doc.save())
}

export async function rotatePages(
  bytes: Uint8Array,
  pageIndexes: number[],
): Promise<Uint8Array> {
  return rotatePagesBy(bytes, pageIndexes, 90)
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

export type PageReorder = {
  order: number[]
  moved: number[]
}

export function isIdentityOrder(order: readonly number[]): boolean {
  return order.every((value, index) => value === index)
}

/** New page order after moving `movingIndexes` as one block onto `dropTo`. */
export function reorderPageBlock(
  count: number,
  movingIndexes: readonly number[],
  dropTo: number,
): PageReorder {
  const identity = Array.from({ length: count }, (_, index) => index)
  if (count < 1) {
    return { order: [], moved: [] }
  }
  const moving = [
    ...new Set(
      movingIndexes.filter((index) => Number.isInteger(index) && index >= 0 && index < count),
    ),
  ].sort((a, b) => a - b)
  if (moving.length === 0) {
    return { order: identity, moved: [] }
  }
  const dest = Math.max(0, Math.min(count - 1, dropTo))
  const movingSet = new Set(moving)
  const remaining: number[] = []
  for (let index = 0; index < count; index += 1) {
    if (!movingSet.has(index)) {
      remaining.push(index)
    }
  }
  let insertAt: number
  const destInRemaining = remaining.indexOf(dest)
  if (destInRemaining >= 0) {
    insertAt = dest > Math.min(...moving) ? destInRemaining + 1 : destInRemaining
  } else {
    insertAt = remaining.filter((index) => index < dest).length
  }
  const order = [...remaining.slice(0, insertAt), ...moving, ...remaining.slice(insertAt)]
  const moved = moving.map((_, offset) => insertAt + offset)
  return { order, moved }
}

export function reversedIndexes(count: number, selected: readonly number[]): number[] {
  return [...new Set(selected)]
    .filter((index) => Number.isInteger(index) && index >= 0 && index < count)
    .map((index) => count - 1 - index)
    .sort((a, b) => a - b)
}

export async function reversePages(bytes: Uint8Array): Promise<Uint8Array> {
  const src = await PDFDocument.load(bytes)
  const count = src.getPageCount()
  if (count < 2) {
    return bytes
  }
  const order = Array.from({ length: count }, (_, index) => count - 1 - index)
  return applyPageOrder(bytes, order)
}

export type PageNumberStyle = 'n' | 'n-of-total' | 'trang-n'
export type PageNumberPosition = 'bottom-center' | 'bottom-right' | 'top-center'

export const PAGE_NUMBER_PRESETS: Record<PageNumberPosition, OverlayPosition> = {
  'bottom-center': { xRatio: 0.5, yRatio: 0.94 },
  'bottom-right': { xRatio: 0.92, yRatio: 0.94 },
  'top-center': { xRatio: 0.5, yRatio: 0.06 },
}

export function formatPageNumber(
  pageIndex: number,
  total: number,
  style: PageNumberStyle = 'n-of-total',
): string {
  const n = pageIndex + 1
  if (style === 'n') {
    return String(n)
  }
  if (style === 'trang-n') {
    return `Trang ${n}`
  }
  return `${n} / ${total}`
}

export async function addPageNumbers(
  bytes: Uint8Array,
  options: {
    indexes?: readonly number[]
    position?: PageNumberPosition
    style?: PageNumberStyle
  } = {},
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes)
  const total = doc.getPageCount()
  if (total < 1) {
    throw new Error('Không có trang để đánh số.')
  }
  const requested = options.indexes
  const unique = uniqueSorted(
    requested && requested.length > 0 ? [...requested] : Array.from({ length: total }, (_, index) => index),
    false,
  ).filter((index) => index >= 0 && index < total)
  if (unique.length === 0) {
    throw new Error('Chọn ít nhất một trang để đánh số.')
  }
  const position = PAGE_NUMBER_PRESETS[options.position ?? 'bottom-center']
  const style = options.style ?? 'n-of-total'
  const font = await embedOverlayFont(doc)
  const size = 12
  for (const index of unique) {
    const page = doc.getPage(index)
    const { width, height } = page.getSize()
    const text = formatPageNumber(index, total, style)
    const x = clamp(position.xRatio, 0, 1) * width
    const y = clamp(1 - position.yRatio, 0, 1) * height - size
    page.drawText(text, {
      x: Math.max(8, Math.min(width - 8, x)),
      y: Math.max(8, Math.min(height - 8, y)),
      size,
      font,
      color: rgb(0.22, 0.12, 0.08),
    })
  }
  return new Uint8Array(await doc.save())
}

export async function applyPageOrder(
  bytes: Uint8Array,
  order: readonly number[],
): Promise<Uint8Array> {
  if (isIdentityOrder(order)) {
    return bytes
  }
  const src = await PDFDocument.load(bytes)
  if (order.length !== src.getPageCount()) {
    return bytes
  }
  const dst = await PDFDocument.create()
  const copied = await dst.copyPages(src, [...order])
  for (const page of copied) {
    dst.addPage(page)
  }
  return new Uint8Array(await dst.save())
}

export async function movePages(
  bytes: Uint8Array,
  fromIndexes: readonly number[],
  dropTo: number,
): Promise<Uint8Array> {
  const src = await PDFDocument.load(bytes)
  const { order } = reorderPageBlock(src.getPageCount(), fromIndexes, dropTo)
  return applyPageOrder(bytes, order)
}

export async function movePage(
  bytes: Uint8Array,
  from: number,
  to: number,
): Promise<Uint8Array> {
  return movePages(bytes, [from], to)
}

/** 0-based indexes of the copies after duplicating `selected` after the last selected page. */
export function duplicatedIndexes(selected: readonly number[]): number[] {
  const unique = [
    ...new Set(selected.filter((index) => Number.isInteger(index) && index >= 0)),
  ].sort((a, b) => a - b)
  if (unique.length === 0) {
    return []
  }
  const insertAt = unique[unique.length - 1]! + 1
  return unique.map((_, offset) => insertAt + offset)
}

export async function duplicatePages(
  bytes: Uint8Array,
  pageIndexes: number[],
): Promise<Uint8Array> {
  const src = await PDFDocument.load(bytes)
  const count = src.getPageCount()
  const unique = uniqueSorted(pageIndexes, false).filter((index) => index >= 0 && index < count)
  if (unique.length === 0) {
    throw new Error('Chọn ít nhất một trang để nhân bản.')
  }
  const dst = await PDFDocument.load(bytes)
  const insertAt = unique[unique.length - 1]! + 1
  const copied = await dst.copyPages(src, unique)
  for (let index = 0; index < copied.length; index += 1) {
    dst.insertPage(insertAt + index, copied[index])
  }
  return new Uint8Array(await dst.save())
}

export async function extractPages(
  bytes: Uint8Array,
  pageIndexes: number[],
): Promise<Uint8Array> {
  const src = await PDFDocument.load(bytes)
  const count = src.getPageCount()
  const unique = uniqueSorted(pageIndexes, false).filter((index) => index >= 0 && index < count)
  if (unique.length === 0) {
    throw new Error('Chọn ít nhất một trang để tách.')
  }
  const dst = await PDFDocument.create()
  const copied = await dst.copyPages(src, unique)
  for (const page of copied) {
    dst.addPage(page)
  }
  return new Uint8Array(await dst.save())
}

/** Keep only `pageIndexes` in the current document (sorted, de-duplicated). */
export async function keepPages(
  bytes: Uint8Array,
  pageIndexes: number[],
): Promise<Uint8Array> {
  const src = await PDFDocument.load(bytes)
  const count = src.getPageCount()
  const unique = uniqueSorted(pageIndexes, false).filter((index) => index >= 0 && index < count)
  if (unique.length === 0) {
    throw new Error('Chọn ít nhất một trang để giữ.')
  }
  if (unique.length === count) {
    return bytes
  }
  return extractPages(bytes, unique)
}

export async function splitEvery(bytes: Uint8Array, size: number): Promise<Uint8Array[]> {
  const src = await PDFDocument.load(bytes)
  const count = src.getPageCount()
  const chunk = Math.trunc(size)
  if (!Number.isInteger(chunk) || chunk < 1) {
    throw new Error('Số trang mỗi tệp phải là số nguyên từ 1.')
  }
  if (count < 1) {
    throw new Error('Không có trang để tách.')
  }
  const parts: Uint8Array[] = []
  for (let start = 0; start < count; start += chunk) {
    const indexes = Array.from(
      { length: Math.min(chunk, count - start) },
      (_, offset) => start + offset,
    )
    const dst = await PDFDocument.create()
    const copied = await dst.copyPages(src, indexes)
    for (const page of copied) {
      dst.addPage(page)
    }
    parts.push(new Uint8Array(await dst.save()))
  }
  return parts
}

const A4_WIDTH = 595.28
const A4_HEIGHT = 841.89
const TEXT_MARGIN = 50
const TEXT_SIZE = 11
const TEXT_LEADING = 15

export function wrapPdfText(
  text: string,
  measure: (value: string) => number,
  maxWidth: number,
): string[] {
  const normalized = text.replace(/\r\n/g, '\n').replaceAll('\u0000', '')
  const lines: string[] = []
  for (const raw of normalized.split('\n')) {
    const trimmed = raw.replace(/\s+$/g, '')
    if (!trimmed) {
      lines.push('')
      continue
    }
    let rest = trimmed
    while (rest.length > 0) {
      if (measure(rest) <= maxWidth) {
        lines.push(rest)
        break
      }
      let lo = 1
      let hi = rest.length
      while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2)
        if (measure(rest.slice(0, mid)) <= maxWidth) {
          lo = mid
        } else {
          hi = mid - 1
        }
      }
      let cut = lo
      const space = rest.lastIndexOf(' ', cut)
      if (space >= Math.floor(cut * 0.5)) {
        cut = space
      }
      const piece = rest.slice(0, cut).trimEnd()
      lines.push(piece || rest.slice(0, lo))
      rest = rest.slice(piece ? cut : lo).trimStart()
    }
  }
  return lines
}

export async function textPagesToPdf(pages: readonly string[]): Promise<Uint8Array> {
  if (pages.length === 0) {
    throw new Error('Không có nội dung để tạo PDF.')
  }
  const doc = await PDFDocument.create()
  const font = await embedOverlayFont(doc)
  const maxWidth = A4_WIDTH - TEXT_MARGIN * 2
  const maxLines = Math.max(1, Math.floor((A4_HEIGHT - TEXT_MARGIN * 2) / TEXT_LEADING))
  const measure = (value: string) => font.widthOfTextAtSize(value, TEXT_SIZE)
  for (const pageText of pages) {
    const wrapped = wrapPdfText(pageText, measure, maxWidth)
    const body =
      wrapped.length === 0
        ? [['']]
        : Array.from({ length: Math.ceil(wrapped.length / maxLines) }, (_, index) =>
            wrapped.slice(index * maxLines, (index + 1) * maxLines),
          )
    for (const lines of body) {
      const page = doc.addPage([A4_WIDTH, A4_HEIGHT])
      let y = A4_HEIGHT - TEXT_MARGIN - TEXT_SIZE
      for (const line of lines) {
        if (line) {
          page.drawText(line, {
            x: TEXT_MARGIN,
            y,
            size: TEXT_SIZE,
            font,
            color: rgb(0.12, 0.1, 0.08),
          })
        }
        y -= TEXT_LEADING
      }
    }
  }
  return new Uint8Array(await doc.save())
}

export async function insertBlankPage(
  bytes: Uint8Array,
  afterIndex: number,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes)
  const count = doc.getPageCount()
  if (count < 1) {
    throw new Error('Không có trang để chèn trang trắng.')
  }
  const current = Math.max(0, Math.min(count - 1, Math.trunc(afterIndex)))
  const { width, height } = doc.getPage(current).getSize()
  doc.insertPage(current + 1, [width, height])
  return new Uint8Array(await doc.save())
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

export type WatermarkStyle = 'diagonal' | 'footer' | 'header'

export const WATERMARK_STYLES = ['diagonal', 'footer', 'header'] as const

export const CROP_MARGINS = {
  narrow: 12,
  medium: 36,
  wide: 72,
} as const

export type CropMarginId = keyof typeof CROP_MARGINS

export const MIN_CROP_REMAINING = 36

export type PageBox = {
  x: number
  y: number
  width: number
  height: number
}

export function cropBoxAfterMargin(box: PageBox, margin: number): PageBox {
  const inset = Math.max(0, margin)
  const width = box.width - inset * 2
  const height = box.height - inset * 2
  if (width < MIN_CROP_REMAINING || height < MIN_CROP_REMAINING) {
    throw new Error('Lề cắt quá lớn so với kích thước trang.')
  }
  return {
    x: box.x + inset,
    y: box.y + inset,
    width,
    height,
  }
}

export async function addWatermark(
  bytes: Uint8Array,
  options: {
    text: string
    indexes?: readonly number[]
    style?: WatermarkStyle
    opacity?: number
  },
): Promise<Uint8Array> {
  const trimmed = options.text.trim()
  if (!trimmed) {
    throw new Error('Nhập nội dung chữ mờ.')
  }
  const doc = await PDFDocument.load(bytes)
  const total = doc.getPageCount()
  if (total < 1) {
    throw new Error('Không có trang để đóng watermark.')
  }
  const requested = options.indexes
  const unique = uniqueSorted(
    requested && requested.length > 0 ? [...requested] : Array.from({ length: total }, (_, index) => index),
    false,
  ).filter((index) => index >= 0 && index < total)
  if (unique.length === 0) {
    throw new Error('Chọn ít nhất một trang để đóng watermark.')
  }
  const style = options.style ?? 'diagonal'
  const opacity = clamp(options.opacity ?? 0.22, 0.08, 0.6)
  const font = await embedOverlayFont(doc)
  for (const index of unique) {
    const page = doc.getPage(index)
    const { width, height } = page.getSize()
    if (style === 'diagonal') {
      const size = Math.max(18, Math.min(width, height) * 0.09)
      const drawn = fitOverlayText(font, trimmed, size)
      page.drawText(drawn.text, {
        x: width / 2 - drawn.width / 2,
        y: height / 2,
        size,
        font,
        color: rgb(0.45, 0.28, 0.18),
        rotate: degrees(-32),
        opacity,
      })
      continue
    }
    const size = 13
    const drawn = fitOverlayText(font, trimmed, size)
    const x = Math.max(8, (width - drawn.width) / 2)
    const y = style === 'header' ? height - size - 14 : 16
    page.drawText(drawn.text, {
      x,
      y,
      size,
      font,
      color: rgb(0.38, 0.24, 0.16),
      opacity: Math.min(0.55, opacity + 0.12),
    })
  }
  return new Uint8Array(await doc.save())
}

export async function cropPages(
  bytes: Uint8Array,
  pageIndexes: number[],
  margin: number,
): Promise<Uint8Array> {
  const inset = Math.trunc(margin)
  if (!Number.isInteger(inset) || inset < 1) {
    throw new Error('Lề cắt phải là số nguyên từ 1.')
  }
  const doc = await PDFDocument.load(bytes)
  const count = doc.getPageCount()
  const unique = uniqueSorted(pageIndexes, false).filter((index) => index >= 0 && index < count)
  if (unique.length === 0) {
    throw new Error('Chọn ít nhất một trang để cắt lề.')
  }
  for (const index of unique) {
    const page = doc.getPage(index)
    const next = cropBoxAfterMargin(page.getCropBox(), inset)
    page.setCropBox(next.x, next.y, next.width, next.height)
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

function fitOverlayText(
  font: { widthOfTextAtSize: (text: string, size: number) => number },
  text: string,
  size: number,
): { text: string; width: number } {
  try {
    return { text, width: font.widthOfTextAtSize(text, size) }
  } catch {
    const safe =
      Array.from(text)
        .filter((char) => {
          const code = char.codePointAt(0) ?? 0
          return code >= 32 && code <= 126
        })
        .join('')
        .trim() || 'WM'
    return { text: safe, width: font.widthOfTextAtSize(safe, size) }
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
