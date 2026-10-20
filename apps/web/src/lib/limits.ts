import type { ImportedTextKind } from './import-text.ts'

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024

export type ImageKind = 'png' | 'jpg'
export type SourceKind = 'pdf' | ImportedTextKind | ImageKind

export type LoadedSource =
  | { kind: 'pdf'; name: string; bytes: Uint8Array }
  | { kind: ImportedTextKind; name: string; text: string; pdfName: string }
  | { kind: ImageKind; name: string; bytes: Uint8Array; pdfName: string }

export function isImageKind(kind: SourceKind): kind is ImageKind {
  return kind === 'png' || kind === 'jpg'
}

export function isImageSource(
  source: LoadedSource,
): source is Extract<LoadedSource, { kind: ImageKind }> {
  return source.kind === 'png' || source.kind === 'jpg'
}

export function imageKindFromFile(file: { name: string; type: string }): ImageKind {
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  if (type === 'image/png' || name.endsWith('.png')) {
    return 'png'
  }
  if (
    type === 'image/jpeg' ||
    type === 'image/jpg' ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg')
  ) {
    return 'jpg'
  }
  throw new Error('Chỉ nhận ảnh PNG hoặc JPEG.')
}

export function assertPdfFile(file: File): void {
  if (file.size === 0) {
    throw new Error('Tệp trống. Hãy chọn một PDF có nội dung.')
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error('Tệp vượt quá 20 MB.')
  }
  if (sourceKindFromFile(file) !== 'pdf') {
    throw new Error('Chỉ nhận tệp PDF.')
  }
}

export function sourceKindFromFile(file: File): SourceKind {
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return 'pdf'
  }
  if (type === 'text/markdown' || name.endsWith('.md') || name.endsWith('.markdown')) {
    return 'md'
  }
  if (type === 'text/html' || name.endsWith('.html') || name.endsWith('.htm')) {
    return 'html'
  }
  if (
    type === 'text/plain' ||
    name.endsWith('.txt') ||
    name.endsWith('.text')
  ) {
    return 'txt'
  }
  try {
    return imageKindFromFile(file)
  } catch {
    throw new Error('Chỉ nhận PDF, TXT, Markdown, HTML, PNG hoặc JPEG.')
  }
}

export function assertSourceFile(file: File): SourceKind {
  if (file.size === 0) {
    throw new Error('Tệp trống. Hãy chọn một tệp có nội dung.')
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error('Tệp vượt quá 20 MB.')
  }
  return sourceKindFromFile(file)
}

export async function readPdfFile(file: File): Promise<Uint8Array> {
  assertPdfFile(file)
  return new Uint8Array(await file.arrayBuffer())
}

export async function readSourceFile(file: File): Promise<LoadedSource> {
  const kind = assertSourceFile(file)
  if (kind === 'pdf') {
    return { kind, name: file.name, bytes: new Uint8Array(await file.arrayBuffer()) }
  }
  if (isImageKind(kind)) {
    return {
      kind,
      name: file.name,
      bytes: new Uint8Array(await file.arrayBuffer()),
      pdfName: swapExtension(file.name, 'pdf'),
    }
  }
  return {
    kind,
    name: file.name,
    text: await file.text(),
    pdfName: swapExtension(file.name, 'pdf'),
  }
}

export async function readImageFiles(
  files: Iterable<File>,
): Promise<{ kind: ImageKind; bytes: Uint8Array; name: string }[]> {
  const list = [...files]
  if (list.length === 0) {
    throw new Error('Chọn ít nhất một ảnh PNG hoặc JPEG.')
  }
  const images: { kind: ImageKind; bytes: Uint8Array; name: string }[] = []
  for (const file of list) {
    if (file.size === 0) {
      throw new Error('Tệp trống. Hãy chọn một tệp có nội dung.')
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new Error('Tệp vượt quá 20 MB.')
    }
    images.push({
      kind: imageKindFromFile(file),
      bytes: new Uint8Array(await file.arrayBuffer()),
      name: file.name,
    })
  }
  return images
}

export function swapExtension(filename: string, ext: string): string {
  const base =
    filename.replace(/\.(pdf|txt|text|md|markdown|html|htm|png|jpe?g|json|csv)$/i, '') ||
    'document'
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

export function splitPartName(filename: string, part: number, total: number): string {
  const base = filename.replace(/\.pdf$/i, '') || 'document'
  const width = String(Math.max(1, total)).length
  return `${base}-phan-${String(part).padStart(width, '0')}-cua-${total}.pdf`
}

export function splitZipName(filename: string): string {
  const base = filename.replace(/\.pdf$/i, '') || 'document'
  return `${base}-tach.zip`
}

export function imagePageName(
  filename: string,
  pageIndex: number,
  ext: 'png' | 'jpg',
): string {
  const base =
    filename.replace(/\.(pdf|txt|text|md|markdown|html|htm|png|jpe?g|json|csv)$/i, '') || 'document'
  const page = Number.isInteger(pageIndex) && pageIndex >= 0 ? pageIndex + 1 : 1
  return `${base}-trang-${page}.${ext}`
}

export function imageZipName(filename: string, ext: 'png' | 'jpg'): string {
  const base =
    filename.replace(/\.(pdf|txt|text|md|markdown|html|htm|png|jpe?g|json|csv)$/i, '') || 'document'
  return `${base}-anh-${ext}.zip`
}
