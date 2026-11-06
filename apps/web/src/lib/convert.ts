import JSZip from 'jszip'

export type ExportFormat =
  | 'txt'
  | 'html'
  | 'md'
  | 'rtf'
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
  | 'iptc'
  | 'anpa'
  | 'ninjs'
  | 'jsonfeed'
  | 'as2'
  | 'geojson'
  | 'kml'
  | 'gpx'
  | 'osm'
  | 'georss'
  | 'wkt'
  | 'gml'
  | 'topojson'
  | 'svg'
  | 'dxf'
  | 'mapml'
  | 'cityjson'
  | 'indoorgml'
  | 'citygml'
  | 'landxml'
  | 'ifcxml'
  | 'gbxml'
  | 'bcfxml'
  | 'cobiexml'
  | 'landinfra'
  | 'infragml'
  | 'opendrive'
  | 'railml'
  | 'transxml'
  | 'datex2'
  | 'netex'
  | 'siri'
  | 'transxchange'
  | 'naptan'
  | 'gtfs'
  | 'ifopt'
  | 'ojp'
  | 'trias'
  | 'vdv453'
  | 'vdv454'
  | 'vdv452'
  | 'vdv462'
  | 'vdv455'
  | 'vdv731'
  | 'vdv301'
  | 'vdv423'
  | 'xlsx'
  | 'docx'
  | 'doc'
  | 'odt'
  | 'ods'
  | 'pptx'
  | 'odp'
  | 'fb2'
  | 'epub'
  | 'mobi'
  | 'png'
  | 'jpg'
  | 'webp'
  | 'cbz'

export type ImageExportFormat = 'png' | 'jpg' | 'webp'

export function isImageFormat(format: ExportFormat): format is ImageExportFormat {
  return format === 'png' || format === 'jpg' || format === 'webp'
}

export function isComicFormat(format: ExportFormat): format is 'cbz' {
  return format === 'cbz'
}

export function comicPageName(index: number, ext: 'jpg' | 'png' = 'jpg'): string {
  const page = Number.isInteger(index) && index >= 0 ? index + 1 : 1
  const width = Math.max(3, String(page).length)
  return `${String(page).padStart(width, '0')}.${ext}`
}

export async function toCbz(
  images: readonly { name?: string; bytes: Uint8Array }[],
): Promise<Blob> {
  if (images.length === 0) {
    throw new Error('Không có ảnh để tạo CBZ.')
  }
  const parts = images.map((image, index) => ({
    name:
      image.name && /\.(png|jpe?g)$/i.test(image.name) ? image.name.replace(/^.*[/\\]/, '') : comicPageName(index),
    bytes: image.bytes,
  }))
  const zip = new JSZip()
  for (const part of parts) {
    zip.file(part.name, part.bytes)
  }
  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.comicbook+zip',
  })
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

