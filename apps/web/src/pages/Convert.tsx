import { useEffect, useMemo, useState } from 'react'
import {
  extensionFor,
  isImageFormat,
  mimeFor,
  slicePageRange,
  slicePagesByIndexes,
  toCsv,
  toDocx,
  toEpub,
  toFb2,
  toHtml,
  toJson,
  toMarkdown,
  toOdt,
  toRtf,
  toTxt,
  zipPdfParts,
  type ExportFormat,
} from '../lib/convert.ts'
import { extractPageTexts, renderPageToBlob } from '../lib/extract.ts'
import { convertEpubToMobi, getMobiStatus } from '../lib/mobi.ts'
import {
  ACCEPT_SOURCES,
  imagePageName,
  imageZipName,
  readSourceFile,
  swapExtension,
} from '../lib/limits.ts'
import { importNoteFor, pdfFromLoadedSource } from '../lib/open-source.ts'
import { editorExportSelection, forgetHistory, formatPageList } from '../lib/persist.ts'
import { indexesFromPageRange, parsePageRange } from '../lib/selection.ts'
import { downloadBlob, setDocument } from '../lib/document-store.ts'
import { useDocument } from '../use-document.ts'

const FORMATS: { id: ExportFormat; label: string; hint: string }[] = [
  { id: 'txt', label: 'TXT', hint: 'Văn bản thuần' },
  { id: 'html', label: 'HTML', hint: 'Trang web' },
  { id: 'md', label: 'Markdown', hint: 'Tệp .md, một mục mỗi trang' },
  { id: 'rtf', label: 'RTF', hint: 'Rich Text, mở được trong Word' },
  { id: 'json', label: 'JSON', hint: 'Trang + chữ, cấu trúc' },
  { id: 'csv', label: 'CSV', hint: 'Bảng trang, chữ' },
  { id: 'docx', label: 'DOCX', hint: 'Microsoft Word' },
  { id: 'doc', label: 'DOC', hint: 'Word (cùng nội dung DOCX)' },
  { id: 'odt', label: 'ODT', hint: 'OpenDocument, LibreOffice' },
  { id: 'fb2', label: 'FB2', hint: 'FictionBook ebook' },
  { id: 'epub', label: 'EPUB', hint: 'Sách điện tử, có mục lục' },
  { id: 'mobi', label: 'MOBI', hint: 'Kindle — cần Calibre ebook-convert' },
  { id: 'png', label: 'PNG', hint: 'Ảnh từng trang (ZIP nếu nhiều)' },
  { id: 'jpg', label: 'JPEG', hint: 'Ảnh từng trang, nền trắng' },
]

