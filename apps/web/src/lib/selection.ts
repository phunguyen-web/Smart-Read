export function pageRange(from: number, to: number): number[] {
  const lo = Math.min(from, to)
  const hi = Math.max(from, to)
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
    return []
  }
  const start = Math.max(0, Math.trunc(lo))
  const end = Math.trunc(hi)
  if (end < start) {
    return []
  }
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}

/** Pages that travel together when dragging `from`. */
export function movingIndexesForDrag(selected: readonly number[], from: number): number[] {
  if (!Number.isInteger(from)) {
    return []
  }
  if (selected.includes(from) && selected.length > 1) {
    return [...new Set(selected)].sort((a, b) => a - b)
  }
  return [from]
}

export function oddPageIndexes(count: number): number[] {
  if (count < 1) {
    return []
  }
  return Array.from({ length: count }, (_, index) => index).filter((index) => index % 2 === 0)
}

export function evenPageIndexes(count: number): number[] {
  if (count < 2) {
    return []
  }
  return Array.from({ length: count }, (_, index) => index).filter((index) => index % 2 === 1)
}

/** Pages that are not in `selected` (0-based, in order). */
export function invertPageIndexes(count: number, selected: readonly number[]): number[] {
  if (count < 1) {
    return []
  }
  const picked = new Set(
    selected.filter((index) => Number.isInteger(index) && index >= 0 && index < count),
  )
  return Array.from({ length: count }, (_, index) => index).filter((index) => !picked.has(index))
}

/** Drop target to send a selection to the start or end, or null if it is already there. */
export function blockEdgeDropTo(
  moving: readonly number[],
  edge: 'start' | 'end',
  count: number,
): number | null {
  if (moving.length === 0 || count < 2) {
    return null
  }
  const sorted = [...moving].sort((a, b) => a - b)
  if (edge === 'start') {
    return sorted[0] === 0 ? null : 0
  }
  return sorted[sorted.length - 1] === count - 1 ? null : count - 1
}

/** Drop target for nudging a selection one slot, or null if it cannot move. */
export function blockNudgeDropTo(
  moving: readonly number[],
  delta: -1 | 1,
  count: number,
): number | null {
  if (moving.length === 0 || count < 2) {
    return null
  }
  const sorted = [...moving].sort((a, b) => a - b)
  const dropTo = delta < 0 ? sorted[0]! - 1 : sorted[sorted.length - 1]! + 1
  if (dropTo < 0 || dropTo >= count) {
    return null
  }
  return dropTo
}

export function togglePage(selected: readonly number[], index: number): number[] {
  const unique = new Set(selected)
  if (unique.has(index)) {
    unique.delete(index)
  } else {
    unique.add(index)
  }
  return [...unique].sort((a, b) => a - b)
}

/** New 0-based page index after deleting `deleted` pages. */
export function nextPageAfterDelete(
  current: number,
  deleted: readonly number[],
  remaining: number,
): number {
  if (remaining <= 1) {
    return 0
  }
  const gone = new Set(deleted)
  let before = 0
  for (let index = 0; index < current; index += 1) {
    if (!gone.has(index)) {
      before += 1
    }
  }
  return Math.min(remaining - 1, Math.max(0, before))
}

export function clampPageRange(
  fromPage: number,
  toPage: number,
  pageCount: number,
): { fromPage: number; toPage: number } {
  const last = Math.max(1, pageCount)
  const from = Math.min(last, Math.max(1, Math.trunc(fromPage) || 1))
  const to = Math.min(last, Math.max(from, Math.trunc(toPage) || last))
  return { fromPage: from, toPage: to }
}

export type PageRangeParse =
  | { ok: true; fromPage: number; toPage: number }
  | { ok: false; message: string }

function asRangeNumber(raw: string): number | null {
  const trimmed = raw.trim()
  if (trimmed === '') {
    return null
  }
  if (!/^-?\d+$/.test(trimmed)) {
    return Number.NaN
  }
  return Number(trimmed)
}

