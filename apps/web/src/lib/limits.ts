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
