import {
  pagesFromDocx,
  pagesFromEpub,
  pagesFromImportedText,
  pagesFromOdt,
} from './import-text.ts'
import { isImageSource, isZipImportSource, type LoadedSource } from './limits.ts'
import { imagesToPdf, textPagesToPdf } from './pdf.ts'

export async function pdfFromLoadedSource(
  source: LoadedSource,
): Promise<{ name: string; bytes: Uint8Array }> {
  if (source.kind === 'pdf') {
    return { name: source.name, bytes: source.bytes }
  }
  if (isImageSource(source)) {
    return {
      name: source.pdfName,
      bytes: await imagesToPdf([{ bytes: source.bytes, kind: source.kind }]),
    }
  }
  if (isZipImportSource(source)) {
    const pages =
      source.kind === 'docx'
        ? await pagesFromDocx(source.bytes)
        : source.kind === 'odt'
          ? await pagesFromOdt(source.bytes)
          : await pagesFromEpub(source.bytes)
    return { name: source.pdfName, bytes: await textPagesToPdf(pages) }
  }
  return {
    name: source.pdfName,
    bytes: await textPagesToPdf(pagesFromImportedText(source.kind, source.text)),
  }
}

export function importNoteFor(source: LoadedSource, pageCount: number): string | null {
  if (source.kind === 'pdf') {
    return null
  }
  const label = source.kind.toUpperCase()
  if (isImageSource(source)) {
    return `Đã tạo PDF ${pageCount} trang từ ${label}. Có thể xuất sang định dạng khác.`
  }
  return `Đã tạo PDF ${pageCount} trang từ ${label}. Có thể xuất sang định dạng khác.`
}
