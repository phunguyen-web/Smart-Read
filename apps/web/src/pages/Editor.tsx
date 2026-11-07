import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  blankPageIndexes,
  contentBoundsFromRgba,
  extractPageTexts,
  findPagesWithText,
  grayscalePagePngs,
  pageRgba,
  rasterToPng,
  renderPageToCanvas,
  repeatedPageIndexes,
} from '../lib/extract.ts'
import {
  CROP_MARGINS,
  OVERLAY_PRESETS,
  PAPER_IDS,
  PAPER_LABELS,
  addCoverPage,
  addHeaderFooter,
  addCheckboxes,
  addFileAttachments,
  addLinkAnnotations,
  addStampAnnotations,
  addFreeTextAnnotations,
  addCaretAnnotations,
  addInkAnnotations,
  addSquareAnnotations,
  addCircleAnnotations,
  addPolygonAnnotations,
  addPolylineAnnotations,
  addLineAnnotations,
  addSquigglyAnnotations,
  addHighlightAnnotations,
  addUnderlineAnnotations,
  addStrikeoutAnnotations,
  addRedactAnnotations,
  addPopupAnnotations,
  addWatermarkAnnotations,
  addScreenAnnotations,
  addSoundAnnotations,
  addMovieAnnotations,
  addRichMediaAnnotations,
  addThreeDAnnotations,
  addPrinterMarkAnnotations,
  addTrapNetAnnotations,
  addProjectionAnnotations,
  addPageTransitions,
  flattenAnnotations,
  setOpenAction,
  setViewerPreferences,
  setOptionalContentGroups,
  setArticleThreads,
  setDocumentLanguage,
  languageTagFromOverlay,
  setMarkInfo,
  setXmpMetadata,
  setOutputIntents,
  setCollection,
  addSignatureFields,
  addRadioButtons,
  addDropdowns,
  addOptionLists,
  addStickyNotes,
  addTextFields,
  addNamedDest,
  addNamedDestsForSelection,
  clearNamedDests,
  duplicateNamedDest,
  addOutlineBookmarks,
  addOutlineFolder,
  bookletPreviewSheets,
  bookletSlotLabel,
  canIndentOutlineItem,
  canMoveOutlineItem,
  canOutdentOutlineItem,
  clearOutline,
  extractEmbeddedImages,
  extractFileAttachments,
  frontMatterPageCount,
  indentOutlineItem,
  listNamedDests,
  listOutlineBookmarks,
  parseNamedDestPageInput,
  parseNamedDestXyzInput,
  namedDestViewOf,
  namedDestXyzOf,
  namedDestXyzFromPaper,
  namedDestXyzFromPageSize,
  namedDestXyzFromZoomPreset,
  namedDestXyzFromAxisPreset,
  namedDestXyzAxisNeedsPageSize,
  namedDestXyzZoomNeedsPageSize,
  NAMED_DEST_VIEWS,
  NAMED_DEST_XYZ_EDGES,
  NAMED_DEST_XYZ_EDGE_LABELS,
  NAMED_DEST_XYZ_ZOOM_PRESETS,
  NAMED_DEST_XYZ_ZOOM_LABELS,
  NAMED_DEST_XYZ_AXIS_PRESETS,
  NAMED_DEST_XYZ_AXIS_LABELS,
  listPageSizes,
  renameNamedDest,
  removeNamedDest,
  setNamedDestPage,
  setNamedDestView,
  setNamedDestXyz,
  listPageLabels,
  moveOutlineItem,
  outlineIndexAfterIndent,
  outlineIndexAfterMove,
  outlineIndexAfterOutdent,
  outdentOutlineItem,
  outlineItemIsFolder,
  PAGE_LABEL_LABELS,
  PAGE_LABEL_STYLES,
  pageLabelsForCount,
  setFrontMatterPageLabels,
  setOutlineFolderOpen,
  setOutlineFoldersOpen,
  setPageLabels,
  visibleOutlineItems,
  addPageBorder,
  addPageNumbers,
  addTextOverlay,
  addWatermark,
  highlightPages,
  redactPages,
  REDACT_SIZE_IDS,
  REDACT_SIZE_LABELS,
  signPages,
  strikeoutPages,
  underlinePages,
  applyPageOrder,
  autoCropPages,
  cropPages,
  deinterleaveOddEvenOrder,
  deletePages,
  duplicatePages,
  duplicatedIndexes,
  extractPages,
  fitPagesToA4,
  fitPagesToPaper,
  flipPages,
  imagesToPdf,
  imposeBooklet,
  insertBlankPage,
  renameOutlineItem,
  removeOutlineItem,
  setOutlineDest,
  setOutlineNamedDest,
  insertImages,
  interleaveHalvesOrder,
  isIdentityOrder,
  keepOutlineItem,
  keepPages,
  mergeBookmarkTitle,
  mergeInsertIndex,
  mergePdf,
  mergePdfWithBookmark,
  movePages,
  nUpPages,
  orientPages,
  padPages,
  pageCount,
  readMetadata,
  remapAfterOrder,
  remapAfterSplitHalf,
  reorderPageBlock,
  replacePagesWithPngs,
  reversePages,
  reversedIndexes,
  rotatePages,
  rotatePagesBy,
  SCALE_PERCENTS,
  scalePages,
  setMetadata,
  splitByOutline,
  splitEvery,
  splitPagesInHalf,
  TINT_IDS,
  TINT_LABELS,
  tintPages,
  PAGE_BG_IDS,
  PAGE_BG_LABELS,
  colorPageBackgrounds,
  unifyPageSizes,
  type CropMarginId,
  type MergeWhere,
  type NamedDestination,
  type PageSize,
  type OverlayPosition,
  type OutlineBookmark,
  type OverlayPresetId,
  type PageBgId,
  type PageLabelStyle,
  type PageNumberPosition,
  type PageNumberStyle,
  type RedactSizeId,
  type TintId,
  type WatermarkStyle,
} from '../lib/pdf.ts'
import { zipPdfParts } from '../lib/convert.ts'
import { decryptPdfForEdit, isPdfPasswordError } from '../lib/encrypt.ts'
import {
  ACCEPT_SOURCES,
  embeddedImageName,
  embeddedImageZipName,
  embeddedAttachmentName,
  embeddedAttachmentZipName,
  encryptedPdfName,
  extractedPdfName,
  readImageFiles,
  readPdfFile,
  readSourceFile,
  outlineSplitPartName,
  outlineSplitZipName,
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
  gotoSuggestions,
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
  { id: 'top-right', label: 'Trên phải' },
  { id: 'center', label: 'Giữa' },
  { id: 'bottom-left', label: 'Dưới trái' },
  { id: 'bottom-center', label: 'Dưới giữa' },
  { id: 'bottom-right', label: 'Dưới phải' },
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

const TINT_PRESETS: { id: TintId; label: string }[] = TINT_IDS.map((id) => ({
  id,
  label: TINT_LABELS[id],
}))

const PAGE_BG_PRESETS: { id: PageBgId; label: string }[] = PAGE_BG_IDS.map((id) => ({
  id,
  label: PAGE_BG_LABELS[id],
}))

const PAGE_LABEL_PRESETS: { id: PageLabelStyle; label: string }[] = PAGE_LABEL_STYLES.map((id) => ({
  id,
  label: PAGE_LABEL_LABELS[id],
}))

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
  const [redactSize, setRedactSize] = useState<RedactSizeId>('block')
  const [numberPos, setNumberPos] = useState<PageNumberPosition>('bottom-center')
  const [numberStyle, setNumberStyle] = useState<PageNumberStyle>('n-of-total')
  const [watermark, setWatermark] = useState('')
  const [watermarkStyle, setWatermarkStyle] = useState<WatermarkStyle>('diagonal')
  const [headerText, setHeaderText] = useState('')
  const [footerText, setFooterText] = useState('')
  const [coverTitle, setCoverTitle] = useState('')
  const [coverSubtitle, setCoverSubtitle] = useState('')
  const [cropMargin, setCropMargin] = useState<CropMarginId>('medium')
  const [readingTint, setReadingTint] = useState<TintId>('cream')
  const [pageBg, setPageBg] = useState<PageBgId>('cream')
  const [downloadPassword, setDownloadPassword] = useState('')
  const [downloadConfirm, setDownloadConfirm] = useState('')
  const [openPassword, setOpenPassword] = useState('')
  const [bookmarkTitle, setBookmarkTitle] = useState('')
  const [destName, setDestName] = useState('')
  const [outline, setOutline] = useState<OutlineBookmark[]>([])
  const [outlineAt, setOutlineAt] = useState<number | null>(null)
  const [namedDests, setNamedDests] = useState<NamedDestination[]>([])
  const [pageSizes, setPageSizes] = useState<PageSize[]>([])
  const [namedDestAt, setNamedDestAt] = useState<string | null>(null)
  const [destPage, setDestPage] = useState('')
  const [destLeft, setDestLeft] = useState('')
  const [destTop, setDestTop] = useState('')
  const [destZoom, setDestZoom] = useState('')
  const [showBookletPreview, setShowBookletPreview] = useState(false)
  const [pageLabelStyle, setPageLabelStyle] = useState<PageLabelStyle>('decimal')
  const [lockedPdf, setLockedPdf] = useState<{
    name: string
    bytes: Uint8Array
    purpose: 'open' | 'merge'
  } | null>(null)
  const [metaTitle, setMetaTitle] = useState('')
  const [metaAuthor, setMetaAuthor] = useState('')
  const [metaSubject, setMetaSubject] = useState('')
  const [mergePending, setMergePending] = useState<{
    name: string
    bytes: Uint8Array
    pages: number
  } | null>(null)
  const [mergeWhere, setMergeWhere] = useState<MergeWhere>('end')
  const [mergeBookmark, setMergeBookmark] = useState(true)
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
  const [viewerLabels, setViewerLabels] = useState<string[]>([])
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
  const frontCount = doc ? frontMatterPageCount(targets, doc.pageCount) : null
  const currentLabel = doc
    ? viewerLabels[page]?.trim() || String(page + 1)
    : ''
  const currentCaption =
    currentLabel && currentLabel !== String(page + 1)
      ? `${currentLabel} (trang ${page + 1})`
      : `trang ${page + 1}`
  const destPageSize =
    namedDestAt == null
      ? undefined
      : pageSizes[namedDests.find((dest) => dest.name === namedDestAt)?.pageIndex ?? -1]

  useEffect(() => {
    if (!doc) {
      return
    }
    let cancelled = false
    void listPageLabels(doc.bytes)
      .then((ranges) => {
        if (!cancelled) {
          setViewerLabels(pageLabelsForCount(ranges, doc.pageCount))
        }
      })
      .catch(() => {
        if (!cancelled) {
          setViewerLabels([])
        }
      })
    return () => {
      cancelled = true
    }
  }, [doc])

  useEffect(() => {
    if (!doc) {
      return
    }
    let cancelled = false
    void Promise.all([
      listOutlineBookmarks(doc.bytes),
      listNamedDests(doc.bytes),
      listPageSizes(doc.bytes),
    ])
      .then(([items, dests, sizes]) => {
        if (cancelled) {
          return
        }
        setOutline(items)
        setNamedDests(dests)
        setPageSizes(sizes)
        setOutlineAt((current) =>
          current != null && current >= 0 && current < items.length ? current : null,
        )
        setNamedDestAt((current) =>
          current && dests.some((dest) => dest.name === current) ? current : null,
        )
      })
      .catch(() => {
        if (!cancelled) {
          setOutline([])
          setNamedDests([])
          setPageSizes([])
          setOutlineAt(null)
          setNamedDestAt(null)
        }
      })
    return () => {
      cancelled = true
    }
  }, [doc])

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

  const downloadLocked = useCallback(async (): Promise<void> => {
    if (!doc) {
      return
    }
    setBusy(true)
    setError(null)
    try {
      const { encryptPdfForDownload } = await import('../lib/encrypt.ts')
      const locked = await encryptPdfForDownload(doc.bytes, downloadPassword, downloadConfirm)
      downloadBlob(bytesToBlob(locked, 'application/pdf'), encryptedPdfName(doc.name))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không khóa được PDF.')
    } finally {
      setBusy(false)
    }
  }, [doc, downloadPassword, downloadConfirm])

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
    const parsed = parseGotoPage(gotoRaw, doc.pageCount, viewerLabels, namedDests)
    if (!parsed.ok) {
      setError(parsed.message)
      return
    }
    setError(null)
    goToPage(parsed.index, 'replace')
  }, [doc, gotoRaw, goToPage, namedDests, viewerLabels])

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
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
        event.preventDefault()
        setSelected(pageRange(0, doc.pageCount - 1))
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
    setSelected,
  ])

  async function onUpload(file: File | undefined): Promise<void> {
    if (!file) {
      return
    }
    setError(null)
    setMergePending(null)
    setLockedPdf(null)
    try {
      const source = await readSourceFile(file)
      const next = await pdfFromLoadedSource(source)
      if (source.kind === 'pdf') {
        try {
          await pageCount(next.bytes)
        } catch (cause) {
          if (isPdfPasswordError(cause)) {
            setLockedPdf({ name: next.name, bytes: next.bytes, purpose: 'open' })
            setOpenPassword('')
            setError('PDF này đang khóa. Nhập mật khẩu để mở. Bản làm việc sẽ được giải khóa.')
            return
          }
          throw cause
        }
      }
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

  async function unlockPending(): Promise<void> {
    if (!lockedPdf) {
      return
    }
    setBusy(true)
    setError(null)
    try {
      const unlocked = await decryptPdfForEdit(lockedPdf.bytes, openPassword)
      if (lockedPdf.purpose === 'merge') {
        const pages = await pageCount(unlocked)
        setMergePending({ name: lockedPdf.name, bytes: unlocked, pages })
        setLockedPdf(null)
        setOpenPassword('')
        return
      }
      await forgetHistory()
      await setDocument(lockedPdf.name, unlocked)
      clearEditorView()
      setPage(0)
      setSelected([0])
      setAnchor(0)
      setPast([])
      setFuture([])
      setLockedPdf(null)
      setOpenPassword('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không mở được PDF khóa.')
    } finally {
      setBusy(false)
    }
  }

  async function onMergePick(file: File | undefined): Promise<void> {
    if (!file) {
      return
    }
    setError(null)
    try {
      const bytes = await readPdfFile(file)
      try {
        const pages = await pageCount(bytes)
        setLockedPdf(null)
        setMergePending({ name: file.name, bytes, pages })
      } catch (cause) {
        if (isPdfPasswordError(cause)) {
          setMergePending(null)
          setLockedPdf({ name: file.name, bytes, purpose: 'merge' })
          setOpenPassword('')
          setError('PDF gộp đang khóa. Nhập mật khẩu để mở, rồi gộp bản đã giải khóa.')
          return
        }
        throw cause
      }
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
    await run((bytes) =>
      mergeBookmark
        ? mergePdfWithBookmark(bytes, mergePending.bytes, mergePending.name, at)
        : mergePdf(bytes, mergePending.bytes, at),
    )
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
      const pages: { bytes: Uint8Array; kind: 'png' | 'jpg' }[] = []
      for (const image of images) {
        pages.push(
          image.kind === 'webp'
            ? { bytes: await rasterToPng(image.bytes), kind: 'png' as const }
            : { bytes: image.bytes, kind: image.kind },
        )
      }
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
          Xoay, đảo thứ tự, đan/tách trang lẻ-chẵn, đánh số trang, đóng chữ mờ, đầu/cuối trang, cắt lề, phủ màu đọc,
          phủ nền trang, cắt lề trắng, chuyển xám,
          tìm chữ, xóa trang không chữ hoặc trùng chữ, vừa khổ A4/Letter/A5, đồng khổ, thêm hoặc cắt lề, đóng khung,
          thêm trang bìa, gộp
          2/4 trang mỗi tờ, xếp sách gấp (xem tờ in), lật ngang/dọc, cắt đôi trên/dưới hoặc trái/phải, xoay khổ
          đứng/ngang, đổi tỷ lệ trang, đảo chọn, xóa, nhân bản, tách hoặc giữ trang đã chọn, tách
          thành nhiều PDF hoặc tách theo dấu trang mục lục, chèn trang trắng hoặc ảnh PNG/JPEG/WEBP, kéo thumbnail để đổi thứ tự,
          hoàn tác (giữ khi tải lại trang), gộp tệp (tuỳ chọn gắn dấu trang), sửa thông tin tài liệu, chèn chữ (trên trái/trên giữa/trên phải/giữa/dưới trái/dưới giữa/dưới phải), che chữ (dòng/khối/trang), tô vàng, gạch chân, gạch ngang, ký tên, ô chữ, ký số, ghi chú, hộp chọn, đính kèm, nút chọn, danh sách, hộp liệt kê, liên kết, đóng dấu, chữ tự do, dấu chèn, nét mực, hình vuông, hình tròn, đa giác, đường gấp, đường thẳng, gạch sóng, tô sáng, gạch dưới, gạch xóa, che hẳn, cửa sổ, dấu nước, màn hình, âm thanh, phim, phương tiện, mô hình, dấu in, bẫy in, chiếu, hiệu ứng, làm phẳng, khi mở, tùy xem, lớp, bài, ngôn ngữ, thẻ, xmp, màu in, hồ sơ, đánh dấu mục lục
          (thư mục lồng 3 cấp không Dest hoặc đích tên, thu từng mục, đổi tên / xóa / lên / xuống / thụt vào / thụt ra / gắn trang / đích tên / gắn trang đích từ ô trang / đổi tên đích / xóa đích / kiểu xem XYZ Fit FitH FitV FitR FitB FitBH FitBV / gắn XYZ trái đỉnh zoom / khổ A4 Letter A5 trái trên / mé trái trên / trên / phải trên / trái giữa / giữa / phải giữa / trái dưới / dưới / phải dưới theo khổ trang đích / zoom 50% / 75% / 100% / 125% / 150% / 200% / vừa rộng / vừa cao / vừa trang / giữ zoom / giữ trái / giữ trên / trái 0 / trên 0 / gốc / về gốc / đích trên thumbnail, bấm tên đích để chọn),
          nhãn trang (1 / i / Trang), tải ảnh nhúng, tải đính kèm, mở PDF khóa bằng mật khẩu, rồi tải PDF
          mới (có thể khóa mật khẩu). Có thể mở TXT, Markdown, HTML, JSON, JSONL, YAML, XML, KML, GPX, OSM, GeoRSS, WKT, GML, TopoJSON, SVG, DXF, MapML, CityJSON, IndoorGML, CityGML, LandXML, IFC-XML, gbXML, BCF, COBie, LandInfra, InfraGML, OpenDRIVE, RailML, TransXML, DATEX II, NeTEx, SIRI, TransXChange, NaPTAN, GTFS, IFOPT, OJP, TRIAS, VDV453, VDV454, VDV452, VDV462, VDV455, VDV731, VDV301, VDV423, VDV431, VDV300, VDV451, VDV432, VDV433, VDV434, VDV435, VDV436, VDV456, VDV457, VDV459, VDV461, VDV458, VDV460, XLIFF, TMX, TBX, PO, DITA, vCard, RDF, OPDS, CSV, TSV, TOML, Org, LaTeX, INI, AsciiDoc, RST, Textile, MediaWiki, DokuWiki, DocBook, OPML, Atom/RSS, Typst, Gemtext, POD, BBCode, Fountain, TiddlyWiki, Texinfo, roff, Jupyter, BibTeX, SRT, VTT, LRC, ICS, VTODO, VJOURNAL, VFREEBUSY, VAVAILABILITY, VTIMEZONE, VALARM, VEVENT, XCAL, JCAL, JCARD, XCARD, HCARD, HCAL, JSCAL, DTBOOK, SSML, MATHML, VXML, CUE, ASS, TTML, SBV, SAMI, SUB, STL, SCC, USF, RT, MPL, DjVu, PS, TEI, JATS, RIS, ENW, CSL-JSON, NBIB, CSL-YAML, EndNote XML, MODS, CFF, DataCite, MARCXML, Dublin Core, ONIX, Unixref, BibJSON, PubMed, JSON-LD, BIBFRAME, Crossref, EAD, METS, PREMIS, MIX, ALTO, PAGE, FOXML, EDM, LIDO, VRA, CDWA Lite, SPECTRUM, Darwin Core, Object ID, EAC-CPF, CIDOC CRM, METS Rights, TextMD, PBCore, EBUCore, RTF, DOCX, ODT, ODS, XLSX,
          PPTX, ODP, FB2, EPUB, CBZ hoặc PNG/JPEG/WEBP để tạo PDF.
        </p>
      </header>

      <label className="file-btn">
        Tải PDF / chữ / ảnh
        <input
          type="file"
          accept={ACCEPT_SOURCES}
          aria-label="Tải tệp PDF, TXT, Markdown, HTML, JSON, JSONL, YAML, XML, KML, GPX, OSM, GeoRSS, WKT, GML, TopoJSON, SVG, DXF, MapML, CityJSON, IndoorGML, CityGML, LandXML, IFC-XML, gbXML, BCF, COBie, LandInfra, InfraGML, OpenDRIVE, RailML, TransXML, DATEX II, NeTEx, SIRI, TransXChange, NaPTAN, GTFS, IFOPT, OJP, TRIAS, VDV453, VDV454, VDV452, VDV462, VDV455, VDV731, VDV301, VDV423, VDV431, VDV300, VDV451, VDV432, VDV433, VDV434, VDV435, VDV436, VDV456, VDV457, VDV459, VDV461, VDV458, VDV460, XLIFF, TMX, TBX, PO, DITA, vCard, RDF, OPDS, CSV, TSV, TOML, Org, LaTeX, INI, AsciiDoc, RST, Textile, MediaWiki, DokuWiki, DocBook, OPML, Atom, RSS, Typst, Gemtext, POD, BBCode, Fountain, TiddlyWiki, Texinfo, roff, Jupyter, BibTeX, SRT, VTT, LRC, ICS, VTODO, VJOURNAL, VFREEBUSY, VAVAILABILITY, VTIMEZONE, VALARM, VEVENT, XCAL, JCAL, JCARD, XCARD, HCARD, HCAL, JSCAL, DTBOOK, SSML, MATHML, VXML, CUE, ASS, TTML, SBV, SAMI, SUB, STL, SCC, USF, RT, MPL, DjVu, PS, TEI, JATS, RIS, ENW, CSL-JSON, NBIB, CSL-YAML, EndNote XML, MODS, CFF, DataCite, MARCXML, Dublin Core, ONIX, Unixref, BibJSON, PubMed, JSON-LD, BIBFRAME, Crossref, EAD, METS, PREMIS, MIX, ALTO, PAGE, FOXML, EDM, LIDO, VRA, CDWA Lite, SPECTRUM, Darwin Core, Object ID, EAC-CPF, CIDOC CRM, METS Rights, TextMD, PBCore, EBUCore, RTF, DOCX, ODT, ODS, XLSX, PPTX, ODP, FB2, EPUB, CBZ, PNG, JPEG hoặc WEBP để chỉnh sửa"
          onChange={(event) => void onUpload(event.target.files?.[0])}
        />
      </label>

      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}

      {lockedPdf ? (
        <fieldset className="meta-pack">
          <legend>{lockedPdf.purpose === 'merge' ? 'Gộp PDF khóa' : 'Mở PDF khóa'}</legend>
          <p className="note">
            {lockedPdf.name} đang khóa. Bản làm việc sẽ được giải khóa và giữ trên máy này.
          </p>
          <label className="overlay-field">
            Mật khẩu mở
            <input
              type="password"
              value={openPassword}
              autoComplete="current-password"
              onChange={(event) => setOpenPassword(event.target.value)}
              aria-label="Mật khẩu để mở PDF khóa"
            />
          </label>
          <div className="preset-row">
            <button
              type="button"
              className="primary"
              disabled={busy}
              aria-label="Mở PDF đã khóa mật khẩu; bản làm việc sẽ không còn khóa"
              onClick={() => void unlockPending()}
            >
              {lockedPdf.purpose === 'merge' ? 'Mở để gộp' : 'Mở PDF'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setLockedPdf(null)
                setOpenPassword('')
                setError(null)
              }}
            >
              Hủy
            </button>
          </div>
        </fieldset>
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
            labels={viewerLabels}
            dests={namedDests}
            disabled={busy}
            onSelect={onThumbSelect}
            onSelectDest={(name) => {
              const dest = namedDests.find((item) => item.name === name)
              if (!dest) {
                return
              }
              setNamedDestAt(dest.name)
              setDestName(dest.name)
              setDestPage(String(dest.pageIndex + 1))
              setDestLeft(dest.xyz?.left == null ? '' : String(dest.xyz.left))
              setDestTop(dest.xyz?.top == null ? '' : String(dest.xyz.top))
              setDestZoom(dest.xyz?.zoom == null ? '' : String(dest.xyz.zoom))
              goToPage(dest.pageIndex, 'replace')
            }}
            onReorder={(from, to) => {
              applyReorder(movingIndexesForDrag(selected, from), to, from)
            }}
          />
          <div className="preview-card">
            <p className="meta" aria-live="polite">
              {doc.name} · {doc.pageCount} trang · đang xem {currentCaption}
              {targets.length > 1 ? ` · đã chọn ${targets.length} trang` : ''}
            </p>
            <div className="preview-wrap">
              <canvas
                ref={canvasRef}
                className="preview"
                onClick={onPreviewClick}
                aria-label={`Xem trước ${currentCaption}. Nhấn để chọn vị trí chữ chèn.`}
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
              xóa, Alt+↑↓ dời nhóm, Ctrl+Z hoàn tác, Ctrl+Y làm lại, Ctrl+A chọn tất cả, Ctrl+F tìm
              chữ, Ctrl+G tới trang, Ctrl+I đảo chọn, F3 kết quả sau. Nhân bản chèn bản sao sau trang
              đã chọn cuối; tách trang tải một PDF mới; giữ lại chỉ các trang đã chọn; tách mỗi N
              trang thành ZIP; đan hai nửa (mặt trước rồi mặt sau) hoặc tách lẻ/chẵn; gộp 2/4 trang
              mỗi tờ, xếp sách gấp, lật ngang/dọc, cắt đôi trên/dưới hoặc trái/phải; chữ mờ, cắt
              hoặc thêm lề, chuyển xám, vừa A4/Letter/A5 và xóa trùng chữ áp dụng cho trang đã chọn.
              Chèn PNG/JPEG/WEBP thành trang mới; thông tin tiêu đề/tác giả lưu vào PDF.
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
                  placeholder={currentLabel || String(page + 1)}
                  list="goto-dest-names"
                  aria-label="Tới số, nhãn trang hoặc đích tên"
                  aria-keyshortcuts="Control+G"
                  onChange={(event) => setGotoRaw(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      applyGoto()
                    }
                  }}
                />
                <datalist id="goto-dest-names">
                  {gotoSuggestions(viewerLabels, namedDests).map((value) => (
                    <option key={value} value={value} />
                  ))}
                </datalist>
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
              <button
                type="button"
                disabled={busy}
                aria-keyshortcuts="Control+A"
                onClick={() => setSelected(pageRange(0, doc.pageCount - 1))}
              >
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
                disabled={busy}
                aria-label={
                  targets.length > 1
                    ? `Tải ảnh nhúng từ ${targets.length} trang đã chọn`
                    : 'Tải ảnh nhúng từ trang hiện tại'
                }
                onClick={() => {
                  void (async () => {
                    if (!doc) {
                      return
                    }
                    setBusy(true)
                    setError(null)
                    try {
                      const images = await extractEmbeddedImages(doc.bytes, targets)
                      if (images.length === 1) {
                        const image = images[0]!
                        downloadBlob(
                          bytesToBlob(
                            image.bytes,
                            image.kind === 'png' ? 'image/png' : 'image/jpeg',
                          ),
                          embeddedImageName(doc.name, image.pageIndex, image.imageIndex, image.kind),
                        )
                        return
                      }
                      downloadBlob(
                        await zipPdfParts(
                          images.map((image) => ({
                            name: embeddedImageName(
                              doc.name,
                              image.pageIndex,
                              image.imageIndex,
                              image.kind,
                            ),
                            bytes: image.bytes,
                          })),
                        ),
                        embeddedImageZipName(doc.name),
                      )
                    } catch (cause) {
                      setError(cause instanceof Error ? cause.message : 'Không tải được ảnh nhúng.')
                    } finally {
                      setBusy(false)
                    }
                  })()
                }}
              >
                Tải ảnh nhúng {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
              </button>
              <button
                type="button"
                disabled={busy}
                aria-label={
                  targets.length > 1
                    ? `Tải tệp đính kèm từ ${targets.length} trang đã chọn`
                    : 'Tải tệp đính kèm từ trang hiện tại'
                }
                onClick={() => {
                  void (async () => {
                    if (!doc) {
                      return
                    }
                    setBusy(true)
                    setError(null)
                    try {
                      const files = await extractFileAttachments(doc.bytes, targets)
                      if (files.length === 1) {
                        const file = files[0]!
                        downloadBlob(
                          bytesToBlob(
                            file.bytes,
                            file.name.toLowerCase().endsWith('.txt')
                              ? 'text/plain'
                              : 'application/octet-stream',
                          ),
                          embeddedAttachmentName(
                            doc.name,
                            file.pageIndex,
                            file.attachmentIndex,
                            file.name,
                          ),
                        )
                        return
                      }
                      downloadBlob(
                        await zipPdfParts(
                          files.map((file) => ({
                            name: embeddedAttachmentName(
                              doc.name,
                              file.pageIndex,
                              file.attachmentIndex,
                              file.name,
                            ),
                            bytes: file.bytes,
                          })),
                        ),
                        embeddedAttachmentZipName(doc.name),
                      )
                    } catch (cause) {
                      setError(cause instanceof Error ? cause.message : 'Không tải được tệp đính kèm.')
                    } finally {
                      setBusy(false)
                    }
                  })()
                }}
              >
                Tải đính kèm {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
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
              <button
                type="button"
                disabled={busy || outline.every((item) => item.depth !== 0)}
                aria-label="Tách PDF theo dấu trang mục lục cấp trên và tải ZIP"
                onClick={() => {
                  void (async () => {
                    if (!doc) {
                      return
                    }
                    setBusy(true)
                    setError(null)
                    try {
                      const parts = await splitByOutline(doc.bytes)
                      const blob = await zipPdfParts(
                        parts.map((part, index) => ({
                          name: outlineSplitPartName(doc.name, part.title, index + 1, parts.length),
                          bytes: part.bytes,
                        })),
                      )
                      downloadBlob(blob, outlineSplitZipName(doc.name))
                    } catch (cause) {
                      setError(
                        cause instanceof Error
                          ? cause.message
                          : 'Không tách được theo dấu trang mục lục.',
                      )
                    } finally {
                      setBusy(false)
                    }
                  })()
                }}
              >
                Tách theo dấu trang
              </button>
              <button
                type="button"
                disabled={busy || outlineAt == null}
                aria-label={
                  outlineAt == null
                    ? 'Chọn một mục lục rồi giữ các trang của mục đó'
                    : `Giữ các trang của mục lục ${outline[outlineAt]?.title ?? 'đã chọn'} trong tài liệu`
                }
                onClick={() => {
                  if (!doc || outlineAt == null) {
                    return
                  }
                  const at = outlineAt
                  void run(
                    (bytes) => keepOutlineItem(bytes, at),
                    () => {
                      setPage(0)
                      setSelected([0])
                      setAnchor(0)
                      setOutlineAt(null)
                    },
                  )
                }}
              >
                Giữ mục này
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
              <button
                type="button"
                disabled={busy}
                aria-label="Gộp các trang đã chọn thành 2 trang mỗi tờ A4 ngang"
                onClick={() => {
                  const indexes = targets.length > 1 ? targets : undefined
                  void run((bytes) => nUpPages(bytes, 2, indexes), () => {
                    setPage(0)
                    setSelected([0])
                    setAnchor(0)
                    setSearchRaw(null)
                  })
                }}
              >
                Gộp 2 trang/tờ
              </button>
              <button
                type="button"
                disabled={busy}
                aria-label="Gộp các trang đã chọn thành 4 trang mỗi tờ A4"
                onClick={() => {
                  const indexes = targets.length > 1 ? targets : undefined
                  void run((bytes) => nUpPages(bytes, 4, indexes), () => {
                    setPage(0)
                    setSelected([0])
                    setAnchor(0)
                    setSearchRaw(null)
                  })
                }}
              >
                Gộp 4 trang/tờ
              </button>
              <button
                type="button"
                disabled={busy}
                aria-label="Xếp sách gấp (2 trang mỗi tờ, thứ tự in gáy)"
                onClick={() => {
                  void run((bytes) => imposeBooklet(bytes), () => {
                    setPage(0)
                    setSelected([0])
                    setAnchor(0)
                    setSearchRaw(null)
                    setShowBookletPreview(false)
                  })
                }}
              >
                Sách gấp
              </button>
              <button
                type="button"
                aria-label={
                  showBookletPreview
                    ? 'Ẩn thứ tự tờ in sách gấp'
                    : 'Xem thứ tự tờ in sách gấp, không đổi file'
                }
                aria-pressed={showBookletPreview}
                onClick={() => setShowBookletPreview((open) => !open)}
              >
                {showBookletPreview ? 'Ẩn tờ in' : 'Xem tờ in'}
              </button>
              {showBookletPreview ? (
                <ol className="booklet-preview" aria-label="Thứ tự tờ in sách gấp">
                  {bookletPreviewSheets(doc.pageCount).map((sheet) => (
                    <li key={sheet.sheet}>
                      Tờ {sheet.sheet}: trước {bookletSlotLabel(sheet.front.left)} |{' '}
                      {bookletSlotLabel(sheet.front.right)}; sau {bookletSlotLabel(sheet.back.left)} |{' '}
                      {bookletSlotLabel(sheet.back.right)}
                    </li>
                  ))}
                </ol>
              ) : null}
              <button
                type="button"
                disabled={busy}
                aria-label={
                  targets.length > 1
                    ? `Lật ngang ${targets.length} trang đã chọn`
                    : 'Lật ngang trang hiện tại'
                }
                onClick={() => void run((bytes) => flipPages(bytes, targets, 'horizontal'))}
              >
                Lật ngang {targets.length > 1 ? `${targets.length} trang` : ''}
              </button>
              <button
                type="button"
                disabled={busy}
                aria-label={
                  targets.length > 1
                    ? `Lật dọc ${targets.length} trang đã chọn`
                    : 'Lật dọc trang hiện tại'
                }
                onClick={() => void run((bytes) => flipPages(bytes, targets, 'vertical'))}
              >
                Lật dọc {targets.length > 1 ? `${targets.length} trang` : ''}
              </button>
              <button
                type="button"
                disabled={busy}
                aria-label={
                  targets.length > 1
                    ? `Cắt đôi trên/dưới ${targets.length} trang đã chọn`
                    : 'Cắt đôi trên/dưới trang hiện tại'
                }
                onClick={() => {
                  const beforeCount = doc.pageCount
                  void run((bytes) => splitPagesInHalf(bytes, targets, 'horizontal'), (count) => {
                    const nextSelected = remapAfterSplitHalf(beforeCount, targets, targets).filter(
                      (index) => index < count,
                    )
                    const first = nextSelected[0] ?? 0
                    setPage(first)
                    setSelected(nextSelected.length > 0 ? nextSelected : [first])
                    setAnchor(first)
                    setSearchRaw(null)
                  })
                }}
              >
                Cắt đôi trên/dưới
              </button>
              <button
                type="button"
                disabled={busy}
                aria-label={
                  targets.length > 1
                    ? `Cắt đôi trái/phải ${targets.length} trang đã chọn`
                    : 'Cắt đôi trái/phải trang hiện tại'
                }
                onClick={() => {
                  const beforeCount = doc.pageCount
                  void run((bytes) => splitPagesInHalf(bytes, targets, 'vertical'), (count) => {
                    const nextSelected = remapAfterSplitHalf(beforeCount, targets, targets).filter(
                      (index) => index < count,
                    )
                    const first = nextSelected[0] ?? 0
                    setPage(first)
                    setSelected(nextSelected.length > 0 ? nextSelected : [first])
                    setAnchor(first)
                    setSearchRaw(null)
                  })
                }}
              >
                Cắt đôi trái/phải
              </button>
            </div>
            <fieldset className="number-stamp">
              <legend>Khổ và tỷ lệ</legend>
              <div className="preset-row" role="group" aria-label="Xoay khổ trang">
                <button
                  type="button"
                  disabled={busy}
                  aria-label={
                    targets.length > 1
                      ? `Xoay ${targets.length} trang đã chọn sang khổ đứng`
                      : 'Xoay trang hiện tại sang khổ đứng'
                  }
                  onClick={() => void run((bytes) => orientPages(bytes, targets, 'portrait'))}
                >
                  Khổ đứng
                </button>
                <button
                  type="button"
                  disabled={busy}
                  aria-label={
                    targets.length > 1
                      ? `Xoay ${targets.length} trang đã chọn sang khổ ngang`
                      : 'Xoay trang hiện tại sang khổ ngang'
                  }
                  onClick={() => void run((bytes) => orientPages(bytes, targets, 'landscape'))}
                >
                  Khổ ngang
                </button>
              </div>
              <div className="preset-row" role="group" aria-label="Tỷ lệ trang">
                {SCALE_PERCENTS.map((percent) => (
                  <button
                    key={percent}
                    type="button"
                    disabled={busy}
                    aria-label={
                      targets.length > 1
                        ? `Đổi tỷ lệ ${targets.length} trang đã chọn thành ${percent}%`
                        : `Đổi tỷ lệ trang hiện tại thành ${percent}%`
                    }
                    onClick={() => void run((bytes) => scalePages(bytes, targets, percent))}
                  >
                    {percent}%
                  </button>
                ))}
              </div>
            </fieldset>
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
            <fieldset className="watermark-pack">
              <legend>Đầu và cuối trang</legend>
              <label className="overlay-field">
                Đầu trang
                <input
                  value={headerText}
                  onChange={(event) => setHeaderText(event.target.value)}
                  aria-label="Nội dung đầu trang"
                />
              </label>
              <label className="overlay-field">
                Cuối trang
                <input
                  value={footerText}
                  onChange={(event) => setFooterText(event.target.value)}
                  aria-label="Nội dung cuối trang"
                />
              </label>
              <button
                type="button"
                disabled={busy}
                aria-label={
                  targets.length > 1
                    ? `Đóng đầu/cuối trang cho ${targets.length} trang đã chọn`
                    : 'Đóng đầu/cuối trang cho trang hiện tại'
                }
                onClick={() =>
                  void run((bytes) =>
                    addHeaderFooter(bytes, {
                      header: headerText,
                      footer: footerText,
                      indexes: targets,
                    }),
                  )
                }
              >
                Đóng đầu/cuối {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
              </button>
            </fieldset>
            <fieldset className="watermark-pack">
              <legend>Trang bìa</legend>
              <label className="overlay-field">
                Tiêu đề
                <input
                  value={coverTitle}
                  onChange={(event) => setCoverTitle(event.target.value)}
                  aria-label="Tiêu đề trang bìa"
                />
              </label>
              <label className="overlay-field">
                Phụ đề
                <input
                  value={coverSubtitle}
                  onChange={(event) => setCoverSubtitle(event.target.value)}
                  aria-label="Phụ đề trang bìa"
                />
              </label>
              <button
                type="button"
                disabled={busy}
                aria-label="Thêm trang bìa A4 vào đầu tài liệu"
                onClick={() =>
                  void run(
                    (bytes) =>
                      addCoverPage(bytes, {
                        title: coverTitle,
                        subtitle: coverSubtitle,
                      }),
                    () => {
                      setPage(0)
                      setSelected([0])
                      setAnchor(0)
                    },
                  )
                }
              >
                Thêm bìa
              </button>
            </fieldset>
            <fieldset className="watermark-pack">
              <legend>Mục lục</legend>
              <label className="overlay-field">
                Tên mục
                <input
                  value={bookmarkTitle}
                  onChange={(event) => setBookmarkTitle(event.target.value)}
                  aria-label="Tên mục lục cho trang đã chọn"
                />
              </label>
              <button
                type="button"
                disabled={busy}
                aria-label={
                  targets.length > 1
                    ? `Đánh dấu ${targets.length} trang đã chọn vào mục lục`
                    : 'Đánh dấu trang hiện tại vào mục lục'
                }
                onClick={() => void run((bytes) => addOutlineBookmarks(bytes, targets, bookmarkTitle))}
              >
                Đánh dấu {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
              </button>
              <button
                type="button"
                disabled={busy}
                aria-label={
                  targets.length > 1
                    ? `Thêm thư mục mục lục cho ${targets.length} trang đã chọn`
                    : 'Thêm thư mục mục lục cho trang hiện tại'
                }
                onClick={() => void run((bytes) => addOutlineFolder(bytes, targets, bookmarkTitle))}
              >
                Thư mục {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
              </button>
              <button
                type="button"
                disabled={busy || outlineAt == null}
                aria-label={
                  outlineAt == null
                    ? 'Chọn một mục lục cha rồi thêm thư mục con'
                    : `Thêm thư mục con dưới ${outline[outlineAt]?.title ?? 'mục đã chọn'}`
                }
                onClick={() => {
                  if (outlineAt == null) {
                    return
                  }
                  void run((bytes) => addOutlineFolder(bytes, targets, bookmarkTitle, outlineAt))
                }}
              >
                Thư mục con
              </button>
              {outline.length > 0 ? (
                <ol className="outline-list" aria-label="Danh sách mục lục">
                  {visibleOutlineItems(outline).map(({ item, index }) => (
                    <li
                      key={`${item.title}:${index}`}
                      className="outline-row"
                      style={{ paddingLeft: `${item.depth * 14}px` }}
                    >
                      <button
                        type="button"
                        className={outlineAt === index ? 'picked' : undefined}
                        aria-label={`Chọn mục lục ${item.title}`}
                        aria-pressed={outlineAt === index}
                        onClick={() => {
                          setOutlineAt(index)
                          goToPage(item.pageIndex, 'replace')
                        }}
                      >
                        {item.destName ? `${item.title} (${item.destName})` : item.title}
                      </button>
                      {outlineItemIsFolder(outline, index) ? (
                        <button
                          type="button"
                          disabled={busy}
                          aria-label={
                            item.open === false
                              ? `Mở thư mục ${item.title}`
                              : `Thu gọn thư mục ${item.title}`
                          }
                          onClick={() => {
                            setOutlineAt(index)
                            void run((bytes) =>
                              setOutlineFolderOpen(bytes, index, item.open === false),
                            )
                          }}
                        >
                          {item.open === false ? 'Mở' : 'Thu'}
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ol>
              ) : null}
              <div className="preset-row" role="group" aria-label="Đổi tên hoặc xóa một mục lục">
                <button
                  type="button"
                  disabled={busy || outlineAt == null}
                  aria-label={
                    outlineAt == null
                      ? 'Chọn một mục lục rồi đổi tên'
                      : `Đổi tên mục lục ${outline[outlineAt]?.title ?? ''}`
                  }
                  onClick={() => {
                    if (outlineAt == null) {
                      return
                    }
                    void run((bytes) => renameOutlineItem(bytes, outlineAt, bookmarkTitle))
                  }}
                >
                  Đổi tên
                </button>
                <button
                  type="button"
                  disabled={busy || outlineAt == null}
                  aria-label={
                    outlineAt == null
                      ? 'Chọn một mục lục rồi xóa'
                      : `Xóa mục lục ${outline[outlineAt]?.title ?? ''}`
                  }
                  onClick={() => {
                    if (outlineAt == null) {
                      return
                    }
                    const at = outlineAt
                    void run(
                      (bytes) => removeOutlineItem(bytes, at),
                      () => setOutlineAt(null),
                    )
                  }}
                >
                  Xóa mục
                </button>
              </div>
              <div className="preset-row" role="group" aria-label="Đổi thứ tự hoặc gắn trang mục lục">
                <button
                  type="button"
                  disabled={busy || outlineAt == null || !canMoveOutlineItem(outline, outlineAt, 'up')}
                  aria-label={
                    outlineAt == null
                      ? 'Chọn một mục lục rồi đưa lên'
                      : `Đưa mục lục ${outline[outlineAt]?.title ?? ''} lên`
                  }
                  onClick={() => {
                    if (outlineAt == null) {
                      return
                    }
                    const from = outlineAt
                    const nextAt = outlineIndexAfterMove(outline, from, 'up')
                    void run(
                      (bytes) => moveOutlineItem(bytes, from, 'up'),
                      () => setOutlineAt(nextAt),
                    )
                  }}
                >
                  Lên
                </button>
                <button
                  type="button"
                  disabled={
                    busy || outlineAt == null || !canMoveOutlineItem(outline, outlineAt, 'down')
                  }
                  aria-label={
                    outlineAt == null
                      ? 'Chọn một mục lục rồi đưa xuống'
                      : `Đưa mục lục ${outline[outlineAt]?.title ?? ''} xuống`
                  }
                  onClick={() => {
                    if (outlineAt == null) {
                      return
                    }
                    const from = outlineAt
                    const nextAt = outlineIndexAfterMove(outline, from, 'down')
                    void run(
                      (bytes) => moveOutlineItem(bytes, from, 'down'),
                      () => setOutlineAt(nextAt),
                    )
                  }}
                >
                  Xuống
                </button>
                <button
                  type="button"
                  disabled={busy || outlineAt == null}
                  aria-label={
                    outlineAt == null
                      ? 'Chọn một mục lục rồi gắn trang hiện tại'
                      : `Gắn mục lục ${outline[outlineAt]?.title ?? ''} vào trang ${page + 1}`
                  }
                  onClick={() => {
                    if (outlineAt == null) {
                      return
                    }
                    void run((bytes) => setOutlineDest(bytes, outlineAt, page))
                  }}
                >
                  Gắn trang
                </button>
              </div>
              <div className="preset-row" role="group" aria-label="Thụt mục lục">
                <button
                  type="button"
                  disabled={
                    busy || outlineAt == null || !canIndentOutlineItem(outline, outlineAt)
                  }
                  aria-label={
                    outlineAt == null
                      ? 'Chọn một mục lục rồi thụt vào'
                      : `Thụt mục lục ${outline[outlineAt]?.title ?? ''} vào`
                  }
                  onClick={() => {
                    if (outlineAt == null) {
                      return
                    }
                    const from = outlineAt
                    const nextAt = outlineIndexAfterIndent(outline, from)
                    void run(
                      (bytes) => indentOutlineItem(bytes, from),
                      () => setOutlineAt(nextAt),
                    )
                  }}
                >
                  Thụt vào
                </button>
                <button
                  type="button"
                  disabled={
                    busy || outlineAt == null || !canOutdentOutlineItem(outline, outlineAt)
                  }
                  aria-label={
                    outlineAt == null
                      ? 'Chọn một mục lục rồi thụt ra'
                      : `Thụt mục lục ${outline[outlineAt]?.title ?? ''} ra`
                  }
                  onClick={() => {
                    if (outlineAt == null) {
                      return
                    }
                    const from = outlineAt
                    const nextAt = outlineIndexAfterOutdent(outline, from)
                    void run(
                      (bytes) => outdentOutlineItem(bytes, from),
                      () => setOutlineAt(nextAt),
                    )
                  }}
                >
                  Thụt ra
                </button>
              </div>
              <label className="overlay-field">
                Tên đích
                <input
                  value={destName}
                  onChange={(event) => setDestName(event.target.value)}
                  aria-label="Tên đích PDF cho trang hiện tại"
                />
              </label>
              <label className="overlay-field">
                Trang đích
                <input
                  inputMode="numeric"
                  value={destPage}
                  disabled={busy || namedDestAt == null}
                  onChange={(event) => setDestPage(event.target.value)}
                  aria-label="Số trang đích cho đích tên đã chọn"
                />
              </label>
              <label className="overlay-field">
                Trái XYZ
                <input
                  inputMode="decimal"
                  value={destLeft}
                  disabled={busy || namedDestAt == null}
                  onChange={(event) => setDestLeft(event.target.value)}
                  aria-label="Tọa độ trái XYZ của đích tên đã chọn"
                />
              </label>
              <label className="overlay-field">
                Đỉnh XYZ
                <input
                  inputMode="decimal"
                  value={destTop}
                  disabled={busy || namedDestAt == null}
                  onChange={(event) => setDestTop(event.target.value)}
                  aria-label="Tọa độ đỉnh XYZ của đích tên đã chọn"
                />
              </label>
              <label className="overlay-field">
                Zoom XYZ
                <input
                  inputMode="decimal"
                  value={destZoom}
                  disabled={busy || namedDestAt == null}
                  onChange={(event) => setDestZoom(event.target.value)}
                  aria-label="Độ phóng XYZ của đích tên đã chọn"
                />
              </label>
              <div className="preset-row" role="group" aria-label="Đích tên PDF">
                <button
                  type="button"
                  disabled={busy}
                  aria-label={`Thêm đích tên ${destName || 'cho trang hiện tại'}`}
                  onClick={() => void run((bytes) => addNamedDest(bytes, destName, page))}
                >
                  Thêm đích tên
                </button>
                <button
                  type="button"
                  disabled={busy || outlineAt == null}
                  aria-label={
                    outlineAt == null
                      ? 'Chọn một mục lục rồi gắn đích tên'
                      : `Gắn mục lục ${outline[outlineAt]?.title ?? ''} vào đích ${destName || 'đã nhập'}`
                  }
                  onClick={() => {
                    if (outlineAt == null) {
                      return
                    }
                    void run((bytes) => setOutlineNamedDest(bytes, outlineAt, destName))
                  }}
                >
                  Gắn đích tên
                </button>
                <button
                  type="button"
                  disabled={
                    busy ||
                    namedDestAt == null ||
                    parseNamedDestPageInput(destPage, doc.pageCount) == null
                  }
                  aria-label={
                    namedDestAt == null
                      ? 'Chọn một đích tên rồi nhập trang đích'
                      : parseNamedDestPageInput(destPage, doc.pageCount) == null
                        ? 'Nhập số trang đích hợp lệ'
                        : `Gắn đích ${namedDestAt} vào trang ${destPage}`
                  }
                  onClick={() => {
                    if (namedDestAt == null) {
                      return
                    }
                    const destPageIndex = parseNamedDestPageInput(destPage, doc.pageCount)
                    if (destPageIndex == null) {
                      return
                    }
                    void run((bytes) => setNamedDestPage(bytes, namedDestAt, destPageIndex))
                  }}
                >
                  Gắn trang đích
                </button>
                <button
                  type="button"
                  disabled={
                    busy ||
                    namedDestAt == null ||
                    parseNamedDestXyzInput(destLeft, destTop, destZoom) == null
                  }
                  aria-label={
                    namedDestAt == null
                      ? 'Chọn một đích tên rồi gắn tọa độ XYZ'
                      : parseNamedDestXyzInput(destLeft, destTop, destZoom) == null
                        ? 'Nhập trái, đỉnh hoặc zoom hợp lệ'
                        : `Gắn XYZ cho đích ${namedDestAt}`
                  }
                  onClick={() => {
                    if (namedDestAt == null) {
                      return
                    }
                    const xyz = parseNamedDestXyzInput(destLeft, destTop, destZoom)
                    if (xyz == null) {
                      return
                    }
                    void run((bytes) => setNamedDestXyz(bytes, namedDestAt, xyz))
                  }}
                >
                  Gắn XYZ
                </button>
                {PAPER_IDS.map((paper) => (
                  <button
                    key={paper}
                    type="button"
                    disabled={busy || namedDestAt == null}
                    aria-label={
                      namedDestAt == null
                        ? `Chọn một đích tên rồi gắn XYZ ${PAPER_LABELS[paper]} trái trên`
                        : `Gắn XYZ ${PAPER_LABELS[paper]} trái trên cho đích ${namedDestAt}`
                    }
                    onClick={() => {
                      if (namedDestAt == null) {
                        return
                      }
                      const xyz = namedDestXyzFromPaper(paper, 'top-left')
                      void run((bytes) => setNamedDestXyz(bytes, namedDestAt, xyz), () => {
                        setDestLeft(xyz.left == null ? '' : String(xyz.left))
                        setDestTop(xyz.top == null ? '' : String(xyz.top))
                        setDestZoom(xyz.zoom == null ? '' : String(xyz.zoom))
                      })
                    }}
                  >
                    {PAPER_LABELS[paper]} trái trên
                  </button>
                ))}
                {NAMED_DEST_XYZ_EDGES.map((edge) => (
                  <button
                    key={edge}
                    type="button"
                    disabled={busy || namedDestAt == null || destPageSize == null}
                    aria-label={
                      namedDestAt == null
                        ? `Chọn một đích tên rồi gắn XYZ ${NAMED_DEST_XYZ_EDGE_LABELS[edge]}`
                        : destPageSize == null
                          ? 'Chưa đọc được khổ trang đích'
                          : `Gắn XYZ ${NAMED_DEST_XYZ_EDGE_LABELS[edge]} cho đích ${namedDestAt}`
                    }
                    onClick={() => {
                      if (namedDestAt == null || destPageSize == null) {
                        return
                      }
                      const xyz = namedDestXyzFromPageSize(destPageSize, edge)
                      void run((bytes) => setNamedDestXyz(bytes, namedDestAt, xyz), () => {
                        setDestLeft(xyz.left == null ? '' : String(xyz.left))
                        setDestTop(xyz.top == null ? '' : String(xyz.top))
                        setDestZoom(xyz.zoom == null ? '' : String(xyz.zoom))
                      })
                    }}
                  >
                    {NAMED_DEST_XYZ_EDGE_LABELS[edge]}
                  </button>
                ))}
                {NAMED_DEST_XYZ_ZOOM_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    disabled={
                      busy ||
                      namedDestAt == null ||
                      (namedDestXyzZoomNeedsPageSize(preset) && destPageSize == null)
                    }
                    aria-label={
                      namedDestAt == null
                        ? `Chọn một đích tên rồi gắn XYZ ${NAMED_DEST_XYZ_ZOOM_LABELS[preset]}`
                        : namedDestXyzZoomNeedsPageSize(preset) && destPageSize == null
                          ? 'Chưa đọc được khổ trang đích'
                          : `Gắn XYZ ${NAMED_DEST_XYZ_ZOOM_LABELS[preset]} cho đích ${namedDestAt}`
                    }
                    onClick={() => {
                      if (namedDestAt == null) {
                        return
                      }
                      if (namedDestXyzZoomNeedsPageSize(preset) && destPageSize == null) {
                        return
                      }
                      const current = namedDestXyzOf(
                        namedDests.find((dest) => dest.name === namedDestAt),
                      )
                      const xyz = namedDestXyzFromZoomPreset(
                        preset,
                        current,
                        destPageSize?.width,
                        destPageSize?.height,
                      )
                      void run((bytes) => setNamedDestXyz(bytes, namedDestAt, xyz), () => {
                        setDestLeft(xyz.left == null ? '' : String(xyz.left))
                        setDestTop(xyz.top == null ? '' : String(xyz.top))
                        setDestZoom(xyz.zoom == null ? '' : String(xyz.zoom))
                      })
                    }}
                  >
                    {NAMED_DEST_XYZ_ZOOM_LABELS[preset]}
                  </button>
                ))}
                {NAMED_DEST_XYZ_AXIS_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    disabled={
                      busy ||
                      namedDestAt == null ||
                      (namedDestXyzAxisNeedsPageSize(preset) && destPageSize == null)
                    }
                    aria-label={
                      namedDestAt == null
                        ? `Chọn một đích tên rồi gắn XYZ ${NAMED_DEST_XYZ_AXIS_LABELS[preset]}`
                        : namedDestXyzAxisNeedsPageSize(preset) && destPageSize == null
                          ? 'Chưa đọc được khổ trang đích'
                          : `Gắn XYZ ${NAMED_DEST_XYZ_AXIS_LABELS[preset]} cho đích ${namedDestAt}`
                    }
                    onClick={() => {
                      if (namedDestAt == null) {
                        return
                      }
                      if (namedDestXyzAxisNeedsPageSize(preset) && destPageSize == null) {
                        return
                      }
                      const current = namedDestXyzOf(
                        namedDests.find((dest) => dest.name === namedDestAt),
                      )
                      const xyz = namedDestXyzFromAxisPreset(
                        preset,
                        current,
                        destPageSize?.width,
                        destPageSize?.height,
                      )
                      void run((bytes) => setNamedDestXyz(bytes, namedDestAt, xyz), () => {
                        setDestLeft(xyz.left == null ? '' : String(xyz.left))
                        setDestTop(xyz.top == null ? '' : String(xyz.top))
                        setDestZoom(xyz.zoom == null ? '' : String(xyz.zoom))
                      })
                    }}
                  >
                    {NAMED_DEST_XYZ_AXIS_LABELS[preset]}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={busy || namedDestAt == null}
                  aria-label={
                    namedDestAt == null
                      ? 'Chọn một đích tên rồi đổi tên'
                      : `Đổi tên đích ${namedDestAt}`
                  }
                  onClick={() => {
                    if (namedDestAt == null) {
                      return
                    }
                    const from = namedDestAt
                    void run(
                      (bytes) => renameNamedDest(bytes, from, destName),
                      () => setNamedDestAt(destName.normalize('NFC').trim()),
                    )
                  }}
                >
                  Đổi tên đích
                </button>
                <button
                  type="button"
                  disabled={busy || namedDestAt == null}
                  aria-label={
                    namedDestAt == null ? 'Chọn một đích tên rồi xóa' : `Xóa đích tên ${namedDestAt}`
                  }
                  onClick={() => {
                    if (namedDestAt == null) {
                      return
                    }
                    void run((bytes) => removeNamedDest(bytes, namedDestAt), () => {
                      setNamedDestAt(null)
                    })
                  }}
                >
                  Xóa đích tên
                </button>
                <button
                  type="button"
                  disabled={
                    busy ||
                    namedDestAt == null ||
                    destName.normalize('NFC').trim() === '' ||
                    destName.normalize('NFC').trim() === namedDestAt
                  }
                  aria-label={
                    namedDestAt == null
                      ? 'Chọn một đích tên rồi nhập tên mới để nhân bản'
                      : destName.normalize('NFC').trim() === '' ||
                          destName.normalize('NFC').trim() === namedDestAt
                        ? 'Nhập tên đích mới để nhân bản'
                        : `Nhân bản đích ${namedDestAt} thành ${destName.normalize('NFC').trim()}`
                  }
                  onClick={() => {
                    if (namedDestAt == null) {
                      return
                    }
                    const from = namedDestAt
                    const nextName = destName.normalize('NFC').trim()
                    void run(
                      (bytes) => duplicateNamedDest(bytes, from, nextName),
                      () => setNamedDestAt(nextName),
                    )
                  }}
                >
                  Nhân bản đích
                </button>
                <button
                  type="button"
                  disabled={busy}
                  aria-label={
                    selected.length > 0
                      ? `Thêm đích tên cho ${targets.length} trang đã chọn`
                      : `Thêm đích tên cho ${currentCaption}`
                  }
                  onClick={() => void run((bytes) => addNamedDestsForSelection(bytes, targets))}
                >
                  Đích từ trang chọn
                </button>
                <button
                  type="button"
                  disabled={busy || namedDests.length === 0}
                  aria-label={
                    namedDests.length === 0 ? 'Chưa có đích tên để xóa' : 'Xóa mọi đích tên'
                  }
                  onClick={() =>
                    void run((bytes) => clearNamedDests(bytes), () => {
                      setNamedDestAt(null)
                    })
                  }
                >
                  Xóa mọi đích
                </button>
              </div>
              <div className="preset-row" role="group" aria-label="Kiểu xem đích">
                {NAMED_DEST_VIEWS.map((view) => (
                    <button
                      key={view}
                      type="button"
                      disabled={busy || namedDestAt == null}
                      aria-pressed={
                        namedDestAt != null &&
                        namedDestViewOf(namedDests.find((dest) => dest.name === namedDestAt)) ===
                          view
                      }
                      aria-label={
                        namedDestAt == null
                          ? `Chọn một đích tên rồi gắn kiểu xem ${view}`
                          : `Gắn kiểu xem ${view} cho đích ${namedDestAt}`
                      }
                      onClick={() => {
                        if (namedDestAt == null) {
                          return
                        }
                        void run((bytes) => setNamedDestView(bytes, namedDestAt, view))
                      }}
                    >
                      {view}
                    </button>
                ))}
              </div>
              {namedDests.length > 0 ? (
                <ol className="outline-list" aria-label="Danh sách đích tên">
                  {namedDests.map((dest) => (
                    <li key={dest.name} className="outline-row">
                      <button
                        type="button"
                        className={namedDestAt === dest.name ? 'picked' : undefined}
                        aria-pressed={namedDestAt === dest.name}
                        aria-label={`Chọn đích tên ${dest.name}`}
                        onClick={() => {
                          const xyz = namedDestXyzOf(dest)
                          setNamedDestAt(dest.name)
                          setDestName(dest.name)
                          setDestPage(String(dest.pageIndex + 1))
                          setDestLeft(xyz.left == null ? '' : String(xyz.left))
                          setDestTop(xyz.top == null ? '' : String(xyz.top))
                          setDestZoom(xyz.zoom == null ? '' : String(xyz.zoom))
                          goToPage(dest.pageIndex, 'replace')
                        }}
                      >
                        {dest.name} · trang {dest.pageIndex + 1}
                        {dest.xyz
                          ? ` · XYZ ${dest.xyz.left ?? '–'} ${dest.xyz.top ?? '–'} ${dest.xyz.zoom ?? '–'}`
                          : dest.view && dest.view !== 'XYZ'
                            ? ` · ${dest.view}`
                            : ''}
                      </button>
                    </li>
                  ))}
                </ol>
              ) : null}
              <div className="preset-row" role="group" aria-label="Thu gọn hoặc xóa mục lục">
                <button
                  type="button"
                  disabled={busy}
                  aria-label="Thu gọn mọi thư mục mục lục"
                  onClick={() => void run((bytes) => setOutlineFoldersOpen(bytes, false))}
                >
                  Thu gọn
                </button>
                <button
                  type="button"
                  disabled={busy}
                  aria-label="Mở mọi thư mục mục lục"
                  onClick={() => void run((bytes) => setOutlineFoldersOpen(bytes, true))}
                >
                  Mở mục
                </button>
                <button
                  type="button"
                  disabled={busy}
                  aria-label="Xóa toàn bộ mục lục"
                  onClick={() => void run((bytes) => clearOutline(bytes))}
                >
                  Xóa mục lục
                </button>
              </div>
            </fieldset>
            <fieldset className="crop-pack">
              <legend>Nhãn trang</legend>
              <div className="preset-row" role="group" aria-label="Kiểu nhãn trang">
                {PAGE_LABEL_PRESETS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={pageLabelStyle === item.id ? 'picked' : undefined}
                    onClick={() => setPageLabelStyle(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="preset-row" role="group" aria-label="Ghi nhãn trang">
                <button
                  type="button"
                  disabled={busy}
                  aria-label={`Ghi nhãn trang ${PAGE_LABEL_LABELS[pageLabelStyle]} cho cả tài liệu`}
                  onClick={() => void run((bytes) => setPageLabels(bytes, pageLabelStyle))}
                >
                  Nhãn {PAGE_LABEL_LABELS[pageLabelStyle]}
                </button>
                <button
                  type="button"
                  disabled={busy || frontCount == null}
                  aria-label={
                    frontCount
                      ? `Đặt ${frontCount} trang đầu là i, ii rồi 1, 2`
                      : 'Chọn các trang đầu liên tiếp để đặt nhãn i, ii rồi 1'
                  }
                  onClick={() => {
                    if (frontCount == null) {
                      return
                    }
                    void run((bytes) => setFrontMatterPageLabels(bytes, frontCount))
                  }}
                >
                  Mở đầu i, ii
                </button>
              </div>
            </fieldset>
            <fieldset className="crop-pack">
              <legend>Cắt hoặc thêm lề</legend>
              <div className="preset-row" role="group" aria-label="Độ rộng lề">
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
              <div className="preset-row" role="group" aria-label="Cắt hoặc thêm lề trang">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) => cropPages(bytes, targets, CROP_MARGINS[cropMargin]))
                  }
                >
                  Cắt lề {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  aria-label={
                    targets.length > 1
                      ? `Thêm lề cho ${targets.length} trang đã chọn`
                      : 'Thêm lề cho trang hiện tại'
                  }
                  onClick={() =>
                    void run((bytes) => padPages(bytes, targets, CROP_MARGINS[cropMargin]))
                  }
                >
                  Thêm lề {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy || targets.length < 2}
                  aria-label={
                    targets.length > 1
                      ? `Đồng khổ ${targets.length} trang đã chọn`
                      : 'Chọn ít nhất hai trang để đồng khổ'
                  }
                  onClick={() => void run((bytes) => unifyPageSizes(bytes, targets))}
                >
                  Đồng khổ {targets.length > 1 ? `${targets.length} trang` : ''}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  aria-label={
                    targets.length > 1
                      ? `Đóng khung ${targets.length} trang đã chọn`
                      : 'Đóng khung trang hiện tại'
                  }
                  onClick={() =>
                    void run((bytes) => addPageBorder(bytes, targets, CROP_MARGINS[cropMargin]))
                  }
                >
                  Đóng khung {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  aria-label={
                    targets.length > 1
                      ? `Cắt lề trắng ${targets.length} trang đã chọn`
                      : 'Cắt lề trắng trang hiện tại'
                  }
                  onClick={() =>
                    void run(async (bytes) =>
                      autoCropPages(bytes, targets, await pageRgba(bytes, targets), contentBoundsFromRgba),
                    )
                  }
                >
                  Cắt trắng {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
              </div>
            </fieldset>
            <fieldset className="crop-pack">
              <legend>Màu đọc</legend>
              <div className="preset-row" role="group" aria-label="Màu đọc">
                {TINT_PRESETS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={readingTint === item.id ? 'picked' : undefined}
                    onClick={() => setReadingTint(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={busy}
                aria-label={
                  targets.length > 1
                    ? `Phủ màu đọc ${TINT_LABELS[readingTint]} cho ${targets.length} trang đã chọn`
                    : `Phủ màu đọc ${TINT_LABELS[readingTint]} cho trang hiện tại`
                }
                onClick={() => void run((bytes) => tintPages(bytes, targets, readingTint))}
              >
                Phủ {TINT_LABELS[readingTint]}{' '}
                {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
              </button>
            </fieldset>
            <fieldset className="crop-pack">
              <legend>Nền trang</legend>
              <div className="preset-row" role="group" aria-label="Nền trang">
                {PAGE_BG_PRESETS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={pageBg === item.id ? 'picked' : undefined}
                    onClick={() => setPageBg(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={busy}
                aria-label={
                  targets.length > 1
                    ? `Phủ nền ${PAGE_BG_LABELS[pageBg]} cho ${targets.length} trang đã chọn`
                    : `Phủ nền ${PAGE_BG_LABELS[pageBg]} cho trang hiện tại`
                }
                onClick={() => void run((bytes) => colorPageBackgrounds(bytes, targets, pageBg))}
              >
                Phủ nền {PAGE_BG_LABELS[pageBg]}{' '}
                {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
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
              {PAPER_IDS.map((paper) => (
                <button
                  key={paper}
                  type="button"
                  disabled={busy}
                  aria-label={
                    targets.length > 1
                      ? `Vừa khổ ${PAPER_LABELS[paper]} cho ${targets.length} trang đã chọn`
                      : `Vừa khổ ${PAPER_LABELS[paper]} cho trang hiện tại`
                  }
                  onClick={() =>
                    void run((bytes) =>
                      paper === 'a4'
                        ? fitPagesToA4(bytes, targets)
                        : fitPagesToPaper(bytes, targets, paper),
                    )
                  }
                >
                  Vừa {PAPER_LABELS[paper]}{' '}
                  {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
              ))}
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
              Chèn ảnh PNG/JPEG/WEBP
              <input
                type="file"
                accept="image/png,.png,image/jpeg,.jpg,.jpeg,image/webp,.webp"
                multiple
                aria-label="Chèn một hoặc nhiều ảnh PNG, JPEG hoặc WEBP thành trang PDF"
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
                <label>
                  <input
                    type="checkbox"
                    checked={mergeBookmark}
                    onChange={(event) => setMergeBookmark(event.target.checked)}
                  />
                  Gắn dấu trang “{mergeBookmarkTitle(mergePending.name)}”
                </label>
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
            <fieldset className="watermark-pack">
              <legend>Che chữ</legend>
              <div className="preset-row" role="group" aria-label="Cỡ vùng che chữ">
                {REDACT_SIZE_IDS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    className={redactSize === id ? 'picked' : undefined}
                    onClick={() => setRedactSize(id)}
                  >
                    {REDACT_SIZE_LABELS[id]}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void run((bytes) => redactPages(bytes, targets, overlayPos, redactSize))
                }
              >
                Che chữ {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
              </button>
            </fieldset>
            <fieldset className="watermark-pack">
              <legend>Tô chữ</legend>
              <div className="preset-row" role="group" aria-label="Cỡ vùng tô chữ">
                {REDACT_SIZE_IDS.map((id) => (
                  <button
                    key={`mark-${id}`}
                    type="button"
                    className={redactSize === id ? 'picked' : undefined}
                    onClick={() => setRedactSize(id)}
                  >
                    {REDACT_SIZE_LABELS[id]}
                  </button>
                ))}
              </div>
              <div className="tool-row">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) => highlightPages(bytes, targets, overlayPos, redactSize))
                  }
                >
                  Tô vàng {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) => underlinePages(bytes, targets, overlayPos, redactSize))
                  }
                >
                  Gạch chân {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) => strikeoutPages(bytes, targets, overlayPos, redactSize))
                  }
                >
                  Gạch ngang {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) => signPages(bytes, targets, overlayPos, redactSize))
                  }
                >
                  Ký tên {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addTextFields(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Ô chữ {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addSignatureFields(bytes, targets, overlayPos, redactSize),
                    )
                  }
                >
                  Ký số {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addStickyNotes(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Ghi chú {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addCheckboxes(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Hộp chọn {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addFileAttachments(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Đính kèm {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addRadioButtons(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Nút chọn {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addDropdowns(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Danh sách {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addOptionLists(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Hộp liệt kê {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addLinkAnnotations(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Liên kết {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addStampAnnotations(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Đóng dấu {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addFreeTextAnnotations(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Chữ tự do {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addCaretAnnotations(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Dấu chèn {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addInkAnnotations(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Nét mực {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addSquareAnnotations(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Hình vuông {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addCircleAnnotations(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Hình tròn {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addPolygonAnnotations(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Đa giác {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addPolylineAnnotations(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Đường gấp {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addLineAnnotations(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Đường thẳng {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addSquigglyAnnotations(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Gạch sóng {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addHighlightAnnotations(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Tô sáng {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addUnderlineAnnotations(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Gạch dưới {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addStrikeoutAnnotations(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Gạch xóa {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addRedactAnnotations(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Che hẳn {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addPopupAnnotations(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Cửa sổ {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addWatermarkAnnotations(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Dấu nước {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addScreenAnnotations(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Màn hình {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addSoundAnnotations(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Âm thanh {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addMovieAnnotations(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Phim {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addRichMediaAnnotations(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Phương tiện {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addThreeDAnnotations(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Mô hình {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addPrinterMarkAnnotations(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Dấu in {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addTrapNetAnnotations(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Bẫy in {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      addProjectionAnnotations(bytes, targets, overlayPos, redactSize, overlay),
                    )
                  }
                >
                  Chiếu {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void run((bytes) => addPageTransitions(bytes, targets))}
                >
                  Hiệu ứng {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void run((bytes) => flattenAnnotations(bytes, targets))}
                >
                  Làm phẳng {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void run((bytes) => setOpenAction(bytes, targets))}
                >
                  Khi mở {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void run((bytes) => setViewerPreferences(bytes, targets))}
                >
                  Tùy xem {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void run((bytes) => setOptionalContentGroups(bytes, targets))}
                >
                  Lớp {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void run((bytes) => setArticleThreads(bytes, targets))}
                >
                  Bài {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run((bytes) =>
                      setDocumentLanguage(bytes, targets, languageTagFromOverlay(overlay)),
                    )
                  }
                >
                  Ngôn ngữ {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void run((bytes) => setMarkInfo(bytes, targets))}
                >
                  Thẻ {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void run((bytes) => setXmpMetadata(bytes, targets))}
                >
                  XMP {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void run((bytes) => setOutputIntents(bytes, targets))}
                >
                  Màu in {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void run((bytes) => setCollection(bytes, targets))}
                >
                  Hồ sơ {targets.length === doc.pageCount ? 'mọi trang' : `${targets.length} trang`}
                </button>
              </div>
            </fieldset>
            <fieldset className="meta-pack">
              <legend>Khóa PDF khi tải</legend>
              <label className="overlay-field">
                Mật khẩu
                <input
                  type="password"
                  value={downloadPassword}
                  autoComplete="new-password"
                  onChange={(event) => setDownloadPassword(event.target.value)}
                  aria-label="Mật khẩu PDF khi tải"
                />
              </label>
              <label className="overlay-field">
                Nhập lại
                <input
                  type="password"
                  value={downloadConfirm}
                  autoComplete="new-password"
                  onChange={(event) => setDownloadConfirm(event.target.value)}
                  aria-label="Nhập lại mật khẩu PDF"
                />
              </label>
              <button
                type="button"
                disabled={busy}
                aria-label="Tải bản PDF đã khóa mật khẩu; tài liệu đang mở vẫn đọc được"
                onClick={() => void downloadLocked()}
              >
                Tải PDF khóa
              </button>
            </fieldset>
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
