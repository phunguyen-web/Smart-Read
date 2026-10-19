import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { renderPageToCanvas } from '../lib/extract.ts'
import {
  OVERLAY_PRESETS,
  addTextOverlay,
  deletePages,
  isIdentityOrder,
  mergeInsertIndex,
  mergePdf,
  movePages,
  pageCount,
  reorderPageBlock,
  rotatePages,
  type MergeWhere,
  type OverlayPosition,
  type OverlayPresetId,
} from '../lib/pdf.ts'
import { readPdfFile } from '../lib/limits.ts'
import { popSnapshot, pushSnapshot, snapshotOf, type EditorSnapshot } from '../lib/history.ts'
import { clearEditorView, restoreEditorView, saveEditorView } from '../lib/persist.ts'
import {
  blockNudgeDropTo,
  movingIndexesForDrag,
  nextPageAfterDelete,
  pageRange,
  togglePage,
} from '../lib/selection.ts'
import { bytesToBlob, downloadBlob, getDocument, setDocument, updateBytes } from '../lib/document-store.ts'
import { useDocument } from '../use-document.ts'
import { PageThumbs } from './PageThumbs.tsx'

const PRESET_LABELS: { id: OverlayPresetId; label: string }[] = [
  { id: 'top-left', label: 'Trên trái' },
  { id: 'top-center', label: 'Trên giữa' },
  { id: 'center', label: 'Giữa' },
  { id: 'bottom-left', label: 'Dưới trái' },
]

function initialEditorView() {
  const current = getDocument()
  return current ? restoreEditorView(current.pageCount) : { page: 0, selected: [0], anchor: 0 }
}

