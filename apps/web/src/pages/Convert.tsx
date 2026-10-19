import { useEffect, useState } from 'react'
import {
  extensionFor,
  mimeFor,
  toDocx,
  toEpub,
  toHtml,
  toTxt,
  type ExportFormat,
} from '../lib/convert.ts'
import { extractPageTexts } from '../lib/extract.ts'
import { convertEpubToMobi, getMobiStatus } from '../lib/mobi.ts'
import { readPdfFile, swapExtension } from '../lib/limits.ts'
import { downloadBlob, setDocument } from '../lib/document-store.ts'
import { useDocument } from '../use-document.ts'

const FORMATS: { id: ExportFormat; label: string; hint: string }[] = [
  { id: 'txt', label: 'TXT', hint: 'Văn bản thuần' },
  { id: 'html', label: 'HTML', hint: 'Trang web' },
  { id: 'docx', label: 'DOCX', hint: 'Microsoft Word' },
  { id: 'doc', label: 'DOC', hint: 'Word (cùng nội dung DOCX)' },
  { id: 'epub', label: 'EPUB', hint: 'Sách điện tử, có mục lục' },
  { id: 'mobi', label: 'MOBI', hint: 'Kindle — cần Calibre ebook-convert' },
]

export function Convert() {
  const doc = useDocument()
  const [format, setFormat] = useState<ExportFormat>('docx')
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [calibre, setCalibre] = useState(false)

  useEffect(() => {
    let cancelled = false
    void getMobiStatus().then((status) => {
      if (!cancelled) {
        setCalibre(status.available)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  async function onUpload(file: File | undefined): Promise<void> {
    if (!file) {
      return
    }
    setError(null)
    try {
      const bytes = await readPdfFile(file)
      await setDocument(file.name, bytes)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không đọc được tệp.')
    }
  }

  async function convert(): Promise<void> {
    if (!doc) {
      setError('Hãy tải một tệp PDF trước.')
      return
    }
    setBusy(true)
    setError(null)
    setNote(null)
    try {
      const pages = await extractPageTexts(doc.bytes)
      const title = doc.name.replace(/\.pdf$/i, '')
      if (format === 'txt') {
        downloadBlob(
          new Blob([toTxt(pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'html') {
        downloadBlob(
          new Blob([toHtml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'docx' || format === 'doc') {
        const blob = await toDocx(title, pages)
        downloadBlob(blob, swapExtension(doc.name, extensionFor(format)))
      } else {
        const epub = await toEpub(title, pages)
        if (format === 'epub') {
          downloadBlob(epub, swapExtension(doc.name, 'epub'))
        } else {
          const mobi = await convertEpubToMobi(epub)
          if (mobi) {
            downloadBlob(mobi, swapExtension(doc.name, 'mobi'))
            setNote('Đã chuyển MOBI bằng Calibre ebook-convert trên máy này.')
          } else {
            downloadBlob(epub, swapExtension(doc.name, 'epub'))
            setNote(
              'Không có Calibre ebook-convert. Đã tải EPUB; cài Calibre rồi chạy lại để ra MOBI.',
            )
          }
        }
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Chuyển đổi thất bại.')
    } finally {
      setBusy(false)
    }
  }

  const formats = FORMATS.map((item) =>
    item.id === 'mobi'
      ? {
          ...item,
          hint: calibre
            ? 'Kindle — Calibre sẵn sàng trên máy này'
            : 'Kindle — EPUB nếu chưa có Calibre',
        }
      : item,
  )

  return (
    <main id="main" className="page convert-page">
      <header className="page-head">
        <h1>Chuyển đổi định dạng</h1>
        <p>Trích chữ từ PDF rồi xuất TXT, HTML, DOCX/DOC, EPUB hoặc MOBI.</p>
      </header>

      <label className="file-btn">
        Tải PDF
        <input
          type="file"
          accept="application/pdf,.pdf"
          aria-label="Tải tệp PDF để chuyển đổi"
          onChange={(event) => void onUpload(event.target.files?.[0])}
        />
      </label>

      {doc ? (
        <p className="meta">
          {doc.name} · {doc.pageCount} trang
        </p>
      ) : (
        <p className="empty">Chưa có tài liệu.</p>
      )}
      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}
      {note ? <p className="note">{note}</p> : null}

      <fieldset className="formats">
        <legend>Định dạng đầu ra</legend>
        {formats.map((item) => (
          <label key={item.id} className={format === item.id ? 'picked' : undefined}>
            <input
              type="radio"
              name="format"
              value={item.id}
              checked={format === item.id}
              onChange={() => setFormat(item.id)}
            />
            <span>
              <strong>{item.label}</strong>
              <em>{item.hint}</em>
            </span>
          </label>
        ))}
      </fieldset>

      <button type="button" className="primary" disabled={busy || !doc} onClick={() => void convert()}>
        {busy ? 'Đang chuyển…' : 'Tải tệp đã chuyển'}
      </button>
    </main>
  )
}
