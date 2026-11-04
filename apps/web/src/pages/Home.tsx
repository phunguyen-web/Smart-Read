import { navigate } from '../use-route.ts'

export function Home() {
  return (
    <main id="main" className="page hero-page">
      <p className="eyebrow">Smart-Read</p>
      <h1>Chỉnh sửa PDF và chuyển sang DOC, EPUB, MOBI</h1>
      <p className="lede">
        Tải một PDF, xoay hay gộp trang ngay trên trình duyệt, rồi xuất sang chữ,
        Word, EPUB hoặc MOBI. Tệp chỉ nằm trong máy bạn, tối đa 20 MB.
      </p>
      <div className="cta-row">
        <button type="button" className="primary" onClick={() => navigate('/edit')}>
          Chỉnh sửa PDF
        </button>
        <button type="button" className="secondary" onClick={() => navigate('/convert')}>
          Chuyển đổi định dạng
        </button>
      </div>
      <ul className="feature-list">
        <li>
          Dải thumbnail rõ nét, chọn lẻ/chẵn hoặc đảo chọn, xoay 90/180, đảo thứ tự, đan hai nửa
          (scan 2 mặt) hoặc tách lẻ/chẵn, gộp 2/4 trang mỗi tờ, xếp sách gấp, lật ngang/dọc, cắt đôi
          trên/dưới hoặc trái/phải, xoay khổ đứng/ngang, đổi tỷ lệ trang, đánh số trang, chữ mờ, cắt
          hoặc thêm lề, đầu/cuối trang, đóng khung, thêm trang bìa, phủ màu đọc, phủ nền trang, cắt lề trắng, chuyển xám, tìm chữ, xóa trang không chữ hoặc trùng chữ, vừa khổ A4/Letter/A5, đồng khổ,
          nhân bản, tách hoặc giữ trang, tách nhiều PDF, chèn trang trắng hoặc PNG/JPEG/WEBP, kéo cả
          nhóm để sắp xếp, hoàn tác (giữ khi tải lại), thông tin tài liệu, mục lục (thư mục lồng 3 cấp không Dest hoặc đích tên, thu từng mục, đổi tên / xóa / lên / xuống / thụt vào / thụt ra / gắn trang / đích tên / gắn trang đích từ ô trang / đổi tên đích / nhân bản đích / đích từ trang chọn / xóa đích / xóa mọi đích / kiểu xem XYZ Fit FitH FitV FitR FitB FitBH FitBV / gắn XYZ trái đỉnh zoom / khổ A4 Letter A5 trái trên / mé trái trên / trên / phải trên / trái giữa / giữa / phải giữa / trái dưới / dưới / phải dưới theo khổ trang đích / zoom 50% / 75% / 100% / 125% / 150% / 200% / vừa rộng / vừa cao / vừa trang / giữ zoom / giữ trái / giữ trên / trái 0 / trên 0 / gốc / về gốc, tới đích tên, gợi ý đích và nhãn trang, bấm đích trên thumbnail), xem tờ in sách gấp, nhãn trang và đích tên trên thumbnail, tải ảnh nhúng, mở PDF khóa, khóa mật khẩu khi tải, gộp và chèn chữ
        </li>
        <li>
          Xuất TXT, HTML, Markdown, RTF, JSON, JSONL, YAML, XML, CSV, TSV, TOML, Org, LaTeX, INI, AsciiDoc, RST, Textile, MediaWiki, DokuWiki, DocBook, OPML, Atom, Typst, Gemtext, POD, BBCode, Fountain, TiddlyWiki, Texinfo, roff, Jupyter, BibTeX, SRT, VTT, LRC, ICS, CUE, ASS, TTML, SBV, SAMI, SUB, STL, SCC, USF, RT, MPL, DjVu, PS, TEI, JATS, RIS, ENW, CSL-JSON, NBIB, CSL-YAML, EndNote XML, MODS, CFF, DataCite, MARCXML, Dublin Core, ONIX, Unixref, BibJSON, PubMed, JSON-LD, BIBFRAME, Crossref, EAD, METS, PREMIS, MIX, ALTO, PAGE, FOXML, EDM, LIDO, VRA, CDWA Lite, SPECTRUM, XLSX, DOCX/DOC, ODT, ODS, PPTX, ODP, FB2, EPUB, MOBI, PNG/JPEG/WEBP, CBZ
          — và mở TXT/Markdown/HTML/JSON/JSONL/YAML/XML/CSV/TSV/TOML/Org/LaTeX/INI/AsciiDoc/RST/Textile/MediaWiki/DokuWiki/DocBook/OPML/Atom/RSS/Typst/Gemtext/POD/BBCode/Fountain/TiddlyWiki/Texinfo/roff/Jupyter/BibTeX/SRT/VTT/LRC/ICS/CUE/ASS/TTML/SBV/SAMI/SUB/STL/SCC/USF/RT/MPL/DjVu/PS/TEI/JATS/RIS/ENW/CSL-JSON/NBIB/CSL-YAML/EndNote XML/MODS/CFF/DataCite/MARCXML/Dublin Core/ONIX/Unixref/BibJSON/PubMed/JSON-LD/BIBFRAME/Crossref/EAD/METS/PREMIS/MIX/ALTO/PAGE/FOXML/EDM/LIDO/VRA/CDWA Lite/SPECTRUM, RTF, DOCX, ODT, ODS, XLSX, PPTX, ODP, FB2, EPUB, CBZ hoặc PNG/JPEG/WEBP thành
          PDF
        </li>
        <li>Không tài khoản, không lưu đám mây — tệp gần nhất và lịch sử hoàn tác được giữ trên trình duyệt này</li>
      </ul>
    </main>
  )
}
