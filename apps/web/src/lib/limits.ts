import type { ImportedTextKind, ZipImportKind } from './import-text.ts'

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024

export const ACCEPT_SOURCES =
  'application/pdf,.pdf,text/plain,.txt,text/markdown,.md,.markdown,text/html,.html,.htm,application/x-ipynb+json,.ipynb,application/x-bibtex,.bib,.bibtex,application/x-research-info-systems,.ris,application/x-endnote-refer,.enw,application/vnd.citationstyles.csl+json,.csljson,application/x-nbib,.nbib,application/vnd.citationstyles.csl+yaml,.cslyaml,.csl.yaml,.csl.yml,application/x-endnote+xml,.enxml,application/mods+xml,.mods,.mods.xml,application/citation-file+yaml,.cff,.citation.cff,application/vnd.datacite.datacite+xml,.datacite,.datacite.xml,application/marcxml+xml,.marcxml,.mrcx,.marc.xml,application/vnd.dublincore+xml,.dublincore,.dublincore.xml,.dc.xml,application/onix+xml,.onix,.onix.xml,application/vnd.crossref.unixref+xml,.unixref,.unixref.xml,.crossref.xml,application/vnd.citationstyles.bibjson+json,.bibjson,.bib.json,application/vnd.nlm.pubmed+xml,.pubmed,.pubmed.xml,application/bibframe+xml,.bibframe,.bibframe.xml,.bf.xml,application/ead+xml,.ead,.ead.xml,application/mets+xml,.mets,.mets.xml,application/premis+xml,.premis,.premis.xml,application/mix+xml,.mix,.mix.xml,application/alto+xml,.alto,.alto.xml,application/vnd.prima.page+xml,.page,.page.xml,.pcgts,application/foxml+xml,.foxml,.foxml.xml,application/vnd.europeana.edm+xml,.edm,.edm.xml,application/lido+xml,.lido,.lido.xml,application/vra+xml,.vra,.vra.xml,.vracore,.vracore.xml,application/ld+json,.jsonld,.json-ld,application/vnd.crossref+json,.crossref,.crossref.json,application/x-subrip,.srt,text/vtt,.vtt,text/x-lrc,.lrc,text/calendar,.ics,application/x-cue,.cue,text/x-ssa,.ass,.ssa,application/ttml+xml,.ttml,.dfxp,text/x-sbv,.sbv,application/x-sami,.smi,.sami,text/x-microdvd,.sub,text/x-subviewer,.sub,text/x-spruce,.stl,text/x-scc,.scc,application/x-usf+xml,.usf,text/vnd.rn-realtext,.rt,text/x-mpl2,.mpl,image/vnd.djvu,.djvu,.djv,application/postscript,.ps,.eps,application/eps,application/tei+xml,.tei,application/vnd.jats+xml,.jats,.nxml,application/json,.json,application/jsonl,.jsonl,.ndjson,application/yaml,.yaml,.yml,text/yaml,application/xml,.xml,text/xml,text/csv,.csv,text/tab-separated-values,.tsv,application/toml,.toml,text/org,.org,application/x-tex,.tex,.latex,text/x-texinfo,.texinfo,.texi,.txi,text/troff,text/x-roff,.roff,.man,text/ini,.ini,.cfg,text/asciidoc,.adoc,.asciidoc,text/x-rst,.rst,.rest,text/x-textile,.textile,.txtl,text/x-mediawiki,.mediawiki,.wiki,text/x-dokuwiki,.dokuwiki,.dw,application/docbook+xml,.dbk,.docbook,text/x-opml,.opml,application/atom+xml,.atom,application/rss+xml,.rss,text/x-typst,.typ,text/gemini,.gmi,.gemini,text/x-pod,.pod,text/x-bbcode,.bbcode,.bb,text/x-fountain,.fountain,.spmd,text/x-tiddlywiki,.tid,.tiddlywiki,.tiddly,application/rtf,.rtf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,application/msword,.doc,application/vnd.oasis.opendocument.text,.odt,application/vnd.oasis.opendocument.spreadsheet,.ods,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx,application/vnd.openxmlformats-officedocument.presentationml.presentation,.pptx,application/vnd.oasis.opendocument.presentation,.odp,application/x-fictionbook+xml,.fb2,application/epub+zip,.epub,application/vnd.comicbook+zip,.cbz,image/png,.png,image/jpeg,.jpg,.jpeg,image/webp,.webp'

export type ImageKind = 'png' | 'jpg' | 'webp'
export type EmbedImageKind = 'png' | 'jpg'
export type SourceKind = 'pdf' | ImportedTextKind | ImageKind | ZipImportKind

export type LoadedSource =
  | { kind: 'pdf'; name: string; bytes: Uint8Array }
  | { kind: ImportedTextKind; name: string; text: string; pdfName: string }
  | { kind: ImageKind; name: string; bytes: Uint8Array; pdfName: string }
  | { kind: ZipImportKind; name: string; bytes: Uint8Array; pdfName: string }

export function isImageKind(kind: SourceKind): kind is ImageKind {
  return kind === 'png' || kind === 'jpg' || kind === 'webp'
}

export function isImageSource(
  source: LoadedSource,
): source is Extract<LoadedSource, { kind: ImageKind }> {
  return source.kind === 'png' || source.kind === 'jpg' || source.kind === 'webp'
}

