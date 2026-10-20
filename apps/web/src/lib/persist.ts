import { snapshotOf, type EditorSnapshot } from './history.ts'

const DB_NAME = 'smart-read'
const STORE_NAME = 'session'
const DOC_KEY = 'document'
const HISTORY_PAST_KEY = 'history-past'
const HISTORY_FUTURE_KEY = 'history-future'
const VIEW_KEY = 'smart-read-editor-view'
const DB_VERSION = 2

export const MAX_PERSISTED_HISTORY = 8

export type PersistedDocument = {
  name: string
  bytes: Uint8Array
}

export type EditorView = {
  page: number
  selected: number[]
  anchor: number
}

export type EditorHistory = {
  past: EditorSnapshot[]
  future: EditorSnapshot[]
}

type StoredDocument = {
  name: string
  bytes: ArrayBuffer
}

type StoredSnapshot = {
  bytes: ArrayBuffer
  page: number
  selected: number[]
  anchor: number
}

let hydratedHistory: EditorHistory = { past: [], future: [] }

function sessionStore(): Storage | null {
  try {
    if (typeof sessionStorage === 'undefined') {
      return null
    }
    return sessionStorage
  } catch {
    return null
  }
}

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') {
    return Promise.resolve(null)
  }
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Không mở được bộ nhớ trình duyệt.'))
  })
}

async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T | null> {
  const db = await openDb()
  if (!db) {
    return null
  }
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, mode)
      const request = run(tx.objectStore(STORE_NAME))
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error ?? new Error('Không ghi được bộ nhớ trình duyệt.'))
    })
  } finally {
    db.close()
  }
}

export async function savePersistedDocument(doc: PersistedDocument): Promise<void> {
  const copy = new ArrayBuffer(doc.bytes.byteLength)
  new Uint8Array(copy).set(doc.bytes)
  await withStore('readwrite', (store) =>
    store.put({ name: doc.name, bytes: copy } satisfies StoredDocument, DOC_KEY),
  )
}

export async function loadPersistedDocument(): Promise<PersistedDocument | null> {
  try {
    const stored = await withStore<StoredDocument | undefined>('readonly', (store) =>
      store.get(DOC_KEY),
    )
    if (!stored?.bytes || typeof stored.name !== 'string') {
      return null
    }
    return { name: stored.name, bytes: new Uint8Array(stored.bytes) }
  } catch {
    return null
  }
}

export async function clearPersistedDocument(): Promise<void> {
  await withStore('readwrite', (store) => store.delete(DOC_KEY))
}

export function encodeSnapshots(
  stack: readonly EditorSnapshot[],
  limit = MAX_PERSISTED_HISTORY,
): StoredSnapshot[] {
  const kept = stack.slice(Math.max(0, stack.length - limit))
  return kept.map((snapshot) => {
    const copy = new ArrayBuffer(snapshot.bytes.byteLength)
    new Uint8Array(copy).set(snapshot.bytes)
    return {
      bytes: copy,
      page: snapshot.page,
      selected: [...snapshot.selected],
      anchor: snapshot.anchor,
    }
  })
}

export function decodeSnapshots(raw: unknown): EditorSnapshot[] {
  if (!Array.isArray(raw)) {
    return []
  }
  const snapshots: EditorSnapshot[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') {
      continue
    }
    const record = item as { bytes?: unknown; page?: unknown; selected?: unknown; anchor?: unknown }
    const bytes =
      record.bytes instanceof ArrayBuffer
        ? new Uint8Array(record.bytes)
        : record.bytes instanceof Uint8Array
          ? record.bytes.slice()
          : null
    if (!bytes || !Number.isInteger(record.page) || !Array.isArray(record.selected)) {
      continue
    }
    const selected = record.selected.filter((index): index is number => Number.isInteger(index))
    const page = record.page as number
    snapshots.push(
      snapshotOf(
        bytes,
        page,
        selected,
        Number.isInteger(record.anchor) ? (record.anchor as number) : page,
      ),
    )
  }
  return snapshots
}

export function getHydratedHistory(): EditorHistory {
  return {
    past: hydratedHistory.past.map((snapshot) =>
      snapshotOf(snapshot.bytes, snapshot.page, snapshot.selected, snapshot.anchor),
    ),
    future: hydratedHistory.future.map((snapshot) =>
      snapshotOf(snapshot.bytes, snapshot.page, snapshot.selected, snapshot.anchor),
    ),
  }
}

