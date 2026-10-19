import { useEffect, useRef } from 'react'
import { renderPageThumbnail } from '../lib/extract.ts'

type PageThumbsProps = {
  bytes: Uint8Array
  pageCount: number
  current: number
  selected: readonly number[]
  disabled?: boolean
  onSelect: (index: number, event: React.MouseEvent<HTMLButtonElement>) => void
}

export function PageThumbs({
  bytes,
  pageCount,
  current,
  selected,
  disabled,
  onSelect,
}: PageThumbsProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const selectedSet = new Set(selected)

  useEffect(() => {
    const root = listRef.current
    if (!root) {
      return
    }
    let cancelled = false
    const canvases = [...root.querySelectorAll('canvas')]
    void (async () => {
      for (let index = 0; index < canvases.length; index += 1) {
        if (cancelled) {
          return
        }
        try {
          await renderPageThumbnail(bytes, index + 1, canvases[index]!)
        } catch {
          // A stale document or a cancelled pdfjs task is fine; the next pass redraws.
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [bytes, pageCount])

  useEffect(() => {
    const currentBtn = listRef.current?.querySelector('[aria-current="page"]')
    currentBtn?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [current])

  return (
    <div
      ref={listRef}
      className="thumb-strip"
      role="listbox"
      aria-label="Trang PDF"
      aria-multiselectable="true"
    >
      {Array.from({ length: pageCount }, (_, index) => {
        const isCurrent = index === current
        const isSelected = selectedSet.has(index)
        return (
          <button
            key={index}
            type="button"
            role="option"
            className={`thumb${isCurrent ? ' current' : ''}${isSelected ? ' selected' : ''}`}
            disabled={disabled}
            aria-selected={isSelected}
            aria-current={isCurrent ? 'page' : undefined}
            aria-label={`Trang ${index + 1}${isSelected ? ', đã chọn' : ''}`}
            onClick={(event) => onSelect(index, event)}
          >
            <canvas aria-hidden="true" />
            <span>{index + 1}</span>
          </button>
        )
      })}
    </div>
  )
}
