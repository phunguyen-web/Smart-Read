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
  | 'vdv431'
  | 'vdv300'
  | 'vdv451'
  | 'vdv432'
  | 'vdv433'
  | 'vdv434'
  | 'vdv435'
  | 'vdv436'
  | 'vdv456'
  | 'vdv457'
  | 'vdv459'
  | 'vdv461'
  | 'vdv458'
  | 'vdv460'
  | 'xliff'
  | 'tmx'
  | 'tbx'
  | 'po'
  | 'dita'
  | 'vcard'
  | 'rdf'
  | 'opds'
  | 'vtodo'
  | 'vjournal'
  | 'vfreebusy'
  | 'vavailability'
  | 'vtimezone'
  | 'valarm'
  | 'vevent'
  | 'xcal'
  | 'jcal'
  | 'jcard'
  | 'xcard'
  | 'hcard'
  | 'hcal'
  | 'jscal'
  | 'dtbook'
  | 'ssml'
  | 'mathml'
  | 'vxml'
  | 'pls'
  | 'musicxml'
  | 'mei'
  | 'abc'
  | 'smil'
  | 'graphml'
  | 'dot'
  | 'mf2t'
  | 'ly'
  | 'krn'
  | 'xspf'
  | 'm3u'
  | 'jspf'
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
  if (kind === 'iptc') {
    return pagesFromIptc(text)
  }
  if (kind === 'anpa') {
    return pagesFromAnpa(text)
  }
  if (kind === 'ninjs') {
    return pagesFromNinjs(text)
  }
  if (kind === 'jsonfeed') {
    return pagesFromJsonfeed(text)
  }
  if (kind === 'as2') {
    return pagesFromAs2(text)
  }
  if (kind === 'geojson') {
    return pagesFromGeojson(text)
  }
  if (kind === 'kml') {
    return pagesFromKml(text)
  }
  if (kind === 'gpx') {
    return pagesFromGpx(text)
  }
  if (kind === 'osm') {
    return pagesFromOsm(text)
  }
  if (kind === 'georss') {
    return pagesFromGeorss(text)
  }
  if (kind === 'wkt') {
    return pagesFromWkt(text)
  }
  if (kind === 'gml') {
    return pagesFromGml(text)
  }
  if (kind === 'topojson') {
    return pagesFromTopojson(text)
  }
  if (kind === 'svg') {
    return pagesFromSvg(text)
  }
  if (kind === 'dxf') {
    return pagesFromDxf(text)
  }
  if (kind === 'mapml') {
    return pagesFromMapml(text)
  }
  if (kind === 'cityjson') {
    return pagesFromCityjson(text)
  }
  if (kind === 'indoorgml') {
    return pagesFromIndoorgml(text)
  }
  if (kind === 'citygml') {
    return pagesFromCitygml(text)
  }
  if (kind === 'landxml') {
    return pagesFromLandxml(text)
  }
  if (kind === 'ifcxml') {
    return pagesFromIfcxml(text)
  }
  if (kind === 'gbxml') {
    return pagesFromGbxml(text)
  }
  if (kind === 'bcfxml') {
    return pagesFromBcfxml(text)
  }
  if (kind === 'cobiexml') {
    return pagesFromCobiexml(text)
  }
  if (kind === 'landinfra') {
    return pagesFromLandinfra(text)
  }
  if (kind === 'infragml') {
    return pagesFromInfragml(text)
  }
  if (kind === 'opendrive') {
    return pagesFromOpendrive(text)
  }
  if (kind === 'railml') {
    return pagesFromRailml(text)
  }
  if (kind === 'transxml') {
    return pagesFromTransxml(text)
  }
  if (kind === 'datex2') {
    return pagesFromDatex2(text)
  }
  if (kind === 'netex') {
    return pagesFromNetex(text)
  }
  if (kind === 'siri') {
    return pagesFromSiri(text)
  }
  if (kind === 'transxchange') {
    return pagesFromTransxchange(text)
  }
  if (kind === 'naptan') {
    return pagesFromNaptan(text)
  }
  if (kind === 'gtfs') {
    return pagesFromGtfs(text)
  }
  if (kind === 'ifopt') {
    return pagesFromIfopt(text)
  }
  if (kind === 'ojp') {
    return pagesFromOjp(text)
  }
  if (kind === 'trias') {
    return pagesFromTrias(text)
  }
  if (kind === 'vdv453') {
    return pagesFromVdv453(text)
  }
  if (kind === 'vdv454') {
    return pagesFromVdv454(text)
  }
  if (kind === 'vdv452') {
    return pagesFromVdv452(text)
  }
  if (kind === 'vdv462') {
    return pagesFromVdv462(text)
  }
  if (kind === 'vdv455') {
    return pagesFromVdv455(text)
  }
  if (kind === 'vdv731') {
    return pagesFromVdv731(text)
  }
  if (kind === 'vdv301') {
    return pagesFromVdv301(text)
  }
  if (kind === 'vdv423') {
    return pagesFromVdv423(text)
  }
  if (kind === 'vdv431') {
    return pagesFromVdv431(text)
  }
  if (kind === 'vdv300') {
    return pagesFromVdv300(text)
  }
  if (kind === 'vdv451') {
    return pagesFromVdv451(text)
  }
  if (kind === 'vdv432') {
    return pagesFromVdv432(text)
  }
  if (kind === 'vdv433') {
    return pagesFromVdv433(text)
  }
  if (kind === 'vdv434') {
    return pagesFromVdv434(text)
  }
  if (kind === 'vdv435') {
    return pagesFromVdv435(text)
  }
  if (kind === 'vdv436') {
    return pagesFromVdv436(text)
  }
  if (kind === 'vdv456') {
    return pagesFromVdv456(text)
  }
  if (kind === 'vdv457') {
    return pagesFromVdv457(text)
  }
  if (kind === 'vdv459') {
    return pagesFromVdv459(text)
  }
  if (kind === 'vdv461') {
    return pagesFromVdv461(text)
  }
  if (kind === 'vdv458') {
    return pagesFromVdv458(text)
  }
  if (kind === 'vdv460') {
    return pagesFromVdv460(text)
  }
  if (kind === 'xliff') {
    return pagesFromXliff(text)
  }
  if (kind === 'tmx') {
    return pagesFromTmx(text)
  }
  if (kind === 'tbx') {
    return pagesFromTbx(text)
  }
  if (kind === 'po') {
    return pagesFromPo(text)
  }
  if (kind === 'dita') {
    return pagesFromDita(text)
  }
  if (kind === 'vcard') {
    return pagesFromVcard(text)
  }
  if (kind === 'rdf') {
    return pagesFromRdf(text)
  }
  if (kind === 'opds') {
    return pagesFromOpds(text)
  }
  if (kind === 'vtodo') {
    return pagesFromVtodo(text)
  }
  if (kind === 'vjournal') {
    return pagesFromVjournal(text)
  }
  if (kind === 'vfreebusy') {
    return pagesFromVfreebusy(text)
  }
  if (kind === 'vavailability') {
    return pagesFromVavailability(text)
  }
  if (kind === 'vtimezone') {
    return pagesFromVtimezone(text)
  }
  if (kind === 'valarm') {
    return pagesFromValarm(text)
  }
  if (kind === 'vevent') {
    return pagesFromVevent(text)
  }
  if (kind === 'xcal') {
    return pagesFromXcal(text)
  }
  if (kind === 'jcal') {
    return pagesFromJcal(text)
  }
  if (kind === 'jcard') {
    return pagesFromJcard(text)
  }
  if (kind === 'xcard') {
    return pagesFromXcard(text)
  }
  if (kind === 'hcard') {
    return pagesFromHcard(text)
  }
  if (kind === 'hcal') {
    return pagesFromHcal(text)
  }
  if (kind === 'jscal') {
    return pagesFromJscal(text)
  }
  if (kind === 'dtbook') {
    return pagesFromDtbook(text)
  }
  if (kind === 'ssml') {
    return pagesFromSsml(text)
  }
  if (kind === 'mathml') {
    return pagesFromMathml(text)
  }
  if (kind === 'vxml') {
    return pagesFromVxml(text)
  }
  if (kind === 'pls') {
    return pagesFromPls(text)
  }
  if (kind === 'musicxml') {
    return pagesFromMusicxml(text)
  }
  if (kind === 'mei') {
    return pagesFromMei(text)
  }
  if (kind === 'abc') {
    return pagesFromAbc(text)
  }
  if (kind === 'smil') {
    return pagesFromSmil(text)
  }
  if (kind === 'graphml') {
    return pagesFromGraphml(text)
  }
  if (kind === 'dot') {
    return pagesFromDot(text)
  }
  if (kind === 'mf2t') {
    return pagesFromMf2t(text)
  }
  if (kind === 'ly') {
    return pagesFromLilypond(text)
  }
  if (kind === 'krn') {
    return pagesFromHumdrum(text)
  }
  if (kind === 'xspf') {
    return pagesFromXspf(text)
  }
  if (kind === 'm3u') {
    return pagesFromM3u(text)
  }
  if (kind === 'jspf') {
    return pagesFromJspf(text)
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

export function pagesFromIptc(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [
    ...trimmed.matchAll(/<(?:iptc:)?iptcItem\b[^>]*>([\s\S]*?)<\/(?:iptc:)?iptcItem>/gi),
  ]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const value = xmlTagText(record, 'iptc:body') || xmlTagText(record, 'body')
      if (value) {
        return value
      }
      const note = xmlTagText(record, 'iptc:description') || xmlTagText(record, 'description')
      if (note) {
        return note
      }
      const title = xmlTagText(record, 'iptc:headline') || xmlTagText(record, 'headline')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp IPTC cần các mục <iptcItem> / <body>.')
}

export function pagesFromAnpa(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [
    ...trimmed.matchAll(/<(?:anpa:)?anpaStory\b[^>]*>([\s\S]*?)<\/(?:anpa:)?anpaStory>/gi),
  ]
  const pages = records
    .map((match) => {
      const record = match[1]!
      const value = xmlTagText(record, 'anpa:text') || xmlTagText(record, 'text')
      if (value) {
        return value
      }
      const note = xmlTagText(record, 'anpa:description') || xmlTagText(record, 'description')
      if (note) {
        return note
      }
      const title = xmlTagText(record, 'anpa:headline') || xmlTagText(record, 'headline')
      if (title && !/^Trang\s+\d+$/.test(title)) {
        return title
      }
      return ''
    })
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp ANPA cần các mục <anpaStory> / <text>.')
}

function firstJsonString(value: unknown): string {
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

function textFromNinjsItem(item: unknown): string {
  if (!item || typeof item !== 'object') {
    return ''
  }
  const rec = item as { body_text?: unknown; description?: unknown; headline?: unknown }
  const body = firstJsonString(rec.body_text)
  if (body) {
    return body
  }
  const note = firstJsonString(rec.description)
  if (note) {
    return note
  }
  const title = firstJsonString(rec.headline)
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function ninjsItems(data: unknown): unknown[] | null {
  if (Array.isArray(data)) {
    return data
  }
  if (!data || typeof data !== 'object') {
    return null
  }
  const rec = data as { ninjs?: unknown; items?: unknown }
  if (Array.isArray(rec.items) && (rec.ninjs != null || rec.items.length > 0)) {
    return rec.items
  }
  return rec.ninjs != null ? [] : null
}

export function pagesFromNinjs(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed) || /^\s*\[/.test(trimmed)) {
    let data: unknown
    try {
      data = JSON.parse(trimmed)
    } catch {
      throw new Error('Tệp NINJS không hợp lệ.')
    }
    const items = ninjsItems(data)
    if (items) {
      const pages = items.map(textFromNinjsItem).filter((page) => page.length > 0)
      if (pages.length > 0) {
        return capPages(pages)
      }
      throw new Error('Tệp NINJS cần các mục items / body_text.')
    }
    if (/^\s*\{/.test(trimmed)) {
      return pagesFromJson(trimmed)
    }
  }
  throw new Error('Tệp NINJS cần các mục items / body_text.')
}

function textFromJsonfeedItem(item: unknown): string {
  if (!item || typeof item !== 'object') {
    return ''
  }
  const rec = item as { content_text?: unknown; summary?: unknown; title?: unknown }
  const body = firstJsonString(rec.content_text)
  if (body) {
    return body
  }
  const note = firstJsonString(rec.summary)
  if (note) {
    return note
  }
  const title = firstJsonString(rec.title)
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function jsonfeedItems(data: unknown): unknown[] | null {
  if (Array.isArray(data)) {
    return data
  }
  if (!data || typeof data !== 'object') {
    return null
  }
  const rec = data as { version?: unknown; items?: unknown }
  const version = firstJsonString(rec.version)
  const isFeed = /jsonfeed\.org/i.test(version)
  if (Array.isArray(rec.items) && (isFeed || rec.items.length > 0)) {
    return rec.items
  }
  return isFeed ? [] : null
}

export function pagesFromJsonfeed(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed) || /^\s*\[/.test(trimmed)) {
    let data: unknown
    try {
      data = JSON.parse(trimmed)
    } catch {
      throw new Error('Tệp JSON Feed không hợp lệ.')
    }
    const items = jsonfeedItems(data)
    if (items) {
      const pages = items.map(textFromJsonfeedItem).filter((page) => page.length > 0)
      if (pages.length > 0) {
        return capPages(pages)
      }
      throw new Error('Tệp JSON Feed cần các mục items / content_text.')
    }
    if (/^\s*\{/.test(trimmed)) {
      return pagesFromJson(trimmed)
    }
  }
  throw new Error('Tệp JSON Feed cần các mục items / content_text.')
}

function textFromAs2Item(item: unknown): string {
  if (!item || typeof item !== 'object') {
    return ''
  }
  const rec = item as { content?: unknown; summary?: unknown; name?: unknown }
  const body = firstJsonString(rec.content)
  if (body) {
    return body
  }
  const note = firstJsonString(rec.summary)
  if (note) {
    return note
  }
  const title = firstJsonString(rec.name)
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function as2ContextText(value: unknown): string {
  if (typeof value === 'string') {
    return value
  }
  if (Array.isArray(value)) {
    return value.map(as2ContextText).join(' ')
  }
  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>)
      .map(as2ContextText)
      .join(' ')
  }
  return ''
}

function as2Items(data: unknown): unknown[] | null {
  if (Array.isArray(data)) {
    return data
  }
  if (!data || typeof data !== 'object') {
    return null
  }
  const rec = data as { '@context'?: unknown; type?: unknown; orderedItems?: unknown; items?: unknown }
  const isAs2 =
    /activitystreams/i.test(as2ContextText(rec['@context'])) ||
    firstJsonString(rec.type) === 'OrderedCollection'
  if (Array.isArray(rec.orderedItems) && (isAs2 || rec.orderedItems.length > 0)) {
    return rec.orderedItems
  }
  if (isAs2 && Array.isArray(rec.items)) {
    return rec.items
  }
  return isAs2 ? [] : null
}

export function pagesFromAs2(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed) || /^\s*\[/.test(trimmed)) {
    let data: unknown
    try {
      data = JSON.parse(trimmed)
    } catch {
      throw new Error('Tệp Activity Streams không hợp lệ.')
    }
    const items = as2Items(data)
    if (items) {
      const pages = items.map(textFromAs2Item).filter((page) => page.length > 0)
      if (pages.length > 0) {
        return capPages(pages)
      }
      throw new Error('Tệp Activity Streams cần các mục orderedItems / content.')
    }
    if (/^\s*\{/.test(trimmed)) {
      return pagesFromJson(trimmed)
    }
  }
  throw new Error('Tệp Activity Streams cần các mục orderedItems / content.')
}

function textFromGeojsonFeature(item: unknown): string {
  if (!item || typeof item !== 'object') {
    return ''
  }
  const rec = item as { properties?: unknown; description?: unknown; name?: unknown }
  const props =
    rec.properties && typeof rec.properties === 'object'
      ? (rec.properties as { description?: unknown; text?: unknown; name?: unknown })
      : null
  const body = firstJsonString(props?.description) || firstJsonString(rec.description)
  if (body) {
    return body
  }
  const note = firstJsonString(props?.text)
  if (note) {
    return note
  }
  const title = firstJsonString(props?.name) || firstJsonString(rec.name)
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function geojsonFeatures(data: unknown): unknown[] | null {
  if (Array.isArray(data)) {
    return data
  }
  if (!data || typeof data !== 'object') {
    return null
  }
  const rec = data as { type?: unknown; features?: unknown }
  const kind = firstJsonString(rec.type)
  const isCollection = kind === 'FeatureCollection'
  if (Array.isArray(rec.features) && (isCollection || rec.features.length > 0)) {
    return rec.features
  }
  if (kind === 'Feature') {
    return [data]
  }
  return isCollection ? [] : null
}

export function pagesFromGeojson(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed) || /^\s*\[/.test(trimmed)) {
    let data: unknown
    try {
      data = JSON.parse(trimmed)
    } catch {
      throw new Error('Tệp GeoJSON không hợp lệ.')
    }
    const features = geojsonFeatures(data)
    if (features) {
      const pages = features.map(textFromGeojsonFeature).filter((page) => page.length > 0)
      if (pages.length > 0) {
        return capPages(pages)
      }
      throw new Error('Tệp GeoJSON cần các mục features / description.')
    }
    if (/^\s*\{/.test(trimmed)) {
      return pagesFromJson(trimmed)
    }
  }
  throw new Error('Tệp GeoJSON cần các mục features / description.')
}

function textFromKmlPlacemark(record: string): string {
  const body = xmlTagText(record, 'kml:description') || xmlTagText(record, 'description')
  if (body) {
    return body
  }
  const note = xmlTagText(record, 'kml:text') || xmlTagText(record, 'text')
  if (note) {
    return note
  }
  const title = xmlTagText(record, 'kml:name') || xmlTagText(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

export function pagesFromKml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [
    ...trimmed.matchAll(/<(?:kml:)?Placemark\b[^>]*>([\s\S]*?)<\/(?:kml:)?Placemark>/gi),
  ]
  const pages = records.map((match) => textFromKmlPlacemark(match[1]!)).filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp KML cần các mục <Placemark> / <description>.')
}

function textFromGpxWaypoint(record: string): string {
  const body = xmlTagText(record, 'gpx:desc') || xmlTagText(record, 'desc')
  if (body) {
    return body
  }
  const note = xmlTagText(record, 'gpx:cmt') || xmlTagText(record, 'cmt')
  if (note) {
    return note
  }
  const title = xmlTagText(record, 'gpx:name') || xmlTagText(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function gpxRecords(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:gpx:)?${tag}\\b[^>]*>([\\s\\S]*?)</(?:gpx:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromGpxWaypoint(match[1]!))
    .filter((page) => page.length > 0)
}

export function pagesFromGpx(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = gpxRecords(trimmed, 'wpt')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const tracks = gpxRecords(trimmed, 'trkpt')
  if (tracks.length > 0) {
    return capPages(tracks)
  }
  const routes = gpxRecords(trimmed, 'rtept')
  if (routes.length > 0) {
    return capPages(routes)
  }
  throw new Error('Tệp GPX cần các mục <wpt> / <desc>.')
}

function osmTagValue(record: string, key: string): string {
  const tags = [...record.matchAll(/<(?:osm:)?tag\b([^>]*)\/?>/gi)]
  for (const match of tags) {
    const attrs = match[1]!
    const name = attrs.match(/\bk\s*=\s*["']([^"']*)["']/i)?.[1]
    const value = attrs.match(/\bv\s*=\s*["']([^"']*)["']/i)?.[1]
    if (name && unescapeXml(name) === key && value) {
      return unescapeXml(value).trim()
    }
  }
  return ''
}

function textFromOsmNode(record: string): string {
  const body = osmTagValue(record, 'text') || xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const note = osmTagValue(record, 'description') || xmlTagText(record, 'description')
  if (note) {
    return note
  }
  const title = osmTagValue(record, 'name') || xmlTagText(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function osmRecords(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:osm:)?${tag}\\b[^>]*>([\\s\\S]*?)</(?:osm:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromOsmNode(match[1]!))
    .filter((page) => page.length > 0)
}

export function pagesFromOsm(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = osmRecords(trimmed, 'node')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const ways = osmRecords(trimmed, 'way')
  if (ways.length > 0) {
    return capPages(ways)
  }
  const relations = osmRecords(trimmed, 'relation')
  if (relations.length > 0) {
    return capPages(relations)
  }
  throw new Error('Tệp OSM cần các mục <node> / <tag>.')
}

function textFromGeorssEntry(record: string): string {
  const body =
    xmlTagText(record, 'summary') ||
    xmlTagText(record, 'atom:summary') ||
    xmlTagText(record, 'georss:description') ||
    xmlTagText(record, 'description')
  if (body) {
    return body
  }
  const note =
    xmlTagText(record, 'content') ||
    xmlTagText(record, 'atom:content') ||
    xmlTagText(record, 'georss:content')
  if (note) {
    return note
  }
  const title = xmlTagText(record, 'title') || xmlTagText(record, 'atom:title')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function georssRecords(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:atom:|georss:)?${tag}\\b[^>]*>([\\s\\S]*?)</(?:atom:|georss:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromGeorssEntry(match[1]!))
    .filter((page) => page.length > 0)
}

export function pagesFromGeorss(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = georssRecords(trimmed, 'entry')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const items = georssRecords(trimmed, 'item')
  if (items.length > 0) {
    return capPages(items)
  }
  throw new Error('Tệp GeoRSS cần các mục <entry> / <summary>.')
}

function isWktPointLine(line: string): boolean {
  return /^\s*POINT\s*\(/i.test(line)
}

export function pagesFromWkt(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages: string[] = []
  let current: string[] | null = null
  for (const line of trimmed.split(/\r?\n/)) {
    if (/^\s*#/.test(line) && current == null) {
      continue
    }
    if (isWktPointLine(line)) {
      if (current) {
        const page = current.join('\n').trim()
        if (page) {
          pages.push(page)
        }
      }
      const rest = line.replace(/^\s*POINT\s*\([^)]*\)\s*/i, '').replace(/^\|\s*/, '')
      current = rest ? [rest] : []
      continue
    }
    if (current) {
      current.push(line)
    }
  }
  if (current) {
    const page = current.join('\n').trim()
    if (page) {
      pages.push(page)
    }
  }
  if (pages.length === 0) {
    throw new Error('Tệp WKT cần các mục POINT.')
  }
  return capPages(pages)
}

function textFromGmlMember(record: string): string {
  const body =
    xmlTagText(record, 'gml:description') ||
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'gml:text') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const note = xmlTagText(record, 'gml:note') || xmlTagText(record, 'note')
  if (note) {
    return note
  }
  const title = xmlTagText(record, 'gml:name') || xmlTagText(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function gmlRecords(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(
    `<(?:gml:)?${tag}\\b[^>]*>([\\s\\S]*?)</(?:gml:)?${tag}>`,
    'gi',
  )
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromGmlMember(match[1]!))
    .filter((page) => page.length > 0)
}

export function pagesFromGml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = gmlRecords(trimmed, 'featureMember')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const many = gmlRecords(trimmed, 'featureMembers')
  if (many.length > 0) {
    return capPages(many)
  }
  const members = gmlRecords(trimmed, 'member')
  if (members.length > 0) {
    return capPages(members)
  }
  const points = gmlRecords(trimmed, 'Point')
  if (points.length > 0) {
    return capPages(points)
  }
  throw new Error('Tệp GML cần các mục <featureMember> / <description>.')
}

function textFromTopojsonGeometry(item: unknown): string {
  if (!item || typeof item !== 'object') {
    return ''
  }
  const rec = item as { properties?: unknown; text?: unknown; description?: unknown; name?: unknown }
  const props =
    rec.properties && typeof rec.properties === 'object'
      ? (rec.properties as { text?: unknown; description?: unknown; name?: unknown })
      : null
  const body = firstJsonString(props?.text) || firstJsonString(rec.text)
  if (body) {
    return body
  }
  const note = firstJsonString(props?.description) || firstJsonString(rec.description)
  if (note) {
    return note
  }
  const title = firstJsonString(props?.name) || firstJsonString(rec.name)
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function topojsonGeometries(data: unknown): unknown[] | null {
  if (Array.isArray(data)) {
    return data
  }
  if (!data || typeof data !== 'object') {
    return null
  }
  const rec = data as { type?: unknown; objects?: unknown; geometries?: unknown }
  if (firstJsonString(rec.type) !== 'Topology') {
    return null
  }
  if (Array.isArray(rec.geometries)) {
    return rec.geometries
  }
  const objects = rec.objects
  if (!objects || typeof objects !== 'object') {
    return []
  }
  const bags = Object.values(objects as Record<string, unknown>)
  const collected: unknown[] = []
  for (const bag of bags) {
    if (!bag || typeof bag !== 'object') {
      continue
    }
    const geom = bag as { type?: unknown; geometries?: unknown }
    if (Array.isArray(geom.geometries)) {
      collected.push(...geom.geometries)
      continue
    }
    if (firstJsonString(geom.type) === 'Point' || firstJsonString(geom.type) === 'GeometryCollection') {
      collected.push(bag)
    }
  }
  return collected
}

export function pagesFromTopojson(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed) || /^\s*\[/.test(trimmed)) {
    let data: unknown
    try {
      data = JSON.parse(trimmed)
    } catch {
      throw new Error('Tệp TopoJSON không hợp lệ.')
    }
    const geometries = topojsonGeometries(data)
    if (geometries) {
      const pages = geometries.map(textFromTopojsonGeometry).filter((page) => page.length > 0)
      if (pages.length > 0) {
        return capPages(pages)
      }
      throw new Error('Tệp TopoJSON cần các mục geometries / text.')
    }
    if (/^\s*\{/.test(trimmed)) {
      return pagesFromJson(trimmed)
    }
  }
  throw new Error('Tệp TopoJSON cần các mục geometries / text.')
}

function textFromSvgGroup(record: string): string {
  const body =
    xmlTagText(record, 'svg:desc') ||
    xmlTagText(record, 'desc') ||
    xmlTagText(record, 'svg:text') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const note = xmlTagText(record, 'svg:description') || xmlTagText(record, 'description')
  if (note) {
    return note
  }
  const title = xmlTagText(record, 'svg:title') || xmlTagText(record, 'title')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function svgRecords(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:svg:)?${tag}\\b[^>]*>([\\s\\S]*?)</(?:svg:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromSvgGroup(match[1]!))
    .filter((page) => page.length > 0)
}

export function pagesFromSvg(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = svgRecords(trimmed, 'g')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const texts = svgRecords(trimmed, 'text')
  if (texts.length > 0) {
    return capPages(texts)
  }
  throw new Error('Tệp SVG cần các mục <g> / <desc>.')
}

function unescapeDxf(value: string): string {
  return value.replace(/\|/g, '\n').trim()
}

export function pagesFromDxf(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const lines = trimmed.split(/\r?\n/)
  const pages: string[] = []
  let inText = false
  for (let index = 0; index + 1 < lines.length; index += 2) {
    const code = lines[index]!.trim()
    const value = lines[index + 1]!
    if (code === '0') {
      inText = /^(TEXT|MTEXT|ATTDEF)$/i.test(value.trim())
      continue
    }
    if (inText && (code === '1' || code === '3')) {
      const note = unescapeDxf(value)
      if (note && !/^Trang\s+\d+$/.test(note)) {
        pages.push(note)
      }
      if (code === '1') {
        inText = false
      }
    }
  }
  if (pages.length > 0) {
    return capPages(pages)
  }
  throw new Error('Tệp DXF cần các mục TEXT.')
}

function textFromMapmlFeature(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'text') ||
    xmlTagText(record, 'content')
  if (body) {
    return body
  }
  const note = xmlTagText(record, 'summary')
  if (note) {
    return note
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'title')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function mapmlRecords(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromMapmlFeature(match[1]!))
    .filter((page) => page.length > 0)
}

export function pagesFromMapml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = mapmlRecords(trimmed, 'feature')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const properties = mapmlRecords(trimmed, 'properties')
  if (properties.length > 0) {
    return capPages(properties)
  }
  throw new Error('Tệp MapML cần các mục <feature> / <description>.')
}

function textFromCityjsonObject(record: unknown): string {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return ''
  }
  const bag = record as { attributes?: unknown; name?: unknown; description?: unknown; text?: unknown }
  const attributes =
    bag.attributes && typeof bag.attributes === 'object' && !Array.isArray(bag.attributes)
      ? (bag.attributes as { description?: unknown; text?: unknown; name?: unknown })
      : undefined
  const description =
    (typeof attributes?.description === 'string' && attributes.description.trim()) ||
    (typeof bag.description === 'string' && bag.description.trim()) ||
    (typeof attributes?.text === 'string' && attributes.text.trim()) ||
    (typeof bag.text === 'string' && bag.text.trim())
  if (description) {
    return description
  }
  const name =
    (typeof attributes?.name === 'string' && attributes.name.trim()) ||
    (typeof bag.name === 'string' && bag.name.trim())
  if (name && !/^Trang\s+\d+$/.test(name)) {
    return name
  }
  return ''
}

export function pagesFromCityjson(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed) || /^\s*\[/.test(trimmed)) {
    let data: unknown
    try {
      data = JSON.parse(trimmed)
    } catch {
      throw new Error('Tệp CityJSON không hợp lệ.')
    }
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const type = (data as { type?: unknown }).type
      const objects = (data as { CityObjects?: unknown }).CityObjects
      if (type === 'CityJSON' || (objects && typeof objects === 'object' && !Array.isArray(objects))) {
        const pages = Object.values((objects && typeof objects === 'object' ? objects : {}) as Record<string, unknown>)
          .map(textFromCityjsonObject)
          .filter((page) => page.length > 0)
        if (pages.length > 0) {
          return capPages(pages)
        }
        throw new Error('Tệp CityJSON cần các mục CityObjects / description.')
      }
    }
    if (/^\s*\{/.test(trimmed)) {
      return pagesFromJson(trimmed)
    }
  }
  throw new Error('Tệp CityJSON cần các mục CityObjects / description.')
}

function textFromIndoorRecord(record: string): string {
  const body =
    xmlTagText(record, 'gml:description') ||
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title =
    xmlTagText(record, 'gml:name') || xmlTagText(record, 'name') || xmlTagText(record, 'title')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function indoorRecords(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:core:)?${tag}\\b[^>]*>([\\s\\S]*?)</(?:core:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromIndoorRecord(match[1]!))
    .filter((page) => page.length > 0)
}

export function pagesFromIndoorgml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = indoorRecords(trimmed, 'cellSpaceMember')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const cells = indoorRecords(trimmed, 'CellSpace')
  if (cells.length > 0) {
    return capPages(cells)
  }
  throw new Error('Tệp IndoorGML cần các mục <cellSpaceMember> / <description>.')
}

function textFromCitygmlRecord(record: string): string {
  const body =
    xmlTagText(record, 'gml:description') ||
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title =
    xmlTagText(record, 'gml:name') || xmlTagText(record, 'name') || xmlTagText(record, 'title')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function citygmlRecords(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:core:|bldg:)?${tag}\\b[^>]*>([\\s\\S]*?)</(?:core:|bldg:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromCitygmlRecord(match[1]!))
    .filter((page) => page.length > 0)
}

export function pagesFromCitygml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = citygmlRecords(trimmed, 'cityObjectMember')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const buildings = citygmlRecords(trimmed, 'Building')
  if (buildings.length > 0) {
    return capPages(buildings)
  }
  throw new Error('Tệp CityGML cần các mục <cityObjectMember> / <description>.')
}

function xmlAttr(record: string, name: string): string {
  const match = record.match(new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, 'i'))
  return match ? unescapeXml(match[1]!).trim() : ''
}

