import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  blankPageIndexes,
  extractPageTexts,
  findPagesWithText,
  grayscalePagePngs,
  renderPageToCanvas,
  repeatedPageIndexes,
} from '../lib/extract.ts'
import {
  CROP_MARGINS,
  OVERLAY_PRESETS,
  addPageNumbers,
  addTextOverlay,
  addWatermark,
  applyPageOrder,
  cropPages,
  deinterleaveOddEvenOrder,
  deletePages,
  duplicatePages,
  duplicatedIndexes,
  extractPages,
  fitPagesToA4,
  imagesToPdf,
  insertBlankPage,
  insertImages,
  interleaveHalvesOrder,
  isIdentityOrder,
  keepPages,
  mergeInsertIndex,
  mergePdf,
  movePages,
  pageCount,
  readMetadata,
  remapAfterOrder,
  reorderPageBlock,
  replacePagesWithPngs,
  reversePages,
  reversedIndexes,
  rotatePages,
  rotatePagesBy,
  setMetadata,
  splitEvery,
  type CropMarginId,
  type MergeWhere,
  type OverlayPosition,
  type OverlayPresetId,
  type PageNumberPosition,
  type PageNumberStyle,
  type WatermarkStyle,
} from '../lib/pdf.ts'
import { zipPdfParts } from '../lib/convert.ts'
import {
  ACCEPT_SOURCES,
  extractedPdfName,
  readImageFiles,
  readPdfFile,
  readSourceFile,
  splitPartName,
  splitZipName,
  swapExtension,
} from '../lib/limits.ts'
import { pdfFromLoadedSource } from '../lib/open-source.ts'
import { popSnapshot, pushSnapshot, snapshotOf, type EditorSnapshot } from '../lib/history.ts'
import {
  clearEditorView,
  forgetHistory,
  getHydratedHistory,
  persistHistory,
  restoreEditorView,
  saveEditorView,
} from '../lib/persist.ts'
import {
  blockEdgeDropTo,
  blockNudgeDropTo,
  evenPageIndexes,
  invertPageIndexes,
  movingIndexesForDrag,
  nextPageAfterDelete,
  oddPageIndexes,
  pageRange,
  parseGotoPage,
  parseSplitSize,
  togglePage,
} from '../lib/selection.ts'
import {
  bytesToBlob,
  clearDocument,
  downloadBlob,
  getDocument,
  setDocument,
  updateBytes,
} from '../lib/document-store.ts'
import { useDocument } from '../use-document.ts'
import { PageThumbs } from './PageThumbs.tsx'

const PRESET_LABELS: { id: OverlayPresetId; label: string }[] = [
  { id: 'top-left', label: 'Trên trái' },
  { id: 'top-center', label: 'Trên giữa' },
  { id: 'center', label: 'Giữa' },
  { id: 'bottom-left', label: 'Dưới trái' },
]

const PAGE_NUMBER_POSITIONS: { id: PageNumberPosition; label: string }[] = [
  { id: 'bottom-center', label: 'Dưới giữa' },
  { id: 'bottom-right', label: 'Dưới phải' },
  { id: 'top-center', label: 'Trên giữa' },
]

const PAGE_NUMBER_STYLES: { id: PageNumberStyle; label: string }[] = [
  { id: 'n-of-total', label: '1 / N' },
  { id: 'n', label: '1' },
  { id: 'trang-n', label: 'Trang 1' },
]

const WATERMARK_STYLES: { id: WatermarkStyle; label: string }[] = [
  { id: 'diagonal', label: 'Chéo' },
  { id: 'footer', label: 'Chân trang' },
  { id: 'header', label: 'Đầu trang' },
]

const CROP_MARGIN_PRESETS: { id: CropMarginId; label: string }[] = [
  { id: 'narrow', label: 'Hẹp' },
  { id: 'medium', label: 'Vừa' },
  { id: 'wide', label: 'Rộng' },
]

