import { useEffect, useRef, useState } from 'react'
import { renderPageToCanvas } from '../lib/extract.ts'
import {
  addTextOverlay,
  deletePages,
  mergePdf,
  movePage,
  rotatePages,
} from '../lib/pdf.ts'
import { readPdfFile } from '../lib/limits.ts'
import { bytesToBlob, downloadBlob, setDocument, updateBytes } from '../lib/document-store.ts'
import { useDocument } from '../use-document.ts'

export function Editor() {
  const doc = useDocument()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [page, setPage] = useState(0)
  const [overlay, setOverlay] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

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

  async function onUpload(file: File | undefined): Promise<void> {
    if (!file) {
      return
    }
    setError(null)
    try {
      const bytes = await readPdfFile(file)
      await setDocument(file.name, bytes)
      setPage(0)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không đọc được tệp.')
    }
  }

  async function run(mutate: (bytes: Uint8Array) => Promise<Uint8Array>): Promise<void> {
    if (!doc) {
      return
    }
    setBusy(true)
    setError(null)
    try {
      const next = await mutate(doc.bytes)
      const updated = await updateBytes(next)
      setPage((current) => Math.min(current, updated.pageCount - 1))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Thao tác PDF thất bại.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="page editor-page">
      <header className="page-head">
        <h1>Chỉnh sửa PDF</h1>
        <p>Xoay, xóa, đổi thứ tự, gộp tệp và chèn chữ, rồi tải PDF mới.</p>
      </header>

      <label className="file-btn">
        Tải PDF
        <input
          type="file"
          accept="application/pdf,.pdf"
          onChange={(event) => void onUpload(event.target.files?.[0])}
        />
      </label>

      {error ? <p className="error" role="alert">{error}</p> : null}

      {!doc ? (
        <p className="empty">Chưa có tài liệu. Hãy tải một tệp PDF.</p>
      ) : (
        <section className="editor-grid">
          <div className="preview-card">
            <p className="meta">
              {doc.name} · {doc.pageCount} trang · đang xem trang {page + 1}
            </p>
            <canvas ref={canvasRef} className="preview" />
          </div>
          <div className="tools">
            <div className="tool-row">
              <button type="button" disabled={busy || page === 0} onClick={() => setPage(page - 1)}>
                Trang trước
              </button>
              <button
                type="button"
                disabled={busy || page >= doc.pageCount - 1}
                onClick={() => setPage(page + 1)}
              >
                Trang sau
              </button>
            </div>
            <div className="tool-row">
              <button type="button" disabled={busy} onClick={() => void run((bytes) => rotatePages(bytes, [page]))}>
                Xoay 90°
              </button>
              <button type="button" disabled={busy} onClick={() => void run((bytes) => deletePages(bytes, [page]))}>
                Xóa trang
              </button>
            </div>
            <div className="tool-row">
              <button
                type="button"
                disabled={busy || page === 0}
                onClick={() => void run((bytes) => movePage(bytes, page, page - 1)).then(() => setPage((p) => Math.max(0, p - 1)))}
              >
                Đưa lên
              </button>
              <button
                type="button"
                disabled={busy || page >= doc.pageCount - 1}
                onClick={() =>
                  void run((bytes) => movePage(bytes, page, page + 1)).then(() =>
                    setPage((p) => Math.min(doc.pageCount - 1, p + 1)),
                  )
                }
              >
                Đưa xuống
              </button>
            </div>
            <label className="file-btn secondary-file">
              Gộp PDF khác
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (!file) {
                    return
                  }
                  void readPdfFile(file)
                    .then((extra) => run((bytes) => mergePdf(bytes, extra)))
                    .catch((cause) => setError(cause instanceof Error ? cause.message : 'Không gộp được.'))
                  event.target.value = ''
                }}
              />
            </label>
            <label className="overlay-field">
              Chữ chèn
              <input value={overlay} onChange={(event) => setOverlay(event.target.value)} />
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => void run((bytes) => addTextOverlay(bytes, page, overlay))}
            >
              Chèn vào trang hiện tại
            </button>
            <button
              type="button"
              className="primary"
              disabled={busy}
              onClick={() =>
                downloadBlob(bytesToBlob(doc.bytes, 'application/pdf'), doc.name)
              }
            >
              Tải xuống PDF
            </button>
          </div>
        </section>
      )}
    </main>
  )
}