export function isZipImportSource(
  source: LoadedSource,
): source is Extract<LoadedSource, { kind: ZipImportKind }> {
  return (
    source.kind === 'docx' ||
    source.kind === 'epub' ||
    source.kind === 'odt' ||
    source.kind === 'xlsx' ||
    source.kind === 'ods' ||
    source.kind === 'pptx' ||
    source.kind === 'odp' ||
    source.kind === 'cbz'
  )
}

export function imageKindFromFile(file: { name: string; type: string }): ImageKind {
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  if (type === 'image/png' || name.endsWith('.png')) {
    return 'png'
  }
  if (
    type === 'image/jpeg' ||
    type === 'image/jpg' ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg')
  ) {
    return 'jpg'
  }
  if (type === 'image/webp' || name.endsWith('.webp')) {
    return 'webp'
  }
  throw new Error('Chỉ nhận ảnh PNG, JPEG hoặc WEBP.')
}

export function assertPdfFile(file: File): void {
  if (file.size === 0) {
    throw new Error('Tệp trống. Hãy chọn một PDF có nội dung.')
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error('Tệp vượt quá 20 MB.')
  }
  if (sourceKindFromFile(file) !== 'pdf') {
    throw new Error('Chỉ nhận tệp PDF.')
  }
}

export function sourceKindFromFile(file: File): SourceKind {
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return 'pdf'
  }
  if (type === 'text/markdown' || name.endsWith('.md') || name.endsWith('.markdown')) {
    return 'md'
  }
  if (type === 'text/html' || name.endsWith('.html') || name.endsWith('.htm')) {
    return 'html'
  }
  if (
    type === 'application/jsonl' ||
    type === 'application/x-ndjson' ||
    type === 'application/ndjson' ||
    name.endsWith('.jsonl') ||
    name.endsWith('.ndjson')
  ) {
    return 'jsonl'
  }
  if (
    type === 'application/x-ipynb+json' ||
    type === 'application/ipynb' ||
    name.endsWith('.ipynb')
  ) {
    return 'ipynb'
  }
  if (
    type === 'application/vnd.citationstyles.csl+json' ||
    type === 'application/csl+json' ||
    type === 'application/x-csljson' ||
    name.endsWith('.csljson') ||
    name.endsWith('.csl.json')
  ) {
    return 'csljson'
  }
  if (
    type === 'application/vnd.citationstyles.bibjson+json' ||
    type === 'application/x-bibjson' ||
    type === 'application/bibjson' ||
    name.endsWith('.bibjson') ||
    name.endsWith('.bib.json')
  ) {
    return 'bibjson'
  }
  if (
    type === 'application/ld+json' ||
    type === 'application/jsonld' ||
    type === 'application/x-jsonld' ||
    name.endsWith('.jsonld') ||
    name.endsWith('.json-ld')
  ) {
    return 'jsonld'
  }
  if (
    type === 'application/vnd.crossref+json' ||
    type === 'application/vnd.crossref.unixsd+json' ||
    type === 'application/x-crossref+json' ||
    name.endsWith('.crossref.json') ||
    name.endsWith('.crossref')
  ) {
    return 'crossref'
  }
  if (type === 'application/json' || name.endsWith('.json')) {
    return 'json'
  }
  if (
    type === 'application/vnd.citationstyles.csl+yaml' ||
    type === 'application/x-cslyaml' ||
    type === 'text/x-cslyaml' ||
    name.endsWith('.cslyaml') ||
    name.endsWith('.csl.yaml') ||
    name.endsWith('.csl.yml')
  ) {
    return 'cslyaml'
  }
  if (
    type === 'application/citation-file+yaml' ||
    type === 'application/x-cff' ||
    type === 'text/x-cff' ||
    name.endsWith('.citation.cff') ||
    name.endsWith('.cff')
  ) {
    return 'cff'
  }
  if (
    type === 'application/yaml' ||
    type === 'text/yaml' ||
    type === 'application/x-yaml' ||
    name.endsWith('.yaml') ||
    name.endsWith('.yml')
  ) {
    return 'yaml'
  }
  if (
    type === 'text/x-opml' ||
    type === 'application/xml+opml' ||
    type === 'text/opml' ||
    name.endsWith('.opml')
  ) {
    return 'opml'
  }
  if (
    type === 'application/atom+xml' ||
    type === 'application/rss+xml' ||
    type === 'text/xml+atom' ||
    name.endsWith('.atom') ||
    name.endsWith('.rss')
  ) {
    return 'atom'
  }
  if (
    type === 'text/x-typst' ||
    type === 'application/x-typst' ||
    type === 'text/typst' ||
    name.endsWith('.typ')
  ) {
    return 'typ'
  }
  if (
    type === 'text/gemini' ||
    type === 'text/x-gemini' ||
    name.endsWith('.gmi') ||
    name.endsWith('.gemini')
  ) {
    return 'gmi'
  }
  if (type === 'text/x-pod' || type === 'application/x-perl' || name.endsWith('.pod')) {
    return 'pod'
  }
  if (
    type === 'text/x-bbcode' ||
    type === 'text/bbcode' ||
    name.endsWith('.bbcode') ||
    name.endsWith('.bb')
  ) {
    return 'bbcode'
  }
  if (
    type === 'text/x-fountain' ||
    type === 'text/fountain' ||
    name.endsWith('.fountain') ||
    name.endsWith('.spmd')
  ) {
    return 'fountain'
  }
  if (
    type === 'text/x-tiddlywiki' ||
    type === 'text/vnd.tiddlywiki' ||
    name.endsWith('.tid') ||
    name.endsWith('.tiddlywiki') ||
    name.endsWith('.tiddly')
  ) {
    return 'tid'
  }
  if (
    type === 'text/x-texinfo' ||
    type === 'application/x-texinfo' ||
    type === 'text/texinfo' ||
    name.endsWith('.texinfo') ||
    name.endsWith('.texi') ||
    name.endsWith('.txi')
  ) {
    return 'texinfo'
  }
  if (
    type === 'text/x-roff' ||
    type === 'text/troff' ||
    type === 'application/x-troff' ||
    type === 'text/x-man' ||
    name.endsWith('.roff') ||
    name.endsWith('.man')
  ) {
    return 'roff'
  }
  if (
    type === 'application/x-bibtex' ||
    type === 'text/x-bibtex' ||
    type === 'text/bibtex' ||
    name.endsWith('.bibtex') ||
    name.endsWith('.bib')
  ) {
    return 'bib'
  }
  if (
    type === 'application/x-research-info-systems' ||
    type === 'application/x-ris' ||
    type === 'text/x-ris' ||
    type === 'text/ris' ||
    name.endsWith('.ris')
  ) {
    return 'ris'
  }
  if (
    type === 'application/x-endnote-refer' ||
    type === 'application/x-endnote' ||
    type === 'application/x-enw' ||
    type === 'text/x-enw' ||
    name.endsWith('.enw')
  ) {
    return 'enw'
  }
  if (
    type === 'application/x-nbib' ||
    type === 'application/nbib' ||
    type === 'text/x-nbib' ||
    type === 'text/nbib' ||
    name.endsWith('.nbib')
  ) {
    return 'nbib'
  }
  if (
    type === 'application/x-subrip' ||
    type === 'application/x-srt' ||
    type === 'text/srt' ||
    type === 'text/x-srt' ||
    name.endsWith('.srt')
  ) {
    return 'srt'
  }
  if (type === 'text/vtt' || type.startsWith('text/vtt;') || name.endsWith('.vtt')) {
    return 'vtt'
  }
  if (
    type === 'text/x-lrc' ||
    type === 'application/x-lrc' ||
    type === 'application/x-lyric' ||
    name.endsWith('.lrc')
  ) {
    return 'lrc'
  }
  if (
    type === 'text/calendar' ||
    type === 'application/ics' ||
    type.startsWith('text/calendar;') ||
    name.endsWith('.ics')
  ) {
    return 'ics'
  }
  if (
    type === 'application/x-cue' ||
    type === 'text/x-cue' ||
    type === 'application/x-cdrdao-toc' ||
    name.endsWith('.cue')
  ) {
    return 'cue'
  }
  if (
    type === 'text/x-ssa' ||
    type === 'text/x-ass' ||
    type === 'application/x-ass' ||
    name.endsWith('.ass') ||
    name.endsWith('.ssa')
  ) {
    return 'ass'
  }
  if (
    type === 'application/ttml+xml' ||
    type === 'application/xml+ttml' ||
    type === 'text/ttml' ||
    name.endsWith('.ttml') ||
    name.endsWith('.dfxp')
  ) {
    return 'ttml'
  }
  if (
    type === 'text/x-sbv' ||
    type === 'text/sbv' ||
    name.endsWith('.sbv')
  ) {
    return 'sbv'
  }
  if (
    type === 'application/x-sami' ||
    type === 'application/smil' ||
    type === 'text/x-sami' ||
    name.endsWith('.sami') ||
    name.endsWith('.smi')
  ) {
    return 'sami'
  }
  if (
    type === 'text/x-microdvd' ||
    type === 'text/x-subviewer' ||
    type === 'application/x-sub' ||
    name.endsWith('.sub')
  ) {
    return 'sub'
  }
  if (
    type === 'text/x-spruce' ||
    type === 'application/x-spruce' ||
    type === 'text/x-stl' ||
    name.endsWith('.stl')
  ) {
    return 'stl'
  }
  if (
    type === 'text/x-scc' ||
    type === 'application/x-scc' ||
    name.endsWith('.scc')
  ) {
    return 'scc'
  }
  if (
    type === 'application/x-usf+xml' ||
    type === 'application/x-usf' ||
    type === 'text/x-usf' ||
    name.endsWith('.usf')
  ) {
    return 'usf'
  }
  if (
    type === 'text/vnd.rn-realtext' ||
    type === 'application/x-realtext' ||
    type === 'text/x-realtext' ||
    name.endsWith('.rt')
  ) {
    return 'rt'
  }
  if (
    type === 'text/x-mpl2' ||
    type === 'text/x-mpl' ||
    type === 'application/x-mpl2' ||
    name.endsWith('.mpl')
  ) {
    return 'mpl'
  }
  if (
    type === 'image/vnd.djvu' ||
    type === 'image/x-djvu' ||
    type === 'image/djvu' ||
    type === 'text/x-djvu' ||
    name.endsWith('.djvu') ||
    name.endsWith('.djv')
  ) {
    return 'djvu'
  }
  if (
    type === 'application/postscript' ||
    type === 'application/eps' ||
    type === 'application/x-eps' ||
    type === 'application/x-postscript' ||
    name.endsWith('.eps') ||
    name.endsWith('.ps')
  ) {
    return 'ps'
  }
  if (
    type === 'application/tei+xml' ||
    type === 'application/tei' ||
    type === 'text/tei' ||
    type === 'text/xml+tei' ||
    name.endsWith('.tei')
  ) {
    return 'tei'
  }
  if (
    type === 'application/vnd.jats+xml' ||
    type === 'application/jats+xml' ||
    type === 'application/x-jats+xml' ||
    type === 'text/x-jats' ||
    name.endsWith('.jats') ||
    name.endsWith('.nxml')
  ) {
    return 'jats'
  }
  if (
    type === 'application/x-endnote+xml' ||
    type === 'application/endnote+xml' ||
    type === 'text/x-endnote+xml' ||
    name.endsWith('.enxml') ||
    name.endsWith('.endnote.xml')
  ) {
    return 'enxml'
  }
  if (
    type === 'application/mods+xml' ||
    type === 'application/x-mods+xml' ||
    type === 'text/x-mods+xml' ||
    name.endsWith('.mods.xml') ||
    name.endsWith('.mods')
  ) {
    return 'mods'
  }
  if (
    type === 'application/vnd.datacite.datacite+xml' ||
    type === 'application/x-datacite+xml' ||
    type === 'text/x-datacite+xml' ||
    name.endsWith('.datacite.xml') ||
    name.endsWith('.datacite')
  ) {
    return 'datacite'
  }
  if (
    type === 'application/marcxml+xml' ||
    type === 'application/marc+xml' ||
    type === 'application/x-marcxml+xml' ||
    type === 'text/x-marcxml' ||
    name.endsWith('.marc.xml') ||
    name.endsWith('.marcxml') ||
    name.endsWith('.mrcx')
  ) {
    return 'marcxml'
  }
  if (
    type === 'application/vnd.dublincore+xml' ||
    type === 'application/oai_dc+xml' ||
    type === 'application/x-dublincore+xml' ||
    type === 'text/x-dublincore+xml' ||
    name.endsWith('.dublincore.xml') ||
    name.endsWith('.dublincore') ||
    name.endsWith('.dc.xml')
  ) {
    return 'dublincore'
  }
  if (
    type === 'application/onix+xml' ||
    type === 'application/vnd.editeur.onix+xml' ||
    type === 'application/x-onix+xml' ||
    type === 'text/x-onix+xml' ||
    name.endsWith('.onix.xml') ||
    name.endsWith('.onix')
  ) {
    return 'onix'
  }
  if (
    type === 'application/vnd.crossref.unixref+xml' ||
    type === 'application/x-unixref+xml' ||
    type === 'text/x-unixref+xml' ||
    name.endsWith('.unixref.xml') ||
    name.endsWith('.crossref.xml') ||
    name.endsWith('.unixref')
  ) {
    return 'unixref'
  }
  if (
    type === 'application/vnd.nlm.pubmed+xml' ||
    type === 'application/pubmed+xml' ||
    type === 'application/x-pubmed+xml' ||
    type === 'text/x-pubmed+xml' ||
    name.endsWith('.pubmed.xml') ||
    name.endsWith('.pubmed')
  ) {
    return 'pubmed'
  }
  if (
    type === 'application/bibframe+xml' ||
    type === 'application/x-bibframe+xml' ||
    type === 'text/x-bibframe+xml' ||
    name.endsWith('.bibframe.xml') ||
    name.endsWith('.bf.xml') ||
    name.endsWith('.bibframe')
  ) {
    return 'bibframe'
  }
  if (
    type === 'application/ead+xml' ||
    type === 'application/x-ead+xml' ||
    type === 'text/x-ead+xml' ||
    name.endsWith('.ead.xml') ||
    name.endsWith('.ead')
  ) {
    return 'ead'
  }
  if (
    type === 'application/mets+xml' ||
    type === 'application/x-mets+xml' ||
    type === 'text/x-mets+xml' ||
    name.endsWith('.mets.xml') ||
    name.endsWith('.mets')
  ) {
    return 'mets'
  }
  if (
    type === 'application/premis+xml' ||
    type === 'application/x-premis+xml' ||
    type === 'text/x-premis+xml' ||
    name.endsWith('.premis.xml') ||
    name.endsWith('.premis')
  ) {
    return 'premis'
  }
  if (
    type === 'application/mix+xml' ||
    type === 'application/x-mix+xml' ||
    type === 'text/x-mix+xml' ||
    type === 'application/vnd.niso.mix+xml' ||
    name.endsWith('.mix.xml') ||
    name.endsWith('.mix')
  ) {
    return 'mix'
  }
  if (
    type === 'application/alto+xml' ||
    type === 'application/x-alto+xml' ||
    type === 'text/x-alto+xml' ||
    name.endsWith('.alto.xml') ||
    name.endsWith('.alto')
  ) {
    return 'alto'
  }
  if (
    type === 'application/vnd.prima.page+xml' ||
    type === 'application/page+xml' ||
    type === 'application/x-page+xml' ||
    type === 'text/x-page+xml' ||
    name.endsWith('.page.xml') ||
    name.endsWith('.pcgts') ||
    name.endsWith('.page')
  ) {
    return 'page'
  }
  if (
    type === 'application/foxml+xml' ||
    type === 'application/x-foxml+xml' ||
    type === 'text/x-foxml+xml' ||
    name.endsWith('.foxml.xml') ||
    name.endsWith('.foxml')
  ) {
    return 'foxml'
  }
  if (
    type === 'application/vnd.europeana.edm+xml' ||
    type === 'application/edm+xml' ||
    type === 'application/x-edm+xml' ||
    type === 'text/x-edm+xml' ||
    name.endsWith('.edm.xml') ||
    name.endsWith('.edm')
  ) {
    return 'edm'
  }
  if (
    type === 'application/lido+xml' ||
    type === 'application/x-lido+xml' ||
    type === 'text/x-lido+xml' ||
    name.endsWith('.lido.xml') ||
    name.endsWith('.lido')
  ) {
    return 'lido'
  }
  if (
    type === 'application/vra+xml' ||
    type === 'application/x-vra+xml' ||
    type === 'text/x-vra+xml' ||
    type === 'application/vracore+xml' ||
    name.endsWith('.vra.xml') ||
    name.endsWith('.vracore.xml') ||
    name.endsWith('.vracore') ||
    name.endsWith('.vra')
  ) {
    return 'vra'
  }
  if (
    type === 'application/xml' ||
    type === 'text/xml' ||
    (name.endsWith('.xml') && !name.endsWith('.fb2'))
  ) {
    return 'xml'
  }
  if (type === 'text/csv' || type === 'application/csv' || name.endsWith('.csv')) {
    return 'csv'
  }
  if (
    type === 'text/tab-separated-values' ||
    type === 'text/tsv' ||
    name.endsWith('.tsv')
  ) {
    return 'tsv'
  }
  if (
    type === 'application/toml' ||
    type === 'application/x-toml' ||
    type === 'text/toml' ||
    name.endsWith('.toml')
  ) {
    return 'toml'
  }
  if (type === 'text/org' || type === 'application/vnd.orgmode' || name.endsWith('.org')) {
    return 'org'
  }
  if (
    type === 'application/x-tex' ||
    type === 'application/x-latex' ||
    type === 'text/x-tex' ||
    type === 'text/x-latex' ||
    name.endsWith('.tex') ||
    name.endsWith('.latex')
  ) {
    return 'tex'
  }
  if (
    type === 'text/ini' ||
    type === 'application/ini' ||
    type === 'text/x-ini' ||
    name.endsWith('.ini') ||
    name.endsWith('.cfg')
  ) {
    return 'ini'
  }
  if (
    type === 'text/asciidoc' ||
    type === 'text/x-asciidoc' ||
    name.endsWith('.asciidoc') ||
    name.endsWith('.adoc')
  ) {
    return 'adoc'
  }
  if (
    type === 'text/x-rst' ||
    type === 'text/restructuredtext' ||
    name.endsWith('.rst') ||
    name.endsWith('.rest')
  ) {
    return 'rst'
  }
  if (
    type === 'text/x-textile' ||
    type === 'text/textile' ||
    name.endsWith('.textile') ||
    name.endsWith('.txtl')
  ) {
    return 'textile'
  }
  if (
    type === 'text/x-dokuwiki' ||
    type === 'text/dokuwiki' ||
    name.endsWith('.dokuwiki') ||
    name.endsWith('.dw')
  ) {
    return 'dokuwiki'
  }
  if (
    type === 'text/x-mediawiki' ||
    type === 'text/mediawiki' ||
    name.endsWith('.mediawiki') ||
    name.endsWith('.wiki')
  ) {
    return 'wiki'
  }
  if (
    type === 'application/docbook+xml' ||
    type === 'application/docbook' ||
    name.endsWith('.docbook') ||
    name.endsWith('.dbk')
  ) {
    return 'dbk'
  }
  if (
    type === 'application/rtf' ||
    type === 'text/rtf' ||
    name.endsWith('.rtf')
  ) {
    return 'rtf'
  }
  if (
    type === 'application/x-fictionbook+xml' ||
    type === 'application/fictionbook+xml' ||
    name.endsWith('.fb2')
  ) {
    return 'fb2'
  }
  if (
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx') ||
    type === 'application/msword' ||
    name.endsWith('.doc')
  ) {
    return 'docx'
  }
  if (
    type === 'application/vnd.oasis.opendocument.text' ||
    name.endsWith('.odt')
  ) {
    return 'odt'
  }
  if (
    type === 'application/vnd.oasis.opendocument.spreadsheet' ||
    name.endsWith('.ods')
  ) {
    return 'ods'
  }
  if (
    type === 'application/vnd.oasis.opendocument.presentation' ||
    name.endsWith('.odp')
  ) {
    return 'odp'
  }
  if (
    type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    name.endsWith('.xlsx')
  ) {
    return 'xlsx'
  }
  if (name.endsWith('.xls') || type === 'application/vnd.ms-excel') {
    throw new Error('Chỉ mở được XLSX (Office Open XML), không phải XLS nhị phân.')
  }
  if (
    type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    name.endsWith('.pptx')
  ) {
    return 'pptx'
  }
  if (
    name.endsWith('.ppt') ||
    type === 'application/vnd.ms-powerpoint'
  ) {
    throw new Error('Chỉ mở được PPTX (Office Open XML), không phải PPT nhị phân.')
  }
  if (type === 'application/epub+zip' || name.endsWith('.epub')) {
    return 'epub'
  }
  if (
    type === 'application/vnd.comicbook+zip' ||
    type === 'application/x-cbz' ||
    name.endsWith('.cbz')
  ) {
    return 'cbz'
  }
  if (
    type === 'text/plain' ||
    name.endsWith('.txt') ||
    name.endsWith('.text')
  ) {
    return 'txt'
  }
  try {
    return imageKindFromFile(file)
  } catch {
    throw new Error('Chỉ nhận PDF, TXT, Markdown, HTML, JSON, JSONL, YAML, XML, CSV, TSV, TOML, Org, LaTeX, INI, AsciiDoc, RST, Textile, MediaWiki, DokuWiki, DocBook, OPML, Atom, RSS, Typst, Gemtext, POD, BBCode, Fountain, TiddlyWiki, Texinfo, roff, Jupyter, BibTeX, SRT, VTT, LRC, ICS, CUE, ASS, TTML, SBV, SAMI, SUB, STL, SCC, USF, RT, MPL, DjVu, PS, TEI, JATS, RIS, ENW, CSL-JSON, NBIB, CSL-YAML, EndNote XML, MODS, CFF, DataCite, MARCXML, Dublin Core, ONIX, Unixref, BibJSON, PubMed, JSON-LD, BIBFRAME, Crossref, EAD, METS, PREMIS, MIX, ALTO, PAGE, FOXML, EDM, LIDO, VRA, RTF, DOCX, ODT, ODS, XLSX, PPTX, ODP, FB2, EPUB, CBZ, PNG, JPEG hoặc WEBP.')
  }
}

