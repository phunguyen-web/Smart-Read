import {
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFHexString,
  PDFName,
  PDFNumber,
  PDFRawStream,
  PDFRef,
  PDFString,
  StandardFonts,
  decodePDFRawStream,
  degrees,
  rgb,
} from 'pdf-lib'
import { PdfPasswordRequiredError, isPdfPasswordError } from './encrypt.ts'

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
  try {
    const doc = await PDFDocument.load(bytes)
    return doc.getPageCount()
  } catch (error) {
    if (isPdfPasswordError(error)) {
      throw new PdfPasswordRequiredError()
    }
    throw error
  }
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

export function identityPageOrder(count: number): number[] {
  return Array.from({ length: Math.max(0, Math.trunc(count) || 0) }, (_, index) => index)
}

/**
 * Collate two halves (fronts then backs from a duplex scan) into
 * front, back, front, back…
 */
export function interleaveHalvesOrder(count: number): number[] {
  if (count < 3) {
    return identityPageOrder(count)
  }
  const mid = Math.ceil(count / 2)
  const order: number[] = []
  for (let index = 0; index < mid; index += 1) {
    order.push(index)
    const back = mid + index
    if (back < count) {
      order.push(back)
    }
  }
  return order
}

/** Odds then evens: [0, 2, 4, …, 1, 3, 5, …]. */
export function deinterleaveOddEvenOrder(count: number): number[] {
  if (count < 3) {
    return identityPageOrder(count)
  }
  const odds: number[] = []
  const evens: number[] = []
  for (let index = 0; index < count; index += 1) {
    if (index % 2 === 0) {
      odds.push(index)
    } else {
      evens.push(index)
    }
  }
  return [...odds, ...evens]
}

/** Map old 0-based indexes onto their positions in `order`. */
export function remapAfterOrder(
  order: readonly number[],
  selected: readonly number[],
): number[] {
  return [
    ...new Set(
      selected
        .map((oldIndex) => order.indexOf(oldIndex))
        .filter((index) => index >= 0),
    ),
  ].sort((a, b) => a - b)
}

export async function interleaveHalves(bytes: Uint8Array): Promise<Uint8Array> {
  const src = await PDFDocument.load(bytes)
  return applyPageOrder(bytes, interleaveHalvesOrder(src.getPageCount()))
}