export function escapeTsv(value: string): string {
  if (/["\t\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`
  }
  return value
}

export function toTsv(pages: string[]): string {
  return ['page\ttext', ...pages.map((text, index) => `${index + 1}\t${escapeTsv(text)}`)].join('\n')
}

export function escapeToml(value: string): string {
  return `"${value
    .replaceAll('\\', '\\\\')
    .replaceAll('"', '\\"')
    .replaceAll('\r', '')
    .replaceAll('\n', '\\n')
    .replaceAll('\t', '\\t')}"`
}

export function toToml(title: string, pages: string[]): string {
  const heading = escapeToml(title.trim() || 'Tài liệu')
  const list = pages.length > 0 ? pages : ['']
  const blocks = list.map((text, index) => {
    return `[[pages]]\npage = ${index + 1}\ntext = ${escapeToml(text)}`
  })
  return `title = ${heading}\n\n${blocks.join('\n\n')}\n`
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

export function escapeYaml(value: string): string {
  return `"${value
    .replaceAll('\\', '\\\\')
    .replaceAll('"', '\\"')
    .replaceAll('\r', '')
    .replaceAll('\n', '\\n')}"`
}

export function toYaml(title: string, pages: string[]): string {
  const lines = [`title: ${escapeYaml(title.trim() || 'Tài liệu')}`, 'pages:']
  for (let index = 0; index < pages.length; index += 1) {
    lines.push(`  - page: ${index + 1}`)
    lines.push(`    text: ${escapeYaml(pages[index] ?? '')}`)
  }
  if (pages.length === 0) {
    lines.push('  - page: 1')
    lines.push(`    text: ${escapeYaml('')}`)
  }
  return `${lines.join('\n')}\n`
}

export function toXml(title: string, pages: string[]): string {
  const heading = escapeXml(title.trim() || 'Tài liệu')
  const body = (pages.length > 0 ? pages : ['']).map(
    (text, index) => `  <page n="${index + 1}">${escapeXml(text)}</page>`,
  )
  return `<?xml version="1.0" encoding="UTF-8"?>
<document>
  <title>${heading}</title>
${body.join('\n')}
</document>
`
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

export function toOrg(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const body = pages
    .map((text, index) => {
      const content = text.trim() || '(không có chữ)'
      return `** Trang ${index + 1}\n\n${content}`
    })
    .join('\n\n')
  return `* ${heading}\n\n${body}\n`
}

export function escapeLatex(value: string): string {
  let out = ''
  for (const char of value) {
    switch (char) {
      case '\\':
        out += '\\textbackslash{}'
        break
      case '{':
        out += '\\{'
        break
      case '}':
        out += '\\}'
        break
      case '$':
        out += '\\$'
        break
      case '&':
        out += '\\&'
        break
      case '#':
        out += '\\#'
        break
      case '^':
        out += '\\textasciicircum{}'
        break
      case '_':
        out += '\\_'
        break
      case '~':
        out += '\\textasciitilde{}'
        break
      case '%':
        out += '\\%'
        break
      default:
        out += char
    }
  }
  return out
}

export function toJsonl(pages: string[]): string {
  const list = pages.length > 0 ? pages : ['']
  return `${list.map((text, index) => JSON.stringify({ page: index + 1, text })).join('\n')}\n`
}

export function escapeIni(value: string): string {
  return `"${value
    .replaceAll('\\', '\\\\')
    .replaceAll('"', '\\"')
    .replaceAll('\r', '')
    .replaceAll('\n', '\\n')
    .replaceAll('\t', '\\t')}"`
}

export function toIni(title: string, pages: string[]): string {
  const heading = escapeIni(title.trim() || 'Tài liệu')
  const list = pages.length > 0 ? pages : ['']
  const blocks = list.map((text, index) => `[page.${index + 1}]\ntext = ${escapeIni(text)}`)
  return `[document]\ntitle = ${heading}\n\n${blocks.join('\n\n')}\n`
}

export function toAdoc(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const body = pages
    .map((text, index) => {
      const content = text.trim() || '(không có chữ)'
      return `== Trang ${index + 1}\n\n${content}`
    })
    .join('\n\n')
  return `= ${heading}\n\n${body}\n`
}

export function toRst(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const titleRule = '='.repeat(Math.max(3, heading.length))
  const body = pages
    .map((text, index) => {
      const label = `Trang ${index + 1}`
      const content = text.trim() || '(không có chữ)'
      return `${label}\n${'-'.repeat(label.length)}\n\n${content}`
    })
    .join('\n\n')
  return `${heading}\n${titleRule}\n\n${body}\n`
}

export function toTextile(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const body = pages
    .map((text, index) => {
      const content = text.trim() || '(không có chữ)'
      return `h2. Trang ${index + 1}\n\n${content}`
    })
    .join('\n\n')
  return `h1. ${heading}\n\n${body}\n`
}

export function toWiki(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const body = pages
    .map((text, index) => {
      const content = text.trim() || '(không có chữ)'
      return `== Trang ${index + 1} ==\n\n${content}`
    })
    .join('\n\n')
  return `= ${heading} =\n\n${body}\n`
}

export function toDokuwiki(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const body = pages
    .map((text, index) => {
      const content = text.trim() || '(không có chữ)'
      return `=== Trang ${index + 1} ===\n\n${content}`
    })
    .join('\n\n')
  return `====== ${heading} ======\n\n${body}\n`
}

export function toDocbook(title: string, pages: string[]): string {
  const heading = escapeHtml(title.trim() || 'Tài liệu')
  const body = pages
    .map((text, index) => {
      const paras = (text.trim() || '(không có chữ)')
        .split(/\n+/)
        .map((line) => `    <para>${escapeHtml(line)}</para>`)
        .join('\n')
      return `  <section>\n    <title>Trang ${index + 1}</title>\n${paras}\n  </section>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<article xmlns="http://docbook.org/ns/docbook" version="5.0" xml:lang="vi">
  <title>${heading}</title>
${body}
</article>
`
}

export const ATOM_UPDATED = '1970-01-01T00:00:00Z'

export function toOpml(title: string, pages: string[]): string {
  const heading = escapeHtml(title.trim() || 'Tài liệu')
  const body = pages
    .map((text, index) => {
      const note = escapeHtml(text.trim() || '(không có chữ)').replaceAll('\n', '&#10;')
      return `    <outline text="Trang ${index + 1}" _note="${note}"/>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>${heading}</title>
  </head>
  <body>
${body}
  </body>
</opml>
`
}

export function toAtom(title: string, pages: string[]): string {
  const heading = escapeHtml(title.trim() || 'Tài liệu')
  const entries = pages
    .map((text, index) => {
      const content = escapeHtml(text.trim() || '(không có chữ)')
      return `  <entry>
    <title>Trang ${index + 1}</title>
    <id>tag:smart-read.local,1970:page:${index + 1}</id>
    <updated>${ATOM_UPDATED}</updated>
    <content type="text">${content}</content>
  </entry>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${heading}</title>
  <id>tag:smart-read.local,1970:document</id>
  <updated>${ATOM_UPDATED}</updated>
${entries}
</feed>
`
}

export function escapeTypst(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')
}

export function toTypst(title: string, pages: string[]): string {
  const heading = escapeTypst(title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const body = pages
    .map((text, index) => {
      const content = text.trim() || '(không có chữ)'
      return `== Trang ${index + 1}\n\n${content}`
    })
    .join('\n\n')
  return `#set document(title: "${heading}")\n\n${body}\n`
}

export function toGemtext(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const body = pages
    .map((text, index) => {
      const content = text.trim() || '(không có chữ)'
      return `## Trang ${index + 1}\n\n${content}`
    })
    .join('\n\n')
  return `# ${heading}\n\n${body}\n`
}

export function toPod(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const body = pages
    .map((text, index) => {
      const content = text.trim() || '(không có chữ)'
      return `=head2 Trang ${index + 1}\n\n${content}`
    })
    .join('\n\n')
  return `=head1 ${heading}\n\n${body}\n\n=cut\n`
}

export function toBbcode(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const body = pages
    .map((text, index) => {
      const content = text.trim() || '(không có chữ)'
      return `[h2]Trang ${index + 1}[/h2]\n\n${content}`
    })
    .join('\n\n')
  return `[h1]${heading}[/h1]\n\n${body}\n`
}

export function toFountain(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const body = pages
    .map((text, index) => {
      const content = text.trim() || '(không có chữ)'
      return `# Trang ${index + 1}\n\n${content}`
    })
    .join('\n\n')
  return `Title: ${heading}\n\n${body}\n`
}

export function toTid(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const body = pages
    .map((text, index) => {
      const content = text.trim() || '(không có chữ)'
      return `!! Trang ${index + 1}\n\n${content}`
    })
    .join('\n\n')
  return `! ${heading}\n\n${body}\n`
}

export function toTexinfo(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const body = pages
    .map((text, index) => {
      const content = text.trim() || '(không có chữ)'
      return `@section Trang ${index + 1}\n\n${content}`
    })
    .join('\n\n')
  return `\\input texinfo\n@settitle ${heading}\n\n${body}\n\n@bye\n`
}

export function toRoff(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const body = pages
    .map((text, index) => {
      const content = text.trim() || '(không có chữ)'
      return `.SH Trang ${index + 1}\n${content}`
    })
    .join('\n\n')
  return `.TH ${heading}\n\n${body}\n`
}

export function toIpynb(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const cells = [
    {
      cell_type: 'markdown',
      metadata: {},
      source: [`# ${heading}\n`],
    },
    ...pages.map((text, index) => ({
      cell_type: 'markdown',
      metadata: {},
      source: [`## Trang ${index + 1}\n`, '\n', `${text.trim() || '(không có chữ)'}\n`],
    })),
  ]
  return `${JSON.stringify(
    {
      nbformat: 4,
      nbformat_minor: 5,
      metadata: {
        kernelspec: { display_name: 'Python 3', language: 'python', name: 'python3' },
      },
      cells,
    },
    null,
    2,
  )}\n`
}

export function escapeBibtex(value: string): string {
  return value.replace(/([{}\\])/g, '\\$1')
}

export function toBibtex(title: string, pages: string[]): string {
  const heading = escapeBibtex((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const body = pages
    .map((text, index) => {
      const note = escapeBibtex(text.trim() || '(không có chữ)')
      return `@misc{page${index + 1},\n  title = {Trang ${index + 1}},\n  note = {${note}}\n}`
    })
    .join('\n\n')
  return `@comment{${heading}}\n\n${body}\n`
}

export const CUE_SECONDS = 4

function padTimePart(value: number): string {
  return String(value).padStart(2, '0')
}

export function formatSrtTime(totalSeconds: number): string {
  const clamped = Math.max(0, Math.trunc(totalSeconds))
  const hours = Math.floor(clamped / 3600)
  const minutes = Math.floor((clamped % 3600) / 60)
  const seconds = clamped % 60
  return `${padTimePart(hours)}:${padTimePart(minutes)}:${padTimePart(seconds)},000`
}

export function formatVttTime(totalSeconds: number): string {
  return formatSrtTime(totalSeconds).replace(',', '.')
}

export function toSrt(pages: string[]): string {
  return `${pages
    .map((text, index) => {
      const start = index * CUE_SECONDS
      const end = (index + 1) * CUE_SECONDS
      const content = text.trim() || '(không có chữ)'
      return `${index + 1}\n${formatSrtTime(start)} --> ${formatSrtTime(end)}\n${content}`
    })
    .join('\n\n')}\n`
}

export function toVtt(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const cues = pages
    .map((text, index) => {
      const start = index * CUE_SECONDS
      const end = (index + 1) * CUE_SECONDS
      const content = text.trim() || '(không có chữ)'
      return `${formatVttTime(start)} --> ${formatVttTime(end)}\n${content}`
    })
    .join('\n\n')
  return `WEBVTT\n\nNOTE ${heading}\n\n${cues}\n`
}

export function formatLrcTime(totalSeconds: number): string {
  const clamped = Math.max(0, Math.trunc(totalSeconds))
  const minutes = Math.floor(clamped / 60)
  const seconds = clamped % 60
  return `${padTimePart(minutes)}:${padTimePart(seconds)}.00`
}

export function toLrc(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const lines = pages.map((text, index) => {
    const content = (text.trim() || '(không có chữ)').replace(/\r?\n/g, ' ')
    return `[${formatLrcTime(index * CUE_SECONDS)}]${content}`
  })
  return `[ti:${heading}]\n${lines.join('\n')}\n`
}

export function escapeIcs(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
}

export function unescapeIcs(value: string): string {
  return value
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
}

export function formatIcsDate(totalSeconds: number): string {
  const clamped = Math.max(0, Math.trunc(totalSeconds))
  const hours = Math.floor(clamped / 3600)
  const minutes = Math.floor((clamped % 3600) / 60)
  const seconds = clamped % 60
  return `19700101T${padTimePart(hours)}${padTimePart(minutes)}${padTimePart(seconds)}Z`
}

export function toIcs(title: string, pages: string[]): string {
  const heading = escapeIcs((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const events = pages
    .map((text, index) => {
      const body = text.trim() || '(không có chữ)'
      const summary = escapeIcs(body.split(/\r?\n/, 1)[0] || `Trang ${index + 1}`)
      const start = index * CUE_SECONDS
      const end = (index + 1) * CUE_SECONDS
      return [
        'BEGIN:VEVENT',
        `UID:page-${index + 1}@smart-read`,
        'DTSTAMP:19700101T000000Z',
        `DTSTART:${formatIcsDate(start)}`,
        `DTEND:${formatIcsDate(end)}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${escapeIcs(body)}`,
        'END:VEVENT',
      ].join('\n')
    })
    .join('\n')
  return `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Smart-Read//EN\nCALSCALE:GREGORIAN\nX-WR-CALNAME:${heading}\n${events}\nEND:VCALENDAR\n`
}

export function escapeCue(value: string): string {
  return value.replace(/\r?\n/g, ' ').replace(/"/g, "'")
}

export function formatCueIndex(totalSeconds: number): string {
  const clamped = Math.max(0, Math.trunc(totalSeconds))
  const minutes = Math.floor(clamped / 60)
  const seconds = clamped % 60
  return `${padTimePart(minutes)}:${padTimePart(seconds)}:00`
}

export function toCue(title: string, pages: string[]): string {
  const heading = escapeCue(title.trim() || 'Tài liệu')
  const tracks = pages
    .map((text, index) => {
      const body = escapeCue(text.trim() || '(không có chữ)')
      const number = String(index + 1).padStart(2, '0')
      return [
        `  TRACK ${number} AUDIO`,
        `    TITLE "${body}"`,
        `    INDEX 01 ${formatCueIndex(index * CUE_SECONDS)}`,
      ].join('\n')
    })
    .join('\n')
  return `TITLE "${heading}"\nFILE "document.bin" WAVE\n${tracks}\n`
}

export function formatAssTime(totalSeconds: number): string {
  const clamped = Math.max(0, Math.trunc(totalSeconds))
  const hours = Math.floor(clamped / 3600)
  const minutes = Math.floor((clamped % 3600) / 60)
  const seconds = clamped % 60
  return `${hours}:${padTimePart(minutes)}:${padTimePart(seconds)}.00`
}

export function escapeAss(value: string): string {
  return value.replace(/\r?\n/g, '\\N').replace(/\{/g, '\\{').replace(/\}/g, '\\}')
}

export function toAss(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const events = pages
    .map((text, index) => {
      const start = formatAssTime(index * CUE_SECONDS)
      const end = formatAssTime((index + 1) * CUE_SECONDS)
      const body = escapeAss(text.trim() || '(không có chữ)')
      return `Dialogue: 0,${start},${end},Default,,0,0,0,,${body}`
    })
    .join('\n')
  return `[Script Info]
Title: ${heading}
ScriptType: v4.00+

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,0,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${events}
`
}

export function formatTtmlTime(totalSeconds: number): string {
  const clamped = Math.max(0, Math.trunc(totalSeconds))
  const hours = Math.floor(clamped / 3600)
  const minutes = Math.floor((clamped % 3600) / 60)
  const seconds = clamped % 60
  return `${padTimePart(hours)}:${padTimePart(minutes)}:${padTimePart(seconds)}.000`
}

export function toTtml(title: string, pages: string[]): string {
  const heading = escapeHtml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const cues = pages
    .map((text, index) => {
      const start = formatTtmlTime(index * CUE_SECONDS)
      const end = formatTtmlTime((index + 1) * CUE_SECONDS)
      const body = escapeHtml(text.trim() || '(không có chữ)').replace(/\r?\n/g, '<br/>')
      return `    <p begin="${start}" end="${end}">${body}</p>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="utf-8"?>
<tt xmlns="http://www.w3.org/ns/ttml">
  <head>
    <metadata>
      <title>${heading}</title>
    </metadata>
  </head>
  <body>
    <div>
${cues}
    </div>
  </body>
</tt>
`
}

export function formatSbvTime(totalSeconds: number): string {
  const clamped = Math.max(0, Math.trunc(totalSeconds))
  const hours = Math.floor(clamped / 3600)
  const minutes = Math.floor((clamped % 3600) / 60)
  const seconds = clamped % 60
  return `${hours}:${padTimePart(minutes)}:${padTimePart(seconds)}.000`
}

export function toSbv(pages: string[]): string {
  return `${pages
    .map((text, index) => {
      const start = formatSbvTime(index * CUE_SECONDS)
      const end = formatSbvTime((index + 1) * CUE_SECONDS)
      const content = text.trim() || '(không có chữ)'
      return `${start},${end}\n${content}`
    })
    .join('\n\n')}\n`
}

export function formatSamiTime(totalSeconds: number): string {
  return String(Math.max(0, Math.trunc(totalSeconds)) * 1000)
}

export function toSami(title: string, pages: string[]): string {
  const heading = escapeHtml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const cues = pages
    .map((text, index) => {
      const start = formatSamiTime(index * CUE_SECONDS)
      const body = escapeHtml(text.trim() || '(không có chữ)').replace(/\r?\n/g, '<br/>')
      return `<SYNC Start=${start}><P Class=Default>${body}`
    })
    .join('\n')
  return `<SAMI>
<HEAD>
<TITLE>${heading}</TITLE>
<STYLE TYPE="text/css"><!--
P { font-family: sans-serif; }
--></STYLE>
</HEAD>
<BODY>
${cues}
</BODY>
</SAMI>
`
}

export function formatSubTime(totalSeconds: number): string {
  const clamped = Math.max(0, Math.trunc(totalSeconds))
  const hours = Math.floor(clamped / 3600)
  const minutes = Math.floor((clamped % 3600) / 60)
  const seconds = clamped % 60
  return `${padTimePart(hours)}:${padTimePart(minutes)}:${padTimePart(seconds)}.00`
}

export function toSub(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const cues = pages
    .map((text, index) => {
      const start = formatSubTime(index * CUE_SECONDS)
      const end = formatSubTime((index + 1) * CUE_SECONDS)
      const content = text.trim() || '(không có chữ)'
      return `${start},${end}\n${content}`
    })
    .join('\n\n')
  return `[INFORMATION]\n[TITLE]${heading}\n[END INFORMATION]\n[SUBTITLE]\n${cues}\n`
}

export function formatStlTime(totalSeconds: number): string {
  const clamped = Math.max(0, Math.trunc(totalSeconds))
  const hours = Math.floor(clamped / 3600)
  const minutes = Math.floor((clamped % 3600) / 60)
  const seconds = clamped % 60
  return `${padTimePart(hours)}:${padTimePart(minutes)}:${padTimePart(seconds)}:00`
}

export function toStl(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const cues = pages
    .map((text, index) => {
      const start = formatStlTime(index * CUE_SECONDS)
      const end = formatStlTime((index + 1) * CUE_SECONDS)
      const content = (text.trim() || '(không có chữ)').replace(/\r?\n/g, '|')
      return `${start} , ${end} , ${content}`
    })
    .join('\n')
  return `$FontName           = Arial
$FontSize           = 24
$Title              = ${heading}

${cues}
`
}

export function formatSccTime(totalSeconds: number): string {
  return formatStlTime(totalSeconds)
}

export function toScc(pages: string[]): string {
  const cues = pages
    .map((text, index) => {
      const start = formatSccTime(index * CUE_SECONDS)
      const content = (text.trim() || '(không có chữ)').replace(/\r?\n/g, '|')
      return `${start}\t${content}`
    })
    .join('\n')
  return `Scenarist_SCC V1.0\n\n${cues}\n`
}

export function formatUsfTime(totalSeconds: number): string {
  return formatTtmlTime(totalSeconds)
}

export function toUsf(title: string, pages: string[]): string {
  const heading = escapeHtml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const cues = pages
    .map((text, index) => {
      const start = formatUsfTime(index * CUE_SECONDS)
      const end = formatUsfTime((index + 1) * CUE_SECONDS)
      const body = escapeHtml(text.trim() || '(không có chữ)').replace(/\r?\n/g, '<br/>')
      return `    <subtitle start="${start}" stop="${end}">
      <text>${body}</text>
    </subtitle>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<USFSubtitles version="1.0">
  <metadata>
    <title>${heading}</title>
  </metadata>
  <subtitles>
${cues}
  </subtitles>
</USFSubtitles>
`
}

export function formatRtTime(totalSeconds: number): string {
  return `${Math.max(0, Math.trunc(totalSeconds))}.0`
}

export function toRt(title: string, pages: string[]): string {
  const heading = escapeHtml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const duration = formatRtTime(pages.length * CUE_SECONDS)
  const cues = pages
    .map((text, index) => {
      const start = formatRtTime(index * CUE_SECONDS)
      const end = formatRtTime((index + 1) * CUE_SECONDS)
      const body = escapeHtml(text.trim() || '(không có chữ)').replace(/\r?\n/g, '<br/>')
      return `<time begin="${start}" end="${end}"/>${body}`
    })
    .join('\n')
  return `<window type="generic" duration="${duration}">
<!-- ${heading} -->
${cues}
</window>
`
}

export function formatMplTime(totalSeconds: number): string {
  return String(Math.max(0, Math.trunc(totalSeconds)) * 10)
}

export function toMpl(pages: string[]): string {
  const cues = pages
    .map((text, index) => {
      const start = formatMplTime(index * CUE_SECONDS)
      const end = formatMplTime((index + 1) * CUE_SECONDS)
      const content = (text.trim() || '(không có chữ)').replace(/\r?\n/g, '|')
      return `[${start}][${end}]${content}`
    })
    .join('\n')
  return `${cues}\n`
}

export function toDjvu(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tai lieu').replace(/\r?\n/g, ' ')
  const bodies = pages
    .map((text, index) => `@page ${index + 1}\n${text.trim() || '(không có chữ)'}`)
    .join('\n\n')
  return `DJVU-TEXT 1.0\ntitle: ${heading}\n\n${bodies}\n`
}

export function escapePs(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

export function toPs(title: string, pages: string[]): string {
  const heading = escapePs((title.trim() || 'Tai lieu').replace(/\r?\n/g, ' '))
  const bodies = pages
    .map((text, index) => {
      const content = escapePs((text.trim() || '(không có chữ)').replace(/\r?\n/g, '|'))
      return `%%Page: ${index + 1} ${index + 1}\n(${content}) =\nshowpage`
    })
    .join('\n')
  return `%!PS-Adobe-3.0
%%Title: ${heading}
%%Pages: ${pages.length}
%%EndComments
${bodies}
%%Trailer
%%EOF
`
}

export function toTei(title: string, pages: string[]): string {
  const heading = escapeHtml(title.trim() || 'Tài liệu')
  const body = pages
    .map((text, index) => {
      const paras = (text.trim() || '(không có chữ)')
        .split(/\n+/)
        .map((line) => `        <p>${escapeHtml(line)}</p>`)
        .join('\n')
      return `      <div type="page" n="${index + 1}">
        <head>Trang ${index + 1}</head>
${paras}
      </div>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0" xml:lang="vi">
  <teiHeader>
    <fileDesc>
      <titleStmt>
        <title>${heading}</title>
      </titleStmt>
      <publicationStmt>
        <p>Smart-Read</p>
      </publicationStmt>
      <sourceDesc>
        <p>Exported from Smart-Read</p>
      </sourceDesc>
    </fileDesc>
  </teiHeader>
  <text>
    <body>
${body}
    </body>
  </text>
</TEI>
`
}

export function escapeRis(value: string): string {
  return value.replace(/\r?\n/g, '|')
}

export function toRis(title: string, pages: string[]): string {
  const heading = escapeRis((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const body = pages
    .map((text, index) => {
      const note = escapeRis(text.trim() || '(không có chữ)')
      return `TY  - GEN\nT2  - ${heading}\nTI  - Trang ${index + 1}\nN1  - ${note}\nER  - `
    })
    .join('\n\n')
  return `${body}\n`
}

export function toJats(title: string, pages: string[]): string {
  const heading = escapeHtml(title.trim() || 'Tài liệu')
  const body = pages
    .map((text, index) => {
      const paras = (text.trim() || '(không có chữ)')
        .split(/\n+/)
        .map((line) => `      <p>${escapeHtml(line)}</p>`)
        .join('\n')
      return `    <sec id="page-${index + 1}">
      <title>Trang ${index + 1}</title>
${paras}
    </sec>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<article xmlns:xlink="http://www.w3.org/1999/xlink" article-type="other" dtd-version="1.3" xml:lang="vi">
  <front>
    <article-meta>
      <title-group>
        <article-title>${heading}</article-title>
      </title-group>
    </article-meta>
  </front>
  <body>
${body}
  </body>
</article>
`
}

export function escapeEnw(value: string): string {
  return value.replace(/\r?\n/g, '|')
}

export function toEnw(title: string, pages: string[]): string {
  const heading = escapeEnw((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  return `${pages
    .map((text, index) => {
      const note = escapeEnw(text.trim() || '(không có chữ)')
      return `%0 Generic\n%B ${heading}\n%T Trang ${index + 1}\n%Z ${note}\n`
    })
    .join('\n')}`
}

export function toCsljson(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const items = pages.map((text, index) => ({
    id: `page-${index + 1}`,
    type: 'document',
    title: `Trang ${index + 1}`,
    'container-title': heading,
    note: text.trim() || '(không có chữ)',
  }))
  return `${JSON.stringify(items, null, 2)}\n`
}

export function escapeNbib(value: string): string {
  return value.replace(/\r?\n/g, '|')
}

export function toNbib(title: string, pages: string[]): string {
  const heading = escapeNbib((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  return `${pages
    .map((text, index) => {
      const note = escapeNbib(text.trim() || '(không có chữ)')
      return `PMID- ${index + 1}\nTI  - Trang ${index + 1}\nJT  - ${heading}\nAB  - ${note}\n`
    })
    .join('\n')}`
}

export function toCslyaml(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  return `${pages
    .map((text, index) => {
      const note = text.trim() || '(không có chữ)'
      return `- id: page-${index + 1}
  type: document
  title: ${escapeYaml(`Trang ${index + 1}`)}
  container-title: ${escapeYaml(heading)}
  note: ${escapeYaml(note)}`
    })
    .join('\n')}\n`
}

export function toEnxml(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `    <record>
      <ref-type name="Generic">13</ref-type>
      <titles>
        <title>Trang ${index + 1}</title>
        <secondary-title>${heading}</secondary-title>
      </titles>
      <notes>${note}</notes>
    </record>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<xml>
  <records>
${records}
  </records>
</xml>
`
}

export function toMods(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <mods>
    <titleInfo>
      <title>Trang ${index + 1}</title>
    </titleInfo>
    <relatedItem type="host">
      <titleInfo>
        <title>${heading}</title>
      </titleInfo>
    </relatedItem>
    <note>${note}</note>
  </mods>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<modsCollection xmlns="http://www.loc.gov/mods/v3">
${records}
</modsCollection>
`
}

export function toCff(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const refs = pages
    .map((text, index) => {
      const note = text.trim() || '(không có chữ)'
      return `  - type: generic
    title: ${escapeYaml(`Trang ${index + 1}`)}
    notes: ${escapeYaml(note)}`
    })
    .join('\n')
  return `cff-version: 1.2.0
message: Smart-Read page export
title: ${escapeYaml(heading)}
references:
${refs}
`
}

export function toDatacite(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <resource>
    <identifier identifierType="Other">page-${index + 1}</identifier>
    <creators>
      <creator>
        <creatorName nameType="Organizational">Smart-Read</creatorName>
      </creator>
    </creators>
    <titles>
      <title>Trang ${index + 1}</title>
    </titles>
    <publisher>${heading}</publisher>
    <publicationYear>2026</publicationYear>
    <resourceType resourceTypeGeneral="Text">Page</resourceType>
    <descriptions>
      <description descriptionType="Other">${note}</description>
    </descriptions>
  </resource>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<resources xmlns="http://datacite.org/schema/kernel-4">
${records}
</resources>
`
}

export function toMarcxml(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <record>
    <leader>00000nam a2200000 a 4500</leader>
    <datafield tag="245" ind1="0" ind2="0">
      <subfield code="a">Trang ${index + 1}</subfield>
    </datafield>
    <datafield tag="490" ind1="0" ind2=" ">
      <subfield code="a">${heading}</subfield>
    </datafield>
    <datafield tag="520" ind1="8" ind2=" ">
      <subfield code="a">${note}</subfield>
    </datafield>
  </record>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<collection xmlns="http://www.loc.gov/MARC21/slim">
${records}
</collection>
`
}

export function toDublincore(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <dc>
    <dc:publisher>${heading}</dc:publisher>
    <dc:title>Trang ${index + 1}</dc:title>
    <dc:description>${note}</dc:description>
  </dc>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<dublinCore xmlns:dc="http://purl.org/dc/elements/1.1/">
${records}
</dublinCore>
`
}

export function toOnix(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <Product>
    <DescriptiveDetail>
      <Collection>
        <TitleDetail>
          <TitleElement>
            <TitleText>${heading}</TitleText>
          </TitleElement>
        </TitleDetail>
      </Collection>
      <TitleDetail>
        <TitleElement>
          <TitleText>Trang ${index + 1}</TitleText>
        </TitleElement>
      </TitleDetail>
    </DescriptiveDetail>
    <CollateralDetail>
      <TextContent>
        <Text>${note}</Text>
      </TextContent>
    </CollateralDetail>
  </Product>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<ONIXMessage release="3.0">
${records}
</ONIXMessage>
`
}

export function toUnixref(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <doi_record>
    <crossref>
      <journal>
        <journal_metadata>
          <full_title>${heading}</full_title>
        </journal_metadata>
        <journal_article>
          <titles>
            <title>Trang ${index + 1}</title>
          </titles>
          <description>${note}</description>
        </journal_article>
      </journal>
    </crossref>
  </doi_record>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<doi_records>
${records}
</doi_records>
`
}

export function toBibjson(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const items = pages.map((text, index) => ({
    id: `page-${index + 1}`,
    type: 'article',
    title: `Trang ${index + 1}`,
    journal: { name: heading },
    note: text.trim() || '(không có chữ)',
  }))
  return `${JSON.stringify(items, null, 2)}\n`
}

export function toPubmed(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <PubmedArticle>
    <MedlineCitation>
      <Article>
        <Journal>
          <Title>${heading}</Title>
        </Journal>
        <ArticleTitle>Trang ${index + 1}</ArticleTitle>
        <Abstract>
          <AbstractText>${note}</AbstractText>
        </Abstract>
      </Article>
    </MedlineCitation>
  </PubmedArticle>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<PubmedArticleSet>
${records}
</PubmedArticleSet>
`
}

export function toJsonld(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const items = pages.map((text, index) => ({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: `Trang ${index + 1}`,
    publisher: { name: heading },
    description: text.trim() || '(không có chữ)',
  }))
  return `${JSON.stringify(items, null, 2)}\n`
}

export function toBibframe(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <bf:Work>
    <bf:mainTitle>${heading}</bf:mainTitle>
    <bf:title>Trang ${index + 1}</bf:title>
    <bf:note>${note}</bf:note>
  </bf:Work>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:bf="http://id.loc.gov/ontologies/bibframe/">
${records}
</rdf:RDF>
`
}

export function toCrossref(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const items = pages.map((text, index) => ({
    DOI: `10.0000/page-${index + 1}`,
    type: 'journal-article',
    title: [`Trang ${index + 1}`],
    'container-title': [heading],
    abstract: text.trim() || '(không có chữ)',
  }))
  return `${JSON.stringify(
    {
      status: 'ok',
      'message-type': 'work-list',
      'message-version': '1.0.0',
      message: { items },
    },
    null,
    2,
  )}\n`
}

export function toEad(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `      <c>
        <did>
          <unittitle>Trang ${index + 1}</unittitle>
        </did>
        <scopecontent>
          <p>${note}</p>
        </scopecontent>
      </c>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<ead>
  <eadheader>
    <filedesc>
      <titlestmt>
        <titleproper>${heading}</titleproper>
      </titlestmt>
    </filedesc>
  </eadheader>
  <archdesc level="collection">
    <did>
      <unittitle>${heading}</unittitle>
    </did>
    <dsc>
${records}
    </dsc>
  </archdesc>
</ead>
`
}

export function toMets(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <dmdSec ID="dmd${index + 1}">
    <mdWrap MDTYPE="DC" MIMETYPE="text/xml">
      <xmlData>
        <title>Trang ${index + 1}</title>
        <publisher>${heading}</publisher>
        <abstract>${note}</abstract>
      </xmlData>
    </mdWrap>
  </dmdSec>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<mets xmlns="http://www.loc.gov/METS/">
  <metsHdr>
    <agent ROLE="CREATOR" TYPE="ORGANIZATION">
      <name>${heading}</name>
    </agent>
  </metsHdr>
${records}
</mets>
`
}

export function toPremis(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <object>
    <objectIdentifier>
      <objectIdentifierType>local</objectIdentifierType>
      <objectIdentifierValue>page-${index + 1}</objectIdentifierValue>
    </objectIdentifier>
    <originalName>Trang ${index + 1}</originalName>
    <significantProperties>
      <significantPropertiesType>note</significantPropertiesType>
      <significantPropertiesValue>${note}</significantPropertiesValue>
    </significantProperties>
  </object>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<premis xmlns="http://www.loc.gov/premis/v3">
  <agent>
    <agentName>${heading}</agentName>
  </agent>
${records}
</premis>
`
}

export function toMix(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <ImageCaptureMetadata>
    <sourceType>Trang ${index + 1}</sourceType>
    <imageProducer>${heading}</imageProducer>
    <note>${note}</note>
  </ImageCaptureMetadata>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<mix xmlns="http://www.loc.gov/mix/v20">
  <BasicDigitalObjectInformation>
    <ObjectIdentifier>
      <objectIdentifierType>local</objectIdentifierType>
      <objectIdentifierValue>${heading}</objectIdentifierValue>
    </ObjectIdentifier>
  </BasicDigitalObjectInformation>
${records}
</mix>
`
}

export function toAlto(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `    <Page ID="P${index + 1}" PHYSICAL_IMG_NR="${index + 1}">
      <PrintSpace>
        <TextBlock>
          <TextLine>
            <String>${note}</String>
          </TextLine>
        </TextBlock>
      </PrintSpace>
    </Page>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<alto xmlns="http://www.loc.gov/standards/alto/ns-v4#">
  <Description>
    <sourceImageInformation>
      <fileName>${heading}</fileName>
    </sourceImageInformation>
  </Description>
  <Layout>
${records}
  </Layout>
</alto>
`
}

export function toPage(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <Page imageFilename="Trang ${index + 1}">
    <TextRegion>
      <TextEquiv>
        <Unicode>${note}</Unicode>
      </TextEquiv>
    </TextRegion>
  </Page>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<PcGts xmlns="http://schema.primaresearch.org/PAGE/gts/pagecontent/2019-07-15">
  <Metadata>
    <Creator>${heading}</Creator>
  </Metadata>
${records}
</PcGts>
`
}

export function toFoxml(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <datastream ID="DS${index + 1}" CONTROL_GROUP="X">
    <datastreamVersion ID="DS${index + 1}.0" LABEL="Trang ${index + 1}">
      <xmlContent>
        <text>${note}</text>
      </xmlContent>
    </datastreamVersion>
  </datastream>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<digitalObject xmlns="info:fedora/fedora-system:def/foxml#" PID="smart-read:1">
  <objectProperties>
    <property NAME="info:fedora/fedora-system:def/model#label" VALUE="${heading}"/>
  </objectProperties>
${records}
</digitalObject>
`
}

export function toEdm(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <edm:ProvidedCHO rdf:about="#page-${index + 1}">
    <dc:publisher>${heading}</dc:publisher>
    <dc:title>Trang ${index + 1}</dc:title>
    <dc:description>${note}</dc:description>
  </edm:ProvidedCHO>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:edm="http://www.europeana.eu/schemas/edm/" xmlns:dc="http://purl.org/dc/elements/1.1/">
${records}
</rdf:RDF>
`
}

export function toLido(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <lido>
    <descriptiveMetadata>
      <objectIdentificationWrap>
        <titleWrap>
          <titleSet>
            <appellationValue>Trang ${index + 1}</appellationValue>
          </titleSet>
        </titleWrap>
        <repositoryWrap>
          <repositorySet>
            <repositoryName>
              <legalBodyName>
                <appellationValue>${heading}</appellationValue>
              </legalBodyName>
            </repositoryName>
          </repositorySet>
        </repositoryWrap>
        <objectDescriptionWrap>
          <objectDescriptionSet>
            <descriptiveNoteValue>${note}</descriptiveNoteValue>
          </objectDescriptionSet>
        </objectDescriptionWrap>
      </objectIdentificationWrap>
    </descriptiveMetadata>
  </lido>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<lidoWrap xmlns="http://www.lido-schema.org">
${records}
</lidoWrap>
`
}

export function toVra(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <work>
    <agent>
      <name>${heading}</name>
    </agent>
    <title>Trang ${index + 1}</title>
    <description>${note}</description>
  </work>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<vra xmlns="http://www.vraweb.org/vracore4.htm">
${records}
</vra>
`
}

export function toCdwa(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <object>
    <displayCreator>${heading}</displayCreator>
    <title>Trang ${index + 1}</title>
    <descriptiveNote>${note}</descriptiveNote>
  </object>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<cdwalite xmlns="http://www.getty.edu/CDWA/CDWALite">
${records}
</cdwalite>
`
}

export function toSpectrum(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <record>
    <objectName>${heading}</objectName>
    <objectNumber>Trang ${index + 1}</objectNumber>
    <briefDescription>${note}</briefDescription>
  </record>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<spectrum>
${records}
</spectrum>
`
}

export function toDwc(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <dwr:SimpleDarwinRecord>
    <dwc:institutionName>${heading}</dwc:institutionName>
    <dwc:catalogNumber>Trang ${index + 1}</dwc:catalogNumber>
    <dcterms:description>${note}</dcterms:description>
  </dwr:SimpleDarwinRecord>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<dwr:DarwinRecordSet xmlns:dwr="http://rs.tdwg.org/dwc/xsd/simpledarwincore/" xmlns:dwc="http://rs.tdwg.org/dwc/terms/" xmlns:dcterms="http://purl.org/dc/terms/">
${records}
</dwr:DarwinRecordSet>
`
}

export function toObjectid(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <object>
    <title>${heading}</title>
    <objectNumber>Trang ${index + 1}</objectNumber>
    <distinguishingFeatures>${note}</distinguishingFeatures>
  </object>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<objectid>
${records}
</objectid>
`
}

export function toEac(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <cpfDescription>
    <identity>
      <entityType>person</entityType>
      <nameEntry>
        <part>Trang ${index + 1}</part>
      </nameEntry>
    </identity>
    <description>
      <existDates>
        <date>${heading}</date>
      </existDates>
      <biogHist>
        <p>${note}</p>
      </biogHist>
    </description>
  </cpfDescription>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<eac-cpf xmlns="urn:isbn:1-931666-33-4">
${records}
</eac-cpf>
`
}

export function toCrm(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <crm:E31_Document rdf:about="#page-${index + 1}">
    <crm:P102_has_title>${heading}</crm:P102_has_title>
    <crm:P1_is_identified_by>Trang ${index + 1}</crm:P1_is_identified_by>
    <crm:P3_has_note>${note}</crm:P3_has_note>
  </crm:E31_Document>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:crm="http://www.cidoc-crm.org/cidoc-crm/" xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">
${records}
</rdf:RDF>
`
}

export function toRights(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <RightsDeclaration RIGHTSCATEGORY="COPYRIGHTED">
    <RightsHolder>
      <RightsHolderName>${heading}</RightsHolderName>
    </RightsHolder>
    <Context CONTEXTCLASS="GENERAL PUBLIC">
      <UserName>Trang ${index + 1}</UserName>
      <Constraints CONSTRAINTTYPE="OTHER">
        <ConstraintDescription>${note}</ConstraintDescription>
      </Constraints>
    </Context>
  </RightsDeclaration>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<RightsDeclarationMD xmlns="http://cosimo.stanford.edu/sdr/metsrights/">
${records}
</RightsDeclarationMD>
`
}

export function toTextmd(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <encoding>
    <encoding_platform>${heading}</encoding_platform>
    <encoding_software>Trang ${index + 1}</encoding_software>
    <textNote>${note}</textNote>
  </encoding>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<textMD xmlns="info:lc/xmlns/textMD-v3">
${records}
</textMD>
`
}

export function toPbcore(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <pbcoreDescriptionDocument>
    <pbcoreTitle>${heading}</pbcoreTitle>
    <pbcoreIdentifier source="Smart-Read">Trang ${index + 1}</pbcoreIdentifier>
    <pbcoreDescription>${note}</pbcoreDescription>
  </pbcoreDescriptionDocument>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<pbcoreCollection xmlns="http://www.pbcore.org/PBCore/PBCoreNamespace.html">
${records}
</pbcoreCollection>
`
}

export function toEbucore(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <coreMetadata>
    <title>
      <title>${heading}</title>
    </title>
    <identifier>Trang ${index + 1}</identifier>
    <description>
      <description>${note}</description>
    </description>
  </coreMetadata>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<ebuCoreMain xmlns="urn:ebu:metadata-schema:ebuCore_2014" xmlns:ebucore="urn:ebu:metadata-schema:ebuCore_2014">
${records}
</ebuCoreMain>
`
}

export function toMpeg7(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <Description>
    <MultimediaContent>
      <CreationInformation>
        <Creation>
          <Title>${heading}</Title>
        </Creation>
      </CreationInformation>
      <MediaIdentification>
        <EntityIdentifier>Trang ${index + 1}</EntityIdentifier>
      </MediaIdentification>
      <TextAnnotation>
        <FreeTextAnnotation>${note}</FreeTextAnnotation>
      </TextAnnotation>
    </MultimediaContent>
  </Description>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<Mpeg7 xmlns="urn:mpeg:mpeg7:schema:2001">
${records}
</Mpeg7>
`
}

export function toAes57(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <audioObject>
    <title>${heading}</title>
    <identifier>Trang ${index + 1}</identifier>
    <description>${note}</description>
  </audioObject>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<aes xmlns="http://www.aes.org/aes57/2011">
${records}
</aes>
`
}

export function toLom(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <lom>
    <general>
      <title>
        <string>${heading}</string>
      </title>
      <identifier>
        <catalog>page</catalog>
        <entry>Trang ${index + 1}</entry>
      </identifier>
      <description>
        <string>${note}</string>
      </description>
    </general>
  </lom>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<lomCollection xmlns="http://ltsc.ieee.org/xsd/LOM">
${records}
</lomCollection>
`
}

export function toImscp(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `      <item identifier="ITEM-${index + 1}">
        <title>Trang ${index + 1}</title>
        <description>${note}</description>
      </item>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns="http://www.imsglobal.org/xsd/imscp_v1p1" identifier="MANIFEST-1">
  <organizations default="ORG-1">
    <organization identifier="ORG-1">
      <title>${heading}</title>
${records}
    </organization>
  </organizations>
</manifest>
`
}

export function toNewsml(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <newsItem>
    <identification>
      <newsIdentifier>
        <NewsItemId>Trang ${index + 1}</NewsItemId>
      </newsIdentifier>
    </identification>
    <newsComponent>
      <newsLines>
        <HeadLine>${heading}</HeadLine>
      </newsLines>
      <contentItem>
        <DataContent>${note}</DataContent>
      </contentItem>
    </newsComponent>
  </newsItem>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<newsML xmlns="http://iptc.org/std/NewsML/1.2/">
${records}
</newsML>
`
}

export function toNitf(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <nitf>
    <head>
      <title>${heading}</title>
    </head>
    <body>
      <body.head>
        <hedline>
          <hl1>Trang ${index + 1}</hl1>
        </hedline>
      </body.head>
      <body.content>
        <p>${note}</p>
      </body.content>
    </body>
  </nitf>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<nitfCollection>
${records}
</nitfCollection>
`
}

export function toSportsml(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <sportsEvent>
    <eventMetadata>
      <eventId>Trang ${index + 1}</eventId>
      <name>${heading}</name>
    </eventMetadata>
    <narrative>${note}</narrative>
  </sportsEvent>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<sportsML xmlns="http://iptc.org/std/SportsML/2.2/">
${records}
</sportsML>
`
}

export function toEventsml(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <eventsItem>
    <eventDetails>
      <eventId>Trang ${index + 1}</eventId>
      <name>${heading}</name>
    </eventDetails>
    <description>${note}</description>
  </eventsItem>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<eventsML xmlns="http://iptc.org/std/EventsML-G2/2.0/">
${records}
</eventsML>
`
}

export function toNewsmlg2(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <packageItem>
    <itemMeta>
      <itemId>Trang ${index + 1}</itemId>
      <headline>${heading}</headline>
    </itemMeta>
    <inlineXML>
      <body>${note}</body>
    </inlineXML>
  </packageItem>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<newsMessage xmlns="http://iptc.org/std/nar/2006-10-01/">
${records}
</newsMessage>
`
}

export function toRnews(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <NewsArticle>
    <headline>${heading}</headline>
    <identifier>Trang ${index + 1}</identifier>
    <articleBody>${note}</articleBody>
  </NewsArticle>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<rNews xmlns="http://iptc.org/std/rNews/0.1/">
${records}
</rNews>
`
}

export function toPrism(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <article>
    <title>${heading}</title>
    <identifier>Trang ${index + 1}</identifier>
    <body>${note}</body>
  </article>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<prism xmlns="http://prismstandard.org/namespaces/basic/2.0/">
${records}
</prism>
`
}

export function toHnews(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <entry>
    <headline>${heading}</headline>
    <identifier>Trang ${index + 1}</identifier>
    <content>${note}</content>
  </entry>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<hnews>
${records}
</hnews>
`
}

export function toIptc(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <iptcItem>
    <headline>${heading}</headline>
    <identifier>Trang ${index + 1}</identifier>
    <body>${note}</body>
  </iptcItem>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<iptc>
${records}
</iptc>
`
}

export function toAnpa(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <anpaStory>
    <headline>${heading}</headline>
    <identifier>Trang ${index + 1}</identifier>
    <text>${note}</text>
  </anpaStory>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<anpa>
${records}
</anpa>
`
}

export function toNinjs(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const items = pages.map((text, index) => ({
    uri: `page-${index + 1}`,
    type: 'text',
    headline: heading,
    profile: `Trang ${index + 1}`,
    body_text: text.trim() || '(không có chữ)',
  }))
  return `${JSON.stringify({ ninjs: '1.4', headline: heading, items }, null, 2)}\n`
}

export function toJsonfeed(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const items = pages.map((text, index) => ({
    id: `page-${index + 1}`,
    title: heading,
    url: `page-${index + 1}`,
    content_text: text.trim() || '(không có chữ)',
  }))
  return `${JSON.stringify(
    {
      version: 'https://jsonfeed.org/version/1.1',
      title: heading,
      items,
    },
    null,
    2,
  )}\n`
}

export function toAs2(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const orderedItems = pages.map((text, index) => ({
    type: 'Note',
    id: `page-${index + 1}`,
    name: `Trang ${index + 1}`,
    content: text.trim() || '(không có chữ)',
  }))
  return `${JSON.stringify(
    {
      '@context': 'https://www.w3.org/ns/activitystreams',
      type: 'OrderedCollection',
      name: heading,
      totalItems: orderedItems.length,
      orderedItems,
    },
    null,
    2,
  )}\n`
}

export function toGeojson(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const features = pages.map((text, index) => ({
    type: 'Feature',
    id: `page-${index + 1}`,
    properties: {
      title: heading,
      name: `Trang ${index + 1}`,
      description: text.trim() || '(không có chữ)',
    },
    geometry: null,
  }))
  return `${JSON.stringify(
    {
      type: 'FeatureCollection',
      name: heading,
      features,
    },
    null,
    2,
  )}\n`
}

export function toKml(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const marks = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `    <Placemark>
      <name>Trang ${index + 1}</name>
      <description>${note}</description>
    </Placemark>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${heading}</name>
${marks}
  </Document>
</kml>
`
}

export function toGpx(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const points = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <wpt lat="0" lon="0">
    <name>Trang ${index + 1}</name>
    <desc>${note}</desc>
  </wpt>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Smart-Read" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${heading}</name>
  </metadata>
${points}
</gpx>
`
}

export function toOsm(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const nodes = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <node id="${index + 1}" lat="0" lon="0" visible="true">
    <tag k="name" v="Trang ${index + 1}"/>
    <tag k="text" v="${note}"/>
  </node>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<osm version="0.6" generator="Smart-Read">
  <note>${heading}</note>
${nodes}
</osm>
`
}

export function toGeorss(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const entries = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <entry>
    <title>Trang ${index + 1}</title>
    <summary>${note}</summary>
    <georss:point>0 0</georss:point>
  </entry>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:georss="http://www.georss.org/georss">
  <title>${heading}</title>
${entries}
</feed>
`
}

export function toWkt(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const records = pages
    .map((text) => {
      const note = text.trim() || '(không có chữ)'
      return `POINT (0 0)\n${note}`
    })
    .join('\n')
  return `# ${heading}\n${records}\n`
}

export function toGml(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const members = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <gml:featureMember>
    <gml:Point gml:id="p${index + 1}">
      <gml:name>Trang ${index + 1}</gml:name>
      <gml:description>${note}</gml:description>
      <gml:pos>0 0</gml:pos>
    </gml:Point>
  </gml:featureMember>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<gml:FeatureCollection xmlns:gml="http://www.opengis.net/gml/3.2">
  <gml:name>${heading}</gml:name>
${members}
</gml:FeatureCollection>
`
}

export function toTopojson(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const geometries = pages.map((text, index) => ({
    type: 'Point',
    coordinates: [0, 0],
    properties: {
      name: `Trang ${index + 1}`,
      text: text.trim() || '(không có chữ)',
    },
  }))
  return `${JSON.stringify(
    {
      type: 'Topology',
      name: heading,
      arcs: [],
      objects: {
        pages: {
          type: 'GeometryCollection',
          geometries,
        },
      },
    },
    null,
    2,
  )}\n`
}

export function toSvg(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const groups = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <g id="page-${index + 1}">
    <title>Trang ${index + 1}</title>
    <desc>${note}</desc>
    <text y="${index + 1}em">${note}</text>
  </g>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg">
  <title>${heading}</title>
${groups}
</svg>
`
}

export function escapeDxf(value: string): string {
  return value.replace(/\r?\n/g, '|').replace(/^\s+|\s+$/g, '') || '(không có chữ)'
}

export function toDxf(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const entities = pages
    .map((text, index) => {
      const note = escapeDxf(text.trim() || '(không có chữ)')
      return `0
TEXT
8
0
10
0.0
20
${index}
30
0.0
1
${note}`
    })
    .join('\n')
  return `999
${heading}
0
SECTION
2
HEADER
9
$ACADVER
1
AC1009
0
ENDSEC
0
SECTION
2
ENTITIES
${entities}
0
ENDSEC
0
EOF
`
}

export function toMapml(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const features = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `    <feature id="page-${index + 1}">
      <properties>
        <name>Trang ${index + 1}</name>
        <description>${note}</description>
      </properties>
      <geometry>
        <point>
          <coordinates>0 0</coordinates>
        </point>
      </geometry>
    </feature>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<mapml xmlns="http://www.w3.org/1999/xhtml/mapml">
  <head>
    <title>${heading}</title>
  </head>
  <body>
${features}
  </body>
</mapml>
`
}

export function toCityjson(title: string, pages: string[]): string {
  const heading = (title.trim() || 'Tài liệu').replace(/\r?\n/g, ' ')
  const cityObjects: Record<string, unknown> = {}
  pages.forEach((text, index) => {
    cityObjects[`page-${index + 1}`] = {
      type: 'Building',
      attributes: {
        name: `Trang ${index + 1}`,
        description: text.trim() || '(không có chữ)',
      },
    }
  })
  return `${JSON.stringify(
    {
      type: 'CityJSON',
      version: '2.0',
      metadata: { title: heading },
      CityObjects: cityObjects,
      vertices: [[0, 0, 0]],
    },
    null,
    2,
  )}\n`
}

export function toIndoorgml(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const members = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `      <cellSpaceMember>
        <CellSpace gml:id="page-${index + 1}">
          <gml:name>Trang ${index + 1}</gml:name>
          <gml:description>${note}</gml:description>
        </CellSpace>
      </cellSpaceMember>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<IndoorFeatures xmlns="http://www.opengis.net/indoorgml/1.0/core" xmlns:gml="http://www.opengis.net/gml/3.2">
  <gml:name>${heading}</gml:name>
  <primalSpaceFeatures>
    <PrimalSpaceFeatures>
${members}
    </PrimalSpaceFeatures>
  </primalSpaceFeatures>
</IndoorFeatures>
`
}

export function toCitygml(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const members = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <cityObjectMember>
    <bldg:Building gml:id="page-${index + 1}">
      <gml:name>Trang ${index + 1}</gml:name>
      <gml:description>${note}</gml:description>
    </bldg:Building>
  </cityObjectMember>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<CityModel xmlns="http://www.opengis.net/citygml/2.0" xmlns:bldg="http://www.opengis.net/citygml/building/2.0" xmlns:gml="http://www.opengis.net/gml">
  <gml:name>${heading}</gml:name>
${members}
</CityModel>
`
}

export function toLandxml(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const parcels = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `    <Parcel name="Trang ${index + 1}">
      <Desc>${note}</Desc>
    </Parcel>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<LandXML xmlns="http://www.landxml.org/schema/LandXML-1.2">
  <Project name="${heading}"/>
  <Parcels>
${parcels}
  </Parcels>
</LandXML>
`
}

export function toIfcxml(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const buildings = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <IfcBuilding id="page-${index + 1}" Name="Trang ${index + 1}">
    <Description>${note}</Description>
  </IfcBuilding>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<ifcXML xmlns="https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/XML/SCHEMA">
  <header>
    <name>${heading}</name>
  </header>
${buildings}
</ifcXML>
`
}

export function toGbxml(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const storeys = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `      <BuildingStorey id="page-${index + 1}">
        <Name>Trang ${index + 1}</Name>
        <Description>${note}</Description>
      </BuildingStorey>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<gbXML xmlns="http://www.gbxml.org/schema" temperatureUnit="C" lengthUnit="Meters" areaUnit="SquareMeters" volumeUnit="CubicMeters" useSIUnitsForResults="true" version="6.01">
  <Campus id="campus-1">
    <Name>${heading}</Name>
    <Building id="bldg-1">
${storeys}
    </Building>
  </Campus>
</gbXML>
`
}

export function toBcfxml(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const topics = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <Topic Guid="page-${index + 1}" TopicType="Issue" TopicStatus="Open">
    <Title>Trang ${index + 1}</Title>
    <Description>${note}</Description>
  </Topic>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<Markup xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Header>
    <File isExternal="false">
      <Filename>${heading}</Filename>
    </File>
  </Header>
${topics}
</Markup>
`
}

export function toCobiexml(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const components = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <Component>
    <Name>Trang ${index + 1}</Name>
    <Description>${note}</Description>
  </Component>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<COBie xmlns="http://docs.buildingsmartalliance.org/nbims03/cobie">
  <Name>${heading}</Name>
${components}
</COBie>
`
}

export function toLandinfra(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const features = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <Feature>
    <name>Trang ${index + 1}</name>
    <description>${note}</description>
  </Feature>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<LandInfra xmlns="http://www.opengis.net/landinfra/2.0">
  <name>${heading}</name>
${features}
</LandInfra>
`
}

export function toInfragml(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const members = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <featureMember>
    <name>Trang ${index + 1}</name>
    <description>${note}</description>
  </featureMember>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<InfraGML xmlns="http://www.opengis.net/infragml/1.0">
  <name>${heading}</name>
${members}
</InfraGML>
`
}

export function toOpendrive(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const roads = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <road name="Trang ${index + 1}" id="${index + 1}" length="1" junction="-1">
    <description>${note}</description>
  </road>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<OpenDRIVE>
  <header revMajor="1" revMinor="4" name="${heading}"/>
${roads}
</OpenDRIVE>
`
}

export function toRailml(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const lines = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <line id="line-${index + 1}">
    <name>Trang ${index + 1}</name>
    <description>${note}</description>
  </line>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<railml xmlns="https://www.railml.org/schemas/3.2">
  <metadata>
    <name>${heading}</name>
  </metadata>
${lines}
</railml>
`
}

export function toTransxml(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const projects = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <Project>
    <name>Trang ${index + 1}</name>
    <description>${note}</description>
  </Project>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<TransXML xmlns="http://www.transxml.org/schema/1.0">
  <name>${heading}</name>
${projects}
</TransXML>
`
}

export function toDatex2(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const records = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <situationRecord id="record-${index + 1}">
    <name>Trang ${index + 1}</name>
    <description>${note}</description>
  </situationRecord>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<d2LogicalModel xmlns="http://datex2.eu/schema/2/2_0" modelBaseVersion="2">
  <name>${heading}</name>
${records}
</d2LogicalModel>
`
}

export function toNetex(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const stops = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <StopPlace id="stop-${index + 1}">
    <name>Trang ${index + 1}</name>
    <description>${note}</description>
  </StopPlace>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<PublicationDelivery xmlns="http://www.netex.org.uk/netex" version="1.1">
  <name>${heading}</name>
${stops}
</PublicationDelivery>
`
}

export function toSiri(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const points = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <StopPoint id="stop-${index + 1}">
    <name>Trang ${index + 1}</name>
    <description>${note}</description>
  </StopPoint>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<Siri xmlns="http://www.siri.org.uk/siri" version="2.1">
  <name>${heading}</name>
${points}
</Siri>
`
}

export function toTransxchange(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const points = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <StopPoint id="stop-${index + 1}">
    <name>Trang ${index + 1}</name>
    <description>${note}</description>
  </StopPoint>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<TransXChange xmlns="http://www.transxchange.org.uk/" version="2.4">
  <name>${heading}</name>
${points}
</TransXChange>
`
}

export function toNaptan(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const points = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <StopPoint id="stop-${index + 1}">
    <name>Trang ${index + 1}</name>
    <description>${note}</description>
  </StopPoint>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<NaPTAN xmlns="http://www.naptan.org.uk/" version="2.5">
  <name>${heading}</name>
${points}
</NaPTAN>
`
}

export function toGtfs(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const stops = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <Stop id="stop-${index + 1}">
    <name>Trang ${index + 1}</name>
    <description>${note}</description>
  </Stop>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<GTFS xmlns="http://gtfs.org/" version="2.0">
  <name>${heading}</name>
${stops}
</GTFS>
`
}

export function toIfopt(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const places = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <StopPlace id="stop-${index + 1}">
    <name>Trang ${index + 1}</name>
    <description>${note}</description>
  </StopPlace>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<IFOPT xmlns="http://www.ifopt.org.uk/" version="1.0">
  <name>${heading}</name>
${places}
</IFOPT>
`
}

export function toOjp(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const points = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <StopPoint id="stop-${index + 1}">
    <name>Trang ${index + 1}</name>
    <description>${note}</description>
  </StopPoint>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<OJP xmlns="http://www.vdv.de/ojp" version="1.0">
  <name>${heading}</name>
${points}
</OJP>
`
}

export function toTrias(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const points = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <StopPoint id="stop-${index + 1}">
    <name>Trang ${index + 1}</name>
    <description>${note}</description>
  </StopPoint>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<Trias xmlns="http://www.vdv.de/trias" version="1.2">
  <name>${heading}</name>
${points}
</Trias>
`
}

export function toVdv453(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const trips = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <IstFahrt id="stop-${index + 1}">
    <name>Trang ${index + 1}</name>
    <description>${note}</description>
  </IstFahrt>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<VDV453 xmlns="http://www.vdv.de/vdv453" version="2.0">
  <name>${heading}</name>
${trips}
</VDV453>
`
}

export function toVdv454(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const plans = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <Linienfahrplan id="stop-${index + 1}">
    <name>Trang ${index + 1}</name>
    <description>${note}</description>
  </Linienfahrplan>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<VDV454 xmlns="http://www.vdv.de/vdv454" version="2.0">
  <name>${heading}</name>
${plans}
</VDV454>
`
}

export function toVdv452(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const plans = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <Fahrplan id="stop-${index + 1}">
    <name>Trang ${index + 1}</name>
    <description>${note}</description>
  </Fahrplan>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<VDV452 xmlns="http://www.vdv.de/vdv452" version="1.0">
  <name>${heading}</name>
${plans}
</VDV452>
`
}

export function toVdv462(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const stops = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <Haltestelle id="stop-${index + 1}">
    <name>Trang ${index + 1}</name>
    <description>${note}</description>
  </Haltestelle>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<VDV462 xmlns="http://www.vdv.de/vdv462" version="1.0">
  <name>${heading}</name>
${stops}
</VDV462>
`
}

export function toVdv455(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const trips = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <Fahrt id="stop-${index + 1}">
    <name>Trang ${index + 1}</name>
    <description>${note}</description>
  </Fahrt>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<VDV455 xmlns="http://www.vdv.de/vdv455" version="1.0">
  <name>${heading}</name>
${trips}
</VDV455>
`
}

export function toVdv731(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const displays = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <Anzeige id="stop-${index + 1}">
    <name>Trang ${index + 1}</name>
    <description>${note}</description>
  </Anzeige>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<VDV731 xmlns="http://www.vdv.de/vdv731" version="1.0">
  <name>${heading}</name>
${displays}
</VDV731>
`
}

export function toVdv301(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const vehicles = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <Fahrzeug id="stop-${index + 1}">
    <name>Trang ${index + 1}</name>
    <description>${note}</description>
  </Fahrzeug>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<VDV301 xmlns="http://www.vdv.de/vdv301" version="1.0">
  <name>${heading}</name>
${vehicles}
</VDV301>
`
}

export function toVdv423(title: string, pages: string[]): string {
  const heading = escapeXml((title.trim() || 'Tài liệu').replace(/\r?\n/g, ' '))
  const tickets = pages
    .map((text, index) => {
      const note = escapeXml(text.trim() || '(không có chữ)')
      return `  <Ticket id="stop-${index + 1}">
    <name>Trang ${index + 1}</name>
    <description>${note}</description>
  </Ticket>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<VDV423 xmlns="http://www.vdv.de/vdv423" version="1.0">
  <name>${heading}</name>
${tickets}
</VDV423>
`
}

export function toLatex(title: string, pages: string[]): string {
  const heading = escapeLatex(title.trim() || 'Tai lieu')
  const body = pages
    .map((text, index) => {
      const content = escapeLatex(text.trim() || '(không có chữ)')
      return `\\section*{Trang ${index + 1}}\n${content}\n`
    })
    .join('\n')
  return `\\documentclass{article}\n\\begin{document}\n\\title{${heading}}\n\\maketitle\n\n${body}\\end{document}\n`
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

function odfParagraphs(text: string): string {
  return (text.trim() || '(không có chữ)')
    .split(/\n/)
    .map((line) => `            <text:p>${escapeXml(line)}</text:p>`)
    .join('\n')
}

async function toOdfPackage(mime: string, title: string, contentXml: string): Promise<Blob> {
  const heading = escapeXml(title.trim() || 'Tài liệu')
  const zip = new JSZip()
  zip.file('mimetype', mime, { compression: 'STORE' })
  zip.file(
    'META-INF/manifest.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">
  <manifest:file-entry manifest:full-path="/" manifest:media-type="${mime}" manifest:version="1.2"/>
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
  zip.file('content.xml', contentXml)
  return zip.generateAsync({ type: 'blob', mimeType: mime })
}

function odsCell(value: string): string {
  const lines = value.split(/\n/).map((line) => `        <text:p>${escapeXml(line)}</text:p>`)
  return `      <table:table-cell office:value-type="string">\n${lines.join('\n')}\n      </table:table-cell>`
}

export async function toOds(title: string, pages: string[]): Promise<Blob> {
  const rows = [
    `<table:table-row>\n${odsCell('page')}\n${odsCell('text')}\n    </table:table-row>`,
    ...(pages.length > 0 ? pages : ['']).map(
      (text, index) =>
        `<table:table-row>\n${odsCell(String(index + 1))}\n${odsCell(text)}\n    </table:table-row>`,
    ),
  ]
  return toOdfPackage(
    'application/vnd.oasis.opendocument.spreadsheet',
    title,
    `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" office:version="1.2">
  <office:body>
    <office:spreadsheet>
      <table:table table:name="Pages">
    ${rows.join('\n    ')}
      </table:table>
    </office:spreadsheet>
  </office:body>
</office:document-content>`,
  )
}

export async function toOdp(title: string, pages: string[]): Promise<Blob> {
  const slides = pages.length > 0 ? pages : ['']
  const body = slides
    .map(
      (text, index) => `      <draw:page draw:name="page${index + 1}">
        <draw:frame svg:width="20cm" svg:height="3cm" svg:x="1cm" svg:y="1cm">
          <draw:text-box>
            <text:p>Trang ${index + 1}</text:p>
          </draw:text-box>
        </draw:frame>
        <draw:frame svg:width="20cm" svg:height="12cm" svg:x="1cm" svg:y="5cm">
          <draw:text-box>
${odfParagraphs(text)}
          </draw:text-box>
        </draw:frame>
      </draw:page>`,
    )
    .join('\n')
  return toOdfPackage(
    'application/vnd.oasis.opendocument.presentation',
    title,
    `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0" office:version="1.2">
  <office:body>
    <office:presentation>
${body}
    </office:presentation>
  </office:body>
</office:document-content>`,
  )
}

const PPTX_NS = {
  a: 'http://schemas.openxmlformats.org/drawingml/2006/main',
  r: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
  p: 'http://schemas.openxmlformats.org/presentationml/2006/main',
} as const

function pptxTextRuns(text: string): string {
  const lines = (text.trim() || '(không có chữ)').split(/\n/)
  return lines
    .map(
      (line, index) =>
        `<a:p>${index === 0 ? '' : '<a:pPr><a:spcBef><a:spcPts val="200"/></a:spcBef></a:pPr>'}<a:r><a:rPr lang="vi-VN" sz="1800"/><a:t>${escapeXml(line)}</a:t></a:r></a:p>`,
    )
    .join('')
}

function pptxShape(id: number, name: string, x: number, y: number, cx: number, cy: number, body: string): string {
  return `<p:sp>
        <p:nvSpPr>
          <p:cNvPr id="${id}" name="${name}"/>
          <p:cNvSpPr txBox="1"/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="${x}" y="${y}"/>
            <a:ext cx="${cx}" cy="${cy}"/>
          </a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          <a:noFill/>
        </p:spPr>
        <p:txBody>
          <a:bodyPr wrap="square" lIns="0" tIns="0" rIns="0" bIns="0"/>
          <a:lstStyle/>
          ${body}
        </p:txBody>
      </p:sp>`
}

function pptxSlideXml(title: string, text: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="${PPTX_NS.a}" xmlns:r="${PPTX_NS.r}" xmlns:p="${PPTX_NS.p}">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      ${pptxShape(2, 'Title', 457200, 274320, 8229600, 822960, `<a:p><a:r><a:rPr lang="vi-VN" sz="2800" b="1"/><a:t>${escapeXml(title)}</a:t></a:r></a:p>`)}
      ${pptxShape(3, 'Body', 457200, 1280160, 8229600, 5029200, pptxTextRuns(text))}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr>
    <a:masterClrMapping/>
  </p:clrMapOvr>
</p:sld>`
}

export async function toPptx(title: string, pages: string[]): Promise<Blob> {
  const heading = escapeXml(title.trim() || 'Tài liệu')
  const slides = pages.length > 0 ? pages : ['']
  const zip = new JSZip()
  const slideOverrides = slides
    .map(
      (_, index) =>
        `  <Override PartName="/ppt/slides/slide${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`,
    )
    .join('\n')
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
${slideOverrides}
</Types>`,
  )
  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
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
    'docProps/app.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <Application>Smart-Read</Application>
  <Slides>${slides.length}</Slides>
  <PresentationFormat>On-screen Show (4:3)</PresentationFormat>
</Properties>`,
  )
  const presentationRels = [
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>',
    ...slides.map(
      (_, index) =>
        `<Relationship Id="rId${index + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${index + 1}.xml"/>`,
    ),
  ]
  zip.file(
    'ppt/_rels/presentation.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${presentationRels.join('\n  ')}
</Relationships>`,
  )
  const sldIdLst = slides
    .map((_, index) => `      <p:sldId id="${256 + index}" r:id="rId${index + 2}"/>`)
    .join('\n')
  zip.file(
    'ppt/presentation.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="${PPTX_NS.a}" xmlns:r="${PPTX_NS.r}" xmlns:p="${PPTX_NS.p}" saveSubsetFonts="1">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648" r:id="rId1"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>
${sldIdLst}
  </p:sldIdLst>
  <p:sldSz cx="9144000" cy="6858000" type="screen4x3"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`,
  )
  zip.file(
    'ppt/slideMasters/_rels/slideMaster1.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>`,
  )
  zip.file(
    'ppt/slideMasters/slideMaster1.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="${PPTX_NS.a}" xmlns:r="${PPTX_NS.r}" xmlns:p="${PPTX_NS.p}">
  <p:cSld>
    <p:bg>
      <p:bgRef idx="1001"><a:schemeClr val="lt1"/></p:bgRef>
    </p:bg>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst>
    <p:sldLayoutId id="2147483649" r:id="rId1"/>
  </p:sldLayoutIdLst>
</p:sldMaster>`,
  )
  zip.file(
    'ppt/slideLayouts/_rels/slideLayout1.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>`,
  )
  zip.file(
    'ppt/slideLayouts/slideLayout1.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="${PPTX_NS.a}" xmlns:r="${PPTX_NS.r}" xmlns:p="${PPTX_NS.p}" type="blank">
  <p:cSld name="Blank">
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr>
    <a:masterClrMapping/>
  </p:clrMapOvr>
</p:sldLayout>`,
  )
  zip.file(
    'ppt/theme/theme1.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="${PPTX_NS.a}" name="Smart-Read">
  <a:themeElements>
    <a:clrScheme name="Smart-Read">
      <a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1>
      <a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1>
      <a:dk2><a:srgbClr val="1F1A16"/></a:dk2>
      <a:lt2><a:srgbClr val="F4EFE6"/></a:lt2>
      <a:accent1><a:srgbClr val="9A3412"/></a:accent1>
      <a:accent2><a:srgbClr val="7C2D12"/></a:accent2>
      <a:accent3><a:srgbClr val="3F6212"/></a:accent3>
      <a:accent4><a:srgbClr val="1D4ED8"/></a:accent4>
      <a:accent5><a:srgbClr val="0F766E"/></a:accent5>
      <a:accent6><a:srgbClr val="A16207"/></a:accent6>
      <a:hlink><a:srgbClr val="9A3412"/></a:hlink>
      <a:folHlink><a:srgbClr val="7C2D12"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="Smart-Read">
      <a:majorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont>
      <a:minorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="Smart-Read">
      <a:fillStyleLst>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
      </a:fillStyleLst>
      <a:lnStyleLst>
        <a:ln w="12700" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>
        <a:ln w="12700" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>
        <a:ln w="12700" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>
      </a:lnStyleLst>
      <a:effectStyleLst>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle><a:effectLst/></a:effectStyle>
      </a:effectStyleLst>
      <a:bgFillStyleLst>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
      </a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
</a:theme>`,
  )
  for (let index = 0; index < slides.length; index += 1) {
    const n = index + 1
    zip.file(
      `ppt/slides/_rels/slide${n}.xml.rels`,
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`,
    )
    zip.file(`ppt/slides/slide${n}.xml`, pptxSlideXml(`Trang ${n}`, slides[index]!))
  }
  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
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
    case 'yaml':
      return 'application/yaml;charset=utf-8'
    case 'xml':
      return 'application/xml;charset=utf-8'
    case 'csv':
      return 'text/csv;charset=utf-8'
    case 'tsv':
      return 'text/tab-separated-values;charset=utf-8'
    case 'toml':
      return 'application/toml;charset=utf-8'
    case 'org':
      return 'text/org;charset=utf-8'
    case 'tex':
      return 'application/x-tex;charset=utf-8'
    case 'jsonl':
      return 'application/jsonl;charset=utf-8'
    case 'ini':
      return 'text/plain;charset=utf-8'
    case 'adoc':
      return 'text/asciidoc;charset=utf-8'
    case 'rst':
      return 'text/x-rst;charset=utf-8'
    case 'textile':
      return 'text/x-textile;charset=utf-8'
    case 'wiki':
      return 'text/x-mediawiki;charset=utf-8'
    case 'dokuwiki':
      return 'text/x-dokuwiki;charset=utf-8'
    case 'dbk':
      return 'application/docbook+xml;charset=utf-8'
    case 'opml':
      return 'text/x-opml;charset=utf-8'
    case 'atom':
      return 'application/atom+xml;charset=utf-8'
    case 'typ':
      return 'text/x-typst;charset=utf-8'
    case 'gmi':
      return 'text/gemini;charset=utf-8'
    case 'pod':
      return 'text/x-pod;charset=utf-8'
    case 'bbcode':
      return 'text/x-bbcode;charset=utf-8'
    case 'fountain':
      return 'text/x-fountain;charset=utf-8'
    case 'tid':
      return 'text/x-tiddlywiki;charset=utf-8'
    case 'texinfo':
      return 'application/x-texinfo;charset=utf-8'
    case 'roff':
      return 'text/troff;charset=utf-8'
    case 'ipynb':
      return 'application/x-ipynb+json;charset=utf-8'
    case 'bib':
      return 'application/x-bibtex;charset=utf-8'
    case 'srt':
      return 'application/x-subrip;charset=utf-8'
    case 'vtt':
      return 'text/vtt;charset=utf-8'
    case 'lrc':
      return 'text/x-lrc;charset=utf-8'
    case 'ics':
      return 'text/calendar;charset=utf-8'
    case 'cue':
      return 'application/x-cue;charset=utf-8'
    case 'ass':
      return 'text/x-ssa;charset=utf-8'
    case 'ttml':
      return 'application/ttml+xml;charset=utf-8'
    case 'sbv':
      return 'text/x-sbv;charset=utf-8'
    case 'sami':
      return 'application/x-sami;charset=utf-8'
    case 'sub':
      return 'text/x-microdvd;charset=utf-8'
    case 'stl':
      return 'text/x-spruce;charset=utf-8'
    case 'scc':
      return 'text/x-scc;charset=utf-8'
    case 'usf':
      return 'application/x-usf+xml;charset=utf-8'
    case 'rt':
      return 'text/vnd.rn-realtext;charset=utf-8'
    case 'mpl':
      return 'text/x-mpl2;charset=utf-8'
    case 'djvu':
      return 'image/vnd.djvu;charset=utf-8'
    case 'ps':
      return 'application/postscript;charset=utf-8'
    case 'tei':
      return 'application/tei+xml;charset=utf-8'
    case 'jats':
      return 'application/vnd.jats+xml;charset=utf-8'
    case 'ris':
      return 'application/x-research-info-systems;charset=utf-8'
    case 'enw':
      return 'application/x-endnote-refer;charset=utf-8'
    case 'csljson':
      return 'application/vnd.citationstyles.csl+json;charset=utf-8'
    case 'nbib':
      return 'application/x-nbib;charset=utf-8'
    case 'cslyaml':
      return 'application/vnd.citationstyles.csl+yaml;charset=utf-8'
    case 'enxml':
      return 'application/x-endnote+xml;charset=utf-8'
    case 'mods':
      return 'application/mods+xml;charset=utf-8'
    case 'cff':
      return 'application/citation-file+yaml;charset=utf-8'
    case 'datacite':
      return 'application/vnd.datacite.datacite+xml;charset=utf-8'
    case 'marcxml':
      return 'application/marcxml+xml;charset=utf-8'
    case 'dublincore':
      return 'application/vnd.dublincore+xml;charset=utf-8'
    case 'onix':
      return 'application/onix+xml;charset=utf-8'
    case 'unixref':
      return 'application/vnd.crossref.unixref+xml;charset=utf-8'
    case 'bibjson':
      return 'application/vnd.citationstyles.bibjson+json;charset=utf-8'
    case 'pubmed':
      return 'application/vnd.nlm.pubmed+xml;charset=utf-8'
    case 'jsonld':
      return 'application/ld+json;charset=utf-8'
    case 'bibframe':
      return 'application/bibframe+xml;charset=utf-8'
    case 'crossref':
      return 'application/vnd.crossref+json;charset=utf-8'
    case 'ead':
      return 'application/ead+xml;charset=utf-8'
    case 'mets':
      return 'application/mets+xml;charset=utf-8'
    case 'premis':
      return 'application/premis+xml;charset=utf-8'
    case 'mix':
      return 'application/mix+xml;charset=utf-8'
    case 'alto':
      return 'application/alto+xml;charset=utf-8'
    case 'page':
      return 'application/vnd.prima.page+xml;charset=utf-8'
    case 'foxml':
      return 'application/foxml+xml;charset=utf-8'
    case 'edm':
      return 'application/vnd.europeana.edm+xml;charset=utf-8'
    case 'lido':
      return 'application/lido+xml;charset=utf-8'
    case 'vra':
      return 'application/vra+xml;charset=utf-8'
    case 'cdwa':
      return 'application/cdwa+xml;charset=utf-8'
    case 'spectrum':
      return 'application/spectrum+xml;charset=utf-8'
    case 'dwc':
      return 'application/vnd.tdwg.dwc+xml;charset=utf-8'
    case 'objectid':
      return 'application/objectid+xml;charset=utf-8'
    case 'eac':
      return 'application/eac-cpf+xml;charset=utf-8'
    case 'crm':
      return 'application/cidoc-crm+xml;charset=utf-8'
    case 'rights':
      return 'application/metsrights+xml;charset=utf-8'
    case 'textmd':
      return 'application/textmd+xml;charset=utf-8'
    case 'pbcore':
      return 'application/pbcore+xml;charset=utf-8'
    case 'ebucore':
      return 'application/ebucore+xml;charset=utf-8'
    case 'mpeg7':
      return 'application/mpeg7+xml;charset=utf-8'
    case 'aes57':
      return 'application/aes57+xml;charset=utf-8'
    case 'lom':
      return 'application/lom+xml;charset=utf-8'
    case 'imscp':
      return 'application/imscp+xml;charset=utf-8'
    case 'newsml':
      return 'application/newsml+xml;charset=utf-8'
    case 'nitf':
      return 'application/nitf+xml;charset=utf-8'
    case 'sportsml':
      return 'application/sportsml+xml;charset=utf-8'
    case 'eventsml':
      return 'application/eventsml+xml;charset=utf-8'
    case 'newsmlg2':
      return 'application/vnd.iptc.g2+xml;charset=utf-8'
    case 'rnews':
      return 'application/vnd.iptc.rnews+xml;charset=utf-8'
    case 'prism':
      return 'application/prism+xml;charset=utf-8'
    case 'hnews':
      return 'application/hnews+xml;charset=utf-8'
    case 'iptc':
      return 'application/iptc+xml;charset=utf-8'
    case 'anpa':
      return 'application/anpa+xml;charset=utf-8'
    case 'ninjs':
      return 'application/vnd.iptc.ninjs+json;charset=utf-8'
    case 'jsonfeed':
      return 'application/feed+json;charset=utf-8'
    case 'as2':
      return 'application/activity+json;charset=utf-8'
    case 'geojson':
      return 'application/geo+json;charset=utf-8'
    case 'kml':
      return 'application/vnd.google-earth.kml+xml;charset=utf-8'
    case 'gpx':
      return 'application/gpx+xml;charset=utf-8'
    case 'osm':
      return 'application/vnd.osm+xml;charset=utf-8'
    case 'georss':
      return 'application/georss+xml;charset=utf-8'
    case 'wkt':
      return 'application/wkt;charset=utf-8'
    case 'gml':
      return 'application/gml+xml;charset=utf-8'
    case 'topojson':
      return 'application/json;charset=utf-8'
    case 'svg':
      return 'image/svg+xml;charset=utf-8'
    case 'dxf':
      return 'application/dxf;charset=utf-8'
    case 'mapml':
      return 'text/mapml;charset=utf-8'
    case 'cityjson':
      return 'application/city+json;charset=utf-8'
    case 'indoorgml':
      return 'application/indoorgml+xml;charset=utf-8'
    case 'citygml':
      return 'application/citygml+xml;charset=utf-8'
    case 'landxml':
      return 'application/landxml+xml;charset=utf-8'
    case 'ifcxml':
      return 'application/ifcxml+xml;charset=utf-8'
    case 'gbxml':
      return 'application/gbxml+xml;charset=utf-8'
    case 'bcfxml':
      return 'application/bcfxml+xml;charset=utf-8'
    case 'cobiexml':
      return 'application/cobiexml+xml;charset=utf-8'
    case 'landinfra':
      return 'application/landinfra+xml;charset=utf-8'
    case 'infragml':
      return 'application/infragml+xml;charset=utf-8'
    case 'opendrive':
      return 'application/vnd.opendrive+xml;charset=utf-8'
    case 'railml':
      return 'application/railml+xml;charset=utf-8'
    case 'transxml':
      return 'application/transxml+xml;charset=utf-8'
    case 'datex2':
      return 'application/datex2+xml;charset=utf-8'
    case 'netex':
      return 'application/netex+xml;charset=utf-8'
    case 'siri':
      return 'application/siri+xml;charset=utf-8'
    case 'transxchange':
      return 'application/transxchange+xml;charset=utf-8'
    case 'naptan':
      return 'application/naptan+xml;charset=utf-8'
    case 'gtfs':
      return 'application/gtfs+xml;charset=utf-8'
    case 'ifopt':
      return 'application/ifopt+xml;charset=utf-8'
    case 'ojp':
      return 'application/ojp+xml;charset=utf-8'
    case 'trias':
      return 'application/trias+xml;charset=utf-8'
    case 'vdv453':
      return 'application/vdv453+xml;charset=utf-8'
    case 'vdv454':
      return 'application/vdv454+xml;charset=utf-8'
    case 'vdv452':
      return 'application/vdv452+xml;charset=utf-8'
    case 'vdv462':
      return 'application/vdv462+xml;charset=utf-8'
    case 'vdv455':
      return 'application/vdv455+xml;charset=utf-8'
    case 'vdv731':
      return 'application/vdv731+xml;charset=utf-8'
    case 'vdv301':
      return 'application/vdv301+xml;charset=utf-8'
    case 'vdv423':
      return 'application/vdv423+xml;charset=utf-8'
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    case 'png':
      return 'image/png'
    case 'jpg':
      return 'image/jpeg'
    case 'webp':
      return 'image/webp'
    case 'cbz':
      return 'application/vnd.comicbook+zip'
    case 'docx':
    case 'doc':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    case 'odt':
      return 'application/vnd.oasis.opendocument.text'
    case 'ods':
      return 'application/vnd.oasis.opendocument.spreadsheet'
    case 'pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    case 'odp':
      return 'application/vnd.oasis.opendocument.presentation'
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
