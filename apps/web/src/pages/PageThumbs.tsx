import { useEffect, useRef, useState } from 'react'
import { renderPageThumbnail } from '../lib/extract.ts'

type PageThumbsProps = {
  bytes: Uint8Array
  pageCount: number
  current: number
  selected: readonly number[]
  disabled?: boolean
  onSelect: (index: number, event: React.MouseEvent<HTMLButtonElement>) => void
  onReorder: (from: number, to: number) => void
}

export function PageThumbs({
  bytes,
  pageCount,
  current,
  selected,
  disabled,
  onSelect,
  onReorder,
}: PageThumbsProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const suppressClick = useRef(false)
  const [dragFrom, setDragFrom] = useState<number | null>(null)
  const [dropTo, setDropTo] = useState<number | null>(null)
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

  function clearDrag(): void {
    setDragFrom(null)
    setDropTo(null)
  }

  return (
    <div
      ref={listRef}
      className="thumb-strip"
      role="listbox"
      aria-label="Trang PDF. Kéo thumbnail để đổi thứ tự."
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
            className={`thumb${isCurrent ? ' current' : ''}${isSelected ? ' selected' : ''}${
              dragFrom === index ? ' dragging' : ''
            }${dropTo === index && dragFrom !== index ? ' drop-target' : ''}`}
            disabled={disabled}
            draggable={!disabled}
            aria-selected={isSelected}
            aria-current={isCurrent ? 'page' : undefined}
            aria-label={`Trang ${index + 1}${isSelected ? ', đã chọn' : ''}. Kéo để đổi thứ tự.`}
            onClick={(event) => {
              if (suppressClick.current) {
                suppressClick.current = false
                event.preventDefault()
                return
              }
              onSelect(index, event)
            }}
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = 'move'
              event.dataTransfer.setData('text/plain', String(index))
              setDragFrom(index)
              setDropTo(index)
            }}
            onDragOver={(event) => {
              event.preventDefault()
              event.dataTransfer.dropEffect = 'move'
              setDropTo(index)
            }}
            onDrop={(event) => {
              event.preventDefault()
              const raw = event.dataTransfer.getData('text/plain')
              const from = raw === '' ? dragFrom : Number(raw)
              suppressClick.current = true
              clearDrag()
              if (from == null || !Number.isInteger(from) || from === index) {
                return
              }
              onReorder(from, index)
            }}
            onDragEnd={clearDrag}
          >
            <canvas aria-hidden="true" />
            <span>{index + 1}</span>
          </button>
        )
      })}
    </div>
  )
}
