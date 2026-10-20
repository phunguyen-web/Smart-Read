import JSZip from 'jszip'

export type ExportFormat =
  | 'txt'
  | 'html'
  | 'md'
  | 'rtf'
  | 'json'
  | 'csv'
  | 'xlsx'
  | 'docx'
  | 'doc'
  | 'odt'
  | 'fb2'
  | 'epub'
  | 'mobi'
  | 'png'
  | 'jpg'
  | 'webp'

export type ImageExportFormat = 'png' | 'jpg' | 'webp'

export function isImageFormat(format: ExportFormat): format is ImageExportFormat {
  return format === 'png' || format === 'jpg' || format === 'webp'
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

export function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`
  }
  return value
}

export function toCsv(pages: string[]): string {
  return ['page,text', ...pages.map((text, index) => `${index + 1},${escapeCsv(text)}`)].join('\n')
}

export type JsonPage = {
  page: number
  text: string
}

export type JsonDocument = {
  title: string
  pages: JsonPage[]
}

export function toJson(title: string, pages: string[]): string {
  const payload: JsonDocument = {
    title,
    pages: pages.map((text, index) => ({ page: index + 1, text })),
  }
  return `${JSON.stringify(payload, null, 2)}\n`
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

function escapeXml(value: string): string {
  return escapeHtml(value)
}

export function toFb2(title: string, pages: string[]): string {
  const heading = escapeXml(title.trim() || 'Tài liệu')
  const sections = (pages.length > 0 ? pages : ['']).map((text, index) => {
    const paragraphs = (text.trim() || '(không có chữ)')
      .split(/\n+/)
      .map((line) => `    <p>${escapeXml(line)}</p>`)
      .join('\n')
    return `  <section>
    <title><p>Trang ${index + 1}</p></title>
${paragraphs}
  </section>`
  })
  return `<?xml version="1.0" encoding="UTF-8"?>
<FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0">
  <description>
    <title-info>
      <genre>ref</genre>
      <book-title>${heading}</book-title>
      <lang>vi</lang>
    </title-info>
    <document-info>
      <program-used>Smart-Read</program-used>
    </document-info>
  </description>
  <body>
${sections.join('\n')}
  </body>
</FictionBook>
`
}

function odtParagraphs(text: string): string {
  const lines = (text.trim() || '(không có chữ)').split(/\n+/)
  return lines.map((line) => `      <text:p>${escapeXml(line)}</text:p>`).join('\n')
}

function xlsxInline(value: string): string {
  return `<c t="inlineStr"><is><t xml:space="preserve">${escapeXml(value).replaceAll('\n', '&#10;')}</t></is></c>`
}

export async function toXlsx(title: string, pages: string[]): Promise<Blob> {
  const heading = escapeXml(title.trim() || 'Tài liệu')
  const rows = [
    `<row r="1">${xlsxInline('page')}${xlsxInline('text')}</row>`,
    ...(pages.length > 0 ? pages : ['']).map(
      (text, index) =>
        `<row r="${index + 2}">${xlsxInline(String(index + 1))}${xlsxInline(text)}</row>`,
    ),
  ]
  const zip = new JSZip()
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
</Types>`,
  )
  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
</Relationships>`,
  )
  zip.file(
    'docProps/core.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <dc:title>${heading}</dc:title>
  <dc:creator>Smart-Read</dc:creator>
</cp:coreProperties>`,
  )
  zip.file(
    'xl/_rels/workbook.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
  )
  zip.file(
    'xl/workbook.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Pages" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`,
  )
  zip.file(
    'xl/styles.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="1"><fill><patternFill patternType="none"/></fill></fills>
  <borders count="1"><border/></borders>
  <cellStyleXfs count="1"><xf/></cellStyleXfs>
  <cellXfs count="1"><xf/></cellXfs>
</styleSheet>`,
  )
  zip.file(
    'xl/worksheets/sheet1.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
${rows.join('\n')}
  </sheetData>
</worksheet>`,
  )
  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

export async function toOdt(title: string, pages: string[]): Promise<Blob> {
  const heading = escapeXml(title.trim() || 'Tài liệu')
  const body = (pages.length > 0 ? pages : ['']).map((text, index) => {
    return `      <text:h text:outline-level="2">Trang ${index + 1}</text:h>
${odtParagraphs(text)}`
  })
  const zip = new JSZip()
  zip.file('mimetype', 'application/vnd.oasis.opendocument.text', { compression: 'STORE' })
  zip.file(
    'META-INF/manifest.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">
  <manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text" manifest:version="1.2"/>
  <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="meta.xml" manifest:media-type="text/xml"/>
</manifest:manifest>`,
  )
  zip.file(
    'styles.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" office:version="1.2">
  <office:styles/>
</office:document-styles>`,
  )
  zip.file(
    'meta.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<office:document-meta xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0" office:version="1.2">
  <office:meta>
    <dc:title>${heading}</dc:title>
    <meta:generator>Smart-Read</meta:generator>
  </office:meta>
</office:document-meta>`,
  )
  zip.file(
    'content.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" office:version="1.2">
  <office:body>
    <office:text>
      <text:h text:outline-level="1">${heading}</text:h>
${body.join('\n')}
    </office:text>
  </office:body>
</office:document-content>`,
  )
  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.oasis.opendocument.text',
  })
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
    case 'json':
      return 'application/json;charset=utf-8'
    case 'csv':
      return 'text/csv;charset=utf-8'
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    case 'png':
      return 'image/png'
    case 'jpg':
      return 'image/jpeg'
    case 'webp':
      return 'image/webp'
    case 'docx':
    case 'doc':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    case 'odt':
      return 'application/vnd.oasis.opendocument.text'
    case 'fb2':
      return 'application/x-fictionbook+xml'
    case 'epub':
      return 'application/epub+zip'
    case 'mobi':
      return 'application/x-mobipocket-ebook'
    default:
      return 'application/octet-stream'
  }
}
