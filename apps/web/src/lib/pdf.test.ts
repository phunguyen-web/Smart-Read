import { PDFDocument, degrees } from 'pdf-lib'
import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'
import {
  escapeCsv,
  escapeHtml,
  escapeRtf,
  isImageFormat,
  slicePageRange,
  slicePagesByIndexes,
  toCsv,
  toEpub,
  toFb2,
  toHtml,
  toJson,
  toMarkdown,
  toOdt,
  toRtf,
  toTxt,
  toXlsx,
  zipPdfParts,
} from './convert.ts'
import {
  pagesFromCsv,
  pagesFromDocx,
  pagesFromEpub,
  pagesFromFb2,
  pagesFromHtml,
  pagesFromImportedText,
  pagesFromJson,
  pagesFromMarkdown,
  pagesFromOdt,
  pagesFromPlainText,
  pagesFromRtf,
  pagesFromXlsx,
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
  grayscaleRgba,
  luma,
  previewScaleForPage,
  thumbnailContrastForPage,
  thumbnailScaleForPage,
} from './extract.ts'
import {
  decodeSnapshots,
  encodeSnapshots,
  formatPageList,
  editorExportSelection,
  restoreEditorView,
} from './persist.ts'
import {
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
  addPageNumbers,
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
  nUpPages,
  nUpSheetCount,
  nUpSheetSize,
  movePage,
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
  textPagesToPdf,
  trimMetadataField,
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
    expect(sourceKindFromFile(new File(['x'], 'table.xlsx', { type: '' }))).toBe('xlsx')
    expect(sourceKindFromFile(new File(['x'], 'scan.webp', { type: 'image/webp' }))).toBe('webp')
    expect(swapExtension('paper.odt', 'pdf')).toBe('paper.pdf')
    expect(swapExtension('table.xlsx', 'pdf')).toBe('table.pdf')
    expect(swapExtension('scan.webp', 'pdf')).toBe('scan.pdf')
    expect(() => sourceKindFromFile(new File(['x'], 'old.xls', { type: '' }))).toThrow(/XLSX/)
  })

  it('round-trips XLSX workbooks', async () => {
    const xlsx = await toXlsx('Demo', ['Một', 'Hai,ba'])
    expect(xlsx.type).toContain('spreadsheetml')
    const zip = await JSZip.loadAsync(await xlsx.arrayBuffer())
    expect(zip.file('xl/worksheets/sheet1.xml')).toBeTruthy()
    expect(await pagesFromXlsx(new Uint8Array(await xlsx.arrayBuffer()))).toEqual(['Một', 'Hai,ba'])
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