export function assertSourceFile(file: File): SourceKind {
  if (file.size === 0) {
    throw new Error('Tệp trống. Hãy chọn một tệp có nội dung.')
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error('Tệp vượt quá 20 MB.')
  }
  return sourceKindFromFile(file)
}

export async function readPdfFile(file: File): Promise<Uint8Array> {
  assertPdfFile(file)
  return new Uint8Array(await file.arrayBuffer())
}

export async function readSourceFile(file: File): Promise<LoadedSource> {
  const kind = assertSourceFile(file)
  if (kind === 'pdf') {
    return { kind, name: file.name, bytes: new Uint8Array(await file.arrayBuffer()) }
  }
  if (isImageKind(kind)) {
    return {
      kind,
      name: file.name,
      bytes: new Uint8Array(await file.arrayBuffer()),
      pdfName: swapExtension(file.name, 'pdf'),
    }
  }
  if (
    kind === 'docx' ||
    kind === 'epub' ||
    kind === 'odt' ||
    kind === 'ods' ||
    kind === 'xlsx' ||
    kind === 'pptx' ||
    kind === 'odp' ||
    kind === 'cbz'
  ) {
    return {
      kind,
      name: file.name,
      bytes: new Uint8Array(await file.arrayBuffer()),
      pdfName: swapExtension(file.name, 'pdf'),
    }
  }
  return {
    kind,
    name: file.name,
    text: await file.text(),
    pdfName: swapExtension(file.name, 'pdf'),
  }
}