export async function hydrateHistory(): Promise<EditorHistory> {
  hydratedHistory = (await loadPersistedHistory()) ?? { past: [], future: [] }
  return getHydratedHistory()
}

export async function loadPersistedHistory(): Promise<EditorHistory | null> {
  try {
    const pastRaw = await withStore<unknown>('readonly', (store) => store.get(HISTORY_PAST_KEY))
    const futureRaw = await withStore<unknown>('readonly', (store) => store.get(HISTORY_FUTURE_KEY))
    const past = decodeSnapshots(pastRaw)
    const future = decodeSnapshots(futureRaw)
    if (past.length === 0 && future.length === 0) {
      return { past: [], future: [] }
    }
    return { past, future }
  } catch {
    return null
  }
}

export async function persistHistory(past: EditorSnapshot[], future: EditorSnapshot[]): Promise<void> {
  hydratedHistory = {
    past: past.map((snapshot) =>
      snapshotOf(snapshot.bytes, snapshot.page, snapshot.selected, snapshot.anchor),
    ),
    future: future.map((snapshot) =>
      snapshotOf(snapshot.bytes, snapshot.page, snapshot.selected, snapshot.anchor),
    ),
  }
  try {
    await withStore('readwrite', (store) => store.put(encodeSnapshots(past), HISTORY_PAST_KEY))
    await withStore('readwrite', (store) => store.put(encodeSnapshots(future), HISTORY_FUTURE_KEY))
  } catch {
    // Quota or private-mode IndexedDB should not block editing.
  }
}

export async function forgetHistory(): Promise<void> {
  hydratedHistory = { past: [], future: [] }
  try {
    await withStore('readwrite', (store) => store.delete(HISTORY_PAST_KEY))
    await withStore('readwrite', (store) => store.delete(HISTORY_FUTURE_KEY))
  } catch {
    // Ignore a missing store.
  }
}

export function saveEditorView(view: EditorView): void {
  const store = sessionStore()
  if (!store) {
    return
  }
  store.setItem(
    VIEW_KEY,
    JSON.stringify({
      page: view.page,
      selected: view.selected,
      anchor: view.anchor,
    }),
  )
}

export function loadEditorView(): EditorView | null {
  const store = sessionStore()
  if (!store) {
    return null
  }
  try {
    const raw = store.getItem(VIEW_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as { page?: unknown; selected?: unknown; anchor?: unknown }
    if (!Number.isInteger(parsed.page) || !Array.isArray(parsed.selected)) {
      return null
    }
    const page = parsed.page as number
    const selected = parsed.selected.filter((index): index is number => Number.isInteger(index))
    return {
      page,
      selected,
      anchor: Number.isInteger(parsed.anchor) ? (parsed.anchor as number) : page,
    }
  } catch {
    return null
  }
}

export function clearEditorView(): void {
  sessionStore()?.removeItem(VIEW_KEY)
}

export function restoreEditorView(
  pageCount: number,
): EditorView {
  const fallback = { page: 0, selected: [0], anchor: 0 }
  if (pageCount < 1) {
    return fallback
  }
  const last = pageCount - 1
  const saved = loadEditorView()
  if (!saved) {
    return fallback
  }
  const page = Math.min(last, Math.max(0, saved.page))
  const selected = saved.selected
    .filter((index) => index >= 0 && index <= last)
    .sort((a, b) => a - b)
  return {
    page,
    selected: selected.length > 0 ? selected : [page],
    anchor: Math.min(last, Math.max(0, saved.anchor)),
  }
}

/** Multi-page editor subset for convert, or null when the user is on a single page / the whole file. */
export function editorExportSelection(pageCount: number): number[] | null {
  if (pageCount < 2) {
    return null
  }
  const selected = restoreEditorView(pageCount).selected.filter(
    (index) => index >= 0 && index < pageCount,
  )
  if (selected.length < 2 || selected.length === pageCount) {
    return null
  }
  return selected
}

export function formatPageList(indexes: readonly number[]): string {
  return [...indexes]
    .filter((index) => Number.isInteger(index) && index >= 0)
    .sort((a, b) => a - b)
    .map((index) => index + 1)
    .join(', ')
}
