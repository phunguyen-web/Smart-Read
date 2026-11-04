import JSZip from 'jszip'

export const MAX_IMPORT_CHARS = 200_000
export const MAX_IMPORT_PAGES = 80
export const IMPORT_PAGE_CHARS = 1800

export type ImportedTextKind =
  | 'txt'
  | 'md'
  | 'html'
  | 'json'
  | 'yaml'
  | 'xml'
  | 'csv'
  | 'tsv'
  | 'toml'
  | 'org'
  | 'tex'
  | 'jsonl'
  | 'ini'
  | 'adoc'
  | 'rst'
  | 'textile'
  | 'wiki'
  | 'dokuwiki'
  | 'dbk'
  | 'opml'
  | 'atom'
  | 'typ'
  | 'gmi'
  | 'pod'
  | 'bbcode'
  | 'fountain'
  | 'tid'
  | 'texinfo'
  | 'roff'
  | 'ipynb'
  | 'bib'
  | 'srt'
  | 'vtt'
  | 'lrc'
  | 'ics'
  | 'cue'
  | 'ass'
  | 'ttml'
  | 'sbv'
  | 'sami'
  | 'sub'
  | 'stl'
  | 'scc'
  | 'usf'
  | 'rt'
  | 'mpl'
  | 'rtf'
  | 'fb2'
export type ZipImportKind = 'docx' | 'epub' | 'odt' | 'ods' | 'xlsx' | 'pptx' | 'odp' | 'cbz'

export type ComicImageKind = 'png' | 'jpg' | 'webp'
export type ComicImage = {
  bytes: Uint8Array
  kind: ComicImageKind
  name: string
}

const COMIC_IMAGE_NAME = /\.(png|jpe?g|webp)$/i

export async function imagesFromCbz(bytes: Uint8Array): Promise<ComicImage[]> {
  let zip: JSZip
  try {
    zip = await JSZip.loadAsync(bytes)
  } catch {
    throw new Error('Tệp CBZ không đọc được.')
  }
  const names = Object.keys(zip.files)
    .filter((name) => {
      const file = zip.files[name]
      if (!file || file.dir) {
        return false
      }
      const base = name.split('/').pop() ?? name
      if (!base || base.startsWith('.') || name.includes('__MACOSX')) {
        return false
      }
      return COMIC_IMAGE_NAME.test(base)
    })
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' }))
  if (names.length === 0) {
    throw new Error('CBZ không có ảnh PNG, JPEG hoặc WEBP.')
  }
  if (names.length > MAX_IMPORT_PAGES) {
    throw new Error(`CBZ tạo quá ${MAX_IMPORT_PAGES} trang. Hãy cắt nhỏ rồi tải lại.`)
  }
  const images: ComicImage[] = []
  for (const name of names) {
    const data = await zip.files[name]!.async('uint8array')
    if (data.byteLength === 0) {
      continue
    }
    const base = name.split('/').pop() ?? name
    const lower = base.toLowerCase()
    const kind: ComicImageKind = lower.endsWith('.png')
      ? 'png'
      : lower.endsWith('.webp')
        ? 'webp'
        : 'jpg'
    images.push({ bytes: data, kind, name: base })
  }
  if (images.length === 0) {
    throw new Error('CBZ không có ảnh PNG, JPEG hoặc WEBP.')
  }
  return images
}

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
  if (kind === 'yaml') {
    return pagesFromYaml(text)
  }
  if (kind === 'xml') {
    return pagesFromXml(text)
  }
  if (kind === 'csv') {
    return pagesFromCsv(text)
  }
  if (kind === 'tsv') {
    return pagesFromTsv(text)
  }
  if (kind === 'toml') {
    return pagesFromToml(text)
  }
  if (kind === 'org') {
    return pagesFromOrg(text)
  }
  if (kind === 'tex') {
    return pagesFromLatex(text)
  }
  if (kind === 'jsonl') {
    return pagesFromJsonl(text)
  }
  if (kind === 'ini') {
    return pagesFromIni(text)
  }
  if (kind === 'adoc') {
    return pagesFromAdoc(text)
  }
  if (kind === 'rst') {
    return pagesFromRst(text)
  }
  if (kind === 'textile') {
    return pagesFromTextile(text)
  }
  if (kind === 'wiki') {
    return pagesFromWiki(text)
  }
  if (kind === 'dokuwiki') {
    return pagesFromDokuwiki(text)
  }
  if (kind === 'dbk') {
    return pagesFromDocbook(text)
  }
  if (kind === 'opml') {
    return pagesFromOpml(text)
  }
  if (kind === 'atom') {
    return pagesFromAtom(text)
  }
  if (kind === 'typ') {
    return pagesFromTypst(text)
  }
  if (kind === 'gmi') {
    return pagesFromGemtext(text)
  }
  if (kind === 'pod') {
    return pagesFromPod(text)
  }
  if (kind === 'bbcode') {
    return pagesFromBbcode(text)
  }
  if (kind === 'fountain') {
    return pagesFromFountain(text)
  }
  if (kind === 'tid') {
    return pagesFromTid(text)
  }
  if (kind === 'texinfo') {
    return pagesFromTexinfo(text)
  }
  if (kind === 'roff') {
    return pagesFromRoff(text)
  }
  if (kind === 'ipynb') {
    return pagesFromIpynb(text)
  }
  if (kind === 'bib') {
    return pagesFromBibtex(text)
  }
  if (kind === 'srt') {
    return pagesFromSrt(text)
  }
  if (kind === 'vtt') {
    return pagesFromVtt(text)
  }
  if (kind === 'lrc') {
    return pagesFromLrc(text)
  }
  if (kind === 'ics') {
    return pagesFromIcs(text)
  }
  if (kind === 'cue') {
    return pagesFromCue(text)
  }
  if (kind === 'ass') {
    return pagesFromAss(text)
  }
  if (kind === 'ttml') {
    return pagesFromTtml(text)
  }
  if (kind === 'sbv') {
    return pagesFromSbv(text)
  }
  if (kind === 'sami') {
    return pagesFromSami(text)
  }
  if (kind === 'sub') {
    return pagesFromSub(text)
  }
  if (kind === 'stl') {
    return pagesFromStl(text)
  }
  if (kind === 'scc') {
    return pagesFromScc(text)
  }
  if (kind === 'usf') {
    return pagesFromUsf(text)
  }
  if (kind === 'rt') {
    return pagesFromRt(text)
  }
  if (kind === 'mpl') {
    return pagesFromMpl(text)
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

export function parseCsv(text: string, delimiter = ','): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  const label = delimiter === '\t' ? 'TSV' : 'CSV'
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
    if (char === delimiter) {
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
    throw new Error(`${label} thiếu dấu ngoặc đóng.`)
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

function unescapeYamlQuoted(value: string): string {
  const trimmed = value.trim()
  if (trimmed.length >= 2) {
    const quote = trimmed[0]
    if ((quote === '"' || quote === "'") && trimmed.endsWith(quote)) {
      const inner = trimmed.slice(1, -1)
      if (quote === "'") {
        return inner.replaceAll("''", "'")
      }
      return inner
        .replaceAll('\\n', '\n')
        .replaceAll('\\t', '\t')
        .replaceAll('\\"', '"')
        .replaceAll('\\\\', '\\')
    }
  }
  return trimmed
}

export function pagesFromYaml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*[[{]/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages: string[] = []
  const lines = trimmed.replace(/\r\n/g, '\n').split('\n')
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index]!.match(/^\s*(?:-\s+)?text:\s*(.*)$/)
    if (!match) {
      continue
    }
    const rest = match[1]!.trim()
    if (rest === '|' || rest === '|-' || rest === '>' || rest === '>-') {
      const block: string[] = []
      let cursor = index + 1
      let strip: number | null = null
      while (cursor < lines.length) {
        const line = lines[cursor]!
        if (line.trim() === '') {
          if (strip != null) {
            block.push('')
          }
          cursor += 1
          continue
        }
        const indent = line.match(/^\s*/)?.[0].length ?? 0
        if (strip == null) {
          strip = indent
        }
        if (indent < strip) {
          break
        }
        block.push(line.slice(strip))
        cursor += 1
      }
      pages.push(block.join('\n').replace(/\n+$/, ''))
      index = cursor - 1
      continue
    }
    pages.push(unescapeYamlQuoted(rest))
  }
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp YAML cần các mục text: trong pages.')
}

export function pagesFromXml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/<FictionBook\b/i.test(trimmed)) {
    return pagesFromFb2(trimmed)
  }
  const matches = [...trimmed.matchAll(/<page\b[^>]*>([\s\S]*?)<\/page>/gi)]
  if (matches.length > 0) {
    return capPages(
      matches.map((match) => unescapeXml(match[1]!.replace(/<[^>]+>/g, ''))),
    )
  }
  throw new Error('Tệp XML cần các thẻ <page>.')
}

