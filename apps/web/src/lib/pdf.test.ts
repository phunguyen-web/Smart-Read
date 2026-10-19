import { PDFDocument, degrees } from 'pdf-lib'
import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'
import { escapeHtml, slicePageRange, toEpub, toHtml, toTxt } from './convert.ts'
import { BASE_PREVIEW_SCALE, MAX_PREVIEW_SCALE, previewScaleForPage } from './extract.ts'
import {
  addTextOverlay,
  deletePages,
  mergeInsertIndex,
  mergePdf,
  movePage,
  pageCount,
  rotatePages,
} from './pdf.ts'
import { MAX_EDITOR_HISTORY, popSnapshot, pushSnapshot, snapshotOf } from './history.ts'
import {
  clampPageRange,
  nextPageAfterDelete,
  pageRange,
  parsePageRange,
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

  it('draws a text overlay at a ratio', async () => {
    const bytes = await samplePdf(['A'])
    const next = await addTextOverlay(bytes, 0, 'Hi', { xRatio: 0.2, yRatio: 0.3 })
    expect(await pageCount(next)).toBe(1)
    await expect(addTextOverlay(bytes, 0, '   ')).rejects.toThrow(/Nhập nội dung/)
  })
})

describe('conversion helpers', () => {
  it('builds text and html from page strings', () => {
    const pages = ['Xin chào', 'Trang hai']
    expect(toTxt(pages)).toContain('Trang 2')
    expect(toHtml('Demo', pages)).toContain('<h2>Trang 1</h2>')
    expect(toHtml('Demo', pages)).toContain('<article>')
    expect(escapeHtml('<b>x</b>')).toBe('&lt;b&gt;x&lt;/b&gt;')
    expect(slicePageRange(['A', 'B', 'C'], 2, 3)).toEqual(['B', 'C'])
    expect(() => slicePageRange(['A'], 2, 1)).toThrow(/Khoảng trang/)
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
  })

  it('scales sparse pages more strongly than letter-size pages', () => {
    const letter = previewScaleForPage(612, 792)
    const sparse = previewScaleForPage(200, 280)
    expect(letter).toBe(BASE_PREVIEW_SCALE)
    expect(sparse).toBeGreaterThan(letter)
    expect(sparse).toBe(MAX_PREVIEW_SCALE)
  })
})

describe('pdf-lib degrees helper', () => {
  it('keeps a 90-degree increment', () => {
    expect(degrees(90).angle).toBe(90)
  })
})
