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
          Dải thumbnail rõ nét, chọn lẻ/chẵn, xoay 90/180, đảo thứ tự, đánh số trang, nhân bản, tách
          hoặc giữ trang, tách nhiều PDF, chèn trang trắng, kéo cả nhóm để sắp xếp, hoàn tác (giữ khi
          tải lại), gộp và chèn chữ
        </li>
        <li>Xuất TXT, HTML, Markdown, DOCX/DOC, EPUB, MOBI — và mở TXT/Markdown/HTML thành PDF</li>
        <li>Không tài khoản, không lưu đám mây — tệp gần nhất và lịch sử hoàn tác được giữ trên trình duyệt này</li>
      </ul>
    </main>
  )
}
