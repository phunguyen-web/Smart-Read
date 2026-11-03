import { useSyncExternalStore } from 'react'
import { getDocument, subscribe } from './lib/document-store.ts'

export function useDocument() {
  return useSyncExternalStore(subscribe, getDocument, getDocument)
}
