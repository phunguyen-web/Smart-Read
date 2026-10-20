import { rasterToPng } from './extract.ts'
import {
  pagesFromDocx,
  pagesFromEpub,
  pagesFromImportedText,
  pagesFromOdp,
  pagesFromOds,
  pagesFromOdt,
  pagesFromPptx,
  pagesFromXlsx,
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
    const image =
      source.kind === 'webp'
        ? { bytes: await rasterToPng(source.bytes), kind: 'png' as const }
        : { bytes: source.bytes, kind: source.kind }
    return {
      name: source.pdfName,
      bytes: await imagesToPdf([image]),
    }
  }
  if (isZipImportSource(source)) {
    const pages =
      source.kind === 'docx'
        ? await pagesFromDocx(source.bytes)
        : source.kind === 'odt'
          ? await pagesFromOdt(source.bytes)
          : source.kind === 'ods'
            ? await pagesFromOds(source.bytes)
            : source.kind === 'xlsx'
              ? await pagesFromXlsx(source.bytes)
              : source.kind === 'pptx'
                ? await pagesFromPptx(source.bytes)
                : source.kind === 'odp'
                  ? await pagesFromOdp(source.bytes)
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