function pagesFromDelimited(text: string, delimiter: string, label: string): string[] {
  const rows = parseCsv(assertImportBudget(text), delimiter).filter((row) =>
    row.some((cell) => cell.trim()),
  )
  if (rows.length === 0) {
    throw new Error(`Tệp ${label} trống.`)
  }
  const header = rows[0] ?? []
  const start =
    header.length >= 2 && /^page$/i.test(header[0]!.trim()) && /^text$/i.test(header[1]!.trim())
      ? 1
      : 0
  const pages = rows
    .slice(start)
    .map((row) => (row.length >= 2 ? row.slice(1).join(delimiter) : (row[0] ?? '')))
  return capPages(pages)
}

export function pagesFromCsv(text: string): string[] {
  return pagesFromDelimited(text, ',', 'CSV')
}

export function pagesFromTsv(text: string): string[] {
  return pagesFromDelimited(text, '\t', 'TSV')
}

function unescapeTomlValue(value: string): string {
  const trimmed = value.trim()
  if (trimmed.length >= 2) {
    const quote = trimmed[0]
    if (quote === '"' && trimmed.endsWith('"')) {
      return trimmed
        .slice(1, -1)
        .replaceAll('\\n', '\n')
        .replaceAll('\\t', '\t')
        .replaceAll('\\"', '"')
        .replaceAll('\\\\', '\\')
    }
    if (quote === "'" && trimmed.endsWith("'")) {
      return trimmed.slice(1, -1)
    }
  }
  return trimmed
}

