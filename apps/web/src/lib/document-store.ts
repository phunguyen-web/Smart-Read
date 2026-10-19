import { pageCount } from './pdf.ts'
import {
  clearEditorView,
  clearPersistedDocument,
  loadPersistedDocument,
  savePersistedDocument,
} from './persist.ts'

export type LoadedDocument = {
  name: string
  bytes: Uint8Array
  pageCount: number
}

type Listener = () => void

let current: LoadedDocument | null = null
const listeners = new Set<Listener>()

function notify(): void {
  for (const listener of listeners) {
    listener()
  }
}

export function getDocument(): LoadedDocument | null {
  return current
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export async function hydrateDocument(): Promise<LoadedDocument | null> {
  if (current) {
    return current
  }
  const saved = await loadPersistedDocument()
  if (!saved) {
    return null
  }
  try {
    return await setDocument(saved.name, saved.bytes, { persist: false })
  } catch {
    return null
  }
}

export async function setDocument(
  name: string,
  bytes: Uint8Array,
  options: { persist?: boolean } = {},
): Promise<LoadedDocument> {
  const count = await pageCount(bytes)
  current = { name, bytes, pageCount: count }
  notify()
  if (options.persist !== false) {
    void savePersistedDocument({ name, bytes: current.bytes }).catch(() => undefined)
  }
  return current
}

export async function updateBytes(bytes: Uint8Array): Promise<LoadedDocument> {
  if (!current) {
    throw new Error('Chưa có tài liệu.')
  }
  return setDocument(current.name, bytes)
}

export async function clearDocument(): Promise<void> {
  current = null
  notify()
  clearEditorView()
  try {
    await clearPersistedDocument()
  } catch {
    // IndexedDB may be unavailable; in-memory state is already cleared.
  }
}

export function bytesToBlob(bytes: Uint8Array, type: string): Blob {
  const copy = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(copy).set(bytes)
  return new Blob([copy], { type })
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