export async function readImageFiles(
  files: Iterable<File>,
): Promise<{ kind: ImageKind; bytes: Uint8Array; name: string }[]> {
  const list = [...files]
  if (list.length === 0) {
    throw new Error('Chọn ít nhất một ảnh PNG, JPEG hoặc WEBP.')
  }
  const images: { kind: ImageKind; bytes: Uint8Array; name: string }[] = []
  for (const file of list) {
    if (file.size === 0) {
      throw new Error('Tệp trống. Hãy chọn một tệp có nội dung.')
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new Error('Tệp vượt quá 20 MB.')
    }
    images.push({
      kind: imageKindFromFile(file),
      bytes: new Uint8Array(await file.arrayBuffer()),
      name: file.name,
    })
  }
  return images
}

export function swapExtension(filename: string, ext: string): string {
  const base =
    filename.replace(/\.(pdf|txt|text|md|markdown|html|htm|png|jpe?g|webp|jsonl|ndjson|ipynb|bib\.json|json-ld|jsonld|crossref\.json|json|csl\.ya?ml|ya?ml|endnote\.xml|mods\.xml|datacite\.xml|marc\.xml|dublincore\.xml|dc\.xml|onix\.xml|unixref\.xml|crossref\.xml|pubmed\.xml|bibframe\.xml|bf\.xml|ead\.xml|mets\.xml|premis\.xml|mix\.xml|alto\.xml|page\.xml|pcgts\.xml|foxml\.xml|edm\.xml|lido\.xml|vra\.xml|vracore\.xml|xml|csv|tsv|toml|org|texinfo|texi|txi|tex|latex|ini|cfg|adoc|asciidoc|rst|rest|textile|txtl|mediawiki|wiki|dokuwiki|dw|dbk|docbook|opml|atom|rss|typ|gmi|gemini|pod|bbcode|bb|fountain|spmd|tid|tiddlywiki|tiddly|roff|man|bibtex|bib|srt|vtt|lrc|ics|cue|ass|ssa|ttml|dfxp|sbv|sami|smi|sub|stl|scc|usf|mpl|djvu|djv|tei|jats|nxml|ris|enw|csljson|bibjson|nbib|cslyaml|enxml|mods|citation\.cff|cff|datacite|marcxml|mrcx|dublincore|onix|unixref|pubmed|bibframe|crossref|ead|mets|premis|mix|alto|page|pcgts|foxml|edm|lido|vra|vracore|eps|ps|xlsx|xls|docx|doc|pptx|ppt|epub|odt|ods|odp|fb2|rtf|rt|cbz)$/i, '') ||
    'document'
  return `${base}.${ext}`
}

