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
