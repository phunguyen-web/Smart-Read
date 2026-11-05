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
  | 'djvu'
  | 'ps'
  | 'tei'
  | 'jats'
  | 'ris'
  | 'enw'
  | 'csljson'
  | 'nbib'
  | 'cslyaml'
  | 'enxml'
  | 'mods'
  | 'cff'
  | 'datacite'
  | 'marcxml'
  | 'dublincore'
  | 'onix'
  | 'unixref'
  | 'bibjson'
  | 'pubmed'
  | 'jsonld'
  | 'bibframe'
  | 'crossref'
  | 'ead'
  | 'mets'
  | 'premis'
  | 'mix'
  | 'alto'
  | 'page'
  | 'foxml'
  | 'edm'
  | 'lido'
  | 'vra'
  | 'cdwa'
  | 'spectrum'
  | 'dwc'
  | 'objectid'
  | 'eac'
  | 'crm'
  | 'rights'
  | 'textmd'
  | 'pbcore'
  | 'ebucore'
  | 'mpeg7'
  | 'aes57'
  | 'lom'
  | 'imscp'
  | 'newsml'
  | 'nitf'
  | 'sportsml'
  | 'eventsml'
  | 'newsmlg2'
  | 'rnews'
  | 'prism'
  | 'hnews'
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
  if (kind === 'djvu') {
    return pagesFromDjvu(text)
  }
  if (kind === 'ps') {
    return pagesFromPs(text)
  }
  if (kind === 'tei') {
    return pagesFromTei(text)
  }
  if (kind === 'jats') {
    return pagesFromJats(text)
  }
  if (kind === 'ris') {
    return pagesFromRis(text)
  }
  if (kind === 'enw') {
    return pagesFromEnw(text)
  }
  if (kind === 'csljson') {
    return pagesFromCsljson(text)
  }
  if (kind === 'nbib') {
    return pagesFromNbib(text)
  }
  if (kind === 'cslyaml') {
    return pagesFromCslyaml(text)
  }
  if (kind === 'enxml') {
    return pagesFromEnxml(text)
  }
  if (kind === 'mods') {
    return pagesFromMods(text)
  }
  if (kind === 'cff') {
    return pagesFromCff(text)
  }
  if (kind === 'datacite') {
    return pagesFromDatacite(text)
  }
  if (kind === 'marcxml') {
    return pagesFromMarcxml(text)
  }
  if (kind === 'dublincore') {
    return pagesFromDublincore(text)
  }
  if (kind === 'onix') {
    return pagesFromOnix(text)
  }
  if (kind === 'unixref') {
    return pagesFromUnixref(text)
  }
  if (kind === 'bibjson') {
    return pagesFromBibjson(text)
  }
  if (kind === 'pubmed') {
    return pagesFromPubmed(text)
  }
  if (kind === 'jsonld') {
    return pagesFromJsonld(text)
  }
  if (kind === 'bibframe') {
    return pagesFromBibframe(text)
  }
  if (kind === 'crossref') {
    return pagesFromCrossref(text)
  }
  if (kind === 'ead') {
    return pagesFromEad(text)
  }
  if (kind === 'mets') {
    return pagesFromMets(text)
  }
  if (kind === 'premis') {
    return pagesFromPremis(text)
  }
  if (kind === 'mix') {
    return pagesFromMix(text)
  }
  if (kind === 'alto') {
    return pagesFromAlto(text)
  }
  if (kind === 'page') {
    return pagesFromPage(text)
  }
  if (kind === 'foxml') {
    return pagesFromFoxml(text)
  }
  if (kind === 'edm') {
    return pagesFromEdm(text)
  }
  if (kind === 'lido') {
    return pagesFromLido(text)
  }
  if (kind === 'vra') {
    return pagesFromVra(text)
  }
  if (kind === 'cdwa') {
    return pagesFromCdwa(text)
  }
  if (kind === 'spectrum') {
    return pagesFromSpectrum(text)
  }
  if (kind === 'dwc') {
    return pagesFromDwc(text)
  }
  if (kind === 'objectid') {
    return pagesFromObjectid(text)
  }
  if (kind === 'eac') {
    return pagesFromEac(text)
  }
  if (kind === 'crm') {
    return pagesFromCrm(text)
  }
  if (kind === 'rights') {
    return pagesFromRights(text)
  }
  if (kind === 'textmd') {
    return pagesFromTextmd(text)
  }
  if (kind === 'pbcore') {
    return pagesFromPbcore(text)
  }
  if (kind === 'ebucore') {
    return pagesFromEbucore(text)
  }
  if (kind === 'mpeg7') {
    return pagesFromMpeg7(text)
  }
  if (kind === 'aes57') {
    return pagesFromAes57(text)
  }
  if (kind === 'lom') {
    return pagesFromLom(text)
  }
  if (kind === 'imscp') {
    return pagesFromImscp(text)
  }
  if (kind === 'newsml') {
    return pagesFromNewsml(text)
  }
  if (kind === 'nitf') {
    return pagesFromNitf(text)
  }
  if (kind === 'sportsml') {
    return pagesFromSportsml(text)
  }
  if (kind === 'eventsml') {
    return pagesFromEventsml(text)
  }
  if (kind === 'newsmlg2') {
    return pagesFromNewsmlg2(text)
  }
  if (kind === 'rnews') {
    return pagesFromRnews(text)
  }
  if (kind === 'prism') {
    return pagesFromPrism(text)
  }
  if (kind === 'hnews') {
    return pagesFromHnews(text)
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

export function pagesFromDjvu(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = trimmed
    .split(/^@page\s+\d+\s*$/m)
    .slice(1)
    .map((chunk) => chunk.replace(/^\n/, '').replace(/\n+$/, '').trim())
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp DjVu text cần các dòng @page.')
}

export function unescapePs(value: string): string {
  return value.replace(/\\([\\()])/g, '$1')
}

export function pagesFromPs(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = [...trimmed.matchAll(/\(((?:\\.|[^\\)])*)\)\s*=\s*$/gm)]
    .map((match) => unescapePs(match[1] ?? '').replace(/\|/g, '\n').trim())
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp PostScript cần các dòng (text) =.')
}

