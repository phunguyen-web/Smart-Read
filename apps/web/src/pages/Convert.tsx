import { useEffect, useMemo, useState } from 'react'
import {
  extensionFor,
  comicPageName,
  isComicFormat,
  isImageFormat,
  mimeFor,
  toCbz,
  slicePageRange,
  slicePagesByIndexes,
  toCsv,
  toDocx,
  toEpub,
  toFb2,
  toHtml,
  toIni,
  toAdoc,
  toRst,
  toTextile,
  toWiki,
  toDokuwiki,
  toDocbook,
  toOpml,
  toAtom,
  toTypst,
  toGemtext,
  toPod,
  toBbcode,
  toFountain,
  toTid,
  toTexinfo,
  toRoff,
  toIpynb,
  toBibtex,
  toSrt,
  toVtt,
  toLrc,
  toIcs,
  toCue,
  toAss,
  toTtml,
  toSbv,
  toSami,
  toSub,
  toStl,
  toScc,
  toUsf,
  toRt,
  toMpl,
  toDjvu,
  toPs,
  toTei,
  toJats,
  toRis,
  toEnw,
  toCsljson,
  toNbib,
  toCslyaml,
  toEnxml,
  toMods,
  toCff,
  toDatacite,
  toMarcxml,
  toDublincore,
  toOnix,
  toUnixref,
  toBibjson,
  toPubmed,
  toJsonld,
  toBibframe,
  toCrossref,
  toEad,
  toMets,
  toPremis,
  toMix,
  toAlto,
  toPage as toPageXml,
  toFoxml,
  toEdm,
  toLido,
  toVra,
  toCdwa,
  toSpectrum,
  toDwc,
  toObjectid,
  toEac,
  toCrm,
  toRights,
  toTextmd,
  toPbcore,
  toEbucore,
  toMpeg7,
  toAes57,
  toLom,
  toImscp,
  toNewsml,
  toNitf,
  toSportsml,
  toEventsml,
  toNewsmlg2,
  toRnews,
  toPrism,
  toHnews,
  toIptc,
  toAnpa,
  toNinjs,
  toJsonfeed,
  toAs2,
  toGeojson,
  toKml,
  toGpx,
  toOsm,
  toGeorss,
  toWkt,
  toGml,
  toTopojson,
  toSvg,
  toDxf,
  toMapml,
  toCityjson,
  toIndoorgml,
  toCitygml,
  toLandxml,
  toIfcxml,
  toGbxml,
  toBcfxml,
  toCobiexml,
  toLandinfra,
  toInfragml,
  toOpendrive,
  toRailml,
  toTransxml,
  toDatex2,
  toNetex,
  toSiri,
  toTransxchange,
  toNaptan,
  toGtfs,
  toIfopt,
  toOjp,
  toTrias,
  toVdv453,
  toVdv454,
  toVdv452,
  toVdv462,
  toVdv455,
  toVdv731,
  toVdv301,
  toVdv423,
  toVdv431,
  toVdv300,
  toVdv451,
  toVdv432,
  toVdv433,
  toVdv434,
  toVdv435,
  toVdv436,
  toVdv456,
  toVdv457,
  toVdv459,
  toVdv461,
  toVdv458,
  toVdv460,
  toXliff,
  toTmx,
  toTbx,
  toPo,
  toDita,
  toVcard,
  toRdf,
  toOpds,
  toVtodo,
  toVjournal,
  toVfreebusy,
  toVavailability,
  toVtimezone,
  toValarm,
  toVevent,
  toXcal,
  toJcal,
  toJcard,
  toXcard,
  toHcard,
  toHcal,
  toJscal,
  toDtbook,
  toSsml,
  toMathml,
  toVxml,
  toPls,
  toMusicxml,
  toMei,
  toAbc,
  toSmil,
  toGraphml,
  toDot,
  toMf2t,
  toLilypond,
  toHumdrum,
  toXspf,
  toM3u,
  toJspf,
  toWpl,
  toAsx,
  toB4s,
  toMpcpl,
  toDpl,
  toFpl,
  toZpl,
  toItl,
  toJson,
  toJsonl,
  toLatex,
  toMarkdown,
  toOrg,
  toOdp,
  toXml,
  toYaml,
  toOds,
  toOdt,
  toPptx,
  toRtf,
  toToml,
  toTsv,
  toTxt,
  toXlsx,
  zipPdfParts,
  type ExportFormat,
} from '../lib/convert.ts'
import { extractPageTexts, renderPageToBlob } from '../lib/extract.ts'
import { convertEpubToMobi, getMobiStatus } from '../lib/mobi.ts'
import {
  ACCEPT_SOURCES,
  imagePageName,
  imageZipName,
  readSourceFile,
  swapExtension,
} from '../lib/limits.ts'
import { importNoteFor, pdfFromLoadedSource } from '../lib/open-source.ts'
import { editorExportSelection, forgetHistory, formatPageList } from '../lib/persist.ts'
import { indexesFromPageRange, parsePageRange } from '../lib/selection.ts'
import { decryptPdfForEdit, isPdfPasswordError } from '../lib/encrypt.ts'
import { pageCount } from '../lib/pdf.ts'
import { downloadBlob, setDocument } from '../lib/document-store.ts'
import { useDocument } from '../use-document.ts'

