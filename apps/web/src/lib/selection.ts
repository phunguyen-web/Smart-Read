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
