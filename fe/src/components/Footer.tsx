import { Link } from 'react-router-dom'
import { ROUTES } from '../constants'

/** Footer chuyển từ bản Stitch, giữ nguyên nội dung */
const COLUMNS = [
  {
    title: 'Bộ Tuyển Chọn',
    links: [
      { label: 'Bộ Sưu Tập Sơn Hà Nguyệt', to: ROUTES.products },
      { label: 'Dạ Yến Cung Đình', to: ROUTES.products },
      { label: 'Tự Phối Hộp Gỗ Khảm Trai', to: ROUTES.boxBuilder },
      { label: 'Hương Vị Đông Trùng Yến Sào', to: ROUTES.products },
    ],
  },
  {
    title: 'Giải Pháp Doanh Nghiệp',
    links: [
      { label: 'Yêu Cầu Báo Giá Khối Lượng Lớn', to: ROUTES.rfq },
      { label: 'Khắc Kim & Ép Kim Biểu Tượng', to: ROUTES.rfq },
      { label: 'Hợp Đồng & Hóa Đơn Doanh Nghiệp', to: '/b2b/checkout' },
      { label: 'Đăng Ký Đối Tác Nghệ Nhân', to: '/seller/profile' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="w-full bg-primary-container text-champagne-light pt-space-xl pb-space-lg">
      <div className="max-w-[1320px] mx-auto px-margin-mobile lg:px-margin grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-xl mb-space-xl">
        <div className="space-y-space-md">
          <span className="font-headline-sm text-headline-sm text-champagne-light block">Nguyệt Viên Đài</span>
          <p className="font-body-sm text-body-sm text-on-primary-container leading-relaxed">
            Tôn vinh tinh hoa mỹ vị hoàng cung và di sản bánh Trung thu thủ công Việt Nam kết hợp nghệ thuật tạo tác đương đại.
          </p>
          <div className="flex items-center gap-space-sm pt-space-xs">
            <span className="font-label-sm text-label-sm text-secondary-fixed">BẢO CHỨNG HOÀNG TRIỀU</span>
          </div>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title} className="space-y-space-sm">
            <h4 className="font-label-lg text-label-lg text-secondary-fixed uppercase tracking-wider">{col.title}</h4>
            <ul className="space-y-2 font-body-sm text-body-sm text-on-primary-container">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link className="hover:text-champagne-light transition-colors" to={link.to}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="space-y-space-sm">
          <h4 className="font-label-lg text-label-lg text-secondary-fixed uppercase tracking-wider">Điện Đài Tư Vấn</h4>
          <p className="font-body-sm text-body-sm text-on-primary-container">Đường dây nóng đại tiệc & quà tặng ngoại giao:</p>
          <p className="font-headline-sm text-headline-sm text-secondary-fixed">1800 8899</p>
          <p className="font-body-sm text-body-sm text-on-primary-container">nguyetviendai@hoangtriều.vn</p>
        </div>
      </div>
      <div className="max-w-[1320px] mx-auto px-margin-mobile lg:px-margin pt-space-md flex flex-col md:flex-row items-center justify-between gap-space-sm text-on-primary-container font-body-sm text-body-sm">
        <p>© 2024 Nguyệt Viên Đài. Bản quyền thuộc về Đại Sàn Trung Thu Hoàng Gia.</p>
        <div className="flex gap-space-md">
          <Link className="hover:text-champagne-light transition-colors" to={ROUTES.policy}>
            Quy Chế Hoạt Động
          </Link>
          <Link className="hover:text-champagne-light transition-colors" to={ROUTES.policy}>
            Chính Sách Bảo Mật
          </Link>
        </div>
      </div>
    </footer>
  )
}
