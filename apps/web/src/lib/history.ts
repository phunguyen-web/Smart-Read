export const MAX_EDITOR_HISTORY = 15

export type EditorSnapshot = {
  bytes: Uint8Array
  page: number
  selected: number[]
  anchor: number
}

export function snapshotOf(
  bytes: Uint8Array,
  page: number,
  selected: readonly number[],
  anchor: number,
): EditorSnapshot {
  return {
    bytes: bytes.slice(),
    page,
    selected: [...selected],
    anchor,
  }
}

export function pushSnapshot(
  stack: EditorSnapshot[],
  snapshot: EditorSnapshot,
  limit = MAX_EDITOR_HISTORY,
): EditorSnapshot[] {
  const next = [...stack, snapshot]
  if (next.length <= limit) {
    return next
  }
  return next.slice(next.length - limit)
}

export function popSnapshot(
  stack: EditorSnapshot[],
): { snapshot: EditorSnapshot; rest: EditorSnapshot[] } | null {
  if (stack.length === 0) {
    return null
  }
  return {
    snapshot: stack[stack.length - 1]!,
    rest: stack.slice(0, -1),
  }
}