export function encryptedPdfName(filename: string): string {
  const base = filename.replace(/\.pdf$/i, '') || 'document'
  return `${base}-khoa.pdf`
}

export function extractedPdfName(filename: string, pageIndexes: readonly number[]): string {
  const base = filename.replace(/\.pdf$/i, '') || 'document'
  const pages = [...new Set(pageIndexes.filter((index) => Number.isInteger(index) && index >= 0))]
    .sort((a, b) => a - b)
    .map((index) => index + 1)
  if (pages.length === 0) {
    return `${base}-trang.pdf`
  }
  if (pages.length === 1) {
    return `${base}-trang-${pages[0]}.pdf`
  }
  const contiguous = pages.every((page, index) => index === 0 || page === pages[index - 1]! + 1)
  if (contiguous || pages.length > 8) {
    return `${base}-trang-${pages[0]}-${pages[pages.length - 1]}.pdf`
  }
  return `${base}-trang-${pages.join('+')}.pdf`
}

export function splitPartName(filename: string, part: number, total: number): string {
  const base = filename.replace(/\.pdf$/i, '') || 'document'
  const width = String(Math.max(1, total)).length
  return `${base}-phan-${String(part).padStart(width, '0')}-cua-${total}.pdf`
}

export function splitZipName(filename: string): string {
  const base = filename.replace(/\.pdf$/i, '') || 'document'
  return `${base}-tach.zip`
}