export function pagesFromToml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed) || (/^\s*\[/.test(trimmed) && !/^\s*\[\[/.test(trimmed))) {
    return pagesFromJson(trimmed)
  }
  const pages: string[] = []
  for (const line of trimmed.replace(/\r\n/g, '\n').split('\n')) {
    const match = line.match(/^\s*text\s*=\s*(.*)$/)
    if (!match) {
      continue
    }
    pages.push(unescapeTomlValue(match[1]!))
  }
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp TOML cần các mục text = trong [[pages]].')
}

export function pagesFromOrg(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed) || /^\s*\[/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  if (/^\*{1,3}\s+Trang\s+\d+/m.test(trimmed)) {
    return capPages(
      trimmed
        .split(/^\*{1,3}\s+Trang\s+\d+\s*$/m)
        .map((page) => page.replace(/^\*\s+.*$/m, '').trim())
        .filter((page) => page.length > 0),
    )
  }
  if (/^\*{1,3}\s+/m.test(trimmed)) {
    const pages = trimmed
      .split(/(?=^\*{1,3}\s+)/m)
      .map((part) => part.replace(/^\*{1,3}\s+.*$/m, '').trim())
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  return pagesFromPlainText(trimmed)
}

export function unescapeLatex(value: string): string {
  return value
    .replaceAll('\\textbackslash{}', '\u0000')
    .replaceAll('\\textasciicircum{}', '^')
    .replaceAll('\\textasciitilde{}', '~')
    .replaceAll('\\{', '{')
    .replaceAll('\\}', '}')
    .replaceAll('\\$', '$')
    .replaceAll('\\&', '&')
    .replaceAll('\\#', '#')
    .replaceAll('\\_', '_')
    .replaceAll('\\%', '%')
    .replaceAll('\u0000', '\\')
}

export function pagesFromJsonl(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*[[]/.test(trimmed) || /^\s*\{[\s\S]*"pages"\s*:/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages: string[] = []
  for (const line of trimmed.replace(/\r\n/g, '\n').split('\n')) {
    const row = line.trim()
    if (!row) {
      continue
    }
    let data: unknown
    try {
      data = JSON.parse(row)
    } catch {
      throw new Error('Tệp JSONL có dòng không hợp lệ.')
    }
    if (typeof data === 'string') {
      pages.push(data)
      continue
    }
    if (data && typeof data === 'object' && typeof (data as { text?: unknown }).text === 'string') {
      pages.push((data as { text: string }).text)
      continue
    }
    pages.push('')
  }
  if (pages.length === 0) {
    throw new Error('Tệp JSONL cần một đối tượng { text } mỗi dòng.')
  }
  return capPages(pages)
}

function unescapeIniValue(value: string): string {
  const trimmed = value.trim()
  if (trimmed.length >= 2) {
    const quote = trimmed[0]
    if ((quote === '"' || quote === "'") && trimmed.endsWith(quote)) {
      const inner = trimmed.slice(1, -1)
      if (quote === "'") {
        return inner.replaceAll("''", "'")
      }
      return inner
        .replaceAll('\\n', '\n')
        .replaceAll('\\t', '\t')
        .replaceAll('\\"', '"')
        .replaceAll('\\\\', '\\')
    }
  }
  return trimmed
}

export function pagesFromIni(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed) || (/^\s*\[/.test(trimmed) && !/^\s*\[(document|page)\b/im.test(trimmed))) {
    return pagesFromJson(trimmed)
  }
  const pages: string[] = []
  for (const line of trimmed.replace(/\r\n/g, '\n').split('\n')) {
    const match = line.match(/^\s*text\s*=\s*(.*)$/i)
    if (!match) {
      continue
    }
    pages.push(unescapeIniValue(match[1]!))
  }
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp INI cần các mục text = trong [page.n].')
}

export function pagesFromAdoc(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed) || /^\s*\[/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  if (/^==+\s+Trang\s+\d+/m.test(trimmed)) {
    return capPages(
      trimmed
        .split(/^==+\s+Trang\s+\d+\s*$/m)
        .map((page) => page.replace(/^=+\s+.*$/m, '').trim())
        .filter((page) => page.length > 0),
    )
  }
  if (/^==+\s+/m.test(trimmed)) {
    const pages = trimmed
      .split(/(?=^==+\s+)/m)
      .map((part) => part.replace(/^==+\s+.*$/m, '').replace(/^=+\s+.*$/m, '').trim())
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  return pagesFromPlainText(trimmed)
}

const RST_UNDERLINE = '[=\\-~.`:\'^"+*#]'

export function pagesFromRst(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed) || /^\s*\[/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pageHeading = new RegExp(`^Trang\\s+\\d+\\s*\\n${RST_UNDERLINE}{3,}\\s*$`, 'm')
  const anyHeading = new RegExp(`^.+\\n${RST_UNDERLINE}{3,}\\s*$`, 'm')
  if (pageHeading.test(trimmed)) {
    return capPages(
      trimmed
        .split(pageHeading)
        .map((page) => page.replace(anyHeading, '').trim())
        .filter((page) => page.length > 0),
    )
  }
  if (anyHeading.test(trimmed)) {
    const splitHeading = new RegExp(`(?=^.+\\n${RST_UNDERLINE}{3,}\\s*$)`, 'm')
    const pages = trimmed
      .split(splitHeading)
      .map((part) => part.replace(anyHeading, '').trim())
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  return pagesFromPlainText(trimmed)
}

export function pagesFromTextile(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed) || /^\s*\[/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  if (/^h2\.\s+Trang\s+\d+/m.test(trimmed)) {
    return capPages(
      trimmed
        .split(/^h2\.\s+Trang\s+\d+\s*$/m)
        .map((page) => page.replace(/^h1\.\s+.*$/m, '').trim())
        .filter((page) => page.length > 0),
    )
  }
  if (/^h2\.\s+/m.test(trimmed)) {
    const pages = trimmed
      .split(/(?=^h2\.\s+)/m)
      .map((part) => part.replace(/^h2\.\s+.*$/m, '').replace(/^h1\.\s+.*$/m, '').trim())
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  return pagesFromPlainText(trimmed)
}

export function pagesFromWiki(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed) || /^\s*\[/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  if (/^==+\s*Trang\s+\d+\s*==+/m.test(trimmed)) {
    return capPages(
      trimmed
        .split(/^==+\s*Trang\s+\d+\s*==+\s*$/m)
        .map((page) => page.replace(/^=+\s+.*$/m, '').trim())
        .filter((page) => page.length > 0),
    )
  }
  if (/^==+\s+.+\s+==+/m.test(trimmed)) {
    const pages = trimmed
      .split(/(?=^==+\s+.+\s+==+\s*$)/m)
      .map((part) => part.replace(/^==+\s+.*$/m, '').replace(/^=+\s+.*$/m, '').trim())
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  return pagesFromPlainText(trimmed)
}

export function pagesFromDokuwiki(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed) || /^\s*\[/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const stripTitle = (page: string): string =>
    page.replace(/^={4,}[^\n]*$/m, '').replace(/^={4,}\s*$/m, '').trim()
  if (/^===\s*Trang\s+\d+\s*===\s*$/m.test(trimmed)) {
    return capPages(
      trimmed
        .split(/^===\s*Trang\s+\d+\s*===\s*$/m)
        .map(stripTitle)
        .filter((page) => page.length > 0),
    )
  }
  if (/^===\s+.+\s*===\s*$/m.test(trimmed)) {
    const pages = trimmed
      .split(/(?=^===\s+.+\s*===\s*$)/m)
      .map((part) => stripTitle(part.replace(/^===\s+.*$/m, '').trim()))
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  return pagesFromPlainText(trimmed)
}

export function pagesFromDocbook(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed) || /^\s*\[/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  if (/<FictionBook\b/i.test(trimmed)) {
    return pagesFromFb2(trimmed)
  }
  const sections = [...trimmed.matchAll(/<section\b[^>]*>([\s\S]*?)<\/section>/gi)]
  if (sections.length > 0) {
    const pages = sections
      .map((match) => {
        const body = match[1]!.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, '')
        const paras = [...body.matchAll(/<para\b[^>]*>([\s\S]*?)<\/para>/gi)].map((para) =>
          unescapeXml(para[1]!.replace(/<[^>]+>/g, '')),
        )
        return paras.join('\n').trim()
      })
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  throw new Error('Tệp DocBook cần các mục <section>.')
}

function outlineAttr(attrs: string, name: string): string | null {
  const match = attrs.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`, 'i'))
  return match ? unescapeXml(match[1]!.replace(/&#10;/g, '\n')) : null
}

export function pagesFromOpml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed) || /^\s*\[/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  if (/<FictionBook\b/i.test(trimmed)) {
    return pagesFromFb2(trimmed)
  }
  const outlines = [...trimmed.matchAll(/<outline\b([^>]*)\/?>/gi)]
  const pages = outlines
    .map((match) => {
      const attrs = match[1] ?? ''
      const note = outlineAttr(attrs, '_note')
      if (note && note.trim()) {
        return note.trim()
      }
      const value = outlineAttr(attrs, 'text')
      if (!value || /^Trang\s+\d+$/i.test(value.trim())) {
        return ''
      }
      return value.trim()
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp OPML cần các mục outline.')
}

export function pagesFromAtom(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed) || /^\s*\[/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  if (/<FictionBook\b/i.test(trimmed)) {
    return pagesFromFb2(trimmed)
  }
  const stripFeedBody = (value: string): string =>
    unescapeXml(
      value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, ''),
    ).trim()
  const entries = [...trimmed.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/gi)]
  if (entries.length > 0) {
    const pages = entries
      .map((entry) => {
        const content = entry[1]!.match(/<content\b[^>]*>([\s\S]*?)<\/content>/i)
        const summary = entry[1]!.match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i)
        return stripFeedBody(content?.[1] ?? summary?.[1] ?? '')
      })
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  const items = [...trimmed.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)]
  if (items.length > 0) {
    const pages = items
      .map((item) => {
        const encoded = item[1]!.match(/<content:encoded\b[^>]*>([\s\S]*?)<\/content:encoded>/i)
        const description = item[1]!.match(/<description\b[^>]*>([\s\S]*?)<\/description>/i)
        return stripFeedBody(encoded?.[1] ?? description?.[1] ?? '')
      })
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  throw new Error('Tệp Atom cần các mục <entry> hoặc RSS <item>.')
}

export function pagesFromTypst(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed) || /^\s*\[/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const stripPreamble = (page: string): string =>
    page.replace(/^#set\s+document\b.*$/m, '').replace(/^=+\s+.*$/m, '').trim()
  if (/^==+\s+Trang\s+\d+/m.test(trimmed)) {
    return capPages(
      trimmed
        .split(/^==+\s+Trang\s+\d+\s*$/m)
        .map(stripPreamble)
        .filter((page) => page.length > 0),
    )
  }
  if (/^==+\s+/m.test(trimmed)) {
    const pages = trimmed
      .split(/(?=^==+\s+)/m)
      .map(stripPreamble)
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  return pagesFromPlainText(trimmed)
}

export function pagesFromGemtext(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed) || /^\s*\[/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const stripHeading = (page: string): string =>
    page.replace(/^#+\s+.*$/m, '').trim()
  if (/^##\s+Trang\s+\d+\s*$/m.test(trimmed)) {
    return capPages(
      trimmed
        .split(/^##\s+Trang\s+\d+\s*$/m)
        .map(stripHeading)
        .filter((page) => page.length > 0),
    )
  }
  if (/^##\s+/m.test(trimmed)) {
    const pages = trimmed
      .split(/(?=^##\s+)/m)
      .map(stripHeading)
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  return pagesFromPlainText(trimmed)
}

export function pagesFromPod(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed) || /^\s*\[/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const stripCommands = (page: string): string =>
    page
      .replace(/^=(?:head\d|pod|cut|encoding)\b.*$/gim, '')
      .trim()
  if (/^=head2\s+Trang\s+\d+\s*$/m.test(trimmed)) {
    return capPages(
      trimmed
        .split(/^=head2\s+Trang\s+\d+\s*$/m)
        .map(stripCommands)
        .filter((page) => page.length > 0),
    )
  }
  if (/^=head2\s+/m.test(trimmed)) {
    const pages = trimmed
      .split(/(?=^=head2\s+)/m)
      .map(stripCommands)
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  return pagesFromPlainText(trimmed)
}

export function pagesFromBbcode(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed) || /^\s*\[\s*[{"]/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const stripHeading = (page: string): string =>
    page.replace(/\[h[12]\][\s\S]*?\[\/h[12]\]/gi, '').trim()
  if (/\[h2\]\s*Trang\s+\d+\s*\[\/h2\]/i.test(trimmed)) {
    return capPages(
      trimmed
        .split(/\[h2\]\s*Trang\s+\d+\s*\[\/h2\]/i)
        .map(stripHeading)
        .filter((page) => page.length > 0),
    )
  }
  if (/\[h2\]/i.test(trimmed)) {
    const pages = trimmed
      .split(/(?=\[h2\])/i)
      .map(stripHeading)
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  return pagesFromPlainText(trimmed)
}

export function pagesFromFountain(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed) || /^\s*\[/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const stripHeading = (page: string): string =>
    page
      .replace(/^Title:\s*.*$/im, '')
      .replace(/^#\s+.*$/m, '')
      .trim()
  if (/^#\s+Trang\s+\d+\s*$/m.test(trimmed)) {
    return capPages(
      trimmed
        .split(/^#\s+Trang\s+\d+\s*$/m)
        .map(stripHeading)
        .filter((page) => page.length > 0),
    )
  }
  if (/^#\s+/m.test(trimmed)) {
    const pages = trimmed
      .split(/(?=^#\s+)/m)
      .map(stripHeading)
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  return pagesFromPlainText(trimmed.replace(/^Title:\s*.*$/im, '').trim())
}

export function pagesFromTid(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed) || /^\s*\[/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const stripHeading = (page: string): string =>
    page
      .replace(/^!\s+.*$/m, '')
      .replace(/^!!\s+.*$/m, '')
      .trim()
  if (/^!!\s+Trang\s+\d+\s*$/m.test(trimmed)) {
    return capPages(
      trimmed
        .split(/^!!\s+Trang\s+\d+\s*$/m)
        .map(stripHeading)
        .filter((page) => page.length > 0),
    )
  }
  if (/^!!\s+/m.test(trimmed)) {
    const pages = trimmed
      .split(/(?=^!!\s+)/m)
      .map(stripHeading)
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  return pagesFromPlainText(trimmed.replace(/^!\s+.*$/m, '').trim())
}

export function pagesFromTexinfo(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed) || /^\s*\[/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const stripHeading = (page: string): string =>
    page
      .replace(/^\\input\s+texinfo\s*$/im, '')
      .replace(/^@settitle\s+.*$/m, '')
      .replace(/^@bye\s*$/im, '')
      .replace(/^@section\s+.*$/m, '')
      .trim()
  if (/^@section\s+Trang\s+\d+\s*$/m.test(trimmed)) {
    return capPages(
      trimmed
        .split(/^@section\s+Trang\s+\d+\s*$/m)
        .map(stripHeading)
        .filter((page) => page.length > 0),
    )
  }
  if (/^@section\s+/m.test(trimmed)) {
    const pages = trimmed
      .split(/(?=^@section\s+)/m)
      .map(stripHeading)
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  return pagesFromPlainText(
    trimmed
      .replace(/^\\input\s+texinfo\s*$/im, '')
      .replace(/^@settitle\s+.*$/m, '')
      .replace(/^@bye\s*$/im, '')
      .trim(),
  )
}

export function unescapeBibtex(value: string): string {
  return value.replace(/\\([{}\\])/g, '$1')
}

export function pagesFromIpynb(text: string): string[] {
  const trimmed = assertImportBudget(text)
  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch {
    throw new Error('Notebook Jupyter không hợp lệ.')
  }
  if (parsed && typeof parsed === 'object' && Array.isArray((parsed as { cells?: unknown }).cells)) {
    const pages: string[] = []
    for (const cell of (parsed as { cells: unknown[] }).cells) {
      if (!cell || typeof cell !== 'object') {
        continue
      }
      const record = cell as { cell_type?: unknown; source?: unknown }
      if (record.cell_type !== 'markdown' && record.cell_type !== 'code') {
        continue
      }
      const source = Array.isArray(record.source)
        ? record.source.map((part) => String(part)).join('')
        : typeof record.source === 'string'
          ? record.source
          : ''
      const body = source
        .replace(/^#\s+.*$/m, '')
        .replace(/^##\s+Trang\s+\d+\s*$/m, '')
        .trim()
      if (body) {
        pages.push(body)
      }
    }
    if (pages.length > 0) {
      return capPages(pages)
    }
    throw new Error('Notebook Jupyter không có ô chữ.')
  }
  return pagesFromJson(trimmed)
}

function stripCaptionCue(block: string): string {
  return block
    .replace(/^WEBVTT\b.*$/im, '')
    .replace(/^NOTE\s+.*$/m, '')
    .replace(/^\d+\s*$/m, '')
    .replace(/^\d{2}:\d{2}:\d{2}[,.]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[,.]\d{3}.*$/m, '')
    .trim()
}

export function pagesFromSrt(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed) || /^\s*\[/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  if (
    /^\d+\s*\n\d{2}:\d{2}:\d{2}[,.]\d{3}\s*-->/m.test(trimmed) ||
    /^\d{2}:\d{2}:\d{2}[,.]\d{3}\s*-->/m.test(trimmed)
  ) {
    const pages = trimmed
      .split(/\n(?:\s*\n)+/)
      .map(stripCaptionCue)
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  throw new Error('Tệp phụ đề cần các mục thời gian.')
}

export function pagesFromVtt(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed) || /^\s*\[/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const body = trimmed.replace(/^WEBVTT\b.*$/im, '').trim()
  return pagesFromSrt(body)
}

const LRC_LINE = /^\s*\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\](.*)$/

export function pagesFromLrc(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = trimmed
    .split(/\r?\n/)
    .map((line) => {
      const match = line.match(LRC_LINE)
      return match ? match[4]!.trim() : ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp lời bài hát cần các mốc thời gian.')
}

function unescapeIcs(value: string): string {
  return value
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
}

function unfoldIcs(text: string): string {
  return text.replace(/\r?\n[ \t]/g, '')
}

function icsField(block: string, name: string): string {
  const match = unfoldIcs(block).match(new RegExp(`(?:^|\\n)${name}[;:]([^\\n]*)`, 'i'))
  return match ? unescapeIcs(match[1]!.trim()) : ''
}

export function pagesFromIcs(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed) || /^\s*\[/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const unfolded = unfoldIcs(trimmed)
  if (/BEGIN:VEVENT/i.test(unfolded)) {
    const pages = unfolded
      .split(/BEGIN:VEVENT/i)
      .slice(1)
      .map((chunk) => {
        const block = chunk.split(/END:VEVENT/i)[0] ?? ''
        return icsField(block, 'DESCRIPTION') || icsField(block, 'SUMMARY')
      })
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  throw new Error('Tệp lịch cần các sự kiện VEVENT.')
}

const CUE_TRACK_TITLE = /^\s*TITLE\s+"([^"]*)"\s*$/im

export function pagesFromCue(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  if (/^\s*TRACK\s+\d+\s+AUDIO\b/im.test(trimmed)) {
    const pages = trimmed
      .split(/^\s*TRACK\s+\d+\s+AUDIO\b.*$/im)
      .slice(1)
      .map((chunk) => {
        const title = chunk.match(CUE_TRACK_TITLE)
        return title ? title[1]!.trim() : ''
      })
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  throw new Error('Tệp cue cần các TRACK.')
}

function unescapeAss(value: string): string {
  return value.replace(/\\N/g, '\n').replace(/\\\{/g, '{').replace(/\\\}/g, '}')
}

function assColumnNames(eventsBlock: string): string[] | null {
  const format = eventsBlock.match(/^\s*Format:\s*(.+)$/im)
  if (format) {
    return format[1]!.split(',').map((col) => col.trim().toLowerCase())
  }
  // Some SSA files put a Style: column list (or "Style: Dialogue") in [Events].
  const style = eventsBlock.match(/^\s*Style:\s*(.+)$/im)
  if (!style) {
    return null
  }
  const cols = style[1]!.split(',').map((col) => col.trim().toLowerCase())
  return cols.length > 1 ? cols : null
}

/** Text column from the [Events] Format line (SSA Marked= can add fields before Text). */
export function assTextColumn(eventsBlock: string): number {
  const cols = assColumnNames(eventsBlock)
  if (!cols) {
    return 9
  }
  const textAt = cols.lastIndexOf('text')
  return textAt >= 0 ? textAt : 9
}

/** SSA Dialogue with Marked= plus an extra Layer field and no Format line. */
export function assMarkedLayerTextColumn(line: string): number | null {
  const match = line.match(/^\s*Dialogue:\s*(.*)$/i)
  if (!match) {
    return null
  }
  const fields = match[1]!.split(',')
  if (fields.length < 11 || !/^Marked=\d+$/i.test(fields[0]!.trim())) {
    return null
  }
  if (!/^-?\d+$/.test(fields[1]!.trim())) {
    return null
  }
  if (!/^\d+:\d+:\d+/.test(fields[2]!.trim())) {
    return null
  }
  return 10
}

export function pagesFromAss(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const events = trimmed.split(/^\s*\[Events\]\s*$/im)[1] ?? trimmed
  const hasFormat = /^\s*Format:/im.test(events)
  const defaultAt = assTextColumn(events)
  const pages = events
    .split(/\r?\n/)
    .map((line) => {
      const match = line.match(/^\s*Dialogue:\s*(.*)$/i)
      if (!match) {
        return ''
      }
      const fields = match[1]!.split(',')
      const textAt = !hasFormat ? (assMarkedLayerTextColumn(line) ?? defaultAt) : defaultAt
      if (fields.length <= textAt) {
        return ''
      }
      return unescapeAss(fields.slice(textAt).join(',').trim())
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp phụ đề ASS cần các dòng Dialogue.')
}

export function pagesFromTtml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = [...trimmed.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) =>
      unescapeXml(
        match[1]!.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ''),
      ).trim(),
    )
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp TTML cần các thẻ p.')
}

export function pagesFromSbv(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = trimmed
    .split(/\r?\n\s*\r?\n/)
    .map((chunk) => {
      const lines = chunk.split(/\r?\n/).filter((line) => line.trim().length > 0)
      if (lines.length === 0) {
        return ''
      }
      if (/^\d+:\d{2}:\d{2}\.\d+,\d+:\d{2}:\d{2}\.\d+/.test(lines[0]!)) {
        return lines.slice(1).join('\n').trim()
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp phụ đề SBV cần các mốc thời gian.')
}

export function pagesFromSami(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = [...trimmed.matchAll(/<SYNC\b[^>]*>\s*(?:<P\b[^>]*>)?([\s\S]*?)(?=<SYNC\b|<\/BODY>|$)/gi)]
    .map((match) =>
      unescapeXml(
        match[1]!.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ''),
      ).trim(),
    )
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp SAMI cần các thẻ SYNC.')
}

export function pagesFromSub(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{\d+\}\{\d+\}/.test(trimmed)) {
    const pages = trimmed
      .split(/\r?\n/)
      .map((line) => {
        const match = line.match(/^\s*\{\d+\}\{\d+\}(.*)$/)
        return match ? match[1]!.replace(/\|/g, '\n').trim() : ''
      })
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const lines = trimmed.split(/\r?\n/)
  const pages: string[] = []
  for (let index = 0; index < lines.length; index += 1) {
    if (!/^\d{2}:\d{2}:\d{2}\.\d+,\d{2}:\d{2}:\d{2}\.\d+/.test(lines[index]!)) {
      continue
    }
    const body: string[] = []
    index += 1
    while (
      index < lines.length &&
      lines[index]!.trim().length > 0 &&
      !/^\d{2}:\d{2}:\d{2}\.\d+,\d{2}:\d{2}:\d{2}\.\d+/.test(lines[index]!)
    ) {
      body.push(lines[index]!)
      index += 1
    }
    index -= 1
    const page = body.join('\n').trim()
    if (page) {
      pages.push(page)
    }
  }
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp phụ đề SUB cần các mốc thời gian.')
}

export function pagesFromStl(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = trimmed
    .split(/\r?\n/)
    .map((line) => {
      const match = line.match(
        /^\s*\d{2}:\d{2}:\d{2}:\d{2}\s*,\s*\d{2}:\d{2}:\d{2}:\d{2}\s*,\s*(.*)$/,
      )
      return match ? match[1]!.replace(/\|/g, '\n').trim() : ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp phụ đề STL cần các mốc thời gian.')
}

export function pagesFromScc(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = trimmed
    .split(/\r?\n/)
    .map((line) => {
      const match = line.match(/^\s*\d{2}:\d{2}:\d{2}:\d{2}\s+(.*)$/)
      return match ? match[1]!.replace(/\|/g, '\n').trim() : ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp phụ đề SCC cần các mốc thời gian.')
}

export function pagesFromUsf(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = [...trimmed.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/gi)]
    .map((match) =>
      unescapeXml(match[1]!.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')).trim(),
    )
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp phụ đề USF cần các thẻ text.')
}

export function pagesFromRt(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = trimmed
    .split(/<time\b[^>]*\/?>/i)
    .slice(1)
    .map((chunk) =>
      unescapeXml(
        chunk
          .replace(/<\/window>[\s\S]*$/i, '')
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<[^>]+>/g, ''),
      ).trim(),
    )
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp phụ đề RealText cần các thẻ time.')
}

export function pagesFromMpl(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = trimmed
    .split(/\r?\n/)
    .map((line) => {
      const match = line.match(/^\s*\[\d+\]\[\d+\](.*)$/)
      return match ? match[1]!.replace(/\|/g, '\n').trim() : ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp phụ đề MPL2 cần các mốc [start][end].')
}

export function pagesFromBibtex(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed) || /^\s*\[/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const stripHeading = (entry: string): string => {
    const note = entry.match(/\bnote\s*=\s*\{([\s\S]*?)\}/i)
    if (note) {
      return unescapeBibtex(note[1]!.trim())
    }
    const title = entry.match(/\btitle\s*=\s*\{([\s\S]*?)\}/i)
    if (title && !/^Trang\s+\d+$/.test(title[1]!.trim())) {
      return unescapeBibtex(title[1]!.trim())
    }
    return ''
  }
  if (/^@(?!comment\b)[A-Za-z]+\s*\{/m.test(trimmed)) {
    const pages = trimmed
      .split(/(?=^@[A-Za-z]+\s*\{)/m)
      .filter((chunk) => /^@(?!comment\b)[A-Za-z]+\s*\{/m.test(chunk.trim()))
      .map(stripHeading)
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  throw new Error('Tệp BibTeX cần các mục @entry.')
}

export function pagesFromRoff(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed) || /^\s*\[/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const stripHeading = (page: string): string =>
    page
      .replace(/^\.TH\s+.*$/m, '')
      .replace(/^\.SH\s+.*$/m, '')
      .trim()
  if (/^\.SH\s+Trang\s+\d+\s*$/m.test(trimmed)) {
    return capPages(
      trimmed
        .split(/^\.SH\s+Trang\s+\d+\s*$/m)
        .map(stripHeading)
        .filter((page) => page.length > 0),
    )
  }
  if (/^\.SH\s+/m.test(trimmed)) {
    const pages = trimmed
      .split(/(?=^\.SH\s+)/m)
      .map(stripHeading)
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  return pagesFromPlainText(trimmed.replace(/^\.TH\s+.*$/m, '').trim())
}

export function pagesFromLatex(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed) || /^\s*\[/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  let body = trimmed
  const begin = body.search(/\\begin\{document\}/i)
  if (begin >= 0) {
    body = body.slice(begin).replace(/\\begin\{document\}/i, '')
  }
  body = body.replace(/\\end\{document\}[\s\S]*$/i, '')
  body = body.replace(/\\title\{[^}]*\}/g, '')
  body = body.replace(/\\maketitle/g, '')
  if (/\\section\*?\{/i.test(body)) {
    const pages = body
      .split(/\\section\*?\{[^}]*\}/i)
      .map((page) => unescapeLatex(page).trim())
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  const plain = unescapeLatex(body).trim()
  if (!plain) {
    throw new Error('Tệp LaTeX không có nội dung trang.')
  }
  return pagesFromPlainText(plain)
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

function pptxSlidePlain(xml: string): string {
  const texts = [...xml.matchAll(/<a:t\b[^>]*>([\s\S]*?)<\/a:t>/gi)].map((match) =>
    unescapeXml(match[1] ?? ''),
  )
  if (texts.length === 0) {
    return ''
  }
  if (/^Trang\s+\d+$/i.test(texts[0]!.trim())) {
    return texts.slice(1).join('\n').trim()
  }
  return texts.join('\n').trim()
}

function pptxSlideOrder(presentationXml: string, relsXml: string): string[] {
  const rels = new Map(
    [...relsXml.matchAll(/<Relationship\b[^>]*>/gi)].flatMap((match) => {
      const id = match[0].match(/\bId="([^"]+)"/i)?.[1]
      const target = match[0].match(/\bTarget="([^"]+)"/i)?.[1]
      const type = match[0].match(/\bType="([^"]+)"/i)?.[1] ?? ''
      if (!id || !target || !/\/slide$/i.test(type)) {
        return []
      }
      const path = target.replace(/^\.\//, '')
      return [[id, path.startsWith('ppt/') ? path : `ppt/${path}`] as const]
    }),
  )
  const listed = [...presentationXml.matchAll(/<p:sldId\b[^>]*>/gi)].flatMap((match) => {
    const rid = match[0].match(/\br:id="([^"]+)"/i)?.[1]
    const target = rid ? rels.get(rid) : undefined
    return target ? [target] : []
  })
  return listed
}

export async function pagesFromPptx(bytes: Uint8Array): Promise<string[]> {
  let zip: JSZip
  try {
    zip = await JSZip.loadAsync(bytes)
  } catch {
    throw new Error('Chỉ mở được PPTX (Office Open XML), không phải PPT nhị phân.')
  }
  const presentation = zip.file('ppt/presentation.xml')
  if (!presentation) {
    throw new Error('Chỉ mở được PPTX (Office Open XML), không phải PPT nhị phân.')
  }
  const relsFile = zip.file('ppt/_rels/presentation.xml.rels')
  const ordered = relsFile
    ? pptxSlideOrder(await presentation.async('string'), await relsFile.async('string'))
    : []
  const fallback = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  const paths = ordered.length > 0 ? ordered : fallback
  if (paths.length === 0) {
    throw new Error('Tệp PPTX không có slide.')
  }
  const pages: string[] = []
  for (const path of paths) {
    const file = zip.file(path)
    if (!file) {
      continue
    }
    pages.push(pptxSlidePlain(await file.async('string')))
  }
  if (pages.length === 0) {
    throw new Error('Tệp PPTX không có slide.')
  }
  return capPages(pages)
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

function xlsxSharedStrings(xml: string): string[] {
  return [...xml.matchAll(/<si\b[\s\S]*?<\/si>/gi)].map((match) =>
    unescapeXml(
      [...match[0].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/gi)]
        .map((part) => part[1] ?? '')
        .join(''),
    ),
  )
}

function xlsxCellText(cell: string, shared: string[]): string {
  if (/\bt="inlineStr"/i.test(cell)) {
    const inner = [...cell.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/gi)]
      .map((part) => part[1] ?? '')
      .join('')
    return unescapeXml(inner)
  }
  const value = cell.match(/<v\b[^>]*>([\s\S]*?)<\/v>/i)?.[1] ?? ''
  if (/\bt="s"/i.test(cell)) {
    const index = Number(value)
    return Number.isInteger(index) && index >= 0 ? (shared[index] ?? '') : ''
  }
  return unescapeXml(value)
}

export async function pagesFromXlsx(bytes: Uint8Array): Promise<string[]> {
  let zip: JSZip
  try {
    zip = await JSZip.loadAsync(bytes)
  } catch {
    throw new Error('Tệp XLSX không phải bảng tính Office Open XML hợp lệ.')
  }
  const sheet =
    zip.file('xl/worksheets/sheet1.xml') ??
    zip.file(Object.keys(zip.files).find((name) => /xl\/worksheets\/sheet\d+\.xml$/i.test(name)) ?? '')
  if (!sheet) {
    throw new Error('Tệp XLSX thiếu worksheet.')
  }
  const sharedXml = zip.file('xl/sharedStrings.xml')
    ? await zip.file('xl/sharedStrings.xml')!.async('string')
    : ''
  const shared = sharedXml ? xlsxSharedStrings(sharedXml) : []
  const xml = await sheet.async('string')
  const rows = [...xml.matchAll(/<row\b[\s\S]*?<\/row>/gi)].map((match) =>
    [...match[0].matchAll(/<c\b[\s\S]*?<\/c>/gi)].map((cell) => xlsxCellText(cell[0], shared)),
  )
  const nonempty = rows.filter((row) => row.some((cell) => cell.trim()))
  if (nonempty.length === 0) {
    throw new Error('Tệp XLSX trống.')
  }
  const header = nonempty[0] ?? []
  const start =
    header.length >= 2 && /^page$/i.test(header[0]!.trim()) && /^text$/i.test(header[1]!.trim())
      ? 1
      : 0
  const pages = nonempty
    .slice(start)
    .map((row) => (row.length >= 2 ? row.slice(1).join('\n') : row[0] ?? ''))
  return capPages(pages)
}

function odsCellPlain(cell: string): string {
  return unescapeXml(
    [...cell.matchAll(/<text:p\b[^>]*>([\s\S]*?)<\/text:p>/gi)]
      .map((part) => (part[1] ?? '').replace(/<[^>]+>/g, ''))
      .join('\n'),
  )
}

export async function pagesFromOds(bytes: Uint8Array): Promise<string[]> {
  let zip: JSZip
  try {
    zip = await JSZip.loadAsync(bytes)
  } catch {
    throw new Error('Tệp ODS không phải gói OpenDocument hợp lệ.')
  }
  const file = zip.file('content.xml')
  if (!file) {
    throw new Error('Tệp ODS thiếu content.xml.')
  }
  const xml = await file.async('string')
  const rows = [...xml.matchAll(/<table:table-row\b[\s\S]*?<\/table:table-row>/gi)].map((row) =>
    [...row[0].matchAll(/<table:table-cell\b[\s\S]*?(?:\/>|<\/table:table-cell>)/gi)].map((cell) =>
      odsCellPlain(cell[0]),
    ),
  )
  const nonempty = rows.filter((row) => row.some((cell) => cell.trim()))
  if (nonempty.length === 0) {
    throw new Error('Tệp ODS trống.')
  }
  const header = nonempty[0] ?? []
  const start =
    header.length >= 2 && /^page$/i.test(header[0]!.trim()) && /^text$/i.test(header[1]!.trim())
      ? 1
      : 0
  const pages = nonempty
    .slice(start)
    .map((row) => (row.length >= 2 ? row.slice(1).join('\n') : row[0] ?? ''))
  return capPages(pages)
}

function odpPagePlain(xml: string): string {
  const texts = [...xml.matchAll(/<text:(?:p|h)\b[^>]*>([\s\S]*?)<\/text:(?:p|h)>/gi)].map((match) =>
    unescapeXml((match[1] ?? '').replace(/<[^>]+>/g, '')),
  )
  if (texts.length === 0) {
    return ''
  }
  if (/^Trang\s+\d+$/i.test(texts[0]!.trim())) {
    return texts.slice(1).join('\n').trim()
  }
  return texts.join('\n').trim()
}

export async function pagesFromOdp(bytes: Uint8Array): Promise<string[]> {
  let zip: JSZip
  try {
    zip = await JSZip.loadAsync(bytes)
  } catch {
    throw new Error('Tệp ODP không phải gói OpenDocument hợp lệ.')
  }
  const file = zip.file('content.xml')
  if (!file) {
    throw new Error('Tệp ODP thiếu content.xml.')
  }
  const pages = [...(await file.async('string')).matchAll(/<draw:page\b[\s\S]*?<\/draw:page>/gi)].map(
    (match) => odpPagePlain(match[0]),
  )
  if (pages.length === 0) {
    throw new Error('Tệp ODP không có slide.')
  }
  return capPages(pages)
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