export function Convert() {
  const doc = useDocument()
  const [format, setFormat] = useState<ExportFormat>('docx')
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [calibre, setCalibre] = useState(false)
  const docId = doc ? `${doc.name}:${doc.bytes.byteLength}:${doc.pageCount}` : ''
  const [range, setRange] = useState<{ id: string; fromPage: string; toPage: string } | null>(
    null,
  )
  const fromPage = range?.id === docId ? range.fromPage : '1'
  const toPage = range?.id === docId ? range.toPage : doc ? String(doc.pageCount) : ''
  const editorSelection = doc ? editorExportSelection(doc.pageCount) : null
  const [useEditorSelection, setUseEditorSelection] = useState(false)
  const exportFromSelection = Boolean(useEditorSelection && editorSelection)
  const parsedRange = useMemo(
    () => (doc ? parsePageRange(fromPage, toPage, doc.pageCount) : null),
    [doc, fromPage, toPage],
  )
  const rangeError =
    exportFromSelection || !parsedRange || parsedRange.ok ? null : parsedRange.message

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
    setNote(null)
    try {
      const source = await readSourceFile(file)
      const next = await pdfFromLoadedSource(source)
      await forgetHistory()
      const loaded = await setDocument(next.name, next.bytes)
      const note = importNoteFor(source, loaded.pageCount)
      if (note) {
        setNote(note)
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không đọc được tệp.')
    }
  }

  async function convert(): Promise<void> {
    if (!doc) {
      setError('Hãy tải một tệp PDF trước.')
      return
    }
    const parsed = parsePageRange(fromPage, toPage, doc.pageCount)
    if (!exportFromSelection && !parsed.ok) {
      setError(parsed.message)
      return
    }
    setBusy(true)
    setError(null)
    setNote(null)
    try {
      const indexes =
        exportFromSelection && editorSelection
          ? [...editorSelection].sort((a, b) => a - b)
          : parsed.ok
            ? indexesFromPageRange(parsed.fromPage, parsed.toPage)
            : []
      if (indexes.length === 0) {
        setError('Khoảng trang không có nội dung để xuất.')
        return
      }
      if (isImageFormat(format)) {
        const mime = mimeFor(format) as 'image/png' | 'image/jpeg'
        if (indexes.length === 1) {
          const blob = await renderPageToBlob(doc.bytes, indexes[0]! + 1, mime)
          downloadBlob(blob, imagePageName(doc.name, indexes[0]!, format))
          return
        }
        const parts = []
        for (const index of indexes) {
          const blob = await renderPageToBlob(doc.bytes, index + 1, mime)
          parts.push({
            name: imagePageName(doc.name, index, format),
            bytes: new Uint8Array(await blob.arrayBuffer()),
          })
        }
        downloadBlob(await zipPdfParts(parts), imageZipName(doc.name, format))
        return
      }
      const extracted = await extractPageTexts(doc.bytes)
      const pages = exportFromSelection && editorSelection
        ? slicePagesByIndexes(extracted, editorSelection)
        : parsed.ok
          ? slicePageRange(extracted, parsed.fromPage, parsed.toPage)
          : []
      if (pages.length === 0) {
        setError('Khoảng trang không có nội dung để xuất.')
        return
      }
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
      } else if (format === 'md') {
        downloadBlob(
          new Blob([toMarkdown(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'rtf') {
        downloadBlob(
          new Blob([toRtf(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'json') {
        downloadBlob(
          new Blob([toJson(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'csv') {
        downloadBlob(
          new Blob([toCsv(pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'docx' || format === 'doc') {
        const blob = await toDocx(title, pages)
        downloadBlob(blob, swapExtension(doc.name, extensionFor(format)))
      } else if (format === 'odt') {
        downloadBlob(await toOdt(title, pages), swapExtension(doc.name, 'odt'))
      } else if (format === 'fb2') {
        downloadBlob(
          new Blob([toFb2(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, 'fb2'),
        )
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
        <p>
          Trích chữ từ PDF rồi xuất TXT, HTML, Markdown, RTF, JSON, CSV, DOCX/DOC, ODT, FB2, EPUB
          hoặc MOBI; hoặc raster từng trang thành PNG/JPEG. Có thể mở TXT/Markdown/HTML/JSON/CSV,
          RTF, DOCX, ODT, FB2, EPUB hoặc PNG/JPEG để tạo PDF trước, rồi xuất tiếp. Có thể xuất đúng
          các trang đang chọn trên Chỉnh sửa, kể cả khi chúng không liền nhau.
        </p>
      </header>

      <label className="file-btn">
        Tải PDF / chữ / ảnh
        <input
          type="file"
          accept={ACCEPT_SOURCES}
          aria-label="Tải tệp PDF, TXT, Markdown, HTML, JSON, CSV, RTF, DOCX, ODT, FB2, EPUB, PNG hoặc JPEG để chuyển đổi"
          onChange={(event) => void onUpload(event.target.files?.[0])}
        />
      </label>

      {doc ? (
        <p className="meta">
          {doc.name} · {doc.pageCount} trang
        </p>
      ) : (
        <p className="empty">
          Chưa có tài liệu. Hãy tải PDF, TXT, Markdown, HTML, JSON, CSV, RTF, DOCX, ODT, FB2, EPUB, PNG hoặc JPEG để chọn khoảng trang và định dạng xuất.
        </p>
      )}
      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}
      {note ? <p className="note">{note}</p> : null}

      {doc ? (
        <div className="page-range" role="group" aria-label="Khoảng trang xuất">
          <label>
            Từ trang
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={fromPage}
              disabled={exportFromSelection}
              aria-label="Từ trang"
              aria-invalid={rangeError ? true : undefined}
              aria-describedby="range-help range-error"
              onChange={(event) =>
                setRange({
                  id: docId,
                  fromPage: event.target.value,
                  toPage,
                })
              }
            />
          </label>
          <label>
            Đến trang
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={toPage}
              disabled={exportFromSelection}
              aria-label="Đến trang"
              aria-invalid={rangeError ? true : undefined}
              aria-describedby="range-help range-error"
              onChange={(event) =>
                setRange({
                  id: docId,
                  fromPage,
                  toPage: event.target.value,
                })
              }
            />
          </label>
          <p id="range-help" className="range-help">
            Tài liệu có {doc.pageCount} trang. Để trống một ô sẽ không xuất được tệp.
          </p>
          {editorSelection ? (
            <label className="editor-pick">
              <input
                type="checkbox"
                checked={useEditorSelection}
                onChange={(event) => setUseEditorSelection(event.target.checked)}
              />
              Xuất các trang đã chọn trên Chỉnh sửa ({formatPageList(editorSelection)})
            </label>
          ) : null}
          {rangeError ? (
            <p id="range-error" className="error range-error" role="alert">
              {rangeError}
            </p>
          ) : (
            <p id="range-error" className="range-ok">
              {exportFromSelection && editorSelection
                ? `Sẽ xuất các trang ${formatPageList(editorSelection)}.`
                : `Sẽ xuất từ trang ${parsedRange && parsedRange.ok ? parsedRange.fromPage : 1} đến ${
                    parsedRange && parsedRange.ok ? parsedRange.toPage : doc.pageCount
                  }.`}
            </p>
          )}
        </div>
      ) : null}

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

      <button
        type="button"
        className="primary"
        disabled={busy || !doc || Boolean(rangeError)}
        onClick={() => void convert()}
      >
        {busy ? 'Đang chuyển…' : !doc ? 'Tải PDF trước khi chuyển' : 'Tải tệp đã chuyển'}
      </button>
    </main>
  )
}
