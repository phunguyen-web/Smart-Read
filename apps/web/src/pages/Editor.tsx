import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { renderPageToCanvas } from '../lib/extract.ts'
import {
  OVERLAY_PRESETS,
  addTextOverlay,
  deletePages,
  mergeInsertIndex,
  mergePdf,
  movePage,
  pageCount,
  rotatePages,
  type MergeWhere,
  type OverlayPosition,
  type OverlayPresetId,
} from '../lib/pdf.ts'
import { readPdfFile } from '../lib/limits.ts'
import { nextPageAfterDelete, pageRange, togglePage } from '../lib/selection.ts'
import { bytesToBlob, downloadBlob, setDocument, updateBytes } from '../lib/document-store.ts'
import { useDocument } from '../use-document.ts'
import { PageThumbs } from './PageThumbs.tsx'

const PRESET_LABELS: { id: OverlayPresetId; label: string }[] = [
  { id: 'top-left', label: 'Trên trái' },
  { id: 'top-center', label: 'Trên giữa' },
  { id: 'center', label: 'Giữa' },
  { id: 'bottom-left', label: 'Dưới trái' },
]

export function Editor() {
  const doc = useDocument()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<number[]>([0])
  const [anchor, setAnchor] = useState(0)
  const [overlay, setOverlay] = useState('')
  const [overlayPos, setOverlayPos] = useState<OverlayPosition>(OVERLAY_PRESETS['top-left'])
  const [mergePending, setMergePending] = useState<{
    name: string
    bytes: Uint8Array
    pages: number
  } | null>(null)
  const [mergeWhere, setMergeWhere] = useState<MergeWhere>('end')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const targets = useMemo(
    () => (selected.length > 0 ? selected : [page]),
    [selected, page],
  )

  const run = useCallback(
    async (
      mutate: (bytes: Uint8Array) => Promise<Uint8Array>,
      after?: (pageCount: number) => void,
    ): Promise<void> => {
      if (!doc) {
        return
      }
      setBusy(true)
      setError(null)
      try {
        const next = await mutate(doc.bytes)
        const updated = await updateBytes(next)
        if (after) {
          after(updated.pageCount)
          return
        }
        setPage((current) => Math.min(current, updated.pageCount - 1))
        setSelected((current) => {
          const nextSelected = current
            .filter((index) => index < updated.pageCount)
            .sort((a, b) => a - b)
          return nextSelected.length > 0
            ? nextSelected
            : [Math.min(page, updated.pageCount - 1)]
        })
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Thao tác PDF thất bại.')
      } finally {
        setBusy(false)
      }
    },
    [doc, page],
  )

  useEffect(() => {
    if (!doc || !canvasRef.current) {
      return
    }
    const canvas = canvasRef.current
    let cancelled = false
    void renderPageToCanvas(doc.bytes, page + 1, canvas)
      .then(() => {
        if (!cancelled) {
          setError(null)
        }
      })
      .catch((cause) => {
        if (cancelled) {
          return
        }
        setError(cause instanceof Error ? cause.message : 'Không xem được trang.')
      })
    return () => {
      cancelled = true
    }
  }, [doc, page])

  const goToPage = useCallback(
    (index: number, mode: 'replace' | 'toggle' | 'range'): void => {
      if (!doc) {
        return
      }
      const next = Math.max(0, Math.min(doc.pageCount - 1, index))
      setPage(next)
      if (mode === 'toggle') {
        setSelected((current) => {
          const nextSelected = togglePage(current, next)
          return nextSelected.length > 0 ? nextSelected : [next]
        })
        return
      }
      if (mode === 'range') {
        setSelected(pageRange(anchor, next))
        return
      }
      setSelected([next])
      setAnchor(next)
    },
    [doc, anchor],
  )

  const deleteSelected = useCallback(async (): Promise<void> => {
    if (!doc) {
      return
    }
    const doomed = targets
    const currentPage = page
    await run((bytes) => deletePages(bytes, doomed), (remaining) => {
      const nextIndex = nextPageAfterDelete(currentPage, doomed, remaining)
      setPage(nextIndex)
      setSelected([nextIndex])
      setAnchor(nextIndex)
    })
  }, [doc, page, run, targets])

  useEffect(() => {
    function onKey(event: KeyboardEvent): void {
      if (!doc || busy) {
        return
      }
      const target = event.target
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goToPage(Math.max(0, page - 1), 'replace')
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        goToPage(Math.min(doc.pageCount - 1, page + 1), 'replace')
      } else if (event.key === 'r' || event.key === 'R') {
        event.preventDefault()
        void run((bytes) => rotatePages(bytes, targets))
      } else if (event.key === 'Delete') {
        event.preventDefault()
        void deleteSelected()
      } else if (event.altKey && event.key === 'ArrowUp') {
        event.preventDefault()
        if (page > 0) {
          void run((bytes) => movePage(bytes, page, page - 1)).then(() =>
            goToPage(Math.max(0, page - 1), 'replace'),
          )
        }
      } else if (event.altKey && event.key === 'ArrowDown') {
        event.preventDefault()
        if (page < doc.pageCount - 1) {
          void run((bytes) => movePage(bytes, page, page + 1)).then(() =>
            goToPage(Math.min(doc.pageCount - 1, page + 1), 'replace'),
          )
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [doc, busy, page, run, targets, goToPage, deleteSelected])

  async function onUpload(file: File | undefined): Promise<void> {
    if (!file) {
      return
    }
    setError(null)
    setMergePending(null)
    try {
      const bytes = await readPdfFile(file)
      await setDocument(file.name, bytes)
      setPage(0)
      setSelected([0])
      setAnchor(0)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không đọc được tệp.')
    }
  }

  async function onMergePick(file: File | undefined): Promise<void> {
    if (!file) {
      return
    }
    setError(null)
    try {
      const bytes = await readPdfFile(file)
      const pages = await pageCount(bytes)
      setMergePending({ name: file.name, bytes, pages })
    } catch (cause) {
      setMergePending(null)
      setError(cause instanceof Error ? cause.message : 'Không gộp được.')
    }
  }

  async function confirmMerge(): Promise<void> {
    if (!doc || !mergePending) {
      return
    }
    const at = mergeInsertIndex(doc.pageCount, page, mergeWhere)
    await run((bytes) => mergePdf(bytes, mergePending.bytes, at))
    goToPage(at, 'replace')
    setMergePending(null)
  }

  function onPreviewClick(event: React.MouseEvent<HTMLCanvasElement>): void {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) {
      return
    }
    const xRatio = clamp01((event.clientX - rect.left) / rect.width)
    const yRatio = clamp01((event.clientY - rect.top) / rect.height)
    setOverlayPos({ xRatio, yRatio })
  }

  function onThumbSelect(index: number, event: React.MouseEvent<HTMLButtonElement>): void {
    if (event.shiftKey) {
      goToPage(index, 'range')
    } else if (event.metaKey || event.ctrlKey) {
      goToPage(index, 'toggle')
    } else {
      goToPage(index, 'replace')
    }
  }

  return (
    <main id="main" className="page editor-page">
      <header className="page-head">
        <h1>Chỉnh sửa PDF</h1>
        <p>Xoay, xóa, đổi thứ tự, gộp tệp và chèn chữ, rồi tải PDF mới.</p>
      </header>

      <label className="file-btn">
        Tải PDF
        <input
          type="file"
          accept="application/pdf,.pdf"
          aria-label="Tải tệp PDF để chỉnh sửa"
          onChange={(event) => void onUpload(event.target.files?.[0])}
        />
      </label>

      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}

      {!doc ? (
        <p className="empty">Chưa có tài liệu. Hãy tải một tệp PDF.</p>
      ) : (
        <section className="editor-grid">
          <PageThumbs
            bytes={doc.bytes}
            pageCount={doc.pageCount}
            current={page}
            selected={selected}
            disabled={busy}
            onSelect={onThumbSelect}
          />
          <div className="preview-card">
            <p className="meta" aria-live="polite">
              {doc.name} · {doc.pageCount} trang · đang xem trang {page + 1}
              {targets.length > 1 ? ` · đã chọn ${targets.length} trang` : ''}
            </p>
            <div className="preview-wrap">
              <canvas
                ref={canvasRef}
                className="preview"
                onClick={onPreviewClick}
                aria-label={`Xem trước trang ${page + 1}. Nhấn để chọn vị trí chữ chèn.`}
              />
              <span
                className="overlay-mark"
                style={{ left: `${overlayPos.xRatio * 100}%`, top: `${overlayPos.yRatio * 100}%` }}
                aria-hidden="true"
              />
            </div>
            <p className="kbd-hint">
              Nhấn thumbnail để xem trang. Ctrl/Cmd chọn thêm, Shift chọn dải. Phím: ← →, R xoay
              các trang đã chọn, Delete xóa, Alt+↑↓ sắp xếp.
            </p>
          </div>
          <div className="tools" role="toolbar" aria-label="Công cụ chỉnh PDF">
            <div className="tool-row">
              <button
                type="button"
                disabled={busy || page === 0}
                aria-keyshortcuts="ArrowLeft"
                onClick={() => goToPage(page - 1, 'replace')}
              >
                Trang trước
              </button>
              <button
                type="button"
                disabled={busy || page >= doc.pageCount - 1}
                aria-keyshortcuts="ArrowRight"
                onClick={() => goToPage(page + 1, 'replace')}
              >
                Trang sau
              </button>
            </div>
            <div className="tool-row">
              <button type="button" disabled={busy} onClick={() => setSelected(pageRange(0, doc.pageCount - 1))}>
                Chọn tất cả
              </button>
              <button type="button" disabled={busy} onClick={() => goToPage(page, 'replace')}>
                Bỏ chọn
              </button>
            </div>
            <div className="tool-row">
              <button
                type="button"
                disabled={busy}
                aria-keyshortcuts="R"
                onClick={() => void run((bytes) => rotatePages(bytes, targets))}
              >
                Xoay {targets.length > 1 ? `${targets.length} trang` : '90°'}
              </button>
              <button
                type="button"
                disabled={busy}
                aria-keyshortcuts="Delete"
                onClick={() => void deleteSelected()}
              >
                Xóa {targets.length > 1 ? `${targets.length} trang` : 'trang'}
              </button>
            </div>
            <div className="tool-row">
              <button
                type="button"
                disabled={busy || page === 0}
                aria-keyshortcuts="Alt+ArrowUp"
                onClick={() =>
                  void run((bytes) => movePage(bytes, page, page - 1)).then(() =>
                    goToPage(Math.max(0, page - 1), 'replace'),
                  )
                }
              >
                Đưa lên
              </button>
              <button
                type="button"
                disabled={busy || page >= doc.pageCount - 1}
                aria-keyshortcuts="Alt+ArrowDown"
                onClick={() =>
                  void run((bytes) => movePage(bytes, page, page + 1)).then(() =>
                    goToPage(Math.min(doc.pageCount - 1, page + 1), 'replace'),
                  )
                }
              >
                Đưa xuống
              </button>
            </div>
            <label className="file-btn secondary-file">
              Chọn PDF để gộp
              <input
                type="file"
                accept="application/pdf,.pdf"
                aria-label="Chọn PDF khác để gộp"
                onChange={(event) => {
                  void onMergePick(event.target.files?.[0])
                  event.target.value = ''
                }}
              />
            </label>
            {mergePending ? (
              <div className="merge-card">
                <p className="meta">
                  {mergePending.name} · {mergePending.pages} trang sẽ được chèn
                </p>
                <fieldset className="merge-where">
                  <legend>Vị trí gộp</legend>
                  {(
                    [
                      ['start', 'Đầu tài liệu'],
                      ['after', 'Sau trang hiện tại'],
                      ['end', 'Cuối tài liệu'],
                    ] as const
                  ).map(([id, label]) => (
                    <label key={id}>
                      <input
                        type="radio"
                        name="merge-where"
                        checked={mergeWhere === id}
                        onChange={() => setMergeWhere(id)}
                      />
                      {label}
                    </label>
                  ))}
                </fieldset>
                <div className="tool-row">
                  <button type="button" className="primary" disabled={busy} onClick={() => void confirmMerge()}>
                    Gộp vào đây
                  </button>
                  <button type="button" disabled={busy} onClick={() => setMergePending(null)}>
                    Hủy
                  </button>
                </div>
              </div>
            ) : null}
            <label className="overlay-field">
              Chữ chèn
              <input
                value={overlay}
                onChange={(event) => setOverlay(event.target.value)}
                aria-label="Nội dung chữ chèn"
              />
            </label>
            <div className="preset-row" role="group" aria-label="Vị trí chữ chèn">
              {PRESET_LABELS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={
                    overlayPos.xRatio === OVERLAY_PRESETS[item.id].xRatio &&
                    overlayPos.yRatio === OVERLAY_PRESETS[item.id].yRatio
                      ? 'picked'
                      : undefined
                  }
                  onClick={() => setOverlayPos(OVERLAY_PRESETS[item.id])}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => void run((bytes) => addTextOverlay(bytes, page, overlay, overlayPos))}
            >
              Chèn vào vị trí đã chọn
            </button>
            <button
              type="button"
              className="primary"
              disabled={busy}
              onClick={() => downloadBlob(bytesToBlob(doc.bytes, 'application/pdf'), doc.name)}
            >
              Tải xuống PDF
            </button>
          </div>
        </section>
      )}
    </main>
  )
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}
