import { Link } from 'react-router-dom'
import { BRAND, ROUTES } from '../constants'

export function Footer() {
  return (
    <footer className="mt-auto bg-navy-deep text-white/70">
      <div className="page grid gap-8 py-12 md:grid-cols-3">
        <div>
          <p className="font-serif text-h3 text-gold">{BRAND}</p>
          <p className="mt-2 max-w-xs text-small">Sàn kết nối người mua với các xưởng bánh Trung Thu thủ công.</p>
        </div>
        <div className="flex flex-col gap-2 text-small">
          <p className="eyebrow text-gold">Mua sắm</p>
          <Link to={ROUTES.products} className="hover:text-gold">Bộ sưu tập</Link>
          <Link to={ROUTES.rfq} className="hover:text-gold">Đặt hàng doanh nghiệp</Link>
          <Link to={ROUTES.orders} className="hover:text-gold">Tra cứu đơn hàng</Link>
        </div>
        <div className="flex flex-col gap-2 text-small">
          <p className="eyebrow text-gold">Hỗ trợ</p>
          <Link to={ROUTES.policy} className="hover:text-gold">Chính sách bánh tươi & hoàn tiền</Link>
        </div>
      </div>
      <div className="page border-t border-white/10 py-5 text-small">© {new Date().getFullYear()} {BRAND}</div>
    </footer>
  )
}
