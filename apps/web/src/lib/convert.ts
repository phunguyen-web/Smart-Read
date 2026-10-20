import JSZip from 'jszip'

export type ExportFormat =
  | 'txt'
  | 'html'
  | 'md'
  | 'rtf'
  | 'docx'
  | 'doc'
  | 'epub'
  | 'mobi'
  | 'png'
  | 'jpg'

export type ImageExportFormat = 'png' | 'jpg'

export function isImageFormat(format: ExportFormat): format is ImageExportFormat {
  return format === 'png' || format === 'jpg'
}

export type EpubOptions = {
  identifier?: string
  modified?: string
  creator?: string
  language?: string
}

export function slicePageRange(
  pages: string[],
  fromPage: number,
  toPage: number,
): string[] {
  if (pages.length === 0) {
    return pages
  }
  const from = Math.max(1, Math.trunc(fromPage) || 1)
  const to = Math.min(pages.length, Math.trunc(toPage) || pages.length)
  if (from > to) {
    throw new Error('Khoảng trang không hợp lệ.')
  }
  return pages.slice(from - 1, to)
}

export function slicePagesByIndexes(pages: string[], indexes: readonly number[]): string[] {
  const unique = [
    ...new Set(indexes.filter((index) => Number.isInteger(index) && index >= 0 && index < pages.length)),
  ].sort((a, b) => a - b)
  if (unique.length === 0) {
    throw new Error('Không có trang đã chọn để xuất.')
  }
  return unique.map((index) => pages[index]!)
}

export function toTxt(pages: string[]): string {
  return pages
    .map((text, index) => `--- Trang ${index + 1} ---\n${text || '(không có chữ)'}`)
    .join('\n\n')
}

function htmlParagraph(text: string): string {
  return `<p>${escapeHtml(text || '(không có chữ)').replaceAll('\n', '<br/>')}</p>`
}

export function escapeRtf(value: string): string {
  let out = ''
  for (const char of value) {
    if (char === '\\' || char === '{' || char === '}') {
      out += `\\${char}`
      continue
    }
    if (char === '\r') {
      continue
    }
    if (char === '\n') {
      out += '\\par\n'
      continue
    }
    const code = char.codePointAt(0) ?? 0
    if (code < 128) {
      out += char
      continue
    }
    const signed = code > 32767 ? code - 65536 : code
    out += `\\u${signed}?`
  }
  return out
}

export function toRtf(title: string, pages: string[]): string {
  const heading = escapeRtf(title.trim() || 'Tài liệu')
  const body = pages
    .map((text, index) => {
      const pageTitle = escapeRtf(`Trang ${index + 1}`)
      const content = escapeRtf(text.trim() || '(không có chữ)')
      return `\\b ${pageTitle}\\b0\\par\n${content}\\par\\par\n`
    })
    .join('')
  return `{\\rtf1\\ansi\\ansicpg65001\\deff0{\\fonttbl{\\f0 Times New Roman;}}\\uc1\\pard\\f0\\fs24\\b ${heading}\\b0\\par\\par\n${body}}`
}

export function toMarkdown(title: string, pages: string[]): string {
  const heading = `# ${title.trim() || 'Tài liệu'}`
  const body = pages
    .map((text, index) => {
      const content = text.trim() || '*(không có chữ)*'
      return `## Trang ${index + 1}\n\n${content}`
    })
    .join('\n\n')
  return `${heading}\n\n${body}\n`
}