export function Editor() {
  const doc = useDocument()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const started = useMemo(() => initialEditorView(), [])
  const [page, setPage] = useState(started.page)
  const [selected, setSelected] = useState<number[]>(started.selected)
  const [anchor, setAnchor] = useState(started.anchor)
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
  const [past, setPast] = useState<EditorSnapshot[]>([])
  const [future, setFuture] = useState<EditorSnapshot[]>([])

  const targets = useMemo(
    () => (selected.length > 0 ? selected : [page]),
    [selected, page],
  )

  const restore = useCallback((snapshot: EditorSnapshot): void => {
    setPage(snapshot.page)
    setSelected(snapshot.selected)
    setAnchor(snapshot.anchor)
  }, [])

  const run = useCallback(
    async (
      mutate: (bytes: Uint8Array) => Promise<Uint8Array>,
      after?: (pageCount: number) => void,
    ): Promise<void> => {
      if (!doc) {
        return
      }
      const before = snapshotOf(doc.bytes, page, selected, anchor)
      setBusy(true)
      setError(null)
      try {
        const next = await mutate(doc.bytes)
        const updated = await updateBytes(next)
        setPast((stack) => pushSnapshot(stack, before))
        setFuture([])
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
    [doc, page, selected, anchor],
  )

  const undo = useCallback(async (): Promise<void> => {
    if (!doc) {
      return
    }
    const popped = popSnapshot(past)
    if (!popped) {
      return
    }
    const current = snapshotOf(doc.bytes, page, selected, anchor)
    setBusy(true)
    setError(null)
    try {
      await updateBytes(popped.snapshot.bytes)
      setPast(popped.rest)
      setFuture((stack) => pushSnapshot(stack, current))
      restore(popped.snapshot)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không hoàn tác được.')
    } finally {
      setBusy(false)
    }
  }, [doc, past, page, selected, anchor, restore])

  const redo = useCallback(async (): Promise<void> => {
    if (!doc) {
      return
    }
    const popped = popSnapshot(future)
    if (!popped) {
      return
    }
    const current = snapshotOf(doc.bytes, page, selected, anchor)
    setBusy(true)
    setError(null)
    try {
      await updateBytes(popped.snapshot.bytes)
      setFuture(popped.rest)
      setPast((stack) => pushSnapshot(stack, current))
      restore(popped.snapshot)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không làm lại được.')
    } finally {
      setBusy(false)
    }
  }, [doc, future, page, selected, anchor, restore])

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

  useEffect(() => {
    if (!doc) {
      return
    }
    saveEditorView({ page, selected, anchor })
  }, [doc, page, selected, anchor])

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

  const applyReorder = useCallback(
    (fromIndexes: readonly number[], dropTo: number, focusFrom?: number): void => {
      if (!doc) {
        return
      }
      const { order, moved } = reorderPageBlock(doc.pageCount, fromIndexes, dropTo)
      if (isIdentityOrder(order) || moved.length === 0) {
        return
      }
      const focusAt =
        focusFrom == null ? 0 : Math.max(0, fromIndexes.findIndex((index) => index === focusFrom))
      void run((bytes) => movePages(bytes, fromIndexes, dropTo), () => {
        const nextPage = moved[focusAt] ?? moved[0]!
        setPage(nextPage)
        setSelected(moved)
        setAnchor(moved[0]!)
      })
    },
    [doc, run],
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
        const dropTo = blockNudgeDropTo(targets, -1, doc.pageCount)
        if (dropTo != null) {
          applyReorder(targets, dropTo, page)
        }
      } else if (event.altKey && event.key === 'ArrowDown') {
        event.preventDefault()
        const dropTo = blockNudgeDropTo(targets, 1, doc.pageCount)
        if (dropTo != null) {
          applyReorder(targets, dropTo, page)
        }
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) {
          void redo()
        } else {
          void undo()
        }
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault()
        void redo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [doc, busy, page, run, targets, goToPage, deleteSelected, undo, redo, applyReorder])

  async function onUpload(file: File | undefined): Promise<void> {
    if (!file) {
      return
    }
    setError(null)
    setMergePending(null)
    try {
      const bytes = await readPdfFile(file)
      await setDocument(file.name, bytes)
      clearEditorView()
      setPage(0)
      setSelected([0])
      setAnchor(0)
      setPast([])
      setFuture([])
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
        <p>
          Xoay, xóa, kéo một hoặc nhiều thumbnail để đổi thứ tự, hoàn tác, gộp tệp và chèn chữ, rồi
          tải PDF mới. Tệp gần nhất được giữ trên trình duyệt này khi tải lại trang.
        </p>
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
            onReorder={(from, to) => {
              applyReorder(movingIndexesForDrag(selected, from), to, from)
            }}
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
              Nhấn thumbnail để xem trang, kéo để đổi thứ tự — các trang đã chọn đi cùng nhau.
              Ctrl/Cmd chọn thêm, Shift chọn dải. Phím: ← →, R xoay các trang đã chọn, Delete xóa,
              Alt+↑↓ dời nhóm, Ctrl+Z hoàn tác, Ctrl+Y làm lại.
            </p>
          </div>
          <div className="tools" role="toolbar" aria-label="Công cụ chỉnh PDF">
            <div className="tool-row">
              <button
                type="button"
                disabled={busy || past.length === 0}
                aria-keyshortcuts="Control+Z"
                onClick={() => void undo()}
              >
                Hoàn tác
              </button>
              <button
                type="button"
                disabled={busy || future.length === 0}
                aria-keyshortcuts="Control+Y Control+Shift+Z"
                onClick={() => void redo()}
              >
                Làm lại
              </button>
            </div>
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
                disabled={busy || blockNudgeDropTo(targets, -1, doc.pageCount) == null}
                aria-keyshortcuts="Alt+ArrowUp"
                onClick={() => {
                  const dropTo = blockNudgeDropTo(targets, -1, doc.pageCount)
                  if (dropTo != null) {
                    applyReorder(targets, dropTo, page)
                  }
                }}
              >
                Đưa lên
              </button>
              <button
                type="button"
                disabled={busy || blockNudgeDropTo(targets, 1, doc.pageCount) == null}
                aria-keyshortcuts="Alt+ArrowDown"
                onClick={() => {
                  const dropTo = blockNudgeDropTo(targets, 1, doc.pageCount)
                  if (dropTo != null) {
                    applyReorder(targets, dropTo, page)
                  }
                }}
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
