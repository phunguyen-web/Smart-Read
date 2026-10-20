import { PDFDocument, degrees } from 'pdf-lib'
import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'
import {
  escapeHtml,
  slicePageRange,
  slicePagesByIndexes,
  toEpub,
  toHtml,
  toMarkdown,
  toTxt,
  zipPdfParts,
} from './convert.ts'
import {
  pagesFromHtml,
  pagesFromImportedText,
  pagesFromMarkdown,
  pagesFromPlainText,
  stripMarkup,
} from './import-text.ts'
import {
  BASE_PREVIEW_SCALE,
  BASE_THUMB_CONTRAST,
  MAX_PREVIEW_SCALE,
  SPARSE_THUMB_CONTRAST,
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
import { extractedPdfName, splitPartName, splitZipName, swapExtension } from './limits.ts'
import {
  addPageNumbers,
  addTextOverlay,
  deletePages,
  duplicatePages,
  duplicatedIndexes,
  extractPages,
  formatPageNumber,
  insertBlankPage,
  isIdentityOrder,
  keepPages,
  mergeInsertIndex,
  mergePdf,
  movePage,
  movePages,
  pageCount,
  reorderPageBlock,
  reversePages,
  reversedIndexes,
  rotatePages,
  rotatePagesBy,
  splitEvery,
  textPagesToPdf,
  wrapPdfText,
} from './pdf.ts'
import { MAX_EDITOR_HISTORY, popSnapshot, pushSnapshot, snapshotOf } from './history.ts'
import {
  blockEdgeDropTo,
  blockNudgeDropTo,
  clampPageRange,
  evenPageIndexes,
  movingIndexesForDrag,
  nextPageAfterDelete,
  oddPageIndexes,
  pageRange,
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
