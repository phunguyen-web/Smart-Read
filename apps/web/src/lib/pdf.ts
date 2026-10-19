import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib'

export async function pageCount(bytes: Uint8Array): Promise<number> {
  const doc = await PDFDocument.load(bytes)
  return doc.getPageCount()
}

export async function rotatePages(
  bytes: Uint8Array,
  pageIndexes: number[],
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes)
  for (const index of uniqueSorted(pageIndexes, false)) {
    const page = doc.getPage(index)
    page.setRotation(degrees((page.getRotation().angle + 90) % 360))
  }
  return new Uint8Array(await doc.save())
}

export async function deletePages(
  bytes: Uint8Array,
  pageIndexes: number[],
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes)
  const unique = uniqueSorted(pageIndexes, true)
  if (doc.getPageCount() - unique.length < 1) {
    throw new Error('Phải giữ lại ít nhất một trang.')
  }
  for (const index of unique) {
    doc.removePage(index)
  }
  return new Uint8Array(await doc.save())
}

export async function movePage(
  bytes: Uint8Array,
  from: number,
  to: number,
): Promise<Uint8Array> {
  const src = await PDFDocument.load(bytes)
  const count = src.getPageCount()
  if (from < 0 || from >= count || to < 0 || to >= count || from === to) {
    return bytes
  }
  const order = src.getPageIndices()
  const [item] = order.splice(from, 1)
  order.splice(to, 0, item)
  const dst = await PDFDocument.create()
  const copied = await dst.copyPages(src, order)
  for (const page of copied) {
    dst.addPage(page)
  }
  return new Uint8Array(await dst.save())
}

export async function mergePdf(
  base: Uint8Array,
  extra: Uint8Array,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(base)
  const other = await PDFDocument.load(extra)
  const copied = await doc.copyPages(other, other.getPageIndices())
  for (const page of copied) {
    doc.addPage(page)
  }
  return new Uint8Array(await doc.save())
}

export async function addTextOverlay(
  bytes: Uint8Array,
  pageIndex: number,
  text: string,
): Promise<Uint8Array> {
  const trimmed = text.trim()
  if (!trimmed) {
    throw new Error('Nhập nội dung chữ cần chèn.')
  }
  const doc = await PDFDocument.load(bytes)
  const page = doc.getPage(pageIndex)
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const { height } = page.getSize()
  page.drawText(trimmed, {
    x: 48,
    y: height - 56,
    size: 16,
    font,
    color: rgb(0.22, 0.12, 0.08),
  })
  return new Uint8Array(await doc.save())
}

function uniqueSorted(indexes: number[], descending: boolean): number[] {
  const unique = [...new Set(indexes)]
  unique.sort((a, b) => (descending ? b - a : a - b))
  return unique
}
