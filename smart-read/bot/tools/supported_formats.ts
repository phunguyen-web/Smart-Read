import { defineTool } from "@cursor/bdk/tools";
import * as z from "zod/v4";
import { SUPPORTED_FORMATS } from "../lib/pipeline.js";

export default defineTool({
  description:
    "List the PDF edit surface and export formats Smart-Read supports (TXT, HTML, Markdown, RTF, JSON, JSONL, YAML, XML, CSV, TSV, TOML, Org, LaTeX, INI, AsciiDoc, RST, Textile, MediaWiki, DokuWiki, DocBook, OPML, Atom, Typst, Gemtext, POD, BBCode, Fountain, TiddlyWiki, Texinfo, roff, Jupyter, BibTeX, SRT, VTT, LRC, ICS, CUE, ASS, TTML, SBV, SAMI, SUB, STL, SCC, USF, RT, MPL, DjVu, PS, TEI, JATS, RIS, ENW, CSL-JSON, NBIB, CSL-YAML, EndNote XML, MODS, CFF, DataCite, MARCXML, Dublin Core, ONIX, Unixref, BibJSON, PubMed, JSON-LD, BIBFRAME, Crossref, EAD, METS, PREMIS, MIX, ALTO, PAGE, FOXML, EDM, LIDO, VRA, CDWA Lite, SPECTRUM, Darwin Core, Object ID, EAC-CPF, CIDOC CRM, METS Rights, TextMD, PBCore, EBUCore, MPEG-7, AES57, IEEE LOM, IMS CP, NewsML, NITF, SportsML, EventsML, NewsML-G2, rNews, PRISM, hNews, IPTC, ANPA, XLSX, DOCX/DOC, ODT, ODS, PPTX, ODP, FB2, EPUB, MOBI, PNG, JPEG, WEBP, CBZ), including RTF/DOCX/ODT/ODS/XLSX/PPTX/ODP/FB2/EPUB/CBZ/JSON/JSONL/YAML/XML/CSV/TSV/TOML/Org/LaTeX/INI/AsciiDoc/RST/Textile/MediaWiki/DokuWiki/DocBook/OPML/Atom/RSS/Typst/Gemtext/POD/BBCode/Fountain/TiddlyWiki/Texinfo/roff/Jupyter/BibTeX/SRT/VTT/LRC/ICS/CUE/ASS/TTML/SBV/SAMI/SUB/STL/SCC/USF/RT/MPL/DjVu/PS/TEI/JATS/RIS/ENW/CSL-JSON/NBIB/CSL-YAML/EndNote XML/MODS/CFF/DataCite/MARCXML/Dublin Core/ONIX/Unixref/BibJSON/PubMed/JSON-LD/BIBFRAME/Crossref/EAD/METS/PREMIS/MIX/ALTO/PAGE/FOXML/EDM/LIDO/VRA/CDWA Lite/SPECTRUM/Darwin Core/Object ID/EAC-CPF/CIDOC CRM/METS Rights/TextMD/PBCore/EBUCore/MPEG-7/AES57/IEEE LOM/IMS CP/NewsML/NITF/SportsML/EventsML/NewsML-G2/rNews/PRISM/hNews/IPTC/ANPA/WEBP import.",
  effect: "read",
  inputSchema: z.object({}),
  async execute() {
    return { formats: SUPPORTED_FORMATS };
  },
});