export function toHtml(title: string, pages: string[]): string {
  const sections = pages
    .map(
      (text, index) =>
        `<section id="page-${index + 1}"><h2>Trang ${index + 1}</h2>${htmlParagraph(text)}</section>`,
    )
    .join('\n')
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
</head>
<body>
  <article>
    <h1>${escapeHtml(title)}</h1>
    ${sections}
  </article>
</body>
</html>`
}

export async function toDocx(title: string, pages: string[]): Promise<Blob> {
  const { Document, HeadingLevel, Packer, Paragraph } = await import('docx')
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

function pageHref(index: number): string {
  return `page-${String(index + 1).padStart(4, '0')}.xhtml`
}

function pageId(index: number): string {
  return `page-${String(index + 1).padStart(4, '0')}`
}

function isoNow(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
}

export async function toEpub(
  title: string,
  pages: string[],
  options: EpubOptions = {},
): Promise<Blob> {
  const bodyPages = pages.length > 0 ? pages : ['']
  const language = options.language ?? 'vi'
  const creator = options.creator ?? 'Smart-Read'
  const modified = options.modified ?? isoNow()
  const bookId =
    options.identifier ??
    `urn:uuid:${typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`}`
  const safeTitle = escapeHtml(title)
  const zip = new JSZip()

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
    'OEBPS/styles.css',
    `body { font-family: serif; line-height: 1.5; margin: 1.2em; }
h1 { font-size: 1.25em; }`,
  )

  const navItems = bodyPages
    .map(
      (_text, index) =>
        `      <li><a href="${pageHref(index)}">Trang ${index + 1}</a></li>`,
    )
    .join('\n')
  zip.file(
    'OEBPS/nav.xhtml',
    `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${language}" lang="${language}">
<head>
  <title>Mục lục — ${safeTitle}</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Mục lục</h1>
    <ol>
${navItems}
    </ol>
  </nav>
  <nav epub:type="landmarks" hidden="hidden">
    <ol>
      <li><a epub:type="bodymatter" href="${pageHref(0)}">Bắt đầu</a></li>
    </ol>
  </nav>
</body>
</html>`,
  )

  const ncxNav = bodyPages
    .map(
      (_text, index) => `    <navPoint id="${pageId(index)}" playOrder="${index + 1}">
      <navLabel><text>Trang ${index + 1}</text></navLabel>
      <content src="${pageHref(index)}"/>
    </navPoint>`,
    )
    .join('\n')
  zip.file(
    'OEBPS/toc.ncx',
    `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${escapeHtml(bookId)}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="${bodyPages.length}"/>
    <meta name="dtb:maxPageNumber" content="${bodyPages.length}"/>
  </head>
  <docTitle><text>${safeTitle}</text></docTitle>
  <navMap>
${ncxNav}
  </navMap>
</ncx>`,
  )

  for (const [index, text] of bodyPages.entries()) {
    zip.file(
      `OEBPS/${pageHref(index)}`,
      `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${language}" lang="${language}">
<head>
  <title>Trang ${index + 1} — ${safeTitle}</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
  <h1>Trang ${index + 1}</h1>
  ${htmlParagraph(text)}
</body>
</html>`,
    )
  }

  const manifestPages = bodyPages
    .map(
      (_text, index) =>
        `    <item id="${pageId(index)}" href="${pageHref(index)}" media-type="application/xhtml+xml"/>`,
    )
    .join('\n')
  const spinePages = bodyPages
    .map((_text, index) => `    <itemref idref="${pageId(index)}"/>`)
    .join('\n')

  zip.file(
    'OEBPS/content.opf',
    `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="3.0" xml:lang="${language}" prefix="dcterms: http://purl.org/dc/terms/">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">${escapeHtml(bookId)}</dc:identifier>
    <dc:title>${safeTitle}</dc:title>
    <dc:language>${escapeHtml(language)}</dc:language>
    <dc:creator>${escapeHtml(creator)}</dc:creator>
    <dc:date>${escapeHtml(modified.slice(0, 10))}</dc:date>
    <meta property="dcterms:modified">${escapeHtml(modified)}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="css" href="styles.css" media-type="text/css"/>
${manifestPages}
  </manifest>
  <spine toc="ncx">
${spinePages}
  </spine>
</package>`,
  )

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
  return format
}

export async function zipPdfParts(
  parts: readonly { name: string; bytes: Uint8Array }[],
): Promise<Blob> {
  if (parts.length === 0) {
    throw new Error('Không có phần PDF để nén.')
  }
  const zip = new JSZip()
  for (const part of parts) {
    zip.file(part.name, part.bytes)
  }
  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/zip',
  })
}

export function mimeFor(format: ExportFormat): string {
  switch (format) {
    case 'txt':
      return 'text/plain;charset=utf-8'
    case 'html':
      return 'text/html;charset=utf-8'
    case 'md':
      return 'text/markdown;charset=utf-8'
    case 'rtf':
      return 'application/rtf'
    case 'png':
      return 'image/png'
    case 'jpg':
      return 'image/jpeg'
    case 'docx':
    case 'doc':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    case 'epub':
      return 'application/epub+zip'
    case 'mobi':
      return 'application/x-mobipocket-ebook'
    default:
      return 'application/octet-stream'
  }
}
