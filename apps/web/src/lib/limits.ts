export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024

export function assertPdfFile(file: File): void {
  if (file.size === 0) {
    throw new Error('Tệp trống. Hãy chọn một PDF có nội dung.')
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error('Tệp vượt quá 20 MB.')
  }
  const name = file.name.toLowerCase()
  const isPdf = file.type === 'application/pdf' || name.endsWith('.pdf')
  if (!isPdf) {
    throw new Error('Chỉ nhận tệp PDF.')
  }
}

export async function readPdfFile(file: File): Promise<Uint8Array> {
  assertPdfFile(file)
  return new Uint8Array(await file.arrayBuffer())
}

export function swapExtension(filename: string, ext: string): string {
  const base = filename.replace(/\.pdf$/i, '') || 'document'
  return `${base}.${ext}`
}

export function extractedPdfName(filename: string, pageIndexes: readonly number[]): string {
  const base = filename.replace(/\.pdf$/i, '') || 'document'
  const pages = [...new Set(pageIndexes.filter((index) => Number.isInteger(index) && index >= 0))]
    .sort((a, b) => a - b)
    .map((index) => index + 1)
  if (pages.length === 0) {
    return `${base}-trang.pdf`
  }
  if (pages.length === 1) {
    return `${base}-trang-${pages[0]}.pdf`
  }
  const contiguous = pages.every((page, index) => index === 0 || page === pages[index - 1]! + 1)
  if (contiguous || pages.length > 8) {
    return `${base}-trang-${pages[0]}-${pages[pages.length - 1]}.pdf`
  }
  return `${base}-trang-${pages.join('+')}.pdf`
}
