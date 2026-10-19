import { Document, HeadingLevel, Packer, Paragraph } from 'docx'
import JSZip from 'jszip'

export type ExportFormat = 'txt' | 'html' | 'docx' | 'doc' | 'epub' | 'mobi'

export function toTxt(pages: string[]): string {
  return pages
    .map((text, index) => `--- Trang ${index + 1} ---\n${text || '(không có chữ)'}`)
    .join('\n\n')
}

export function toHtml(title: string, pages: string[]): string {
  const sections = pages
    .map(
      (text, index) =>
        `<section><h2>Trang ${index + 1}</h2><p>${escapeHtml(text || '(không có chữ)')}</p></section>`,
    )
    .join('\n')
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${sections}
</body>
</html>`
}

export async function toDocx(title: string, pages: string[]): Promise<Blob> {
  const children = [
    new Paragraph({ text: title, heading: HeadingLevel.TITLE }),
    ...pages.flatMap((text, index) => [
      new Paragraph({ text: `Trang ${index + 1}`, heading: HeadingLevel.HEADING_2 }),
      new Paragraph({ text: text || '(không có chữ)' }),
    ]),
  ]
  const document = new Document({
    sections: [{ children }],
  })
  return Packer.toBlob(document)
}

export async function toEpub(title: string, pages: string[]): Promise<Blob> {
  const zip = new JSZip()
  const xhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="vi" lang="vi">
<head><title>${escapeHtml(title)}</title></head>
<body>
${pages
  .map(
    (text, index) =>
      `<h1>Trang ${index + 1}</h1><p>${escapeHtml(text || '(không có chữ)')}</p>`,
  )
  .join('\n')}
</body>
</html>`
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' })
  zip.file(
    'META-INF/container.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`,
  )
  zip.file(
    'OEBPS/content.opf',
    `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">smart-read-${Date.now()}</dc:identifier>
    <dc:title>${escapeHtml(title)}</dc:title>
    <dc:language>vi</dc:language>
  </metadata>
  <manifest>
    <item id="text" href="text.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine>
    <itemref idref="text"/>
  </spine>
</package>`,
  )
  zip.file('OEBPS/text.xhtml', xhtml)
  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/epub+zip',
  })
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function extensionFor(format: ExportFormat): string {
  if (format === 'mobi') {
    return 'epub'
  }
  return format
}

export function mimeFor(format: ExportFormat): string {
  switch (format) {
    case 'txt':
      return 'text/plain;charset=utf-8'
    case 'html':
      return 'text/html;charset=utf-8'
    case 'docx':
    case 'doc':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    case 'epub':
    case 'mobi':
      return 'application/epub+zip'
    default:
      return 'application/octet-stream'
  }
}