const FORMATS: { id: ExportFormat; label: string; hint: string }[] = [
  { id: 'txt', label: 'TXT', hint: 'Văn bản thuần' },
  { id: 'html', label: 'HTML', hint: 'Trang web' },
  { id: 'md', label: 'Markdown', hint: 'Tệp .md, một mục mỗi trang' },
  { id: 'rtf', label: 'RTF', hint: 'Rich Text, mở được trong Word' },
  { id: 'json', label: 'JSON', hint: 'Trang + chữ, cấu trúc' },
  { id: 'jsonl', label: 'JSONL', hint: 'Một đối tượng JSON mỗi dòng' },
  { id: 'yaml', label: 'YAML', hint: 'Trang + chữ, cấu trúc' },
  { id: 'xml', label: 'XML', hint: 'Tài liệu với thẻ page' },
  { id: 'csv', label: 'CSV', hint: 'Bảng trang, chữ' },
  { id: 'tsv', label: 'TSV', hint: 'Bảng trang, chữ, cách tab' },
  { id: 'toml', label: 'TOML', hint: 'title + [[pages]] text' },
  { id: 'org', label: 'Org', hint: 'Org-mode, một mục mỗi trang' },
  { id: 'tex', label: 'LaTeX', hint: 'Tài liệu .tex, một section mỗi trang' },
  { id: 'ini', label: 'INI', hint: '[document] + [page.n] text' },
  { id: 'adoc', label: 'AsciiDoc', hint: '= title + == Trang n' },
  { id: 'rst', label: 'RST', hint: 'reStructuredText, một mục mỗi trang' },
  { id: 'textile', label: 'Textile', hint: 'h1. title + h2. Trang n' },
  { id: 'wiki', label: 'MediaWiki', hint: '= title = + == Trang n ==' },
  { id: 'dokuwiki', label: 'DokuWiki', hint: '====== title ====== + === Trang n ===' },
  { id: 'dbk', label: 'DocBook', hint: 'article XML, một section mỗi trang' },
  { id: 'opml', label: 'OPML', hint: 'outline XML, _note mỗi trang' },
  { id: 'atom', label: 'Atom', hint: 'feed XML, một entry mỗi trang' },
  { id: 'typ', label: 'Typst', hint: '#set document + == Trang n' },
  { id: 'gmi', label: 'Gemtext', hint: '# title + ## Trang n' },
  { id: 'pod', label: 'POD', hint: '=head1 title + =head2 Trang n' },
  { id: 'bbcode', label: 'BBCode', hint: '[h1]title[/h1] + [h2]Trang n[/h2]' },
  { id: 'fountain', label: 'Fountain', hint: 'Title: + # Trang n' },
  { id: 'tid', label: 'TiddlyWiki', hint: '! title + !! Trang n' },
  { id: 'texinfo', label: 'Texinfo', hint: '@settitle + @section Trang n' },
  { id: 'roff', label: 'roff', hint: '.TH + .SH Trang n' },
  { id: 'ipynb', label: 'Jupyter', hint: 'Notebook .ipynb, một ô mỗi trang' },
  { id: 'bib', label: 'BibTeX', hint: '@comment + @misc note mỗi trang' },
  { id: 'ris', label: 'RIS', hint: 'TY GEN + N1 mỗi trang' },
  { id: 'enw', label: 'ENW', hint: 'EndNote %0 Generic + %Z mỗi trang' },
  { id: 'csljson', label: 'CSL-JSON', hint: 'Mảng citation, note mỗi trang' },
  { id: 'nbib', label: 'NBIB', hint: 'PubMed PMID + AB mỗi trang' },
  { id: 'cslyaml', label: 'CSL-YAML', hint: 'YAML citation, note mỗi trang' },
  { id: 'enxml', label: 'EndNote XML', hint: 'EndNote <record> + notes mỗi trang' },
  { id: 'mods', label: 'MODS', hint: 'MODS XML, note mỗi trang' },
  { id: 'cff', label: 'CFF', hint: 'Citation File Format, notes mỗi trang' },
  { id: 'datacite', label: 'DataCite', hint: 'DataCite XML, description mỗi trang' },
  { id: 'marcxml', label: 'MARCXML', hint: 'MARCXML, 520 mỗi trang' },
  { id: 'dublincore', label: 'Dublin Core', hint: 'Dublin Core XML, dc:description mỗi trang' },
  { id: 'onix', label: 'ONIX', hint: 'ONIX XML, Text mỗi trang' },
  { id: 'unixref', label: 'Unixref', hint: 'Crossref Unixref XML, description mỗi trang' },
  { id: 'bibjson', label: 'BibJSON', hint: 'Mảng BibJSON, note mỗi trang' },
  { id: 'pubmed', label: 'PubMed', hint: 'PubMed XML, AbstractText mỗi trang' },
  { id: 'jsonld', label: 'JSON-LD', hint: 'schema.org CreativeWork, description mỗi trang' },
  { id: 'bibframe', label: 'BIBFRAME', hint: 'BIBFRAME RDF/XML, bf:note mỗi trang' },
  { id: 'crossref', label: 'Crossref', hint: 'Crossref REST JSON, abstract mỗi trang' },
  { id: 'ead', label: 'EAD', hint: 'EAD XML, scopecontent mỗi trang' },
  { id: 'mets', label: 'METS', hint: 'METS XML, abstract mỗi trang' },
  { id: 'premis', label: 'PREMIS', hint: 'PREMIS XML, significantProperties mỗi trang' },
  { id: 'mix', label: 'MIX', hint: 'NISO MIX XML, note mỗi trang' },
  { id: 'alto', label: 'ALTO', hint: 'ALTO XML, String mỗi trang' },
  { id: 'page', label: 'PAGE', hint: 'PAGE XML, Unicode mỗi trang' },
  { id: 'foxml', label: 'FOXML', hint: 'Fedora FOXML, text mỗi trang' },
  { id: 'edm', label: 'EDM', hint: 'Europeana EDM XML, dc:description mỗi trang' },
  { id: 'lido', label: 'LIDO', hint: 'LIDO XML, descriptiveNoteValue mỗi trang' },
  { id: 'vra', label: 'VRA', hint: 'VRA Core XML, description mỗi trang' },
  { id: 'cdwa', label: 'CDWA Lite', hint: 'CDWA Lite XML, descriptiveNote mỗi trang' },
  { id: 'spectrum', label: 'SPECTRUM', hint: 'SPECTRUM XML, briefDescription mỗi trang' },
  { id: 'dwc', label: 'Darwin Core', hint: 'Darwin Core XML, description mỗi trang' },
  { id: 'objectid', label: 'Object ID', hint: 'Object ID XML, distinguishingFeatures mỗi trang' },
  { id: 'eac', label: 'EAC-CPF', hint: 'EAC-CPF XML, biogHist mỗi trang' },
  { id: 'crm', label: 'CIDOC CRM', hint: 'CIDOC CRM RDF/XML, P3_has_note mỗi trang' },
  { id: 'rights', label: 'METS Rights', hint: 'METS Rights XML, ConstraintDescription mỗi trang' },
  { id: 'textmd', label: 'TextMD', hint: 'NISO TextMD XML, textNote mỗi trang' },
  { id: 'pbcore', label: 'PBCore', hint: 'PBCore XML, pbcoreDescription mỗi trang' },
  { id: 'ebucore', label: 'EBUCore', hint: 'EBUCore XML, description mỗi trang' },
  { id: 'mpeg7', label: 'MPEG-7', hint: 'MPEG-7 XML, FreeTextAnnotation mỗi trang' },
  { id: 'aes57', label: 'AES57', hint: 'AES57 XML, description mỗi trang' },
  { id: 'lom', label: 'IEEE LOM', hint: 'IEEE LOM XML, description mỗi trang' },
  { id: 'imscp', label: 'IMS CP', hint: 'IMS Content Packaging XML, description mỗi trang' },
  { id: 'newsml', label: 'NewsML', hint: 'NewsML XML, DataContent mỗi trang' },
  { id: 'nitf', label: 'NITF', hint: 'NITF XML, p mỗi trang' },
  { id: 'sportsml', label: 'SportsML', hint: 'SportsML XML, narrative mỗi trang' },
  { id: 'eventsml', label: 'EventsML', hint: 'EventsML XML, description mỗi trang' },
  { id: 'newsmlg2', label: 'NewsML-G2', hint: 'NewsML-G2 XML, body mỗi trang' },
  { id: 'rnews', label: 'rNews', hint: 'rNews XML, articleBody mỗi trang' },
  { id: 'prism', label: 'PRISM', hint: 'PRISM XML, body mỗi trang' },
  { id: 'hnews', label: 'hNews', hint: 'hNews XML, content mỗi trang' },
  { id: 'iptc', label: 'IPTC', hint: 'IPTC 7901 XML, body mỗi trang' },
  { id: 'anpa', label: 'ANPA', hint: 'ANPA XML, text mỗi trang' },
  { id: 'ninjs', label: 'NINJS', hint: 'IPTC News in JSON, body_text mỗi trang' },
  { id: 'jsonfeed', label: 'JSON Feed', hint: 'JSON Feed 1.1, content_text mỗi trang' },
  { id: 'as2', label: 'Activity Streams', hint: 'Activity Streams 2.0, content mỗi trang' },
  { id: 'geojson', label: 'GeoJSON', hint: 'FeatureCollection, description mỗi trang' },
  { id: 'kml', label: 'KML', hint: 'KML Placemark, description mỗi trang' },
  { id: 'gpx', label: 'GPX', hint: 'GPX waypoint, desc mỗi trang' },
  { id: 'osm', label: 'OSM', hint: 'OSM XML node, tag text mỗi trang' },
  { id: 'georss', label: 'GeoRSS', hint: 'GeoRSS Atom, summary mỗi trang' },
  { id: 'wkt', label: 'WKT', hint: 'Well-Known Text POINT, chữ mỗi trang' },
  { id: 'gml', label: 'GML', hint: 'GML featureMember, description mỗi trang' },
  { id: 'topojson', label: 'TopoJSON', hint: 'Topology GeometryCollection, text mỗi trang' },
  { id: 'svg', label: 'SVG', hint: 'SVG nhóm g, desc mỗi trang' },
  { id: 'dxf', label: 'DXF', hint: 'AutoCAD TEXT, chữ mỗi trang' },
  { id: 'mapml', label: 'MapML', hint: 'MapML feature, description mỗi trang' },
  { id: 'cityjson', label: 'CityJSON', hint: 'CityJSON Building, description mỗi trang' },
  { id: 'indoorgml', label: 'IndoorGML', hint: 'IndoorGML CellSpace, description mỗi trang' },
  { id: 'citygml', label: 'CityGML', hint: 'CityGML Building, description mỗi trang' },
  { id: 'landxml', label: 'LandXML', hint: 'LandXML Parcel, Desc mỗi trang' },
  { id: 'ifcxml', label: 'IFC-XML', hint: 'IFC IfcBuilding, Description mỗi trang' },
  { id: 'gbxml', label: 'gbXML', hint: 'gbXML BuildingStorey, Description mỗi trang' },
  { id: 'bcfxml', label: 'BCF', hint: 'BCF Topic, Description mỗi trang' },
  { id: 'cobiexml', label: 'COBie', hint: 'COBie Component, Description mỗi trang' },
  { id: 'landinfra', label: 'LandInfra', hint: 'LandInfra Feature, description mỗi trang' },
  { id: 'infragml', label: 'InfraGML', hint: 'InfraGML featureMember, description mỗi trang' },
  { id: 'opendrive', label: 'OpenDRIVE', hint: 'OpenDRIVE road, description mỗi trang' },
  { id: 'railml', label: 'RailML', hint: 'RailML line, description mỗi trang' },
  { id: 'transxml', label: 'TransXML', hint: 'TransXML Project, description mỗi trang' },
  { id: 'datex2', label: 'DATEX II', hint: 'DATEX II situationRecord, description mỗi trang' },
  { id: 'netex', label: 'NeTEx', hint: 'NeTEx StopPlace, description mỗi trang' },
  { id: 'siri', label: 'SIRI', hint: 'SIRI StopPoint, description mỗi trang' },
  { id: 'transxchange', label: 'TransXChange', hint: 'TransXChange StopPoint, description mỗi trang' },
  { id: 'naptan', label: 'NaPTAN', hint: 'NaPTAN StopPoint, description mỗi trang' },
  { id: 'gtfs', label: 'GTFS', hint: 'GTFS Stop, description mỗi trang' },
  { id: 'ifopt', label: 'IFOPT', hint: 'IFOPT StopPlace, description mỗi trang' },
  { id: 'ojp', label: 'OJP', hint: 'OJP StopPoint, description mỗi trang' },
  { id: 'trias', label: 'TRIAS', hint: 'TRIAS StopPoint, description mỗi trang' },
  { id: 'vdv453', label: 'VDV453', hint: 'VDV453 IstFahrt, description mỗi trang' },
  { id: 'vdv454', label: 'VDV454', hint: 'VDV454 Linienfahrplan, description mỗi trang' },
  { id: 'vdv452', label: 'VDV452', hint: 'VDV452 Fahrplan, description mỗi trang' },
  { id: 'vdv462', label: 'VDV462', hint: 'VDV462 Haltestelle, description mỗi trang' },
  { id: 'vdv455', label: 'VDV455', hint: 'VDV455 Fahrt, description mỗi trang' },
  { id: 'vdv731', label: 'VDV731', hint: 'VDV731 Anzeige, description mỗi trang' },
  { id: 'vdv301', label: 'VDV301', hint: 'VDV301 Fahrzeug, description mỗi trang' },
  { id: 'vdv423', label: 'VDV423', hint: 'VDV423 Ticket, description mỗi trang' },
  { id: 'vdv431', label: 'VDV431', hint: 'VDV431 Berechtigung, description mỗi trang' },
  { id: 'vdv300', label: 'VDV300', hint: 'VDV300 Objekt, description mỗi trang' },
  { id: 'vdv451', label: 'VDV451', hint: 'VDV451 Nachricht, description mỗi trang' },
  { id: 'vdv432', label: 'VDV432', hint: 'VDV432 SAM, description mỗi trang' },
  { id: 'vdv433', label: 'VDV433', hint: 'VDV433 Kontrolle, description mỗi trang' },
  { id: 'vdv434', label: 'VDV434', hint: 'VDV434 Sperre, description mỗi trang' },
  { id: 'vdv435', label: 'VDV435', hint: 'VDV435 Broker, description mỗi trang' },
  { id: 'vdv436', label: 'VDV436', hint: 'VDV436 Plattform, description mỗi trang' },
  { id: 'vdv456', label: 'VDV456', hint: 'VDV456 Infrastruktur, description mỗi trang' },
  { id: 'vdv457', label: 'VDV457', hint: 'VDV457 Zaehlung, description mỗi trang' },
  { id: 'vdv459', label: 'VDV459', hint: 'VDV459 Auftrag, description mỗi trang' },
  { id: 'vdv461', label: 'VDV461', hint: 'VDV461 Betriebshof, description mỗi trang' },
  { id: 'vdv458', label: 'VDV458', hint: 'VDV458 Fahrplanlage, description mỗi trang' },
  { id: 'vdv460', label: 'VDV460', hint: 'VDV460 Anschluss, description mỗi trang' },
  { id: 'xliff', label: 'XLIFF', hint: 'XLIFF trans-unit, source mỗi trang' },
  { id: 'tmx', label: 'TMX', hint: 'TMX tu/seg, một đơn vị mỗi trang' },
  { id: 'tbx', label: 'TBX', hint: 'TBX termEntry, term mỗi trang' },
  { id: 'po', label: 'PO', hint: 'gettext PO, msgid/msgstr mỗi trang' },
  { id: 'dita', label: 'DITA', hint: 'DITA topic, p mỗi trang' },
  { id: 'vcard', label: 'vCard', hint: 'vCard NOTE, một thẻ mỗi trang' },
  { id: 'rdf', label: 'RDF', hint: 'RDF/XML Description, dc:description mỗi trang' },
  { id: 'opds', label: 'OPDS', hint: 'OPDS catalog entry, content mỗi trang' },
  { id: 'vtodo', label: 'VTODO', hint: 'iCalendar VTODO, một việc mỗi trang' },
  { id: 'vjournal', label: 'VJOURNAL', hint: 'iCalendar VJOURNAL, một nhật ký mỗi trang' },
  { id: 'vfreebusy', label: 'VFREEBUSY', hint: 'iCalendar VFREEBUSY, một khoảng bận mỗi trang' },
  { id: 'vavailability', label: 'VAVAILABILITY', hint: 'iCalendar VAVAILABILITY, một khoảng rảnh mỗi trang' },
  { id: 'vtimezone', label: 'VTIMEZONE', hint: 'iCalendar VTIMEZONE, một múi giờ mỗi trang' },
  { id: 'valarm', label: 'VALARM', hint: 'iCalendar VALARM, một báo thức mỗi trang' },
  { id: 'vevent', label: 'VEVENT', hint: 'iCalendar VEVENT, một sự kiện mỗi trang' },
  { id: 'xcal', label: 'xCal', hint: 'xCal XML iCalendar, một vevent mỗi trang' },
  { id: 'jcal', label: 'jCal', hint: 'jCal JSON iCalendar, một vevent mỗi trang' },
  { id: 'jcard', label: 'jCard', hint: 'jCard JSON vCard, một thẻ mỗi trang' },
  { id: 'xcard', label: 'xCard', hint: 'xCard XML vCard, một thẻ mỗi trang' },
  { id: 'hcard', label: 'hCard', hint: 'hCard HTML vCard, một thẻ mỗi trang' },
  { id: 'hcal', label: 'hCal', hint: 'hCal HTML iCalendar, một sự kiện mỗi trang' },
  { id: 'jscal', label: 'JSCalendar', hint: 'JSCalendar JSON, một sự kiện mỗi trang' },
  { id: 'dtbook', label: 'DTBook', hint: 'DAISY DTBook XML, một level1 mỗi trang' },
  { id: 'ssml', label: 'SSML', hint: 'SSML speak, một p mỗi trang' },
  { id: 'mathml', label: 'MathML', hint: 'MathML math, một mrow mỗi trang' },
  { id: 'vxml', label: 'VoiceXML', hint: 'VoiceXML vxml, một form mỗi trang' },
  { id: 'pls', label: 'PLS', hint: 'PLS lexicon, một lexeme mỗi trang' },
  { id: 'musicxml', label: 'MusicXML', hint: 'MusicXML score-partwise, một measure mỗi trang' },
  { id: 'mei', label: 'MEI', hint: 'MEI XML, một measure / dir mỗi trang' },
  { id: 'abc', label: 'ABC', hint: 'ABC notation, một X: / W: mỗi trang' },
  { id: 'smil', label: 'SMIL', hint: 'SMIL par/text, một par mỗi trang' },
  { id: 'graphml', label: 'GraphML', hint: 'GraphML node/data, một node mỗi trang' },
  { id: 'dot', label: 'Graphviz', hint: 'Graphviz DOT, một node mỗi trang' },
  { id: 'mf2t', label: 'MIDI', hint: 'MIDI text mf2t, một MTrk mỗi trang' },
  { id: 'ly', label: 'LilyPond', hint: 'LilyPond markup, một column mỗi trang' },
  { id: 'krn', label: 'Humdrum', hint: 'Humdrum **kern, một bản ghi mỗi trang' },
  { id: 'xspf', label: 'XSPF', hint: 'XSPF playlist, một track mỗi trang' },
  { id: 'm3u', label: 'M3U', hint: 'M3U playlist, một EXTINF mỗi trang' },
  { id: 'jspf', label: 'JSPF', hint: 'JSPF playlist JSON, một track mỗi trang' },
  { id: 'wpl', label: 'WPL', hint: 'WPL playlist Windows, một media mỗi trang' },
  { id: 'asx', label: 'ASX', hint: 'ASX playlist Windows, một entry mỗi trang' },
  { id: 'b4s', label: 'B4S', hint: 'B4S playlist Winamp, một entry mỗi trang' },
  { id: 'mpcpl', label: 'MPCPL', hint: 'MPCPL playlist Media Player Classic, một mục mỗi trang' },
  { id: 'dpl', label: 'DPL', hint: 'DPL playlist PotPlayer, một mục mỗi trang' },
  { id: 'fpl', label: 'FPL', hint: 'FPL playlist foobar2000, một mục mỗi trang' },
  { id: 'zpl', label: 'ZPL', hint: 'ZPL playlist Zune, một mục mỗi trang' },
  { id: 'itl', label: 'ITL', hint: 'ITL playlist iTunes, một mục Name mỗi trang' },
  { id: 'srt', label: 'SRT', hint: 'Phụ đề .srt, một cue mỗi trang' },
  { id: 'vtt', label: 'VTT', hint: 'WebVTT, NOTE title + một cue mỗi trang' },
  { id: 'lrc', label: 'LRC', hint: 'Lời bài hát [mm:ss.xx], một dòng mỗi trang' },
  { id: 'ics', label: 'ICS', hint: 'iCalendar, một VEVENT mỗi trang' },
  { id: 'cue', label: 'CUE', hint: 'Cue sheet, một TRACK mỗi trang' },
  { id: 'ass', label: 'ASS', hint: 'Phụ đề Advanced SubStation, một Dialogue mỗi trang' },
  { id: 'ttml', label: 'TTML', hint: 'Timed Text XML, một thẻ p mỗi trang' },
  { id: 'sbv', label: 'SBV', hint: 'Phụ đề YouTube, một cue mỗi trang' },
  { id: 'sami', label: 'SAMI', hint: 'Phụ đề SAMI, một SYNC mỗi trang' },
  { id: 'sub', label: 'SUB', hint: 'Phụ đề SubViewer, một cue mỗi trang' },
  { id: 'stl', label: 'STL', hint: 'Phụ đề Spruce, một dòng mỗi trang' },
  { id: 'scc', label: 'SCC', hint: 'Phụ đề Scenarist, một dòng mỗi trang' },
  { id: 'usf', label: 'USF', hint: 'Phụ đề Universal Subtitle XML, một cue mỗi trang' },
  { id: 'rt', label: 'RT', hint: 'Phụ đề RealText, một thẻ time mỗi trang' },
  { id: 'mpl', label: 'MPL', hint: 'Phụ đề MPL2, một dòng [start][end] mỗi trang' },
  { id: 'djvu', label: 'DjVu', hint: 'Bản chữ DJVU-TEXT, một @page mỗi trang' },
  { id: 'ps', label: 'PS', hint: 'PostScript, một %%Page mỗi trang' },
  { id: 'tei', label: 'TEI', hint: 'TEI XML, một div type=page mỗi trang' },
  { id: 'jats', label: 'JATS', hint: 'JATS article XML, một sec mỗi trang' },
  { id: 'xlsx', label: 'XLSX', hint: 'Excel, cột trang + chữ' },
  { id: 'docx', label: 'DOCX', hint: 'Microsoft Word' },
  { id: 'doc', label: 'DOC', hint: 'Word (cùng nội dung DOCX)' },
  { id: 'odt', label: 'ODT', hint: 'OpenDocument, LibreOffice' },
  { id: 'ods', label: 'ODS', hint: 'Bảng tính LibreOffice, cột trang + chữ' },
  { id: 'pptx', label: 'PPTX', hint: 'PowerPoint, một slide mỗi trang' },
  { id: 'odp', label: 'ODP', hint: 'Trình chiếu LibreOffice, một slide mỗi trang' },
  { id: 'fb2', label: 'FB2', hint: 'FictionBook ebook' },
  { id: 'epub', label: 'EPUB', hint: 'Sách điện tử, có mục lục' },
  { id: 'mobi', label: 'MOBI', hint: 'Kindle — cần Calibre ebook-convert' },
  { id: 'png', label: 'PNG', hint: 'Ảnh từng trang (ZIP nếu nhiều)' },
  { id: 'jpg', label: 'JPEG', hint: 'Ảnh từng trang, nền trắng' },
  { id: 'webp', label: 'WEBP', hint: 'Ảnh từng trang, nhẹ hơn PNG' },
  { id: 'cbz', label: 'CBZ', hint: 'Truyện tranh ZIP, mỗi trang một JPEG' },
]