export async function deinterleaveOddEven(bytes: Uint8Array): Promise<Uint8Array> {
  const src = await PDFDocument.load(bytes)
  return applyPageOrder(bytes, deinterleaveOddEvenOrder(src.getPageCount()))
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

export const A4_WIDTH = 595.28
export const A4_HEIGHT = 841.89
export const A4_PORTRAIT = { width: A4_WIDTH, height: A4_HEIGHT } as const
export const A4_LANDSCAPE = { width: A4_HEIGHT, height: A4_WIDTH } as const
export const LETTER_WIDTH = 612
export const LETTER_HEIGHT = 792
export const LETTER_PORTRAIT = { width: LETTER_WIDTH, height: LETTER_HEIGHT } as const
export const LETTER_LANDSCAPE = { width: LETTER_HEIGHT, height: LETTER_WIDTH } as const
export const A5_WIDTH = 419.53
export const A5_HEIGHT = 595.28
export const A5_PORTRAIT = { width: A5_WIDTH, height: A5_HEIGHT } as const
export const A5_LANDSCAPE = { width: A5_HEIGHT, height: A5_WIDTH } as const
export const PAPER_IDS = ['a4', 'letter', 'a5'] as const
export type PaperId = (typeof PAPER_IDS)[number]
export const PAPER_SIZES: Record<PaperId, { portrait: PageSize; landscape: PageSize }> = {
  a4: { portrait: A4_PORTRAIT, landscape: A4_LANDSCAPE },
  letter: { portrait: LETTER_PORTRAIT, landscape: LETTER_LANDSCAPE },
  a5: { portrait: A5_PORTRAIT, landscape: A5_LANDSCAPE },
}
export const PAPER_LABELS: Record<PaperId, string> = {
  a4: 'A4',
  letter: 'Letter',
  a5: 'A5',
}
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

export type PageSize = {
  width: number
  height: number
}

/** Scale `src` to fit inside `dest`, centered. */
export function fittedPageRect(src: PageSize, dest: PageSize): PageBox {
  const scale = Math.min(
    dest.width / Math.max(src.width, 1),
    dest.height / Math.max(src.height, 1),
  )
  const width = src.width * scale
  const height = src.height * scale
  return {
    x: (dest.width - width) / 2,
    y: (dest.height - height) / 2,
    width,
    height,
  }
}

export function isPaperId(value: string): value is PaperId {
  return (PAPER_IDS as readonly string[]).includes(value)
}

export function paperSizeForPage(size: PageSize, paper: PaperId): PageSize {
  const spec = PAPER_SIZES[paper]
  return size.width > size.height ? spec.landscape : spec.portrait
}

export function a4SizeForPage(size: PageSize): PageSize {
  return paperSizeForPage(size, 'a4')
}

/** Draw selected pages onto a paper size (portrait or landscape to match each page). */
export async function fitPagesToPaper(
  bytes: Uint8Array,
  pageIndexes: number[],
  paper: PaperId,
): Promise<Uint8Array> {
  if (!isPaperId(paper)) {
    throw new Error('Khổ giấy không hỗ trợ.')
  }
  const src = await PDFDocument.load(bytes)
  const count = src.getPageCount()
  const unique = new Set(
    uniqueSorted(pageIndexes, false).filter((index) => index >= 0 && index < count),
  )
  if (unique.size === 0) {
    throw new Error(`Chọn ít nhất một trang để vừa khổ ${PAPER_LABELS[paper]}.`)
  }
  const dst = await PDFDocument.create()
  copyDocumentInfo(src, dst)
  for (let index = 0; index < count; index += 1) {
    if (!unique.has(index)) {
      const [copied] = await dst.copyPages(src, [index])
      dst.addPage(copied)
      continue
    }
    const [embedded] = await dst.embedPages([src.getPage(index)])
    const destSize = paperSizeForPage(
      { width: embedded.width, height: embedded.height },
      paper,
    )
    const page = dst.addPage([destSize.width, destSize.height])
    const box = fittedPageRect(
      { width: embedded.width, height: embedded.height },
      destSize,
    )
    page.drawPage(embedded, {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
    })
  }
  return new Uint8Array(await dst.save())
}

/** Draw selected pages onto A4 (portrait or landscape to match each page). */
export async function fitPagesToA4(
  bytes: Uint8Array,
  pageIndexes: number[],
): Promise<Uint8Array> {
  return fitPagesToPaper(bytes, pageIndexes, 'a4')
}

export type NUpCount = 2 | 4

export function nUpSheetCount(pageCount: number, n: NUpCount): number {
  const total = Math.max(0, Math.trunc(pageCount) || 0)
  return total === 0 ? 0 : Math.ceil(total / n)
}

export function nUpSheetSize(n: NUpCount): PageSize {
  return n === 2 ? A4_LANDSCAPE : A4_PORTRAIT
}

/** Reading-order cells on an n-up sheet. Origin is bottom-left. */
export function nUpCellRects(n: NUpCount, sheet: PageSize): PageBox[] {
  if (n === 2) {
    const half = sheet.width / 2
    return [
      { x: 0, y: 0, width: half, height: sheet.height },
      { x: half, y: 0, width: half, height: sheet.height },
    ]
  }
  const halfW = sheet.width / 2
  const halfH = sheet.height / 2
  return [
    { x: 0, y: halfH, width: halfW, height: halfH },
    { x: halfW, y: halfH, width: halfW, height: halfH },
    { x: 0, y: 0, width: halfW, height: halfH },
    { x: halfW, y: 0, width: halfW, height: halfH },
  ]
}

function copyDocumentInfo(
  src: PDFDocument,
  dst: PDFDocument,
): void {
  const title = src.getTitle()
  const author = src.getAuthor()
  const subject = src.getSubject()
  if (title) {
    dst.setTitle(title)
  }
  if (author) {
    dst.setAuthor(author)
  }
  if (subject) {
    dst.setSubject(subject)
  }
  dst.setProducer('Smart-Read')
  dst.setCreator('Smart-Read')
}

/** Pack selected (or all) pages onto 2-up or 4-up A4 sheets. Replaces the document. */
export async function nUpPages(
  bytes: Uint8Array,
  n: NUpCount,
  pageIndexes?: readonly number[],
): Promise<Uint8Array> {
  const src = await PDFDocument.load(bytes)
  const count = src.getPageCount()
  if (count < 1) {
    throw new Error('Không có trang để gộp.')
  }
  const unique = uniqueSorted(
    pageIndexes == null
      ? Array.from({ length: count }, (_, index) => index)
      : [...pageIndexes],
    false,
  ).filter((index) => index >= 0 && index < count)
  if (unique.length === 0) {
    throw new Error('Chọn ít nhất một trang để gộp.')
  }
  const sheet = nUpSheetSize(n)
  const cells = nUpCellRects(n, sheet)
  const dst = await PDFDocument.create()
  copyDocumentInfo(src, dst)
  for (let start = 0; start < unique.length; start += n) {
    const page = dst.addPage([sheet.width, sheet.height])
    for (let cell = 0; cell < n; cell += 1) {
      const sourceIndex = unique[start + cell]
      if (sourceIndex == null) {
        break
      }
      const [embedded] = await dst.embedPages([src.getPage(sourceIndex)])
      const box = fittedPageRect(
        { width: embedded.width, height: embedded.height },
        cells[cell]!,
      )
      page.drawPage(embedded, {
        x: cells[cell]!.x + box.x,
        y: cells[cell]!.y + box.y,
        width: box.width,
        height: box.height,
      })
    }
  }
  return new Uint8Array(await dst.save())
}

/**
 * Saddle-stitch booklet slots, padded to a multiple of 4.
 * `null` is a blank pad page. For 4 pages: [3, 0, 1, 2].
 */
export function bookletSlotOrder(count: number): (number | null)[] {
  const total = Math.max(0, Math.trunc(count) || 0)
  const padded = Math.ceil(total / 4) * 4
  if (padded === 0) {
    return []
  }
  const order: (number | null)[] = []
  const slot = (index: number): number | null =>
    index >= 0 && index < total ? index : null
  for (let sheet = 0; sheet < padded / 4; sheet += 1) {
    order.push(
      slot(padded - 1 - sheet * 2),
      slot(sheet * 2),
      slot(sheet * 2 + 1),
      slot(padded - 2 - sheet * 2),
    )
  }
  return order
}

export function bookletSheetCount(count: number): number {
  return bookletSlotOrder(count).length / 2
}

export type BookletSheetFace = {
  left: number | null
  right: number | null
}

export type BookletSheet = {
  sheet: number
  front: BookletSheetFace
  back: BookletSheetFace
}

/** 1-based page number, or `trắng` for a booklet pad slot. */
export function bookletSlotLabel(index: number | null): string {
  return index == null ? 'trắng' : String(index + 1)
}

/** Physical sheets (front + back) in saddle-stitch order. Does not mutate the PDF. */
export function bookletPreviewSheets(count: number): BookletSheet[] {
  const slots = bookletSlotOrder(count)
  const sheets: BookletSheet[] = []
  for (let offset = 0; offset < slots.length; offset += 4) {
    sheets.push({
      sheet: sheets.length + 1,
      front: { left: slots[offset] ?? null, right: slots[offset + 1] ?? null },
      back: { left: slots[offset + 2] ?? null, right: slots[offset + 3] ?? null },
    })
  }
  return sheets
}

/** 2-up A4 landscape sheets in saddle-stitch booklet order, with blank pads. */
export async function imposeBooklet(bytes: Uint8Array): Promise<Uint8Array> {
  const src = await PDFDocument.load(bytes)
  const count = src.getPageCount()
  if (count < 1) {
    throw new Error('Không có trang để xếp sách gấp.')
  }
  const slots = bookletSlotOrder(count)
  const sheet = A4_LANDSCAPE
  const cells = nUpCellRects(2, sheet)
  const dst = await PDFDocument.create()
  copyDocumentInfo(src, dst)
  for (let start = 0; start < slots.length; start += 2) {
    const page = dst.addPage([sheet.width, sheet.height])
    for (let cell = 0; cell < 2; cell += 1) {
      const sourceIndex = slots[start + cell]
      if (sourceIndex == null) {
        continue
      }
      const [embedded] = await dst.embedPages([src.getPage(sourceIndex)])
      const box = fittedPageRect(
        { width: embedded.width, height: embedded.height },
        cells[cell]!,
      )
      page.drawPage(embedded, {
        x: cells[cell]!.x + box.x,
        y: cells[cell]!.y + box.y,
        width: box.width,
        height: box.height,
      })
    }
  }
  return new Uint8Array(await dst.save())
}

export type FlipAxis = 'horizontal' | 'vertical'

/** Mirror selected pages horizontally (default) or vertically. */
export async function flipPages(
  bytes: Uint8Array,
  pageIndexes: number[],
  axis: FlipAxis = 'horizontal',
): Promise<Uint8Array> {
  const src = await PDFDocument.load(bytes)
  const count = src.getPageCount()
  const unique = new Set(
    uniqueSorted(pageIndexes, false).filter((index) => index >= 0 && index < count),
  )
  if (unique.size === 0) {
    throw new Error('Chọn ít nhất một trang để lật.')
  }
  const dst = await PDFDocument.create()
  copyDocumentInfo(src, dst)
  for (let index = 0; index < count; index += 1) {
    if (!unique.has(index)) {
      const [copied] = await dst.copyPages(src, [index])
      dst.addPage(copied)
      continue
    }
    const [embedded] = await dst.embedPages([src.getPage(index)])
    const page = dst.addPage([embedded.width, embedded.height])
    if (axis === 'vertical') {
      page.drawPage(embedded, {
        x: 0,
        y: embedded.height,
        xScale: 1,
        yScale: -1,
      })
    } else {
      page.drawPage(embedded, {
        x: embedded.width,
        y: 0,
        xScale: -1,
        yScale: 1,
      })
    }
  }
  return new Uint8Array(await dst.save())
}

export type SplitHalfAxis = 'horizontal' | 'vertical'

/**
 * After each split index becomes two pages, map `selected` onto the new
 * document. Split pages that were selected keep both halves selected.
 */
export function remapAfterSplitHalf(
  count: number,
  selected: readonly number[],
  splitIndexes: readonly number[],
): number[] {
  const split = new Set(
    uniqueSorted([...splitIndexes], false).filter((index) => index >= 0 && index < count),
  )
  const chosen = [
    ...new Set(selected.filter((index) => Number.isInteger(index) && index >= 0 && index < count)),
  ].sort((a, b) => a - b)
  const next: number[] = []
  let offset = 0
  for (let index = 0; index < count; index += 1) {
    if (chosen.includes(index)) {
      next.push(index + offset)
      if (split.has(index)) {
        next.push(index + offset + 1)
      }
    }
    if (split.has(index)) {
      offset += 1
    }
  }
  return next
}

/** Cut selected pages into two: top then bottom, or left then right. */
export async function splitPagesInHalf(
  bytes: Uint8Array,
  pageIndexes: number[],
  axis: SplitHalfAxis,
): Promise<Uint8Array> {
  const src = await PDFDocument.load(bytes)
  const count = src.getPageCount()
  const unique = uniqueSorted(pageIndexes, false).filter((index) => index >= 0 && index < count)
  if (unique.length === 0) {
    throw new Error('Chọn ít nhất một trang để cắt đôi.')
  }
  for (const index of unique) {
    const { width, height } = src.getPage(index).getSize()
    const half = axis === 'horizontal' ? height / 2 : width / 2
    if (half < MIN_CROP_REMAINING) {
      throw new Error('Trang quá nhỏ để cắt đôi.')
    }
  }
  const dst = await PDFDocument.create()
  copyDocumentInfo(src, dst)
  const selected = new Set(unique)
  for (let index = 0; index < count; index += 1) {
    if (!selected.has(index)) {
      const [copied] = await dst.copyPages(src, [index])
      dst.addPage(copied)
      continue
    }
    const [embedded] = await dst.embedPages([src.getPage(index)])
    if (axis === 'horizontal') {
      const half = embedded.height / 2
      const top = dst.addPage([embedded.width, half])
      top.drawPage(embedded, {
        x: 0,
        y: -half,
        width: embedded.width,
        height: embedded.height,
      })
      const bottom = dst.addPage([embedded.width, half])
      bottom.drawPage(embedded, {
        x: 0,
        y: 0,
        width: embedded.width,
        height: embedded.height,
      })
      continue
    }
    const half = embedded.width / 2
    const left = dst.addPage([half, embedded.height])
    left.drawPage(embedded, {
      x: 0,
      y: 0,
      width: embedded.width,
      height: embedded.height,
    })
    const right = dst.addPage([half, embedded.height])
    right.drawPage(embedded, {
      x: -half,
      y: 0,
      width: embedded.width,
      height: embedded.height,
    })
  }
  return new Uint8Array(await dst.save())
}

export type PageOrientation = 'portrait' | 'landscape'

export function displayedPageSize(page: {
  getSize(): { width: number; height: number }
  getRotation(): { angle: number }
}): PageSize {
  const { width, height } = page.getSize()
  const angle = ((Math.trunc(page.getRotation().angle) % 360) + 360) % 360
  if (angle === 90 || angle === 270) {
    return { width: height, height: width }
  }
  return { width, height }
}

export function pageOrientation(size: PageSize): PageOrientation {
  return size.width > size.height ? 'landscape' : 'portrait'
}

export function needsOrientation(size: PageSize, target: PageOrientation): boolean {
  if (size.width === size.height) {
    return false
  }
  return pageOrientation(size) !== target
}

/** Rotate selected pages 90° so they become portrait or landscape. Square pages stay put. */
export async function orientPages(
  bytes: Uint8Array,
  pageIndexes: number[],
  orientation: PageOrientation,
): Promise<Uint8Array> {
  const src = await PDFDocument.load(bytes)
  const count = src.getPageCount()
  const unique = uniqueSorted(pageIndexes, false).filter((index) => index >= 0 && index < count)
  if (unique.length === 0) {
    throw new Error('Chọn ít nhất một trang để xoay khổ.')
  }
  const targets = unique.filter((index) =>
    needsOrientation(displayedPageSize(src.getPage(index)), orientation),
  )
  if (targets.length === 0) {
    return bytes
  }
  return rotatePagesBy(bytes, targets, 90)
}

export const SCALE_PERCENTS = [50, 75, 125, 150] as const
export type ScalePercent = (typeof SCALE_PERCENTS)[number]
export const MIN_SCALE_PERCENT = 25
export const MAX_SCALE_PERCENT = 400

export function scaleFactor(percent: number): number {
  if (!Number.isFinite(percent)) {
    throw new Error('Tỷ lệ phải là số.')
  }
  const value = Math.round(percent)
  if (value < MIN_SCALE_PERCENT || value > MAX_SCALE_PERCENT) {
    throw new Error(`Tỷ lệ phải từ ${MIN_SCALE_PERCENT}% đến ${MAX_SCALE_PERCENT}%.`)
  }
  return value / 100
}

/** Grow or shrink selected pages by a percent of their current size. */
export async function scalePages(
  bytes: Uint8Array,
  pageIndexes: number[],
  percent: number,
): Promise<Uint8Array> {
  const factor = scaleFactor(percent)
  const src = await PDFDocument.load(bytes)
  const count = src.getPageCount()
  const unique = new Set(
    uniqueSorted(pageIndexes, false).filter((index) => index >= 0 && index < count),
  )
  if (unique.size === 0) {
    throw new Error('Chọn ít nhất một trang để đổi tỷ lệ.')
  }
  if (factor === 1) {
    return bytes
  }
  for (const index of unique) {
    const { width, height } = src.getPage(index).getSize()
    if (width * factor < MIN_CROP_REMAINING || height * factor < MIN_CROP_REMAINING) {
      throw new Error('Trang quá nhỏ để thu nhỏ thêm.')
    }
  }
  const dst = await PDFDocument.create()
  copyDocumentInfo(src, dst)
  for (let index = 0; index < count; index += 1) {
    if (!unique.has(index)) {
      const [copied] = await dst.copyPages(src, [index])
      dst.addPage(copied)
      continue
    }
    const [embedded] = await dst.embedPages([src.getPage(index)])
    const width = embedded.width * factor
    const height = embedded.height * factor
    const page = dst.addPage([width, height])
    page.drawPage(embedded, { x: 0, y: 0, width, height })
  }
  return new Uint8Array(await dst.save())
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
export const PAD_MARGINS = CROP_MARGINS
export type PadMarginId = CropMarginId
export const MAX_PADDED_SIDE = 1440

export type PageBox = {
  x: number
  y: number
  width: number
  height: number
}

export function paddedPageSize(size: PageSize, margin: number): PageSize {
  const inset = Math.max(0, Math.trunc(margin))
  if (!Number.isInteger(inset) || inset < 1) {
    throw new Error('Lề thêm phải là số nguyên từ 1.')
  }
  const width = size.width + inset * 2
  const height = size.height + inset * 2
  if (width > MAX_PADDED_SIDE || height > MAX_PADDED_SIDE) {
    throw new Error('Trang quá lớn để thêm lề.')
  }
  return { width, height }
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

/** Stamp a header and/or footer on selected pages (distinct from watermark). */
export async function addHeaderFooter(
  bytes: Uint8Array,
  options: {
    header?: string
    footer?: string
    indexes?: readonly number[]
  },
): Promise<Uint8Array> {
  const header = (options.header ?? '').trim()
  const footer = (options.footer ?? '').trim()
  if (!header && !footer) {
    throw new Error('Nhập chữ đầu trang hoặc cuối trang.')
  }
  const doc = await PDFDocument.load(bytes)
  const total = doc.getPageCount()
  if (total < 1) {
    throw new Error('Không có trang để đóng đầu/cuối trang.')
  }
  const requested = options.indexes
  const unique = uniqueSorted(
    requested && requested.length > 0 ? [...requested] : Array.from({ length: total }, (_, index) => index),
    false,
  ).filter((index) => index >= 0 && index < total)
  if (unique.length === 0) {
    throw new Error('Chọn ít nhất một trang để đóng đầu/cuối trang.')
  }
  const font = await embedOverlayFont(doc)
  const size = 13
  for (const index of unique) {
    const page = doc.getPage(index)
    const { width, height } = page.getSize()
    if (header) {
      const drawn = fitOverlayText(font, header, size)
      page.drawText(drawn.text, {
        x: Math.max(8, (width - drawn.width) / 2),
        y: height - size - 14,
        size,
        font,
        color: rgb(0.28, 0.18, 0.12),
      })
    }
    if (footer) {
      const drawn = fitOverlayText(font, footer, size)
      page.drawText(drawn.text, {
        x: Math.max(8, (width - drawn.width) / 2),
        y: 16,
        size,
        font,
        color: rgb(0.28, 0.18, 0.12),
      })
    }
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

/** Embed selected pages onto a larger white sheet, adding equal margins. */
export async function padPages(
  bytes: Uint8Array,
  pageIndexes: number[],
  margin: number,
): Promise<Uint8Array> {
  const inset = Math.trunc(margin)
  if (!Number.isInteger(inset) || inset < 1) {
    throw new Error('Lề thêm phải là số nguyên từ 1.')
  }
  const src = await PDFDocument.load(bytes)
  const count = src.getPageCount()
  const unique = new Set(
    uniqueSorted(pageIndexes, false).filter((index) => index >= 0 && index < count),
  )
  if (unique.size === 0) {
    throw new Error('Chọn ít nhất một trang để thêm lề.')
  }
  for (const index of unique) {
    paddedPageSize(src.getPage(index).getSize(), inset)
  }
  const dst = await PDFDocument.create()
  copyDocumentInfo(src, dst)
  for (let index = 0; index < count; index += 1) {
    if (!unique.has(index)) {
      const [copied] = await dst.copyPages(src, [index])
      dst.addPage(copied)
      continue
    }
    const [embedded] = await dst.embedPages([src.getPage(index)])
    const dest = paddedPageSize({ width: embedded.width, height: embedded.height }, inset)
    const page = dst.addPage([dest.width, dest.height])
    page.drawPage(embedded, {
      x: inset,
      y: inset,
      width: embedded.width,
      height: embedded.height,
    })
  }
  return new Uint8Array(await dst.save())
}

/** Bounding box that covers every page size, used to unify mixed sheets. */
export function unifiedPageSize(sizes: readonly PageSize[]): PageSize {
  if (sizes.length < 1) {
    throw new Error('Chọn ít nhất hai trang để đồng khổ.')
  }
  let width = 0
  let height = 0
  for (const size of sizes) {
    width = Math.max(width, size.width)
    height = Math.max(height, size.height)
  }
  if (width < 1 || height < 1) {
    throw new Error('Chọn ít nhất hai trang để đồng khổ.')
  }
  if (width > MAX_PADDED_SIDE || height > MAX_PADDED_SIDE) {
    throw new Error('Trang quá lớn để đồng khổ.')
  }
  return { width, height }
}

export function pageSizeEquals(a: PageSize, b: PageSize): boolean {
  return a.width === b.width && a.height === b.height
}

/** Embed selected pages onto one shared size (max width and height), centered. */
export async function unifyPageSizes(
  bytes: Uint8Array,
  pageIndexes: number[],
): Promise<Uint8Array> {
  const src = await PDFDocument.load(bytes)
  const count = src.getPageCount()
  const unique = uniqueSorted(pageIndexes, false).filter((index) => index >= 0 && index < count)
  if (unique.length < 2) {
    throw new Error('Chọn ít nhất hai trang để đồng khổ.')
  }
  const sizes = unique.map((index) => src.getPage(index).getSize())
  const target = unifiedPageSize(sizes)
  if (sizes.every((size) => pageSizeEquals(size, target))) {
    return bytes
  }
  const selected = new Set(unique)
  const dst = await PDFDocument.create()
  copyDocumentInfo(src, dst)
  for (let index = 0; index < count; index += 1) {
    if (!selected.has(index)) {
      const [copied] = await dst.copyPages(src, [index])
      dst.addPage(copied)
      continue
    }
    const current = src.getPage(index).getSize()
    if (pageSizeEquals(current, target)) {
      const [copied] = await dst.copyPages(src, [index])
      dst.addPage(copied)
      continue
    }
    const [embedded] = await dst.embedPages([src.getPage(index)])
    const page = dst.addPage([target.width, target.height])
    page.drawPage(embedded, {
      x: (target.width - embedded.width) / 2,
      y: (target.height - embedded.height) / 2,
      width: embedded.width,
      height: embedded.height,
    })
  }
  return new Uint8Array(await dst.save())
}

export const BORDER_INSETS = CROP_MARGINS
export type BorderInsetId = CropMarginId

/** Inset rectangle used to stroke a page frame. */
export function borderBoxForPage(size: PageSize, inset: number): PageBox {
  return cropBoxAfterMargin({ x: 0, y: 0, width: size.width, height: size.height }, inset)
}

export function borderStrokeWidth(inset: number): number {
  const margin = Math.trunc(inset)
  if (!Number.isInteger(margin) || margin < 1) {
    throw new Error('Lề khung phải là số nguyên từ 1.')
  }
  return Math.max(0.75, Math.min(2.4, margin / 18))
}

/** Stroke a rectangle inset from each edge of the selected pages. */
export async function addPageBorder(
  bytes: Uint8Array,
  pageIndexes: number[],
  inset: number,
): Promise<Uint8Array> {
  const margin = Math.trunc(inset)
  if (!Number.isInteger(margin) || margin < 1) {
    throw new Error('Lề khung phải là số nguyên từ 1.')
  }
  const doc = await PDFDocument.load(bytes)
  const count = doc.getPageCount()
  const unique = uniqueSorted(pageIndexes, false).filter((index) => index >= 0 && index < count)
  if (unique.length === 0) {
    throw new Error('Chọn ít nhất một trang để đóng khung.')
  }
  const stroke = borderStrokeWidth(margin)
  for (const index of unique) {
    const page = doc.getPage(index)
    const box = borderBoxForPage(page.getSize(), margin)
    page.drawRectangle({
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      borderWidth: stroke,
      borderColor: rgb(0.16, 0.12, 0.1),
    })
  }
  return new Uint8Array(await doc.save())
}

/** Insert an A4 title page at the start of the document. */
export async function addCoverPage(
  bytes: Uint8Array,
  options: { title: string; subtitle?: string },
): Promise<Uint8Array> {
  const title = options.title.trim()
  if (!title) {
    throw new Error('Nhập tiêu đề trang bìa.')
  }
  const subtitle = (options.subtitle ?? '').trim()
  const src = await PDFDocument.load(bytes)
  if (src.getPageCount() < 1) {
    throw new Error('Không có trang để thêm bìa.')
  }
  const dst = await PDFDocument.create()
  copyDocumentInfo(src, dst)
  const font = await embedOverlayFont(dst)
  const page = dst.addPage([A4_WIDTH, A4_HEIGHT])
  const titleSize = 28
  const drawn = fitOverlayText(font, title, titleSize)
  page.drawText(drawn.text, {
    x: Math.max(48, (A4_WIDTH - drawn.width) / 2),
    y: A4_HEIGHT * 0.62,
    size: titleSize,
    font,
    color: rgb(0.16, 0.12, 0.1),
  })
  if (subtitle) {
    const sub = fitOverlayText(font, subtitle, 14)
    page.drawText(sub.text, {
      x: Math.max(48, (A4_WIDTH - sub.width) / 2),
      y: A4_HEIGHT * 0.62 - 42,
      size: 14,
      font,
      color: rgb(0.32, 0.24, 0.2),
    })
  }
  const copied = await dst.copyPages(src, src.getPageIndices())
  for (const copiedPage of copied) {
    dst.addPage(copiedPage)
  }
  return new Uint8Array(await dst.save())
}

export const TINT_IDS = ['cream', 'sepia', 'night'] as const
export type TintId = (typeof TINT_IDS)[number]
export const TINT_LABELS: Record<TintId, string> = {
  cream: 'Kem',
  sepia: 'Nâu',
  night: 'Đêm',
}
export const TINTS: Record<TintId, { r: number; g: number; b: number; opacity: number }> = {
  cream: { r: 0.96, g: 0.9, b: 0.72, opacity: 0.28 },
  sepia: { r: 0.72, g: 0.5, b: 0.22, opacity: 0.22 },
  night: { r: 0.08, g: 0.12, b: 0.22, opacity: 0.38 },
}

export function isTintId(value: string): value is TintId {
  return (TINT_IDS as readonly string[]).includes(value)
}

export function tintFill(id: TintId): { r: number; g: number; b: number; opacity: number } {
  if (!isTintId(id)) {
    throw new Error('Màu đọc không hỗ trợ.')
  }
  return TINTS[id]
}

/** Overlay a reading tint on selected pages. Empty `indexes` is refused. */
export async function tintPages(
  bytes: Uint8Array,
  pageIndexes: number[],
  tint: TintId,
): Promise<Uint8Array> {
  const fill = tintFill(tint)
  const doc = await PDFDocument.load(bytes)
  const count = doc.getPageCount()
  const unique = uniqueSorted(pageIndexes, false).filter((index) => index >= 0 && index < count)
  if (unique.length === 0) {
    throw new Error('Chọn ít nhất một trang để phủ màu đọc.')
  }
  for (const index of unique) {
    const page = doc.getPage(index)
    const { width, height } = page.getSize()
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(fill.r, fill.g, fill.b),
      opacity: fill.opacity,
    })
  }
  return new Uint8Array(await doc.save())
}

export const PAGE_BG_IDS = ['cream', 'yellow', 'blue', 'gray'] as const
export type PageBgId = (typeof PAGE_BG_IDS)[number]
export const PAGE_BG_LABELS: Record<PageBgId, string> = {
  cream: 'Kem',
  yellow: 'Vàng',
  blue: 'Xanh',
  gray: 'Xám',
}
export const PAGE_BACKGROUNDS: Record<PageBgId, { r: number; g: number; b: number }> = {
  cream: { r: 0.98, g: 0.94, b: 0.82 },
  yellow: { r: 1, g: 0.97, b: 0.72 },
  blue: { r: 0.86, g: 0.92, b: 0.98 },
  gray: { r: 0.9, g: 0.9, b: 0.9 },
}

export function isPageBgId(value: string): value is PageBgId {
  return (PAGE_BG_IDS as readonly string[]).includes(value)
}

export function pageBackgroundFill(id: PageBgId): { r: number; g: number; b: number } {
  if (!isPageBgId(id)) {
    throw new Error('Màu nền không hỗ trợ.')
  }
  return PAGE_BACKGROUNDS[id]
}

/** Embed selected pages onto a same-size colored sheet. Distinct from reading tint. */
export async function colorPageBackgrounds(
  bytes: Uint8Array,
  pageIndexes: number[],
  color: PageBgId,
): Promise<Uint8Array> {
  const fill = pageBackgroundFill(color)
  const src = await PDFDocument.load(bytes)
  const count = src.getPageCount()
  const unique = new Set(
    uniqueSorted(pageIndexes, false).filter((index) => index >= 0 && index < count),
  )
  if (unique.size === 0) {
    throw new Error('Chọn ít nhất một trang để phủ nền.')
  }
  const dst = await PDFDocument.create()
  copyDocumentInfo(src, dst)
  for (let index = 0; index < count; index += 1) {
    if (!unique.has(index)) {
      const [copied] = await dst.copyPages(src, [index])
      dst.addPage(copied)
      continue
    }
    const [embedded] = await dst.embedPages([src.getPage(index)])
    const page = dst.addPage([embedded.width, embedded.height])
    page.drawRectangle({
      x: 0,
      y: 0,
      width: embedded.width,
      height: embedded.height,
      color: rgb(fill.r, fill.g, fill.b),
    })
    page.drawPage(embedded, {
      x: 0,
      y: 0,
      width: embedded.width,
      height: embedded.height,
    })
  }
  return new Uint8Array(await dst.save())
}

export const AUTO_CROP_PADDING = 8
export const AUTO_CROP_THRESHOLD = 248

export type PixelBounds = {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export type PageRaster = {
  index: number
  data: Uint8Array | Uint8ClampedArray
  width: number
  height: number
}

export function pageBoxEquals(a: PageBox, b: PageBox, epsilon = 0.5): boolean {
  return (
    Math.abs(a.x - b.x) <= epsilon &&
    Math.abs(a.y - b.y) <= epsilon &&
    Math.abs(a.width - b.width) <= epsilon &&
    Math.abs(a.height - b.height) <= epsilon
  )
}

/** Map a top-left pixel box onto a PDF crop box (origin bottom-left). */
export function cropBoxFromContentBounds(
  pageSize: PageSize,
  pixelSize: PageSize,
  bounds: PixelBounds,
  padding = AUTO_CROP_PADDING,
): PageBox {
  const px = Math.max(1, pixelSize.width)
  const py = Math.max(1, pixelSize.height)
  const scaleX = pageSize.width / px
  const scaleY = pageSize.height / py
  const inset = Number.isFinite(padding) ? Math.max(0, padding) : AUTO_CROP_PADDING
  const x = bounds.minX * scaleX - inset
  const y = pageSize.height - (bounds.maxY + 1) * scaleY - inset
  const width = (bounds.maxX - bounds.minX + 1) * scaleX + inset * 2
  const height = (bounds.maxY - bounds.minY + 1) * scaleY + inset * 2
  const box: PageBox = {
    x: Math.max(0, x),
    y: Math.max(0, y),
    width: Math.min(pageSize.width, width),
    height: Math.min(pageSize.height, height),
  }
  if (box.x + box.width > pageSize.width) {
    box.width = pageSize.width - box.x
  }
  if (box.y + box.height > pageSize.height) {
    box.height = pageSize.height - box.y
  }
  if (box.width < MIN_CROP_REMAINING || box.height < MIN_CROP_REMAINING) {
    throw new Error('Nội dung quá nhỏ để cắt lề trắng.')
  }
  return box
}

export async function applyContentCrops(
  bytes: Uint8Array,
  crops: readonly { index: number; box: PageBox }[],
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes)
  const count = doc.getPageCount()
  let changed = false
  for (const crop of crops) {
    if (!Number.isInteger(crop.index) || crop.index < 0 || crop.index >= count) {
      continue
    }
    const page = doc.getPage(crop.index)
    const current = page.getCropBox()
    const next: PageBox = {
      x: current.x + crop.box.x,
      y: current.y + crop.box.y,
      width: crop.box.width,
      height: crop.box.height,
    }
    if (pageBoxEquals(current, next)) {
      continue
    }
    if (next.width < MIN_CROP_REMAINING || next.height < MIN_CROP_REMAINING) {
      throw new Error('Nội dung quá nhỏ để cắt lề trắng.')
    }
    page.setCropBox(next.x, next.y, next.width, next.height)
    changed = true
  }
  if (!changed) {
    return bytes
  }
  return new Uint8Array(await doc.save())
}

/** Crop selected pages to ink bounds from rasters. Empty `indexes` is refused. */
export async function autoCropPages(
  bytes: Uint8Array,
  pageIndexes: number[],
  rasters: readonly PageRaster[],
  detectBounds: (
    data: Uint8Array | Uint8ClampedArray,
    width: number,
    height: number,
    threshold?: number,
  ) => PixelBounds | null,
): Promise<Uint8Array> {
  const src = await PDFDocument.load(bytes)
  const count = src.getPageCount()
  const unique = uniqueSorted(pageIndexes, false).filter((index) => index >= 0 && index < count)
  if (unique.length === 0) {
    throw new Error('Chọn ít nhất một trang để cắt lề trắng.')
  }
  const byIndex = new Map(rasters.map((raster) => [raster.index, raster]))
  const crops: { index: number; box: PageBox }[] = []
  for (const index of unique) {
    const raster = byIndex.get(index)
    if (!raster) {
      continue
    }
    const bounds = detectBounds(raster.data, raster.width, raster.height, AUTO_CROP_THRESHOLD)
    if (!bounds) {
      continue
    }
    const page = src.getPage(index)
    const size = page.getSize()
    crops.push({
      index,
      box: cropBoxFromContentBounds(size, { width: raster.width, height: raster.height }, bounds),
    })
  }
  if (crops.length === 0) {
    throw new Error('Không tìm thấy nội dung để cắt lề trắng.')
  }
  return applyContentCrops(bytes, crops)
}

export const MAX_METADATA_LENGTH = 200
export const IMAGE_PAGE_MAX_EDGE = 792

export type PdfMetadata = {
  title: string
  author: string
  subject: string
}

export type ImagePage = {
  bytes: Uint8Array
  kind: 'png' | 'jpg'
}

export function trimMetadataField(value: string | undefined | null): string {
  return (value ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_METADATA_LENGTH)
}

export async function readMetadata(bytes: Uint8Array): Promise<PdfMetadata> {
  const doc = await PDFDocument.load(bytes)
  return {
    title: trimMetadataField(doc.getTitle()),
    author: trimMetadataField(doc.getAuthor()),
    subject: trimMetadataField(doc.getSubject()),
  }
}

export async function setMetadata(
  bytes: Uint8Array,
  meta: Partial<PdfMetadata>,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes)
  if (meta.title !== undefined) {
    doc.setTitle(trimMetadataField(meta.title))
  }
  if (meta.author !== undefined) {
    doc.setAuthor(trimMetadataField(meta.author))
  }
  if (meta.subject !== undefined) {
    doc.setSubject(trimMetadataField(meta.subject))
  }
  doc.setProducer('Smart-Read')
  doc.setCreator('Smart-Read')
  doc.setModificationDate(new Date())
  return new Uint8Array(await doc.save())
}

export function imagePageSize(
  width: number,
  height: number,
  maxEdge = IMAGE_PAGE_MAX_EDGE,
): { width: number; height: number } {
  const safeWidth = Math.max(1, width)
  const safeHeight = Math.max(1, height)
  const scale = Math.min(1, maxEdge / Math.max(safeWidth, safeHeight))
  return { width: safeWidth * scale, height: safeHeight * scale }
}

async function embedImageOnNewPage(
  doc: PDFDocument,
  image: ImagePage,
  insertAt?: number,
): Promise<void> {
  const embedded =
    image.kind === 'png' ? await doc.embedPng(image.bytes) : await doc.embedJpg(image.bytes)
  const size = imagePageSize(embedded.width, embedded.height)
  const page =
    insertAt == null ? doc.addPage([size.width, size.height]) : doc.insertPage(insertAt, [size.width, size.height])
  page.drawImage(embedded, { x: 0, y: 0, width: size.width, height: size.height })
}

export async function imagesToPdf(images: readonly ImagePage[]): Promise<Uint8Array> {
  if (images.length === 0) {
    throw new Error('Chọn ít nhất một ảnh PNG hoặc JPEG.')
  }
  const doc = await PDFDocument.create()
  for (const image of images) {
    await embedImageOnNewPage(doc, image)
  }
  return new Uint8Array(await doc.save())
}

export async function insertImages(
  bytes: Uint8Array,
  images: readonly ImagePage[],
  insertAt: number,
): Promise<Uint8Array> {
  if (images.length === 0) {
    throw new Error('Chọn ít nhất một ảnh PNG hoặc JPEG.')
  }
  const doc = await PDFDocument.load(bytes)
  const count = doc.getPageCount()
  const at = Math.max(0, Math.min(count, Math.trunc(insertAt)))
  for (let index = 0; index < images.length; index += 1) {
    await embedImageOnNewPage(doc, images[index]!, at + index)
  }
  return new Uint8Array(await doc.save())
}

export async function replacePagesWithPngs(
  bytes: Uint8Array,
  replacements: readonly { index: number; png: Uint8Array }[],
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes)
  const count = doc.getPageCount()
  const unique = new Map<number, Uint8Array>()
  for (const item of replacements) {
    if (!Number.isInteger(item.index) || item.index < 0 || item.index >= count) {
      continue
    }
    unique.set(item.index, item.png)
  }
  if (unique.size === 0) {
    throw new Error('Chọn ít nhất một trang để thay bằng ảnh.')
  }
  for (const [index, png] of unique) {
    const page = doc.getPage(index)
    const { width, height } = page.getSize()
    const image = await doc.embedPng(png)
    page.drawImage(image, { x: 0, y: 0, width, height })
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

export const MAX_OUTLINE_TITLE = 120

export type OutlineBookmark = {
  title: string
  pageIndex: number
  /** 0 is a top-level item; 1+ nests under the previous shallower item. */
  depth: number
  /** Folders only. `false` writes a negative `/Count` so viewers collapse children. */
  open?: boolean
  /**
   * Folders written without `/Dest`. `pageIndex` is the first child's page so the
   * editor can still jump; viewers do not treat the folder as a page target.
   */
  destless?: true
}

/** Deepest outline item the editor will write (root 0, nested folder 1, its pages 2). */
export const MAX_OUTLINE_DEPTH = 2

export function assertOutlineTitle(text: string): string {
  const label = text.normalize('NFC').replace(/\s+/g, ' ').trim()
  if (!label) {
    throw new Error('Nhập tên mục lục.')
  }
  if (label.length > MAX_OUTLINE_TITLE) {
    throw new Error('Tên mục lục quá dài.')
  }
  return label
}

function decodeOutlineTitle(value: unknown): string {
  if (value instanceof PDFHexString || value instanceof PDFString) {
    return value.decodeText().trim()
  }
  return ''
}

function cloneOutlineItem(
  item: OutlineBookmark,
  patch: {
    title?: string
    pageIndex?: number
    depth?: number
    open?: boolean
    destless?: boolean
  } = {},
): OutlineBookmark {
  const next: OutlineBookmark = {
    title: patch.title ?? item.title,
    pageIndex: patch.pageIndex ?? item.pageIndex,
    depth: patch.depth ?? item.depth,
  }
  const destless = patch.destless ?? item.destless
  if (destless) {
    next.destless = true
  }
  const open = Object.prototype.hasOwnProperty.call(patch, 'open') ? patch.open : item.open
  if (open === false) {
    next.open = false
  }
  return next
}

function samePdfRef(left: PDFRef, right: PDFRef): boolean {
  return left.objectNumber === right.objectNumber && left.generationNumber === right.generationNumber
}

function pageIndexForDest(pages: { ref: PDFRef }[], dest: unknown): number {
  if (!(dest instanceof PDFArray) || dest.size() === 0) {
    return -1
  }
  const first = dest.get(0)
  if (!(first instanceof PDFRef)) {
    return -1
  }
  return pages.findIndex((page) => samePdfRef(page.ref, first))
}

function normalizeOutlineDepths(items: readonly OutlineBookmark[]): number[] {
  const depths: number[] = []
  for (let index = 0; index < items.length; index += 1) {
    const raw = Math.trunc(items[index]!.depth)
    const requested = Number.isInteger(raw) && raw > 0 ? raw : 0
    const maxDepth = index === 0 ? 0 : depths[index - 1]! + 1
    depths.push(Math.min(requested, maxDepth))
  }
  return depths
}

function outlineParentIndex(depths: readonly number[], index: number): number | null {
  const depth = depths[index] ?? 0
  if (depth <= 0) {
    return null
  }
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    if ((depths[cursor] ?? 0) < depth) {
      return cursor
    }
  }
  return null
}

function itemIsOutlineFolder(depths: readonly number[], index: number): boolean {
  return index + 1 < depths.length && (depths[index + 1] ?? 0) > (depths[index] ?? 0)
}

function lastOutlineDescendantIndex(depths: readonly number[], parentIndex: number): number {
  const parentDepth = depths[parentIndex] ?? 0
  let last = parentIndex
  for (let index = parentIndex + 1; index < depths.length; index += 1) {
    if ((depths[index] ?? 0) <= parentDepth) {
      break
    }
    last = index
  }
  return last
}

/** True when the item at `index` has children (deeper following items). */
export function outlineItemIsFolder(items: readonly OutlineBookmark[], index: number): boolean {
  return itemIsOutlineFolder(normalizeOutlineDepths(items), index)
}

/** Outline rows a viewer would show: children of a closed folder are omitted. */
export function visibleOutlineItems(
  items: readonly OutlineBookmark[],
): { item: OutlineBookmark; index: number }[] {
  const depths = normalizeOutlineDepths(items)
  const out: { item: OutlineBookmark; index: number }[] = []
  let skipDeeperThan = Number.POSITIVE_INFINITY
  for (let index = 0; index < items.length; index += 1) {
    const depth = depths[index] ?? 0
    if (depth > skipDeeperThan) {
      continue
    }
    skipDeeperThan = Number.POSITIVE_INFINITY
    out.push({ item: items[index]!, index })
    if (itemIsOutlineFolder(depths, index) && items[index]!.open === false) {
      skipDeeperThan = depth
    }
  }
  return out
}

function walkOutline(
  doc: PDFDocument,
  pages: { ref: PDFRef }[],
  startRef: unknown,
  depth: number,
  items: OutlineBookmark[],
  seen: Set<number>,
): void {
  let currentRef = startRef
  let guard = 0
  while (currentRef instanceof PDFRef && guard < 400) {
    guard += 1
    if (seen.has(currentRef.objectNumber)) {
      break
    }
    seen.add(currentRef.objectNumber)
    const current = doc.context.lookup(currentRef, PDFDict)
    const title = decodeOutlineTitle(current.lookupMaybe(PDFName.of('Title'), PDFString, PDFHexString))
    const dest = current.lookupMaybe(PDFName.of('Dest'), PDFArray)
    const pageIndex = pageIndexForDest(pages, dest)
    const count = current.lookupMaybe(PDFName.of('Count'), PDFNumber)
    const closed = count instanceof PDFNumber && count.asNumber() < 0
    const first = current.get(PDFName.of('First'))
    const hasKids = first instanceof PDFRef
    const hasDest = pageIndex >= 0
    if (title && (hasDest || hasKids)) {
      const item: OutlineBookmark = {
        title,
        pageIndex: hasDest ? pageIndex : 0,
        depth,
      }
      if (!hasDest) {
        item.destless = true
      }
      if (closed) {
        item.open = false
      }
      items.push(item)
      const selfIndex = items.length - 1
      if (hasKids) {
        walkOutline(doc, pages, first, depth + 1, items, seen)
      }
      if (!hasDest) {
        const child = items[selfIndex + 1]
        if (child && child.depth > depth) {
          items[selfIndex]!.pageIndex = child.pageIndex
        }
      }
    } else if (hasKids) {
      walkOutline(doc, pages, first, depth + 1, items, seen)
    }
    currentRef = current.get(PDFName.of('Next'))
  }
}

function readOutlineChain(doc: PDFDocument): OutlineBookmark[] {
  const outlines = doc.catalog.lookupMaybe(PDFName.of('Outlines'), PDFDict)
  if (!outlines) {
    return []
  }
  const items: OutlineBookmark[] = []
  walkOutline(doc, doc.getPages(), outlines.get(PDFName.of('First')), 0, items, new Set())
  return items
}

async function writeOutlineBookmarks(
  bytes: Uint8Array,
  items: readonly OutlineBookmark[],
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes)
  const pages = doc.getPages()
  const count = pages.length
  const valid = items.filter(
    (item) =>
      item.title.trim().length > 0 &&
      Number.isInteger(item.pageIndex) &&
      item.pageIndex >= 0 &&
      item.pageIndex < count,
  )
  if (valid.length === 0) {
    throw new Error('Chọn ít nhất một trang để đánh dấu.')
  }
  const depths = normalizeOutlineDepths(valid)
  const context = doc.context
  const rootRef = context.nextRef()
  const itemRefs = valid.map(() => context.nextRef())
  const childrenOf: number[][] = valid.map(() => [])
  const roots: number[] = []
  for (let index = 0; index < valid.length; index += 1) {
    const parent = outlineParentIndex(depths, index)
    if (parent == null) {
      roots.push(index)
    } else {
      childrenOf[parent]!.push(index)
    }
  }

  function descendantCount(index: number): number {
    return childrenOf[index]!.reduce((sum, child) => sum + 1 + descendantCount(child), 0)
  }

  function visibleDescendantCount(index: number): number {
    return childrenOf[index]!.reduce((sum, child) => {
      const nested = valid[child]!.open === false ? 0 : visibleDescendantCount(child)
      return sum + 1 + nested
    }, 0)
  }

  for (let index = 0; index < valid.length; index += 1) {
    const item = valid[index]!
    const page = pages[item.pageIndex]!
    const parent = outlineParentIndex(depths, index)
    const siblings = parent == null ? roots : childrenOf[parent]!
    const siblingAt = siblings.indexOf(index)
    const kids = childrenOf[index]!
    const fields: {
      Title: PDFHexString
      Parent: PDFRef
      Dest?: [PDFRef, ReturnType<typeof PDFName.of>, null, null, null]
    } = {
      Title: PDFHexString.fromText(item.title),
      Parent: parent == null ? rootRef : itemRefs[parent]!,
    }
    if (kids.length === 0) {
      fields.Dest = [page.ref, PDFName.of('XYZ'), null, null, null]
    }
    const outlineItem = context.obj(fields)
    if (siblingAt > 0) {
      outlineItem.set(PDFName.of('Prev'), itemRefs[siblings[siblingAt - 1]!]!)
    }
    if (siblingAt >= 0 && siblingAt < siblings.length - 1) {
      outlineItem.set(PDFName.of('Next'), itemRefs[siblings[siblingAt + 1]!]!)
    }
    if (kids.length > 0) {
      outlineItem.set(PDFName.of('First'), itemRefs[kids[0]!]!)
      outlineItem.set(PDFName.of('Last'), itemRefs[kids[kids.length - 1]!]!)
      const descendants = descendantCount(index)
      const visible = visibleDescendantCount(index)
      outlineItem.set(
        PDFName.of('Count'),
        PDFNumber.of(item.open === false ? -descendants : visible),
      )
    }
    context.assign(itemRefs[index]!, outlineItem)
  }
  context.assign(
    rootRef,
    context.obj({
      Type: 'Outlines',
      First: itemRefs[roots[0]!],
      Last: itemRefs[roots[roots.length - 1]!],
      Count: roots.reduce(
        (sum, index) =>
          sum + 1 + (valid[index]!.open === false ? 0 : visibleDescendantCount(index)),
        0,
      ),
    }),
  )
  doc.catalog.set(PDFName.of('Outlines'), rootRef)
  doc.catalog.set(PDFName.of('PageMode'), PDFName.of('UseOutlines'))
  return new Uint8Array(await doc.save())
}

export async function listOutlineBookmarks(bytes: Uint8Array): Promise<OutlineBookmark[]> {
  const doc = await PDFDocument.load(bytes)
  return readOutlineChain(doc)
}

/** Append outline bookmarks for selected pages. Empty indexes or an empty title are refused. */
export async function addOutlineBookmarks(
  bytes: Uint8Array,
  pageIndexes: readonly number[],
  title: string,
): Promise<Uint8Array> {
  const label = assertOutlineTitle(title)
  const unique = uniqueSorted([...pageIndexes], false)
  if (unique.length === 0) {
    throw new Error('Chọn ít nhất một trang để đánh dấu.')
  }
  const existing = await listOutlineBookmarks(bytes)
  const added: OutlineBookmark[] = unique.map((pageIndex) => ({
    title: unique.length === 1 ? label : `${label} · ${pageIndex + 1}`,
    pageIndex,
    depth: 0,
  }))
  return writeOutlineBookmarks(bytes, [...existing, ...added])
}

/** Append a folder bookmark whose children are the selected pages. */
export async function addOutlineFolder(
  bytes: Uint8Array,
  pageIndexes: readonly number[],
  title: string,
  parentIndex?: number,
): Promise<Uint8Array> {
  const label = assertOutlineTitle(title)
  const unique = uniqueSorted([...pageIndexes], false)
  if (unique.length === 0) {
    throw new Error('Chọn ít nhất một trang để đánh dấu.')
  }
  const existing = await listOutlineBookmarks(bytes)
  const depths = normalizeOutlineDepths(existing)
  let insertAt = existing.length
  let folderDepth = 0
  if (parentIndex != null) {
    if (!Number.isInteger(parentIndex) || parentIndex < 0 || parentIndex >= existing.length) {
      throw new Error('Chọn một mục lục cha.')
    }
    folderDepth = (depths[parentIndex] ?? 0) + 1
    if (folderDepth + 1 > MAX_OUTLINE_DEPTH) {
      throw new Error('Không lồng thư mục sâu hơn 2 cấp.')
    }
    insertAt = lastOutlineDescendantIndex(depths, parentIndex) + 1
  }
  const folder: OutlineBookmark = {
    title: label,
    pageIndex: unique[0]!,
    depth: folderDepth,
    destless: true,
  }
  const children: OutlineBookmark[] = unique.map((pageIndex) => ({
    title: `${label} · ${pageIndex + 1}`,
    pageIndex,
    depth: folderDepth + 1,
  }))
  const next = [...existing]
  next.splice(insertAt, 0, folder, ...children)
  return writeOutlineBookmarks(bytes, next)
}

/** Collapse or expand every outline folder (`/Count` sign). Needs at least one folder. */
export async function setOutlineFoldersOpen(
  bytes: Uint8Array,
  open: boolean,
): Promise<Uint8Array> {
  const existing = await listOutlineBookmarks(bytes)
  const depths = normalizeOutlineDepths(existing)
  let found = false
  const next = existing.map((item, index) => {
    if (!itemIsOutlineFolder(depths, index)) {
      return cloneOutlineItem(item, { open: true })
    }
    found = true
    return cloneOutlineItem(item, { open })
  })
  if (!found) {
    throw new Error('Không có thư mục mục lục.')
  }
  return writeOutlineBookmarks(bytes, next)
}

/** Collapse or expand one outline folder by its index in `listOutlineBookmarks`. */
export async function setOutlineFolderOpen(
  bytes: Uint8Array,
  folderIndex: number,
  open: boolean,
): Promise<Uint8Array> {
  const existing = await listOutlineBookmarks(bytes)
  const depths = normalizeOutlineDepths(existing)
  if (!Number.isInteger(folderIndex) || folderIndex < 0 || folderIndex >= existing.length) {
    throw new Error('Chọn một thư mục mục lục.')
  }
  if (!itemIsOutlineFolder(depths, folderIndex)) {
    throw new Error('Mục này không phải thư mục.')
  }
  const next = existing.map((item, index) => {
    if (index !== folderIndex) {
      return item
    }
    return cloneOutlineItem(item, { open })
  })
  return writeOutlineBookmarks(bytes, next)
}

/** Rename one outline row by its index in `listOutlineBookmarks`. */
export async function renameOutlineItem(
  bytes: Uint8Array,
  index: number,
  title: string,
): Promise<Uint8Array> {
  const label = assertOutlineTitle(title)
  const existing = await listOutlineBookmarks(bytes)
  if (!Number.isInteger(index) || index < 0 || index >= existing.length) {
    throw new Error('Chọn một mục lục.')
  }
  const next = existing.map((item, at) => (at === index ? cloneOutlineItem(item, { title: label }) : item))
  return writeOutlineBookmarks(bytes, next)
}

/**
 * Remove one outline row. A folder is dropped and its children move up one level.
 * Removing the last item clears the outline.
 */
export async function removeOutlineItem(bytes: Uint8Array, index: number): Promise<Uint8Array> {
  const existing = await listOutlineBookmarks(bytes)
  if (!Number.isInteger(index) || index < 0 || index >= existing.length) {
    throw new Error('Chọn một mục lục.')
  }
  const depths = normalizeOutlineDepths(existing)
  const last = itemIsOutlineFolder(depths, index)
    ? lastOutlineDescendantIndex(depths, index)
    : index
  const next: OutlineBookmark[] = []
  for (let at = 0; at < existing.length; at += 1) {
    if (at === index) {
      continue
    }
    if (at > index && at <= last) {
      next.push(cloneOutlineItem(existing[at]!, { depth: Math.max(0, (depths[at] ?? 0) - 1) }))
      continue
    }
    next.push(existing[at]!)
  }
  if (next.length === 0) {
    return clearOutline(bytes)
  }
  return writeOutlineBookmarks(bytes, next)
}

/** Remove the document outline. Refuses when there is nothing to delete. */
export async function clearOutline(bytes: Uint8Array): Promise<Uint8Array> {
  const existing = await listOutlineBookmarks(bytes)
  if (existing.length === 0) {
    throw new Error('Không có mục lục để xóa.')
  }
  const doc = await PDFDocument.load(bytes)
  doc.catalog.delete(PDFName.of('Outlines'))
  if (doc.catalog.lookupMaybe(PDFName.of('PageMode'), PDFName) === PDFName.of('UseOutlines')) {
    doc.catalog.delete(PDFName.of('PageMode'))
  }
  return new Uint8Array(await doc.save())
}

export const PAGE_LABEL_STYLES = ['decimal', 'roman', 'Roman', 'trang'] as const
export type PageLabelStyle = (typeof PAGE_LABEL_STYLES)[number]
export const PAGE_LABEL_LABELS: Record<PageLabelStyle, string> = {
  decimal: '1, 2, 3',
  roman: 'i, ii, iii',
  Roman: 'I, II, III',
  trang: 'Trang 1',
}

export type PageLabelRange = {
  startIndex: number
  style: PageLabelStyle
  prefix: string
  start: number
}

export type EmbeddedImage = {
  pageIndex: number
  imageIndex: number
  kind: 'jpg' | 'png'
  bytes: Uint8Array
}

const ROMAN_TABLE: readonly [number, string][] = [
  [1000, 'm'],
  [900, 'cm'],
  [500, 'd'],
  [400, 'cd'],
  [100, 'c'],
  [90, 'xc'],
  [50, 'l'],
  [40, 'xl'],
  [10, 'x'],
  [9, 'ix'],
  [5, 'v'],
  [4, 'iv'],
  [1, 'i'],
]

export function isPageLabelStyle(value: string): value is PageLabelStyle {
  return (PAGE_LABEL_STYLES as readonly string[]).includes(value)
}

export function toRomanNumeral(value: number, uppercase = false): string {
  const n = Math.trunc(value)
  if (!Number.isInteger(n) || n < 1 || n > 3999) {
    throw new Error('Số La Mã phải từ 1 đến 3999.')
  }
  let remaining = n
  let out = ''
  for (const [amount, glyph] of ROMAN_TABLE) {
    while (remaining >= amount) {
      out += glyph
      remaining -= amount
    }
  }
  return uppercase ? out.toUpperCase() : out
}

export function formatPageLabel(style: PageLabelStyle, n: number): string {
  const start = Math.trunc(n)
  if (style === 'trang') {
    return `Trang ${start}`
  }
  if (style === 'roman') {
    return toRomanNumeral(start, false)
  }
  if (style === 'Roman') {
    return toRomanNumeral(start, true)
  }
  return String(start)
}

/** Viewer label for a 0-based page, from `/PageLabels` ranges. Falls back to 1, 2, 3. */
export function pageLabelForIndex(ranges: readonly PageLabelRange[], index: number): string {
  if (!Number.isInteger(index) || index < 0) {
    return '1'
  }
  let active: PageLabelRange | undefined
  for (const range of ranges) {
    if (range.startIndex <= index && (!active || range.startIndex >= active.startIndex)) {
      active = range
    }
  }
  if (!active) {
    return String(index + 1)
  }
  const n = active.start + (index - active.startIndex)
  if (active.style === 'trang') {
    return formatPageLabel('trang', n)
  }
  const number = formatPageLabel(active.style, n)
  return active.prefix ? `${active.prefix}${number}` : number
}

export function pageLabelsForCount(ranges: readonly PageLabelRange[], count: number): string[] {
  const n = Math.max(0, Math.trunc(count))
  if (!Number.isInteger(n)) {
    return []
  }
  return Array.from({ length: n }, (_, index) => pageLabelForIndex(ranges, index))
}

export function assertPageLabelStart(style: PageLabelStyle, start: number): number {
  const n = Math.trunc(start)
  if (!Number.isInteger(n) || n < 1) {
    throw new Error('Số bắt đầu nhãn trang phải từ 1.')
  }
  if ((style === 'roman' || style === 'Roman') && n > 3999) {
    throw new Error('Số La Mã phải từ 1 đến 3999.')
  }
  return n
}

/** Contiguous prefix 0..k-1, not the whole document. Used for i, ii then 1, 2 labels. */
export function frontMatterPageCount(
  indexes: readonly number[],
  count: number,
): number | null {
  if (count < 2) {
    return null
  }
  const unique = [
    ...new Set(
      indexes.filter((index) => Number.isInteger(index) && index >= 0 && index < count),
    ),
  ].sort((a, b) => a - b)
  if (unique.length === 0 || unique.length >= count || unique[0] !== 0) {
    return null
  }
  if (!unique.every((value, index) => value === index)) {
    return null
  }
  return unique.length
}

function pageLabelStyleName(style: PageLabelStyle): PDFName {
  if (style === 'roman') {
    return PDFName.of('r')
  }
  if (style === 'Roman') {
    return PDFName.of('R')
  }
  return PDFName.of('D')
}

function pageLabelPrefix(style: PageLabelStyle, prefix: string): string {
  if (style === 'trang') {
    return prefix || 'Trang '
  }
  return prefix
}

function pageLabelDictFromStyle(
  doc: PDFDocument,
  range: PageLabelRange,
): PDFDict {
  const dict = doc.context.obj({})
  dict.set(PDFName.of('S'), pageLabelStyleName(range.style))
  const prefix = pageLabelPrefix(range.style, range.prefix)
  if (prefix) {
    dict.set(PDFName.of('P'), PDFString.of(prefix))
  }
  if (range.start !== 1) {
    dict.set(PDFName.of('St'), PDFNumber.of(range.start))
  }
  return dict
}

function styleFromPageLabelDict(dict: PDFDict): { style: PageLabelStyle; prefix: string; start: number } {
  const s = dict.lookupMaybe(PDFName.of('S'), PDFName)
  const prefix = decodePdfString(dict.get(PDFName.of('P')))
  const start = dict.lookupMaybe(PDFName.of('St'), PDFNumber)?.asNumber() ?? 1
  const name = s ? s.asString().replace(/^\//, '') : 'D'
  if (name === 'r') {
    return { style: 'roman', prefix, start }
  }
  if (name === 'R') {
    return { style: 'Roman', prefix, start }
  }
  if (prefix === 'Trang ' || prefix === 'Trang') {
    return { style: 'trang', prefix: prefix.endsWith(' ') ? prefix : `${prefix} `, start }
  }
  return { style: 'decimal', prefix, start }
}

function decodePdfString(value: unknown): string {
  if (value instanceof PDFHexString || value instanceof PDFString) {
    return value.decodeText()
  }
  return ''
}

async function writePageLabelRanges(
  bytes: Uint8Array,
  ranges: readonly PageLabelRange[],
): Promise<Uint8Array> {
  if (ranges.length === 0) {
    throw new Error('Chọn kiểu nhãn trang.')
  }
  const doc = await PDFDocument.load(bytes)
  const nums = doc.context.obj([])
  for (const range of ranges) {
    nums.push(PDFNumber.of(range.startIndex))
    nums.push(pageLabelDictFromStyle(doc, range))
  }
  doc.catalog.set(PDFName.of('PageLabels'), doc.context.obj({ Nums: nums }))
  return new Uint8Array(await doc.save())
}

export async function setPageLabels(
  bytes: Uint8Array,
  style: PageLabelStyle,
  start = 1,
): Promise<Uint8Array> {
  if (!isPageLabelStyle(style)) {
    throw new Error('Chọn kiểu nhãn trang.')
  }
  const startNumber = assertPageLabelStart(style, start)
  return writePageLabelRanges(bytes, [
    {
      startIndex: 0,
      style,
      prefix: style === 'trang' ? 'Trang ' : '',
      start: startNumber,
    },
  ])
}

export async function setFrontMatterPageLabels(
  bytes: Uint8Array,
  frontCount: number,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes)
  const count = doc.getPageCount()
  const n = Math.trunc(frontCount)
  if (!Number.isInteger(n) || n < 1 || n >= count) {
    throw new Error('Chọn phần mở đầu (ít nhất một trang, không phải cả tài liệu).')
  }
  return writePageLabelRanges(bytes, [
    { startIndex: 0, style: 'roman', prefix: '', start: 1 },
    { startIndex: n, style: 'decimal', prefix: '', start: 1 },
  ])
}

export async function listPageLabels(bytes: Uint8Array): Promise<PageLabelRange[]> {
  const doc = await PDFDocument.load(bytes)
  const labels = doc.catalog.lookupMaybe(PDFName.of('PageLabels'), PDFDict)
  if (!labels) {
    return []
  }
  const nums = labels.lookupMaybe(PDFName.of('Nums'), PDFArray)
  if (!nums) {
    return []
  }
  const ranges: PageLabelRange[] = []
  for (let index = 0; index + 1 < nums.size(); index += 2) {
    const start = nums.lookupMaybe(index, PDFNumber)
    const dict = nums.lookupMaybe(index + 1, PDFDict)
    if (!start || !dict) {
      continue
    }
    const startIndex = Math.trunc(start.asNumber())
    if (!Number.isInteger(startIndex) || startIndex < 0) {
      continue
    }
    const parsed = styleFromPageLabelDict(dict)
    ranges.push({ startIndex, ...parsed })
  }
  return ranges
}

function pdfFilterName(value: unknown): string {
  if (value instanceof PDFName) {
    return value.asString().replace(/^\//, '')
  }
  if (value instanceof PDFArray && value.size() > 0) {
    const first = value.get(0)
    if (first instanceof PDFName) {
      return first.asString().replace(/^\//, '')
    }
  }
  return ''
}

function pdfInt(dict: PDFDict, key: string): number | null {
  const value = dict.lookupMaybe(PDFName.of(key), PDFNumber)
  if (!value) {
    return null
  }
  const n = value.asNumber()
  return Number.isFinite(n) ? n : null
}

function imageColorChannels(stream: PDFRawStream): 1 | 3 | null {
  const cs = stream.dict.lookup(PDFName.of('ColorSpace'))
  if (cs === PDFName.of('DeviceGray') || cs === PDFName.of('DeviceGrey')) {
    return 1
  }
  if (cs === PDFName.of('DeviceRGB')) {
    return 3
  }
  return null
}

function crc32(data: Uint8Array): number {
  let crc = ~0
  for (let i = 0; i < data.length; i += 1) {
    crc ^= data[i]!
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
    }
  }
  return ~crc >>> 0
}

function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length)
  const view = new DataView(out.buffer)
  view.setUint32(0, data.length)
  for (let i = 0; i < 4; i += 1) {
    out[4 + i] = type.charCodeAt(i)
  }
  out.set(data, 8)
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)))
  return out
}

