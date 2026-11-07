import type { ImportedTextKind, ZipImportKind } from './import-text.ts'

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024

export const ACCEPT_SOURCES =
  'application/pdf,.pdf,text/plain,.txt,text/markdown,.md,.markdown,text/html,.html,.htm,application/x-ipynb+json,.ipynb,application/x-bibtex,.bib,.bibtex,application/x-research-info-systems,.ris,application/x-endnote-refer,.enw,application/vnd.citationstyles.csl+json,.csljson,application/x-nbib,.nbib,application/vnd.citationstyles.csl+yaml,.cslyaml,.csl.yaml,.csl.yml,application/x-endnote+xml,.enxml,application/mods+xml,.mods,.mods.xml,application/citation-file+yaml,.cff,.citation.cff,application/vnd.datacite.datacite+xml,.datacite,.datacite.xml,application/marcxml+xml,.marcxml,.mrcx,.marc.xml,application/vnd.dublincore+xml,.dublincore,.dublincore.xml,.dc.xml,application/onix+xml,.onix,.onix.xml,application/vnd.crossref.unixref+xml,.unixref,.unixref.xml,.crossref.xml,application/vnd.citationstyles.bibjson+json,.bibjson,.bib.json,application/vnd.nlm.pubmed+xml,.pubmed,.pubmed.xml,application/bibframe+xml,.bibframe,.bibframe.xml,.bf.xml,application/ead+xml,.ead,.ead.xml,application/mets+xml,.mets,.mets.xml,application/premis+xml,.premis,.premis.xml,application/mix+xml,.mix,.mix.xml,application/alto+xml,.alto,.alto.xml,application/vnd.prima.page+xml,.page,.page.xml,.pcgts,application/foxml+xml,.foxml,.foxml.xml,application/vnd.europeana.edm+xml,.edm,.edm.xml,application/lido+xml,.lido,.lido.xml,application/vra+xml,.vra,.vra.xml,.vracore,.vracore.xml,application/cdwa+xml,.cdwa,.cdwa.xml,.cdwalite,.cdwalite.xml,application/spectrum+xml,.spectrum,.spectrum.xml,application/vnd.tdwg.dwc+xml,.dwc,.dwc.xml,.darwincore,.darwincore.xml,application/objectid+xml,.objectid,.objectid.xml,.oid,application/eac-cpf+xml,.eac,.eac.xml,.eac-cpf,.eac-cpf.xml,.cpf,application/cidoc-crm+xml,.crm,.crm.xml,.cidoc,.cidoc.xml,.cidoc-crm,application/metsrights+xml,.rights,.rights.xml,.metsrights,.metsrights.xml,.rmd,application/textmd+xml,.textmd,.textmd.xml,.tmd,application/pbcore+xml,.pbcore,.pbcore.xml,.pbc,application/ebucore+xml,.ebucore,.ebucore.xml,.ebu,application/mpeg7+xml,.mpeg7,.mpeg7.xml,.mp7,application/aes57+xml,.aes57,.aes57.xml,.aes,application/lom+xml,.lom,.lom.xml,.ieee-lom,application/imscp+xml,.imscp,.imscp.xml,.ims,.imsmanifest.xml,application/newsml+xml,.newsml,.newsml.xml,.nml,application/nitf+xml,.nitf,.nitf.xml,application/sportsml+xml,.sportsml,.sportsml.xml,.sml,application/eventsml+xml,.eventsml,.eventsml.xml,application/vnd.iptc.g2+xml,.newsmlg2,.newsmlg2.xml,.newsml-g2,.nar,application/vnd.iptc.rnews+xml,.rnews,.rnews.xml,application/prism+xml,.prism,.prism.xml,application/hnews+xml,.hnews,.hnews.xml,application/iptc+xml,.iptc,.iptc.xml,application/anpa+xml,.anpa,.anpa.xml,application/vnd.iptc.ninjs+json,.ninjs,.ninjs.json,application/feed+json,.jsonfeed,.jsonfeed.json,application/activity+json,.as2,.as2.json,application/geo+json,.geojson,.geojson.json,application/json,.topojson,.topo.json,application/vnd.google-earth.kml+xml,.kml,.kml.xml,application/gpx+xml,.gpx,.gpx.xml,application/vnd.osm+xml,.osm,.osm.xml,application/georss+xml,.georss,.georss.xml,application/wkt,.wkt,.wkt.txt,application/gml+xml,.gml,.gml.xml,image/svg+xml,.svg,.svg.xml,application/dxf,.dxf,.dxf.txt,text/mapml,.mapml,.mapml.xml,application/mapml+xml,application/city+json,.cityjson,.city.json,application/indoorgml+xml,.indoorgml,.indoorgml.xml,application/citygml+xml,.citygml,.citygml.xml,application/landxml+xml,.landxml,.landxml.xml,application/ifcxml+xml,.ifcxml,.ifc.xml,application/gbxml+xml,.gbxml,.gbxml.xml,application/bcfxml+xml,.bcfxml,.bcf.xml,application/cobiexml+xml,.cobiexml,.cobie.xml,application/landinfra+xml,.landinfra,.landinfra.xml,application/infragml+xml,.infragml,.infragml.xml,application/vnd.opendrive+xml,.opendrive,.opendrive.xml,.xodr,application/railml+xml,.railml,.railml.xml,application/transxml+xml,.transxml,.transxml.xml,application/datex2+xml,.datex2,.datex2.xml,application/netex+xml,.netex,.netex.xml,application/siri+xml,.siri,.siri.xml,application/transxchange+xml,.transxchange,.transxchange.xml,application/naptan+xml,.naptan,.naptan.xml,application/gtfs+xml,.gtfs,.gtfs.xml,application/ifopt+xml,.ifopt,.ifopt.xml,application/ojp+xml,.ojp,.ojp.xml,application/trias+xml,.trias,.trias.xml,application/vdv453+xml,.vdv453,.vdv453.xml,application/vdv454+xml,.vdv454,.vdv454.xml,application/vdv452+xml,.vdv452,.vdv452.xml,application/vdv462+xml,.vdv462,.vdv462.xml,application/vdv455+xml,.vdv455,.vdv455.xml,application/vdv731+xml,.vdv731,.vdv731.xml,application/vdv301+xml,.vdv301,.vdv301.xml,application/vdv423+xml,.vdv423,.vdv423.xml,application/vdv431+xml,.vdv431,.vdv431.xml,application/vdv300+xml,.vdv300,.vdv300.xml,application/vdv451+xml,.vdv451,.vdv451.xml,application/vdv432+xml,.vdv432,.vdv432.xml,application/vdv433+xml,.vdv433,.vdv433.xml,application/vdv434+xml,.vdv434,.vdv434.xml,application/vdv435+xml,.vdv435,.vdv435.xml,application/vdv436+xml,.vdv436,.vdv436.xml,application/vdv456+xml,.vdv456,.vdv456.xml,application/vdv457+xml,.vdv457,.vdv457.xml,application/vdv459+xml,.vdv459,.vdv459.xml,application/vdv461+xml,.vdv461,.vdv461.xml,application/vdv458+xml,.vdv458,.vdv458.xml,application/vdv460+xml,.vdv460,.vdv460.xml,application/xliff+xml,.xliff,.xliff.xml,.xlf,application/tmx+xml,.tmx,.tmx.xml,application/tbx+xml,.tbx,.tbx.xml,text/x-po,.po,.pot,application/dita+xml,.dita,.dita.xml,text/vcard,.vcf,.vcard,application/rdf+xml,.rdf,.rdf.xml,application/opds+xml,.opds,.opds.xml,text/x-vtodo,.vtodo,.todo,text/x-vjournal,.vjournal,.journal,text/x-vfreebusy,.vfreebusy,.freebusy,text/x-vavailability,.vavailability,.availability,text/x-vtimezone,.vtimezone,.timezone,text/x-valarm,.valarm,.alarm,text/x-vevent,.vevent,.event,application/calendar+xml,.xcal,.ics.xml,application/ld+json,.jsonld,.json-ld,application/vnd.crossref+json,.crossref,.crossref.json,application/x-subrip,.srt,text/vtt,.vtt,text/x-lrc,.lrc,text/calendar,.ics,application/x-cue,.cue,text/x-ssa,.ass,.ssa,application/ttml+xml,.ttml,.dfxp,text/x-sbv,.sbv,application/x-sami,.smi,.sami,text/x-microdvd,.sub,text/x-subviewer,.sub,text/x-spruce,.stl,text/x-scc,.scc,application/x-usf+xml,.usf,text/vnd.rn-realtext,.rt,text/x-mpl2,.mpl,image/vnd.djvu,.djvu,.djv,application/postscript,.ps,.eps,application/eps,application/tei+xml,.tei,application/vnd.jats+xml,.jats,.nxml,application/json,.json,application/jsonl,.jsonl,.ndjson,application/yaml,.yaml,.yml,text/yaml,application/xml,.xml,text/xml,text/csv,.csv,text/tab-separated-values,.tsv,application/toml,.toml,text/org,.org,application/x-tex,.tex,.latex,text/x-texinfo,.texinfo,.texi,.txi,text/troff,text/x-roff,.roff,.man,text/ini,.ini,.cfg,text/asciidoc,.adoc,.asciidoc,text/x-rst,.rst,.rest,text/x-textile,.textile,.txtl,text/x-mediawiki,.mediawiki,.wiki,text/x-dokuwiki,.dokuwiki,.dw,application/docbook+xml,.dbk,.docbook,text/x-opml,.opml,application/atom+xml,.atom,application/rss+xml,.rss,text/x-typst,.typ,text/gemini,.gmi,.gemini,text/x-pod,.pod,text/x-bbcode,.bbcode,.bb,text/x-fountain,.fountain,.spmd,text/x-tiddlywiki,.tid,.tiddlywiki,.tiddly,application/rtf,.rtf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,application/msword,.doc,application/vnd.oasis.opendocument.text,.odt,application/vnd.oasis.opendocument.spreadsheet,.ods,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx,application/vnd.openxmlformats-officedocument.presentationml.presentation,.pptx,application/vnd.oasis.opendocument.presentation,.odp,application/x-fictionbook+xml,.fb2,application/epub+zip,.epub,application/vnd.comicbook+zip,.cbz,image/png,.png,image/jpeg,.jpg,.jpeg,image/webp,.webp'

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
  if (
    type === 'application/vnd.iptc.ninjs+json' ||
    type === 'application/ninjs+json' ||
    type === 'application/x-ninjs+json' ||
    name.endsWith('.ninjs.json') ||
    name.endsWith('.ninjs')
  ) {
    return 'ninjs'
  }
  if (
    type === 'application/feed+json' ||
    type === 'application/jsonfeed+json' ||
    type === 'application/x-jsonfeed+json' ||
    name.endsWith('.jsonfeed.json') ||
    name.endsWith('.jsonfeed')
  ) {
    return 'jsonfeed'
  }
  if (
    type === 'application/activity+json' ||
    type === 'application/ld+json+activity' ||
    type === 'application/x-activitystreams+json' ||
    name.endsWith('.as2.json') ||
    name.endsWith('.as2')
  ) {
    return 'as2'
  }
  if (
    type === 'application/geo+json' ||
    type === 'application/vnd.geo+json' ||
    type === 'application/x-geojson' ||
    name.endsWith('.geojson.json') ||
    name.endsWith('.geojson')
  ) {
    return 'geojson'
  }
  if (
    type === 'application/topo+json' ||
    type === 'application/vnd.topo+json' ||
    type === 'application/x-topojson' ||
    name.endsWith('.topo.json') ||
    name.endsWith('.topojson')
  ) {
    return 'topojson'
  }
  if (
    type === 'application/city+json' ||
    type === 'application/vnd.city+json' ||
    type === 'application/x-cityjson' ||
    name.endsWith('.city.json') ||
    name.endsWith('.cityjson')
  ) {
    return 'cityjson'
  }
  if (
    type === 'application/vnd.google-earth.kml+xml' ||
    type === 'application/kml+xml' ||
    type === 'application/x-kml+xml' ||
    name.endsWith('.kml.xml') ||
    name.endsWith('.kml')
  ) {
    return 'kml'
  }
  if (
    type === 'application/gpx+xml' ||
    type === 'application/x-gpx+xml' ||
    type === 'text/xml+gpx' ||
    name.endsWith('.gpx.xml') ||
    name.endsWith('.gpx')
  ) {
    return 'gpx'
  }
  if (
    type === 'application/vnd.osm+xml' ||
    type === 'application/osm+xml' ||
    type === 'application/x-osm+xml' ||
    name.endsWith('.osm.xml') ||
    name.endsWith('.osm')
  ) {
    return 'osm'
  }
  if (
    type === 'application/georss+xml' ||
    type === 'application/x-georss+xml' ||
    type === 'application/atom+xml;type=georss' ||
    name.endsWith('.georss.xml') ||
    name.endsWith('.georss')
  ) {
    return 'georss'
  }
  if (
    type === 'application/wkt' ||
    type === 'application/x-wkt' ||
    type === 'text/x-wkt' ||
    name.endsWith('.wkt.txt') ||
    name.endsWith('.wkt')
  ) {
    return 'wkt'
  }
  if (
    type === 'application/dxf' ||
    type === 'application/x-dxf' ||
    type === 'image/vnd.dxf' ||
    type === 'text/x-dxf' ||
    name.endsWith('.dxf.txt') ||
    name.endsWith('.dxf')
  ) {
    return 'dxf'
  }
  if (
    type === 'application/gml+xml' ||
    type === 'application/x-gml+xml' ||
    type === 'text/xml+gml' ||
    name.endsWith('.gml.xml') ||
    name.endsWith('.gml')
  ) {
    return 'gml'
  }
  if (
    type === 'image/svg+xml' ||
    type === 'application/svg+xml' ||
    type === 'text/xml+svg' ||
    name.endsWith('.svg.xml') ||
    name.endsWith('.svg')
  ) {
    return 'svg'
  }
  if (
    type === 'text/mapml' ||
    type === 'application/mapml+xml' ||
    type === 'application/x-mapml+xml' ||
    name.endsWith('.mapml.xml') ||
    name.endsWith('.mapml')
  ) {
    return 'mapml'
  }
  if (
    type === 'application/indoorgml+xml' ||
    type === 'application/x-indoorgml+xml' ||
    type === 'text/xml+indoorgml' ||
    name.endsWith('.indoorgml.xml') ||
    name.endsWith('.indoorgml')
  ) {
    return 'indoorgml'
  }
  if (
    type === 'application/citygml+xml' ||
    type === 'application/x-citygml+xml' ||
    type === 'text/xml+citygml' ||
    name.endsWith('.citygml.xml') ||
    name.endsWith('.citygml')
  ) {
    return 'citygml'
  }
  if (
    type === 'application/landxml+xml' ||
    type === 'application/x-landxml+xml' ||
    type === 'text/xml+landxml' ||
    name.endsWith('.landxml.xml') ||
    name.endsWith('.landxml')
  ) {
    return 'landxml'
  }
  if (
    type === 'application/ifcxml+xml' ||
    type === 'application/x-ifcxml+xml' ||
    type === 'text/xml+ifcxml' ||
    name.endsWith('.ifc.xml') ||
    name.endsWith('.ifcxml')
  ) {
    return 'ifcxml'
  }
  if (
    type === 'application/gbxml+xml' ||
    type === 'application/x-gbxml+xml' ||
    type === 'text/xml+gbxml' ||
    name.endsWith('.gbxml.xml') ||
    name.endsWith('.gbxml')
  ) {
    return 'gbxml'
  }
  if (
    type === 'application/bcfxml+xml' ||
    type === 'application/x-bcfxml+xml' ||
    type === 'text/xml+bcfxml' ||
    name.endsWith('.bcf.xml') ||
    name.endsWith('.bcfxml')
  ) {
    return 'bcfxml'
  }
  if (
    type === 'application/cobiexml+xml' ||
    type === 'application/x-cobiexml+xml' ||
    type === 'text/xml+cobiexml' ||
    name.endsWith('.cobie.xml') ||
    name.endsWith('.cobiexml')
  ) {
    return 'cobiexml'
  }
  if (
    type === 'application/landinfra+xml' ||
    type === 'application/x-landinfra+xml' ||
    type === 'text/xml+landinfra' ||
    name.endsWith('.landinfra.xml') ||
    name.endsWith('.landinfra')
  ) {
    return 'landinfra'
  }
  if (
    type === 'application/infragml+xml' ||
    type === 'application/x-infragml+xml' ||
    type === 'text/xml+infragml' ||
    name.endsWith('.infragml.xml') ||
    name.endsWith('.infragml')
  ) {
    return 'infragml'
  }
  if (
    type === 'application/vnd.opendrive+xml' ||
    type === 'application/x-opendrive+xml' ||
    type === 'text/xml+opendrive' ||
    name.endsWith('.opendrive.xml') ||
    name.endsWith('.opendrive') ||
    name.endsWith('.xodr')
  ) {
    return 'opendrive'
  }
  if (
    type === 'application/railml+xml' ||
    type === 'application/x-railml+xml' ||
    type === 'text/xml+railml' ||
    name.endsWith('.railml.xml') ||
    name.endsWith('.railml')
  ) {
    return 'railml'
  }
  if (
    type === 'application/transxml+xml' ||
    type === 'application/x-transxml+xml' ||
    type === 'text/xml+transxml' ||
    name.endsWith('.transxml.xml') ||
    name.endsWith('.transxml')
  ) {
    return 'transxml'
  }
  if (
    type === 'application/datex2+xml' ||
    type === 'application/x-datex2+xml' ||
    type === 'text/xml+datex2' ||
    name.endsWith('.datex2.xml') ||
    name.endsWith('.datex2')
  ) {
    return 'datex2'
  }
  if (
    type === 'application/netex+xml' ||
    type === 'application/x-netex+xml' ||
    type === 'text/xml+netex' ||
    name.endsWith('.netex.xml') ||
    name.endsWith('.netex')
  ) {
    return 'netex'
  }
  if (
    type === 'application/siri+xml' ||
    type === 'application/x-siri+xml' ||
    type === 'text/xml+siri' ||
    name.endsWith('.siri.xml') ||
    name.endsWith('.siri')
  ) {
    return 'siri'
  }
  if (
    type === 'application/transxchange+xml' ||
    type === 'application/x-transxchange+xml' ||
    type === 'text/xml+transxchange' ||
    name.endsWith('.transxchange.xml') ||
    name.endsWith('.transxchange')
  ) {
    return 'transxchange'
  }
  if (
    type === 'application/naptan+xml' ||
    type === 'application/x-naptan+xml' ||
    type === 'text/xml+naptan' ||
    name.endsWith('.naptan.xml') ||
    name.endsWith('.naptan')
  ) {
    return 'naptan'
  }
  if (
    type === 'application/gtfs+xml' ||
    type === 'application/x-gtfs+xml' ||
    type === 'text/xml+gtfs' ||
    name.endsWith('.gtfs.xml') ||
    name.endsWith('.gtfs')
  ) {
    return 'gtfs'
  }
  if (
    type === 'application/ifopt+xml' ||
    type === 'application/x-ifopt+xml' ||
    type === 'text/xml+ifopt' ||
    name.endsWith('.ifopt.xml') ||
    name.endsWith('.ifopt')
  ) {
    return 'ifopt'
  }
  if (
    type === 'application/ojp+xml' ||
    type === 'application/x-ojp+xml' ||
    type === 'text/xml+ojp' ||
    name.endsWith('.ojp.xml') ||
    name.endsWith('.ojp')
  ) {
    return 'ojp'
  }
  if (
    type === 'application/trias+xml' ||
    type === 'application/x-trias+xml' ||
    type === 'text/xml+trias' ||
    name.endsWith('.trias.xml') ||
    name.endsWith('.trias')
  ) {
    return 'trias'
  }
  if (
    type === 'application/vdv453+xml' ||
    type === 'application/x-vdv453+xml' ||
    type === 'text/xml+vdv453' ||
    name.endsWith('.vdv453.xml') ||
    name.endsWith('.vdv453')
  ) {
    return 'vdv453'
  }
  if (
    type === 'application/vdv454+xml' ||
    type === 'application/x-vdv454+xml' ||
    type === 'text/xml+vdv454' ||
    name.endsWith('.vdv454.xml') ||
    name.endsWith('.vdv454')
  ) {
    return 'vdv454'
  }
  if (
    type === 'application/vdv452+xml' ||
    type === 'application/x-vdv452+xml' ||
    type === 'text/xml+vdv452' ||
    name.endsWith('.vdv452.xml') ||
    name.endsWith('.vdv452')
  ) {
    return 'vdv452'
  }
  if (
    type === 'application/vdv462+xml' ||
    type === 'application/x-vdv462+xml' ||
    type === 'text/xml+vdv462' ||
    name.endsWith('.vdv462.xml') ||
    name.endsWith('.vdv462')
  ) {
    return 'vdv462'
  }
  if (
    type === 'application/vdv455+xml' ||
    type === 'application/x-vdv455+xml' ||
    type === 'text/xml+vdv455' ||
    name.endsWith('.vdv455.xml') ||
    name.endsWith('.vdv455')
  ) {
    return 'vdv455'
  }
  if (
    type === 'application/vdv731+xml' ||
    type === 'application/x-vdv731+xml' ||
    type === 'text/xml+vdv731' ||
    name.endsWith('.vdv731.xml') ||
    name.endsWith('.vdv731')
  ) {
    return 'vdv731'
  }
  if (
    type === 'application/vdv301+xml' ||
    type === 'application/x-vdv301+xml' ||
    type === 'text/xml+vdv301' ||
    name.endsWith('.vdv301.xml') ||
    name.endsWith('.vdv301')
  ) {
    return 'vdv301'
  }
  if (
    type === 'application/vdv423+xml' ||
    type === 'application/x-vdv423+xml' ||
    type === 'text/xml+vdv423' ||
    name.endsWith('.vdv423.xml') ||
    name.endsWith('.vdv423')
  ) {
    return 'vdv423'
  }
  if (
    type === 'application/vdv431+xml' ||
    type === 'application/x-vdv431+xml' ||
    type === 'text/xml+vdv431' ||
    name.endsWith('.vdv431.xml') ||
    name.endsWith('.vdv431')
  ) {
    return 'vdv431'
  }
  if (
    type === 'application/vdv300+xml' ||
    type === 'application/x-vdv300+xml' ||
    type === 'text/xml+vdv300' ||
    name.endsWith('.vdv300.xml') ||
    name.endsWith('.vdv300')
  ) {
    return 'vdv300'
  }
  if (
    type === 'application/vdv451+xml' ||
    type === 'application/x-vdv451+xml' ||
    type === 'text/xml+vdv451' ||
    name.endsWith('.vdv451.xml') ||
    name.endsWith('.vdv451')
  ) {
    return 'vdv451'
  }
  if (
    type === 'application/vdv432+xml' ||
    type === 'application/x-vdv432+xml' ||
    type === 'text/xml+vdv432' ||
    name.endsWith('.vdv432.xml') ||
    name.endsWith('.vdv432')
  ) {
    return 'vdv432'
  }
  if (
    type === 'application/vdv433+xml' ||
    type === 'application/x-vdv433+xml' ||
    type === 'text/xml+vdv433' ||
    name.endsWith('.vdv433.xml') ||
    name.endsWith('.vdv433')
  ) {
    return 'vdv433'
  }
  if (
    type === 'application/vdv434+xml' ||
    type === 'application/x-vdv434+xml' ||
    type === 'text/xml+vdv434' ||
    name.endsWith('.vdv434.xml') ||
    name.endsWith('.vdv434')
  ) {
    return 'vdv434'
  }
  if (
    type === 'application/vdv435+xml' ||
    type === 'application/x-vdv435+xml' ||
    type === 'text/xml+vdv435' ||
    name.endsWith('.vdv435.xml') ||
    name.endsWith('.vdv435')
  ) {
    return 'vdv435'
  }
  if (
    type === 'application/vdv436+xml' ||
    type === 'application/x-vdv436+xml' ||
    type === 'text/xml+vdv436' ||
    name.endsWith('.vdv436.xml') ||
    name.endsWith('.vdv436')
  ) {
    return 'vdv436'
  }
  if (
    type === 'application/vdv456+xml' ||
    type === 'application/x-vdv456+xml' ||
    type === 'text/xml+vdv456' ||
    name.endsWith('.vdv456.xml') ||
    name.endsWith('.vdv456')
  ) {
    return 'vdv456'
  }
  if (
    type === 'application/vdv457+xml' ||
    type === 'application/x-vdv457+xml' ||
    type === 'text/xml+vdv457' ||
    name.endsWith('.vdv457.xml') ||
    name.endsWith('.vdv457')
  ) {
    return 'vdv457'
  }
  if (
    type === 'application/vdv459+xml' ||
    type === 'application/x-vdv459+xml' ||
    type === 'text/xml+vdv459' ||
    name.endsWith('.vdv459.xml') ||
    name.endsWith('.vdv459')
  ) {
    return 'vdv459'
  }
  if (
    type === 'application/vdv461+xml' ||
    type === 'application/x-vdv461+xml' ||
    type === 'text/xml+vdv461' ||
    name.endsWith('.vdv461.xml') ||
    name.endsWith('.vdv461')
  ) {
    return 'vdv461'
  }
  if (
    type === 'application/vdv458+xml' ||
    type === 'application/x-vdv458+xml' ||
    type === 'text/xml+vdv458' ||
    name.endsWith('.vdv458.xml') ||
    name.endsWith('.vdv458')
  ) {
    return 'vdv458'
  }
  if (
    type === 'application/vdv460+xml' ||
    type === 'application/x-vdv460+xml' ||
    type === 'text/xml+vdv460' ||
    name.endsWith('.vdv460.xml') ||
    name.endsWith('.vdv460')
  ) {
    return 'vdv460'
  }
  if (
    type === 'application/xliff+xml' ||
    type === 'application/x-xliff+xml' ||
    type === 'text/xml+xliff' ||
    name.endsWith('.xliff.xml') ||
    name.endsWith('.xliff') ||
    name.endsWith('.xlf')
  ) {
    return 'xliff'
  }
  if (
    type === 'application/tmx+xml' ||
    type === 'application/x-tmx+xml' ||
    type === 'text/xml+tmx' ||
    name.endsWith('.tmx.xml') ||
    name.endsWith('.tmx')
  ) {
    return 'tmx'
  }
  if (
    type === 'application/tbx+xml' ||
    type === 'application/x-tbx+xml' ||
    type === 'text/xml+tbx' ||
    name.endsWith('.tbx.xml') ||
    name.endsWith('.tbx')
  ) {
    return 'tbx'
  }
  if (
    type === 'text/x-po' ||
    type === 'application/x-po' ||
    type === 'text/x-gettext' ||
    type === 'application/x-gettext' ||
    name.endsWith('.pot') ||
    name.endsWith('.po')
  ) {
    return 'po'
  }
  if (
    type === 'application/dita+xml' ||
    type === 'application/x-dita+xml' ||
    type === 'text/xml+dita' ||
    name.endsWith('.dita.xml') ||
    name.endsWith('.dita')
  ) {
    return 'dita'
  }
  if (
    type === 'text/vcard' ||
    type === 'text/x-vcard' ||
    type === 'text/directory' ||
    name.endsWith('.vcard') ||
    name.endsWith('.vcf')
  ) {
    return 'vcard'
  }
  if (
    type === 'application/rdf+xml' ||
    type === 'application/x-rdf+xml' ||
    type === 'text/xml+rdf' ||
    name.endsWith('.rdf.xml') ||
    name.endsWith('.rdf')
  ) {
    return 'rdf'
  }
  if (
    type === 'application/opds+xml' ||
    type === 'application/atom+xml;profile=opds' ||
    type === 'text/xml+opds' ||
    name.endsWith('.opds.xml') ||
    name.endsWith('.opds')
  ) {
    return 'opds'
  }
  if (
    type === 'text/x-vtodo' ||
    type === 'text/calendar+vtodo' ||
    type === 'application/x-vtodo' ||
    name.endsWith('.vtodo') ||
    name.endsWith('.todo')
  ) {
    return 'vtodo'
  }
  if (
    type === 'text/x-vjournal' ||
    type === 'text/calendar+vjournal' ||
    type === 'application/x-vjournal' ||
    name.endsWith('.vjournal') ||
    name.endsWith('.journal')
  ) {
    return 'vjournal'
  }
  if (
    type === 'text/x-vfreebusy' ||
    type === 'text/calendar+vfreebusy' ||
    type === 'application/x-vfreebusy' ||
    name.endsWith('.vfreebusy') ||
    name.endsWith('.freebusy')
  ) {
    return 'vfreebusy'
  }
  if (
    type === 'text/x-vavailability' ||
    type === 'text/calendar+vavailability' ||
    type === 'application/x-vavailability' ||
    name.endsWith('.vavailability') ||
    name.endsWith('.availability')
  ) {
    return 'vavailability'
  }
  if (
    type === 'text/x-vtimezone' ||
    type === 'text/calendar+vtimezone' ||
    type === 'application/x-vtimezone' ||
    name.endsWith('.vtimezone') ||
    name.endsWith('.timezone')
  ) {
    return 'vtimezone'
  }
  if (
    type === 'text/x-valarm' ||
    type === 'text/calendar+valarm' ||
    type === 'application/x-valarm' ||
    name.endsWith('.valarm') ||
    name.endsWith('.alarm')
  ) {
    return 'valarm'
  }
  if (
    type === 'text/x-vevent' ||
    type === 'text/calendar+vevent' ||
    type === 'application/x-vevent' ||
    name.endsWith('.vevent') ||
    name.endsWith('.event')
  ) {
    return 'vevent'
  }
  if (
    type === 'application/calendar+xml' ||
    type === 'application/xcal+xml' ||
    type === 'text/calendar+xml' ||
    name.endsWith('.ics.xml') ||
    name.endsWith('.xcal')
  ) {
    return 'xcal'
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
    type === 'application/cdwa+xml' ||
    type === 'application/x-cdwa+xml' ||
    type === 'text/x-cdwa+xml' ||
    type === 'application/cdwalite+xml' ||
    name.endsWith('.cdwa.xml') ||
    name.endsWith('.cdwalite.xml') ||
    name.endsWith('.cdwalite') ||
    name.endsWith('.cdwa')
  ) {
    return 'cdwa'
  }
  if (
    type === 'application/spectrum+xml' ||
    type === 'application/x-spectrum+xml' ||
    type === 'text/x-spectrum+xml' ||
    name.endsWith('.spectrum.xml') ||
    name.endsWith('.spectrum')
  ) {
    return 'spectrum'
  }
  if (
    type === 'application/vnd.tdwg.dwc+xml' ||
    type === 'application/dwc+xml' ||
    type === 'application/x-dwc+xml' ||
    type === 'text/x-dwc+xml' ||
    type === 'application/darwincore+xml' ||
    name.endsWith('.dwc.xml') ||
    name.endsWith('.darwincore.xml') ||
    name.endsWith('.darwincore') ||
    name.endsWith('.dwc')
  ) {
    return 'dwc'
  }
  if (
    type === 'application/objectid+xml' ||
    type === 'application/x-objectid+xml' ||
    type === 'text/x-objectid+xml' ||
    name.endsWith('.objectid.xml') ||
    name.endsWith('.objectid') ||
    name.endsWith('.oid')
  ) {
    return 'objectid'
  }
  if (
    type === 'application/eac-cpf+xml' ||
    type === 'application/x-eac-cpf+xml' ||
    type === 'text/x-eac-cpf+xml' ||
    type === 'application/eac+xml' ||
    name.endsWith('.eac-cpf.xml') ||
    name.endsWith('.eac.xml') ||
    name.endsWith('.eac-cpf') ||
    name.endsWith('.eac') ||
    name.endsWith('.cpf')
  ) {
    return 'eac'
  }
  if (
    type === 'application/cidoc-crm+xml' ||
    type === 'application/x-cidoc-crm+xml' ||
    type === 'text/x-cidoc-crm+xml' ||
    type === 'application/cidoc+xml' ||
    type === 'application/crm+xml' ||
    name.endsWith('.cidoc-crm.xml') ||
    name.endsWith('.cidoc.xml') ||
    name.endsWith('.crm.xml') ||
    name.endsWith('.cidoc-crm') ||
    name.endsWith('.cidoc') ||
    name.endsWith('.crm')
  ) {
    return 'crm'
  }
  if (
    type === 'application/metsrights+xml' ||
    type === 'application/x-metsrights+xml' ||
    type === 'text/x-metsrights+xml' ||
    type === 'application/rights+xml' ||
    name.endsWith('.metsrights.xml') ||
    name.endsWith('.rights.xml') ||
    name.endsWith('.metsrights') ||
    name.endsWith('.rights') ||
    name.endsWith('.rmd')
  ) {
    return 'rights'
  }
  if (
    type === 'application/textmd+xml' ||
    type === 'application/x-textmd+xml' ||
    type === 'text/x-textmd+xml' ||
    name.endsWith('.textmd.xml') ||
    name.endsWith('.textmd') ||
    name.endsWith('.tmd')
  ) {
    return 'textmd'
  }
  if (
    type === 'application/pbcore+xml' ||
    type === 'application/x-pbcore+xml' ||
    type === 'text/x-pbcore+xml' ||
    name.endsWith('.pbcore.xml') ||
    name.endsWith('.pbcore') ||
    name.endsWith('.pbc')
  ) {
    return 'pbcore'
  }
  if (
    type === 'application/ebucore+xml' ||
    type === 'application/x-ebucore+xml' ||
    type === 'text/x-ebucore+xml' ||
    name.endsWith('.ebucore.xml') ||
    name.endsWith('.ebucore') ||
    name.endsWith('.ebu')
  ) {
    return 'ebucore'
  }
  if (
    type === 'application/mpeg7+xml' ||
    type === 'application/x-mpeg7+xml' ||
    type === 'text/x-mpeg7+xml' ||
    name.endsWith('.mpeg7.xml') ||
    name.endsWith('.mpeg7') ||
    name.endsWith('.mp7')
  ) {
    return 'mpeg7'
  }
  if (
    type === 'application/aes57+xml' ||
    type === 'application/x-aes57+xml' ||
    type === 'text/x-aes57+xml' ||
    name.endsWith('.aes57.xml') ||
    name.endsWith('.aes57') ||
    name.endsWith('.aes')
  ) {
    return 'aes57'
  }
  if (
    type === 'application/lom+xml' ||
    type === 'application/x-lom+xml' ||
    type === 'text/x-lom+xml' ||
    type === 'application/ieee-lom+xml' ||
    name.endsWith('.lom.xml') ||
    name.endsWith('.ieee-lom') ||
    name.endsWith('.lom')
  ) {
    return 'lom'
  }
  if (
    type === 'application/imscp+xml' ||
    type === 'application/x-imscp+xml' ||
    type === 'text/x-imscp+xml' ||
    name.endsWith('.imscp.xml') ||
    name.endsWith('.imsmanifest.xml') ||
    name === 'imsmanifest.xml' ||
    name.endsWith('.imscp') ||
    name.endsWith('.ims')
  ) {
    return 'imscp'
  }
  if (
    type === 'application/vnd.iptc.g2+xml' ||
    type === 'application/newsml-g2+xml' ||
    type === 'application/x-newsmlg2+xml' ||
    type === 'text/x-newsmlg2+xml' ||
    name.endsWith('.newsmlg2.xml') ||
    name.endsWith('.newsml-g2.xml') ||
    name.endsWith('.newsmlg2') ||
    name.endsWith('.newsml-g2') ||
    name.endsWith('.nar')
  ) {
    return 'newsmlg2'
  }
  if (
    type === 'application/newsml+xml' ||
    type === 'application/x-newsml+xml' ||
    type === 'text/x-newsml+xml' ||
    name.endsWith('.newsml.xml') ||
    name.endsWith('.newsml') ||
    name.endsWith('.nml')
  ) {
    return 'newsml'
  }
  if (
    type === 'application/nitf+xml' ||
    type === 'application/x-nitf+xml' ||
    type === 'text/x-nitf+xml' ||
    name.endsWith('.nitf.xml') ||
    name.endsWith('.nitf')
  ) {
    return 'nitf'
  }
  if (
    type === 'application/sportsml+xml' ||
    type === 'application/x-sportsml+xml' ||
    type === 'text/x-sportsml+xml' ||
    name.endsWith('.sportsml.xml') ||
    name.endsWith('.sportsml') ||
    name.endsWith('.sml')
  ) {
    return 'sportsml'
  }
  if (
    type === 'application/eventsml+xml' ||
    type === 'application/x-eventsml+xml' ||
    type === 'text/x-eventsml+xml' ||
    name.endsWith('.eventsml.xml') ||
    name.endsWith('.eventsml')
  ) {
    return 'eventsml'
  }
  if (
    type === 'application/vnd.iptc.rnews+xml' ||
    type === 'application/rnews+xml' ||
    type === 'application/x-rnews+xml' ||
    type === 'text/x-rnews+xml' ||
    name.endsWith('.rnews.xml') ||
    name.endsWith('.rnews')
  ) {
    return 'rnews'
  }
  if (
    type === 'application/prism+xml' ||
    type === 'application/x-prism+xml' ||
    type === 'text/x-prism+xml' ||
    name.endsWith('.prism.xml') ||
    name.endsWith('.prism')
  ) {
    return 'prism'
  }
  if (
    type === 'application/hnews+xml' ||
    type === 'application/x-hnews+xml' ||
    type === 'text/x-hnews+xml' ||
    name.endsWith('.hnews.xml') ||
    name.endsWith('.hnews')
  ) {
    return 'hnews'
  }
  if (
    type === 'application/iptc+xml' ||
    type === 'application/x-iptc+xml' ||
    type === 'text/x-iptc+xml' ||
    name.endsWith('.iptc.xml') ||
    name.endsWith('.iptc')
  ) {
    return 'iptc'
  }
  if (
    type === 'application/anpa+xml' ||
    type === 'application/x-anpa+xml' ||
    type === 'text/x-anpa+xml' ||
    name.endsWith('.anpa.xml') ||
    name.endsWith('.anpa')
  ) {
    return 'anpa'
  }
  if (
    type === 'application/vnd.google-earth.kml+xml' ||
    type === 'application/kml+xml' ||
    type === 'application/x-kml+xml' ||
    name.endsWith('.kml.xml') ||
    name.endsWith('.kml')
  ) {
    return 'kml'
  }
  if (
    type === 'application/gpx+xml' ||
    type === 'application/x-gpx+xml' ||
    type === 'text/xml+gpx' ||
    name.endsWith('.gpx.xml') ||
    name.endsWith('.gpx')
  ) {
    return 'gpx'
  }
  if (
    type === 'application/vnd.osm+xml' ||
    type === 'application/osm+xml' ||
    type === 'application/x-osm+xml' ||
    name.endsWith('.osm.xml') ||
    name.endsWith('.osm')
  ) {
    return 'osm'
  }
  if (
    type === 'application/georss+xml' ||
    type === 'application/x-georss+xml' ||
    type === 'application/atom+xml;type=georss' ||
    name.endsWith('.georss.xml') ||
    name.endsWith('.georss')
  ) {
    return 'georss'
  }
  if (
    type === 'application/gml+xml' ||
    type === 'application/x-gml+xml' ||
    type === 'text/xml+gml' ||
    name.endsWith('.gml.xml') ||
    name.endsWith('.gml')
  ) {
    return 'gml'
  }
  if (
    type === 'image/svg+xml' ||
    type === 'application/svg+xml' ||
    type === 'text/xml+svg' ||
    name.endsWith('.svg.xml') ||
    name.endsWith('.svg')
  ) {
    return 'svg'
  }
  if (
    type === 'text/mapml' ||
    type === 'application/mapml+xml' ||
    type === 'application/x-mapml+xml' ||
    name.endsWith('.mapml.xml') ||
    name.endsWith('.mapml')
  ) {
    return 'mapml'
  }
  if (
    type === 'application/indoorgml+xml' ||
    type === 'application/x-indoorgml+xml' ||
    type === 'text/xml+indoorgml' ||
    name.endsWith('.indoorgml.xml') ||
    name.endsWith('.indoorgml')
  ) {
    return 'indoorgml'
  }
  if (
    type === 'application/citygml+xml' ||
    type === 'application/x-citygml+xml' ||
    type === 'text/xml+citygml' ||
    name.endsWith('.citygml.xml') ||
    name.endsWith('.citygml')
  ) {
    return 'citygml'
  }
  if (
    type === 'application/landxml+xml' ||
    type === 'application/x-landxml+xml' ||
    type === 'text/xml+landxml' ||
    name.endsWith('.landxml.xml') ||
    name.endsWith('.landxml')
  ) {
    return 'landxml'
  }
  if (
    type === 'application/ifcxml+xml' ||
    type === 'application/x-ifcxml+xml' ||
    type === 'text/xml+ifcxml' ||
    name.endsWith('.ifc.xml') ||
    name.endsWith('.ifcxml')
  ) {
    return 'ifcxml'
  }
  if (
    type === 'application/gbxml+xml' ||
    type === 'application/x-gbxml+xml' ||
    type === 'text/xml+gbxml' ||
    name.endsWith('.gbxml.xml') ||
    name.endsWith('.gbxml')
  ) {
    return 'gbxml'
  }
  if (
    type === 'application/bcfxml+xml' ||
    type === 'application/x-bcfxml+xml' ||
    type === 'text/xml+bcfxml' ||
    name.endsWith('.bcf.xml') ||
    name.endsWith('.bcfxml')
  ) {
    return 'bcfxml'
  }
  if (
    type === 'application/cobiexml+xml' ||
    type === 'application/x-cobiexml+xml' ||
    type === 'text/xml+cobiexml' ||
    name.endsWith('.cobie.xml') ||
    name.endsWith('.cobiexml')
  ) {
    return 'cobiexml'
  }
  if (
    type === 'application/landinfra+xml' ||
    type === 'application/x-landinfra+xml' ||
    type === 'text/xml+landinfra' ||
    name.endsWith('.landinfra.xml') ||
    name.endsWith('.landinfra')
  ) {
    return 'landinfra'
  }
  if (
    type === 'application/infragml+xml' ||
    type === 'application/x-infragml+xml' ||
    type === 'text/xml+infragml' ||
    name.endsWith('.infragml.xml') ||
    name.endsWith('.infragml')
  ) {
    return 'infragml'
  }
  if (
    type === 'application/vnd.opendrive+xml' ||
    type === 'application/x-opendrive+xml' ||
    type === 'text/xml+opendrive' ||
    name.endsWith('.opendrive.xml') ||
    name.endsWith('.opendrive') ||
    name.endsWith('.xodr')
  ) {
    return 'opendrive'
  }
  if (
    type === 'application/railml+xml' ||
    type === 'application/x-railml+xml' ||
    type === 'text/xml+railml' ||
    name.endsWith('.railml.xml') ||
    name.endsWith('.railml')
  ) {
    return 'railml'
  }
  if (
    type === 'application/transxml+xml' ||
    type === 'application/x-transxml+xml' ||
    type === 'text/xml+transxml' ||
    name.endsWith('.transxml.xml') ||
    name.endsWith('.transxml')
  ) {
    return 'transxml'
  }
  if (
    type === 'application/datex2+xml' ||
    type === 'application/x-datex2+xml' ||
    type === 'text/xml+datex2' ||
    name.endsWith('.datex2.xml') ||
    name.endsWith('.datex2')
  ) {
    return 'datex2'
  }
  if (
    type === 'application/netex+xml' ||
    type === 'application/x-netex+xml' ||
    type === 'text/xml+netex' ||
    name.endsWith('.netex.xml') ||
    name.endsWith('.netex')
  ) {
    return 'netex'
  }
  if (
    type === 'application/siri+xml' ||
    type === 'application/x-siri+xml' ||
    type === 'text/xml+siri' ||
    name.endsWith('.siri.xml') ||
    name.endsWith('.siri')
  ) {
    return 'siri'
  }
  if (
    type === 'application/transxchange+xml' ||
    type === 'application/x-transxchange+xml' ||
    type === 'text/xml+transxchange' ||
    name.endsWith('.transxchange.xml') ||
    name.endsWith('.transxchange')
  ) {
    return 'transxchange'
  }
  if (
    type === 'application/naptan+xml' ||
    type === 'application/x-naptan+xml' ||
    type === 'text/xml+naptan' ||
    name.endsWith('.naptan.xml') ||
    name.endsWith('.naptan')
  ) {
    return 'naptan'
  }
  if (
    type === 'application/gtfs+xml' ||
    type === 'application/x-gtfs+xml' ||
    type === 'text/xml+gtfs' ||
    name.endsWith('.gtfs.xml') ||
    name.endsWith('.gtfs')
  ) {
    return 'gtfs'
  }
  if (
    type === 'application/ifopt+xml' ||
    type === 'application/x-ifopt+xml' ||
    type === 'text/xml+ifopt' ||
    name.endsWith('.ifopt.xml') ||
    name.endsWith('.ifopt')
  ) {
    return 'ifopt'
  }
  if (
    type === 'application/ojp+xml' ||
    type === 'application/x-ojp+xml' ||
    type === 'text/xml+ojp' ||
    name.endsWith('.ojp.xml') ||
    name.endsWith('.ojp')
  ) {
    return 'ojp'
  }
  if (
    type === 'application/trias+xml' ||
    type === 'application/x-trias+xml' ||
    type === 'text/xml+trias' ||
    name.endsWith('.trias.xml') ||
    name.endsWith('.trias')
  ) {
    return 'trias'
  }
  if (
    type === 'application/vdv453+xml' ||
    type === 'application/x-vdv453+xml' ||
    type === 'text/xml+vdv453' ||
    name.endsWith('.vdv453.xml') ||
    name.endsWith('.vdv453')
  ) {
    return 'vdv453'
  }
  if (
    type === 'application/vdv454+xml' ||
    type === 'application/x-vdv454+xml' ||
    type === 'text/xml+vdv454' ||
    name.endsWith('.vdv454.xml') ||
    name.endsWith('.vdv454')
  ) {
    return 'vdv454'
  }
  if (
    type === 'application/vdv452+xml' ||
    type === 'application/x-vdv452+xml' ||
    type === 'text/xml+vdv452' ||
    name.endsWith('.vdv452.xml') ||
    name.endsWith('.vdv452')
  ) {
    return 'vdv452'
  }
  if (
    type === 'application/vdv462+xml' ||
    type === 'application/x-vdv462+xml' ||
    type === 'text/xml+vdv462' ||
    name.endsWith('.vdv462.xml') ||
    name.endsWith('.vdv462')
  ) {
    return 'vdv462'
  }
  if (
    type === 'application/vdv455+xml' ||
    type === 'application/x-vdv455+xml' ||
    type === 'text/xml+vdv455' ||
    name.endsWith('.vdv455.xml') ||
    name.endsWith('.vdv455')
  ) {
    return 'vdv455'
  }
  if (
    type === 'application/vdv731+xml' ||
    type === 'application/x-vdv731+xml' ||
    type === 'text/xml+vdv731' ||
    name.endsWith('.vdv731.xml') ||
    name.endsWith('.vdv731')
  ) {
    return 'vdv731'
  }
  if (
    type === 'application/vdv301+xml' ||
    type === 'application/x-vdv301+xml' ||
    type === 'text/xml+vdv301' ||
    name.endsWith('.vdv301.xml') ||
    name.endsWith('.vdv301')
  ) {
    return 'vdv301'
  }
  if (
    type === 'application/vdv423+xml' ||
    type === 'application/x-vdv423+xml' ||
    type === 'text/xml+vdv423' ||
    name.endsWith('.vdv423.xml') ||
    name.endsWith('.vdv423')
  ) {
    return 'vdv423'
  }
  if (
    type === 'application/vdv431+xml' ||
    type === 'application/x-vdv431+xml' ||
    type === 'text/xml+vdv431' ||
    name.endsWith('.vdv431.xml') ||
    name.endsWith('.vdv431')
  ) {
    return 'vdv431'
  }
  if (
    type === 'application/vdv300+xml' ||
    type === 'application/x-vdv300+xml' ||
    type === 'text/xml+vdv300' ||
    name.endsWith('.vdv300.xml') ||
    name.endsWith('.vdv300')
  ) {
    return 'vdv300'
  }
  if (
    type === 'application/vdv451+xml' ||
    type === 'application/x-vdv451+xml' ||
    type === 'text/xml+vdv451' ||
    name.endsWith('.vdv451.xml') ||
    name.endsWith('.vdv451')
  ) {
    return 'vdv451'
  }
  if (
    type === 'application/vdv432+xml' ||
    type === 'application/x-vdv432+xml' ||
    type === 'text/xml+vdv432' ||
    name.endsWith('.vdv432.xml') ||
    name.endsWith('.vdv432')
  ) {
    return 'vdv432'
  }
  if (
    type === 'application/vdv433+xml' ||
    type === 'application/x-vdv433+xml' ||
    type === 'text/xml+vdv433' ||
    name.endsWith('.vdv433.xml') ||
    name.endsWith('.vdv433')
  ) {
    return 'vdv433'
  }
  if (
    type === 'application/vdv434+xml' ||
    type === 'application/x-vdv434+xml' ||
    type === 'text/xml+vdv434' ||
    name.endsWith('.vdv434.xml') ||
    name.endsWith('.vdv434')
  ) {
    return 'vdv434'
  }
  if (
    type === 'application/vdv435+xml' ||
    type === 'application/x-vdv435+xml' ||
    type === 'text/xml+vdv435' ||
    name.endsWith('.vdv435.xml') ||
    name.endsWith('.vdv435')
  ) {
    return 'vdv435'
  }
  if (
    type === 'application/vdv436+xml' ||
    type === 'application/x-vdv436+xml' ||
    type === 'text/xml+vdv436' ||
    name.endsWith('.vdv436.xml') ||
    name.endsWith('.vdv436')
  ) {
    return 'vdv436'
  }
  if (
    type === 'application/vdv456+xml' ||
    type === 'application/x-vdv456+xml' ||
    type === 'text/xml+vdv456' ||
    name.endsWith('.vdv456.xml') ||
    name.endsWith('.vdv456')
  ) {
    return 'vdv456'
  }
  if (
    type === 'application/vdv457+xml' ||
    type === 'application/x-vdv457+xml' ||
    type === 'text/xml+vdv457' ||
    name.endsWith('.vdv457.xml') ||
    name.endsWith('.vdv457')
  ) {
    return 'vdv457'
  }
  if (
    type === 'application/vdv459+xml' ||
    type === 'application/x-vdv459+xml' ||
    type === 'text/xml+vdv459' ||
    name.endsWith('.vdv459.xml') ||
    name.endsWith('.vdv459')
  ) {
    return 'vdv459'
  }
  if (
    type === 'application/vdv461+xml' ||
    type === 'application/x-vdv461+xml' ||
    type === 'text/xml+vdv461' ||
    name.endsWith('.vdv461.xml') ||
    name.endsWith('.vdv461')
  ) {
    return 'vdv461'
  }
  if (
    type === 'application/vdv458+xml' ||
    type === 'application/x-vdv458+xml' ||
    type === 'text/xml+vdv458' ||
    name.endsWith('.vdv458.xml') ||
    name.endsWith('.vdv458')
  ) {
    return 'vdv458'
  }
  if (
    type === 'application/vdv460+xml' ||
    type === 'application/x-vdv460+xml' ||
    type === 'text/xml+vdv460' ||
    name.endsWith('.vdv460.xml') ||
    name.endsWith('.vdv460')
  ) {
    return 'vdv460'
  }
  if (
    type === 'application/xliff+xml' ||
    type === 'application/x-xliff+xml' ||
    type === 'text/xml+xliff' ||
    name.endsWith('.xliff.xml') ||
    name.endsWith('.xliff') ||
    name.endsWith('.xlf')
  ) {
    return 'xliff'
  }
  if (
    type === 'application/tmx+xml' ||
    type === 'application/x-tmx+xml' ||
    type === 'text/xml+tmx' ||
    name.endsWith('.tmx.xml') ||
    name.endsWith('.tmx')
  ) {
    return 'tmx'
  }
  if (
    type === 'application/tbx+xml' ||
    type === 'application/x-tbx+xml' ||
    type === 'text/xml+tbx' ||
    name.endsWith('.tbx.xml') ||
    name.endsWith('.tbx')
  ) {
    return 'tbx'
  }
  if (
    type === 'text/x-po' ||
    type === 'application/x-po' ||
    type === 'text/x-gettext' ||
    type === 'application/x-gettext' ||
    name.endsWith('.pot') ||
    name.endsWith('.po')
  ) {
    return 'po'
  }
  if (
    type === 'application/dita+xml' ||
    type === 'application/x-dita+xml' ||
    type === 'text/xml+dita' ||
    name.endsWith('.dita.xml') ||
    name.endsWith('.dita')
  ) {
    return 'dita'
  }
  if (
    type === 'text/vcard' ||
    type === 'text/x-vcard' ||
    type === 'text/directory' ||
    name.endsWith('.vcard') ||
    name.endsWith('.vcf')
  ) {
    return 'vcard'
  }
  if (
    type === 'application/rdf+xml' ||
    type === 'application/x-rdf+xml' ||
    type === 'text/xml+rdf' ||
    name.endsWith('.rdf.xml') ||
    name.endsWith('.rdf')
  ) {
    return 'rdf'
  }
  if (
    type === 'application/opds+xml' ||
    type === 'application/atom+xml;profile=opds' ||
    type === 'text/xml+opds' ||
    name.endsWith('.opds.xml') ||
    name.endsWith('.opds')
  ) {
    return 'opds'
  }
  if (
    type === 'text/x-vtodo' ||
    type === 'text/calendar+vtodo' ||
    type === 'application/x-vtodo' ||
    name.endsWith('.vtodo') ||
    name.endsWith('.todo')
  ) {
    return 'vtodo'
  }
  if (
    type === 'text/x-vjournal' ||
    type === 'text/calendar+vjournal' ||
    type === 'application/x-vjournal' ||
    name.endsWith('.vjournal') ||
    name.endsWith('.journal')
  ) {
    return 'vjournal'
  }
  if (
    type === 'text/x-vfreebusy' ||
    type === 'text/calendar+vfreebusy' ||
    type === 'application/x-vfreebusy' ||
    name.endsWith('.vfreebusy') ||
    name.endsWith('.freebusy')
  ) {
    return 'vfreebusy'
  }
  if (
    type === 'text/x-vavailability' ||
    type === 'text/calendar+vavailability' ||
    type === 'application/x-vavailability' ||
    name.endsWith('.vavailability') ||
    name.endsWith('.availability')
  ) {
    return 'vavailability'
  }
  if (
    type === 'text/x-vtimezone' ||
    type === 'text/calendar+vtimezone' ||
    type === 'application/x-vtimezone' ||
    name.endsWith('.vtimezone') ||
    name.endsWith('.timezone')
  ) {
    return 'vtimezone'
  }
  if (
    type === 'text/x-valarm' ||
    type === 'text/calendar+valarm' ||
    type === 'application/x-valarm' ||
    name.endsWith('.valarm') ||
    name.endsWith('.alarm')
  ) {
    return 'valarm'
  }
  if (
    type === 'text/x-vevent' ||
    type === 'text/calendar+vevent' ||
    type === 'application/x-vevent' ||
    name.endsWith('.vevent') ||
    name.endsWith('.event')
  ) {
    return 'vevent'
  }
  if (
    type === 'application/calendar+xml' ||
    type === 'application/xcal+xml' ||
    type === 'text/calendar+xml' ||
    name.endsWith('.ics.xml') ||
    name.endsWith('.xcal')
  ) {
    return 'xcal'
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
    throw new Error('Chỉ nhận PDF, TXT, Markdown, HTML, JSON, JSONL, YAML, XML, CSV, TSV, TOML, Org, LaTeX, INI, AsciiDoc, RST, Textile, MediaWiki, DokuWiki, DocBook, OPML, Atom, RSS, Typst, Gemtext, POD, BBCode, Fountain, TiddlyWiki, Texinfo, roff, Jupyter, BibTeX, SRT, VTT, LRC, ICS, VTODO, VJOURNAL, VFREEBUSY, VAVAILABILITY, VTIMEZONE, VALARM, VEVENT, XCAL, CUE, ASS, TTML, SBV, SAMI, SUB, STL, SCC, USF, RT, MPL, DjVu, PS, TEI, JATS, RIS, ENW, CSL-JSON, NBIB, CSL-YAML, EndNote XML, MODS, CFF, DataCite, MARCXML, Dublin Core, ONIX, Unixref, BibJSON, PubMed, JSON-LD, BIBFRAME, Crossref, EAD, METS, PREMIS, MIX, ALTO, PAGE, FOXML, EDM, LIDO, VRA, CDWA Lite, SPECTRUM, Darwin Core, Object ID, EAC-CPF, CIDOC CRM, METS Rights, TextMD, PBCore, EBUCore, RTF, DOCX, ODT, ODS, XLSX, PPTX, ODP, FB2, EPUB, CBZ, PNG, JPEG, WEBP, WKT, GML, DXF, MapML, CityJSON hoặc IndoorGML.')
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
    filename.replace(/\.(pdf|txt|text|md|markdown|html|htm|png|jpe?g|webp|jsonl|ndjson|ipynb|bib\.json|json-ld|jsonld|ninjs\.json|jsonfeed\.json|as2\.json|geojson\.json|topo\.json|kml\.xml|gpx\.xml|osm\.xml|georss\.xml|wkt\.txt|gml\.xml|svg\.xml|dxf\.txt|mapml\.xml|city\.json|indoorgml\.xml|citygml\.xml|landxml\.xml|ifcxml\.xml|ifc\.xml|gbxml\.xml|bcfxml\.xml|bcf\.xml|cobiexml\.xml|cobie\.xml|landinfra\.xml|infragml\.xml|opendrive\.xml|railml\.xml|transxml\.xml|datex2\.xml|netex\.xml|siri\.xml|transxchange\.xml|naptan\.xml|gtfs\.xml|ifopt\.xml|ojp\.xml|trias\.xml|vdv453\.xml|vdv454\.xml|vdv452\.xml|vdv462\.xml|vdv455\.xml|vdv731\.xml|vdv301\.xml|vdv423\.xml|vdv431\.xml|vdv300\.xml|vdv451\.xml|vdv432\.xml|vdv433\.xml|vdv434\.xml|vdv435\.xml|vdv436\.xml|vdv456\.xml|vdv457\.xml|vdv459\.xml|vdv461\.xml|vdv458\.xml|vdv460\.xml|xliff\.xml|tmx\.xml|tbx\.xml|dita\.xml|rdf\.xml|opds\.xml|ics\.xml|crossref\.json|json|csl\.ya?ml|ya?ml|endnote\.xml|mods\.xml|datacite\.xml|marc\.xml|dublincore\.xml|dc\.xml|onix\.xml|unixref\.xml|crossref\.xml|pubmed\.xml|bibframe\.xml|bf\.xml|ead\.xml|mets\.xml|premis\.xml|mix\.xml|alto\.xml|page\.xml|pcgts\.xml|foxml\.xml|edm\.xml|lido\.xml|vra\.xml|vracore\.xml|cdwa\.xml|cdwalite\.xml|spectrum\.xml|darwincore\.xml|dwc\.xml|objectid\.xml|metsrights\.xml|rights\.xml|textmd\.xml|pbcore\.xml|ebucore\.xml|mpeg7\.xml|aes57\.xml|lom\.xml|imscp\.xml|imsmanifest\.xml|sportsml\.xml|eventsml\.xml|newsmlg2\.xml|newsml-g2\.xml|rnews\.xml|prism\.xml|hnews\.xml|iptc\.xml|anpa\.xml|newsml\.xml|nitf\.xml|eac-cpf\.xml|cidoc-crm\.xml|cidoc\.xml|eac\.xml|crm\.xml|xml|csv|tsv|toml|org|texinfo|texi|txi|tex|latex|ini|cfg|adoc|asciidoc|rst|rest|textile|txtl|mediawiki|wiki|dokuwiki|dwc|dw|dbk|docbook|opml|atom|rss|typ|gmi|gemini|pod|bbcode|bb|fountain|spmd|tid|tiddlywiki|tiddly|roff|man|bibtex|bib|srt|vtt|lrc|ics|vtodo|todo|vjournal|journal|vfreebusy|freebusy|vavailability|availability|vtimezone|timezone|valarm|alarm|vevent|event|xcal|cue|ass|ssa|ttml|dfxp|sbv|sami|smi|sub|stl|scc|usf|mpl|djvu|djv|tei|jats|nxml|ris|enw|csljson|bibjson|nbib|cslyaml|enxml|mods|citation\.cff|cff|datacite|marcxml|mrcx|dublincore|onix|unixref|pubmed|bibframe|crossref|ead|mets|premis|mix|alto|page|pcgts|foxml|edm|lido|vra|vracore|cdwalite|cdwa|spectrum|darwincore|objectid|oid|metsrights|textmd|rights|tmd|rmd|pbcore|ebucore|mpeg7|mp7|aes57|ieee-lom|lom|imscp|ims|sportsml|eventsml|sml|newsmlg2|newsml-g2|rnews|prism|hnews|iptc|anpa|ninjs|jsonfeed|as2|geojson|topojson|kml|gpx|osm|georss|wkt|gml|svg|dxf|mapml|cityjson|indoorgml|citygml|landxml|ifcxml|gbxml|bcfxml|cobiexml|landinfra|infragml|opendrive|xodr|railml|transxml|datex2|netex|siri|transxchange|naptan|gtfs|ifopt|ojp|trias|vdv453|vdv454|vdv452|vdv462|vdv455|vdv731|vdv301|vdv423|vdv431|vdv300|vdv451|vdv432|vdv433|vdv434|vdv435|vdv436|vdv456|vdv457|vdv459|vdv461|vdv458|vdv460|xliff|xlf|tmx|tbx|dita|rdf|opds|vcard|vcf|pot|po|newsml|nitf|nml|nar|pbc|ebu|aes|eac-cpf|cidoc-crm|cidoc|eac|cpf|crm|eps|ps|xlsx|xls|docx|doc|pptx|ppt|epub|odt|ods|odp|fb2|rtf|rt|cbz)$/i, '') ||
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

export function outlineSplitPartName(
  filename: string,
  title: string,
  part: number,
  total: number,
): string {
  const base = filename.replace(/\.pdf$/i, '') || 'document'
  const slug =
    title
      .normalize('NFC')
      .replace(/[/\\?%*:|"<>]+/g, '-')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'muc'
  const width = String(Math.max(1, total)).length
  return `${base}-phan-${String(part).padStart(width, '0')}-${slug}.pdf`
}

export function outlineSplitZipName(filename: string): string {
  const base = filename.replace(/\.pdf$/i, '') || 'document'
  return `${base}-tach-muc-luc.zip`
}

export function imagePageName(
  filename: string,
  pageIndex: number,
  ext: 'png' | 'jpg' | 'webp',
): string {
  const base =
    filename.replace(/\.(pdf|txt|text|md|markdown|html|htm|png|jpe?g|webp|jsonl|ndjson|ipynb|bib\.json|json-ld|jsonld|ninjs\.json|jsonfeed\.json|as2\.json|geojson\.json|topo\.json|kml\.xml|gpx\.xml|osm\.xml|georss\.xml|wkt\.txt|gml\.xml|svg\.xml|dxf\.txt|mapml\.xml|city\.json|indoorgml\.xml|citygml\.xml|landxml\.xml|ifcxml\.xml|ifc\.xml|gbxml\.xml|bcfxml\.xml|bcf\.xml|cobiexml\.xml|cobie\.xml|landinfra\.xml|infragml\.xml|opendrive\.xml|railml\.xml|transxml\.xml|datex2\.xml|netex\.xml|siri\.xml|transxchange\.xml|naptan\.xml|gtfs\.xml|ifopt\.xml|ojp\.xml|trias\.xml|vdv453\.xml|vdv454\.xml|vdv452\.xml|vdv462\.xml|vdv455\.xml|vdv731\.xml|vdv301\.xml|vdv423\.xml|vdv431\.xml|vdv300\.xml|vdv451\.xml|vdv432\.xml|vdv433\.xml|vdv434\.xml|vdv435\.xml|vdv436\.xml|vdv456\.xml|vdv457\.xml|vdv459\.xml|vdv461\.xml|vdv458\.xml|vdv460\.xml|xliff\.xml|tmx\.xml|tbx\.xml|dita\.xml|rdf\.xml|opds\.xml|ics\.xml|crossref\.json|json|csl\.ya?ml|ya?ml|endnote\.xml|mods\.xml|datacite\.xml|marc\.xml|dublincore\.xml|dc\.xml|onix\.xml|unixref\.xml|crossref\.xml|pubmed\.xml|bibframe\.xml|bf\.xml|ead\.xml|mets\.xml|premis\.xml|mix\.xml|alto\.xml|page\.xml|pcgts\.xml|foxml\.xml|edm\.xml|lido\.xml|vra\.xml|vracore\.xml|cdwa\.xml|cdwalite\.xml|spectrum\.xml|darwincore\.xml|dwc\.xml|objectid\.xml|metsrights\.xml|rights\.xml|textmd\.xml|pbcore\.xml|ebucore\.xml|mpeg7\.xml|aes57\.xml|lom\.xml|imscp\.xml|imsmanifest\.xml|sportsml\.xml|eventsml\.xml|newsmlg2\.xml|newsml-g2\.xml|rnews\.xml|prism\.xml|hnews\.xml|iptc\.xml|anpa\.xml|newsml\.xml|nitf\.xml|eac-cpf\.xml|cidoc-crm\.xml|cidoc\.xml|eac\.xml|crm\.xml|xml|csv|tsv|toml|org|texinfo|texi|txi|tex|latex|ini|cfg|adoc|asciidoc|rst|rest|textile|txtl|mediawiki|wiki|dokuwiki|dwc|dw|dbk|docbook|opml|atom|rss|typ|gmi|gemini|pod|bbcode|bb|fountain|spmd|tid|tiddlywiki|tiddly|roff|man|bibtex|bib|srt|vtt|lrc|ics|vtodo|todo|vjournal|journal|vfreebusy|freebusy|vavailability|availability|vtimezone|timezone|valarm|alarm|vevent|event|xcal|cue|ass|ssa|ttml|dfxp|sbv|sami|smi|sub|stl|scc|usf|mpl|djvu|djv|tei|jats|nxml|ris|enw|csljson|bibjson|nbib|cslyaml|enxml|mods|citation\.cff|cff|datacite|marcxml|mrcx|dublincore|onix|unixref|pubmed|bibframe|crossref|ead|mets|premis|mix|alto|page|pcgts|foxml|edm|lido|vra|vracore|cdwalite|cdwa|spectrum|darwincore|objectid|oid|metsrights|textmd|rights|tmd|rmd|pbcore|ebucore|mpeg7|mp7|aes57|ieee-lom|lom|imscp|ims|sportsml|eventsml|sml|newsmlg2|newsml-g2|rnews|prism|hnews|iptc|anpa|ninjs|jsonfeed|as2|geojson|topojson|kml|gpx|osm|georss|wkt|gml|svg|dxf|mapml|cityjson|indoorgml|citygml|landxml|ifcxml|gbxml|bcfxml|cobiexml|landinfra|infragml|opendrive|xodr|railml|transxml|datex2|netex|siri|transxchange|naptan|gtfs|ifopt|ojp|trias|vdv453|vdv454|vdv452|vdv462|vdv455|vdv731|vdv301|vdv423|vdv431|vdv300|vdv451|vdv432|vdv433|vdv434|vdv435|vdv436|vdv456|vdv457|vdv459|vdv461|vdv458|vdv460|xliff|xlf|tmx|tbx|dita|rdf|opds|vcard|vcf|pot|po|newsml|nitf|nml|nar|pbc|ebu|aes|eac-cpf|cidoc-crm|cidoc|eac|cpf|crm|eps|ps|xlsx|xls|docx|doc|pptx|ppt|epub|odt|ods|odp|fb2|rtf|rt|cbz)$/i, '') ||
    'document'
  const page = Number.isInteger(pageIndex) && pageIndex >= 0 ? pageIndex + 1 : 1
  return `${base}-trang-${page}.${ext}`
}

export function imageZipName(filename: string, ext: 'png' | 'jpg' | 'webp'): string {
  const base =
    filename.replace(/\.(pdf|txt|text|md|markdown|html|htm|png|jpe?g|webp|jsonl|ndjson|ipynb|bib\.json|json-ld|jsonld|ninjs\.json|jsonfeed\.json|as2\.json|geojson\.json|topo\.json|kml\.xml|gpx\.xml|osm\.xml|georss\.xml|wkt\.txt|gml\.xml|svg\.xml|dxf\.txt|mapml\.xml|city\.json|indoorgml\.xml|citygml\.xml|landxml\.xml|ifcxml\.xml|ifc\.xml|gbxml\.xml|bcfxml\.xml|bcf\.xml|cobiexml\.xml|cobie\.xml|landinfra\.xml|infragml\.xml|opendrive\.xml|railml\.xml|transxml\.xml|datex2\.xml|netex\.xml|siri\.xml|transxchange\.xml|naptan\.xml|gtfs\.xml|ifopt\.xml|ojp\.xml|trias\.xml|vdv453\.xml|vdv454\.xml|vdv452\.xml|vdv462\.xml|vdv455\.xml|vdv731\.xml|vdv301\.xml|vdv423\.xml|vdv431\.xml|vdv300\.xml|vdv451\.xml|vdv432\.xml|vdv433\.xml|vdv434\.xml|vdv435\.xml|vdv436\.xml|vdv456\.xml|vdv457\.xml|vdv459\.xml|vdv461\.xml|vdv458\.xml|vdv460\.xml|xliff\.xml|tmx\.xml|tbx\.xml|dita\.xml|rdf\.xml|opds\.xml|ics\.xml|crossref\.json|json|csl\.ya?ml|ya?ml|endnote\.xml|mods\.xml|datacite\.xml|marc\.xml|dublincore\.xml|dc\.xml|onix\.xml|unixref\.xml|crossref\.xml|pubmed\.xml|bibframe\.xml|bf\.xml|ead\.xml|mets\.xml|premis\.xml|mix\.xml|alto\.xml|page\.xml|pcgts\.xml|foxml\.xml|edm\.xml|lido\.xml|vra\.xml|vracore\.xml|cdwa\.xml|cdwalite\.xml|spectrum\.xml|darwincore\.xml|dwc\.xml|objectid\.xml|metsrights\.xml|rights\.xml|textmd\.xml|pbcore\.xml|ebucore\.xml|mpeg7\.xml|aes57\.xml|lom\.xml|imscp\.xml|imsmanifest\.xml|sportsml\.xml|eventsml\.xml|newsmlg2\.xml|newsml-g2\.xml|rnews\.xml|prism\.xml|hnews\.xml|iptc\.xml|anpa\.xml|newsml\.xml|nitf\.xml|eac-cpf\.xml|cidoc-crm\.xml|cidoc\.xml|eac\.xml|crm\.xml|xml|csv|tsv|toml|org|texinfo|texi|txi|tex|latex|ini|cfg|adoc|asciidoc|rst|rest|textile|txtl|mediawiki|wiki|dokuwiki|dwc|dw|dbk|docbook|opml|atom|rss|typ|gmi|gemini|pod|bbcode|bb|fountain|spmd|tid|tiddlywiki|tiddly|roff|man|bibtex|bib|srt|vtt|lrc|ics|vtodo|todo|vjournal|journal|vfreebusy|freebusy|vavailability|availability|vtimezone|timezone|valarm|alarm|vevent|event|xcal|cue|ass|ssa|ttml|dfxp|sbv|sami|smi|sub|stl|scc|usf|mpl|djvu|djv|tei|jats|nxml|ris|enw|csljson|bibjson|nbib|cslyaml|enxml|mods|citation\.cff|cff|datacite|marcxml|mrcx|dublincore|onix|unixref|pubmed|bibframe|crossref|ead|mets|premis|mix|alto|page|pcgts|foxml|edm|lido|vra|vracore|cdwalite|cdwa|spectrum|darwincore|objectid|oid|metsrights|textmd|rights|tmd|rmd|pbcore|ebucore|mpeg7|mp7|aes57|ieee-lom|lom|imscp|ims|sportsml|eventsml|sml|newsmlg2|newsml-g2|rnews|prism|hnews|iptc|anpa|ninjs|jsonfeed|as2|geojson|topojson|kml|gpx|osm|georss|wkt|gml|svg|dxf|mapml|cityjson|indoorgml|citygml|landxml|ifcxml|gbxml|bcfxml|cobiexml|landinfra|infragml|opendrive|xodr|railml|transxml|datex2|netex|siri|transxchange|naptan|gtfs|ifopt|ojp|trias|vdv453|vdv454|vdv452|vdv462|vdv455|vdv731|vdv301|vdv423|vdv431|vdv300|vdv451|vdv432|vdv433|vdv434|vdv435|vdv436|vdv456|vdv457|vdv459|vdv461|vdv458|vdv460|xliff|xlf|tmx|tbx|dita|rdf|opds|vcard|vcf|pot|po|newsml|nitf|nml|nar|pbc|ebu|aes|eac-cpf|cidoc-crm|cidoc|eac|cpf|crm|eps|ps|xlsx|xls|docx|doc|pptx|ppt|epub|odt|ods|odp|fb2|rtf|rt|cbz)$/i, '') ||
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
    filename.replace(/\.(pdf|txt|text|md|markdown|html|htm|png|jpe?g|webp|jsonl|ndjson|ipynb|bib\.json|json-ld|jsonld|ninjs\.json|jsonfeed\.json|as2\.json|geojson\.json|topo\.json|kml\.xml|gpx\.xml|osm\.xml|georss\.xml|wkt\.txt|gml\.xml|svg\.xml|dxf\.txt|mapml\.xml|city\.json|indoorgml\.xml|citygml\.xml|landxml\.xml|ifcxml\.xml|ifc\.xml|gbxml\.xml|bcfxml\.xml|bcf\.xml|cobiexml\.xml|cobie\.xml|landinfra\.xml|infragml\.xml|opendrive\.xml|railml\.xml|transxml\.xml|datex2\.xml|netex\.xml|siri\.xml|transxchange\.xml|naptan\.xml|gtfs\.xml|ifopt\.xml|ojp\.xml|trias\.xml|vdv453\.xml|vdv454\.xml|vdv452\.xml|vdv462\.xml|vdv455\.xml|vdv731\.xml|vdv301\.xml|vdv423\.xml|vdv431\.xml|vdv300\.xml|vdv451\.xml|vdv432\.xml|vdv433\.xml|vdv434\.xml|vdv435\.xml|vdv436\.xml|vdv456\.xml|vdv457\.xml|vdv459\.xml|vdv461\.xml|vdv458\.xml|vdv460\.xml|xliff\.xml|tmx\.xml|tbx\.xml|dita\.xml|rdf\.xml|opds\.xml|ics\.xml|crossref\.json|json|csl\.ya?ml|ya?ml|endnote\.xml|mods\.xml|datacite\.xml|marc\.xml|dublincore\.xml|dc\.xml|onix\.xml|unixref\.xml|crossref\.xml|pubmed\.xml|bibframe\.xml|bf\.xml|ead\.xml|mets\.xml|premis\.xml|mix\.xml|alto\.xml|page\.xml|pcgts\.xml|foxml\.xml|edm\.xml|lido\.xml|vra\.xml|vracore\.xml|cdwa\.xml|cdwalite\.xml|spectrum\.xml|darwincore\.xml|dwc\.xml|objectid\.xml|metsrights\.xml|rights\.xml|textmd\.xml|pbcore\.xml|ebucore\.xml|mpeg7\.xml|aes57\.xml|lom\.xml|imscp\.xml|imsmanifest\.xml|sportsml\.xml|eventsml\.xml|newsmlg2\.xml|newsml-g2\.xml|rnews\.xml|prism\.xml|hnews\.xml|iptc\.xml|anpa\.xml|newsml\.xml|nitf\.xml|eac-cpf\.xml|cidoc-crm\.xml|cidoc\.xml|eac\.xml|crm\.xml|xml|csv|tsv|toml|org|texinfo|texi|txi|tex|latex|ini|cfg|adoc|asciidoc|rst|rest|textile|txtl|mediawiki|wiki|dokuwiki|dwc|dw|dbk|docbook|opml|atom|rss|typ|gmi|gemini|pod|bbcode|bb|fountain|spmd|tid|tiddlywiki|tiddly|roff|man|bibtex|bib|srt|vtt|lrc|ics|vtodo|todo|vjournal|journal|vfreebusy|freebusy|vavailability|availability|vtimezone|timezone|valarm|alarm|vevent|event|xcal|cue|ass|ssa|ttml|dfxp|sbv|sami|smi|sub|stl|scc|usf|mpl|djvu|djv|tei|jats|nxml|ris|enw|csljson|bibjson|nbib|cslyaml|enxml|mods|citation\.cff|cff|datacite|marcxml|mrcx|dublincore|onix|unixref|pubmed|bibframe|crossref|ead|mets|premis|mix|alto|page|pcgts|foxml|edm|lido|vra|vracore|cdwalite|cdwa|spectrum|darwincore|objectid|oid|metsrights|textmd|rights|tmd|rmd|pbcore|ebucore|mpeg7|mp7|aes57|ieee-lom|lom|imscp|ims|sportsml|eventsml|sml|newsmlg2|newsml-g2|rnews|prism|hnews|iptc|anpa|ninjs|jsonfeed|as2|geojson|topojson|kml|gpx|osm|georss|wkt|gml|svg|dxf|mapml|cityjson|indoorgml|citygml|landxml|ifcxml|gbxml|bcfxml|cobiexml|landinfra|infragml|opendrive|xodr|railml|transxml|datex2|netex|siri|transxchange|naptan|gtfs|ifopt|ojp|trias|vdv453|vdv454|vdv452|vdv462|vdv455|vdv731|vdv301|vdv423|vdv431|vdv300|vdv451|vdv432|vdv433|vdv434|vdv435|vdv436|vdv456|vdv457|vdv459|vdv461|vdv458|vdv460|xliff|xlf|tmx|tbx|dita|rdf|opds|vcard|vcf|pot|po|newsml|nitf|nml|nar|pbc|ebu|aes|eac-cpf|cidoc-crm|cidoc|eac|cpf|crm|eps|ps|xlsx|xls|docx|doc|pptx|ppt|epub|odt|ods|odp|fb2|rtf|rt|cbz)$/i, '') ||
    'document'
  const page = Number.isInteger(pageIndex) && pageIndex >= 0 ? pageIndex + 1 : 1
  const image = Number.isInteger(imageIndex) && imageIndex >= 0 ? imageIndex + 1 : 1
  return `${base}-trang-${page}-anh-${image}.${ext}`
}

export function embeddedImageZipName(filename: string): string {
  const base =
    filename.replace(/\.(pdf|txt|text|md|markdown|html|htm|png|jpe?g|webp|jsonl|ndjson|ipynb|bib\.json|json-ld|jsonld|ninjs\.json|jsonfeed\.json|as2\.json|geojson\.json|topo\.json|kml\.xml|gpx\.xml|osm\.xml|georss\.xml|wkt\.txt|gml\.xml|svg\.xml|dxf\.txt|mapml\.xml|city\.json|indoorgml\.xml|citygml\.xml|landxml\.xml|ifcxml\.xml|ifc\.xml|gbxml\.xml|bcfxml\.xml|bcf\.xml|cobiexml\.xml|cobie\.xml|landinfra\.xml|infragml\.xml|opendrive\.xml|railml\.xml|transxml\.xml|datex2\.xml|netex\.xml|siri\.xml|transxchange\.xml|naptan\.xml|gtfs\.xml|ifopt\.xml|ojp\.xml|trias\.xml|vdv453\.xml|vdv454\.xml|vdv452\.xml|vdv462\.xml|vdv455\.xml|vdv731\.xml|vdv301\.xml|vdv423\.xml|vdv431\.xml|vdv300\.xml|vdv451\.xml|vdv432\.xml|vdv433\.xml|vdv434\.xml|vdv435\.xml|vdv436\.xml|vdv456\.xml|vdv457\.xml|vdv459\.xml|vdv461\.xml|vdv458\.xml|vdv460\.xml|xliff\.xml|tmx\.xml|tbx\.xml|dita\.xml|rdf\.xml|opds\.xml|ics\.xml|crossref\.json|json|csl\.ya?ml|ya?ml|endnote\.xml|mods\.xml|datacite\.xml|marc\.xml|dublincore\.xml|dc\.xml|onix\.xml|unixref\.xml|crossref\.xml|pubmed\.xml|bibframe\.xml|bf\.xml|ead\.xml|mets\.xml|premis\.xml|mix\.xml|alto\.xml|page\.xml|pcgts\.xml|foxml\.xml|edm\.xml|lido\.xml|vra\.xml|vracore\.xml|cdwa\.xml|cdwalite\.xml|spectrum\.xml|darwincore\.xml|dwc\.xml|objectid\.xml|metsrights\.xml|rights\.xml|textmd\.xml|pbcore\.xml|ebucore\.xml|mpeg7\.xml|aes57\.xml|lom\.xml|imscp\.xml|imsmanifest\.xml|sportsml\.xml|eventsml\.xml|newsmlg2\.xml|newsml-g2\.xml|rnews\.xml|prism\.xml|hnews\.xml|iptc\.xml|anpa\.xml|newsml\.xml|nitf\.xml|eac-cpf\.xml|cidoc-crm\.xml|cidoc\.xml|eac\.xml|crm\.xml|xml|csv|tsv|toml|org|texinfo|texi|txi|tex|latex|ini|cfg|adoc|asciidoc|rst|rest|textile|txtl|mediawiki|wiki|dokuwiki|dwc|dw|dbk|docbook|opml|atom|rss|typ|gmi|gemini|pod|bbcode|bb|fountain|spmd|tid|tiddlywiki|tiddly|roff|man|bibtex|bib|srt|vtt|lrc|ics|vtodo|todo|vjournal|journal|vfreebusy|freebusy|vavailability|availability|vtimezone|timezone|valarm|alarm|vevent|event|xcal|cue|ass|ssa|ttml|dfxp|sbv|sami|smi|sub|stl|scc|usf|mpl|djvu|djv|tei|jats|nxml|ris|enw|csljson|bibjson|nbib|cslyaml|enxml|mods|citation\.cff|cff|datacite|marcxml|mrcx|dublincore|onix|unixref|pubmed|bibframe|crossref|ead|mets|premis|mix|alto|page|pcgts|foxml|edm|lido|vra|vracore|cdwalite|cdwa|spectrum|darwincore|objectid|oid|metsrights|textmd|rights|tmd|rmd|pbcore|ebucore|mpeg7|mp7|aes57|ieee-lom|lom|imscp|ims|sportsml|eventsml|sml|newsmlg2|newsml-g2|rnews|prism|hnews|iptc|anpa|ninjs|jsonfeed|as2|geojson|topojson|kml|gpx|osm|georss|wkt|gml|svg|dxf|mapml|cityjson|indoorgml|citygml|landxml|ifcxml|gbxml|bcfxml|cobiexml|landinfra|infragml|opendrive|xodr|railml|transxml|datex2|netex|siri|transxchange|naptan|gtfs|ifopt|ojp|trias|vdv453|vdv454|vdv452|vdv462|vdv455|vdv731|vdv301|vdv423|vdv431|vdv300|vdv451|vdv432|vdv433|vdv434|vdv435|vdv436|vdv456|vdv457|vdv459|vdv461|vdv458|vdv460|xliff|xlf|tmx|tbx|dita|rdf|opds|vcard|vcf|pot|po|newsml|nitf|nml|nar|pbc|ebu|aes|eac-cpf|cidoc-crm|cidoc|eac|cpf|crm|eps|ps|xlsx|xls|docx|doc|pptx|ppt|epub|odt|ods|odp|fb2|rtf|rt|cbz)$/i, '') ||
    'document'
  return `${base}-anh-nhung.zip`
}

function sourceBaseName(filename: string): string {
  return (
    filename.replace(/\.(pdf|txt|text|md|markdown|html|htm|png|jpe?g|webp|jsonl|ndjson|ipynb|bib\.json|json-ld|jsonld|ninjs\.json|jsonfeed\.json|as2\.json|geojson\.json|topo\.json|kml\.xml|gpx\.xml|osm\.xml|georss\.xml|wkt\.txt|gml\.xml|svg\.xml|dxf\.txt|mapml\.xml|city\.json|indoorgml\.xml|citygml\.xml|landxml\.xml|ifcxml\.xml|ifc\.xml|gbxml\.xml|bcfxml\.xml|bcf\.xml|cobiexml\.xml|cobie\.xml|landinfra\.xml|infragml\.xml|opendrive\.xml|railml\.xml|transxml\.xml|datex2\.xml|netex\.xml|siri\.xml|transxchange\.xml|naptan\.xml|gtfs\.xml|ifopt\.xml|ojp\.xml|trias\.xml|vdv453\.xml|vdv454\.xml|vdv452\.xml|vdv462\.xml|vdv455\.xml|vdv731\.xml|vdv301\.xml|vdv423\.xml|vdv431\.xml|vdv300\.xml|vdv451\.xml|vdv432\.xml|vdv433\.xml|vdv434\.xml|vdv435\.xml|vdv436\.xml|vdv456\.xml|vdv457\.xml|vdv459\.xml|vdv461\.xml|vdv458\.xml|vdv460\.xml|xliff\.xml|tmx\.xml|tbx\.xml|dita\.xml|rdf\.xml|opds\.xml|ics\.xml|crossref\.json|json|csl\.ya?ml|ya?ml|endnote\.xml|mods\.xml|datacite\.xml|marc\.xml|dublincore\.xml|dc\.xml|onix\.xml|unixref\.xml|crossref\.xml|pubmed\.xml|bibframe\.xml|bf\.xml|ead\.xml|mets\.xml|premis\.xml|mix\.xml|alto\.xml|page\.xml|pcgts\.xml|foxml\.xml|edm\.xml|lido\.xml|vra\.xml|vracore\.xml|cdwa\.xml|cdwalite\.xml|spectrum\.xml|darwincore\.xml|dwc\.xml|objectid\.xml|metsrights\.xml|rights\.xml|textmd\.xml|pbcore\.xml|ebucore\.xml|mpeg7\.xml|aes57\.xml|lom\.xml|imscp\.xml|imsmanifest\.xml|sportsml\.xml|eventsml\.xml|newsmlg2\.xml|newsml-g2\.xml|rnews\.xml|prism\.xml|hnews\.xml|iptc\.xml|anpa\.xml|newsml\.xml|nitf\.xml|eac-cpf\.xml|cidoc-crm\.xml|cidoc\.xml|eac\.xml|crm\.xml|xml|csv|tsv|toml|org|texinfo|texi|txi|tex|latex|ini|cfg|adoc|asciidoc|rst|rest|textile|txtl|mediawiki|wiki|dokuwiki|dwc|dw|dbk|docbook|opml|atom|rss|typ|gmi|gemini|pod|bbcode|bb|fountain|spmd|tid|tiddlywiki|tiddly|roff|man|bibtex|bib|srt|vtt|lrc|ics|vtodo|todo|vjournal|journal|vfreebusy|freebusy|vavailability|availability|vtimezone|timezone|valarm|alarm|vevent|event|xcal|cue|ass|ssa|ttml|dfxp|sbv|sami|smi|sub|stl|scc|usf|mpl|djvu|djv|tei|jats|nxml|ris|enw|csljson|bibjson|nbib|cslyaml|enxml|mods|citation\.cff|cff|datacite|marcxml|mrcx|dublincore|onix|unixref|pubmed|bibframe|crossref|ead|mets|premis|mix|alto|page|pcgts|foxml|edm|lido|vra|vracore|cdwalite|cdwa|spectrum|darwincore|objectid|oid|metsrights|textmd|rights|tmd|rmd|pbcore|ebucore|mpeg7|mp7|aes57|ieee-lom|lom|imscp|ims|sportsml|eventsml|sml|newsmlg2|newsml-g2|rnews|prism|hnews|iptc|anpa|ninjs|jsonfeed|as2|geojson|topojson|kml|gpx|osm|georss|wkt|gml|svg|dxf|mapml|cityjson|indoorgml|citygml|landxml|ifcxml|gbxml|bcfxml|cobiexml|landinfra|infragml|opendrive|xodr|railml|transxml|datex2|netex|siri|transxchange|naptan|gtfs|ifopt|ojp|trias|vdv453|vdv454|vdv452|vdv462|vdv455|vdv731|vdv301|vdv423|vdv431|vdv300|vdv451|vdv432|vdv433|vdv434|vdv435|vdv436|vdv456|vdv457|vdv459|vdv461|vdv458|vdv460|xliff|xlf|tmx|tbx|dita|rdf|opds|vcard|vcf|pot|po|newsml|nitf|nml|nar|pbc|ebu|aes|eac-cpf|cidoc-crm|cidoc|eac|cpf|crm|eps|ps|xlsx|xls|docx|doc|pptx|ppt|epub|odt|ods|odp|fb2|rtf|rt|cbz)$/i, '') ||
    'document'
  )
}

export function embeddedAttachmentName(
  filename: string,
  pageIndex: number,
  attachmentIndex: number,
  originalName = 'attachment.txt',
): string {
  const base = sourceBaseName(filename)
  const page = Number.isInteger(pageIndex) && pageIndex >= 0 ? pageIndex + 1 : 1
  const n = Number.isInteger(attachmentIndex) && attachmentIndex >= 0 ? attachmentIndex + 1 : 1
  const ext = (originalName.split('.').pop() || 'txt').replace(/[^A-Za-z0-9]+/g, '') || 'txt'
  return `${base}-trang-${page}-dinh-kem-${n}.${ext}`
}

export function embeddedAttachmentZipName(filename: string): string {
  return `${sourceBaseName(filename)}-dinh-kem.zip`
}
