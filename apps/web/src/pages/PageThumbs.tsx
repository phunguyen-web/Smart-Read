import { useEffect, useRef, useState } from 'react'
import { destNamesForPage, type NamedDestination } from '../lib/pdf.ts'
import { renderPageThumbnail } from '../lib/extract.ts'

type PageThumbsProps = {
  bytes: Uint8Array
  pageCount: number
  current: number
  selected: readonly number[]
  labels?: readonly string[]
  dests?: readonly NamedDestination[]
  disabled?: boolean
  onSelect: (index: number, event: React.MouseEvent<HTMLButtonElement>) => void
  onSelectDest?: (name: string) => void
  onReorder: (from: number, to: number) => void
}

export function PageThumbs({
  bytes,
  pageCount,
  current,
  selected,
  labels,
  dests,
  disabled,
  onSelect,
  onSelectDest,
  onReorder,
}: PageThumbsProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const suppressClick = useRef(false)
  const [dragFrom, setDragFrom] = useState<number | null>(null)
  const [dropTo, setDropTo] = useState<number | null>(null)
  const selectedSet = new Set(selected)
  const draggingBlock = dragFrom != null && selectedSet.has(dragFrom) && selected.length > 1

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
      aria-label="Trang PDF. Kéo thumbnail để đổi thứ tự; các trang đã chọn đi cùng nhau."
      aria-multiselectable="true"
    >
      {Array.from({ length: pageCount }, (_, index) => {
        const isCurrent = index === current
        const isSelected = selectedSet.has(index)
        const physical = String(index + 1)
        const label = labels?.[index]?.trim() || physical
        const destNames = destNamesForPage(dests ?? [], index)
        const destNote = destNames.length > 0 ? `, đích ${destNames.join(', ')}` : ''
        const labelNote = label !== physical ? `, nhãn ${label}` : ''
        return (
          <button
            key={index}
            type="button"
            role="option"
            className={`thumb${isCurrent ? ' current' : ''}${isSelected ? ' selected' : ''}${
              dragFrom === index || (draggingBlock && isSelected) ? ' dragging' : ''
            }${dropTo === index && dragFrom !== index ? ' drop-target' : ''}`}
            disabled={disabled}
            draggable={!disabled}
            aria-selected={isSelected}
            aria-current={isCurrent ? 'page' : undefined}
            aria-label={`Trang ${index + 1}${labelNote}${destNote}${isSelected ? ', đã chọn' : ''}. ${
              isSelected && selected.length > 1
                ? 'Kéo để dời cả nhóm đã chọn.'
                : 'Kéo để đổi thứ tự.'
            }`}
            onClick={(event) => {
              if (suppressClick.current) {
                suppressClick.current = false
                event.preventDefault()
                return
              }
              const destEl =
                event.target instanceof Element
                  ? event.target.closest('[data-dest-name]')
                  : null
              const destName = destEl instanceof HTMLElement ? destEl.dataset.destName : undefined
              if (destName && onSelectDest) {
                event.preventDefault()
                onSelectDest(destName)
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
            <span>{label}</span>
            {destNames.length > 0 ? (
              <span className="thumb-dests">
                {destNames.map((name) => (
                  <span key={name} data-dest-name={name} className="thumb-dest" title={name}>
                    {name}
                  </span>
                ))}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