function textFromLandxmlRecord(record: string): string {
  const body =
    xmlTagText(record, 'Desc') ||
    xmlTagText(record, 'desc') ||
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'text') ||
    xmlAttr(record, 'desc')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlAttr(record, 'name') || xmlTagText(record, 'title')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function landxmlRecords(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:lxml:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:lxml:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromLandxmlRecord(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromLandxml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = landxmlRecords(trimmed, 'Parcel')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const points = landxmlRecords(trimmed, 'CgPoint')
  if (points.length > 0) {
    return capPages(points)
  }
  throw new Error('Tệp LandXML cần các mục <Parcel> / <Desc>.')
}

function textFromIfcxmlRecord(record: string): string {
  const body =
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'text') ||
    xmlAttr(record, 'Description')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'Name') || xmlAttr(record, 'Name') || xmlTagText(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function ifcxmlRecords(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:ifc:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:ifc:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromIfcxmlRecord(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromIfcxml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = ifcxmlRecords(trimmed, 'IfcBuilding')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const spaces = ifcxmlRecords(trimmed, 'IfcSpace')
  if (spaces.length > 0) {
    return capPages(spaces)
  }
  throw new Error('Tệp IFC-XML cần các mục <IfcBuilding> / <Description>.')
}

function textFromGbxmlRecord(record: string): string {
  const body =
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'Name') || xmlTagText(record, 'name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function gbxmlRecords(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:gb:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:gb:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromGbxmlRecord(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromGbxml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = gbxmlRecords(trimmed, 'BuildingStorey')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const spaces = gbxmlRecords(trimmed, 'Space')
  if (spaces.length > 0) {
    return capPages(spaces)
  }
  throw new Error('Tệp gbXML cần các mục <BuildingStorey> / <Description>.')
}

function textFromBcfxmlRecord(record: string): string {
  const body =
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Comment') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'Title') || xmlTagText(record, 'title') || xmlAttr(record, 'Title')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function bcfxmlRecords(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:bcf:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:bcf:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromBcfxmlRecord(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromBcfxml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = bcfxmlRecords(trimmed, 'Topic')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const comments = bcfxmlRecords(trimmed, 'Comment')
  if (comments.length > 0) {
    return capPages(comments)
  }
  throw new Error('Tệp BCF XML cần các mục <Topic> / <Description>.')
}

function textFromCobiexmlRecord(record: string): string {
  const body =
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'Name') || xmlTagText(record, 'name') || xmlAttr(record, 'Name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function cobiexmlRecords(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:cobie:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:cobie:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromCobiexmlRecord(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromCobiexml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = cobiexmlRecords(trimmed, 'Component')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const facilities = cobiexmlRecords(trimmed, 'Facility')
  if (facilities.length > 0) {
    return capPages(facilities)
  }
  throw new Error('Tệp COBie XML cần các mục <Component> / <Description>.')
}

function textFromLandinfraRecord(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function landinfraRecords(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:lif:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:lif:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromLandinfraRecord(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromLandinfra(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = landinfraRecords(trimmed, 'Feature')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const alignments = landinfraRecords(trimmed, 'Alignment')
  if (alignments.length > 0) {
    return capPages(alignments)
  }
  throw new Error('Tệp LandInfra XML cần các mục <Feature> / <description>.')
}

function textFromInfragmlRecord(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function infragmlRecords(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:infra:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:infra:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromInfragmlRecord(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromInfragml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = infragmlRecords(trimmed, 'featureMember')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const roads = infragmlRecords(trimmed, 'Road')
  if (roads.length > 0) {
    return capPages(roads)
  }
  throw new Error('Tệp InfraGML cần các mục <featureMember> / <description>.')
}

function textFromOpendriveRecord(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function opendriveRecords(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:odr:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:odr:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromOpendriveRecord(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromOpendrive(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = opendriveRecords(trimmed, 'road')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const junctions = opendriveRecords(trimmed, 'junction')
  if (junctions.length > 0) {
    return capPages(junctions)
  }
  throw new Error('Tệp OpenDRIVE cần các mục <road> / <description>.')
}

function textFromRailmlRecord(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function railmlRecords(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:rail:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:rail:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromRailmlRecord(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromRailml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = railmlRecords(trimmed, 'line')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const tracks = railmlRecords(trimmed, 'track')
  if (tracks.length > 0) {
    return capPages(tracks)
  }
  throw new Error('Tệp RailML cần các mục <line> / <description>.')
}

function textFromTransxmlRecord(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function transxmlRecords(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:txml:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:txml:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromTransxmlRecord(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromTransxml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = transxmlRecords(trimmed, 'Project')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const facilities = transxmlRecords(trimmed, 'Facility')
  if (facilities.length > 0) {
    return capPages(facilities)
  }
  throw new Error('Tệp TransXML cần các mục <Project> / <description>.')
}

function textFromDatex2Record(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function datex2Records(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:d2:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:d2:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromDatex2Record(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromDatex2(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = datex2Records(trimmed, 'situationRecord')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const situations = datex2Records(trimmed, 'situation')
  if (situations.length > 0) {
    return capPages(situations)
  }
  throw new Error('Tệp DATEX II cần các mục <situationRecord> / <description>.')
}

function textFromNetexRecord(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function netexRecords(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:netex:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:netex:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromNetexRecord(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromNetex(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = netexRecords(trimmed, 'StopPlace')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const scheduled = netexRecords(trimmed, 'ScheduledStopPoint')
  if (scheduled.length > 0) {
    return capPages(scheduled)
  }
  throw new Error('Tệp NeTEx cần các mục <StopPlace> / <description>.')
}

function textFromSiriRecord(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function siriRecords(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:siri:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:siri:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromSiriRecord(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromSiri(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = siriRecords(trimmed, 'StopPoint')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const journeys = siriRecords(trimmed, 'VehicleJourney')
  if (journeys.length > 0) {
    return capPages(journeys)
  }
  throw new Error('Tệp SIRI cần các mục <StopPoint> / <description>.')
}

function textFromTransxchangeRecord(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function transxchangeRecords(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:txc:|transxchange:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:txc:|transxchange:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromTransxchangeRecord(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromTransxchange(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = transxchangeRecords(trimmed, 'StopPoint')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const journeys = transxchangeRecords(trimmed, 'JourneyPattern')
  if (journeys.length > 0) {
    return capPages(journeys)
  }
  throw new Error('Tệp TransXChange cần các mục <StopPoint> / <description>.')
}

function textFromNaptanRecord(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function naptanRecords(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:naptan:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:naptan:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromNaptanRecord(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromNaptan(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = naptanRecords(trimmed, 'StopPoint')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const areas = naptanRecords(trimmed, 'StopArea')
  if (areas.length > 0) {
    return capPages(areas)
  }
  throw new Error('Tệp NaPTAN cần các mục <StopPoint> / <description>.')
}

function textFromGtfsRecord(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function gtfsRecords(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:gtfs:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:gtfs:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromGtfsRecord(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromGtfs(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = gtfsRecords(trimmed, 'Stop')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const routes = gtfsRecords(trimmed, 'Route')
  if (routes.length > 0) {
    return capPages(routes)
  }
  throw new Error('Tệp GTFS cần các mục <Stop> / <description>.')
}

function textFromIfoptRecord(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function ifoptRecords(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:ifopt:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:ifopt:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromIfoptRecord(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromIfopt(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = ifoptRecords(trimmed, 'StopPlace')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const points = ifoptRecords(trimmed, 'StopPoint')
  if (points.length > 0) {
    return capPages(points)
  }
  throw new Error('Tệp IFOPT cần các mục <StopPlace> / <description>.')
}

function textFromOjpRecord(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function ojpRecords(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:ojp:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:ojp:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromOjpRecord(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromOjp(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = ojpRecords(trimmed, 'StopPoint')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const trips = ojpRecords(trimmed, 'Trip')
  if (trips.length > 0) {
    return capPages(trips)
  }
  throw new Error('Tệp OJP cần các mục <StopPoint> / <description>.')
}

function textFromTriasRecord(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function triasRecords(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:trias:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:trias:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromTriasRecord(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromTrias(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = triasRecords(trimmed, 'StopPoint')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const trips = triasRecords(trimmed, 'Trip')
  if (trips.length > 0) {
    return capPages(trips)
  }
  throw new Error('Tệp TRIAS cần các mục <StopPoint> / <description>.')
}

function textFromVdv453Record(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function vdv453Records(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:vdv453:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:vdv453:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromVdv453Record(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromVdv453(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = vdv453Records(trimmed, 'IstFahrt')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const trips = vdv453Records(trimmed, 'Trip')
  if (trips.length > 0) {
    return capPages(trips)
  }
  throw new Error('Tệp VDV453 cần các mục <IstFahrt> / <description>.')
}

function textFromVdv454Record(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function vdv454Records(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:vdv454:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:vdv454:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromVdv454Record(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromVdv454(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = vdv454Records(trimmed, 'Linienfahrplan')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const trips = vdv454Records(trimmed, 'Trip')
  if (trips.length > 0) {
    return capPages(trips)
  }
  throw new Error('Tệp VDV454 cần các mục <Linienfahrplan> / <description>.')
}

function textFromVdv452Record(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function vdv452Records(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:vdv452:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:vdv452:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromVdv452Record(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromVdv452(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = vdv452Records(trimmed, 'Fahrplan')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const trips = vdv452Records(trimmed, 'Trip')
  if (trips.length > 0) {
    return capPages(trips)
  }
  throw new Error('Tệp VDV452 cần các mục <Fahrplan> / <description>.')
}

function textFromVdv462Record(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function vdv462Records(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:vdv462:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:vdv462:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromVdv462Record(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromVdv462(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = vdv462Records(trimmed, 'Haltestelle')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const trips = vdv462Records(trimmed, 'Trip')
  if (trips.length > 0) {
    return capPages(trips)
  }
  throw new Error('Tệp VDV462 cần các mục <Haltestelle> / <description>.')
}

function textFromVdv455Record(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function vdv455Records(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:vdv455:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:vdv455:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromVdv455Record(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromVdv455(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = vdv455Records(trimmed, 'Fahrt')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const trips = vdv455Records(trimmed, 'Trip')
  if (trips.length > 0) {
    return capPages(trips)
  }
  throw new Error('Tệp VDV455 cần các mục <Fahrt> / <description>.')
}

function textFromVdv731Record(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function vdv731Records(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:vdv731:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:vdv731:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromVdv731Record(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromVdv731(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = vdv731Records(trimmed, 'Anzeige')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const trips = vdv731Records(trimmed, 'Trip')
  if (trips.length > 0) {
    return capPages(trips)
  }
  throw new Error('Tệp VDV731 cần các mục <Anzeige> / <description>.')
}

function textFromVdv301Record(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function vdv301Records(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:vdv301:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:vdv301:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromVdv301Record(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromVdv301(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = vdv301Records(trimmed, 'Fahrzeug')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const trips = vdv301Records(trimmed, 'Trip')
  if (trips.length > 0) {
    return capPages(trips)
  }
  throw new Error('Tệp VDV301 cần các mục <Fahrzeug> / <description>.')
}

function textFromVdv423Record(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function vdv423Records(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:vdv423:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:vdv423:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromVdv423Record(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromVdv423(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = vdv423Records(trimmed, 'Ticket')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const trips = vdv423Records(trimmed, 'Trip')
  if (trips.length > 0) {
    return capPages(trips)
  }
  throw new Error('Tệp VDV423 cần các mục <Ticket> / <description>.')
}

function textFromVdv431Record(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function vdv431Records(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:vdv431:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:vdv431:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromVdv431Record(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromVdv431(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = vdv431Records(trimmed, 'Berechtigung')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const trips = vdv431Records(trimmed, 'Trip')
  if (trips.length > 0) {
    return capPages(trips)
  }
  throw new Error('Tệp VDV431 cần các mục <Berechtigung> / <description>.')
}

function textFromVdv300Record(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function vdv300Records(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:vdv300:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:vdv300:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromVdv300Record(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromVdv300(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = vdv300Records(trimmed, 'Objekt')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const trips = vdv300Records(trimmed, 'Trip')
  if (trips.length > 0) {
    return capPages(trips)
  }
  throw new Error('Tệp VDV300 cần các mục <Objekt> / <description>.')
}

function textFromVdv451Record(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function vdv451Records(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:vdv451:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:vdv451:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromVdv451Record(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromVdv451(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = vdv451Records(trimmed, 'Nachricht')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const trips = vdv451Records(trimmed, 'Trip')
  if (trips.length > 0) {
    return capPages(trips)
  }
  throw new Error('Tệp VDV451 cần các mục <Nachricht> / <description>.')
}

function textFromVdv432Record(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function vdv432Records(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:vdv432:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:vdv432:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromVdv432Record(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromVdv432(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = vdv432Records(trimmed, 'SAM')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const trips = vdv432Records(trimmed, 'Trip')
  if (trips.length > 0) {
    return capPages(trips)
  }
  throw new Error('Tệp VDV432 cần các mục <SAM> / <description>.')
}

function textFromVdv433Record(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function vdv433Records(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:vdv433:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:vdv433:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromVdv433Record(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromVdv433(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = vdv433Records(trimmed, 'Kontrolle')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const trips = vdv433Records(trimmed, 'Trip')
  if (trips.length > 0) {
    return capPages(trips)
  }
  throw new Error('Tệp VDV433 cần các mục <Kontrolle> / <description>.')
}

function textFromVdv434Record(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function vdv434Records(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:vdv434:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:vdv434:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromVdv434Record(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromVdv434(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = vdv434Records(trimmed, 'Sperre')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const trips = vdv434Records(trimmed, 'Trip')
  if (trips.length > 0) {
    return capPages(trips)
  }
  throw new Error('Tệp VDV434 cần các mục <Sperre> / <description>.')
}

function textFromVdv435Record(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function vdv435Records(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:vdv435:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:vdv435:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromVdv435Record(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromVdv435(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = vdv435Records(trimmed, 'Broker')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const trips = vdv435Records(trimmed, 'Trip')
  if (trips.length > 0) {
    return capPages(trips)
  }
  throw new Error('Tệp VDV435 cần các mục <Broker> / <description>.')
}

function textFromVdv436Record(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function vdv436Records(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:vdv436:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:vdv436:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromVdv436Record(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromVdv436(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = vdv436Records(trimmed, 'Plattform')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const trips = vdv436Records(trimmed, 'Trip')
  if (trips.length > 0) {
    return capPages(trips)
  }
  throw new Error('Tệp VDV436 cần các mục <Plattform> / <description>.')
}

function textFromVdv456Record(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function vdv456Records(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:vdv456:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:vdv456:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromVdv456Record(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromVdv456(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = vdv456Records(trimmed, 'Infrastruktur')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const trips = vdv456Records(trimmed, 'Trip')
  if (trips.length > 0) {
    return capPages(trips)
  }
  throw new Error('Tệp VDV456 cần các mục <Infrastruktur> / <description>.')
}

function textFromVdv457Record(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function vdv457Records(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:vdv457:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:vdv457:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromVdv457Record(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromVdv457(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = vdv457Records(trimmed, 'Zaehlung')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const trips = vdv457Records(trimmed, 'Trip')
  if (trips.length > 0) {
    return capPages(trips)
  }
  throw new Error('Tệp VDV457 cần các mục <Zaehlung> / <description>.')
}

function textFromVdv459Record(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function vdv459Records(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:vdv459:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:vdv459:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromVdv459Record(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromVdv459(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = vdv459Records(trimmed, 'Auftrag')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const trips = vdv459Records(trimmed, 'Trip')
  if (trips.length > 0) {
    return capPages(trips)
  }
  throw new Error('Tệp VDV459 cần các mục <Auftrag> / <description>.')
}

function textFromVdv461Record(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function vdv461Records(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:vdv461:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:vdv461:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromVdv461Record(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromVdv461(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = vdv461Records(trimmed, 'Betriebshof')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const trips = vdv461Records(trimmed, 'Trip')
  if (trips.length > 0) {
    return capPages(trips)
  }
  throw new Error('Tệp VDV461 cần các mục <Betriebshof> / <description>.')
}

function textFromVdv458Record(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function vdv458Records(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:vdv458:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:vdv458:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromVdv458Record(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromVdv458(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = vdv458Records(trimmed, 'Fahrplanlage')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const trips = vdv458Records(trimmed, 'Trip')
  if (trips.length > 0) {
    return capPages(trips)
  }
  throw new Error('Tệp VDV458 cần các mục <Fahrplanlage> / <description>.')
}

function textFromVdv460Record(record: string): string {
  const body =
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'Description') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'name') || xmlTagText(record, 'Name') || xmlAttr(record, 'name')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function vdv460Records(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:vdv460:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:vdv460:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromVdv460Record(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromVdv460(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = vdv460Records(trimmed, 'Anschluss')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const trips = vdv460Records(trimmed, 'Trip')
  if (trips.length > 0) {
    return capPages(trips)
  }
  throw new Error('Tệp VDV460 cần các mục <Anschluss> / <description>.')
}

function textFromXliffRecord(record: string): string {
  const body =
    xmlTagText(record, 'source') ||
    xmlTagText(record, 'xliff:source') ||
    xmlTagText(record, 'target') ||
    xmlTagText(record, 'xliff:target') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title =
    xmlTagText(record, 'name') ||
    xmlTagText(record, 'Name') ||
    xmlAttr(record, 'name') ||
    xmlAttr(record, 'original')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function xliffRecords(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:xliff:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:xliff:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromXliffRecord(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromXliff(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = xliffRecords(trimmed, 'trans-unit')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const files = xliffRecords(trimmed, 'file')
  if (files.length > 0) {
    return capPages(files)
  }
  throw new Error('Tệp XLIFF cần các mục <trans-unit> / <source>.')
}

function textFromTmxRecord(record: string): string {
  const body =
    xmlTagText(record, 'seg') ||
    xmlTagText(record, 'tmx:seg') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title =
    xmlTagText(record, 'note') ||
    xmlTagText(record, 'tmx:note') ||
    xmlTagText(record, 'name') ||
    xmlAttr(record, 'tuid')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  const plain = unescapeXml(record.replace(/<[^>]+>/g, '')).trim()
  if (plain && !/^Trang\s+\d+$/.test(plain)) {
    return plain
  }
  return ''
}

function tmxRecords(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:tmx:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:tmx:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromTmxRecord(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromTmx(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = tmxRecords(trimmed, 'tu')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const segs = tmxRecords(trimmed, 'seg')
  if (segs.length > 0) {
    return capPages(segs)
  }
  throw new Error('Tệp TMX cần các mục <tu> / <seg>.')
}

function textFromTbxRecord(record: string): string {
  const body =
    xmlTagText(record, 'term') ||
    xmlTagText(record, 'tbx:term') ||
    xmlTagText(record, 'text')
  if (body) {
    return body
  }
  const title =
    xmlTagText(record, 'note') ||
    xmlTagText(record, 'tbx:note') ||
    xmlTagText(record, 'name') ||
    xmlAttr(record, 'id')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  const plain = unescapeXml(record.replace(/<[^>]+>/g, '')).trim()
  if (plain && !/^Trang\s+\d+$/.test(plain)) {
    return plain
  }
  return ''
}

function tbxRecords(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:tbx:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:tbx:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromTbxRecord(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromTbx(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = tbxRecords(trimmed, 'termEntry')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const terms = tbxRecords(trimmed, 'term')
  if (terms.length > 0) {
    return capPages(terms)
  }
  throw new Error('Tệp TBX cần các mục <termEntry> / <term>.')
}

function unescapePo(value: string): string {
  return value
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
}

function poQuoted(value: string): string {
  return unescapePo(value).trim()
}

function textFromPoEntry(msgid: string, msgstr: string, comment: string): string {
  const body = poQuoted(msgstr) || poQuoted(msgid)
  if (body) {
    return body
  }
  const note = comment.trim()
  if (note && !/^Trang\s+\d+$/.test(note)) {
    return note
  }
  return ''
}

export function pagesFromPo(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const entryPattern =
    /(?:^|\n)(?:#\.\s*([^\n]*)\n)?msgid\s+"((?:\\.|[^"\\])*)"\s*\nmsgstr\s+"((?:\\.|[^"\\])*)"/g
  const pages = [...trimmed.matchAll(entryPattern)]
    .filter((match) => match[2] !== '')
    .map((match) => textFromPoEntry(match[2]!, match[3]!, match[1] ?? ''))
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  const msgstrOnly = [...trimmed.matchAll(/(?:^|\n)msgstr\s+"((?:\\.|[^"\\])+)"/g)]
    .map((match) => poQuoted(match[1]!))
    .filter((page) => page.length > 0)
  if (msgstrOnly.length > 0) {
    return capPages(msgstrOnly)
  }
  throw new Error('Tệp PO cần các mục msgid / msgstr.')
}

function textFromDitaRecord(record: string): string {
  const body =
    xmlTagText(record, 'p') ||
    xmlTagText(record, 'dita:p') ||
    xmlTagText(record, 'body')
  if (body) {
    return body
  }
  const title =
    xmlTagText(record, 'shortdesc') ||
    xmlTagText(record, 'title') ||
    xmlTagText(record, 'dita:title') ||
    xmlAttr(record, 'id')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  const plain = unescapeXml(record.replace(/<[^>]+>/g, '')).trim()
  if (plain && !/^Trang\s+\d+$/.test(plain)) {
    return plain
  }
  return ''
}

function ditaRecords(trimmed: string, tag: string): string[] {
  const pattern = new RegExp(`<(?:dita:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:dita:)?${tag}>`, 'gi')
  return [...trimmed.matchAll(pattern)]
    .map((match) => textFromDitaRecord(`${match[1]!} ${match[2]!}`))
    .filter((page) => page.length > 0)
}

export function pagesFromDita(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pages = ditaRecords(trimmed, 'topic')
  if (pages.length > 0) {
    return capPages(pages)
  }
  const paras = ditaRecords(trimmed, 'p')
  if (paras.length > 0) {
    return capPages(paras)
  }
  throw new Error('Tệp DITA cần các mục <topic> / <p>.')
}

function unescapeVcard(value: string): string {
  return value
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
}

function vcardField(block: string, name: string): string {
  const pattern = new RegExp(`(?:^|\\n)${name}(?:;[^\n:]*)?:([^\\n]*)`, 'i')
  const match = block.match(pattern)
  return match ? unescapeVcard(match[1]!.trim()) : ''
}

function textFromVcard(block: string): string {
  const note = vcardField(block, 'NOTE')
  if (note) {
    return note
  }
  const fn = vcardField(block, 'FN')
  if (fn && !/^Trang\s+\d+$/.test(fn)) {
    return fn
  }
  const n = vcardField(block, 'N')
  if (n && !/^Trang\s+\d+$/.test(n)) {
    return n
  }
  return ''
}

export function pagesFromVcard(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const blocks = [...trimmed.matchAll(/BEGIN:VCARD([\s\S]*?)END:VCARD/gi)]
    .map((match) => textFromVcard(match[1]!))
    .filter((page) => page.length > 0)
  if (blocks.length > 0) {
    return capPages(blocks)
  }
  const notes = [...trimmed.matchAll(/(?:^|\n)NOTE(?:;[^\n:]*)?:([^\n]+)/gi)]
    .map((match) => unescapeVcard(match[1]!.trim()))
    .filter((page) => page.length > 0)
  if (notes.length > 0) {
    return capPages(notes)
  }
  throw new Error('Tệp vCard cần các mục NOTE / FN.')
}

function textFromRdfRecord(record: string): string {
  const body =
    xmlTagText(record, 'dc:description') ||
    xmlTagText(record, 'description') ||
    xmlTagText(record, 'rdfs:comment')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'dc:title') || xmlTagText(record, 'title')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  const plain = unescapeXml(record.replace(/<[^>]+>/g, '')).trim()
  if (plain && !/^Trang\s+\d+$/.test(plain)) {
    return plain
  }
  return ''
}

export function pagesFromRdf(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [
    ...trimmed.matchAll(/<(?:rdf:)?Description\b[^>]*>([\s\S]*?)<\/(?:rdf:)?Description>/gi),
  ]
  const pages = records
    .map((match) => textFromRdfRecord(match[1]!))
    .filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  const descriptions = [
    ...trimmed.matchAll(/<(?:dc:)?description\b[^>]*>([\s\S]*?)<\/(?:dc:)?description>/gi),
  ]
    .map((match) => unescapeXml(match[1]!.replace(/<[^>]+>/g, '')).trim())
    .filter((page) => page.length > 0)
  if (descriptions.length > 0) {
    return capPages(descriptions)
  }
  throw new Error('Tệp RDF cần các mục <rdf:Description> / <dc:description>.')
}

function textFromOpdsEntry(record: string): string {
  const body =
    xmlTagText(record, 'content') ||
    xmlTagText(record, 'summary') ||
    xmlTagText(record, 'opds:content')
  if (body) {
    return body
  }
  const title = xmlTagText(record, 'title') || xmlTagText(record, 'atom:title')
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  const plain = unescapeXml(record.replace(/<[^>]+>/g, '')).trim()
  if (plain && !/^Trang\s+\d+$/.test(plain)) {
    return plain
  }
  return ''
}

export function pagesFromOpds(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const entries = [...trimmed.matchAll(/<(?:atom:)?entry\b[^>]*>([\s\S]*?)<\/(?:atom:)?entry>/gi)]
    .map((match) => textFromOpdsEntry(match[1]!))
    .filter((page) => page.length > 0)
  if (entries.length > 0) {
    return capPages(entries)
  }
  const contents = [
    ...trimmed.matchAll(/<(?:atom:)?content\b[^>]*>([\s\S]*?)<\/(?:atom:)?content>/gi),
  ]
    .map((match) => unescapeXml(match[1]!.replace(/<[^>]+>/g, '')).trim())
    .filter((page) => page.length > 0)
  if (contents.length > 0) {
    return capPages(contents)
  }
  throw new Error('Tệp OPDS cần các mục <entry> / <content>.')
}

function textFromVtodo(block: string): string {
  const description = icsField(block, 'DESCRIPTION')
  if (description) {
    return description
  }
  const summary = icsField(block, 'SUMMARY')
  if (summary && !/^Trang\s+\d+$/.test(summary)) {
    return summary
  }
  return ''
}

export function pagesFromVtodo(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const unfolded = unfoldIcs(trimmed)
  if (/BEGIN:VTODO/i.test(unfolded)) {
    const pages = unfolded
      .split(/BEGIN:VTODO/i)
      .slice(1)
      .map((chunk) => {
        const block = chunk.split(/END:VTODO/i)[0] ?? ''
        return textFromVtodo(block)
      })
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  const descriptions = [...unfolded.matchAll(/(?:^|\n)DESCRIPTION[;:]([^\n]*)/gi)]
    .map((match) => unescapeIcs(match[1]!.trim()))
    .filter((page) => page.length > 0)
  if (descriptions.length > 0) {
    return capPages(descriptions)
  }
  throw new Error('Tệp việc cần các mục VTODO / DESCRIPTION.')
}

function textFromVjournal(block: string): string {
  const description = icsField(block, 'DESCRIPTION')
  if (description) {
    return description
  }
  const summary = icsField(block, 'SUMMARY')
  if (summary && !/^Trang\s+\d+$/.test(summary)) {
    return summary
  }
  return ''
}

export function pagesFromVjournal(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const unfolded = unfoldIcs(trimmed)
  if (/BEGIN:VJOURNAL/i.test(unfolded)) {
    const pages = unfolded
      .split(/BEGIN:VJOURNAL/i)
      .slice(1)
      .map((chunk) => {
        const block = chunk.split(/END:VJOURNAL/i)[0] ?? ''
        return textFromVjournal(block)
      })
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  const descriptions = [...unfolded.matchAll(/(?:^|\n)DESCRIPTION[;:]([^\n]*)/gi)]
    .map((match) => unescapeIcs(match[1]!.trim()))
    .filter((page) => page.length > 0)
  if (descriptions.length > 0) {
    return capPages(descriptions)
  }
  throw new Error('Tệp nhật ký cần các mục VJOURNAL / DESCRIPTION.')
}

function textFromVfreebusy(block: string): string {
  const comment = icsField(block, 'COMMENT')
  if (comment) {
    return comment
  }
  const description = icsField(block, 'DESCRIPTION')
  if (description) {
    return description
  }
  const summary = icsField(block, 'SUMMARY')
  if (summary && !/^Trang\s+\d+$/.test(summary)) {
    return summary
  }
  return ''
}

export function pagesFromVfreebusy(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const unfolded = unfoldIcs(trimmed)
  if (/BEGIN:VFREEBUSY/i.test(unfolded)) {
    const pages = unfolded
      .split(/BEGIN:VFREEBUSY/i)
      .slice(1)
      .map((chunk) => {
        const block = chunk.split(/END:VFREEBUSY/i)[0] ?? ''
        return textFromVfreebusy(block)
      })
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  const comments = [...unfolded.matchAll(/(?:^|\n)COMMENT[;:]([^\n]*)/gi)]
    .map((match) => unescapeIcs(match[1]!.trim()))
    .filter((page) => page.length > 0)
  if (comments.length > 0) {
    return capPages(comments)
  }
  throw new Error('Tệp bận rỗi cần các mục VFREEBUSY / COMMENT.')
}

function textFromVavailability(block: string): string {
  const comment = icsField(block, 'COMMENT')
  if (comment) {
    return comment
  }
  const description = icsField(block, 'DESCRIPTION')
  if (description) {
    return description
  }
  const summary = icsField(block, 'SUMMARY')
  if (summary && !/^Trang\s+\d+$/.test(summary)) {
    return summary
  }
  return ''
}

export function pagesFromVavailability(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const unfolded = unfoldIcs(trimmed)
  if (/BEGIN:VAVAILABILITY/i.test(unfolded)) {
    const pages = unfolded
      .split(/BEGIN:VAVAILABILITY/i)
      .slice(1)
      .map((chunk) => {
        const block = chunk.split(/END:VAVAILABILITY/i)[0] ?? ''
        return textFromVavailability(block)
      })
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  const comments = [...unfolded.matchAll(/(?:^|\n)COMMENT[;:]([^\n]*)/gi)]
    .map((match) => unescapeIcs(match[1]!.trim()))
    .filter((page) => page.length > 0)
  if (comments.length > 0) {
    return capPages(comments)
  }
  throw new Error('Tệp khoảng rảnh cần các mục VAVAILABILITY / COMMENT.')
}

function textFromVtimezone(block: string): string {
  const comment = icsField(block, 'COMMENT')
  if (comment) {
    return comment
  }
  const description = icsField(block, 'DESCRIPTION')
  if (description) {
    return description
  }
  const summary = icsField(block, 'SUMMARY')
  if (summary && !/^Trang\s+\d+$/.test(summary)) {
    return summary
  }
  return ''
}

export function pagesFromVtimezone(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const unfolded = unfoldIcs(trimmed)
  if (/BEGIN:VTIMEZONE/i.test(unfolded)) {
    const pages = unfolded
      .split(/BEGIN:VTIMEZONE/i)
      .slice(1)
      .map((chunk) => {
        const block = chunk.split(/END:VTIMEZONE/i)[0] ?? ''
        return textFromVtimezone(block)
      })
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  const comments = [...unfolded.matchAll(/(?:^|\n)COMMENT[;:]([^\n]*)/gi)]
    .map((match) => unescapeIcs(match[1]!.trim()))
    .filter((page) => page.length > 0)
  if (comments.length > 0) {
    return capPages(comments)
  }
  throw new Error('Tệp múi giờ cần các mục VTIMEZONE / COMMENT.')
}

function textFromValarm(block: string): string {
  const description = icsField(block, 'DESCRIPTION')
  if (description) {
    return description
  }
  const comment = icsField(block, 'COMMENT')
  if (comment) {
    return comment
  }
  const summary = icsField(block, 'SUMMARY')
  if (summary && !/^Trang\s+\d+$/.test(summary)) {
    return summary
  }
  return ''
}

export function pagesFromValarm(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const unfolded = unfoldIcs(trimmed)
  if (/BEGIN:VALARM/i.test(unfolded)) {
    const pages = unfolded
      .split(/BEGIN:VALARM/i)
      .slice(1)
      .map((chunk) => {
        const block = chunk.split(/END:VALARM/i)[0] ?? ''
        return textFromValarm(block)
      })
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  const descriptions = [...unfolded.matchAll(/(?:^|\n)DESCRIPTION[;:]([^\n]*)/gi)]
    .map((match) => unescapeIcs(match[1]!.trim()))
    .filter((page) => page.length > 0)
  if (descriptions.length > 0) {
    return capPages(descriptions)
  }
  throw new Error('Tệp báo thức cần các mục VALARM / DESCRIPTION.')
}

function textFromVevent(block: string): string {
  const description = icsField(block, 'DESCRIPTION')
  if (description) {
    return description
  }
  const comment = icsField(block, 'COMMENT')
  if (comment) {
    return comment
  }
  const summary = icsField(block, 'SUMMARY')
  if (summary && !/^Trang\s+\d+$/.test(summary)) {
    return summary
  }
  return ''
}

export function pagesFromVevent(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const unfolded = unfoldIcs(trimmed)
  if (/BEGIN:VEVENT/i.test(unfolded)) {
    const pages = unfolded
      .split(/BEGIN:VEVENT/i)
      .slice(1)
      .map((chunk) => {
        const block = chunk.split(/END:VEVENT/i)[0] ?? ''
        return textFromVevent(block)
      })
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  const descriptions = [...unfolded.matchAll(/(?:^|\n)DESCRIPTION[;:]([^\n]*)/gi)]
    .map((match) => unescapeIcs(match[1]!.trim()))
    .filter((page) => page.length > 0)
  if (descriptions.length > 0) {
    return capPages(descriptions)
  }
  throw new Error('Tệp sự kiện cần các mục VEVENT / DESCRIPTION.')
}

function textFromXcal(record: string): string {
  const description = xmlTagText(record, 'description')
  if (description) {
    return description
  }
  const comment = xmlTagText(record, 'comment')
  if (comment) {
    return comment
  }
  const summary = xmlTagText(record, 'summary')
  if (summary && !/^Trang\s+\d+$/.test(summary)) {
    return summary
  }
  return ''
}

export function pagesFromXcal(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  if (/<vevent\b/i.test(trimmed)) {
    const pages = [...trimmed.matchAll(/<vevent\b[^>]*>([\s\S]*?)<\/vevent>/gi)]
      .map((match) => textFromXcal(match[1]!))
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  const descriptions = [...trimmed.matchAll(/<description\b[^>]*>([\s\S]*?)<\/description>/gi)]
    .map((match) => unescapeXml(match[1]!.replace(/<[^>]+>/g, '')).trim())
    .filter((page) => page.length > 0)
  if (descriptions.length > 0) {
    return capPages(descriptions)
  }
  throw new Error('Tệp xCal cần các mục vevent / description.')
}

function jcalText(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim()
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim()
  }
  return ''
}

function jcalPropValue(properties: unknown, name: string): string {
  if (!Array.isArray(properties)) {
    return ''
  }
  for (const entry of properties) {
    if (!Array.isArray(entry) || typeof entry[0] !== 'string') {
      continue
    }
    if (entry[0].toLowerCase() !== name) {
      continue
    }
    return jcalText(entry[3])
  }
  return ''
}

function textFromJcal(properties: unknown): string {
  const description = jcalPropValue(properties, 'description')
  if (description) {
    return description
  }
  const comment = jcalPropValue(properties, 'comment')
  if (comment) {
    return comment
  }
  const summary = jcalPropValue(properties, 'summary')
  if (summary && !/^Trang\s+\d+$/.test(summary)) {
    return summary
  }
  return ''
}

function walkJcalComponents(components: unknown, into: string[]): void {
  if (!Array.isArray(components)) {
    return
  }
  for (const component of components) {
    if (!Array.isArray(component) || typeof component[0] !== 'string') {
      continue
    }
    const name = component[0].toLowerCase()
    if (name === 'vevent') {
      const page = textFromJcal(component[1])
      if (page) {
        into.push(page)
      }
      continue
    }
    if (name === 'vcalendar' || name === 'icalendar') {
      continue
    }
    walkJcalComponents(component[2], into)
  }
}

function collectJcalDescriptions(node: unknown, into: string[]): void {
  if (!Array.isArray(node)) {
    return
  }
  if (typeof node[0] === 'string' && node[0].toLowerCase() === 'description') {
    const value = jcalText(node[3])
    if (value) {
      into.push(value)
    }
    return
  }
  for (const child of node) {
    collectJcalDescriptions(child, into)
  }
}

export function pagesFromJcal(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch {
    throw new Error('Tệp jCal cần các mục vevent / description.')
  }
  if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
    const pages: string[] = []
    const name = parsed[0].toLowerCase()
    if (name === 'vevent') {
      const page = textFromJcal(parsed[1])
      if (page) {
        pages.push(page)
      }
    } else if (name === 'vcalendar') {
      walkJcalComponents(parsed[2], pages)
    }
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  const descriptions: string[] = []
  collectJcalDescriptions(parsed, descriptions)
  if (descriptions.length > 0) {
    return capPages(descriptions)
  }
  throw new Error('Tệp jCal cần các mục vevent / description.')
}

function jcardText(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim()
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim()
  }
  if (Array.isArray(value)) {
    return value
      .map((part) => jcardText(part))
      .filter((part) => part.length > 0)
      .join(' ')
      .trim()
  }
  return ''
}

function jcardPropValue(properties: unknown, name: string): string {
  if (!Array.isArray(properties)) {
    return ''
  }
  for (const entry of properties) {
    if (!Array.isArray(entry) || typeof entry[0] !== 'string') {
      continue
    }
    if (entry[0].toLowerCase() !== name) {
      continue
    }
    return jcardText(entry[3])
  }
  return ''
}

function textFromJcard(properties: unknown): string {
  const note = jcardPropValue(properties, 'note')
  if (note) {
    return note
  }
  const fn = jcardPropValue(properties, 'fn')
  if (fn && !/^Trang\s+\d+$/.test(fn)) {
    return fn
  }
  const n = jcardPropValue(properties, 'n')
  if (n && !/^Trang\s+\d+$/.test(n)) {
    return n
  }
  return ''
}

function walkJcardComponents(node: unknown, into: string[]): void {
  if (!Array.isArray(node)) {
    return
  }
  if (typeof node[0] === 'string' && node[0].toLowerCase() === 'vcard') {
    const page = textFromJcard(node[1])
    if (page) {
      into.push(page)
    }
    return
  }
  for (const child of node) {
    if (Array.isArray(child) && typeof child[0] === 'string' && child[0].toLowerCase() === 'vcard') {
      const page = textFromJcard(child[1])
      if (page) {
        into.push(page)
      }
    }
  }
}

function collectJcardNotes(node: unknown, into: string[]): void {
  if (!Array.isArray(node)) {
    return
  }
  if (typeof node[0] === 'string' && node[0].toLowerCase() === 'note') {
    const value = jcardText(node[3])
    if (value) {
      into.push(value)
    }
    return
  }
  for (const child of node) {
    collectJcardNotes(child, into)
  }
}

export function pagesFromJcard(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch {
    throw new Error('Tệp jCard cần các mục vcard / note.')
  }
  const pages: string[] = []
  walkJcardComponents(parsed, pages)
  if (pages.length > 0) {
    return capPages(pages)
  }
  const notes: string[] = []
  collectJcardNotes(parsed, notes)
  if (notes.length > 0) {
    return capPages(notes)
  }
  throw new Error('Tệp jCard cần các mục vcard / note.')
}

function textFromXcard(record: string): string {
  const note = xmlTagText(record, 'note')
  if (note) {
    return note
  }
  const fn = xmlTagText(record, 'fn')
  if (fn && !/^Trang\s+\d+$/.test(fn)) {
    return fn
  }
  const n = xmlTagText(record, 'n')
  if (n && !/^Trang\s+\d+$/.test(n)) {
    return n
  }
  return ''
}

export function pagesFromXcard(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  if (/<vcard\b/i.test(trimmed)) {
    const pages = [...trimmed.matchAll(/<vcard\b[^>]*>([\s\S]*?)<\/vcard>/gi)]
      .map((match) => textFromXcard(match[1]!))
      .filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  const notes = [...trimmed.matchAll(/<note\b[^>]*>([\s\S]*?)<\/note>/gi)]
    .map((match) => unescapeXml(match[1]!.replace(/<[^>]+>/g, '')).trim())
    .filter((page) => page.length > 0)
  if (notes.length > 0) {
    return capPages(notes)
  }
  throw new Error('Tệp xCard cần các mục vcard / note.')
}

function htmlClassText(record: string, className: string): string {
  const match = record.match(
    new RegExp(
      `<[^>]*class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>([\\s\\S]*?)</[^>]+>`,
      'i',
    ),
  )
  if (!match) {
    return ''
  }
  return unescapeHtmlEntities(match[1]!.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')).trim()
}

function textFromHcard(record: string): string {
  const note = htmlClassText(record, 'note') || htmlClassText(record, 'p-note')
  if (note) {
    return note
  }
  const fn = htmlClassText(record, 'fn') || htmlClassText(record, 'p-name')
  if (fn && !/^Trang\s+\d+$/.test(fn)) {
    return fn
  }
  const n =
    htmlClassText(record, 'family-name') ||
    htmlClassText(record, 'p-family-name') ||
    htmlClassText(record, 'n')
  if (n && !/^Trang\s+\d+$/.test(n)) {
    return n
  }
  return ''
}

export function pagesFromHcard(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const cards = [
    ...trimmed.matchAll(
      /<(?:div|article|section|span)[^>]*class=["'][^"']*\b(?:vcard|h-card)\b[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|article|section|span)>/gi,
    ),
  ]
    .map((match) => textFromHcard(match[1]!))
    .filter((page) => page.length > 0)
  if (cards.length > 0) {
    return capPages(cards)
  }
  const notes = [
    ...trimmed.matchAll(
      /<[^>]*class=["'][^"']*\b(?:note|p-note)\b[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/gi,
    ),
  ]
    .map((match) =>
      unescapeHtmlEntities(match[1]!.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')).trim(),
    )
    .filter((page) => page.length > 0)
  if (notes.length > 0) {
    return capPages(notes)
  }
  throw new Error('Tệp hCard cần các mục vcard / note.')
}

function textFromHcal(record: string): string {
  const description =
    htmlClassText(record, 'description') || htmlClassText(record, 'p-description')
  if (description) {
    return description
  }
  const summary = htmlClassText(record, 'summary') || htmlClassText(record, 'p-summary')
  if (summary && !/^Trang\s+\d+$/.test(summary)) {
    return summary
  }
  return ''
}

export function pagesFromHcal(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const events = [
    ...trimmed.matchAll(
      /<(?:div|article|section|span)[^>]*class=["'][^"']*\b(?:vevent|h-event)\b[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|article|section|span)>/gi,
    ),
  ]
    .map((match) => textFromHcal(match[1]!))
    .filter((page) => page.length > 0)
  if (events.length > 0) {
    return capPages(events)
  }
  const descriptions = [
    ...trimmed.matchAll(
      /<[^>]*class=["'][^"']*\b(?:description|p-description)\b[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/gi,
    ),
  ]
    .map((match) =>
      unescapeHtmlEntities(match[1]!.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')).trim(),
    )
    .filter((page) => page.length > 0)
  if (descriptions.length > 0) {
    return capPages(descriptions)
  }
  throw new Error('Tệp hCal cần các mục vevent / description.')
}

function jscalText(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim()
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim()
  }
  return ''
}

function textFromJscal(record: Record<string, unknown>): string {
  const description = jscalText(record.description)
  if (description) {
    return description
  }
  const title = jscalText(record.title)
  if (title && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

function jscalTypeOf(record: Record<string, unknown>): string {
  return jscalText(record['@type']).toLowerCase()
}

function collectJscalPages(node: unknown, into: string[]): void {
  if (!node || typeof node !== 'object' || Array.isArray(node)) {
    return
  }
  const record = node as Record<string, unknown>
  const type = jscalTypeOf(record)
  if (type === 'event') {
    const page = textFromJscal(record)
    if (page) {
      into.push(page)
    }
    return
  }
  if (type === 'group' && Array.isArray(record.entries)) {
    for (const entry of record.entries) {
      collectJscalPages(entry, into)
    }
  }
}

export function pagesFromJscal(text: string): string[] {
  const trimmed = assertImportBudget(text)
  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch {
    throw new Error('Tệp JSCalendar cần các mục Event / description.')
  }
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const record = parsed as Record<string, unknown>
    const type = jscalTypeOf(record)
    if (type === 'event' || type === 'group') {
      const pages: string[] = []
      collectJscalPages(record, pages)
      if (pages.length > 0) {
        return capPages(pages)
      }
      throw new Error('Tệp JSCalendar cần các mục Event / description.')
    }
    if ('pages' in record) {
      return pagesFromJson(trimmed)
    }
  }
  throw new Error('Tệp JSCalendar cần các mục Event / description.')
}

function textFromDtbook(record: string): string {
  const paras = [...record.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => unescapeXml(match[1]!.replace(/<[^>]+>/g, '')).trim())
    .filter((page) => page.length > 0)
  if (paras.length > 0) {
    return paras.join('\n')
  }
  const heading = xmlTagText(record, 'h1') || xmlTagText(record, 'h2') || xmlTagText(record, 'title')
  if (heading && !/^Trang\s+\d+$/.test(heading)) {
    return heading
  }
  return ''
}

export function pagesFromDtbook(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const levels = [...trimmed.matchAll(/<level1\b[^>]*>([\s\S]*?)<\/level1>/gi)]
    .map((match) => textFromDtbook(match[1]!))
    .filter((page) => page.length > 0)
  if (levels.length > 0) {
    return capPages(levels)
  }
  const paras = [...trimmed.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => unescapeXml(match[1]!.replace(/<[^>]+>/g, '')).trim())
    .filter((page) => page.length > 0)
  if (paras.length > 0) {
    return capPages(paras)
  }
  throw new Error('Tệp DTBook cần các mục level1 / p.')
}

function textFromSsmlPara(record: string): string {
  const sentences = [...record.matchAll(/<s\b[^>]*>([\s\S]*?)<\/s>/gi)]
    .map((match) => unescapeXml(match[1]!.replace(/<[^>]+>/g, '')).trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (sentences.length > 0) {
    return sentences.join('\n')
  }
  const body = unescapeXml(record.replace(/<[^>]+>/g, '')).trim()
  if (body && !/^Trang\s+\d+$/.test(body)) {
    return body
  }
  return ''
}

export function pagesFromSsml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const paras = [...trimmed.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => textFromSsmlPara(match[1]!))
    .filter((page) => page.length > 0)
  if (paras.length > 0) {
    return capPages(paras)
  }
  const sentences = [...trimmed.matchAll(/<s\b[^>]*>([\s\S]*?)<\/s>/gi)]
    .map((match) => unescapeXml(match[1]!.replace(/<[^>]+>/g, '')).trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (sentences.length > 0) {
    return capPages(sentences)
  }
  throw new Error('Tệp SSML cần các mục p / s.')
}

function textFromMathmlRow(record: string): string {
  const texts = [...record.matchAll(/<mtext\b[^>]*>([\s\S]*?)<\/mtext>/gi)]
    .map((match) => unescapeXml(match[1]!.replace(/<[^>]+>/g, '')).trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (texts.length > 0) {
    return texts.join('\n')
  }
  const body = unescapeXml(record.replace(/<[^>]+>/g, '')).trim()
  if (body && !/^Trang\s+\d+$/.test(body)) {
    return body
  }
  return ''
}

export function pagesFromMathml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const rows = [...trimmed.matchAll(/<mrow\b[^>]*>([\s\S]*?)<\/mrow>/gi)]
    .map((match) => textFromMathmlRow(match[1]!))
    .filter((page) => page.length > 0)
  if (rows.length > 0) {
    return capPages(rows)
  }
  const texts = [...trimmed.matchAll(/<mtext\b[^>]*>([\s\S]*?)<\/mtext>/gi)]
    .map((match) => unescapeXml(match[1]!.replace(/<[^>]+>/g, '')).trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (texts.length > 0) {
    return capPages(texts)
  }
  throw new Error('Tệp MathML cần các mục mrow / mtext.')
}

function textFromVxmlForm(record: string): string {
  const prompts = [...record.matchAll(/<prompt\b[^>]*>([\s\S]*?)<\/prompt>/gi)]
    .map((match) => unescapeXml(match[1]!.replace(/<[^>]+>/g, '')).trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (prompts.length > 0) {
    return prompts.join('\n')
  }
  const body = unescapeXml(record.replace(/<[^>]+>/g, '')).trim()
  if (body && !/^Trang\s+\d+$/.test(body)) {
    return body
  }
  return ''
}

export function pagesFromVxml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const forms = [...trimmed.matchAll(/<form\b[^>]*>([\s\S]*?)<\/form>/gi)]
    .map((match) => textFromVxmlForm(match[1]!))
    .filter((page) => page.length > 0)
  if (forms.length > 0) {
    return capPages(forms)
  }
  const prompts = [...trimmed.matchAll(/<prompt\b[^>]*>([\s\S]*?)<\/prompt>/gi)]
    .map((match) => unescapeXml(match[1]!.replace(/<[^>]+>/g, '')).trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (prompts.length > 0) {
    return capPages(prompts)
  }
  throw new Error('Tệp VoiceXML cần các mục form / prompt.')
}

function textFromPlsLexeme(record: string): string {
  const phonemes = [...record.matchAll(/<phoneme\b[^>]*>([\s\S]*?)<\/phoneme>/gi)]
    .map((match) => unescapeXml(match[1]!.replace(/<[^>]+>/g, '')).trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (phonemes.length > 0) {
    return phonemes.join('\n')
  }
  const graphemes = [...record.matchAll(/<grapheme\b[^>]*>([\s\S]*?)<\/grapheme>/gi)]
    .map((match) => unescapeXml(match[1]!.replace(/<[^>]+>/g, '')).trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (graphemes.length > 0) {
    return graphemes.join('\n')
  }
  const body = unescapeXml(record.replace(/<[^>]+>/g, '')).trim()
  if (body && !/^Trang\s+\d+$/.test(body)) {
    return body
  }
  return ''
}

export function pagesFromPls(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const lexemes = [...trimmed.matchAll(/<lexeme\b[^>]*>([\s\S]*?)<\/lexeme>/gi)]
    .map((match) => textFromPlsLexeme(match[1]!))
    .filter((page) => page.length > 0)
  if (lexemes.length > 0) {
    return capPages(lexemes)
  }
  const phonemes = [...trimmed.matchAll(/<phoneme\b[^>]*>([\s\S]*?)<\/phoneme>/gi)]
    .map((match) => unescapeXml(match[1]!.replace(/<[^>]+>/g, '')).trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (phonemes.length > 0) {
    return capPages(phonemes)
  }
  throw new Error('Tệp PLS cần các mục lexeme / phoneme.')
}

function textFromMusicxmlMeasure(record: string): string {
  const words = [...record.matchAll(/<words\b[^>]*>([\s\S]*?)<\/words>/gi)]
    .map((match) => unescapeXml(match[1]!.replace(/<[^>]+>/g, '')).trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (words.length > 0) {
    return words.join('\n')
  }
  const lyrics = [...record.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/gi)]
    .map((match) => unescapeXml(match[1]!.replace(/<[^>]+>/g, '')).trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (lyrics.length > 0) {
    return lyrics.join('\n')
  }
  const body = unescapeXml(record.replace(/<[^>]+>/g, '')).trim()
  if (body && !/^Trang\s+\d+$/.test(body)) {
    return body
  }
  return ''
}

export function pagesFromMusicxml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const measures = [...trimmed.matchAll(/<measure\b[^>]*>([\s\S]*?)<\/measure>/gi)]
    .map((match) => textFromMusicxmlMeasure(match[1]!))
    .filter((page) => page.length > 0)
  if (measures.length > 0) {
    return capPages(measures)
  }
  const words = [...trimmed.matchAll(/<words\b[^>]*>([\s\S]*?)<\/words>/gi)]
    .map((match) => unescapeXml(match[1]!.replace(/<[^>]+>/g, '')).trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (words.length > 0) {
    return capPages(words)
  }
  throw new Error('Tệp MusicXML cần các mục measure / words.')
}

function textFromMeiMeasure(record: string): string {
  const dirs = [...record.matchAll(/<dir\b[^>]*>([\s\S]*?)<\/dir>/gi)]
    .map((match) => unescapeXml(match[1]!.replace(/<[^>]+>/g, '')).trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (dirs.length > 0) {
    return dirs.join('\n')
  }
  const annots = [...record.matchAll(/<annot\b[^>]*>([\s\S]*?)<\/annot>/gi)]
    .map((match) => unescapeXml(match[1]!.replace(/<[^>]+>/g, '')).trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (annots.length > 0) {
    return annots.join('\n')
  }
  const body = unescapeXml(record.replace(/<[^>]+>/g, '')).trim()
  if (body && !/^Trang\s+\d+$/.test(body)) {
    return body
  }
  return ''
}

export function pagesFromMei(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const measures = [...trimmed.matchAll(/<measure\b[^>]*>([\s\S]*?)<\/measure>/gi)]
    .map((match) => textFromMeiMeasure(match[1]!))
    .filter((page) => page.length > 0)
  if (measures.length > 0) {
    return capPages(measures)
  }
  const dirs = [...trimmed.matchAll(/<dir\b[^>]*>([\s\S]*?)<\/dir>/gi)]
    .map((match) => unescapeXml(match[1]!.replace(/<[^>]+>/g, '')).trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (dirs.length > 0) {
    return capPages(dirs)
  }
  throw new Error('Tệp MEI cần các mục measure / dir.')
}

function textFromAbcTune(record: string): string {
  const words = [...record.matchAll(/^W:(.*)$/gm)]
    .map((match) => match[1]!.trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (words.length > 0) {
    return words.join('\n')
  }
  return ''
}

export function pagesFromAbc(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const chunks = trimmed
    .split(/(?=^X:\s*\d+)/m)
    .filter((chunk) => /^X:\s*\d+/m.test(chunk))
  const pages = chunks.map((chunk) => textFromAbcTune(chunk)).filter((page) => page.length > 0)
  if (pages.length > 0) {
    return capPages(pages)
  }
  const words = [...trimmed.matchAll(/^W:(.*)$/gm)]
    .map((match) => match[1]!.trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (words.length > 0) {
    return capPages(words)
  }
  throw new Error('Tệp ABC cần các mục X: / W:.')
}

function textFromSmilPar(record: string): string {
  const texts = [...record.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/gi)]
    .map((match) => unescapeXml(match[1]!.replace(/<[^>]+>/g, '')).trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (texts.length > 0) {
    return texts.join('\n')
  }
  const body = unescapeXml(record.replace(/<[^>]+>/g, '')).trim()
  if (body && !/^Trang\s+\d+$/.test(body)) {
    return body
  }
  return ''
}

export function pagesFromSmil(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const pars = [...trimmed.matchAll(/<par\b[^>]*>([\s\S]*?)<\/par>/gi)]
    .map((match) => textFromSmilPar(match[1]!))
    .filter((page) => page.length > 0)
  if (pars.length > 0) {
    return capPages(pars)
  }
  const texts = [...trimmed.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/gi)]
    .map((match) => unescapeXml(match[1]!.replace(/<[^>]+>/g, '')).trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (texts.length > 0) {
    return capPages(texts)
  }
  throw new Error('Tệp SMIL cần các mục par / text.')
}

function textFromGraphmlNode(record: string): string {
  const texts = [...record.matchAll(/<data\b[^>]*\bkey\s*=\s*["']text["'][^>]*>([\s\S]*?)<\/data>/gi)]
    .map((match) => unescapeXml(match[1]!.replace(/<[^>]+>/g, '')).trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (texts.length > 0) {
    return texts.join('\n')
  }
  const labels = [...record.matchAll(/<data\b[^>]*\bkey\s*=\s*["']label["'][^>]*>([\s\S]*?)<\/data>/gi)]
    .map((match) => unescapeXml(match[1]!.replace(/<[^>]+>/g, '')).trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (labels.length > 0) {
    return labels.join('\n')
  }
  const body = unescapeXml(record.replace(/<[^>]+>/g, '')).trim()
  if (body && !/^Trang\s+\d+$/.test(body)) {
    return body
  }
  return ''
}

export function pagesFromGraphml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const nodes = [...trimmed.matchAll(/<node\b[^>]*>([\s\S]*?)<\/node>/gi)]
    .map((match) => textFromGraphmlNode(match[1]!))
    .filter((page) => page.length > 0)
  if (nodes.length > 0) {
    return capPages(nodes)
  }
  const texts = [...trimmed.matchAll(/<data\b[^>]*\bkey\s*=\s*["']text["'][^>]*>([\s\S]*?)<\/data>/gi)]
    .map((match) => unescapeXml(match[1]!.replace(/<[^>]+>/g, '')).trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (texts.length > 0) {
    return capPages(texts)
  }
  throw new Error('Tệp GraphML cần các mục node / data.')
}

function unescapeDotLabel(value: string): string {
  return value.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\')
}

function textFromDotAttrs(record: string): string {
  const labels = [...record.matchAll(/(?:^|[\s,]|\[)label\s*=\s*"((?:\\.|[^"\\])*)"/g)]
    .map((match) => unescapeDotLabel(match[1]!).trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (labels.length > 0) {
    return labels.join('\n')
  }
  return ''
}

export function pagesFromDot(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const nodes = [...trimmed.matchAll(/\bn\d+\s*\[([^\]]*)\]/g)]
    .map((match) => textFromDotAttrs(match[1]!))
    .filter((page) => page.length > 0)
  if (nodes.length > 0) {
    return capPages(nodes)
  }
  const labels = [...trimmed.matchAll(/(?:^|[\s,]|\[)label\s*=\s*"((?:\\.|[^"\\])*)"/g)]
    .map((match) => unescapeDotLabel(match[1]!).trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (labels.length > 0) {
    return capPages(labels)
  }
  throw new Error('Tệp Graphviz cần các mục node / label.')
}

function unescapeMf2tText(value: string): string {
  return value.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\')
}

function textFromMf2tTrack(record: string): string {
  const texts = [...record.matchAll(/^\s*\d+\s+Meta\s+Text\s+"((?:\\.|[^"\\])*)"/gm)]
    .map((match) => unescapeMf2tText(match[1]!).trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (texts.length > 0) {
    return texts.join('\n')
  }
  return ''
}

export function pagesFromMf2t(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const tracks = [...trimmed.matchAll(/\bMTrk\b([\s\S]*?)(?:0\s+Meta\s+TrkEnd)/gi)]
    .map((match) => textFromMf2tTrack(match[1]!))
    .filter((page) => page.length > 0)
  if (tracks.length > 0) {
    return capPages(tracks)
  }
  const texts = [...trimmed.matchAll(/^\s*\d+\s+Meta\s+Text\s+"((?:\\.|[^"\\])*)"/gm)]
    .map((match) => unescapeMf2tText(match[1]!).trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (texts.length > 0) {
    return capPages(texts)
  }
  throw new Error('Tệp MIDI cần các mục MTrk / Meta Text.')
}

function unescapeLilypondText(value: string): string {
  return value.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\')
}

function textFromLilypondColumn(record: string): string {
  const texts = [...record.matchAll(/"((?:\\.|[^"\\])*)"/g)]
    .map((match) => unescapeLilypondText(match[1]!).trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (texts.length > 0) {
    return texts.join('\n')
  }
  return ''
}

export function pagesFromLilypond(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const columns = [...trimmed.matchAll(/\\markup\s+\\column\s*\{([^}]*)\}/g)]
    .map((match) => textFromLilypondColumn(match[1]!))
    .filter((page) => page.length > 0)
  if (columns.length > 0) {
    return capPages(columns)
  }
  throw new Error('Tệp LilyPond cần các mục markup / column.')
}

function textFromHumdrumRecord(record: string): string {
  const texts = record
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('!!') && !line.startsWith('!!!'))
    .map((line) => line.replace(/^!!\s?/, '').trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (texts.length > 0) {
    return texts.join('\n')
  }
  return ''
}

export function pagesFromHumdrum(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const records = [...trimmed.matchAll(/\*\*kern\b([\s\S]*?)^\*-/gm)]
    .map((match) => textFromHumdrumRecord(match[1]!))
    .filter((page) => page.length > 0)
  if (records.length > 0) {
    return capPages(records)
  }
  throw new Error('Tệp Humdrum cần các mục kern.')
}

function textFromXspfTrack(record: string): string {
  const texts = [...record.matchAll(/<annotation\b[^>]*>([\s\S]*?)<\/annotation>/gi)]
    .map((match) => unescapeXml(match[1]!.replace(/<[^>]+>/g, '')).trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (texts.length > 0) {
    return texts.join('\n')
  }
  const locations = [...record.matchAll(/<location\b[^>]*>([\s\S]*?)<\/location>/gi)]
    .map((match) => unescapeXml(match[1]!.replace(/<[^>]+>/g, '')).trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (locations.length > 0) {
    return locations.join('\n')
  }
  const titles = [...record.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)]
    .map((match) => unescapeXml(match[1]!.replace(/<[^>]+>/g, '')).trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (titles.length > 0) {
    return titles.join('\n')
  }
  return ''
}

export function pagesFromXspf(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const tracks = [...trimmed.matchAll(/<track\b[^>]*>([\s\S]*?)<\/track>/gi)]
    .map((match) => textFromXspfTrack(match[1]!))
    .filter((page) => page.length > 0)
  if (tracks.length > 0) {
    return capPages(tracks)
  }
  throw new Error('Tệp XSPF cần các mục track.')
}

function textFromM3uTrack(extinfTitle: string, body: string): string {
  const comments = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('#') && !/^#EXT/i.test(line) && !/^#PLAYLIST:/i.test(line))
    .map((line) => line.replace(/^#\s?/, '').trim())
    .filter((page) => page.length > 0 && !/^Trang\s+\d+$/.test(page))
  if (comments.length > 0) {
    return comments.join('\n')
  }
  const title = extinfTitle.trim()
  if (title.length > 0 && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

export function pagesFromM3u(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^\s*\{/.test(trimmed)) {
    return pagesFromJson(trimmed)
  }
  const parts = trimmed.split(/^\s*#EXTINF:[^,\n]*,([^\n]*)\s*$/im)
  if (parts.length >= 3) {
    const pages: string[] = []
    for (let i = 1; i < parts.length; i += 2) {
      const page = textFromM3uTrack(parts[i] ?? '', parts[i + 1] ?? '')
      if (page.length > 0) {
        pages.push(page)
      }
    }
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  throw new Error('Tệp M3U cần các mục EXTINF.')
}

function jspfFieldText(value: unknown): string {
  if (typeof value === 'string') {
    return value
  }
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string').join('\n')
  }
  return ''
}

function textFromJspfTrack(track: unknown): string {
  if (!track || typeof track !== 'object') {
    return ''
  }
  const record = track as { annotation?: unknown; location?: unknown; title?: unknown }
  const annotation = jspfFieldText(record.annotation).trim()
  if (annotation.length > 0 && !/^Trang\s+\d+$/.test(annotation)) {
    return annotation
  }
  const location = jspfFieldText(record.location).trim()
  if (location.length > 0 && !/^Trang\s+\d+$/.test(location)) {
    return location
  }
  const title = jspfFieldText(record.title).trim()
  if (title.length > 0 && !/^Trang\s+\d+$/.test(title)) {
    return title
  }
  return ''
}

export function pagesFromJspf(text: string): string[] {
  const trimmed = assertImportBudget(text)
  let data: unknown
  try {
    data = JSON.parse(trimmed)
  } catch {
    throw new Error('Tệp JSPF cần các mục track.')
  }
  if (data && typeof data === 'object' && Array.isArray((data as { pages?: unknown }).pages)) {
    return pagesFromJson(trimmed)
  }
  const tracks = (data as { playlist?: { track?: unknown } } | null)?.playlist?.track
  if (Array.isArray(tracks)) {
    const pages = tracks.map(textFromJspfTrack).filter((page) => page.length > 0)
    if (pages.length > 0) {
      return capPages(pages)
    }
  }
  throw new Error('Tệp JSPF cần các mục track.')
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
