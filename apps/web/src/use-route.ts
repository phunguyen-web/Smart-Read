import { useEffect, useState } from 'react'

export function currentPath(): string {
  const hash = window.location.hash.replace(/^#/, '')
  return hash === '' ? '/' : hash
}

export function navigate(path: string): void {
  window.location.hash = path === '/' ? '' : path
}

export function useRoute(): string {
  const [path, setPath] = useState(currentPath)
  useEffect(() => {
    const onChange = () => setPath(currentPath())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return path
}