export function imagePageName(
  filename: string,
  pageIndex: number,
  ext: 'png' | 'jpg' | 'webp',
): string {
  const base =
    filename.replace(/\.(pdf|txt|text|md|markdown|html|htm|png|jpe?g|webp|jsonl|ndjson|ipynb|bib\.json|json-ld|jsonld|crossref\.json|json|csl\.ya?ml|ya?ml|endnote\.xml|mods\.xml|datacite\.xml|marc\.xml|dublincore\.xml|dc\.xml|onix\.xml|unixref\.xml|crossref\.xml|pubmed\.xml|bibframe\.xml|bf\.xml|ead\.xml|mets\.xml|premis\.xml|mix\.xml|alto\.xml|page\.xml|pcgts\.xml|foxml\.xml|edm\.xml|lido\.xml|vra\.xml|vracore\.xml|xml|csv|tsv|toml|org|texinfo|texi|txi|tex|latex|ini|cfg|adoc|asciidoc|rst|rest|textile|txtl|mediawiki|wiki|dokuwiki|dw|dbk|docbook|opml|atom|rss|typ|gmi|gemini|pod|bbcode|bb|fountain|spmd|tid|tiddlywiki|tiddly|roff|man|bibtex|bib|srt|vtt|lrc|ics|cue|ass|ssa|ttml|dfxp|sbv|sami|smi|sub|stl|scc|usf|mpl|djvu|djv|tei|jats|nxml|ris|enw|csljson|bibjson|nbib|cslyaml|enxml|mods|citation\.cff|cff|datacite|marcxml|mrcx|dublincore|onix|unixref|pubmed|bibframe|crossref|ead|mets|premis|mix|alto|page|pcgts|foxml|edm|lido|vra|vracore|eps|ps|xlsx|xls|docx|doc|pptx|ppt|epub|odt|ods|odp|fb2|rtf|rt|cbz)$/i, '') ||
    'document'
  const page = Number.isInteger(pageIndex) && pageIndex >= 0 ? pageIndex + 1 : 1
  return `${base}-trang-${page}.${ext}`
}