async function zlibDeflate(data: Uint8Array): Promise<Uint8Array> {
  const copy = new ArrayBuffer(data.byteLength)
  new Uint8Array(copy).set(data)
  const compressed = new Blob([copy]).stream().pipeThrough(new CompressionStream('deflate'))
  return new Uint8Array(await new Response(compressed).arrayBuffer())
}

async function rawPixelsToPng(
  pixels: Uint8Array,
  width: number,
  height: number,
  channels: 1 | 3,
): Promise<Uint8Array> {
  const stride = width * channels
  if (width < 1 || height < 1 || pixels.length < stride * height) {
    throw new Error('Ảnh nhúng không đọc được.')
  }
  const rows = new Uint8Array((stride + 1) * height)
  for (let y = 0; y < height; y += 1) {
    const dest = y * (stride + 1)
    rows[dest] = 0
    rows.set(pixels.subarray(y * stride, y * stride + stride), dest + 1)
  }
  const ihdr = new Uint8Array(13)
  const view = new DataView(ihdr.buffer)
  view.setUint32(0, width)
  view.setUint32(4, height)
  ihdr[8] = 8
  ihdr[9] = channels === 3 ? 2 : 0
  const signature = Uint8Array.of(137, 80, 78, 71, 13, 10, 26, 10)
  const chunks = [pngChunk('IHDR', ihdr), pngChunk('IDAT', await zlibDeflate(rows)), pngChunk('IEND', new Uint8Array())]
  const out = new Uint8Array(signature.length + chunks.reduce((sum, chunk) => sum + chunk.length, 0))
  out.set(signature, 0)
  let offset = signature.length
  for (const chunk of chunks) {
    out.set(chunk, offset)
    offset += chunk.length
  }
  return out
}

