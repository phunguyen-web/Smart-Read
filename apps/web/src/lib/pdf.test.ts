import { PDFArray, PDFDict, PDFDocument, PDFHexString, PDFName, PDFNumber, degrees } from 'pdf-lib'
import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'
import {
  escapeCsv,
  escapeToml,
  escapeTsv,
  escapeHtml,
  escapeRtf,
  comicPageName,
  isComicFormat,
  isImageFormat,
  toCbz,
  slicePageRange,
  slicePagesByIndexes,
  toCsv,
  toToml,
  toTsv,
  escapeLatex,
  toIni,
  toAdoc,
  toRst,
  toTextile,
  toWiki,
  toDokuwiki,
  toDocbook,
  toOpml,
  toAtom,
  toTypst,
  toGemtext,
  toPod,
  toBbcode,
  toFountain,
  toTid,
  toTexinfo,
  toRoff,
  toIpynb,
  toBibtex,
  escapeBibtex,
  formatSrtTime,
  formatVttTime,
  formatLrcTime,
  formatIcsDate,
  formatCueIndex,
  formatAssTime,
  escapeIcs,
  escapeCue,
  escapeAss,
  toSrt,
  toVtt,
  toLrc,
  toIcs,
  toCue,
  toAss,
  formatTtmlTime,
  formatSbvTime,
  formatSamiTime,
  formatSubTime,
  formatStlTime,
  toTtml,
  toSbv,
  toSami,
  toSub,
  toStl,
  escapeTypst,
  toJsonl,
  toLatex,
  toOrg,
  escapeIni,
  toEpub,
  toFb2,
  toHtml,
  toJson,
  toMarkdown,
  toOdp,
  toOds,
  toOdt,
  toXml,
  toYaml,
  escapeYaml,
  toPptx,
  toRtf,
  toTxt,
  toXlsx,
  zipPdfParts,
} from './convert.ts'
import {
  pagesFromCsv,
  pagesFromToml,
  pagesFromTsv,
  pagesFromIni,
  pagesFromAdoc,
  pagesFromRst,
  imagesFromCbz,
  pagesFromTextile,
  pagesFromWiki,
  pagesFromDokuwiki,
  pagesFromDocbook,
  pagesFromOpml,
  pagesFromAtom,
  pagesFromTypst,
  pagesFromGemtext,
  pagesFromPod,
  pagesFromBbcode,
  pagesFromFountain,
  pagesFromTid,
  pagesFromTexinfo,
  pagesFromRoff,
  pagesFromIpynb,
  pagesFromBibtex,
  pagesFromSrt,
  pagesFromVtt,
  pagesFromLrc,
  pagesFromIcs,
  pagesFromCue,
  pagesFromAss,
  pagesFromTtml,
  pagesFromSbv,
  pagesFromSami,
  pagesFromSub,
  pagesFromStl,
  pagesFromJsonl,
  pagesFromLatex,
  pagesFromOrg,
  pagesFromDocx,
  pagesFromEpub,
  pagesFromFb2,
  pagesFromHtml,
  pagesFromImportedText,
  pagesFromJson,
  pagesFromMarkdown,
  pagesFromOdp,
  pagesFromOds,
  pagesFromOdt,
  pagesFromPptx,
  pagesFromPlainText,
  pagesFromRtf,
  pagesFromXlsx,
  pagesFromXml,
  pagesFromYaml,
  rtfToPlain,
  parseCsv,
  stripMarkup,
} from './import-text.ts'
import {
  BASE_PREVIEW_SCALE,
  BASE_THUMB_CONTRAST,
  MAX_PREVIEW_SCALE,
  SPARSE_THUMB_CONTRAST,
  blankPageIndexes,
  findPagesWithText,
  foldSearch,
  repeatedPageIndexes,
  contentBoundsFromRgba,
  grayscaleRgba,
  luma,
  previewScaleForPage,
  thumbnailContrastForPage,
  thumbnailScaleForPage,
} from './extract.ts'
import { assertPdfPassword, decryptPdfForEdit, encryptPdfForDownload } from './encrypt.ts'
import {
  decodeSnapshots,
  encodeSnapshots,
  formatPageList,
  editorExportSelection,
  restoreEditorView,
} from './persist.ts'
import {
  embeddedImageName,
  embeddedImageZipName,
  encryptedPdfName,
  extractedPdfName,
  imageKindFromFile,
  imagePageName,
  imageZipName,
  isImageKind,
  sourceKindFromFile,
  splitPartName,
  splitZipName,
  swapExtension,
} from './limits.ts'
import {
  A4_HEIGHT,
  A4_LANDSCAPE,
  A4_PORTRAIT,
  A4_WIDTH,
  A5_HEIGHT,
  A5_WIDTH,
  LETTER_HEIGHT,
  LETTER_WIDTH,
  addCoverPage,
  addHeaderFooter,
  addNamedDest,
  addNamedDestsForSelection,
  namedDestNameForPage,
  clearNamedDests,
  duplicateNamedDest,
  renameNamedDest,
  removeNamedDest,
  setNamedDestPage,
  parseNamedDestPageInput,
  NAMED_DEST_LEAF_SIZE,
  destNameTreeChildSpan,
  destNameTreeHasIntermediate,
  destNameTreeStyleFromDoc,
  addOutlineBookmarks,
  addOutlineFolder,
  bookletPreviewSheets,
  bookletSlotLabel,
  clearOutline,
  MAX_OUTLINE_DEPTH,
  canIndentOutlineItem,
  canMoveOutlineItem,
  canOutdentOutlineItem,
  indentOutlineItem,
  moveOutlineItem,
  outlineIndexAfterIndent,
  outlineIndexAfterMove,
  outlineIndexAfterOutdent,
  outdentOutlineItem,
  outlineItemIsFolder,
  renameOutlineItem,
  removeOutlineItem,
  setOutlineDest,
  setOutlineNamedDest,
  listNamedDests,
  setOutlineFolderOpen,
  setOutlineFoldersOpen,
  visibleOutlineItems,
  extractEmbeddedImages,
  formatPageLabel,
  frontMatterPageCount,
  listPageLabels,
  pageLabelForIndex,
  pageLabelsForCount,
  setFrontMatterPageLabels,
  setPageLabels,
  toRomanNumeral,
  addPageBorder,
  applyContentCrops,
  autoCropPages,
  AUTO_CROP_PADDING,
  cropBoxFromContentBounds,
  pageBoxEquals,
  TINTS,
  tintFill,
  tintPages,
  PAGE_BACKGROUNDS,
  pageBackgroundFill,
  colorPageBackgrounds,
  addPageNumbers,
  borderBoxForPage,
  borderStrokeWidth,
  addTextOverlay,
  addWatermark,
  CROP_MARGINS,
  a4SizeForPage,
  cropBoxAfterMargin,
  cropPages,
  deinterleaveOddEven,
  deinterleaveOddEvenOrder,
  deletePages,
  duplicatePages,
  duplicatedIndexes,
  extractPages,
  fitPagesToA4,
  fitPagesToPaper,
  fittedPageRect,
  flipPages,
  formatPageNumber,
  imposeBooklet,
  IMAGE_PAGE_MAX_EDGE,
  imagePageSize,
  imagesToPdf,
  insertBlankPage,
  insertImages,
  interleaveHalves,
  interleaveHalvesOrder,
  isIdentityOrder,
  keepPages,
  bookletSheetCount,
  bookletSlotOrder,
  MAX_METADATA_LENGTH,
  mergeInsertIndex,
  mergePdf,
  nUpCellRects,
  needsOrientation,
  nUpPages,
  nUpSheetCount,
  nUpSheetSize,
  MAX_PADDED_SIDE,
  movePage,
  movePages,
  orientPages,
  pageSizeEquals,
  padPages,
  paddedPageSize,
  paperSizeForPage,
  PAPER_LABELS,
  pageCount,
  listOutlineBookmarks,
  pageOrientation,
  displayedPageSize,
  readMetadata,
  remapAfterOrder,
  reorderPageBlock,
  replacePagesWithPngs,
  remapAfterSplitHalf,
  reversePages,
  reversedIndexes,
  rotatePages,
  rotatePagesBy,
  SCALE_PERCENTS,
  scaleFactor,
  scalePages,
  setMetadata,
  splitEvery,
  splitPagesInHalf,
  textPagesToPdf,
  trimMetadataField,
  unifiedPageSize,
  unifyPageSizes,
  wrapPdfText,
} from './pdf.ts'
import { MAX_EDITOR_HISTORY, popSnapshot, pushSnapshot, snapshotOf } from './history.ts'
import {
  blockEdgeDropTo,
  blockNudgeDropTo,
  clampPageRange,
  evenPageIndexes,
  indexesFromPageRange,
  invertPageIndexes,
  movingIndexesForDrag,
  nextPageAfterDelete,
  oddPageIndexes,
  pageRange,
  parseGotoPage,
  parsePageRange,
  parseSplitSize,
  togglePage,
} from './selection.ts'