export function imageZipName(filename: string, ext: 'png' | 'jpg' | 'webp'): string {
  const base =
    filename.replace(/\.(pdf|txt|text|md|markdown|html|htm|png|jpe?g|webp|jsonl|ndjson|ipynb|bib\.json|json-ld|jsonld|crossref\.json|json|csl\.ya?ml|ya?ml|endnote\.xml|mods\.xml|datacite\.xml|marc\.xml|dublincore\.xml|dc\.xml|onix\.xml|unixref\.xml|crossref\.xml|pubmed\.xml|bibframe\.xml|bf\.xml|ead\.xml|mets\.xml|premis\.xml|mix\.xml|alto\.xml|page\.xml|pcgts\.xml|foxml\.xml|edm\.xml|lido\.xml|vra\.xml|vracore\.xml|xml|csv|tsv|toml|org|texinfo|texi|txi|tex|latex|ini|cfg|adoc|asciidoc|rst|rest|textile|txtl|mediawiki|wiki|dokuwiki|dw|dbk|docbook|opml|atom|rss|typ|gmi|gemini|pod|bbcode|bb|fountain|spmd|tid|tiddlywiki|tiddly|roff|man|bibtex|bib|srt|vtt|lrc|ics|cue|ass|ssa|ttml|dfxp|sbv|sami|smi|sub|stl|scc|usf|mpl|djvu|djv|tei|jats|nxml|ris|enw|csljson|bibjson|nbib|cslyaml|enxml|mods|citation\.cff|cff|datacite|marcxml|mrcx|dublincore|onix|unixref|pubmed|bibframe|crossref|ead|mets|premis|mix|alto|page|pcgts|foxml|edm|lido|vra|vracore|eps|ps|xlsx|xls|docx|doc|pptx|ppt|epub|odt|ods|odp|fb2|rtf|rt|cbz)$/i, '') ||
    'document'
  return `${base}-anh-${ext}.zip`
}