function decodedImageBytes(stream: PDFRawStream): Uint8Array {
  try {
    return decodePDFRawStream(stream).decode()
  } catch {
    return stream.getContents()
  }
}

async function embeddedImageFromStream(stream: PDFRawStream): Promise<{ kind: 'jpg' | 'png'; bytes: Uint8Array } | null> {
  const subtype = stream.dict.lookup(PDFName.of('Subtype'))
  if (subtype !== PDFName.of('Image')) {
    return null
  }
  const filter = pdfFilterName(stream.dict.lookup(PDFName.of('Filter')))
  if (filter === 'DCTDecode' || filter === 'DCT') {
    const bytes = stream.getContents()
    if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8) {
      return { kind: 'jpg', bytes }
    }
    const decoded = decodedImageBytes(stream)
    if (decoded.length >= 2 && decoded[0] === 0xff && decoded[1] === 0xd8) {
      return { kind: 'jpg', bytes: decoded }
    }
    return null
  }
  const width = pdfInt(stream.dict, 'Width')
  const height = pdfInt(stream.dict, 'Height')
  const bpc = pdfInt(stream.dict, 'BitsPerComponent') ?? 8
  const channels = imageColorChannels(stream)
  if (!width || !height || bpc !== 8 || !channels) {
    return null
  }
  const pixels = decodedImageBytes(stream)
  try {
    return { kind: 'png', bytes: await rawPixelsToPng(pixels, width, height, channels) }
  } catch {
    return null
  }
}

