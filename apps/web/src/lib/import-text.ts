import JSZip from 'jszip'

export const MAX_IMPORT_CHARS = 200_000
export const MAX_IMPORT_PAGES = 80
export const IMPORT_PAGE_CHARS = 1800

export type ImportedTextKind = 'txt' | 'md' | 'html' | 'json' | 'csv' | 'rtf' | 'fb2'
export type ZipImportKind = 'docx' | 'epub' | 'odt'

function capPages(pages: string[]): string[] {
  const cleaned = pages.map((page) => page.replaceAll('\u0000', '').trimEnd())
  const nonempty = cleaned.some((page) => page.trim()) ? cleaned : ['']
  if (nonempty.length > MAX_IMPORT_PAGES) {
    throw new Error(`Tệp chữ tạo quá ${MAX_IMPORT_PAGES} trang. Hãy cắt nhỏ rồi tải lại.`)
  }
  return nonempty
}

function assertImportBudget(text: string): string {
  const trimmed = text.replace(/^\uFEFF/, '')
  if (!trimmed.trim()) {
    throw new Error('Tệp chữ trống.')
  }
  if (trimmed.length > MAX_IMPORT_CHARS) {
    throw new Error('Tệp chữ vượt quá giới hạn 200.000 ký tự.')
  }
  return trimmed
}

function chunkParagraphs(text: string, size: number): string[] {
  const blocks = text.split(/\n{2,}/)
  const pages: string[] = []
  let current = ''
  for (const block of blocks) {
    const piece = block.trim()
    if (!piece) {
      continue
    }
    if (!current) {
      current = piece
      continue
    }
    if (current.length + piece.length + 2 <= size) {
      current = `${current}\n\n${piece}`
      continue
    }
    pages.push(current)
    current = piece
  }
  if (current) {
    pages.push(current)
  }
  if (pages.length === 0) {
    return [text]
  }
  const overflow: string[] = []
  for (const page of pages) {
    if (page.length <= size * 2) {
      overflow.push(page)
      continue
    }
    for (let index = 0; index < page.length; index += size) {
      overflow.push(page.slice(index, index + size))
    }
  }
  return overflow
}

export function unescapeHtmlEntities(value: string): string {
  return value
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
}

export function stripMarkup(html: string): string {
  return unescapeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|h[1-6]|li|tr|section|article)>/gi, '\n\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[^\S\n]{2,}/g, ' ')
      .trim(),
  )
}

export function pagesFromPlainText(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^--- Trang \d+ ---/m.test(trimmed)) {
    return capPages(
      trimmed
        .split(/^--- Trang \d+ ---\s*/m)
        .map((page) => page.trim())
        .filter((page) => page.length > 0),
    )
  }
  if (trimmed.includes('\f')) {
    return capPages(
      trimmed
        .split('\f')
        .map((page) => page.trim())
        .filter((page) => page.length > 0),
    )
  }
  return capPages(chunkParagraphs(trimmed, IMPORT_PAGE_CHARS))
}