export function embeddedImageName(
  filename: string,
  pageIndex: number,
  imageIndex: number,
  ext: 'png' | 'jpg',
): string {
  const base =
    filename.replace(/\.(pdf|txt|text|md|markdown|html|htm|png|jpe?g|webp|jsonl|ndjson|ipynb|bib\.json|json-ld|jsonld|crossref\.json|json|csl\.ya?ml|ya?ml|endnote\.xml|mods\.xml|datacite\.xml|marc\.xml|dublincore\.xml|dc\.xml|onix\.xml|unixref\.xml|crossref\.xml|pubmed\.xml|bibframe\.xml|bf\.xml|ead\.xml|mets\.xml|premis\.xml|mix\.xml|alto\.xml|page\.xml|pcgts\.xml|foxml\.xml|edm\.xml|lido\.xml|vra\.xml|vracore\.xml|xml|csv|tsv|toml|org|texinfo|texi|txi|tex|latex|ini|cfg|adoc|asciidoc|rst|rest|textile|txtl|mediawiki|wiki|dokuwiki|dw|dbk|docbook|opml|atom|rss|typ|gmi|gemini|pod|bbcode|bb|fountain|spmd|tid|tiddlywiki|tiddly|roff|man|bibtex|bib|srt|vtt|lrc|ics|cue|ass|ssa|ttml|dfxp|sbv|sami|smi|sub|stl|scc|usf|mpl|djvu|djv|tei|jats|nxml|ris|enw|csljson|bibjson|nbib|cslyaml|enxml|mods|citation\.cff|cff|datacite|marcxml|mrcx|dublincore|onix|unixref|pubmed|bibframe|crossref|ead|mets|premis|mix|alto|page|pcgts|foxml|edm|lido|vra|vracore|eps|ps|xlsx|xls|docx|doc|pptx|ppt|epub|odt|ods|odp|fb2|rtf|rt|cbz)$/i, '') ||
    'document'
  const page = Number.isInteger(pageIndex) && pageIndex >= 0 ? pageIndex + 1 : 1
  const image = Number.isInteger(imageIndex) && imageIndex >= 0 ? imageIndex + 1 : 1
  return `${base}-trang-${page}-anh-${image}.${ext}`
}

export function embeddedImageZipName(filename: string): string {
  const base =
    filename.replace(/\.(pdf|txt|text|md|markdown|html|htm|png|jpe?g|webp|jsonl|ndjson|ipynb|bib\.json|json-ld|jsonld|crossref\.json|json|csl\.ya?ml|ya?ml|endnote\.xml|mods\.xml|datacite\.xml|marc\.xml|dublincore\.xml|dc\.xml|onix\.xml|unixref\.xml|crossref\.xml|pubmed\.xml|bibframe\.xml|bf\.xml|ead\.xml|mets\.xml|premis\.xml|mix\.xml|alto\.xml|page\.xml|pcgts\.xml|foxml\.xml|edm\.xml|lido\.xml|vra\.xml|vracore\.xml|xml|csv|tsv|toml|org|texinfo|texi|txi|tex|latex|ini|cfg|adoc|asciidoc|rst|rest|textile|txtl|mediawiki|wiki|dokuwiki|dw|dbk|docbook|opml|atom|rss|typ|gmi|gemini|pod|bbcode|bb|fountain|spmd|tid|tiddlywiki|tiddly|roff|man|bibtex|bib|srt|vtt|lrc|ics|cue|ass|ssa|ttml|dfxp|sbv|sami|smi|sub|stl|scc|usf|mpl|djvu|djv|tei|jats|nxml|ris|enw|csljson|bibjson|nbib|cslyaml|enxml|mods|citation\.cff|cff|datacite|marcxml|mrcx|dublincore|onix|unixref|pubmed|bibframe|crossref|ead|mets|premis|mix|alto|page|pcgts|foxml|edm|lido|vra|vracore|eps|ps|xlsx|xls|docx|doc|pptx|ppt|epub|odt|ods|odp|fb2|rtf|rt|cbz)$/i, '') ||
    'document'
  return `${base}-anh-nhung.zip`
}
