import { pageCount } from './pdf.ts'

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

export async function setDocument(name: string, bytes: Uint8Array): Promise<LoadedDocument> {
  const count = await pageCount(bytes)
  current = { name, bytes, pageCount: count }
  notify()
  return current
}

export async function updateBytes(bytes: Uint8Array): Promise<LoadedDocument> {
  if (!current) {
    throw new Error('Chưa có tài liệu.')
  }
  return setDocument(current.name, bytes)
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