export function Convert() {
  const doc = useDocument()
  const [format, setFormat] = useState<ExportFormat>('docx')
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [calibre, setCalibre] = useState(false)
  const [openPassword, setOpenPassword] = useState('')
  const [lockedPdf, setLockedPdf] = useState<{ name: string; bytes: Uint8Array } | null>(null)
  const docId = doc ? `${doc.name}:${doc.bytes.byteLength}:${doc.pageCount}` : ''
  const [range, setRange] = useState<{ id: string; fromPage: string; toPage: string } | null>(
    null,
  )
  const fromPage = range?.id === docId ? range.fromPage : '1'
  const toPage = range?.id === docId ? range.toPage : doc ? String(doc.pageCount) : ''
  const editorSelection = doc ? editorExportSelection(doc.pageCount) : null
  const [useEditorSelection, setUseEditorSelection] = useState(false)
  const exportFromSelection = Boolean(useEditorSelection && editorSelection)
  const parsedRange = useMemo(
    () => (doc ? parsePageRange(fromPage, toPage, doc.pageCount) : null),
    [doc, fromPage, toPage],
  )
  const rangeError =
    exportFromSelection || !parsedRange || parsedRange.ok ? null : parsedRange.message

  useEffect(() => {
    let cancelled = false
    void getMobiStatus().then((status) => {
      if (!cancelled) {
        setCalibre(status.available)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  async function onUpload(file: File | undefined): Promise<void> {
    if (!file) {
      return
    }
    setError(null)
    setNote(null)
    setLockedPdf(null)
    try {
      const source = await readSourceFile(file)
      const next = await pdfFromLoadedSource(source)
      if (source.kind === 'pdf') {
        try {
          await pageCount(next.bytes)
        } catch (cause) {
          if (isPdfPasswordError(cause)) {
            setLockedPdf({ name: next.name, bytes: next.bytes })
            setOpenPassword('')
            setError('PDF này đang khóa. Nhập mật khẩu để mở. Bản làm việc sẽ được giải khóa.')
            return
          }
          throw cause
        }
      }
      await forgetHistory()
      const loaded = await setDocument(next.name, next.bytes)
      const note = importNoteFor(source, loaded.pageCount)
      if (note) {
        setNote(note)
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không đọc được tệp.')
    }
  }

  async function unlockPending(): Promise<void> {
    if (!lockedPdf) {
      return
    }
    setBusy(true)
    setError(null)
    setNote(null)
    try {
      const unlocked = await decryptPdfForEdit(lockedPdf.bytes, openPassword)
      await forgetHistory()
      const loaded = await setDocument(lockedPdf.name, unlocked)
      setLockedPdf(null)
      setOpenPassword('')
      setNote(`Đã mở PDF khóa (${loaded.pageCount} trang). Bản làm việc không còn mật khẩu.`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không mở được PDF khóa.')
    } finally {
      setBusy(false)
    }
  }

  async function convert(): Promise<void> {
    if (!doc) {
      setError('Hãy tải một tệp PDF trước.')
      return
    }
    const parsed = parsePageRange(fromPage, toPage, doc.pageCount)
    if (!exportFromSelection && !parsed.ok) {
      setError(parsed.message)
      return
    }
    setBusy(true)
    setError(null)
    setNote(null)
    try {
      const indexes =
        exportFromSelection && editorSelection
          ? [...editorSelection].sort((a, b) => a - b)
          : parsed.ok
            ? indexesFromPageRange(parsed.fromPage, parsed.toPage)
            : []
      if (indexes.length === 0) {
        setError('Khoảng trang không có nội dung để xuất.')
        return
      }
      if (isImageFormat(format) || isComicFormat(format)) {
        if (isComicFormat(format)) {
          const parts = []
          for (const [offset, index] of indexes.entries()) {
            const blob = await renderPageToBlob(doc.bytes, index + 1, 'image/jpeg')
            parts.push({
              name: comicPageName(offset),
              bytes: new Uint8Array(await blob.arrayBuffer()),
            })
          }
          downloadBlob(await toCbz(parts), swapExtension(doc.name, 'cbz'))
          return
        }
        const mime = mimeFor(format) as 'image/png' | 'image/jpeg' | 'image/webp'
        if (indexes.length === 1) {
          const blob = await renderPageToBlob(doc.bytes, indexes[0]! + 1, mime)
          downloadBlob(blob, imagePageName(doc.name, indexes[0]!, format))
          return
        }
        const parts = []
        for (const index of indexes) {
          const blob = await renderPageToBlob(doc.bytes, index + 1, mime)
          parts.push({
            name: imagePageName(doc.name, index, format),
            bytes: new Uint8Array(await blob.arrayBuffer()),
          })
        }
        downloadBlob(await zipPdfParts(parts), imageZipName(doc.name, format))
        return
      }
      const extracted = await extractPageTexts(doc.bytes)
      const pages = exportFromSelection && editorSelection
        ? slicePagesByIndexes(extracted, editorSelection)
        : parsed.ok
          ? slicePageRange(extracted, parsed.fromPage, parsed.toPage)
          : []
      if (pages.length === 0) {
        setError('Khoảng trang không có nội dung để xuất.')
        return
      }
      const title = doc.name.replace(/\.pdf$/i, '')
      if (format === 'txt') {
        downloadBlob(
          new Blob([toTxt(pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'html') {
        downloadBlob(
          new Blob([toHtml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'md') {
        downloadBlob(
          new Blob([toMarkdown(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'rtf') {
        downloadBlob(
          new Blob([toRtf(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'json') {
        downloadBlob(
          new Blob([toJson(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'jsonl') {
        downloadBlob(
          new Blob([toJsonl(pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'yaml') {
        downloadBlob(
          new Blob([toYaml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'xml') {
        downloadBlob(
          new Blob([toXml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'csv') {
        downloadBlob(
          new Blob([toCsv(pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'tsv') {
        downloadBlob(
          new Blob([toTsv(pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'toml') {
        downloadBlob(
          new Blob([toToml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'org') {
        downloadBlob(
          new Blob([toOrg(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'tex') {
        downloadBlob(
          new Blob([toLatex(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'ini') {
        downloadBlob(
          new Blob([toIni(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'adoc') {
        downloadBlob(
          new Blob([toAdoc(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'rst') {
        downloadBlob(
          new Blob([toRst(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'textile') {
        downloadBlob(
          new Blob([toTextile(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'wiki') {
        downloadBlob(
          new Blob([toWiki(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'dokuwiki') {
        downloadBlob(
          new Blob([toDokuwiki(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'dbk') {
        downloadBlob(
          new Blob([toDocbook(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'opml') {
        downloadBlob(
          new Blob([toOpml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'atom') {
        downloadBlob(
          new Blob([toAtom(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'typ') {
        downloadBlob(
          new Blob([toTypst(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'gmi') {
        downloadBlob(
          new Blob([toGemtext(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'pod') {
        downloadBlob(
          new Blob([toPod(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'bbcode') {
        downloadBlob(
          new Blob([toBbcode(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'fountain') {
        downloadBlob(
          new Blob([toFountain(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'tid') {
        downloadBlob(
          new Blob([toTid(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'texinfo') {
        downloadBlob(
          new Blob([toTexinfo(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'roff') {
        downloadBlob(
          new Blob([toRoff(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'ipynb') {
        downloadBlob(
          new Blob([toIpynb(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'bib') {
        downloadBlob(
          new Blob([toBibtex(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'srt') {
        downloadBlob(
          new Blob([toSrt(pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vtt') {
        downloadBlob(
          new Blob([toVtt(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'lrc') {
        downloadBlob(
          new Blob([toLrc(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'ics') {
        downloadBlob(
          new Blob([toIcs(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'cue') {
        downloadBlob(
          new Blob([toCue(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'ass') {
        downloadBlob(
          new Blob([toAss(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'ttml') {
        downloadBlob(
          new Blob([toTtml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'sbv') {
        downloadBlob(
          new Blob([toSbv(pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'sami') {
        downloadBlob(
          new Blob([toSami(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'sub') {
        downloadBlob(
          new Blob([toSub(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'stl') {
        downloadBlob(
          new Blob([toStl(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'scc') {
        downloadBlob(
          new Blob([toScc(pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'usf') {
        downloadBlob(
          new Blob([toUsf(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'rt') {
        downloadBlob(
          new Blob([toRt(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'mpl') {
        downloadBlob(
          new Blob([toMpl(pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'djvu') {
        downloadBlob(
          new Blob([toDjvu(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'ps') {
        downloadBlob(
          new Blob([toPs(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'tei') {
        downloadBlob(
          new Blob([toTei(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'jats') {
        downloadBlob(
          new Blob([toJats(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'ris') {
        downloadBlob(
          new Blob([toRis(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'enw') {
        downloadBlob(
          new Blob([toEnw(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'csljson') {
        downloadBlob(
          new Blob([toCsljson(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'nbib') {
        downloadBlob(
          new Blob([toNbib(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'cslyaml') {
        downloadBlob(
          new Blob([toCslyaml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'enxml') {
        downloadBlob(
          new Blob([toEnxml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'mods') {
        downloadBlob(
          new Blob([toMods(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'cff') {
        downloadBlob(
          new Blob([toCff(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'datacite') {
        downloadBlob(
          new Blob([toDatacite(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'marcxml') {
        downloadBlob(
          new Blob([toMarcxml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'dublincore') {
        downloadBlob(
          new Blob([toDublincore(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'onix') {
        downloadBlob(
          new Blob([toOnix(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'unixref') {
        downloadBlob(
          new Blob([toUnixref(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'bibjson') {
        downloadBlob(
          new Blob([toBibjson(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'pubmed') {
        downloadBlob(
          new Blob([toPubmed(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'jsonld') {
        downloadBlob(
          new Blob([toJsonld(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'bibframe') {
        downloadBlob(
          new Blob([toBibframe(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'crossref') {
        downloadBlob(
          new Blob([toCrossref(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'ead') {
        downloadBlob(
          new Blob([toEad(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'mets') {
        downloadBlob(
          new Blob([toMets(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'premis') {
        downloadBlob(
          new Blob([toPremis(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'mix') {
        downloadBlob(
          new Blob([toMix(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'alto') {
        downloadBlob(
          new Blob([toAlto(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'page') {
        downloadBlob(
          new Blob([toPageXml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'foxml') {
        downloadBlob(
          new Blob([toFoxml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'edm') {
        downloadBlob(
          new Blob([toEdm(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'lido') {
        downloadBlob(
          new Blob([toLido(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vra') {
        downloadBlob(
          new Blob([toVra(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'cdwa') {
        downloadBlob(
          new Blob([toCdwa(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'spectrum') {
        downloadBlob(
          new Blob([toSpectrum(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'dwc') {
        downloadBlob(
          new Blob([toDwc(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'objectid') {
        downloadBlob(
          new Blob([toObjectid(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'eac') {
        downloadBlob(
          new Blob([toEac(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'crm') {
        downloadBlob(
          new Blob([toCrm(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'rights') {
        downloadBlob(
          new Blob([toRights(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'textmd') {
        downloadBlob(
          new Blob([toTextmd(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'pbcore') {
        downloadBlob(
          new Blob([toPbcore(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'ebucore') {
        downloadBlob(
          new Blob([toEbucore(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'mpeg7') {
        downloadBlob(
          new Blob([toMpeg7(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'aes57') {
        downloadBlob(
          new Blob([toAes57(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'lom') {
        downloadBlob(
          new Blob([toLom(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'imscp') {
        downloadBlob(
          new Blob([toImscp(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'newsml') {
        downloadBlob(
          new Blob([toNewsml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'nitf') {
        downloadBlob(
          new Blob([toNitf(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'sportsml') {
        downloadBlob(
          new Blob([toSportsml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'eventsml') {
        downloadBlob(
          new Blob([toEventsml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'newsmlg2') {
        downloadBlob(
          new Blob([toNewsmlg2(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'rnews') {
        downloadBlob(
          new Blob([toRnews(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'prism') {
        downloadBlob(
          new Blob([toPrism(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'hnews') {
        downloadBlob(
          new Blob([toHnews(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'iptc') {
        downloadBlob(
          new Blob([toIptc(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'anpa') {
        downloadBlob(
          new Blob([toAnpa(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'ninjs') {
        downloadBlob(
          new Blob([toNinjs(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'jsonfeed') {
        downloadBlob(
          new Blob([toJsonfeed(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'as2') {
        downloadBlob(
          new Blob([toAs2(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'geojson') {
        downloadBlob(
          new Blob([toGeojson(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'kml') {
        downloadBlob(
          new Blob([toKml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'gpx') {
        downloadBlob(
          new Blob([toGpx(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'osm') {
        downloadBlob(
          new Blob([toOsm(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'georss') {
        downloadBlob(
          new Blob([toGeorss(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'wkt') {
        downloadBlob(
          new Blob([toWkt(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'gml') {
        downloadBlob(
          new Blob([toGml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'topojson') {
        downloadBlob(
          new Blob([toTopojson(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'svg') {
        downloadBlob(
          new Blob([toSvg(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'dxf') {
        downloadBlob(
          new Blob([toDxf(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'mapml') {
        downloadBlob(
          new Blob([toMapml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'cityjson') {
        downloadBlob(
          new Blob([toCityjson(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'indoorgml') {
        downloadBlob(
          new Blob([toIndoorgml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'citygml') {
        downloadBlob(
          new Blob([toCitygml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'landxml') {
        downloadBlob(
          new Blob([toLandxml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'ifcxml') {
        downloadBlob(
          new Blob([toIfcxml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'gbxml') {
        downloadBlob(
          new Blob([toGbxml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'bcfxml') {
        downloadBlob(
          new Blob([toBcfxml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'cobiexml') {
        downloadBlob(
          new Blob([toCobiexml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'landinfra') {
        downloadBlob(
          new Blob([toLandinfra(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'infragml') {
        downloadBlob(
          new Blob([toInfragml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'opendrive') {
        downloadBlob(
          new Blob([toOpendrive(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'railml') {
        downloadBlob(
          new Blob([toRailml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'transxml') {
        downloadBlob(
          new Blob([toTransxml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'datex2') {
        downloadBlob(
          new Blob([toDatex2(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'netex') {
        downloadBlob(
          new Blob([toNetex(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'siri') {
        downloadBlob(
          new Blob([toSiri(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'transxchange') {
        downloadBlob(
          new Blob([toTransxchange(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'naptan') {
        downloadBlob(
          new Blob([toNaptan(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'gtfs') {
        downloadBlob(
          new Blob([toGtfs(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'ifopt') {
        downloadBlob(
          new Blob([toIfopt(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'ojp') {
        downloadBlob(
          new Blob([toOjp(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'trias') {
        downloadBlob(
          new Blob([toTrias(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vdv453') {
        downloadBlob(
          new Blob([toVdv453(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vdv454') {
        downloadBlob(
          new Blob([toVdv454(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vdv452') {
        downloadBlob(
          new Blob([toVdv452(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vdv462') {
        downloadBlob(
          new Blob([toVdv462(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vdv455') {
        downloadBlob(
          new Blob([toVdv455(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vdv731') {
        downloadBlob(
          new Blob([toVdv731(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vdv301') {
        downloadBlob(
          new Blob([toVdv301(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vdv423') {
        downloadBlob(
          new Blob([toVdv423(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vdv431') {
        downloadBlob(
          new Blob([toVdv431(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vdv300') {
        downloadBlob(
          new Blob([toVdv300(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vdv451') {
        downloadBlob(
          new Blob([toVdv451(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vdv432') {
        downloadBlob(
          new Blob([toVdv432(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vdv433') {
        downloadBlob(
          new Blob([toVdv433(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vdv434') {
        downloadBlob(
          new Blob([toVdv434(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vdv435') {
        downloadBlob(
          new Blob([toVdv435(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vdv436') {
        downloadBlob(
          new Blob([toVdv436(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vdv456') {
        downloadBlob(
          new Blob([toVdv456(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vdv457') {
        downloadBlob(
          new Blob([toVdv457(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vdv459') {
        downloadBlob(
          new Blob([toVdv459(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vdv461') {
        downloadBlob(
          new Blob([toVdv461(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vdv458') {
        downloadBlob(
          new Blob([toVdv458(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vdv460') {
        downloadBlob(
          new Blob([toVdv460(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'xliff') {
        downloadBlob(
          new Blob([toXliff(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'tmx') {
        downloadBlob(
          new Blob([toTmx(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'tbx') {
        downloadBlob(
          new Blob([toTbx(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'po') {
        downloadBlob(
          new Blob([toPo(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'dita') {
        downloadBlob(
          new Blob([toDita(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vcard') {
        downloadBlob(
          new Blob([toVcard(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'rdf') {
        downloadBlob(
          new Blob([toRdf(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'opds') {
        downloadBlob(
          new Blob([toOpds(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vtodo') {
        downloadBlob(
          new Blob([toVtodo(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vjournal') {
        downloadBlob(
          new Blob([toVjournal(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vfreebusy') {
        downloadBlob(
          new Blob([toVfreebusy(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vavailability') {
        downloadBlob(
          new Blob([toVavailability(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vtimezone') {
        downloadBlob(
          new Blob([toVtimezone(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'valarm') {
        downloadBlob(
          new Blob([toValarm(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vevent') {
        downloadBlob(
          new Blob([toVevent(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'xcal') {
        downloadBlob(
          new Blob([toXcal(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'jcal') {
        downloadBlob(
          new Blob([toJcal(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'jcard') {
        downloadBlob(
          new Blob([toJcard(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'xcard') {
        downloadBlob(
          new Blob([toXcard(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'hcard') {
        downloadBlob(
          new Blob([toHcard(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'hcal') {
        downloadBlob(
          new Blob([toHcal(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'jscal') {
        downloadBlob(
          new Blob([toJscal(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'dtbook') {
        downloadBlob(
          new Blob([toDtbook(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'ssml') {
        downloadBlob(
          new Blob([toSsml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'mathml') {
        downloadBlob(
          new Blob([toMathml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'vxml') {
        downloadBlob(
          new Blob([toVxml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'pls') {
        downloadBlob(
          new Blob([toPls(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'musicxml') {
        downloadBlob(
          new Blob([toMusicxml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'mei') {
        downloadBlob(
          new Blob([toMei(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'abc') {
        downloadBlob(
          new Blob([toAbc(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'smil') {
        downloadBlob(
          new Blob([toSmil(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'graphml') {
        downloadBlob(
          new Blob([toGraphml(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'dot') {
        downloadBlob(
          new Blob([toDot(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'mf2t') {
        downloadBlob(
          new Blob([toMf2t(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'ly') {
        downloadBlob(
          new Blob([toLilypond(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'krn') {
        downloadBlob(
          new Blob([toHumdrum(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'xspf') {
        downloadBlob(
          new Blob([toXspf(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'm3u') {
        downloadBlob(
          new Blob([toM3u(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'jspf') {
        downloadBlob(
          new Blob([toJspf(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'wpl') {
        downloadBlob(
          new Blob([toWpl(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'asx') {
        downloadBlob(
          new Blob([toAsx(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'b4s') {
        downloadBlob(
          new Blob([toB4s(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'mpcpl') {
        downloadBlob(
          new Blob([toMpcpl(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'dpl') {
        downloadBlob(
          new Blob([toDpl(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'fpl') {
        downloadBlob(
          new Blob([toFpl(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'zpl') {
        downloadBlob(
          new Blob([toZpl(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'itl') {
        downloadBlob(
          new Blob([toItl(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, extensionFor(format)),
        )
      } else if (format === 'docx' || format === 'doc') {
        const blob = await toDocx(title, pages)
        downloadBlob(blob, swapExtension(doc.name, extensionFor(format)))
      } else if (format === 'xlsx') {
        downloadBlob(await toXlsx(title, pages), swapExtension(doc.name, 'xlsx'))
      } else if (format === 'odt') {
        downloadBlob(await toOdt(title, pages), swapExtension(doc.name, 'odt'))
      } else if (format === 'ods') {
        downloadBlob(await toOds(title, pages), swapExtension(doc.name, 'ods'))
      } else if (format === 'pptx') {
        downloadBlob(await toPptx(title, pages), swapExtension(doc.name, 'pptx'))
      } else if (format === 'odp') {
        downloadBlob(await toOdp(title, pages), swapExtension(doc.name, 'odp'))
      } else if (format === 'fb2') {
        downloadBlob(
          new Blob([toFb2(title, pages)], { type: mimeFor(format) }),
          swapExtension(doc.name, 'fb2'),
        )
      } else {
        const epub = await toEpub(title, pages)
        if (format === 'epub') {
          downloadBlob(epub, swapExtension(doc.name, 'epub'))
        } else {
          const mobi = await convertEpubToMobi(epub)
          if (mobi) {
            downloadBlob(mobi, swapExtension(doc.name, 'mobi'))
            setNote('Đã chuyển MOBI bằng Calibre ebook-convert trên máy này.')
          } else {
            downloadBlob(epub, swapExtension(doc.name, 'epub'))
            setNote(
              'Không có Calibre ebook-convert. Đã tải EPUB; cài Calibre rồi chạy lại để ra MOBI.',
            )
          }
        }
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Chuyển đổi thất bại.')
    } finally {
      setBusy(false)
    }
  }

  const formats = FORMATS.map((item) =>
    item.id === 'mobi'
      ? {
          ...item,
          hint: calibre
            ? 'Kindle — Calibre sẵn sàng trên máy này'
            : 'Kindle — EPUB nếu chưa có Calibre',
        }
      : item,
  )

  return (
    <main id="main" className="page convert-page">
      <header className="page-head">
        <h1>Chuyển đổi định dạng</h1>
        <p>
          Trích chữ từ PDF rồi xuất TXT, HTML, Markdown, RTF, JSON, JSONL, YAML, XML, CSV, TSV, TOML, Org, LaTeX, INI, AsciiDoc, RST, Textile, MediaWiki, DokuWiki, DocBook, OPML, Atom, Typst, Gemtext, POD, BBCode, Fountain, TiddlyWiki, Texinfo, roff, Jupyter, BibTeX, SRT, VTT, LRC, ICS, VTODO, VJOURNAL, VFREEBUSY, VAVAILABILITY, MUSICXML, MEI, ABC, SMIL, GRAPHML, DOT, MF2T, LY, KRN, XSPF, M3U, JSPF, WPL, ASX, B4S, MPCPL, DPL, FPL, ZPL, ITL, CUE, ASS, TTML, SBV, SAMI, SUB, STL, SCC, USF, RT, MPL, DjVu, PS, TEI, JATS, RIS, ENW, CSL-JSON, NBIB, CSL-YAML, EndNote XML, MODS, CFF, DataCite, MARCXML, Dublin Core, ONIX, Unixref, BibJSON, PubMed, JSON-LD, BIBFRAME, Crossref, EAD, METS, PREMIS, MIX, ALTO, PAGE, FOXML, EDM, LIDO, VRA, CDWA Lite, SPECTRUM, Darwin Core, Object ID, EAC-CPF, CIDOC CRM, METS Rights, TextMD, PBCore, EBUCore, MPEG-7, AES57, IEEE LOM, IMS CP, NewsML, NITF, SportsML, EventsML, NewsML-G2, rNews, PRISM, hNews, IPTC, ANPA, NINJS, JSON Feed, Activity Streams, GeoJSON, KML, GPX, OSM, GeoRSS, WKT, GML, TopoJSON, SVG, DXF, MapML, CityJSON, IndoorGML, CityGML, LandXML, IFC-XML, gbXML, BCF, COBie, LandInfra, InfraGML, OpenDRIVE, RailML, TransXML, DATEX II, NeTEx, SIRI, TransXChange, NaPTAN, GTFS, IFOPT, OJP, TRIAS, VDV453, VDV454, VDV452, VDV462, VDV455, VDV731, VDV301, VDV423, VDV431, VDV300, VDV451, VDV432, VDV433, VDV434, VDV435, VDV436, VDV456, VDV457, VDV459, VDV461, VDV458, VDV460, XLIFF, TMX, TBX, PO, DITA, SSML, MATHML, VXML, PLS, MUSICXML, MEI, ABC, SMIL, GRAPHML, DOT, MF2T, LY, KRN, XSPF, M3U, JSPF, WPL, ASX, B4S, MPCPL, DPL, FPL, ZPL, ITL, vCard, RDF, OPDS, XLSX, DOCX/DOC,
          ODT, ODS, PPTX, ODP, FB2, EPUB hoặc MOBI; hoặc raster từng trang thành PNG/JPEG/WEBP/CBZ. Có
          thể mở TXT/Markdown/HTML/JSON/JSONL/YAML/XML/CSV/TSV/TOML/Org/LaTeX/INI/AsciiDoc/RST/Textile/MediaWiki/DokuWiki/DocBook/OPML/Atom/RSS/Typst/Gemtext/POD/BBCode/Fountain/TiddlyWiki/Texinfo/roff/Jupyter/BibTeX/SRT/VTT/LRC/ICS/VTODO/VJOURNAL/VFREEBUSY/VAVAILABILITY/CUE/ASS/TTML/SBV/SAMI/SUB/STL/SCC/USF/RT/MPL/DjVu/PS/TEI/JATS/RIS/ENW/CSL-JSON/NBIB/CSL-YAML/EndNote XML/MODS/CFF/DataCite/MARCXML/Dublin Core/ONIX/Unixref/BibJSON/PubMed/JSON-LD/BIBFRAME/Crossref/EAD/METS/PREMIS/MIX/ALTO/PAGE/FOXML/EDM/LIDO/VRA/CDWA Lite/SPECTRUM/Darwin Core/Object ID/EAC-CPF/CIDOC CRM/METS Rights/TextMD/PBCore/EBUCore/MPEG-7/AES57/IEEE LOM/IMS CP/NewsML/NITF/SportsML/EventsML/NewsML-G2/rNews/PRISM/hNews/IPTC/ANPA/NINJS/JSON Feed/Activity Streams/GeoJSON/KML/GPX/OSM/GeoRSS/WKT/GML/TopoJSON/SVG/DXF/MapML/CityJSON/IndoorGML/CityGML/LandXML/IFC-XML/gbXML/BCF/COBie/LandInfra/InfraGML/OpenDRIVE/RailML/TransXML/DATEX II/NeTEx/SIRI/TransXChange/NaPTAN/GTFS/IFOPT/OJP/TRIAS/VDV453/VDV454/VDV452/VDV462/VDV455/VDV731/VDV301/VDV423/VDV431/VDV300/VDV451/VDV432/VDV433/VDV434/VDV435/VDV436/VDV456/VDV457/VDV459/VDV461/VDV458/VDV460/XLIFF/TMX/TBX/PO/DITA/SSML/vCard/RDF/OPDS/VTODO/VJOURNAL/VFREEBUSY/VAVAILABILITY/RTF, DOCX, ODT, ODS, XLSX, PPTX, ODP, FB2,
          EPUB, CBZ hoặc PNG/JPEG/WEBP để tạo PDF trước, rồi xuất tiếp. Có thể xuất đúng các trang đang
          chọn trên Chỉnh sửa, kể cả khi chúng không liền nhau. PDF khóa cần mật khẩu; bản làm việc được giải khóa.
        </p>
      </header>

      <label className="file-btn">
        Tải PDF / chữ / ảnh
        <input
          type="file"
          accept={ACCEPT_SOURCES}
          aria-label="Tải tệp PDF, TXT, Markdown, HTML, JSON, JSONL, YAML, XML, KML, GPX, OSM, GeoRSS, WKT, GML, TopoJSON, SVG, DXF, MapML, CityJSON, IndoorGML, CityGML, LandXML, IFC-XML, gbXML, BCF, COBie, LandInfra, InfraGML, OpenDRIVE, RailML, TransXML, DATEX II, NeTEx, SIRI, TransXChange, NaPTAN, GTFS, IFOPT, OJP, TRIAS, VDV453, VDV454, VDV452, VDV462, VDV455, VDV731, VDV301, VDV423, VDV431, VDV300, VDV451, VDV432, VDV433, VDV434, VDV435, VDV436, VDV456, VDV457, VDV459, VDV461, VDV458, VDV460, XLIFF, TMX, TBX, PO, DITA, SSML, MATHML, VXML, PLS, MUSICXML, MEI, ABC, SMIL, GRAPHML, DOT, MF2T, LY, KRN, XSPF, M3U, JSPF, WPL, ASX, B4S, MPCPL, DPL, FPL, ZPL, ITL, vCard, RDF, OPDS, CSV, TSV, TOML, Org, LaTeX, INI, AsciiDoc, RST, Textile, MediaWiki, DokuWiki, DocBook, OPML, Atom, RSS, Typst, Gemtext, POD, BBCode, Fountain, TiddlyWiki, Texinfo, roff, Jupyter, BibTeX, SRT, VTT, LRC, ICS, VTODO, VJOURNAL, VFREEBUSY, VAVAILABILITY, MUSICXML, MEI, ABC, SMIL, GRAPHML, DOT, MF2T, LY, KRN, XSPF, M3U, JSPF, WPL, ASX, B4S, MPCPL, DPL, FPL, ZPL, ITL, CUE, ASS, TTML, SBV, SAMI, SUB, STL, SCC, USF, RT, MPL, DjVu, PS, TEI, JATS, RIS, ENW, CSL-JSON, NBIB, CSL-YAML, EndNote XML, MODS, CFF, DataCite, MARCXML, Dublin Core, ONIX, Unixref, BibJSON, PubMed, JSON-LD, BIBFRAME, Crossref, EAD, METS, PREMIS, MIX, ALTO, PAGE, FOXML, EDM, LIDO, VRA, CDWA Lite, SPECTRUM, Darwin Core, Object ID, EAC-CPF, CIDOC CRM, METS Rights, TextMD, PBCore, EBUCore, RTF, DOCX, ODT, ODS, XLSX, PPTX, ODP, FB2, EPUB, CBZ, PNG, JPEG hoặc WEBP để chuyển đổi"
          onChange={(event) => void onUpload(event.target.files?.[0])}
        />
      </label>

      {doc ? (
        <p className="meta">
          {doc.name} · {doc.pageCount} trang
        </p>
      ) : (
        <p className="empty">
          Chưa có tài liệu. Hãy tải PDF, TXT, Markdown, HTML, JSON, JSONL, YAML, XML, CSV, TSV, TOML, Org, LaTeX, INI, AsciiDoc, RST, Textile, MediaWiki, DokuWiki, DocBook, OPML, Atom, RSS, Typst, Gemtext, POD, BBCode, Fountain, TiddlyWiki, Texinfo, roff, Jupyter, BibTeX, SRT, VTT, LRC, ICS, VTODO, VJOURNAL, VFREEBUSY, VAVAILABILITY, MUSICXML, MEI, ABC, SMIL, GRAPHML, DOT, MF2T, LY, KRN, XSPF, M3U, JSPF, WPL, ASX, B4S, MPCPL, DPL, FPL, ZPL, ITL, CUE, ASS, TTML, SBV, SAMI, SUB, STL, SCC, USF, RT, MPL, DjVu, PS, TEI, JATS, RIS, ENW, CSL-JSON, NBIB, CSL-YAML, EndNote XML, MODS, CFF, DataCite, MARCXML, Dublin Core, ONIX, Unixref, BibJSON, PubMed, JSON-LD, BIBFRAME, Crossref, EAD, METS, PREMIS, MIX, ALTO, PAGE, FOXML, EDM, LIDO, VRA, CDWA Lite, SPECTRUM, Darwin Core, Object ID, EAC-CPF, CIDOC CRM, METS Rights, TextMD, PBCore, EBUCore, RTF, DOCX, ODT, ODS, XLSX, PPTX, ODP, FB2, EPUB, CBZ, PNG, JPEG, WEBP, WKT hoặc GML để chọn khoảng trang và định dạng xuất.
        </p>
      )}
      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}
      {note ? <p className="note">{note}</p> : null}

      {lockedPdf ? (
        <fieldset className="meta-pack">
          <legend>Mở PDF khóa</legend>
          <p className="note">{lockedPdf.name} đang khóa. Bản làm việc sẽ được giải khóa trên máy này.</p>
          <label className="overlay-field">
            Mật khẩu mở
            <input
              type="password"
              value={openPassword}
              autoComplete="current-password"
              onChange={(event) => setOpenPassword(event.target.value)}
              aria-label="Mật khẩu để mở PDF khóa"
            />
          </label>
          <div className="preset-row">
            <button
              type="button"
              className="primary"
              disabled={busy}
              aria-label="Mở PDF đã khóa mật khẩu; bản làm việc sẽ không còn khóa"
              onClick={() => void unlockPending()}
            >
              Mở PDF
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setLockedPdf(null)
                setOpenPassword('')
                setError(null)
              }}
            >
              Hủy
            </button>
          </div>
        </fieldset>
      ) : null}

      {doc ? (
        <div className="page-range" role="group" aria-label="Khoảng trang xuất">
          <label>
            Từ trang
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={fromPage}
              disabled={exportFromSelection}
              aria-label="Từ trang"
              aria-invalid={rangeError ? true : undefined}
              aria-describedby="range-help range-error"
              onChange={(event) =>
                setRange({
                  id: docId,
                  fromPage: event.target.value,
                  toPage,
                })
              }
            />
          </label>
          <label>
            Đến trang
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={toPage}
              disabled={exportFromSelection}
              aria-label="Đến trang"
              aria-invalid={rangeError ? true : undefined}
              aria-describedby="range-help range-error"
              onChange={(event) =>
                setRange({
                  id: docId,
                  fromPage,
                  toPage: event.target.value,
                })
              }
            />
          </label>
          <p id="range-help" className="range-help">
            Tài liệu có {doc.pageCount} trang. Để trống một ô sẽ không xuất được tệp.
          </p>
          {editorSelection ? (
            <label className="editor-pick">
              <input
                type="checkbox"
                checked={useEditorSelection}
                onChange={(event) => setUseEditorSelection(event.target.checked)}
              />
              Xuất các trang đã chọn trên Chỉnh sửa ({formatPageList(editorSelection)})
            </label>
          ) : null}
          {rangeError ? (
            <p id="range-error" className="error range-error" role="alert">
              {rangeError}
            </p>
          ) : (
            <p id="range-error" className="range-ok">
              {exportFromSelection && editorSelection
                ? `Sẽ xuất các trang ${formatPageList(editorSelection)}.`
                : `Sẽ xuất từ trang ${parsedRange && parsedRange.ok ? parsedRange.fromPage : 1} đến ${
                    parsedRange && parsedRange.ok ? parsedRange.toPage : doc.pageCount
                  }.`}
            </p>
          )}
        </div>
      ) : null}

      <fieldset className="formats">
        <legend>Định dạng đầu ra</legend>
        {formats.map((item) => (
          <label key={item.id} className={format === item.id ? 'picked' : undefined}>
            <input
              type="radio"
              name="format"
              value={item.id}
              checked={format === item.id}
              onChange={() => setFormat(item.id)}
            />
            <span>
              <strong>{item.label}</strong>
              <em>{item.hint}</em>
            </span>
          </label>
        ))}
      </fieldset>

      <button
        type="button"
        className="primary"
        disabled={busy || !doc || Boolean(rangeError)}
        onClick={() => void convert()}
      >
        {busy ? 'Đang chuyển…' : !doc ? 'Tải PDF trước khi chuyển' : 'Tải tệp đã chuyển'}
      </button>
    </main>
  )
}