function xObjectDictForPage(page: { node: { Resources: () => PDFDict | undefined } }): PDFDict | null {
  const resources = page.node.Resources()
  if (!resources) {
    return null
  }
  return resources.lookupMaybe(PDFName.of('XObject'), PDFDict) ?? null
}

/** Pull DCTDecode JPEG and 8-bit RGB/Gray image XObjects from selected pages. Does not mutate the PDF. */
export async function extractEmbeddedImages(
  bytes: Uint8Array,
  pageIndexes: readonly number[],
): Promise<EmbeddedImage[]> {
  const doc = await PDFDocument.load(bytes)
  const count = doc.getPageCount()
  const unique = uniqueSorted([...pageIndexes], false).filter(
    (index) => Number.isInteger(index) && index >= 0 && index < count,
  )
  if (unique.length === 0) {
    throw new Error('Chọn ít nhất một trang để tải ảnh nhúng.')
  }
  const images: EmbeddedImage[] = []
  for (const pageIndex of unique) {
    const xobjects = xObjectDictForPage(doc.getPage(pageIndex))
    if (!xobjects) {
      continue
    }
    let imageIndex = 0
    for (const [, value] of xobjects.entries()) {
      const looked =
        value instanceof PDFRawStream
          ? value
          : value instanceof PDFRef
            ? doc.context.lookup(value)
            : undefined
      const stream = looked instanceof PDFRawStream ? looked : null
      if (!stream) {
        continue
      }
      const extracted = await embeddedImageFromStream(stream)
      if (!extracted) {
        continue
      }
      images.push({ pageIndex, imageIndex, kind: extracted.kind, bytes: extracted.bytes })
      imageIndex += 1
    }
  }
  if (images.length === 0) {
    throw new Error('Không tìm thấy ảnh nhúng.')
  }
  return images
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function uniqueSorted(indexes: number[], descending: boolean): number[] {
  const unique = [...new Set(indexes)]
  unique.sort((a, b) => (descending ? b - a : a - b))
  return unique
}