export function pagesFromMarkdown(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^##\s+Trang\s+\d+/m.test(trimmed)) {
    return capPages(
      trimmed
        .split(/^##\s+Trang\s+\d+\s*$/m)
        .map((page) => page.replace(/^#\s+.*$/m, '').trim())
        .filter((page) => page.length > 0),
    )
  }
  if (/^##\s+/m.test(trimmed)) {
    return capPages(
      trimmed
        .split(/(?=^##\s+)/m)
        .map((page) => page.trim())
        .filter((page) => page.length > 0),
    )
  }
  return pagesFromPlainText(trimmed)
}

export function pagesFromHtml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  const sections = trimmed.match(/<section\b[\s\S]*?<\/section>/gi)
  if (sections && sections.length > 0) {
    return capPages(sections.map((section) => stripMarkup(section)).filter((page) => page.length > 0))
  }
  const headings = trimmed.split(/<h2\b[^>]*>/i)
  if (headings.length > 1) {
    return capPages(
      headings
        .slice(1)
        .map((chunk) => stripMarkup(chunk.replace(/^[\s\S]*?<\/h2>/i, '')))
        .filter((page) => page.length > 0),
    )
  }
  return pagesFromPlainText(stripMarkup(trimmed))
}

export function pagesFromImportedText(kind: ImportedTextKind, text: string): string[] {
  if (kind === 'md') {
    return pagesFromMarkdown(text)
  }
  if (kind === 'html') {
    return pagesFromHtml(text)
  }
  if (kind === 'json') {
    return pagesFromJson(text)
  }
  if (kind === 'csv') {
    return pagesFromCsv(text)
  }
  if (kind === 'rtf') {
    return pagesFromRtf(text)
  }
  if (kind === 'fb2') {
    return pagesFromFb2(text)
  }
  return pagesFromPlainText(text)
}

export function unescapeXml(value: string): string {
  return unescapeHtmlEntities(
    value.replace(/&#(\d+);/g, (_match, digits: string) => {
      const code = Number(digits)
      return Number.isInteger(code) && code > 0 ? String.fromCodePoint(code) : ''
    }),
  )
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]!
    if (quoted) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"'
          index += 1
        } else {
          quoted = false
        }
        continue
      }
      field += char
      continue
    }
    if (char === '"') {
      quoted = true
      continue
    }
    if (char === ',') {
      row.push(field)
      field = ''
      continue
    }
    if (char === '\n') {
      row.push(field.endsWith('\r') ? field.slice(0, -1) : field)
      rows.push(row)
      row = []
      field = ''
      continue
    }
    field += char
  }
  if (quoted) {
    throw new Error('CSV thiếu dấu ngoặc đóng.')
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

export function pagesFromJson(text: string): string[] {
  const trimmed = assertImportBudget(text)
  let data: unknown
  try {
    data = JSON.parse(trimmed)
  } catch {
    throw new Error('Tệp JSON không hợp lệ.')
  }
  if (Array.isArray(data) && data.every((item) => typeof item === 'string')) {
    return capPages(data)
  }
  if (data && typeof data === 'object' && Array.isArray((data as { pages?: unknown }).pages)) {
    const pages = (data as { pages: unknown[] }).pages.map((item) => {
      if (typeof item === 'string') {
        return item
      }
      if (item && typeof item === 'object' && typeof (item as { text?: unknown }).text === 'string') {
        return (item as { text: string }).text
      }
      return ''
    })
    return capPages(pages)
  }
  throw new Error('JSON cần { pages: [{ text }] } hoặc một mảng chuỗi.')
}

export function pagesFromCsv(text: string): string[] {
  const rows = parseCsv(assertImportBudget(text)).filter((row) => row.some((cell) => cell.trim()))
  if (rows.length === 0) {
    throw new Error('Tệp CSV trống.')
  }
  const header = rows[0] ?? []
  const start =
    header.length >= 2 && /^page$/i.test(header[0]!.trim()) && /^text$/i.test(header[1]!.trim())
      ? 1
      : 0
  const pages = rows.slice(start).map((row) => (row.length >= 2 ? row.slice(1).join(',') : row[0] ?? ''))
  return capPages(pages)
}

function pagesFromOfficeHeadings(text: string): string[] {
  if (!/^[ \t]*Trang\s+\d+\s*$/m.test(text)) {
    return pagesFromPlainText(text)
  }
  const parts = text.split(/^[ \t]*Trang\s+\d+\s*$/m).map((page) => page.trim())
  const body = parts.slice(1).filter((page) => page.length > 0)
  return capPages(body.length > 0 ? body : parts.filter((page) => page.length > 0))
}

function xmlToPlain(xml: string): string {
  return unescapeXml(
    xml
      .replace(/<w:lastRenderedPageBreak\b[^>]*\/?>/gi, '\f')
      .replace(/<w:br\b[^>]*w:type="page"[^>]*\/?>/gi, '\f')
      .replace(/<w:tab\b[^>]*\/?>/gi, '\t')
      .replace(/<w:br\b[^>]*\/?>/gi, '\n')
      .replace(/<\/w:p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim(),
  )
}

export async function pagesFromDocx(bytes: Uint8Array): Promise<string[]> {
  const zip = await JSZip.loadAsync(bytes)
  const file = zip.file('word/document.xml')
  if (!file) {
    throw new Error('Chỉ mở được DOCX (Office Open XML), không phải DOC nhị phân.')
  }
  return pagesFromOfficeHeadings(xmlToPlain(await file.async('string')))
}

function odtXmlToPlain(xml: string): string {
  return unescapeXml(
    xml
      .replace(/<office:automatic-styles[\s\S]*?<\/office:automatic-styles>/gi, ' ')
      .replace(/<text:line-break\b[^>]*\/?>/gi, '\n')
      .replace(/<text:tab\b[^>]*\/?>/gi, '\t')
      .replace(/<text:s\b[^>]*\/?>/gi, ' ')
      .replace(/<\/text:h>/gi, '\n\n')
      .replace(/<\/text:p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/^[ \t]+/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim(),
  )
}

export async function pagesFromOdt(bytes: Uint8Array): Promise<string[]> {
  let zip: JSZip
  try {
    zip = await JSZip.loadAsync(bytes)
  } catch {
    throw new Error('Tệp ODT không phải gói OpenDocument hợp lệ.')
  }
  const file = zip.file('content.xml')
  if (!file) {
    throw new Error('Tệp ODT thiếu content.xml.')
  }
  return pagesFromOfficeHeadings(odtXmlToPlain(await file.async('string')))
}

export function rtfToPlain(rtf: string): string {
  if (!/\\rtf/i.test(rtf)) {
    return rtf
  }
  let out = ''
  let index = 0
  let skipDepth = 0
  while (index < rtf.length) {
    const char = rtf[index]!
    if (char === '{') {
      const ahead = rtf.slice(index, index + 24)
      if (/^\{\\(\*|fonttbl|colortbl|stylesheet|info|pict|header|footer)/i.test(ahead)) {
        skipDepth += 1
      } else if (skipDepth > 0) {
        skipDepth += 1
      }
      index += 1
      continue
    }
    if (char === '}') {
      if (skipDepth > 0) {
        skipDepth -= 1
      }
      index += 1
      continue
    }
    if (skipDepth > 0) {
      index += 1
      continue
    }
    if (char === '\\') {
      const next = rtf[index + 1]
      if (next === '\\' || next === '{' || next === '}') {
        out += next
        index += 2
        continue
      }
      if (next === "'") {
        const hex = rtf.slice(index + 2, index + 4)
        const code = Number.parseInt(hex, 16)
        if (Number.isFinite(code)) {
          out += String.fromCharCode(code)
        }
        index += 4
        continue
      }
      if (next === '~') {
        out += ' '
        index += 2
        continue
      }
      const unicode = rtf.slice(index + 1).match(/^u(-?\d+)\s?/)
      if (unicode) {
        let code = Number(unicode[1])
        if (code < 0) {
          code += 65536
        }
        if (code > 0) {
          out += String.fromCodePoint(code)
        }
        index += 1 + unicode[0].length
        if (rtf[index] === '?') {
          index += 1
        }
        continue
      }
      const word = rtf.slice(index + 1).match(/^([a-z]+)(-?\d+)?[ ]?/i)
      if (word) {
        const name = word[1]!.toLowerCase()
        if (name === 'par' || name === 'line' || name === 'page') {
          out += '\n'
        }
        if (name === 'tab') {
          out += '\t'
        }
        index += 1 + word[0].length
        continue
      }
      index += 1
      continue
    }
    if (char === '\r' || char === '\n') {
      index += 1
      continue
    }
    out += char
    index += 1
  }
  return out.replace(/\n{3,}/g, '\n\n').trim()
}

export function pagesFromRtf(text: string): string[] {
  return pagesFromOfficeHeadings(rtfToPlain(assertImportBudget(text)))
}

export function pagesFromFb2(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (!/<FictionBook\b/i.test(trimmed)) {
    throw new Error('Tệp FB2 không hợp lệ.')
  }
  const sections = trimmed.match(/<section\b[\s\S]*?<\/section>/gi)
  if (!sections || sections.length === 0) {
    throw new Error('FB2 không có nội dung chữ để mở.')
  }
  const pages = sections
    .map((section) => {
      const body = section.replace(/<title\b[\s\S]*?<\/title>/i, ' ')
      return stripMarkup(body.replace(/<\/p>/gi, '\n')).replace(/^Trang\s+\d+\s*/i, '').trim()
    })
    .filter((page) => page.length > 0)
  if (pages.length === 0) {
    throw new Error('FB2 không có nội dung chữ để mở.')
  }
  return capPages(pages)
}

function attr(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`${name}="([^"]+)"`))
  return match ? match[1]! : null
}

function resolveZipPath(from: string, href: string): string {
  const cleaned = href.split('#')[0] ?? href
  const dir = from.includes('/') ? from.slice(0, from.lastIndexOf('/') + 1) : ''
  const parts: string[] = []
  for (const part of `${dir}${cleaned}`.replaceAll('\\', '/').split('/')) {
    if (!part || part === '.') {
      continue
    }
    if (part === '..') {
      parts.pop()
      continue
    }
    parts.push(part)
  }
  return parts.join('/')
}

export async function pagesFromEpub(bytes: Uint8Array): Promise<string[]> {
  const zip = await JSZip.loadAsync(bytes)
  const container = await zip.file('META-INF/container.xml')?.async('string')
  if (!container) {
    throw new Error('Tệp EPUB thiếu META-INF/container.xml.')
  }
  const root = container.match(/full-path="([^"]+)"/)?.[1]
  if (!root) {
    throw new Error('Tệp EPUB không có gói nội dung OPF.')
  }
  const opfFile = zip.file(root)
  if (!opfFile) {
    throw new Error('Không đọc được content.opf trong EPUB.')
  }
  const opf = await opfFile.async('string')
  const manifest = new Map<string, string>()
  for (const match of opf.matchAll(/<item\b[^>]*>/gi)) {
    const tag = match[0]
    const id = attr(tag, 'id')
    const href = attr(tag, 'href')
    if (id && href && !/\bproperties="[^"]*\bnav\b/i.test(tag)) {
      manifest.set(id, href)
    }
  }
  const spine = [...opf.matchAll(/<itemref\b[^>]*>/gi)]
    .map((match) => attr(match[0], 'idref'))
    .filter((id): id is string => Boolean(id))
  const hrefs = spine
    .map((id) => manifest.get(id))
    .filter((href): href is string => Boolean(href))
    .filter((href) => !/nav\.xhtml$/i.test(href) && !/toc\.ncx$/i.test(href))
  const pages: string[] = []
  for (const href of hrefs) {
    const path = resolveZipPath(root, href)
    const file = zip.file(path)
    if (!file) {
      continue
    }
    const xhtml = await file.async('string')
    const body = xhtml.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? xhtml
    const text = stripMarkup(body)
      .replace(/^Trang\s+\d+\s*/i, '')
      .trim()
    if (text) {
      pages.push(text)
    }
  }
  if (pages.length === 0) {
    throw new Error('EPUB không có nội dung chữ để mở.')
  }
  return capPages(pages)
}