function initialEditorView() {
  const current = getDocument()
  return current ? restoreEditorView(current.pageCount) : { page: 0, selected: [0], anchor: 0 }
}

export function Editor() {
  const doc = useDocument()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const gotoRef = useRef<HTMLInputElement>(null)
  const started = useMemo(() => initialEditorView(), [])
  const [page, setPage] = useState(started.page)
  const [selected, setSelected] = useState<number[]>(started.selected)
  const [anchor, setAnchor] = useState(started.anchor)
  const [overlay, setOverlay] = useState('')
  const [overlayPos, setOverlayPos] = useState<OverlayPosition>(OVERLAY_PRESETS['top-left'])
  const [numberPos, setNumberPos] = useState<PageNumberPosition>('bottom-center')
  const [numberStyle, setNumberStyle] = useState<PageNumberStyle>('n-of-total')
  const [watermark, setWatermark] = useState('')
  const [watermarkStyle, setWatermarkStyle] = useState<WatermarkStyle>('diagonal')
  const [cropMargin, setCropMargin] = useState<CropMarginId>('medium')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaAuthor, setMetaAuthor] = useState('')
  const [metaSubject, setMetaSubject] = useState('')
  const [mergePending, setMergePending] = useState<{
    name: string
    bytes: Uint8Array
    pages: number
  } | null>(null)
  const [mergeWhere, setMergeWhere] = useState<MergeWhere>('end')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const startedHistory = useMemo(() => getHydratedHistory(), [])
  const [past, setPast] = useState<EditorSnapshot[]>(startedHistory.past)
  const [future, setFuture] = useState<EditorSnapshot[]>(startedHistory.future)
  const docId = doc ? `${doc.name}:${doc.bytes.byteLength}:${doc.pageCount}` : ''
  const [splitRaw, setSplitRaw] = useState<{ id: string; value: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchRaw, setSearchRaw] = useState<{
    id: string
    hits: number[]
    at: number
    note: string | null
  } | null>(null)
  const [gotoRaw, setGotoRaw] = useState('')
  const searchHits = useMemo(
    () => (searchRaw?.id === docId ? searchRaw.hits : []),
    [searchRaw, docId],
  )
  const searchAt = searchRaw?.id === docId ? searchRaw.at : 0
  const searchNote = searchRaw?.id === docId ? searchRaw.note : null
  const splitValue = splitRaw?.id === docId ? splitRaw.value : doc ? String(Math.min(10, doc.pageCount)) : '1'
  const parsedSplit = doc ? parseSplitSize(splitValue, doc.pageCount) : null
  const splitError = parsedSplit && !parsedSplit.ok ? parsedSplit.message : null

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

  useEffect(() => {
    void persistHistory(past, future)
  }, [past, future])

  useEffect(() => {
    if (!doc) {
      return
    }
    const bytes = doc.bytes
    let cancelled = false
    void readMetadata(bytes)
      .then((meta) => {
        if (cancelled) {
          return
        }
        setMetaTitle(meta.title)
        setMetaAuthor(meta.author)
        setMetaSubject(meta.subject)
      })
      .catch(() => {
        if (!cancelled) {
          setMetaTitle('')
          setMetaAuthor('')
          setMetaSubject('')
        }
      })
    return () => {
      cancelled = true
    }
  }, [doc, docId])

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

  const jumpSearchHit = useCallback(
    (hits: number[], at: number): void => {
      if (!doc || hits.length === 0) {
        return
      }
      const index = ((at % hits.length) + hits.length) % hits.length
      setSearchRaw({
        id: `${doc.name}:${doc.bytes.byteLength}:${doc.pageCount}`,
        hits,
        at: index,
        note: `Trang ${hits[index]! + 1} · ${index + 1}/${hits.length} kết quả`,
      })
      goToPage(hits[index]!, 'replace')
    },
    [doc, goToPage],
  )

  const runSearch = useCallback(async (): Promise<void> => {
    if (!doc) {
      return
    }
    const query = searchQuery.trim()
    if (!query) {
      setSearchRaw({ id: docId, hits: [], at: 0, note: 'Nhập từ khóa để tìm.' })
      return
    }
    setBusy(true)
    setError(null)
    try {
      const hits = findPagesWithText(await extractPageTexts(doc.bytes), query)
      if (hits.length === 0) {
        setSearchRaw({ id: docId, hits: [], at: 0, note: 'Không tìm thấy trang chứa từ khóa.' })
        return
      }
      jumpSearchHit(hits, 0)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không tìm được chữ.')
    } finally {
      setBusy(false)
    }
  }, [doc, docId, searchQuery, jumpSearchHit])

  const applyGoto = useCallback((): void => {
    if (!doc) {
      return
    }
    const parsed = parseGotoPage(gotoRaw, doc.pageCount)
    if (!parsed.ok) {
      setError(parsed.message)
      return
    }
    setError(null)
    goToPage(parsed.index, 'replace')
  }, [doc, gotoRaw, goToPage])

  const removeBlankPages = useCallback(async (): Promise<void> => {
    if (!doc) {
      return
    }
    setBusy(true)
    setError(null)
    try {
      const blanks = blankPageIndexes(await extractPageTexts(doc.bytes))
      if (blanks.length === 0) {
        setError('Không có trang trống (theo chữ trích được) để xóa.')
        return
      }
      if (blanks.length >= doc.pageCount) {
        setError('Mọi trang đều không có chữ (có thể là PDF ảnh). Không xóa hết tài liệu.')
        return
      }
      await run((bytes) => deletePages(bytes, blanks), () => {
        setPage(0)
        setSelected([0])
        setAnchor(0)
        setSearchRaw(null)
      })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không xóa được trang trống.')
    } finally {
      setBusy(false)
    }
  }, [doc, run])

  const removeDuplicatePages = useCallback(async (): Promise<void> => {
    if (!doc) {
      return
    }
    setBusy(true)
    setError(null)
    try {
      const dups = repeatedPageIndexes(await extractPageTexts(doc.bytes))
      if (dups.length === 0) {
        setError('Không có trang trùng chữ để xóa.')
        return
      }
      if (dups.length >= doc.pageCount) {
        setError('Không xóa hết tài liệu.')
        return
      }
      await run((bytes) => deletePages(bytes, dups), () => {
        setPage(0)
        setSelected([0])
        setAnchor(0)
        setSearchRaw(null)
      })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không xóa được trang trùng.')
    } finally {
      setBusy(false)
    }
  }, [doc, run])

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

  const applyOrder = useCallback(
    (order: number[]): void => {
      if (!doc || isIdentityOrder(order)) {
        return
      }
      const nextPage = order.indexOf(page)
      const nextSelected = remapAfterOrder(order, targets)
      const nextAnchor = order.indexOf(anchor)
      void run((bytes) => applyPageOrder(bytes, order), () => {
        const focused = nextPage >= 0 ? nextPage : 0
        setPage(focused)
        setSelected(nextSelected.length > 0 ? nextSelected : [focused])
        setAnchor(nextAnchor >= 0 ? nextAnchor : focused)
      })
    },
    [anchor, doc, page, run, targets],
  )

  const invertSelection = useCallback((): void => {
    if (!doc) {
      return
    }
    const inverted = invertPageIndexes(doc.pageCount, selected)
    if (inverted.length === 0) {
      goToPage(page, 'replace')
      return
    }
    setSelected(inverted)
    setPage(inverted.includes(page) ? page : inverted[0]!)
    setAnchor(inverted[0]!)
  }, [doc, goToPage, page, selected])

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
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
        event.preventDefault()
        searchRef.current?.focus()
        return
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'g') {
        event.preventDefault()
        gotoRef.current?.focus()
        return
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'i') {
        event.preventDefault()
        invertSelection()
        return
      }
      if (event.key === 'F3') {
        event.preventDefault()
        if (searchHits.length > 0) {
          jumpSearchHit(searchHits, searchAt + (event.shiftKey ? -1 : 1))
        }
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
        void run((bytes) =>
          event.shiftKey ? rotatePagesBy(bytes, targets, 180) : rotatePages(bytes, targets),
        )
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
  }, [
    doc,
    busy,
    page,
    run,
    targets,
    goToPage,
    deleteSelected,
    undo,
    redo,
    applyReorder,
    searchHits,
    searchAt,
    jumpSearchHit,
    invertSelection,
  ])

  async function onUpload(file: File | undefined): Promise<void> {
    if (!file) {
      return
    }
    setError(null)
    setMergePending(null)
    try {
      const next = await pdfFromLoadedSource(await readSourceFile(file))
      await forgetHistory()
      await setDocument(next.name, next.bytes)
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

  async function onInsertImages(files: FileList | null): Promise<void> {
    if (!files || files.length === 0) {
      return
    }
    setError(null)
    try {
      const images = await readImageFiles(files)
      const pages = images.map((image) => ({ bytes: image.bytes, kind: image.kind }))
      if (!doc) {
        await forgetHistory()
        await setDocument(swapExtension(images[0]!.name, 'pdf'), await imagesToPdf(pages))
        clearEditorView()
        setPage(0)
        setSelected(pages.map((_, index) => index))
        setAnchor(0)
        setPast([])
        setFuture([])
        return
      }
      const at = page + 1
      await run((bytes) => insertImages(bytes, pages, at), () => {
        setPage(at)
        setSelected(pages.map((_, index) => at + index))
        setAnchor(at)
      })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không chèn được ảnh.')
    }
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
          Xoay, đảo thứ tự, đan/tách trang lẻ-chẵn, đánh số trang, đóng chữ mờ, cắt lề, chuyển xám,
          tìm chữ, xóa trang không chữ hoặc trùng chữ, vừa khổ A4, đảo chọn, xóa, nhân bản, tách hoặc
          giữ trang đã chọn, tách thành nhiều PDF, chèn trang trắng hoặc ảnh PNG/JPEG, kéo thumbnail
          để đổi thứ tự, hoàn tác (giữ khi tải lại trang), gộp tệp, sửa thông tin tài liệu và chèn
          chữ, rồi tải PDF mới. Có thể mở TXT, Markdown, HTML, JSON, CSV, RTF, DOCX, ODT, FB2, EPUB
          hoặc PNG/JPEG để tạo PDF.
        </p>
      </header>

      <label className="file-btn">
        Tải PDF / chữ / ảnh
        <input
          type="file"
          accept={ACCEPT_SOURCES}
          aria-label="Tải tệp PDF, TXT, Markdown, HTML, JSON, CSV, RTF, DOCX, ODT, FB2, EPUB, PNG hoặc JPEG để chỉnh sửa"
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
              Ctrl/Cmd chọn thêm, Shift chọn dải. Phím: ← →, R xoay 90°, Shift+R xoay 180°, Delete
              xóa, Alt+↑↓ dời nhóm, Ctrl+Z hoàn tác, Ctrl+Y làm lại, Ctrl+F tìm chữ, Ctrl+G tới
              trang, Ctrl+I đảo chọn, F3 kết quả sau. Nhân bản chèn bản sao sau trang đã chọn cuối;
              tách trang tải một PDF mới; giữ lại chỉ các trang đã chọn; tách mỗi N trang thành ZIP;
              đan hai nửa (mặt trước rồi mặt sau) hoặc tách lẻ/chẵn; chữ mờ, cắt lề, chuyển xám, vừa
              A4 và xóa trùng chữ áp dụng cho trang đã chọn. Chèn PNG/JPEG thành trang mới; thông tin
              tiêu đề/tác giả lưu vào PDF.
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
            <fieldset className="search-pack">
              <legend>Tìm chữ / tới trang</legend>
              <label className="overlay-field">
                Tới trang
                <input
                  ref={gotoRef}
                  value={gotoRaw}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder={String(page + 1)}
                  aria-label="Tới số trang"
                  aria-keyshortcuts="Control+G"
                  onChange={(event) => setGotoRaw(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      applyGoto()
                    }
                  }}
                />
              </label>
              <button type="button" disabled={busy} onClick={applyGoto}>
                Tới trang
              </button>
              <label className="overlay-field">
                Từ khóa
                <input
                  ref={searchRef}
                  value={searchQuery}
                  aria-label="Từ khóa tìm trong PDF"
                  aria-keyshortcuts="Control+F"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      void runSearch()
                    }
                  }}
                />
              </label>
              {searchNote ? <p className="range-ok">{searchNote}</p> : null}
              <div className="tool-row">
                <button type="button" disabled={busy} onClick={() => void runSearch()}>
                  Tìm
                </button>
                <button
                  type="button"
                  disabled={busy || searchHits.length === 0}
                  aria-keyshortcuts="Shift+F3"
                  onClick={() => jumpSearchHit(searchHits, searchAt - 1)}
                >
                  Trước
                </button>
                <button
                  type="button"
                  disabled={busy || searchHits.length === 0}
                  aria-keyshortcuts="F3"
                  onClick={() => jumpSearchHit(searchHits, searchAt + 1)}
                >
                  Sau
                </button>
                <button
                  type="button"
                  disabled={busy || searchHits.length === 0}
                  onClick={() => {
                    setSelected(searchHits)
                    setPage(searchHits[0]!)
                    setAnchor(searchHits[0]!)
                  }}
                >
                  Chọn các trang khớp
                </button>
              </div>
            </fieldset>
            <div className="tool-row">
              <button type="button" disabled={busy} onClick={() => setSelected(pageRange(0, doc.pageCount - 1))}>
                Chọn tất cả
              </button>
              <button type="button" disabled={busy} onClick={() => goToPage(page, 'replace')}>
                Bỏ chọn
              </button>
              <button
                type="button"
                disabled={busy || oddPageIndexes(doc.pageCount).length === 0}
                onClick={() => {
                  const odd = oddPageIndexes(doc.pageCount)
                  if (odd.length === 0) {
                    return
                  }
                  setSelected(odd)
                  setPage(odd.includes(page) ? page : odd[0]!)
                  setAnchor(odd[0]!)
                }}
              >
                Chọn trang lẻ
              </button>
              <button
                type="button"
                disabled={busy || evenPageIndexes(doc.pageCount).length === 0}
                onClick={() => {
                  const even = evenPageIndexes(doc.pageCount)
                  if (even.length === 0) {
                    return
                  }
                  setSelected(even)
                  setPage(even.includes(page) ? page : even[0]!)
                  setAnchor(even[0]!)
                }}
              >
                Chọn trang chẵn
              </button>
              <button
                type="button"
                disabled={busy || doc.pageCount < 2}
                aria-keyshortcuts="Control+I"
                onClick={invertSelection}
              >
                Đảo chọn
              </button>
            </div>
            <div className="tool-row">
              <button
                type="button"
                disabled={busy}
                aria-keyshortcuts="R"
                onClick={() => void run((bytes) => rotatePages(bytes, targets))}
              >
                Xoay {targets.length > 1 ? `${targets.length} trang 90°` : '90°'}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void run((bytes) => rotatePagesBy(bytes, targets, -90))}
              >
                Xoay ngược
              </button>
              <button
                type="button"
                disabled={busy}
                aria-keyshortcuts="Shift+R"
                onClick={() => void run((bytes) => rotatePagesBy(bytes, targets, 180))}
              >
                Xoay 180°
              </button>
            </div>
            <div className="tool-row">
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
                disabled={busy}
                aria-label={
                  targets.length > 1
                    ? `Nhân bản ${targets.length} trang đã chọn`
                    : 'Nhân bản trang hiện tại'
                }
                onClick={() => {
                  const copies = duplicatedIndexes(targets)
                  void run((bytes) => duplicatePages(bytes, targets), () => {
                    if (copies.length === 0) {
                      return
                    }
                    setPage(copies[0]!)
                    setSelected(copies)
                    setAnchor(copies[0]!)
                  })
                }}
              >
                Nhân bản {targets.length > 1 ? `${targets.length} trang` : 'trang'}
              </button>
              <button
                type="button"
                disabled={busy}
                aria-label={
                  targets.length > 1
                    ? `Tách ${targets.length} trang đã chọn thành PDF mới`
                    : 'Tách trang hiện tại thành PDF mới'
                }
                onClick={() => {
                  void (async () => {
                    if (!doc) {
                      return
                    }
                    setBusy(true)
                    setError(null)
                    try {
                      const extracted = await extractPages(doc.bytes, targets)
                      downloadBlob(
                        bytesToBlob(extracted, 'application/pdf'),
                        extractedPdfName(doc.name, targets),
                      )
                    } catch (cause) {
                      setError(cause instanceof Error ? cause.message : 'Không tách được trang.')
                    } finally {
                      setBusy(false)
                    }
                  })()
                }}
              >
                Tách {targets.length > 1 ? `${targets.length} trang` : 'trang'} thành PDF
              </button>
              <button
                type="button"
                disabled={busy || targets.length === doc.pageCount}
                aria-label={
                  targets.length > 1
                    ? `Giữ lại ${targets.length} trang đã chọn`
                    : 'Giữ lại trang hiện tại'
                }
                onClick={() => {
                  const kept = targets
                  void run((bytes) => keepPages(bytes, kept), () => {
                    setPage(0)
                    setSelected(kept.map((_, index) => index))
                    setAnchor(0)
                  })
                }}
              >
                Giữ {targets.length > 1 ? `${targets.length} trang` : 'trang'} đã chọn
              </button>
            </div>
            <div className="tool-row">
              <button
                type="button"
                disabled={busy}
                aria-label="Chèn trang trắng sau trang hiện tại"
                onClick={() => {
                  const nextPage = page + 1
                  void run((bytes) => insertBlankPage(bytes, page), () => {
                    setPage(nextPage)
                    setSelected([nextPage])
                    setAnchor(nextPage)
                  })
                }}
              >
                Chèn trang trắng
              </button>
            </div>
            <fieldset className="split-pack">
              <legend>Tách thành nhiều PDF</legend>
              <label className="overlay-field">
                Mỗi tệp (trang)
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={splitValue}
                  aria-label="Số trang mỗi tệp khi tách"
                  aria-invalid={splitError ? true : undefined}
                  onChange={(event) => setSplitRaw({ id: docId, value: event.target.value })}
                />
              </label>
              {splitError ? (
                <p className="error" role="alert">
                  {splitError}
                </p>
              ) : (
                <p className="range-ok">
                  Sẽ tạo {parsedSplit && parsedSplit.ok ? Math.ceil(doc.pageCount / parsedSplit.size) : 1} tệp PDF trong ZIP.
                </p>
              )}
              <button
                type="button"
                disabled={busy || Boolean(splitError) || !parsedSplit || !parsedSplit.ok}
                onClick={() => {
                  void (async () => {
                    if (!doc || !parsedSplit || !parsedSplit.ok) {
                      return
                    }
                    setBusy(true)
                    setError(null)
                    try {
                      const parts = await splitEvery(doc.bytes, parsedSplit.size)
                      const blob = await zipPdfParts(
                        parts.map((bytes, index) => ({
                          name: splitPartName(doc.name, index + 1, parts.length),
                          bytes,
                        })),
                      )
                      downloadBlob(blob, splitZipName(doc.name))
                    } catch (cause) {
                      setError(cause instanceof Error ? cause.message : 'Không tách được thành nhiều PDF.')
                    } finally {
                      setBusy(false)
                    }
                  })()
                }}
              >
                Tải ZIP các phần
              </button>
            </fieldset>
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
              <button
                type="button"
                disabled={busy || blockEdgeDropTo(targets, 'start', doc.pageCount) == null}
                onClick={() => {
                  const dropTo = blockEdgeDropTo(targets, 'start', doc.pageCount)
                  if (dropTo != null) {
                    applyReorder(targets, dropTo, page)
                  }
                }}
              >
                Đưa lên đầu
              </button>
              <button
                type="button"
                disabled={busy || blockEdgeDropTo(targets, 'end', doc.pageCount) == null}
                onClick={() => {
                  const dropTo = blockEdgeDropTo(targets, 'end', doc.pageCount)
                  if (dropTo != null) {
                    applyReorder(targets, dropTo, page)
                  }
                }}
              >
                Đưa xuống cuối
              </button>
            </div>
            <div className="tool-row">
              <button
                type="button"
                disabled={busy || doc.pageCount < 2}
                onClick={() => {
                  const count = doc.pageCount
                  const nextPage = count - 1 - page
                  const nextSelected = reversedIndexes(count, targets)
                  const nextAnchor = count - 1 - anchor
                  void run((bytes) => reversePages(bytes), () => {
                    setPage(nextPage)
                    setSelected(nextSelected.length > 0 ? nextSelected : [nextPage])
                    setAnchor(Math.max(0, Math.min(count - 1, nextAnchor)))
                  })
                }}
              >
                Đảo thứ tự trang
              </button>
              <button
                type="button"
                disabled={busy || isIdentityOrder(interleaveHalvesOrder(doc.pageCount))}
                aria-label="Đan hai nửa trang (mặt trước rồi mặt sau)"
                onClick={() => applyOrder(interleaveHalvesOrder(doc.pageCount))}
              >
                Đan hai nửa
              </button>
              <button
                type="button"
                disabled={busy || isIdentityOrder(deinterleaveOddEvenOrder(doc.pageCount))}
                aria-label="Tách trang lẻ rồi trang chẵn"
                onClick={() => applyOrder(deinterleaveOddEvenOrder(doc.pageCount))}
              >
                Tách lẻ/chẵn
              </button>
            </div>
            <fieldset className="number-stamp">
              <legend>Đánh số trang</legend>
              <div className="preset-row" role="group" aria-label="Vị trí số trang">
                {PAGE_NUMBER_POSITIONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={numberPos === item.id ? 'picked' : undefined}
                    onClick={() => setNumberPos(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="preset-row" role="group" aria-label="Kiểu số trang">
                {PAGE_NUMBER_STYLES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={numberStyle === item.id ? 'picked' : undefined}
                    onClick={() => setNumberStyle(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void run((bytes) =>
                    addPageNumbers(bytes, {
                      indexes: targets,
                      position: numberPos,
                      style: numberStyle,
                    }),
                  )
                }
              >
                Đánh số {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
              </button>
            </fieldset>
            <fieldset className="watermark-pack">
              <legend>Chữ mờ</legend>
              <label className="overlay-field">
                Nội dung
                <input
                  value={watermark}
                  onChange={(event) => setWatermark(event.target.value)}
                  aria-label="Nội dung chữ mờ"
                />
              </label>
              <div className="preset-row" role="group" aria-label="Kiểu chữ mờ">
                {WATERMARK_STYLES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={watermarkStyle === item.id ? 'picked' : undefined}
                    onClick={() => setWatermarkStyle(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void run((bytes) =>
                    addWatermark(bytes, {
                      text: watermark,
                      indexes: targets,
                      style: watermarkStyle,
                    }),
                  )
                }
              >
                Đóng chữ mờ {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
              </button>
            </fieldset>
            <fieldset className="crop-pack">
              <legend>Cắt lề trang</legend>
              <div className="preset-row" role="group" aria-label="Độ rộng lề cắt">
                {CROP_MARGIN_PRESETS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={cropMargin === item.id ? 'picked' : undefined}
                    onClick={() => setCropMargin(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void run((bytes) => cropPages(bytes, targets, CROP_MARGINS[cropMargin]))
                }
              >
                Cắt lề {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
              </button>
            </fieldset>
            <div className="tool-row">
              <button
                type="button"
                disabled={busy}
                aria-label={
                  targets.length > 1
                    ? `Chuyển ${targets.length} trang đã chọn sang xám`
                    : 'Chuyển trang hiện tại sang xám'
                }
                onClick={() =>
                  void run(async (bytes) =>
                    replacePagesWithPngs(bytes, await grayscalePagePngs(bytes, targets)),
                  )
                }
              >
                Chuyển xám {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
              </button>
              <button
                type="button"
                disabled={busy}
                aria-label={
                  targets.length > 1
                    ? `Vừa khổ A4 cho ${targets.length} trang đã chọn`
                    : 'Vừa khổ A4 cho trang hiện tại'
                }
                onClick={() => void run((bytes) => fitPagesToA4(bytes, targets))}
              >
                Vừa A4 {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
              </button>
              <button
                type="button"
                disabled={busy || doc.pageCount < 2}
                aria-label="Xóa các trang không có chữ"
                onClick={() => void removeBlankPages()}
              >
                Xóa trang không chữ
              </button>
              <button
                type="button"
                disabled={busy || doc.pageCount < 2}
                aria-label="Xóa các trang trùng chữ với trang trước"
                onClick={() => void removeDuplicatePages()}
              >
                Xóa trang trùng chữ
              </button>
            </div>
            <label className="file-btn secondary-file">
              Chèn ảnh PNG/JPEG
              <input
                type="file"
                accept="image/png,.png,image/jpeg,.jpg,.jpeg"
                multiple
                aria-label="Chèn một hoặc nhiều ảnh PNG hoặc JPEG thành trang PDF"
                onChange={(event) => {
                  void onInsertImages(event.target.files)
                  event.target.value = ''
                }}
              />
            </label>
            <fieldset className="meta-pack">
              <legend>Thông tin tài liệu</legend>
              <label className="overlay-field">
                Tiêu đề
                <input
                  value={metaTitle}
                  onChange={(event) => setMetaTitle(event.target.value)}
                  aria-label="Tiêu đề PDF"
                />
              </label>
              <label className="overlay-field">
                Tác giả
                <input
                  value={metaAuthor}
                  onChange={(event) => setMetaAuthor(event.target.value)}
                  aria-label="Tác giả PDF"
                />
              </label>
              <label className="overlay-field">
                Chủ đề
                <input
                  value={metaSubject}
                  onChange={(event) => setMetaSubject(event.target.value)}
                  aria-label="Chủ đề PDF"
                />
              </label>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void run((bytes) =>
                    setMetadata(bytes, {
                      title: metaTitle,
                      author: metaAuthor,
                      subject: metaSubject,
                    }),
                  )
                }
              >
                Lưu thông tin
              </button>
            </fieldset>
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
            <button
              type="button"
              className="danger"
              disabled={busy}
              aria-label="Xóa tài liệu khỏi bộ nhớ trình duyệt này"
              onClick={() => {
                void (async () => {
                  setBusy(true)
                  setError(null)
                  try {
                    await clearDocument()
                    await forgetHistory()
                    clearEditorView()
                    setPast([])
                    setFuture([])
                    setPage(0)
                    setSelected([0])
                    setAnchor(0)
                    setMergePending(null)
                  } catch (cause) {
                    setError(cause instanceof Error ? cause.message : 'Không xóa được tài liệu cục bộ.')
                  } finally {
                    setBusy(false)
                  }
                })()
              }}
            >
              Xóa khỏi trình duyệt
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
