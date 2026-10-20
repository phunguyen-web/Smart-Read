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
          trên/dưới hoặc trái/phải, đánh số trang, chữ mờ, cắt lề, chuyển xám, tìm chữ, xóa trang
          không chữ hoặc trùng chữ, vừa khổ A4, nhân bản, tách hoặc giữ trang, tách nhiều PDF, chèn
          trang trắng hoặc PNG/JPEG/WEBP, kéo cả nhóm để sắp xếp, hoàn tác (giữ khi tải lại), thông
          tin tài liệu, gộp và chèn chữ
        </li>
        <li>
          Xuất TXT, HTML, Markdown, RTF, JSON, CSV, XLSX, DOCX/DOC, ODT, PPTX, FB2, EPUB, MOBI, PNG/JPEG/WEBP
          — và mở TXT/Markdown/HTML/JSON/CSV, RTF, DOCX, ODT, XLSX, PPTX, FB2, EPUB hoặc PNG/JPEG/WEBP thành
          PDF
        </li>
        <li>Không tài khoản, không lưu đám mây — tệp gần nhất và lịch sử hoàn tác được giữ trên trình duyệt này</li>
      </ul>
    </main>
  )
}