export function pagesFromTei(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pageDivs = [...trimmed.matchAll(/<div\b[^>]*\btype\s*=\s*["']page["'][^>]*>([\s\S]*?)<\/div>/gi)]
  const blocks = pageDivs.length > 0 ? pageDivs : [...trimmed.matchAll(/<div\b[^>]*>([\s\S]*?)<\/div>/gi)]
  if (blocks.length > 0) {
    const pages = blocks
      .map((match) => {
        const body = match[1]!.replace(/<head\b[^>]*>[\s\S]*?<\/head>/i, '')
        const paras = [...body.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((para) =>
          unescapeXml(para[1]!.replace(/<[^>]+>/g, '')),
        )
        return paras.join('\n').trim()
      })
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  throw new Error('Tệp TEI cần các mục <div type="page">.')
}

export function unescapeRis(value: string): string {
  return value.replace(/\|/g, '\n')
}

export function pagesFromRis(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = trimmed.split(/^\s*ER\s+-\s*$/m)
  const pages = records
    .map((record) => {
      const note = record.match(/^\s*N1\s+-\s+(.*)$/m)
      if (note) {
        return unescapeRis(note[1]!.trim())
      }
      const abs = record.match(/^\s*AB\s+-\s+(.*)$/m)
      if (abs) {
        return unescapeRis(abs[1]!.trim())
      }
      const title = record.match(/^\s*TI\s+-\s+(.*)$/m)
      if (title && !/^Trang\s+\d+$/.test(title[1]!.trim())) {
        return unescapeRis(title[1]!.trim())
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp RIS cần các mục TY / ER.')
}

export function pagesFromJats(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const sections = [...trimmed.matchAll(/<sec\b[^>]*>([\s\S]*?)<\/sec>/gi)]
  if (sections.length > 0) {
    const pages = sections
      .map((match) => {
        const body = match[1]!.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, '')
        const paras = [...body.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((para) =>
          unescapeXml(para[1]!.replace(/<[^>]+>/g, '')),
        )
        return paras.join('\n').trim()
      })
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  throw new Error('Tệp JATS cần các mục <sec>.')
}

export function unescapeEnw(value: string): string {
  return value.replace(/\|/g, '\n')
}

export function pagesFromEnw(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = trimmed.split(/(?=^%0\s)/m)
  const pages = records
    .map((record) => {
      const note = record.match(/^%Z\s+(.*)$/m)
      if (note) {
        return unescapeEnw(note[1]!.trim())
      }
      const abs = record.match(/^%X\s+(.*)$/m)
      if (abs) {
        return unescapeEnw(abs[1]!.trim())
      }
      const title = record.match(/^%T\s+(.*)$/m)
      if (title && !/^Trang\s+\d+$/.test(title[1]!.trim())) {
        return unescapeEnw(title[1]!.trim())
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp EndNote cần các mục %0.')
}

export function pagesFromCsljson(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  let data: unknown
  try {
    data = JSON.parse(trimmed)
  } catch {
    throw new Error('Tệp CSL-JSON không hợp lệ.')
  }
  const items = Array.isArray(data) ? data : []
  const pages = items
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return ''
      }
      const rec = item as { note?: unknown; abstract?: unknown; title?: unknown }
      if (typeof rec.note === 'string' && rec.note.trim()) {
        return rec.note
      }
      if (typeof rec.abstract === 'string' && rec.abstract.trim()) {
        return rec.abstract
      }
      if (typeof rec.title === 'string' && rec.title.trim() && !/^Trang\s+\d+$/.test(rec.title.trim())) {
        return rec.title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp CSL-JSON cần các mục note / abstract / title.')
}

export function unescapeNbib(value: string): string {
  return value.replace(/\|/g, '\n')
}

export function pagesFromNbib(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = trimmed.split(/(?=^PMID-)/m)
  const pages = records
    .map((record) => {
      const abs = record.match(/^\s*AB\s+-\s+(.*)$/m)
      if (abs) {
        return unescapeNbib(abs[1]!.trim())
      }
      const nab = record.match(/^\s*NAB\s+-\s+(.*)$/m)
      if (nab) {
        return unescapeNbib(nab[1]!.trim())
      }
      const title = record.match(/^\s*TI\s+-\s+(.*)$/m)
      if (title && !/^Trang\s+\d+$/.test(title[1]!.trim())) {
        return unescapeNbib(title[1]!.trim())
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp NBIB cần các mục PMID / AB.')
}

function yamlField(record: string, name: string): string | null {
  const match = record.match(new RegExp(`^\\s*(?:-\\s+)?${name}:\\s*(.*)$`, 'm'))
  if (!match) {
    return null
  }
  const value = unescapeYamlQuoted(match[1]!.trim())
  return value ? value : null
}

export function pagesFromCslyaml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = trimmed.split(/^(?=- )/m)
  const pages = records
    .map((record) => {
      const note = yamlField(record, 'note')
      if (note) {
        return note
      }
      const abs = yamlField(record, 'abstract')
      if (abs) {
        return abs
      }
      const title = yamlField(record, 'title')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp CSL-YAML cần các mục note / abstract / title.')
}

function xmlTagText(record: string, tag: string): string {
  const match = record.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))
  if (!match) {
    return ''
  }
  return unescapeXml(match[1]!.replace(/<[^>]+>/g, '')).trim()
}

export function pagesFromEnxml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [...trimmed.matchAll(/<record\b[^>]*>([\s\S]*?)<\/record>/gi)]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const notes = xmlTagText(record, 'notes')
      if (notes) {
        return notes
      }
      const abs = xmlTagText(record, 'abstract')
      if (abs) {
        return abs
      }
      const title = xmlTagText(record, 'title')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp EndNote XML cần các mục <record> / <notes>.')
}

export function pagesFromMods(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [...trimmed.matchAll(/<mods\b(?!Collection)[^>]*>([\s\S]*?)<\/mods>/gi)]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const note = xmlTagText(record, 'note')
      if (note) {
        return note
      }
      const abs = xmlTagText(record, 'abstract')
      if (abs) {
        return abs
      }
      const title = xmlTagText(record, 'title')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp MODS cần các mục <mods> / <note>.')
}

export function pagesFromCff(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const refs = trimmed.match(/^references:\s*\n([\s\S]*)$/m)
  const body = refs ? refs[1]! : trimmed
  const records = body.split(/^(?=(?: {0,2})- )/m)
  const pages = records
    .map((record) => {
      const notes = yamlField(record, 'notes')
      if (notes) {
        return notes
      }
      const abs = yamlField(record, 'abstract')
      if (abs) {
        return abs
      }
      const title = yamlField(record, 'title')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp CFF cần các mục notes / abstract / title.')
}

export function pagesFromDatacite(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [...trimmed.matchAll(/<resource\b(?!s)[^>]*>([\s\S]*?)<\/resource>/gi)]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const note = xmlTagText(record, 'description')
      if (note) {
        return note
      }
      const abs = xmlTagText(record, 'abstract')
      if (abs) {
        return abs
      }
      const title = xmlTagText(record, 'title')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp DataCite cần các mục <resource> / <description>.')
}

function marcSubfieldA(record: string, tag: string): string {
  const field = record.match(
    new RegExp(`<datafield\\b[^>]*\\btag=["']?${tag}["']?[^>]*>([\\s\\S]*?)</datafield>`, 'i'),
  )
  if (!field) {
    return ''
  }
  const sub = field[1]!.match(/<subfield\b[^>]*\bcode=["']?a["']?[^>]*>([\s\S]*?)<\/subfield>/i)
  if (!sub) {
    return ''
  }
  return unescapeXml(sub[1]!.replace(/<[^>]+>/g, '')).trim()
}

export function pagesFromMarcxml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [...trimmed.matchAll(/<record\b[^>]*>([\s\S]*?)<\/record>/gi)]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const note = marcSubfieldA(record, '520')
      if (note) {
        return note
      }
      const abs = marcSubfieldA(record, '500') || xmlTagText(record, 'abstract')
      if (abs) {
        return abs
      }
      const title = marcSubfieldA(record, '245') || xmlTagText(record, 'title')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp MARCXML cần các mục <record> / datafield 520.')
}

export function pagesFromDublincore(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [
    ...trimmed.matchAll(/<dc(?:\s[^>]*)?>([\s\S]*?)<\/dc>/gi),
    ...trimmed.matchAll(/<oai_dc:dc\b[^>]*>([\s\S]*?)<\/oai_dc:dc>/gi),
  ]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const note = xmlTagText(record, 'dc:description') || xmlTagText(record, 'description')
      if (note) {
        return note
      }
      const abs = xmlTagText(record, 'dc:abstract') || xmlTagText(record, 'abstract')
      if (abs) {
        return abs
      }
      const title = xmlTagText(record, 'dc:title') || xmlTagText(record, 'title')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp Dublin Core cần các mục <dc> / <dc:description>.')
}

export function pagesFromOnix(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [...trimmed.matchAll(/<Product\b[^>]*>([\s\S]*?)<\/Product>/gi)]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const note = xmlTagText(record, 'Text')
      if (note) {
        return note
      }
      const abs = xmlTagText(record, 'Annotation') || xmlTagText(record, 'abstract')
      if (abs) {
        return abs
      }
      const withoutCollection = record.replace(/<Collection\b[\s\S]*?<\/Collection>/gi, '')
      const title = xmlTagText(withoutCollection, 'TitleText') || xmlTagText(record, 'title')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp ONIX cần các mục <Product> / <Text>.')
}

export function pagesFromUnixref(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [...trimmed.matchAll(/<doi_record\b[^>]*>([\s\S]*?)<\/doi_record>/gi)]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const note = xmlTagText(record, 'description')
      if (note) {
        return note
      }
      const abs = xmlTagText(record, 'abstract')
      if (abs) {
        return abs
      }
      const title = xmlTagText(record, 'title')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp Unixref cần các mục <doi_record> / <description>.')
}

export function pagesFromBibjson(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  let data: unknown
  try {
    data = JSON.parse(trimmed)
  } catch {
    throw new Error('Tệp BibJSON không hợp lệ.')
  }
  const items = Array.isArray(data) ? data : []
  const pages = items
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return ''
      }
      const rec = item as { note?: unknown; abstract?: unknown; title?: unknown }
      if (typeof rec.note === 'string' && rec.note.trim()) {
        return rec.note
      }
      if (typeof rec.abstract === 'string' && rec.abstract.trim()) {
        return rec.abstract
      }
      if (typeof rec.title === 'string' && rec.title.trim() && !/^Trang\s+\d+$/.test(rec.title.trim())) {
        return rec.title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp BibJSON cần các mục note / abstract / title.')
}

export function pagesFromPubmed(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [...trimmed.matchAll(/<PubmedArticle\b[^>]*>([\s\S]*?)<\/PubmedArticle>/gi)]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const note = xmlTagText(record, 'AbstractText') || xmlTagText(record, 'description')
      if (note) {
        return note
      }
      const abs = xmlTagText(record, 'abstract')
      if (abs) {
        return abs
      }
      const title = xmlTagText(record, 'ArticleTitle')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp PubMed cần các mục <PubmedArticle> / <AbstractText>.')
}

export function pagesFromJsonld(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  let data: unknown
  try {
    data = JSON.parse(trimmed)
  } catch {
    throw new Error('Tệp JSON-LD không hợp lệ.')
  }
  const items = Array.isArray(data) ? data : []
  const pages = items
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return ''
      }
      const rec = item as { description?: unknown; abstract?: unknown; name?: unknown; title?: unknown }
      if (typeof rec.description === 'string' && rec.description.trim()) {
        return rec.description
      }
      if (typeof rec.abstract === 'string' && rec.abstract.trim()) {
        return rec.abstract
      }
      if (typeof rec.name === 'string' && rec.name.trim() && !/^Trang\s+\d+$/.test(rec.name.trim())) {
        return rec.name
      }
      if (
        typeof rec.title === 'string' &&
        rec.title.trim() &&
        !/^Trang\s+\d+$/.test(rec.title.trim())
      ) {
        return rec.title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp JSON-LD cần các mục description / abstract / name.')
}

export function pagesFromBibframe(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [...trimmed.matchAll(/<bf:Work\b[^>]*>([\s\S]*?)<\/bf:Work>/gi)]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const note = xmlTagText(record, 'bf:note') || xmlTagText(record, 'note')
      if (note) {
        return note
      }
      const abs = xmlTagText(record, 'abstract') || xmlTagText(record, 'bf:abstract')
      if (abs) {
        return abs
      }
      const title = xmlTagText(record, 'bf:title') || xmlTagText(record, 'title')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp BIBFRAME cần các mục <bf:Work> / <bf:note>.')
}

function firstCrossrefString(value: unknown): string {
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === 'string' && item.trim()) {
        return item.trim()
      }
    }
  }
  return ''
}

function textFromCrossrefWork(item: unknown): string {
  if (!item || typeof item !== 'object') {
    return ''
  }
  const rec = item as { abstract?: unknown; note?: unknown; title?: unknown }
  const abstract = firstCrossrefString(rec.abstract)
  if (abstract) {
    return abstract
  }
  const note = firstCrossrefString(rec.note)
  if (note) {
    return note
  }
  const title = firstCrossrefString(rec.title)
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function crossrefWorkItems(data: unknown): unknown[] | null {
  if (Array.isArray(data)) {
    return data
  }
  if (!data || typeof data !== 'object') {
    return null
  }
  const rec = data as { 'message-type'?: unknown; message?: unknown }
  const isWorkList = rec['message-type'] === 'work-list' || rec['message-type'] === 'work'
  if (rec.message && typeof rec.message === 'object' && !Array.isArray(rec.message)) {
    const items = (rec.message as { items?: unknown }).items
    if (Array.isArray(items) && (isWorkList || items.length > 0)) {
      return items
    }
  }
  return isWorkList ? [] : null
}

export function pagesFromCrossref(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    let data: unknown
    try {
      data = JSON.parse(trimmed)
    } catch {
      throw new Error('Tệp Crossref không hợp lệ.')
    }
    const items = crossrefWorkItems(data)
    if (items) {
      const pages = items.map(textFromCrossrefWork).filter((page) => page.length > 0)
      if (pages.length > 0) {
        return capPages(pages)
      }
      throw new Error('Tệp Crossref cần các mục abstract / note / title.')
    }
    return pagesFromJson(trimmed)
  }
  let data: unknown
  try {
    data = JSON.parse(trimmed)
  } catch {
    throw new Error('Tệp Crossref không hợp lệ.')
  }
  const items = crossrefWorkItems(data)
  const pages = (items ?? []).map(textFromCrossrefWork).filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp Crossref cần các mục abstract / note / title.')
}

export function pagesFromEad(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [...trimmed.matchAll(/<c\b[^>]*>([\s\S]*?)<\/c>/gi)]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const body = xmlTagText(record, 'p') || xmlTagText(record, 'scopecontent')
      if (body) {
        return body
      }
      const abs = xmlTagText(record, 'abstract')
      if (abs) {
        return abs
      }
      const title = xmlTagText(record, 'unittitle') || xmlTagText(record, 'title')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp EAD cần các mục <c> / <scopecontent>.')
}

export function pagesFromMets(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [...trimmed.matchAll(/<dmdSec\b[^>]*>([\s\S]*?)<\/dmdSec>/gi)]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const abs = xmlTagText(record, 'abstract')
      if (abs) {
        return abs
      }
      const note = xmlTagText(record, 'note')
      if (note) {
        return note
      }
      const title = xmlTagText(record, 'title')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp METS cần các mục <dmdSec> / <abstract>.')
}

export function pagesFromPremis(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [...trimmed.matchAll(/<object\b[^>]*>([\s\S]*?)<\/object>/gi)]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const value = xmlTagText(record, 'significantPropertiesValue')
      if (value) {
        return value
      }
      const note = xmlTagText(record, 'note')
      if (note) {
        return note
      }
      const title = xmlTagText(record, 'originalName') || xmlTagText(record, 'title')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp PREMIS cần các mục <object> / <significantPropertiesValue>.')
}

export function pagesFromMix(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [...trimmed.matchAll(/<ImageCaptureMetadata\b[^>]*>([\s\S]*?)<\/ImageCaptureMetadata>/gi)]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const note = xmlTagText(record, 'note')
      if (note) {
        return note
      }
      const producer = xmlTagText(record, 'imageProducer')
      if (producer) {
        return producer
      }
      const title = xmlTagText(record, 'sourceType') || xmlTagText(record, 'title')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp MIX cần các mục <ImageCaptureMetadata> / <note>.')
}

export function pagesFromAlto(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [...trimmed.matchAll(/<Page\b[^>]*>([\s\S]*?)<\/Page>/gi)]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const value = xmlTagText(record, 'String')
      if (value) {
        return value
      }
      const line = xmlTagText(record, 'TextLine')
      if (line) {
        return line
      }
      const title = xmlTagText(record, 'fileName') || xmlTagText(record, 'title')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp ALTO cần các mục <Page> / <String>.')
}

export function pagesFromPage(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [...trimmed.matchAll(/<Page\b[^>]*>([\s\S]*?)<\/Page>/gi)]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const value = xmlTagText(record, 'Unicode')
      if (value) {
        return value
      }
      const equiv = xmlTagText(record, 'TextEquiv')
      if (equiv) {
        return equiv
      }
      const title = xmlTagText(record, 'imageFilename') || xmlTagText(record, 'title')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp PAGE cần các mục <Page> / <Unicode>.')
}

export function pagesFromFoxml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [...trimmed.matchAll(/<datastreamVersion\b[^>]*>([\s\S]*?)<\/datastreamVersion>/gi)]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const value = xmlTagText(record, 'text')
      if (value) {
        return value
      }
      const content = xmlTagText(record, 'xmlContent')
      if (content) {
        return content
      }
      const title = xmlTagText(record, 'title')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp FOXML cần các mục <datastreamVersion> / <text>.')
}

export function pagesFromEdm(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [
    ...trimmed.matchAll(/<(?:edm:)?ProvidedCHO\b[^>]*>([\s\S]*?)<\/(?:edm:)?ProvidedCHO>/gi),
  ]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const value = xmlTagText(record, 'dc:description') || xmlTagText(record, 'description')
      if (value) {
        return value
      }
      const abs = xmlTagText(record, 'dc:abstract') || xmlTagText(record, 'abstract')
      if (abs) {
        return abs
      }
      const title = xmlTagText(record, 'dc:title') || xmlTagText(record, 'title')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp EDM cần các mục <edm:ProvidedCHO> / <dc:description>.')
}

export function pagesFromLido(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [...trimmed.matchAll(/<(?:lido:)?lido\b(?!:)[^>]*>([\s\S]*?)<\/(?:lido:)?lido>/gi)]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const value =
        xmlTagText(record, 'lido:descriptiveNoteValue') || xmlTagText(record, 'descriptiveNoteValue')
      if (value) {
        return value
      }
      const note = xmlTagText(record, 'lido:objectDescriptionSet') || xmlTagText(record, 'objectDescriptionSet')
      if (note) {
        return note
      }
      const title = xmlTagText(record, 'lido:appellationValue') || xmlTagText(record, 'appellationValue')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp LIDO cần các mục <lido> / <descriptiveNoteValue>.')
}

export function pagesFromVra(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [...trimmed.matchAll(/<(?:vra:)?work\b[^>]*>([\s\S]*?)<\/(?:vra:)?work>/gi)]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const value = xmlTagText(record, 'vra:description') || xmlTagText(record, 'description')
      if (value) {
        return value
      }
      const note = xmlTagText(record, 'vra:note') || xmlTagText(record, 'note')
      if (note) {
        return note
      }
      const title = xmlTagText(record, 'vra:title') || xmlTagText(record, 'title')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp VRA cần các mục <work> / <description>.')
}

export function pagesFromCdwa(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [
    ...trimmed.matchAll(/<(?:cdwa(?:lite)?:)?object\b(?!:)[^>]*>([\s\S]*?)<\/(?:cdwa(?:lite)?:)?object>/gi),
  ]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const value =
        xmlTagText(record, 'cdwalite:descriptiveNote') ||
        xmlTagText(record, 'cdwa:descriptiveNote') ||
        xmlTagText(record, 'descriptiveNote')
      if (value) {
        return value
      }
      const note =
        xmlTagText(record, 'cdwalite:indexingNote') ||
        xmlTagText(record, 'cdwa:indexingNote') ||
        xmlTagText(record, 'indexingNote')
      if (note) {
        return note
      }
      const title =
        xmlTagText(record, 'cdwalite:title') || xmlTagText(record, 'cdwa:title') || xmlTagText(record, 'title')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp CDWA Lite cần các mục <object> / <descriptiveNote>.')
}

export function pagesFromSpectrum(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [...trimmed.matchAll(/<(?:spectrum:)?record\b[^>]*>([\s\S]*?)<\/(?:spectrum:)?record>/gi)]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const value =
        xmlTagText(record, 'spectrum:briefDescription') || xmlTagText(record, 'briefDescription')
      if (value) {
        return value
      }
      const note = xmlTagText(record, 'spectrum:description') || xmlTagText(record, 'description')
      if (note) {
        return note
      }
      const title = xmlTagText(record, 'spectrum:objectName') || xmlTagText(record, 'objectName')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp SPECTRUM cần các mục <record> / <briefDescription>.')
}

export function pagesFromDwc(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [
    ...trimmed.matchAll(
      /<(?:dwr:)?SimpleDarwinRecord\b[^>]*>([\s\S]*?)<\/(?:dwr:)?SimpleDarwinRecord>/gi,
    ),
  ]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const value =
        xmlTagText(record, 'dcterms:description') ||
        xmlTagText(record, 'dwc:description') ||
        xmlTagText(record, 'description')
      if (value) {
        return value
      }
      const note =
        xmlTagText(record, 'dwc:occurrenceRemarks') || xmlTagText(record, 'occurrenceRemarks')
      if (note) {
        return note
      }
      const title =
        xmlTagText(record, 'dwc:scientificName') || xmlTagText(record, 'scientificName')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp Darwin Core cần các mục <SimpleDarwinRecord> / <description>.')
}

export function pagesFromObjectid(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [...trimmed.matchAll(/<(?:oid:)?object\b(?!:)[^>]*>([\s\S]*?)<\/(?:oid:)?object>/gi)]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const value =
        xmlTagText(record, 'oid:distinguishingFeatures') ||
        xmlTagText(record, 'distinguishingFeatures')
      if (value) {
        return value
      }
      const note = xmlTagText(record, 'oid:description') || xmlTagText(record, 'description')
      if (note) {
        return note
      }
      const title = xmlTagText(record, 'oid:title') || xmlTagText(record, 'title')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp Object ID cần các mục <object> / <distinguishingFeatures>.')
}

export function pagesFromEac(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [
    ...trimmed.matchAll(/<(?:eac:)?cpfDescription\b[^>]*>([\s\S]*?)<\/(?:eac:)?cpfDescription>/gi),
  ]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const value =
        xmlTagText(record, 'eac:biogHist') ||
        xmlTagText(record, 'biogHist') ||
        xmlTagText(record, 'p')
      if (value) {
        return value
      }
      const note = xmlTagText(record, 'eac:abstract') || xmlTagText(record, 'abstract')
      if (note) {
        return note
      }
      const title = xmlTagText(record, 'eac:part') || xmlTagText(record, 'part')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp EAC-CPF cần các mục <cpfDescription> / <biogHist>.')
}

export function pagesFromCrm(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [
    ...trimmed.matchAll(/<(?:crm:)?E31_Document\b[^>]*>([\s\S]*?)<\/(?:crm:)?E31_Document>/gi),
  ]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const value = xmlTagText(record, 'crm:P3_has_note') || xmlTagText(record, 'P3_has_note')
      if (value) {
        return value
      }
      const note = xmlTagText(record, 'rdfs:comment') || xmlTagText(record, 'comment')
      if (note) {
        return note
      }
      const title = xmlTagText(record, 'crm:P102_has_title') || xmlTagText(record, 'P102_has_title')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp CIDOC CRM cần các mục <E31_Document> / <P3_has_note>.')
}

export function pagesFromRights(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [
    ...trimmed.matchAll(
      /<(?:rts:)?RightsDeclaration(?!MD)\b[^>]*>([\s\S]*?)<\/(?:rts:)?RightsDeclaration>/gi,
    ),
  ]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const value =
        xmlTagText(record, 'rts:ConstraintDescription') ||
        xmlTagText(record, 'ConstraintDescription')
      if (value) {
        return value
      }
      const note =
        xmlTagText(record, 'rts:OtherConstraintDescription') ||
        xmlTagText(record, 'OtherConstraintDescription')
      if (note) {
        return note
      }
      const title =
        xmlTagText(record, 'rts:RightsHolderName') || xmlTagText(record, 'RightsHolderName')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp METS Rights cần các mục <RightsDeclaration> / <ConstraintDescription>.')
}

export function pagesFromTextmd(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [...trimmed.matchAll(/<(?:tm:)?encoding\b[^>]*>([\s\S]*?)<\/(?:tm:)?encoding>/gi)]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const value = xmlTagText(record, 'tm:textNote') || xmlTagText(record, 'textNote')
      if (value) {
        return value
      }
      const note = xmlTagText(record, 'tm:processingNote') || xmlTagText(record, 'processingNote')
      if (note) {
        return note
      }
      const title =
        xmlTagText(record, 'tm:encoding_platform') || xmlTagText(record, 'encoding_platform')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp TextMD cần các mục <encoding> / <textNote>.')
}

export function pagesFromPbcore(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [
    ...trimmed.matchAll(
      /<(?:pbcore:)?pbcoreDescriptionDocument\b[^>]*>([\s\S]*?)<\/(?:pbcore:)?pbcoreDescriptionDocument>/gi,
    ),
  ]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const value =
        xmlTagText(record, 'pbcore:pbcoreDescription') || xmlTagText(record, 'pbcoreDescription')
      if (value) {
        return value
      }
      const note =
        xmlTagText(record, 'pbcore:pbcoreAnnotation') || xmlTagText(record, 'pbcoreAnnotation')
      if (note) {
        return note
      }
      const title = xmlTagText(record, 'pbcore:pbcoreTitle') || xmlTagText(record, 'pbcoreTitle')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp PBCore cần các mục <pbcoreDescriptionDocument> / <pbcoreDescription>.')
}

export function pagesFromEbucore(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [
    ...trimmed.matchAll(/<(?:ebucore:)?coreMetadata\b[^>]*>([\s\S]*?)<\/(?:ebucore:)?coreMetadata>/gi),
  ]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const value =
        xmlTagText(record, 'ebucore:description') || xmlTagText(record, 'description')
      if (value) {
        return value
      }
      const note =
        xmlTagText(record, 'ebucore:alternative') || xmlTagText(record, 'alternative')
      if (note) {
        return note
      }
      const title = xmlTagText(record, 'ebucore:title') || xmlTagText(record, 'title')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp EBUCore cần các mục <coreMetadata> / <description>.')
}

export function pagesFromMpeg7(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [
    ...trimmed.matchAll(
      /<(?:mpeg7:)?MultimediaContent\b[^>]*>([\s\S]*?)<\/(?:mpeg7:)?MultimediaContent>/gi,
    ),
  ]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const value =
        xmlTagText(record, 'mpeg7:FreeTextAnnotation') || xmlTagText(record, 'FreeTextAnnotation')
      if (value) {
        return value
      }
      const note = xmlTagText(record, 'mpeg7:Abstract') || xmlTagText(record, 'Abstract')
      if (note) {
        return note
      }
      const title = xmlTagText(record, 'mpeg7:Title') || xmlTagText(record, 'Title')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp MPEG-7 cần các mục <MultimediaContent> / <FreeTextAnnotation>.')
}

export function pagesFromAes57(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [
    ...trimmed.matchAll(/<(?:aes:)?audioObject\b[^>]*>([\s\S]*?)<\/(?:aes:)?audioObject>/gi),
  ]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const value = xmlTagText(record, 'aes:description') || xmlTagText(record, 'description')
      if (value) {
        return value
      }
      const note = xmlTagText(record, 'aes:note') || xmlTagText(record, 'note')
      if (note) {
        return note
      }
      const title = xmlTagText(record, 'aes:title') || xmlTagText(record, 'title')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp AES57 cần các mục <audioObject> / <description>.')
}

export function pagesFromLom(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [...trimmed.matchAll(/<(?:lom:)?lom\b[^>]*>([\s\S]*?)<\/(?:lom:)?lom>/gi)]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const value = xmlTagText(record, 'lom:description') || xmlTagText(record, 'description')
      if (value) {
        return value
      }
      const note = xmlTagText(record, 'lom:keyword') || xmlTagText(record, 'keyword')
      if (note) {
        return note
      }
      const title = xmlTagText(record, 'lom:title') || xmlTagText(record, 'title')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp IEEE LOM cần các mục <lom> / <description>.')
}

export function pagesFromImscp(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [...trimmed.matchAll(/<(?:imscp:)?item\b[^>]*>([\s\S]*?)<\/(?:imscp:)?item>/gi)]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const value = xmlTagText(record, 'imscp:description') || xmlTagText(record, 'description')
      if (value) {
        return value
      }
      const note = xmlTagText(record, 'imscp:note') || xmlTagText(record, 'note')
      if (note) {
        return note
      }
      const title = xmlTagText(record, 'imscp:title') || xmlTagText(record, 'title')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp IMS CP cần các mục <item> / <description>.')
}

export function pagesFromNewsml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [...trimmed.matchAll(/<(?:newsml:)?newsItem\b[^>]*>([\s\S]*?)<\/(?:newsml:)?newsItem>/gi)]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const value = xmlTagText(record, 'newsml:DataContent') || xmlTagText(record, 'DataContent')
      if (value) {
        return value
      }
      const note = xmlTagText(record, 'newsml:slugline') || xmlTagText(record, 'slugline')
      if (note) {
        return note
      }
      const title = xmlTagText(record, 'newsml:HeadLine') || xmlTagText(record, 'HeadLine')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp NewsML cần các mục <newsItem> / <DataContent>.')
}

export function pagesFromNitf(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [...trimmed.matchAll(/<(?:nitf:)?nitf\b[^>]*>([\s\S]*?)<\/(?:nitf:)?nitf>/gi)]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const value = xmlTagText(record, 'nitf:p') || xmlTagText(record, 'p')
      if (value) {
        return value
      }
      const note = xmlTagText(record, 'nitf:abstract') || xmlTagText(record, 'abstract')
      if (note) {
        return note
      }
      const title = xmlTagText(record, 'nitf:hl1') || xmlTagText(record, 'hl1')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      const heading = xmlTagText(record, 'nitf:title') || xmlTagText(record, 'title')
      if (heading && !/^Trang\s+\d+$/.test(heading)) {
        return heading
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp NITF cần các mục <nitf> / <p>.')
}

export function pagesFromSportsml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [
    ...trimmed.matchAll(/<(?:sportsml:)?sportsEvent\b[^>]*>([\s\S]*?)<\/(?:sportsml:)?sportsEvent>/gi),
  ]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const value = xmlTagText(record, 'sportsml:narrative') || xmlTagText(record, 'narrative')
      if (value) {
        return value
      }
      const note = xmlTagText(record, 'sportsml:slugline') || xmlTagText(record, 'slugline')
      if (note) {
        return note
      }
      const title = xmlTagText(record, 'sportsml:name') || xmlTagText(record, 'name')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp SportsML cần các mục <sportsEvent> / <narrative>.')
}

export function pagesFromEventsml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [
    ...trimmed.matchAll(/<(?:eventsml:)?eventsItem\b[^>]*>([\s\S]*?)<\/(?:eventsml:)?eventsItem>/gi),
  ]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const value = xmlTagText(record, 'eventsml:description') || xmlTagText(record, 'description')
      if (value) {
        return value
      }
      const note = xmlTagText(record, 'eventsml:note') || xmlTagText(record, 'note')
      if (note) {
        return note
      }
      const title = xmlTagText(record, 'eventsml:name') || xmlTagText(record, 'name')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp EventsML cần các mục <eventsItem> / <description>.')
}

export function pagesFromNewsmlg2(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [
    ...trimmed.matchAll(/<(?:nar:)?packageItem\b[^>]*>([\s\S]*?)<\/(?:nar:)?packageItem>/gi),
  ]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const value = xmlTagText(record, 'nar:body') || xmlTagText(record, 'body')
      if (value) {
        return value
      }
      const note = xmlTagText(record, 'nar:description') || xmlTagText(record, 'description')
      if (note) {
        return note
      }
      const title = xmlTagText(record, 'nar:headline') || xmlTagText(record, 'headline')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp NewsML-G2 cần các mục <packageItem> / <body>.')
}

export function pagesFromRnews(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [
    ...trimmed.matchAll(/<(?:rnews:)?NewsArticle\b[^>]*>([\s\S]*?)<\/(?:rnews:)?NewsArticle>/gi),
  ]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const value = xmlTagText(record, 'rnews:articleBody') || xmlTagText(record, 'articleBody')
      if (value) {
        return value
      }
      const note = xmlTagText(record, 'rnews:description') || xmlTagText(record, 'description')
      if (note) {
        return note
      }
      const title = xmlTagText(record, 'rnews:headline') || xmlTagText(record, 'headline')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp rNews cần các mục <NewsArticle> / <articleBody>.')
}

export function pagesFromPrism(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [
    ...trimmed.matchAll(/<(?:prism:)?article\b[^>]*>([\s\S]*?)<\/(?:prism:)?article>/gi),
  ]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const value = xmlTagText(record, 'prism:body') || xmlTagText(record, 'body')
      if (value) {
        return value
      }
      const note = xmlTagText(record, 'prism:description') || xmlTagText(record, 'description')
      if (note) {
        return note
      }
      const title = xmlTagText(record, 'prism:title') || xmlTagText(record, 'title')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp PRISM cần các mục <article> / <body>.')
}

export function pagesFromHnews(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [...trimmed.matchAll(/<(?:hnews:)?entry\b[^>]*>([\s\S]*?)<\/(?:hnews:)?entry>/gi)]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const value = xmlTagText(record, 'hnews:content') || xmlTagText(record, 'content')
      if (value) {
        return value
      }
      const note = xmlTagText(record, 'hnews:description') || xmlTagText(record, 'description')
      if (note) {
        return note
      }
      const title = xmlTagText(record, 'hnews:headline') || xmlTagText(record, 'headline')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp hNews cần các mục <entry> / <content>.')
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
