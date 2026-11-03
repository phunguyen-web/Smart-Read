import { PDFDocument, degrees } from 'pdf-lib'
import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'
import {
  escapeCsv,
  escapeToml,
  escapeTsv,
  escapeHtml,
  escapeRtf,
  isImageFormat,
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
  pagesFromTextile,
  pagesFromWiki,
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
  addOutlineBookmarks,
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
    expect(await listOutlineBookmarks(marked)).toEqual([{ title: 'Chương hai', pageIndex: 1 }])
    const again = await addOutlineBookmarks(marked, [0, 1], 'Mục')
    expect(await listOutlineBookmarks(again)).toEqual([
      { title: 'Chương hai', pageIndex: 1 },
      { title: 'Mục · 1', pageIndex: 0 },
      { title: 'Mục · 2', pageIndex: 1 },
    ])
    await expect(addOutlineBookmarks(bytes, [], 'X')).rejects.toThrow(/trang/)
    await expect(addOutlineBookmarks(bytes, [0], '  ')).rejects.toThrow(/mục lục/)

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