/** Validate a from–to page range without silently clamping. */
export function parsePageRange(
  fromRaw: string,
  toRaw: string,
  pageCount: number,
): PageRangeParse {
  if (pageCount < 1) {
    return { ok: false, message: 'Tài liệu không có trang để xuất.' }
  }
  const fromEmpty = fromRaw.trim() === ''
  const toEmpty = toRaw.trim() === ''
  if (fromEmpty && toEmpty) {
    return { ok: false, message: 'Nhập số trang bắt đầu và kết thúc.' }
  }
  if (fromEmpty) {
    return { ok: false, message: 'Nhập số trang bắt đầu.' }
  }
  if (toEmpty) {
    return { ok: false, message: 'Nhập số trang kết thúc.' }
  }
  const from = asRangeNumber(fromRaw)
  const to = asRangeNumber(toRaw)
  if (from == null || to == null || !Number.isFinite(from) || !Number.isFinite(to)) {
    return { ok: false, message: 'Khoảng trang phải là số nguyên.' }
  }
  if (from < 1) {
    return { ok: false, message: 'Trang bắt đầu phải từ 1.' }
  }
  if (to < 1) {
    return { ok: false, message: 'Trang kết thúc phải từ 1.' }
  }
  if (from > pageCount) {
    return { ok: false, message: `Trang bắt đầu không được vượt quá ${pageCount}.` }
  }
  if (to > pageCount) {
    return { ok: false, message: `Trang kết thúc không được vượt quá ${pageCount}.` }
  }
  if (from > to) {
    return { ok: false, message: 'Trang bắt đầu không được lớn hơn trang kết thúc.' }
  }
  return { ok: true, fromPage: from, toPage: to }
}

/** 0-based page indexes for a validated inclusive 1-based range. */
export function indexesFromPageRange(fromPage: number, toPage: number): number[] {
  const from = Math.trunc(fromPage)
  const to = Math.trunc(toPage)
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to < from) {
    throw new Error('Khoảng trang không hợp lệ.')
  }
  return Array.from({ length: to - from + 1 }, (_, offset) => from - 1 + offset)
}

export type GotoPageParse = { ok: true; index: number } | { ok: false; message: string }

/** Validate a 1-based page number for jumping in the editor. */
export function parseGotoPage(raw: string, pageCount: number): GotoPageParse {
  if (pageCount < 1) {
    return { ok: false, message: 'Tài liệu không có trang để tới.' }
  }
  const trimmed = raw.trim()
  if (trimmed === '') {
    return { ok: false, message: 'Nhập số trang cần tới.' }
  }
  if (!/^\d+$/.test(trimmed)) {
    return { ok: false, message: 'Số trang phải là số nguyên.' }
  }
  const page = Number(trimmed)
  if (page < 1) {
    return { ok: false, message: 'Số trang phải từ 1.' }
  }
  if (page > pageCount) {
    return { ok: false, message: `Số trang không được vượt quá ${pageCount}.` }
  }
  return { ok: true, index: page - 1 }
}

export type SplitSizeParse = { ok: true; size: number } | { ok: false; message: string }

export function parseSplitSize(raw: string, pageCount: number): SplitSizeParse {
  if (pageCount < 1) {
    return { ok: false, message: 'Tài liệu không có trang để tách.' }
  }
  const trimmed = raw.trim()
  if (trimmed === '') {
    return { ok: false, message: 'Nhập số trang mỗi tệp.' }
  }
  if (!/^\d+$/.test(trimmed)) {
    return { ok: false, message: 'Số trang mỗi tệp phải là số nguyên.' }
  }
  const size = Number(trimmed)
  if (size < 1) {
    return { ok: false, message: 'Số trang mỗi tệp phải từ 1.' }
  }
  if (size > pageCount) {
    return { ok: false, message: `Số trang mỗi tệp không được vượt quá ${pageCount}.` }
  }
  return { ok: true, size }
}