async function samplePdf(pageLabels: string[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  for (const label of pageLabels) {
    const page = doc.addPage([200, 280])
    page.drawText(label, { x: 24, y: 140, size: 12 })
  }
  return new Uint8Array(await doc.save())
}

describe('pdf edits', () => {
  it('rotates a selected page', async () => {
    const bytes = await samplePdf(['A', 'B'])
    const rotated = await rotatePages(bytes, [0])
    const doc = await PDFDocument.load(rotated)
    expect(doc.getPage(0).getRotation().angle).toBe(90)
    expect(doc.getPage(1).getRotation().angle).toBe(0)
    const flipped = await rotatePagesBy(bytes, [1], 180)
    const flippedDoc = await PDFDocument.load(flipped)
    expect(flippedDoc.getPage(1).getRotation().angle).toBe(180)
    const back = await rotatePagesBy(rotated, [0], -90)
    expect((await PDFDocument.load(back)).getPage(0).getRotation().angle).toBe(0)
  })

  it('deletes a page and refuses to delete the last page', async () => {
    const bytes = await samplePdf(['A', 'B'])
    const next = await deletePages(bytes, [0])
    expect(await pageCount(next)).toBe(1)
    await expect(deletePages(next, [0])).rejects.toThrow(/ít nhất một trang/)
  })

  it('deletes several selected pages at once', async () => {
    const bytes = await samplePdf(['A', 'B', 'C', 'D'])
    const next = await deletePages(bytes, [1, 3])
    expect(await pageCount(next)).toBe(2)
    await expect(deletePages(bytes, [0, 1, 2, 3])).rejects.toThrow(/ít nhất một trang/)
  })

  it('reorders pages and merges at a chosen index', async () => {
    const first = await samplePdf(['A', 'B'])
    const moved = await movePage(first, 0, 1)
    expect(await pageCount(moved)).toBe(2)
    const extra = await samplePdf(['C'])
    const merged = await mergePdf(moved, extra, 1)
    expect(await pageCount(merged)).toBe(3)
    expect(mergeInsertIndex(2, 0, 'after')).toBe(1)
    expect(mergeInsertIndex(2, 0, 'start')).toBe(0)
    expect(mergeInsertIndex(2, 0, 'end')).toBe(2)
  })

  it('moves a multi-select as one contiguous block', async () => {
    const bytes = await samplePdf(['A', 'B', 'C', 'D'])
    expect(reorderPageBlock(3, [0], 2).order).toEqual([1, 2, 0])
    expect(reorderPageBlock(3, [2], 0).order).toEqual([2, 0, 1])
    expect(reorderPageBlock(4, [0, 1], 3)).toEqual({
      order: [2, 3, 0, 1],
      moved: [2, 3],
    })
    expect(reorderPageBlock(4, [2, 3], 0)).toEqual({
      order: [2, 3, 0, 1],
      moved: [0, 1],
    })
    expect(isIdentityOrder(reorderPageBlock(4, [1, 2], 1).order)).toBe(true)
    const blocked = await movePages(bytes, [0, 2], 3)
    expect(await pageCount(blocked)).toBe(4)
    const identity = await movePages(bytes, [1], 1)
    expect(identity).toBe(bytes)
  })

  it('draws a text overlay at a ratio', async () => {
    const bytes = await samplePdf(['A'])
    const next = await addTextOverlay(bytes, 0, 'Hi', { xRatio: 0.2, yRatio: 0.3 })
    expect(await pageCount(next)).toBe(1)
    await expect(addTextOverlay(bytes, 0, '   ')).rejects.toThrow(/Nhập nội dung/)
  })

  it('duplicates selected pages after the last selected index', async () => {
    const bytes = await samplePdf(['A', 'B', 'C'])
    expect(duplicatedIndexes([0, 2])).toEqual([3, 4])
    const duplicated = await duplicatePages(bytes, [0, 2])
    expect(await pageCount(duplicated)).toBe(5)
    await expect(duplicatePages(bytes, [])).rejects.toThrow(/nhân bản/)
  })

  it('reverses page order and stamps page numbers', async () => {
    const bytes = await samplePdf(['A', 'B', 'C'])
    expect(reversedIndexes(3, [0, 2])).toEqual([0, 2])
    expect(reversedIndexes(3, [0])).toEqual([2])
    const reversed = await reversePages(bytes)
    expect(await pageCount(reversed)).toBe(3)
    const identity = await reversePages(await samplePdf(['Only']))
    expect(await pageCount(identity)).toBe(1)
    expect(formatPageNumber(0, 4, 'n')).toBe('1')
    expect(formatPageNumber(1, 4, 'n-of-total')).toBe('2 / 4')
    expect(formatPageNumber(2, 4, 'trang-n')).toBe('Trang 3')
    const numbered = await addPageNumbers(bytes, {
      indexes: [0, 2],
      position: 'bottom-center',
      style: 'n-of-total',
    })
    expect(await pageCount(numbered)).toBe(3)
    await expect(addPageNumbers(bytes, { indexes: [] })).resolves.toBeTruthy()
  })

  it('extracts selected pages into a new PDF and inserts a blank page', async () => {
    const bytes = await samplePdf(['A', 'B', 'C'])
    const extracted = await extractPages(bytes, [0, 2])
    expect(await pageCount(extracted)).toBe(2)
    await expect(extractPages(bytes, [])).rejects.toThrow(/tách/)
    const withBlank = await insertBlankPage(bytes, 0)
    expect(await pageCount(withBlank)).toBe(4)
    const first = (await PDFDocument.load(bytes)).getPage(0).getSize()
    const blank = (await PDFDocument.load(withBlank)).getPage(1).getSize()
    expect(blank.width).toBe(first.width)
    expect(blank.height).toBe(first.height)
  })

  it('keeps only selected pages and splits every N pages', async () => {
    const bytes = await samplePdf(['A', 'B', 'C', 'D', 'E'])
    const kept = await keepPages(bytes, [0, 2, 4])
    expect(await pageCount(kept)).toBe(3)
    const identity = await keepPages(bytes, [0, 1, 2, 3, 4])
    expect(identity).toBe(bytes)
    await expect(keepPages(bytes, [])).rejects.toThrow(/giữ/)
    const parts = await splitEvery(bytes, 2)
    expect(parts).toHaveLength(3)
    expect(await pageCount(parts[0]!)).toBe(2)
    expect(await pageCount(parts[1]!)).toBe(2)
    expect(await pageCount(parts[2]!)).toBe(1)
    await expect(splitEvery(bytes, 0)).rejects.toThrow(/từ 1/)
    const zip = await zipPdfParts([
      { name: splitPartName('demo.pdf', 1, 2), bytes: parts[0]! },
      { name: splitPartName('demo.pdf', 2, 2), bytes: parts[1]! },
    ])
    const loaded = await JSZip.loadAsync(await zip.arrayBuffer())
    expect(loaded.file('demo-phan-1-cua-2.pdf')).toBeTruthy()
    expect(splitZipName('demo.pdf')).toBe('demo-tach.zip')
  })

  it('builds a PDF from imported text pages and wraps long lines', async () => {
    const pdf = await textPagesToPdf(['Hello', 'Page two'])
    expect(await pageCount(pdf)).toBe(2)
    expect(wrapPdfText('one two three', (value) => value.length, 7)).toEqual(['one two', 'three'])
    await expect(textPagesToPdf([])).rejects.toThrow(/nội dung/)
  })

  it('stamps a watermark and crops selected pages', async () => {
    const bytes = await samplePdf(['A', 'B'])
    expect(cropBoxAfterMargin({ x: 0, y: 0, width: 200, height: 280 }, 20)).toEqual({
      x: 20,
      y: 20,
      width: 160,
      height: 240,
    })
    expect(() => cropBoxAfterMargin({ x: 0, y: 0, width: 80, height: 80 }, 30)).toThrow(/Lề cắt/)
    const marked = await addWatermark(bytes, {
      text: 'DRAFT',
      indexes: [0],
      style: 'diagonal',
    })
    expect(await pageCount(marked)).toBe(2)
    const markedVi = await addWatermark(bytes, { text: 'Bản nháp', indexes: [1], style: 'footer' })
    expect(await pageCount(markedVi)).toBe(2)
    await expect(addWatermark(bytes, { text: '   ' })).rejects.toThrow(/chữ mờ/)
    const cropped = await cropPages(bytes, [1], CROP_MARGINS.medium)
    const before = (await PDFDocument.load(bytes)).getPage(1).getCropBox()
    const after = (await PDFDocument.load(cropped)).getPage(1).getCropBox()
    expect(after.width).toBeCloseTo(before.width - CROP_MARGINS.medium * 2)
    expect(after.height).toBeCloseTo(before.height - CROP_MARGINS.medium * 2)
    expect((await PDFDocument.load(cropped)).getPage(0).getCropBox().width).toBe(before.width)
    await expect(cropPages(bytes, [], 12)).rejects.toThrow(/cắt lề/)
    await expect(cropPages(bytes, [0], 90)).rejects.toThrow(/Lề cắt/)
    expect(paddedPageSize({ width: 200, height: 280 }, 12)).toEqual({
      width: 224,
      height: 304,
    })
    expect(() => paddedPageSize({ width: 200, height: 280 }, 0)).toThrow(/Lề thêm/)
    expect(() => paddedPageSize({ width: MAX_PADDED_SIDE, height: 40 }, 12)).toThrow(/quá lớn/)
    const padded = await padPages(bytes, [0], CROP_MARGINS.medium)
    const paddedDoc = await PDFDocument.load(padded)
    expect(paddedDoc.getPage(0).getSize()).toEqual({
      width: 200 + CROP_MARGINS.medium * 2,
      height: 280 + CROP_MARGINS.medium * 2,
    })
    expect(paddedDoc.getPage(1).getSize()).toEqual({ width: 200, height: 280 })
    await expect(padPages(bytes, [], 12)).rejects.toThrow(/thêm lề/)
    const headed = await addHeaderFooter(bytes, {
      header: 'Báo cáo',
      footer: 'Trang chân',
      indexes: [0],
    })
    expect(await pageCount(headed)).toBe(2)
    expect((await PDFDocument.load(headed)).getPage(1).getSize()).toEqual({
      width: 200,
      height: 280,
    })
    await expect(addHeaderFooter(bytes, { header: '  ', footer: '' })).rejects.toThrow(
      /đầu trang hoặc cuối trang/,
    )
    await expect(addHeaderFooter(bytes, { header: 'Hi', indexes: [9] })).rejects.toThrow(
      /đầu\/cuối trang/,
    )
  })

  it('unifies mixed page sizes onto one sheet', async () => {
    expect(unifiedPageSize([{ width: 200, height: 280 }, { width: 300, height: 240 }])).toEqual({
      width: 300,
      height: 280,
    })
    expect(pageSizeEquals({ width: 10, height: 10 }, { width: 10, height: 10 })).toBe(true)
    expect(pageSizeEquals({ width: 10, height: 10 }, { width: 11, height: 10 })).toBe(false)
    expect(() => unifiedPageSize([])).toThrow(/đồng khổ/)
    expect(() =>
      unifiedPageSize([{ width: MAX_PADDED_SIDE + 1, height: 40 }, { width: 12, height: 12 }]),
    ).toThrow(/quá lớn/)
    const mixed = await PDFDocument.create()
    for (const size of [
      [200, 280],
      [300, 240],
      [200, 280],
    ] as const) {
      const page = mixed.addPage([...size])
      page.drawText('P', { x: 24, y: 140, size: 12 })
    }
    const bytes = new Uint8Array(await mixed.save())
    const unified = await unifyPageSizes(bytes, [0, 1])
    const doc = await PDFDocument.load(unified)
    expect(doc.getPage(0).getSize()).toEqual({ width: 300, height: 280 })
    expect(doc.getPage(1).getSize()).toEqual({ width: 300, height: 280 })
    expect(doc.getPage(2).getSize()).toEqual({ width: 200, height: 280 })
    const same = await unifyPageSizes(bytes, [0, 2])
    expect(same).toBe(bytes)
    await expect(unifyPageSizes(bytes, [0])).rejects.toThrow(/đồng khổ/)
    await expect(unifyPageSizes(bytes, [])).rejects.toThrow(/đồng khổ/)
  })

  it('adds an A4 cover page and strokes an inset border', async () => {
    expect(borderBoxForPage({ width: 200, height: 280 }, 12)).toEqual({
      x: 12,
      y: 12,
      width: 176,
      height: 256,
    })
    expect(borderStrokeWidth(36)).toBeCloseTo(2)
    expect(() => borderBoxForPage({ width: 40, height: 40 }, 12)).toThrow(/Lề cắt/)
    expect(() => borderStrokeWidth(0)).toThrow(/Lề khung/)
    const bytes = await samplePdf(['A', 'B'])
    const bordered = await addPageBorder(bytes, [0], CROP_MARGINS.medium)
    expect(await pageCount(bordered)).toBe(2)
    expect((await PDFDocument.load(bordered)).getPage(1).getSize()).toEqual(
      (await PDFDocument.load(bytes)).getPage(1).getSize(),
    )
    await expect(addPageBorder(bytes, [], 12)).rejects.toThrow(/đóng khung/)
    await expect(addPageBorder(bytes, [0], 0)).rejects.toThrow(/Lề khung/)
    const covered = await addCoverPage(bytes, { title: 'Báo cáo', subtitle: '2026' })
    const coverDoc = await PDFDocument.load(covered)
    expect(coverDoc.getPageCount()).toBe(3)
    expect(coverDoc.getPage(0).getSize()).toEqual({ width: A4_WIDTH, height: A4_HEIGHT })
    expect(coverDoc.getPage(1).getSize()).toEqual((await PDFDocument.load(bytes)).getPage(0).getSize())
    await expect(addCoverPage(bytes, { title: '   ' })).rejects.toThrow(/tiêu đề trang bìa/)
  })

  it('overlays a reading tint and crops to ink bounds', async () => {
    expect(tintFill('cream')).toEqual(TINTS.cream)
    expect(() => tintFill('pink' as 'cream')).toThrow(/Màu đọc/)
    const bytes = await samplePdf(['A', 'B'])
    const tinted = await tintPages(bytes, [0], 'sepia')
    expect(await pageCount(tinted)).toBe(2)
    expect((await PDFDocument.load(tinted)).getPage(1).getSize()).toEqual(
      (await PDFDocument.load(bytes)).getPage(1).getSize(),
    )
    await expect(tintPages(bytes, [], 'night')).rejects.toThrow(/màu đọc/)

    expect(pageBackgroundFill('yellow')).toEqual(PAGE_BACKGROUNDS.yellow)
    expect(() => pageBackgroundFill('pink' as 'cream')).toThrow(/Màu nền/)
    const painted = await colorPageBackgrounds(bytes, [0], 'blue')
    expect(await pageCount(painted)).toBe(2)
    expect((await PDFDocument.load(painted)).getPage(0).getSize()).toEqual(
      (await PDFDocument.load(bytes)).getPage(0).getSize(),
    )
    expect((await PDFDocument.load(painted)).getPage(1).getSize()).toEqual(
      (await PDFDocument.load(bytes)).getPage(1).getSize(),
    )
    await expect(colorPageBackgrounds(bytes, [], 'gray')).rejects.toThrow(/phủ nền/)

    expect(assertPdfPassword('  secret  ', 'secret')).toBe('secret')
    expect(() => assertPdfPassword('   ')).toThrow(/mật khẩu/)
    expect(() => assertPdfPassword('one', 'two')).toThrow(/không khớp/)
    expect(encryptedPdfName('notes.pdf')).toBe('notes-khoa.pdf')
    const locked = await encryptPdfForDownload(bytes, 's3cret', 's3cret')
    expect(locked.byteLength).toBeGreaterThan(0)
    await expect(PDFDocument.load(locked)).rejects.toThrow(/encrypt/i)
    await expect(PDFDocument.load(bytes)).resolves.toBeTruthy()
    await expect(encryptPdfForDownload(bytes, '   ')).rejects.toThrow(/mật khẩu/)
    await expect(pageCount(locked)).rejects.toThrow(/khóa/)
    const opened = await decryptPdfForEdit(locked, 's3cret')
    expect(await pageCount(opened)).toBe(2)
    await expect(PDFDocument.load(opened)).resolves.toBeTruthy()
    await expect(decryptPdfForEdit(locked, 'wrong')).rejects.toThrow(/không đúng/)
    await expect(decryptPdfForEdit(locked, '   ')).rejects.toThrow(/mật khẩu/)

    const marked = await addOutlineBookmarks(bytes, [1], 'Chương hai')
    expect(await listOutlineBookmarks(marked)).toEqual([
      { title: 'Chương hai', pageIndex: 1, depth: 0 },
    ])
    const again = await addOutlineBookmarks(marked, [0, 1], 'Mục')
    expect(await listOutlineBookmarks(again)).toEqual([
      { title: 'Chương hai', pageIndex: 1, depth: 0 },
      { title: 'Mục · 1', pageIndex: 0, depth: 0 },
      { title: 'Mục · 2', pageIndex: 1, depth: 0 },
    ])
    await expect(addOutlineBookmarks(bytes, [], 'X')).rejects.toThrow(/trang/)
    await expect(addOutlineBookmarks(bytes, [0], '  ')).rejects.toThrow(/mục lục/)
    const nested = await addOutlineFolder(bytes, [0, 1], 'Phần A')
    expect(await listOutlineBookmarks(nested)).toEqual([
      { title: 'Phần A', pageIndex: 0, depth: 0, destless: true },
      { title: 'Phần A · 1', pageIndex: 0, depth: 1 },
      { title: 'Phần A · 2', pageIndex: 1, depth: 1 },
    ])
    const nestedDoc = await PDFDocument.load(nested)
    const nestedRoot = nestedDoc.catalog.lookup(PDFName.of('Outlines'), PDFDict)
    const nestedFolder = nestedDoc.context.lookup(nestedRoot.get(PDFName.of('First')), PDFDict)
    expect(nestedFolder.has(PDFName.of('Dest'))).toBe(false)
    expect(nestedFolder.has(PDFName.of('First'))).toBe(true)
    const nestedAgain = await addOutlineBookmarks(nested, [1], 'Phụ lục')
    expect(await listOutlineBookmarks(nestedAgain)).toEqual([
      { title: 'Phần A', pageIndex: 0, depth: 0, destless: true },
      { title: 'Phần A · 1', pageIndex: 0, depth: 1 },
      { title: 'Phần A · 2', pageIndex: 1, depth: 1 },
      { title: 'Phụ lục', pageIndex: 1, depth: 0 },
    ])
    await expect(addOutlineFolder(bytes, [], 'X')).rejects.toThrow(/trang/)
    const collapsed = await setOutlineFoldersOpen(nested, false)
    expect(await listOutlineBookmarks(collapsed)).toEqual([
      { title: 'Phần A', pageIndex: 0, depth: 0, destless: true, open: false },
      { title: 'Phần A · 1', pageIndex: 0, depth: 1 },
      { title: 'Phần A · 2', pageIndex: 1, depth: 1 },
    ])
    const collapsedDoc = await PDFDocument.load(collapsed)
    const outlines = collapsedDoc.catalog.lookup(PDFName.of('Outlines'), PDFDict)
    const firstFolder = collapsedDoc.context.lookup(outlines.get(PDFName.of('First')), PDFDict)
    expect(firstFolder.lookup(PDFName.of('Count'), PDFNumber).asNumber()).toBe(-2)
    expect(firstFolder.has(PDFName.of('Dest'))).toBe(false)
    const expanded = await setOutlineFoldersOpen(collapsed, true)
    expect(await listOutlineBookmarks(expanded)).toEqual([
      { title: 'Phần A', pageIndex: 0, depth: 0, destless: true },
      { title: 'Phần A · 1', pageIndex: 0, depth: 1 },
      { title: 'Phần A · 2', pageIndex: 1, depth: 1 },
    ])
    await expect(setOutlineFoldersOpen(bytes, false)).rejects.toThrow(/thư mục/)
    expect(MAX_OUTLINE_DEPTH).toBe(3)
    const deep = await addOutlineFolder(nested, [1], 'Mục 1', 0)
    expect(await listOutlineBookmarks(deep)).toEqual([
      { title: 'Phần A', pageIndex: 0, depth: 0, destless: true },
      { title: 'Phần A · 1', pageIndex: 0, depth: 1 },
      { title: 'Phần A · 2', pageIndex: 1, depth: 1 },
      { title: 'Mục 1', pageIndex: 1, depth: 1, destless: true },
      { title: 'Mục 1 · 2', pageIndex: 1, depth: 2 },
    ])
    expect(outlineItemIsFolder(await listOutlineBookmarks(deep), 0)).toBe(true)
    expect(outlineItemIsFolder(await listOutlineBookmarks(deep), 3)).toBe(true)
    expect(outlineItemIsFolder(await listOutlineBookmarks(deep), 4)).toBe(false)
    const deeper = await addOutlineFolder(deep, [0], 'Mục 1a', 3)
    expect(await listOutlineBookmarks(deeper)).toEqual([
      { title: 'Phần A', pageIndex: 0, depth: 0, destless: true },
      { title: 'Phần A · 1', pageIndex: 0, depth: 1 },
      { title: 'Phần A · 2', pageIndex: 1, depth: 1 },
      { title: 'Mục 1', pageIndex: 1, depth: 1, destless: true },
      { title: 'Mục 1 · 2', pageIndex: 1, depth: 2 },
      { title: 'Mục 1a', pageIndex: 0, depth: 2, destless: true },
      { title: 'Mục 1a · 1', pageIndex: 0, depth: 3 },
    ])
    await expect(addOutlineFolder(deeper, [0], 'Quá sâu', 5)).rejects.toThrow(/3 cấp/)
    await expect(addOutlineFolder(nested, [0], 'X', 9)).rejects.toThrow(/mục lục cha/)
    expect(canMoveOutlineItem(await listOutlineBookmarks(nestedAgain), 0, 'down')).toBe(true)
    expect(canMoveOutlineItem(await listOutlineBookmarks(nestedAgain), 0, 'up')).toBe(false)
    expect(canMoveOutlineItem(await listOutlineBookmarks(nestedAgain), 3, 'down')).toBe(false)
    expect(outlineIndexAfterMove(await listOutlineBookmarks(nestedAgain), 0, 'down')).toBe(1)
    const movedDown = await moveOutlineItem(nestedAgain, 0, 'down')
    expect(await listOutlineBookmarks(movedDown)).toEqual([
      { title: 'Phụ lục', pageIndex: 1, depth: 0 },
      { title: 'Phần A', pageIndex: 0, depth: 0, destless: true },
      { title: 'Phần A · 1', pageIndex: 0, depth: 1 },
      { title: 'Phần A · 2', pageIndex: 1, depth: 1 },
    ])
    const movedUp = await moveOutlineItem(movedDown, 1, 'up')
    expect(await listOutlineBookmarks(movedUp)).toEqual(await listOutlineBookmarks(nestedAgain))
    const movedChild = await moveOutlineItem(nested, 1, 'down')
    expect(await listOutlineBookmarks(movedChild)).toEqual([
      { title: 'Phần A', pageIndex: 1, depth: 0, destless: true },
      { title: 'Phần A · 2', pageIndex: 1, depth: 1 },
      { title: 'Phần A · 1', pageIndex: 0, depth: 1 },
    ])
    await expect(moveOutlineItem(nestedAgain, 0, 'up')).rejects.toThrow(/trên cùng/)
    await expect(moveOutlineItem(nestedAgain, 3, 'down')).rejects.toThrow(/dưới cùng/)
    await expect(moveOutlineItem(bytes, 0, 'up')).rejects.toThrow(/mục lục/)
    expect(canIndentOutlineItem(await listOutlineBookmarks(nested), 0)).toBe(false)
    expect(canIndentOutlineItem(await listOutlineBookmarks(nested), 2)).toBe(true)
    expect(canOutdentOutlineItem(await listOutlineBookmarks(nested), 0)).toBe(false)
    expect(canOutdentOutlineItem(await listOutlineBookmarks(nested), 1)).toBe(true)
    expect(outlineIndexAfterIndent(await listOutlineBookmarks(nested), 2)).toBe(2)
    expect(outlineIndexAfterOutdent(await listOutlineBookmarks(nested), 1)).toBe(2)
    const indentedChild = await indentOutlineItem(nested, 2)
    expect(await listOutlineBookmarks(indentedChild)).toEqual([
      { title: 'Phần A', pageIndex: 1, depth: 0, destless: true },
      { title: 'Phần A · 1', pageIndex: 1, depth: 1, destless: true },
      { title: 'Phần A · 2', pageIndex: 1, depth: 2 },
    ])
    const outdentedChild = await outdentOutlineItem(indentedChild, 2)
    expect(await listOutlineBookmarks(outdentedChild)).toEqual([
      { title: 'Phần A', pageIndex: 1, depth: 0, destless: true },
      { title: 'Phần A · 1', pageIndex: 1, depth: 1 },
      { title: 'Phần A · 2', pageIndex: 1, depth: 1 },
    ])
    const outdentedFirst = await outdentOutlineItem(nested, 1)
    expect(await listOutlineBookmarks(outdentedFirst)).toEqual([
      { title: 'Phần A', pageIndex: 1, depth: 0, destless: true },
      { title: 'Phần A · 2', pageIndex: 1, depth: 1 },
      { title: 'Phần A · 1', pageIndex: 0, depth: 0 },
    ])
    const indentedTop = await indentOutlineItem(nestedAgain, 3)
    expect(await listOutlineBookmarks(indentedTop)).toEqual([
      { title: 'Phần A', pageIndex: 0, depth: 0, destless: true },
      { title: 'Phần A · 1', pageIndex: 0, depth: 1 },
      { title: 'Phần A · 2', pageIndex: 1, depth: 1 },
      { title: 'Phụ lục', pageIndex: 1, depth: 1 },
    ])
    await expect(indentOutlineItem(nested, 0)).rejects.toThrow(/liền trước/)
    await expect(outdentOutlineItem(nested, 0)).rejects.toThrow(/ngoài cùng/)
    await expect(indentOutlineItem(bytes, 0)).rejects.toThrow(/mục lục/)
    await expect(outdentOutlineItem(bytes, 0)).rejects.toThrow(/mục lục/)
    expect(canIndentOutlineItem(await listOutlineBookmarks(deeper), 5)).toBe(false)
    expect(canIndentOutlineItem(await listOutlineBookmarks(deeper), 6)).toBe(false)
    await expect(indentOutlineItem(deeper, 6)).rejects.toThrow(/liền trước/)
    await expect(indentOutlineItem(deeper, 5)).rejects.toThrow(/3 cấp/)
    const retargeted = await setOutlineDest(marked, 0, 0)
    expect((await listOutlineBookmarks(retargeted))[0]).toEqual({
      title: 'Chương hai',
      pageIndex: 0,
      depth: 0,
    })
    await expect(setOutlineDest(nested, 0, 1)).rejects.toThrow(/gắn trang đích/)
    await expect(setOutlineDest(marked, 0, 9)).rejects.toThrow(/trang đích/)
    await expect(setOutlineDest(bytes, 0, 0)).rejects.toThrow(/mục lục/)
    const oneClosed = await setOutlineFolderOpen(deep, 3, false)
    expect(await listOutlineBookmarks(oneClosed)).toEqual([
      { title: 'Phần A', pageIndex: 0, depth: 0, destless: true },
      { title: 'Phần A · 1', pageIndex: 0, depth: 1 },
      { title: 'Phần A · 2', pageIndex: 1, depth: 1 },
      { title: 'Mục 1', pageIndex: 1, depth: 1, destless: true, open: false },
      { title: 'Mục 1 · 2', pageIndex: 1, depth: 2 },
    ])
    expect(visibleOutlineItems(await listOutlineBookmarks(oneClosed)).map((row) => row.index)).toEqual([
      0, 1, 2, 3,
    ])
    const parentClosed = await setOutlineFolderOpen(oneClosed, 0, false)
    expect((await listOutlineBookmarks(parentClosed))[0]).toEqual({
      title: 'Phần A',
      pageIndex: 0,
      depth: 0,
      destless: true,
      open: false,
    })
    expect((await listOutlineBookmarks(parentClosed))[3]).toEqual({
      title: 'Mục 1',
      pageIndex: 1,
      depth: 1,
      destless: true,
      open: false,
    })
    expect(visibleOutlineItems(await listOutlineBookmarks(parentClosed)).map((row) => row.index)).toEqual([
      0,
    ])
    const reopened = await setOutlineFolderOpen(parentClosed, 0, true)
    expect((await listOutlineBookmarks(reopened))[0]).toEqual({
      title: 'Phần A',
      pageIndex: 0,
      depth: 0,
      destless: true,
    })
    await expect(setOutlineFolderOpen(deep, 4, false)).rejects.toThrow(/không phải thư mục/)
    await expect(setOutlineFolderOpen(deep, 9, false)).rejects.toThrow(/thư mục/)
    const renamed = await renameOutlineItem(nested, 0, 'Chương A')
    expect((await listOutlineBookmarks(renamed))[0]).toEqual({
      title: 'Chương A',
      pageIndex: 0,
      depth: 0,
      destless: true,
    })
    await expect(renameOutlineItem(nested, 9, 'X')).rejects.toThrow(/mục lục/)
    await expect(renameOutlineItem(nested, 0, '  ')).rejects.toThrow(/mục lục/)
    const removedLeaf = await removeOutlineItem(nested, 2)
    expect(await listOutlineBookmarks(removedLeaf)).toEqual([
      { title: 'Phần A', pageIndex: 0, depth: 0, destless: true },
      { title: 'Phần A · 1', pageIndex: 0, depth: 1 },
    ])
    const removedFolder = await removeOutlineItem(nested, 0)
    expect(await listOutlineBookmarks(removedFolder)).toEqual([
      { title: 'Phần A · 1', pageIndex: 0, depth: 0 },
      { title: 'Phần A · 2', pageIndex: 1, depth: 0 },
    ])
    const lastBookmark = await addOutlineBookmarks(bytes, [0], 'Một')
    expect(await listOutlineBookmarks(await removeOutlineItem(lastBookmark, 0))).toEqual([])
    await expect(removeOutlineItem(bytes, 0)).rejects.toThrow(/mục lục/)
    const cleared = await clearOutline(nested)
    expect(await listOutlineBookmarks(cleared)).toEqual([])
    await expect(clearOutline(bytes)).rejects.toThrow(/mục lục/)

    const named = await addNamedDest(bytes, 'ChapTwo', 1)
    expect(await listNamedDests(named)).toEqual([{ name: 'ChapTwo', pageIndex: 1 }])
    expect(await listNamedDests(await addNamedDest(named, 'ChapTwo', 1))).toEqual([
      { name: 'ChapTwo', pageIndex: 1 },
    ])
    await expect(addNamedDest(named, 'ChapTwo', 0)).rejects.toThrow(/đã dùng/)
    await expect(addNamedDest(bytes, '  ', 0)).rejects.toThrow(/tên đích/)
    await expect(addNamedDest(bytes, '1bad', 0)).rejects.toThrow(/chữ/)
    await expect(addNamedDest(bytes, 'Chap', 9)).rejects.toThrow(/trang đích/)
    const namedLeaf = await addOutlineBookmarks(named, [0], 'Mở đầu')
    const linked = await setOutlineNamedDest(namedLeaf, 0, 'ChapTwo')
    expect((await listOutlineBookmarks(linked))[0]).toEqual({
      title: 'Mở đầu',
      pageIndex: 1,
      depth: 0,
      destName: 'ChapTwo',
    })
    const linkedDoc = await PDFDocument.load(linked)
    const linkedRoot = linkedDoc.catalog.lookup(PDFName.of('Outlines'), PDFDict)
    const linkedItem = linkedDoc.context.lookup(linkedRoot.get(PDFName.of('First')), PDFDict)
    expect(linkedItem.lookup(PDFName.of('Dest'), PDFName)).toEqual(PDFName.of('ChapTwo'))
    const unlinked = await setOutlineDest(linked, 0, 0)
    expect((await listOutlineBookmarks(unlinked))[0]).toEqual({
      title: 'Mở đầu',
      pageIndex: 0,
      depth: 0,
    })
    await expect(setOutlineNamedDest(nested, 0, 'ChapTwo')).rejects.toThrow(/đích tên/)
    await expect(setOutlineNamedDest(namedLeaf, 0, 'Missing')).rejects.toThrow(/đích tên/)
    await expect(setOutlineNamedDest(bytes, 0, 'ChapTwo')).rejects.toThrow(/mục lục/)
    const namedFolder = await addNamedDest(nested, 'ChapTwo', 1)
    const folderLinked = await setOutlineNamedDest(namedFolder, 0, 'ChapTwo')
    expect((await listOutlineBookmarks(folderLinked))[0]).toEqual({
      title: 'Phần A',
      pageIndex: 1,
      depth: 0,
      destName: 'ChapTwo',
    })
    const folderDoc = await PDFDocument.load(folderLinked)
    const folderRoot = folderDoc.catalog.lookup(PDFName.of('Outlines'), PDFDict)
    const folderItem = folderDoc.context.lookup(folderRoot.get(PDFName.of('First')), PDFDict)
    expect(folderItem.lookup(PDFName.of('Dest'), PDFName)).toEqual(PDFName.of('ChapTwo'))
    const folderRetarget = await setNamedDestPage(folderLinked, 'ChapTwo', 0)
    expect(await listNamedDests(folderRetarget)).toEqual([{ name: 'ChapTwo', pageIndex: 0 }])
    expect((await listOutlineBookmarks(folderRetarget))[0]).toEqual({
      title: 'Phần A',
      pageIndex: 0,
      depth: 0,
      destName: 'ChapTwo',
    })

    const namedDoc = await PDFDocument.load(named)
    const namesTree = namedDoc.catalog.lookup(PDFName.of('Names'), PDFDict)
    const destsTree = namesTree.lookup(PDFName.of('Dests'), PDFDict)
    expect(destsTree.lookup(PDFName.of('Names'))).toBeTruthy()
    expect(await listNamedDests(await renameNamedDest(named, 'ChapTwo', 'ChapTwo'))).toEqual([
      { name: 'ChapTwo', pageIndex: 1 },
    ])
    const renamedDest = await renameNamedDest(linked, 'ChapTwo', 'Chap2')
    expect(await listNamedDests(renamedDest)).toEqual([{ name: 'Chap2', pageIndex: 1 }])
    expect((await listOutlineBookmarks(renamedDest))[0]).toEqual({
      title: 'Mở đầu',
      pageIndex: 1,
      depth: 0,
      destName: 'Chap2',
    })
    const renamedDoc = await PDFDocument.load(renamedDest)
    expect(renamedDoc.catalog.lookupMaybe(PDFName.of('Dests'), PDFDict)?.get(PDFName.of('ChapTwo'))).toBeUndefined()
    await expect(renameNamedDest(named, 'ChapTwo', '  ')).rejects.toThrow(/tên đích/)
    await expect(renameNamedDest(named, 'Missing', 'Chap2')).rejects.toThrow(/đích tên/)
    await expect(renameNamedDest(await addNamedDest(named, 'ChapOne', 0), 'ChapTwo', 'ChapOne')).rejects.toThrow(
      /đã dùng/,
    )
    await expect(renameNamedDest(named, 'ChapTwo', '1bad')).rejects.toThrow(/chữ/)

    const clearedDest = await removeNamedDest(linked, 'ChapTwo')
    expect(await listNamedDests(clearedDest)).toEqual([])
    expect((await listOutlineBookmarks(clearedDest))[0]).toEqual({
      title: 'Mở đầu',
      pageIndex: 1,
      depth: 0,
    })
    const emptyDestDoc = await PDFDocument.load(clearedDest)
    expect(emptyDestDoc.catalog.lookupMaybe(PDFName.of('Dests'), PDFDict)).toBeUndefined()
    expect(
      emptyDestDoc.catalog.lookupMaybe(PDFName.of('Names'), PDFDict)?.lookupMaybe(PDFName.of('Dests'), PDFDict),
    ).toBeUndefined()
    await expect(removeNamedDest(named, 'Missing')).rejects.toThrow(/đích tên/)
    await expect(removeNamedDest(named, '  ')).rejects.toThrow(/tên đích/)

    expect(await listNamedDests(await setNamedDestPage(named, 'ChapTwo', 1))).toEqual([
      { name: 'ChapTwo', pageIndex: 1 },
    ])
    const retargetedDest = await setNamedDestPage(named, 'ChapTwo', 0)
    expect(await listNamedDests(retargetedDest)).toEqual([{ name: 'ChapTwo', pageIndex: 0 }])
    const linkedRetarget = await setNamedDestPage(linked, 'ChapTwo', 0)
    expect((await listOutlineBookmarks(linkedRetarget))[0]).toEqual({
      title: 'Mở đầu',
      pageIndex: 0,
      depth: 0,
      destName: 'ChapTwo',
    })
    await expect(setNamedDestPage(named, 'Missing', 0)).rejects.toThrow(/đích tên/)
    await expect(setNamedDestPage(named, 'ChapTwo', 9)).rejects.toThrow(/trang đích/)
    await expect(setNamedDestPage(bytes, 'ChapTwo', 0)).rejects.toThrow(/đích tên/)
    await expect(setNamedDestPage(named, '  ', 0)).rejects.toThrow(/tên đích/)
    expect(parseNamedDestPageInput('2', 2)).toBe(1)
    expect(parseNamedDestPageInput('1', 2)).toBe(0)
    expect(parseNamedDestPageInput('', 2)).toBeNull()
    expect(parseNamedDestPageInput('0', 2)).toBeNull()
    expect(parseNamedDestPageInput('3', 2)).toBeNull()
    expect(parseNamedDestPageInput('1.5', 2)).toBeNull()

    const foreign = await PDFDocument.load(bytes)
    const foreignPages = foreign.getPages()
    const destAlpha = foreign.context.register(
      foreign.context.obj([foreignPages[0]!.ref, PDFName.of('XYZ'), null, null, null]),
    )
    const destBeta = foreign.context.register(
      foreign.context.obj([foreignPages[1]!.ref, PDFName.of('XYZ'), null, null, null]),
    )
    const leafA = foreign.context.obj({})
    leafA.set(PDFName.of('Limits'), foreign.context.obj([PDFHexString.fromText('Alpha'), PDFHexString.fromText('Alpha')]))
    const namesA = foreign.context.obj([])
    namesA.push(PDFHexString.fromText('Alpha'))
    namesA.push(destAlpha)
    leafA.set(PDFName.of('Names'), namesA)
    const leafB = foreign.context.obj({})
    leafB.set(PDFName.of('Limits'), foreign.context.obj([PDFHexString.fromText('Beta'), PDFHexString.fromText('Beta')]))
    const namesB = foreign.context.obj([])
    namesB.push(PDFHexString.fromText('Beta'))
    namesB.push(destBeta)
    leafB.set(PDFName.of('Names'), namesB)
    const kids = foreign.context.obj([])
    kids.push(foreign.context.register(leafA))
    kids.push(foreign.context.register(leafB))
    const tree = foreign.context.obj({})
    tree.set(PDFName.of('Kids'), kids)
    const namesDict = foreign.context.obj({})
    namesDict.set(PDFName.of('Dests'), tree)
    foreign.catalog.set(PDFName.of('Names'), namesDict)
    const foreignBytes = new Uint8Array(await foreign.save())
    expect(await listNamedDests(foreignBytes)).toEqual([
      { name: 'Alpha', pageIndex: 0 },
      { name: 'Beta', pageIndex: 1 },
    ])
    const mergedKids = await addNamedDest(foreignBytes, 'ChapTwo', 1)
    expect(await listNamedDests(mergedKids)).toEqual([
      { name: 'Alpha', pageIndex: 0 },
      { name: 'Beta', pageIndex: 1 },
      { name: 'ChapTwo', pageIndex: 1 },
    ])
    const mergedDoc = await PDFDocument.load(mergedKids)
    const mergedTree = mergedDoc.catalog
      .lookup(PDFName.of('Names'), PDFDict)
      .lookup(PDFName.of('Dests'), PDFDict)
    expect(mergedTree.lookup(PDFName.of('Kids'), PDFArray).size()).toBe(3)
    expect(mergedTree.lookupMaybe(PDFName.of('Names'), PDFArray)).toBeUndefined()
    const duplicated = await duplicateNamedDest(named, 'ChapTwo', 'ChapTwoCopy')
    expect(await listNamedDests(duplicated)).toEqual([
      { name: 'ChapTwo', pageIndex: 1 },
      { name: 'ChapTwoCopy', pageIndex: 1 },
    ])
    await expect(duplicateNamedDest(named, 'ChapTwo', 'ChapTwo')).rejects.toThrow(/đã dùng/)
    await expect(duplicateNamedDest(bytes, 'ChapTwo', 'ChapTwoCopy')).rejects.toThrow(/đích tên/)
    await expect(duplicateNamedDest(named, 'ChapTwo', '1bad')).rejects.toThrow(/chữ/)

    let branched = bytes
    for (const name of ['ChapA', 'ChapB', 'ChapC', 'ChapD', 'ChapE']) {
      branched = await addNamedDest(branched, name, name === 'ChapE' ? 1 : 0)
    }
    expect(NAMED_DEST_LEAF_SIZE).toBe(4)
    const branchedDoc = await PDFDocument.load(branched)
    const branchedTree = branchedDoc.catalog
      .lookup(PDFName.of('Names'), PDFDict)
      .lookup(PDFName.of('Dests'), PDFDict)
    expect(branchedTree.lookup(PDFName.of('Kids'), PDFArray).size()).toBe(2)
    expect(branchedTree.lookupMaybe(PDFName.of('Names'), PDFArray)).toBeUndefined()
    expect(await listNamedDests(branched)).toEqual([
      { name: 'ChapA', pageIndex: 0 },
      { name: 'ChapB', pageIndex: 0 },
      { name: 'ChapC', pageIndex: 0 },
      { name: 'ChapD', pageIndex: 0 },
      { name: 'ChapE', pageIndex: 1 },
    ])
    const retargetLeaf = await setNamedDestPage(branched, 'ChapA', 1)
    expect(await listNamedDests(retargetLeaf)).toEqual([
      { name: 'ChapA', pageIndex: 1 },
      { name: 'ChapB', pageIndex: 0 },
      { name: 'ChapC', pageIndex: 0 },
      { name: 'ChapD', pageIndex: 0 },
      { name: 'ChapE', pageIndex: 1 },
    ])
    expect(destNameTreeHasIntermediate(branchedDoc)).toBe(false)
    expect(destNameTreeChildSpan(17, NAMED_DEST_LEAF_SIZE)).toBe(16)
    expect(destNameTreeChildSpan(5, NAMED_DEST_LEAF_SIZE)).toBe(4)
    expect(destNameTreeChildSpan(3, 1)).toBe(1)

    let nestedKids = bytes
    for (let index = 0; index < 17; index += 1) {
      nestedKids = await addNamedDest(nestedKids, `Chap${String(index + 1).padStart(2, '0')}`, index === 16 ? 1 : 0)
    }
    const nestedKidsDoc = await PDFDocument.load(nestedKids)
    const nestedKidsTree = nestedKidsDoc.catalog
      .lookup(PDFName.of('Names'), PDFDict)
      .lookup(PDFName.of('Dests'), PDFDict)
    expect(nestedKidsTree.lookup(PDFName.of('Kids'), PDFArray).size()).toBe(2)
    expect(destNameTreeHasIntermediate(nestedKidsDoc)).toBe(true)
    expect(destNameTreeStyleFromDoc(nestedKidsDoc)).toEqual({
      forceKids: true,
      leafSize: NAMED_DEST_LEAF_SIZE,
    })
    const expectedNested = Array.from({ length: 17 }, (_, index) => ({
      name: `Chap${String(index + 1).padStart(2, '0')}`,
      pageIndex: index === 16 ? 1 : 0,
    }))
    expect(await listNamedDests(nestedKids)).toEqual(expectedNested)
    const retargetNested = await setNamedDestPage(nestedKids, 'Chap01', 1)
    expect(destNameTreeHasIntermediate(await PDFDocument.load(retargetNested))).toBe(true)
    expect(await listNamedDests(retargetNested)).toEqual(
      expectedNested.map((dest) => (dest.name === 'Chap01' ? { ...dest, pageIndex: 1 } : dest)),
    )

    expect(namedDestNameForPage(0, new Set())).toBe('p1')
    expect(namedDestNameForPage(0, new Set(['p1']))).toBe('p1-2')
    const selectedDests = await addNamedDestsForSelection(bytes, [1, 0])
    expect(await listNamedDests(selectedDests)).toEqual([
      { name: 'p1', pageIndex: 0 },
      { name: 'p2', pageIndex: 1 },
    ])
    const collisionDests = await addNamedDestsForSelection(await addNamedDest(bytes, 'p1', 1), [0])
    expect(await listNamedDests(collisionDests)).toEqual([
      { name: 'p1', pageIndex: 1 },
      { name: 'p1-2', pageIndex: 0 },
    ])
    await expect(addNamedDestsForSelection(bytes, [])).rejects.toThrow(/trang/)
    await expect(addNamedDestsForSelection(bytes, [9])).rejects.toThrow(/trang đích/)
    const linkedCleared = await clearNamedDests(linked)
    expect(await listNamedDests(linkedCleared)).toEqual([])
    expect((await listOutlineBookmarks(linkedCleared))[0]).toEqual({
      title: 'Mở đầu',
      pageIndex: 1,
      depth: 0,
    })
    const emptyClearDoc = await PDFDocument.load(linkedCleared)
    expect(emptyClearDoc.catalog.lookupMaybe(PDFName.of('Dests'), PDFDict)).toBeUndefined()
    await expect(clearNamedDests(bytes)).rejects.toThrow(/đích tên/)

    expect(toRomanNumeral(2)).toBe('ii')
    expect(toRomanNumeral(4, true)).toBe('IV')
    expect(formatPageLabel('trang', 3)).toBe('Trang 3')
    expect(formatPageLabel('roman', 2)).toBe('ii')
    expect(frontMatterPageCount([0, 1], 4)).toBe(2)
    expect(frontMatterPageCount([0, 1, 2, 3], 4)).toBeNull()
    expect(frontMatterPageCount([1, 2], 4)).toBeNull()
    const labeled = await setPageLabels(bytes, 'trang')
    expect(await listPageLabels(labeled)).toEqual([
      { startIndex: 0, style: 'trang', prefix: 'Trang ', start: 1 },
    ])
    const roman = await setPageLabels(bytes, 'roman', 1)
    expect(await listPageLabels(roman)).toEqual([
      { startIndex: 0, style: 'roman', prefix: '', start: 1 },
    ])
    const split = await setFrontMatterPageLabels(await samplePdf(['A', 'B', 'C']), 1)
    expect(await listPageLabels(split)).toEqual([
      { startIndex: 0, style: 'roman', prefix: '', start: 1 },
      { startIndex: 1, style: 'decimal', prefix: '', start: 1 },
    ])
    expect(pageLabelForIndex([], 0)).toBe('1')
    expect(pageLabelForIndex([{ startIndex: 0, style: 'roman', prefix: '', start: 1 }], 1)).toBe(
      'ii',
    )
    expect(pageLabelsForCount(await listPageLabels(split), 3)).toEqual(['i', '1', '2'])
    expect(pageLabelsForCount(await listPageLabels(labeled), 2)).toEqual(['Trang 1', 'Trang 2'])
    await expect(setPageLabels(bytes, 'decimal', 0)).rejects.toThrow(/bắt đầu/)
    await expect(setFrontMatterPageLabels(bytes, 2)).rejects.toThrow(/mở đầu/)
    await expect(extractEmbeddedImages(bytes, [0])).rejects.toThrow(/ảnh nhúng/)
    await expect(extractEmbeddedImages(bytes, [])).rejects.toThrow(/ảnh nhúng/)

    const pixels = new Uint8ClampedArray(4 * 4 * 4)
    pixels.fill(255)
    pixels[4 * (1 * 4 + 1)] = 10
    pixels[4 * (1 * 4 + 1) + 1] = 10
    pixels[4 * (1 * 4 + 1) + 2] = 10
    pixels[4 * (1 * 4 + 1) + 3] = 255
    pixels[4 * (2 * 4 + 2)] = 20
    pixels[4 * (2 * 4 + 2) + 1] = 20
    pixels[4 * (2 * 4 + 2) + 2] = 20
    pixels[4 * (2 * 4 + 2) + 3] = 255
    expect(contentBoundsFromRgba(pixels, 4, 4)).toEqual({ minX: 1, minY: 1, maxX: 2, maxY: 2 })
    expect(contentBoundsFromRgba(new Uint8ClampedArray(16).fill(255), 2, 2)).toBeNull()

    const box = cropBoxFromContentBounds(
      { width: 200, height: 280 },
      { width: 4, height: 4 },
      { minX: 1, minY: 1, maxX: 2, maxY: 2 },
      0,
    )
    expect(box).toEqual({ x: 50, y: 70, width: 100, height: 140 })
    expect(pageBoxEquals(box, { x: 50.2, y: 70.1, width: 100, height: 140 })).toBe(true)
    expect(() =>
      cropBoxFromContentBounds(
        { width: 40, height: 40 },
        { width: 40, height: 40 },
        { minX: 18, minY: 18, maxX: 19, maxY: 19 },
        0,
      ),
    ).toThrow(/quá nhỏ/)

    const cropped = await autoCropPages(
      bytes,
      [0],
      [{ index: 0, data: pixels, width: 4, height: 4 }],
      contentBoundsFromRgba,
    )
    const cropDoc = await PDFDocument.load(cropped)
    const next = cropDoc.getPage(0).getCropBox()
    expect(next.width).toBeLessThan(200)
    expect(next.height).toBeLessThan(280)
    expect(cropDoc.getPage(1).getCropBox().width).toBe(200)
    await expect(autoCropPages(bytes, [], [], contentBoundsFromRgba)).rejects.toThrow(/cắt lề trắng/)
    await expect(
      autoCropPages(
        bytes,
        [0],
        [{ index: 0, data: new Uint8ClampedArray(16).fill(255), width: 2, height: 2 }],
        contentBoundsFromRgba,
      ),
    ).rejects.toThrow(/Không tìm thấy nội dung/)
    const same = await applyContentCrops(bytes, [
      { index: 0, box: { x: 0, y: 0, width: 200, height: 280 } },
    ])
    expect(same).toBe(bytes)
    expect(AUTO_CROP_PADDING).toBe(8)
  })

  it('writes metadata and builds pages from PNG images', async () => {
    const bytes = await samplePdf(['A', 'B'])
    expect(trimMetadataField('  Xin   chào  ')).toBe('Xin chào')
    expect(trimMetadataField('x'.repeat(MAX_METADATA_LENGTH + 8))).toHaveLength(MAX_METADATA_LENGTH)
    const labeled = await setMetadata(bytes, {
      title: 'Báo cáo',
      author: 'Phú',
      subject: 'PDF',
    })
    await expect(readMetadata(labeled)).resolves.toEqual({
      title: 'Báo cáo',
      author: 'Phú',
      subject: 'PDF',
    })
    expect(imagePageSize(100, 50)).toEqual({ width: 100, height: 50 })
    expect(imagePageSize(2000, 1000)).toEqual({
      width: IMAGE_PAGE_MAX_EDGE,
      height: IMAGE_PAGE_MAX_EDGE / 2,
    })
    const png = tinyPng()
    const fromImage = await imagesToPdf([{ bytes: png, kind: 'png' }])
    expect(await pageCount(fromImage)).toBe(1)
    const pulled = await extractEmbeddedImages(fromImage, [0])
    expect(pulled).toHaveLength(1)
    expect(pulled[0]?.kind).toBe('png')
    expect(pulled[0]?.bytes.byteLength).toBeGreaterThan(8)
    expect(pulled[0]?.bytes[0]).toBe(0x89)
    await expect(imagesToPdf([])).rejects.toThrow(/ảnh PNG/)
    const inserted = await insertImages(bytes, [{ bytes: png, kind: 'png' }], 1)
    expect(await pageCount(inserted)).toBe(3)
    const covered = await replacePagesWithPngs(bytes, [{ index: 0, png }])
    expect(await pageCount(covered)).toBe(2)
    await expect(replacePagesWithPngs(bytes, [])).rejects.toThrow(/ảnh/)
  })

  it('fits selected pages onto A4 while leaving others', async () => {
    expect(fittedPageRect({ width: 200, height: 100 }, { width: 400, height: 400 })).toEqual({
      x: 0,
      y: 100,
      width: 400,
      height: 200,
    })
    expect(a4SizeForPage({ width: 800, height: 400 })).toEqual({
      width: A4_HEIGHT,
      height: A4_WIDTH,
    })
    expect(a4SizeForPage({ width: 400, height: 800 })).toEqual({
      width: A4_WIDTH,
      height: A4_HEIGHT,
    })
    const bytes = await samplePdf(['A', 'B'])
    const fitted = await fitPagesToA4(bytes, [0])
    const doc = await PDFDocument.load(fitted)
    expect(doc.getPageCount()).toBe(2)
    const first = doc.getPage(0).getSize()
    expect(first.width).toBeCloseTo(A4_WIDTH)
    expect(first.height).toBeCloseTo(A4_HEIGHT)
    const second = doc.getPage(1).getSize()
    expect(second.width).toBe(200)
    expect(second.height).toBe(280)
    await expect(fitPagesToA4(bytes, [])).rejects.toThrow(/A4/)
  })

  it('fits selected pages onto Letter or A5', async () => {
    expect(paperSizeForPage({ width: 800, height: 400 }, 'letter')).toEqual({
      width: LETTER_HEIGHT,
      height: LETTER_WIDTH,
    })
    expect(paperSizeForPage({ width: 400, height: 800 }, 'a5')).toEqual({
      width: A5_WIDTH,
      height: A5_HEIGHT,
    })
    expect(PAPER_LABELS.letter).toBe('Letter')
    const bytes = await samplePdf(['A', 'B'])
    const letter = await fitPagesToPaper(bytes, [0], 'letter')
    const letterDoc = await PDFDocument.load(letter)
    expect(letterDoc.getPage(0).getSize().width).toBeCloseTo(LETTER_WIDTH)
    expect(letterDoc.getPage(0).getSize().height).toBeCloseTo(LETTER_HEIGHT)
    expect(letterDoc.getPage(1).getSize()).toEqual({ width: 200, height: 280 })
    const a5 = await fitPagesToPaper(bytes, [1], 'a5')
    const a5Doc = await PDFDocument.load(a5)
    expect(a5Doc.getPage(1).getSize().width).toBeCloseTo(A5_WIDTH)
    expect(a5Doc.getPage(1).getSize().height).toBeCloseTo(A5_HEIGHT)
    await expect(fitPagesToPaper(bytes, [], 'letter')).rejects.toThrow(/Letter/)
  })

  it('interleaves halves and splits odd/even pages', async () => {
    expect(interleaveHalvesOrder(1)).toEqual([0])
    expect(interleaveHalvesOrder(2)).toEqual([0, 1])
    expect(interleaveHalvesOrder(4)).toEqual([0, 2, 1, 3])
    expect(interleaveHalvesOrder(5)).toEqual([0, 3, 1, 4, 2])
    expect(deinterleaveOddEvenOrder(4)).toEqual([0, 2, 1, 3])
    expect(deinterleaveOddEvenOrder(5)).toEqual([0, 2, 4, 1, 3])
    expect(remapAfterOrder([0, 3, 1, 4, 2], [0, 2])).toEqual([0, 4])
    expect(isIdentityOrder(interleaveHalvesOrder(2))).toBe(true)
    const bytes = await samplePdf(['A', 'B', 'C', 'D'])
    const collated = await interleaveHalves(bytes)
    expect(await pageCount(collated)).toBe(4)
    const split = await deinterleaveOddEven(bytes)
    expect(await pageCount(split)).toBe(4)
    const small = await samplePdf(['A', 'B'])
    expect(await interleaveHalves(small)).toBe(small)
  })

  it('packs pages onto 2-up and 4-up A4 sheets', async () => {
    expect(nUpSheetCount(5, 2)).toBe(3)
    expect(nUpSheetCount(5, 4)).toBe(2)
    expect(nUpSheetCount(0, 2)).toBe(0)
    expect(nUpSheetSize(2)).toEqual({ width: A4_HEIGHT, height: A4_WIDTH })
    expect(nUpSheetSize(4)).toEqual({ width: A4_WIDTH, height: A4_HEIGHT })
    expect(nUpCellRects(2, A4_LANDSCAPE)).toHaveLength(2)
    expect(nUpCellRects(4, A4_PORTRAIT)).toHaveLength(4)
    const bytes = await samplePdf(['A', 'B', 'C'])
    const twoUp = await nUpPages(bytes, 2)
    const twoDoc = await PDFDocument.load(twoUp)
    expect(twoDoc.getPageCount()).toBe(2)
    expect(twoDoc.getPage(0).getSize().width).toBeCloseTo(A4_HEIGHT)
    const selected = await nUpPages(bytes, 2, [0, 2])
    expect(await pageCount(selected)).toBe(1)
    const fourUp = await nUpPages(bytes, 4)
    expect(await pageCount(fourUp)).toBe(1)
    await expect(nUpPages(bytes, 2, [])).rejects.toThrow(/gộp/)
  })

  it('imposes a saddle-stitch booklet and mirrors selected pages', async () => {
    expect(bookletSlotOrder(4)).toEqual([3, 0, 1, 2])
    expect(bookletSlotOrder(8)).toEqual([7, 0, 1, 6, 5, 2, 3, 4])
    expect(bookletSlotOrder(5)).toEqual([null, 0, 1, null, null, 2, 3, 4])
    expect(bookletSheetCount(5)).toBe(4)
    expect(bookletSlotLabel(null)).toBe('trắng')
    expect(bookletSlotLabel(0)).toBe('1')
    expect(bookletPreviewSheets(4)).toEqual([
      { sheet: 1, front: { left: 3, right: 0 }, back: { left: 1, right: 2 } },
    ])
    expect(bookletPreviewSheets(5)).toEqual([
      { sheet: 1, front: { left: null, right: 0 }, back: { left: 1, right: null } },
      { sheet: 2, front: { left: null, right: 2 }, back: { left: 3, right: 4 } },
    ])
    const bytes = await samplePdf(['A', 'B', 'C', 'D'])
    const booklet = await imposeBooklet(bytes)
    const bookletDoc = await PDFDocument.load(booklet)
    expect(bookletDoc.getPageCount()).toBe(2)
    expect(bookletDoc.getPage(0).getSize().width).toBeCloseTo(A4_HEIGHT)
    const flipped = await flipPages(bytes, [0], 'horizontal')
    expect(await pageCount(flipped)).toBe(4)
    const flippedAll = await flipPages(bytes, [1, 3], 'vertical')
    expect(await pageCount(flippedAll)).toBe(4)
    await expect(flipPages(bytes, [])).rejects.toThrow(/lật/)
  })

  it('splits selected pages in half and remaps the selection', async () => {
    expect(remapAfterSplitHalf(3, [1], [1])).toEqual([1, 2])
    expect(remapAfterSplitHalf(3, [0, 2], [0, 2])).toEqual([0, 1, 3, 4])
    expect(remapAfterSplitHalf(3, [1], [0])).toEqual([2])
    const bytes = await samplePdf(['A', 'B', 'C'])
    const splitH = await splitPagesInHalf(bytes, [0], 'horizontal')
    const splitHDoc = await PDFDocument.load(splitH)
    expect(splitHDoc.getPageCount()).toBe(4)
    expect(splitHDoc.getPage(0).getSize().height).toBeCloseTo(140)
    expect(splitHDoc.getPage(1).getSize().height).toBeCloseTo(140)
    expect(splitHDoc.getPage(2).getSize().height).toBeCloseTo(280)
    const splitV = await splitPagesInHalf(bytes, [1, 2], 'vertical')
    expect(await pageCount(splitV)).toBe(5)
    const splitVDoc = await PDFDocument.load(splitV)
    expect(splitVDoc.getPage(1).getSize().width).toBeCloseTo(100)
    await expect(splitPagesInHalf(bytes, [], 'horizontal')).rejects.toThrow(/cắt đôi/)
    const tiny = await PDFDocument.create()
    tiny.addPage([40, 40])
    await expect(
      splitPagesInHalf(new Uint8Array(await tiny.save()), [0], 'horizontal'),
    ).rejects.toThrow(/quá nhỏ/)
  })

  it('orients selected pages to portrait or landscape', async () => {
    expect(pageOrientation({ width: 200, height: 280 })).toBe('portrait')
    expect(pageOrientation({ width: 280, height: 200 })).toBe('landscape')
    expect(needsOrientation({ width: 200, height: 280 }, 'portrait')).toBe(false)
    expect(needsOrientation({ width: 200, height: 280 }, 'landscape')).toBe(true)
    expect(needsOrientation({ width: 200, height: 200 }, 'landscape')).toBe(false)
    const bytes = await samplePdf(['A', 'B'])
    const landscape = await orientPages(bytes, [0], 'landscape')
    const landscapeDoc = await PDFDocument.load(landscape)
    expect(displayedPageSize(landscapeDoc.getPage(0))).toEqual({ width: 280, height: 200 })
    expect(displayedPageSize(landscapeDoc.getPage(1))).toEqual({ width: 200, height: 280 })
    const already = await orientPages(landscape, [0], 'landscape')
    expect(already).toBe(landscape)
    const back = await orientPages(landscape, [0], 'portrait')
    expect(displayedPageSize((await PDFDocument.load(back)).getPage(0))).toEqual({
      width: 200,
      height: 280,
    })
    await expect(orientPages(bytes, [], 'portrait')).rejects.toThrow(/xoay khổ/)
  })

  it('scales selected pages by a percent', async () => {
    expect(SCALE_PERCENTS).toEqual([50, 75, 125, 150])
    expect(scaleFactor(50)).toBe(0.5)
    expect(scaleFactor(150)).toBe(1.5)
    expect(() => scaleFactor(10)).toThrow(/25%/)
    const bytes = await samplePdf(['A', 'B'])
    const identity = await scalePages(bytes, [0], 100)
    expect(identity).toBe(bytes)
    const grown = await scalePages(bytes, [0], 150)
    const grownDoc = await PDFDocument.load(grown)
    expect(grownDoc.getPage(0).getSize()).toEqual({ width: 300, height: 420 })
    expect(grownDoc.getPage(1).getSize()).toEqual({ width: 200, height: 280 })
    const shrunk = await scalePages(bytes, [1], 50)
    expect((await PDFDocument.load(shrunk)).getPage(1).getSize()).toEqual({
      width: 100,
      height: 140,
    })
    await expect(scalePages(bytes, [], 125)).rejects.toThrow(/tỷ lệ/)
    const tiny = await PDFDocument.create()
    tiny.addPage([40, 40])
    await expect(scalePages(new Uint8Array(await tiny.save()), [0], 50)).rejects.toThrow(/quá nhỏ/)
  })
})

describe('conversion helpers', () => {
  it('builds text and html from page strings', () => {
    const pages = ['Xin chào', 'Trang hai']
    expect(toTxt(pages)).toContain('Trang 2')
    expect(toMarkdown('Demo', pages)).toContain('# Demo')
    expect(toMarkdown('Demo', pages)).toContain('## Trang 2')
    expect(toHtml('Demo', pages)).toContain('<h2>Trang 1</h2>')
    expect(toHtml('Demo', pages)).toContain('<article>')
    expect(escapeHtml('<b>x</b>')).toBe('&lt;b&gt;x&lt;/b&gt;')
    expect(slicePageRange(['A', 'B', 'C'], 2, 3)).toEqual(['B', 'C'])
    expect(slicePagesByIndexes(['A', 'B', 'C'], [0, 2])).toEqual(['A', 'C'])
    expect(() => slicePagesByIndexes(['A'], [])).toThrow(/đã chọn/)
    expect(() => slicePageRange(['A'], 2, 1)).toThrow(/Khoảng trang/)
    expect(pagesFromPlainText('--- Trang 1 ---\nA\n--- Trang 2 ---\nB')).toEqual(['A', 'B'])
    expect(pagesFromMarkdown('# Demo\n\n## Trang 1\nMột\n\n## Trang 2\nHai')).toEqual(['Một', 'Hai'])
    expect(pagesFromHtml('<section>Một</section><section>Hai</section>')).toEqual(['Một', 'Hai'])
    expect(stripMarkup('<p>Hi<br/>there</p>')).toContain('Hi')
    expect(pagesFromImportedText('txt', 'Chỉ một đoạn.')).toEqual(['Chỉ một đoạn.'])
    expect(swapExtension('notes.md', 'pdf')).toBe('notes.pdf')
    expect(toRtf('Demo', ['Xin chào', 'Hai'])).toContain('{\\rtf1')
    expect(toRtf('Demo', ['Xin chào'])).toContain('Demo')
    expect(escapeRtf('a{b}\\c')).toBe('a\\{b\\}\\\\c')
    expect(escapeRtf('Xin chào')).toMatch(/\\u/)
    expect(isImageFormat('png')).toBe(true)
    expect(isImageFormat('jpg')).toBe(true)
    expect(isImageFormat('webp')).toBe(true)
    expect(isImageFormat('docx')).toBe(false)
    expect(isComicFormat('cbz')).toBe(true)
    expect(isComicFormat('png')).toBe(false)
    expect(comicPageName(0)).toBe('001.jpg')
    expect(comicPageName(9, 'png')).toBe('010.png')
    expect(embeddedImageName('demo.pdf', 0, 1, 'jpg')).toBe('demo-trang-1-anh-2.jpg')
    expect(embeddedImageZipName('demo.pdf')).toBe('demo-anh-nhung.zip')
    expect(imagePageName('demo.pdf', 0, 'webp')).toBe('demo-trang-1.webp')
    expect(imageZipName('demo.pdf', 'webp')).toBe('demo-anh-webp.zip')
    expect(toJson('Demo', ['Một', 'Hai'])).toContain('"page": 2')
    expect(JSON.parse(toJson('Demo', ['Một'])).pages[0].text).toBe('Một')
    expect(toCsv(['Một', 'Hai,ba'])).toContain('page,text')
    expect(toCsv(['a"b'])).toContain('"a""b"')
    expect(escapeCsv('a,b')).toBe('"a,b"')
    expect(isImageKind('png')).toBe(true)
    expect(imageKindFromFile({ name: 'scan.JPEG', type: '' })).toBe('jpg')
    expect(imageKindFromFile({ name: 'x.png', type: 'image/png' })).toBe('png')
    expect(swapExtension('photo.png', 'pdf')).toBe('photo.pdf')
    expect(imagePageName('demo.pdf', 2, 'png')).toBe('demo-trang-3.png')
    expect(imageZipName('demo.pdf', 'jpg')).toBe('demo-anh-jpg.zip')
    expect(indexesFromPageRange(2, 4)).toEqual([1, 2, 3])
    expect(() => indexesFromPageRange(3, 1)).toThrow(/Khoảng trang/)
    expect(pagesFromJson(toJson('Demo', ['Một', 'Hai']))).toEqual(['Một', 'Hai'])
    expect(toYaml('Demo', ['Một', 'Hai\ndòng'])).toContain('title: "Demo"')
    expect(escapeYaml('a"b')).toContain('\\"')
    expect(pagesFromYaml(toYaml('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromYaml('pages:\n  - text: |-\n      Một\n      Hai')).toEqual(['Một\nHai'])
    expect(() => pagesFromYaml('title: Demo\n')).toThrow(/YAML/)
    expect(toXml('Demo', ['Một', 'Hai <ba>'])).toContain('<page n="1">Một</page>')
    expect(pagesFromXml(toXml('Demo', ['Một', 'Hai <ba>']))).toEqual(['Một', 'Hai <ba>'])
    expect(() => pagesFromXml('<document/>')).toThrow(/XML/)
    expect(pagesFromImportedText('yaml', toYaml('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromImportedText('xml', toXml('Demo', ['Hi']))).toEqual(['Hi'])
    expect(toTsv(['Một', 'Hai\tba'])).toContain('page\ttext')
    expect(toTsv(['a"b'])).toContain('"a""b"')
    expect(escapeTsv('a\tb')).toBe('"a\tb"')
    expect(pagesFromTsv(toTsv(['Một', 'Hai\tba']))).toEqual(['Một', 'Hai\tba'])
    expect(pagesFromImportedText('tsv', toTsv(['Hi']))).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.tsv', { type: '' }))).toBe('tsv')
    expect(swapExtension('notes.tsv', 'pdf')).toBe('notes.pdf')
    expect(toToml('Demo', ['Một', 'Hai\ndòng'])).toContain('title = "Demo"')
    expect(toToml('Demo', ['Một'])).toContain('[[pages]]')
    expect(escapeToml('a"b')).toContain('\\"')
    expect(pagesFromToml(toToml('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(() => pagesFromToml('title = "Demo"\n')).toThrow(/TOML/)
    expect(pagesFromImportedText('toml', toToml('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromToml('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.toml', { type: 'application/toml' }))).toBe(
      'toml',
    )
    expect(swapExtension('notes.toml', 'pdf')).toBe('notes.pdf')
    expect(toOrg('Demo', ['Một', 'Hai\ndòng'])).toContain('* Demo')
    expect(toOrg('Demo', ['Một'])).toContain('** Trang 1')
    expect(pagesFromOrg(toOrg('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('org', toOrg('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromOrg('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.org', { type: '' }))).toBe('org')
    expect(swapExtension('notes.org', 'pdf')).toBe('notes.pdf')
    expect(toLatex('Demo', ['Một', 'Hai & ba'])).toContain('\\title{Demo}')
    expect(toLatex('Demo', ['Một'])).toContain('\\section*{Trang 1}')
    expect(escapeLatex('a&b_c')).toBe('a\\&b\\_c')
    expect(pagesFromLatex(toLatex('Demo', ['Một', 'Hai & ba']))).toEqual(['Một', 'Hai & ba'])
    expect(() => pagesFromLatex('\\documentclass{article}\\begin{document}\\end{document}')).toThrow(
      /LaTeX/,
    )
    expect(pagesFromImportedText('tex', toLatex('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromLatex('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'paper.tex', { type: '' }))).toBe('tex')
    expect(sourceKindFromFile(new File(['x'], 'paper.latex', { type: 'application/x-latex' }))).toBe(
      'tex',
    )
    expect(swapExtension('paper.tex', 'pdf')).toBe('paper.pdf')
    expect(toJsonl(['Một', 'Hai\ndòng'])).toContain('"page":1')
    expect(toJsonl(['Một'])).toContain('"text":"Một"')
    expect(pagesFromJsonl(toJsonl(['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('jsonl', toJsonl(['Hi']))).toEqual(['Hi'])
    expect(pagesFromJsonl('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(() => pagesFromJsonl('{"page":1}\nnot-json')).toThrow(/JSONL/)
    expect(sourceKindFromFile(new File(['x'], 'notes.jsonl', { type: '' }))).toBe('jsonl')
    expect(sourceKindFromFile(new File(['x'], 'notes.ndjson', { type: 'application/x-ndjson' }))).toBe(
      'jsonl',
    )
    expect(swapExtension('notes.jsonl', 'pdf')).toBe('notes.pdf')
    expect(toIni('Demo', ['Một', 'Hai\ndòng'])).toContain('[document]')
    expect(toIni('Demo', ['Một'])).toContain('[page.1]')
    expect(escapeIni('a"b')).toContain('\\"')
    expect(pagesFromIni(toIni('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(() => pagesFromIni('[document]\ntitle = "Demo"\n')).toThrow(/INI/)
    expect(pagesFromImportedText('ini', toIni('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromIni('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.ini', { type: '' }))).toBe('ini')
    expect(sourceKindFromFile(new File(['x'], 'notes.cfg', { type: 'text/ini' }))).toBe('ini')
    expect(swapExtension('notes.ini', 'pdf')).toBe('notes.pdf')
    expect(toAdoc('Demo', ['Một', 'Hai\ndòng'])).toContain('= Demo')
    expect(toAdoc('Demo', ['Một'])).toContain('== Trang 1')
    expect(pagesFromAdoc(toAdoc('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('adoc', toAdoc('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromAdoc('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.adoc', { type: '' }))).toBe('adoc')
    expect(sourceKindFromFile(new File(['x'], 'notes.asciidoc', { type: 'text/asciidoc' }))).toBe(
      'adoc',
    )
    expect(swapExtension('notes.adoc', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.asciidoc', 'pdf')).toBe('notes.pdf')
    expect(toRst('Demo', ['Một', 'Hai\ndòng'])).toContain('Demo\n====')
    expect(toRst('Demo', ['Một'])).toContain('Trang 1\n-------')
    expect(pagesFromRst(toRst('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('rst', toRst('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromRst('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.rst', { type: '' }))).toBe('rst')
    expect(sourceKindFromFile(new File(['x'], 'notes.rest', { type: 'text/x-rst' }))).toBe('rst')
    expect(swapExtension('notes.rst', 'pdf')).toBe('notes.pdf')
    expect(toTextile('Demo', ['Một', 'Hai\ndòng'])).toContain('h1. Demo')
    expect(toTextile('Demo', ['Một'])).toContain('h2. Trang 1')
    expect(pagesFromTextile(toTextile('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('textile', toTextile('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromTextile('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.textile', { type: '' }))).toBe('textile')
    expect(sourceKindFromFile(new File(['x'], 'notes.txtl', { type: 'text/x-textile' }))).toBe(
      'textile',
    )
    expect(swapExtension('notes.textile', 'pdf')).toBe('notes.pdf')
    expect(toWiki('Demo', ['Một', 'Hai\ndòng'])).toContain('= Demo =')
    expect(toWiki('Demo', ['Một'])).toContain('== Trang 1 ==')
    expect(pagesFromWiki(toWiki('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('wiki', toWiki('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromWiki('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.wiki', { type: '' }))).toBe('wiki')
    expect(sourceKindFromFile(new File(['x'], 'notes.mediawiki', { type: 'text/x-mediawiki' }))).toBe(
      'wiki',
    )
    expect(swapExtension('notes.wiki', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.mediawiki', 'pdf')).toBe('notes.pdf')
    expect(toDokuwiki('Demo', ['Một', 'Hai\ndòng'])).toContain('====== Demo ======')
    expect(toDokuwiki('Demo', ['Một'])).toContain('=== Trang 1 ===')
    expect(pagesFromDokuwiki(toDokuwiki('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('dokuwiki', toDokuwiki('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromDokuwiki('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.dokuwiki', { type: '' }))).toBe('dokuwiki')
    expect(sourceKindFromFile(new File(['x'], 'notes.dw', { type: 'text/x-dokuwiki' }))).toBe(
      'dokuwiki',
    )
    expect(swapExtension('notes.dokuwiki', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.dw', 'pdf')).toBe('notes.pdf')
    expect(toDocbook('Demo', ['Một', 'Hai\ndòng'])).toContain('<article')
    expect(toDocbook('Demo', ['Một'])).toContain('<title>Trang 1</title>')
    expect(pagesFromDocbook(toDocbook('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('dbk', toDocbook('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromDocbook('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.dbk', { type: '' }))).toBe('dbk')
    expect(sourceKindFromFile(new File(['x'], 'notes.docbook', { type: 'application/docbook+xml' }))).toBe(
      'dbk',
    )
    expect(swapExtension('notes.dbk', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.docbook', 'pdf')).toBe('notes.pdf')
    expect(toOpml('Demo', ['Một', 'Hai\ndòng'])).toContain('<opml version="2.0">')
    expect(toOpml('Demo', ['Một'])).toContain('_note="Một"')
    expect(pagesFromOpml(toOpml('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('opml', toOpml('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromOpml('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.opml', { type: '' }))).toBe('opml')
    expect(sourceKindFromFile(new File(['x'], 'notes.opml', { type: 'text/x-opml' }))).toBe('opml')
    expect(swapExtension('notes.opml', 'pdf')).toBe('notes.pdf')
    expect(toAtom('Demo', ['Một', 'Hai\ndòng'])).toContain('<feed xmlns="http://www.w3.org/2005/Atom">')
    expect(toAtom('Demo', ['Một'])).toContain('<title>Trang 1</title>')
    expect(pagesFromAtom(toAtom('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('atom', toAtom('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromAtom('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromAtom(
        '<rss><channel><item><description>Một</description></item><item><description>Hai</description></item></channel></rss>',
      ),
    ).toEqual(['Một', 'Hai'])
    expect(sourceKindFromFile(new File(['x'], 'notes.atom', { type: '' }))).toBe('atom')
    expect(sourceKindFromFile(new File(['x'], 'notes.rss', { type: 'application/rss+xml' }))).toBe(
      'atom',
    )
    expect(swapExtension('notes.atom', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.rss', 'pdf')).toBe('notes.pdf')
    expect(escapeTypst('A "B"')).toBe('A \\"B\\"')
    expect(toTypst('Demo', ['Một', 'Hai\ndòng'])).toContain('#set document(title: "Demo")')
    expect(toTypst('Demo', ['Một'])).toContain('== Trang 1')
    expect(pagesFromTypst(toTypst('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('typ', toTypst('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromTypst('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.typ', { type: '' }))).toBe('typ')
    expect(sourceKindFromFile(new File(['x'], 'notes.typ', { type: 'text/x-typst' }))).toBe('typ')
    expect(swapExtension('notes.typ', 'pdf')).toBe('notes.pdf')
    expect(toGemtext('Demo', ['Một', 'Hai\ndòng'])).toContain('# Demo')
    expect(toGemtext('Demo', ['Một'])).toContain('## Trang 1')
    expect(pagesFromGemtext(toGemtext('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('gmi', toGemtext('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromGemtext('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.gmi', { type: '' }))).toBe('gmi')
    expect(sourceKindFromFile(new File(['x'], 'notes.gemini', { type: 'text/gemini' }))).toBe('gmi')
    expect(swapExtension('notes.gmi', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.gemini', 'pdf')).toBe('notes.pdf')
    expect(toPod('Demo', ['Một', 'Hai\ndòng'])).toContain('=head1 Demo')
    expect(toPod('Demo', ['Một'])).toContain('=head2 Trang 1')
    expect(pagesFromPod(toPod('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('pod', toPod('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromPod('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.pod', { type: '' }))).toBe('pod')
    expect(sourceKindFromFile(new File(['x'], 'notes.pod', { type: 'text/x-pod' }))).toBe('pod')
    expect(swapExtension('notes.pod', 'pdf')).toBe('notes.pdf')
    expect(toBbcode('Demo', ['Một', 'Hai\ndòng'])).toContain('[h1]Demo[/h1]')
    expect(toBbcode('Demo', ['Một'])).toContain('[h2]Trang 1[/h2]')
    expect(pagesFromBbcode(toBbcode('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('bbcode', toBbcode('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromBbcode('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.bbcode', { type: '' }))).toBe('bbcode')
    expect(sourceKindFromFile(new File(['x'], 'notes.bb', { type: 'text/x-bbcode' }))).toBe('bbcode')
    expect(swapExtension('notes.bbcode', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.bb', 'pdf')).toBe('notes.pdf')
    expect(toFountain('Demo', ['Một', 'Hai\ndòng'])).toContain('Title: Demo')
    expect(toFountain('Demo', ['Một'])).toContain('# Trang 1')
    expect(pagesFromFountain(toFountain('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('fountain', toFountain('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromFountain('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.fountain', { type: '' }))).toBe('fountain')
    expect(sourceKindFromFile(new File(['x'], 'notes.spmd', { type: 'text/x-fountain' }))).toBe(
      'fountain',
    )
    expect(swapExtension('notes.fountain', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.spmd', 'pdf')).toBe('notes.pdf')
    expect(toTid('Demo', ['Một', 'Hai\ndòng'])).toContain('! Demo')
    expect(toTid('Demo', ['Một'])).toContain('!! Trang 1')
    expect(pagesFromTid(toTid('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('tid', toTid('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromTid('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.tid', { type: '' }))).toBe('tid')
    expect(sourceKindFromFile(new File(['x'], 'notes.tiddlywiki', { type: 'text/x-tiddlywiki' }))).toBe(
      'tid',
    )
    expect(swapExtension('notes.tid', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.tiddly', 'pdf')).toBe('notes.pdf')
    expect(toTexinfo('Demo', ['Một', 'Hai\ndòng'])).toContain('\\input texinfo')
    expect(toTexinfo('Demo', ['Một'])).toContain('@settitle Demo')
    expect(toTexinfo('Demo', ['Một'])).toContain('@section Trang 1')
    expect(pagesFromTexinfo(toTexinfo('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('texinfo', toTexinfo('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromTexinfo('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.texinfo', { type: '' }))).toBe('texinfo')
    expect(sourceKindFromFile(new File(['x'], 'notes.texi', { type: 'text/x-texinfo' }))).toBe(
      'texinfo',
    )
    expect(sourceKindFromFile(new File(['x'], 'notes.txi', { type: '' }))).toBe('texinfo')
    expect(swapExtension('notes.texinfo', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.texi', 'pdf')).toBe('notes.pdf')
    expect(toRoff('Demo', ['Một', 'Hai\ndòng'])).toContain('.TH Demo')
    expect(toRoff('Demo', ['Một'])).toContain('.SH Trang 1')
    expect(pagesFromRoff(toRoff('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('roff', toRoff('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromRoff('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.roff', { type: '' }))).toBe('roff')
    expect(sourceKindFromFile(new File(['x'], 'notes.man', { type: 'text/troff' }))).toBe('roff')
    expect(swapExtension('notes.roff', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.man', 'pdf')).toBe('notes.pdf')
    expect(toIpynb('Demo', ['Một', 'Hai\ndòng'])).toContain('"nbformat": 4')
    expect(toIpynb('Demo', ['Một'])).toContain('## Trang 1')
    expect(pagesFromIpynb(toIpynb('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('ipynb', toIpynb('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromIpynb('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.ipynb', { type: '' }))).toBe('ipynb')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.ipynb', { type: 'application/x-ipynb+json' })),
    ).toBe('ipynb')
    expect(swapExtension('notes.ipynb', 'pdf')).toBe('notes.pdf')
    expect(escapeBibtex('a{b}')).toBe('a\\{b\\}')
    expect(toBibtex('Demo', ['Một', 'Hai\ndòng'])).toContain('@comment{Demo}')
    expect(toBibtex('Demo', ['Một'])).toContain('@misc{page1')
    expect(pagesFromBibtex(toBibtex('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('bib', toBibtex('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromBibtex('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.bib', { type: '' }))).toBe('bib')
    expect(sourceKindFromFile(new File(['x'], 'notes.bibtex', { type: 'application/x-bibtex' }))).toBe(
      'bib',
    )
    expect(swapExtension('notes.bib', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.bibtex', 'pdf')).toBe('notes.pdf')
    expect(formatSrtTime(0)).toBe('00:00:00,000')
    expect(formatSrtTime(4)).toBe('00:00:04,000')
    expect(formatVttTime(4)).toBe('00:00:04.000')
    expect(toSrt(['Một', 'Hai\ndòng'])).toContain('1\n00:00:00,000 --> 00:00:04,000\nMột')
    expect(toSrt(['Một'])).toContain('00:00:00,000 --> 00:00:04,000')
    expect(pagesFromSrt(toSrt(['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('srt', toSrt(['Hi']))).toEqual(['Hi'])
    expect(pagesFromSrt('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.srt', { type: '' }))).toBe('srt')
    expect(sourceKindFromFile(new File(['x'], 'notes.srt', { type: 'application/x-subrip' }))).toBe(
      'srt',
    )
    expect(swapExtension('notes.srt', 'pdf')).toBe('notes.pdf')
    expect(toVtt('Demo', ['Một', 'Hai\ndòng'])).toContain('WEBVTT')
    expect(toVtt('Demo', ['Một'])).toContain('NOTE Demo')
    expect(pagesFromVtt(toVtt('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('vtt', toVtt('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromVtt('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.vtt', { type: '' }))).toBe('vtt')
    expect(sourceKindFromFile(new File(['x'], 'notes.vtt', { type: 'text/vtt' }))).toBe('vtt')
    expect(swapExtension('notes.vtt', 'pdf')).toBe('notes.pdf')
    expect(formatLrcTime(4)).toBe('00:04.00')
    expect(toLrc('Demo', ['Một', 'Hai\ndòng'])).toContain('[ti:Demo]')
    expect(toLrc('Demo', ['Một'])).toContain('[00:00.00]Một')
    expect(pagesFromLrc(toLrc('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai dòng'])
    expect(pagesFromImportedText('lrc', toLrc('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromLrc('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.lrc', { type: '' }))).toBe('lrc')
    expect(sourceKindFromFile(new File(['x'], 'notes.lrc', { type: 'text/x-lrc' }))).toBe('lrc')
    expect(swapExtension('notes.lrc', 'pdf')).toBe('notes.pdf')
    expect(formatIcsDate(4)).toBe('19700101T000004Z')
    expect(escapeIcs('a;b,c\nd')).toBe('a\\;b\\,c\\nd')
    expect(toIcs('Demo', ['Một', 'Hai\ndòng'])).toContain('BEGIN:VCALENDAR')
    expect(toIcs('Demo', ['Một'])).toContain('X-WR-CALNAME:Demo')
    expect(pagesFromIcs(toIcs('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('ics', toIcs('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromIcs('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.ics', { type: '' }))).toBe('ics')
    expect(sourceKindFromFile(new File(['x'], 'notes.ics', { type: 'text/calendar' }))).toBe('ics')
    expect(swapExtension('notes.ics', 'pdf')).toBe('notes.pdf')
    expect(formatCueIndex(4)).toBe('00:04:00')
    expect(escapeCue('a"b\nc')).toBe("a'b c")
    expect(toCue('Demo', ['Một', 'Hai\ndòng'])).toContain('TITLE "Demo"')
    expect(toCue('Demo', ['Một'])).toContain('TRACK 01 AUDIO')
    expect(pagesFromCue(toCue('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai dòng'])
    expect(pagesFromImportedText('cue', toCue('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromCue('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.cue', { type: '' }))).toBe('cue')
    expect(sourceKindFromFile(new File(['x'], 'notes.cue', { type: 'application/x-cue' }))).toBe(
      'cue',
    )
    expect(swapExtension('notes.cue', 'pdf')).toBe('notes.pdf')
    expect(formatAssTime(4)).toBe('0:00:04.00')
    expect(escapeAss('Một\nhai {x}')).toBe('Một\\Nhai \\{x\\}')
    expect(toAss('Demo', ['Một', 'Hai\ndòng'])).toContain('[Script Info]')
    expect(toAss('Demo', ['Một'])).toContain('Title: Demo')
    expect(pagesFromAss(toAss('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('ass', toAss('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromAss('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.ass', { type: '' }))).toBe('ass')
    expect(sourceKindFromFile(new File(['x'], 'notes.ssa', { type: 'text/x-ssa' }))).toBe('ass')
    expect(swapExtension('notes.ass', 'pdf')).toBe('notes.pdf')
    expect(
      pagesFromAss(`[Events]
Format: Marked, Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: Marked=0,0,0:00:00.00,0:00:04.00,Default,,0,0,0,,Hello, world
Dialogue: Marked=0,0,0:00:04.00,0:00:08.00,Default,,0,0,0,,Hai`),
    ).toEqual(['Hello, world', 'Hai'])
    expect(
      pagesFromAss(`[Events]
Style: Dialogue
Dialogue: Marked=0,0,0:00:00.00,0:00:04.00,Default,,0,0,0,,Hello, world
Dialogue: Marked=0,0,0:00:04.00,0:00:08.00,Default,,0,0,0,,Hai`),
    ).toEqual(['Hello, world', 'Hai'])
    expect(formatSamiTime(4)).toBe('4000')
    expect(toSami('Demo', ['Một', 'Hai\ndòng'])).toContain('<SAMI>')
    expect(toSami('Demo', ['Một'])).toContain('<TITLE>Demo</TITLE>')
    expect(pagesFromSami(toSami('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('sami', toSami('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromSami('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.sami', { type: '' }))).toBe('sami')
    expect(sourceKindFromFile(new File(['x'], 'notes.smi', { type: 'application/x-sami' }))).toBe(
      'sami',
    )
    expect(swapExtension('notes.sami', 'pdf')).toBe('notes.pdf')
    expect(formatSubTime(4)).toBe('00:00:04.00')
    expect(toSub('Demo', ['Một', 'Hai\ndòng'])).toContain('[INFORMATION]')
    expect(toSub('Demo', ['Một'])).toContain('[TITLE]Demo')
    expect(pagesFromSub(toSub('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('sub', toSub('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromSub('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(pagesFromSub('{0}{96}Một\n{96}{192}Hai|dòng')).toEqual(['Một', 'Hai\ndòng'])
    expect(sourceKindFromFile(new File(['x'], 'notes.sub', { type: '' }))).toBe('sub')
    expect(sourceKindFromFile(new File(['x'], 'notes.sub', { type: 'text/x-microdvd' }))).toBe(
      'sub',
    )
    expect(swapExtension('notes.sub', 'pdf')).toBe('notes.pdf')
    expect(formatStlTime(4)).toBe('00:00:04:00')
    expect(toStl('Demo', ['Một', 'Hai\ndòng'])).toContain('$FontName')
    expect(toStl('Demo', ['Một'])).toContain('$Title              = Demo')
    expect(pagesFromStl(toStl('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('stl', toStl('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromStl('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.stl', { type: '' }))).toBe('stl')
    expect(sourceKindFromFile(new File(['x'], 'notes.stl', { type: 'text/x-spruce' }))).toBe('stl')
    expect(swapExtension('notes.stl', 'pdf')).toBe('notes.pdf')
    expect(formatTtmlTime(4)).toBe('00:00:04.000')
    expect(toTtml('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.w3.org/ns/ttml"')
    expect(toTtml('Demo', ['Một'])).toContain('<title>Demo</title>')
    expect(pagesFromTtml(toTtml('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('ttml', toTtml('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromTtml('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.ttml', { type: '' }))).toBe('ttml')
    expect(sourceKindFromFile(new File(['x'], 'notes.dfxp', { type: 'application/ttml+xml' }))).toBe(
      'ttml',
    )
    expect(swapExtension('notes.ttml', 'pdf')).toBe('notes.pdf')
    expect(formatSbvTime(4)).toBe('0:00:04.000')
    expect(toSbv(['Một', 'Hai\ndòng'])).toContain('0:00:00.000,0:00:04.000')
    expect(pagesFromSbv(toSbv(['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('sbv', toSbv(['Hi']))).toEqual(['Hi'])
    expect(pagesFromSbv('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.sbv', { type: '' }))).toBe('sbv')
    expect(sourceKindFromFile(new File(['x'], 'notes.sbv', { type: 'text/x-sbv' }))).toBe('sbv')
    expect(swapExtension('notes.sbv', 'pdf')).toBe('notes.pdf')
    expect(sourceKindFromFile(new File(['x'], 'comic.cbz', { type: '' }))).toBe('cbz')
    expect(sourceKindFromFile(new File(['x'], 'comic.cbz', { type: 'application/vnd.comicbook+zip' }))).toBe(
      'cbz',
    )
    expect(swapExtension('comic.cbz', 'pdf')).toBe('comic.pdf')
    expect(sourceKindFromFile(new File(['x'], 'notes.yaml', { type: '' }))).toBe('yaml')
    expect(sourceKindFromFile(new File(['x'], 'notes.yml', { type: 'application/yaml' }))).toBe(
      'yaml',
    )
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: 'application/xml' }))).toBe('xml')
    expect(swapExtension('notes.yaml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.xml', 'pdf')).toBe('notes.pdf')
    expect(pagesFromJson('["A","B"]')).toEqual(['A', 'B'])
    expect(() => pagesFromJson('{')).toThrow(/JSON không hợp lệ/)
    expect(parseCsv('page,text\n1,"a,b"')).toEqual([
      ['page', 'text'],
      ['1', 'a,b'],
    ])
    expect(pagesFromCsv(toCsv(['Một', 'Hai,ba']))).toEqual(['Một', 'Hai,ba'])
    expect(pagesFromImportedText('json', '{"pages":[{"page":1,"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['{}'], 'notes.json', { type: 'application/json' }))).toBe(
      'json',
    )
    expect(pagesFromYaml('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'book.epub', { type: '' }))).toBe('epub')
    expect(sourceKindFromFile(new File(['x'], 'paper.docx', { type: '' }))).toBe('docx')
    expect(swapExtension('paper.docx', 'pdf')).toBe('paper.pdf')
    expect(foldSearch('Xin chào')).toBe(foldSearch('xin chao'))
    expect(findPagesWithText(['Xin chào', 'Trang hai'], 'chao')).toEqual([0])
    expect(findPagesWithText(['A', 'B'], '   ')).toEqual([])
    expect(blankPageIndexes(['Hello', '  ', ''])).toEqual([1, 2])
    expect(repeatedPageIndexes(['Hello', 'hello', 'Hai'])).toEqual([1])
    expect(repeatedPageIndexes(['A', 'B', 'C'])).toEqual([])
    expect(repeatedPageIndexes(['  ', '', 'x'])).toEqual([1])
    expect(toFb2('Demo', ['Một', 'Hai'])).toContain('<FictionBook')
    expect(toFb2('Demo', ['Một'])).toContain('<book-title>Demo</book-title>')
    expect(pagesFromFb2(toFb2('Demo', ['Một', 'Hai']))).toEqual(['Một', 'Hai'])
    expect(() => pagesFromFb2('<xml/>')).toThrow(/FB2/)
    expect(rtfToPlain(toRtf('Demo', ['Xin chào', 'Hai']))).toMatch(/Xin chào/)
    expect(pagesFromRtf(toRtf('Demo', ['Một', 'Hai']))).toEqual(['Một', 'Hai'])
    expect(pagesFromImportedText('rtf', toRtf('Demo', ['Chỉ một đoạn.']))).toEqual(['Chỉ một đoạn.'])
    expect(sourceKindFromFile(new File(['{\\rtf1}'], 'note.rtf', { type: 'application/rtf' }))).toBe(
      'rtf',
    )
    expect(sourceKindFromFile(new File(['<FictionBook/>'], 'book.fb2', { type: '' }))).toBe('fb2')
    expect(sourceKindFromFile(new File(['x'], 'paper.odt', { type: '' }))).toBe('odt')
    expect(sourceKindFromFile(new File(['x'], 'table.ods', { type: '' }))).toBe('ods')
    expect(sourceKindFromFile(new File(['x'], 'table.xlsx', { type: '' }))).toBe('xlsx')
    expect(sourceKindFromFile(new File(['x'], 'deck.pptx', { type: '' }))).toBe('pptx')
    expect(sourceKindFromFile(new File(['x'], 'deck.odp', { type: '' }))).toBe('odp')
    expect(sourceKindFromFile(new File(['x'], 'scan.webp', { type: 'image/webp' }))).toBe('webp')
    expect(swapExtension('paper.odt', 'pdf')).toBe('paper.pdf')
    expect(swapExtension('table.ods', 'pdf')).toBe('table.pdf')
    expect(swapExtension('table.xlsx', 'pdf')).toBe('table.pdf')
    expect(swapExtension('deck.pptx', 'pdf')).toBe('deck.pdf')
    expect(swapExtension('deck.odp', 'pdf')).toBe('deck.pdf')
    expect(swapExtension('scan.webp', 'pdf')).toBe('scan.pdf')
    expect(() => sourceKindFromFile(new File(['x'], 'old.xls', { type: '' }))).toThrow(/XLSX/)
    expect(() => sourceKindFromFile(new File(['x'], 'old.ppt', { type: '' }))).toThrow(/PPTX/)
  })

  it('round-trips XLSX workbooks', async () => {
    const xlsx = await toXlsx('Demo', ['Một', 'Hai,ba'])
    expect(xlsx.type).toContain('spreadsheetml')
    const zip = await JSZip.loadAsync(await xlsx.arrayBuffer())
    expect(zip.file('xl/worksheets/sheet1.xml')).toBeTruthy()
    expect(await pagesFromXlsx(new Uint8Array(await xlsx.arrayBuffer()))).toEqual(['Một', 'Hai,ba'])
  })

  it('packs and unpacks CBZ comic archives', async () => {
    const png = tinyPng()
    const blob = await toCbz([
      { bytes: png },
      { name: 'cover.png', bytes: png },
    ])
    expect(blob.type).toContain('comicbook')
    const images = await imagesFromCbz(new Uint8Array(await blob.arrayBuffer()))
    expect(images.map((image) => image.name)).toEqual(['001.jpg', 'cover.png'])
    expect(images[1]?.kind).toBe('png')
    await expect(toCbz([])).rejects.toThrow(/CBZ/)
    await expect(imagesFromCbz(new Uint8Array([1, 2, 3]))).rejects.toThrow(/CBZ/)
  })

  it('round-trips PPTX decks', async () => {
    const pptx = await toPptx('Demo', ['Một', 'Hai\ndòng'])
    expect(pptx.type).toContain('presentationml')
    const zip = await JSZip.loadAsync(await pptx.arrayBuffer())
    expect(zip.file('ppt/presentation.xml')).toBeTruthy()
    expect(zip.file('ppt/slides/slide1.xml')).toBeTruthy()
    expect(zip.file('ppt/slides/slide2.xml')).toBeTruthy()
    expect(await pagesFromPptx(new Uint8Array(await pptx.arrayBuffer()))).toEqual(['Một', 'Hai\ndòng'])
  })

  it('round-trips ODS workbooks', async () => {
    const ods = await toOds('Demo', ['Một', 'Hai\ndòng'])
    expect(ods.type).toContain('opendocument.spreadsheet')
    const zip = await JSZip.loadAsync(await ods.arrayBuffer())
    expect(zip.file('mimetype')).toBeTruthy()
    expect(zip.file('content.xml')).toBeTruthy()
    expect(await pagesFromOds(new Uint8Array(await ods.arrayBuffer()))).toEqual(['Một', 'Hai\ndòng'])
  })

  it('round-trips ODP decks', async () => {
    const odp = await toOdp('Demo', ['Một', 'Hai\ndòng'])
    expect(odp.type).toContain('opendocument.presentation')
    const zip = await JSZip.loadAsync(await odp.arrayBuffer())
    expect(zip.file('content.xml')).toBeTruthy()
    expect(await pagesFromOdp(new Uint8Array(await odp.arrayBuffer()))).toEqual(['Một', 'Hai\ndòng'])
  })

  it('round-trips ODT packages', async () => {
    const odt = await toOdt('Demo', ['Một', 'Hai'])
    expect(odt.type).toContain('opendocument')
    const zip = await JSZip.loadAsync(await odt.arrayBuffer())
    expect(zip.file('mimetype')).toBeTruthy()
    expect(zip.file('content.xml')).toBeTruthy()
    expect(await pagesFromOdt(new Uint8Array(await odt.arrayBuffer()))).toEqual(['Một', 'Hai'])
  })

  it('rebuilds pages from a DOCX zip and from an EPUB package', async () => {
    const docxZip = new JSZip()
    docxZip.file(
      'word/document.xml',
      `<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Trang 1</w:t></w:r></w:p><w:p><w:r><w:t>Một</w:t></w:r></w:p><w:p><w:r><w:t>Trang 2</w:t></w:r></w:p><w:p><w:r><w:t>Hai</w:t></w:r></w:p></w:body></w:document>`,
    )
    const docxBytes = new Uint8Array(await docxZip.generateAsync({ type: 'uint8array' }))
    expect(await pagesFromDocx(docxBytes)).toEqual(['Một', 'Hai'])
    const epub = await toEpub('Demo', ['Một', 'Hai'], {
      identifier: 'urn:uuid:import-book',
      modified: '2026-10-20T00:00:00Z',
    })
    expect(await pagesFromEpub(new Uint8Array(await epub.arrayBuffer()))).toEqual(['Một', 'Hai'])
  })

  it('builds an EPUB 3 package with nav, ncx, and per-page documents', async () => {
    const blob = await toEpub('Demo', ['Một', 'Hai'], {
      identifier: 'urn:uuid:test-book',
      modified: '2026-10-19T00:00:00Z',
      creator: 'Smart-Read',
    })
    const zip = await JSZip.loadAsync(await blob.arrayBuffer())
    expect(zip.file('mimetype')).toBeTruthy()
    expect(zip.file('OEBPS/nav.xhtml')).toBeTruthy()
    expect(zip.file('OEBPS/toc.ncx')).toBeTruthy()
    expect(zip.file('OEBPS/page-0001.xhtml')).toBeTruthy()
    expect(zip.file('OEBPS/page-0002.xhtml')).toBeTruthy()
    const opf = await zip.file('OEBPS/content.opf')!.async('string')
    expect(opf).toContain('properties="nav"')
    expect(opf).toContain('dcterms:modified')
    expect(opf).toContain('urn:uuid:test-book')
    const nav = await zip.file('OEBPS/nav.xhtml')!.async('string')
    expect(nav).toContain('epub:type="toc"')
    expect(nav).toContain('page-0002.xhtml')
  })
})

describe('page selection', () => {
  it('builds ranges, toggles, and maps the next page after a delete', () => {
    expect(pageRange(3, 1)).toEqual([1, 2, 3])
    expect(togglePage([0, 2], 2)).toEqual([0])
    expect(togglePage([0], 2)).toEqual([0, 2])
    expect(nextPageAfterDelete(2, [1, 2], 2)).toBe(1)
    expect(nextPageAfterDelete(0, [0], 2)).toBe(0)
    expect(clampPageRange(0, 99, 4)).toEqual({ fromPage: 1, toPage: 4 })
    expect(movingIndexesForDrag([0, 2, 3], 2)).toEqual([0, 2, 3])
    expect(movingIndexesForDrag([0, 2], 1)).toEqual([1])
    expect(blockNudgeDropTo([1, 2], -1, 4)).toBe(0)
    expect(blockNudgeDropTo([1, 2], 1, 4)).toBe(3)
    expect(blockNudgeDropTo([0, 1], -1, 4)).toBeNull()
    expect(oddPageIndexes(4)).toEqual([0, 2])
    expect(evenPageIndexes(4)).toEqual([1, 3])
    expect(evenPageIndexes(1)).toEqual([])
    expect(invertPageIndexes(4, [0, 2])).toEqual([1, 3])
    expect(invertPageIndexes(3, [0, 1, 2])).toEqual([])
    expect(invertPageIndexes(1, [0])).toEqual([])
    expect(blockEdgeDropTo([2, 3], 'start', 4)).toBe(0)
    expect(blockEdgeDropTo([0, 1], 'start', 4)).toBeNull()
    expect(blockEdgeDropTo([0, 1], 'end', 4)).toBe(3)
    expect(blockEdgeDropTo([2, 3], 'end', 4)).toBeNull()
  })

  it('rejects empty, inverted, and out-of-range convert bounds', () => {
    expect(parsePageRange('', '', 4)).toEqual({
      ok: false,
      message: 'Nhập số trang bắt đầu và kết thúc.',
    })
    expect(parsePageRange('', '2', 4).ok).toBe(false)
    expect(parsePageRange('1', '', 4).ok).toBe(false)
    expect(parsePageRange('1.5', '2', 4)).toEqual({
      ok: false,
      message: 'Khoảng trang phải là số nguyên.',
    })
    const tooLow = parsePageRange('0', '2', 4)
    expect(tooLow.ok).toBe(false)
    if (!tooLow.ok) {
      expect(tooLow.message).toMatch(/từ 1/)
    }
    const tooHigh = parsePageRange('1', '9', 4)
    expect(tooHigh.ok).toBe(false)
    if (!tooHigh.ok) {
      expect(tooHigh.message).toMatch(/vượt quá 4/)
    }
    const inverted = parsePageRange('3', '1', 4)
    expect(inverted.ok).toBe(false)
    if (!inverted.ok) {
      expect(inverted.message).toMatch(/không được lớn hơn/)
    }
    expect(parsePageRange('2', '3', 4)).toEqual({ ok: true, fromPage: 2, toPage: 3 })
    expect(parseSplitSize('', 4)).toEqual({ ok: false, message: 'Nhập số trang mỗi tệp.' })
    expect(parseSplitSize('1.5', 4).ok).toBe(false)
    expect(parseSplitSize('0', 4).ok).toBe(false)
    expect(parseSplitSize('9', 4).ok).toBe(false)
    expect(parseSplitSize('2', 4)).toEqual({ ok: true, size: 2 })
    expect(parseGotoPage('', 4)).toEqual({ ok: false, message: 'Nhập số trang cần tới.' })
    expect(parseGotoPage('1.5', 4).ok).toBe(false)
    expect(parseGotoPage('0', 4).ok).toBe(false)
    expect(parseGotoPage('9', 4).ok).toBe(false)
    expect(parseGotoPage('3', 4)).toEqual({ ok: true, index: 2 })
    expect(parseGotoPage('ii', 4, ['i', 'ii', '1', '2'])).toEqual({ ok: true, index: 1 })
    expect(parseGotoPage('1', 4, ['i', 'ii', '1', '2'])).toEqual({ ok: true, index: 2 })
    expect(parseGotoPage('4', 4, ['i', 'ii', '1', '2'])).toEqual({ ok: true, index: 3 })
    expect(parseGotoPage('Trang 2', 2, ['Trang 1', 'Trang 2'])).toEqual({ ok: true, index: 1 })
    expect(parseGotoPage('iv', 4, ['i', 'ii', '1', '2']).ok).toBe(false)
    expect(
      parseGotoPage('ChapTwo', 2, undefined, [{ name: 'ChapTwo', pageIndex: 1 }]),
    ).toEqual({ ok: true, index: 1 })
    expect(
      parseGotoPage('chaptwo', 2, ['1', '2'], [{ name: 'ChapTwo', pageIndex: 1 }]),
    ).toEqual({ ok: true, index: 1 })
    expect(parseGotoPage('Missing', 2, undefined, [{ name: 'ChapTwo', pageIndex: 1 }]).ok).toBe(
      false,
    )
  })

  it('caps undo snapshots and pops the latest first', () => {
    const first = snapshotOf(new Uint8Array([1]), 0, [0], 0)
    const second = snapshotOf(new Uint8Array([2]), 1, [1], 1)
    const stacked = pushSnapshot(pushSnapshot([], first, 1), second, 1)
    expect(stacked).toHaveLength(1)
    expect(stacked[0]?.page).toBe(1)
    const popped = popSnapshot(stacked)
    expect(popped?.snapshot.page).toBe(1)
    expect(popped?.rest).toEqual([])
    expect(popSnapshot([])).toBeNull()
    expect(MAX_EDITOR_HISTORY).toBeGreaterThan(0)
    const encoded = encodeSnapshots(
      [snapshotOf(new Uint8Array([9, 8]), 2, [1, 2], 1), snapshotOf(new Uint8Array([7]), 0, [0], 0)],
      1,
    )
    expect(encoded).toHaveLength(1)
    const decoded = decodeSnapshots(encoded)
    expect(decoded[0]?.page).toBe(0)
    expect([...decoded[0]!.bytes]).toEqual([7])
    expect(decodeSnapshots(null)).toEqual([])
  })

  it('converts pixels to grayscale luminance', () => {
    expect(luma(255, 0, 0)).toBeGreaterThan(0)
    const pixels = new Uint8Array([255, 0, 0, 255, 0, 255, 0, 255])
    grayscaleRgba(pixels)
    expect(pixels[0]).toBe(pixels[1])
    expect(pixels[1]).toBe(pixels[2])
    expect(pixels[3]).toBe(255)
    expect(pixels[4]).toBe(pixels[5])
    expect(pixels[5]).toBe(pixels[6])
  })

  it('scales sparse pages more strongly than letter-size pages', () => {
    const letter = previewScaleForPage(612, 792)
    const sparse = previewScaleForPage(200, 280)
    expect(letter).toBe(BASE_PREVIEW_SCALE)
    expect(sparse).toBeGreaterThan(letter)
    expect(sparse).toBe(MAX_PREVIEW_SCALE)
    expect(thumbnailScaleForPage(200, 280)).toBeGreaterThan(thumbnailScaleForPage(612, 792))
    expect(thumbnailContrastForPage(200, 280)).toBe(SPARSE_THUMB_CONTRAST)
    expect(thumbnailContrastForPage(612, 792)).toBe(BASE_THUMB_CONTRAST)
  })

  it('restores a clamped editor view when session storage is empty', () => {
    expect(restoreEditorView(3)).toEqual({ page: 0, selected: [0], anchor: 0 })
    expect(restoreEditorView(0)).toEqual({ page: 0, selected: [0], anchor: 0 })
    expect(editorExportSelection(3)).toBeNull()
    expect(formatPageList([0, 2])).toBe('1, 3')
    expect(extractedPdfName('demo.pdf', [0, 2])).toBe('demo-trang-1+3.pdf')
    expect(extractedPdfName('demo.pdf', [0, 1, 2])).toBe('demo-trang-1-3.pdf')
    expect(extractedPdfName('demo.pdf', [1])).toBe('demo-trang-2.pdf')
  })
})

describe('pdf-lib degrees helper', () => {
  it('keeps a 90-degree increment', () => {
    expect(degrees(90).angle).toBe(90)
  })
})

function tinyPng(): Uint8Array {
  return Uint8Array.from(
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64',
    ),
  )
}
