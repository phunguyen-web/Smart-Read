const DB_NAME = 'smart-read'
const STORE_NAME = 'session'
const DOC_KEY = 'document'
const VIEW_KEY = 'smart-read-editor-view'

export type PersistedDocument = {
  name: string
  bytes: Uint8Array
}

export type EditorView = {
  page: number
  selected: number[]
  anchor: number
}

type StoredDocument = {
  name: string
  bytes: ArrayBuffer
}

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
    const request = indexedDB.open(DB_NAME, 1)
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
