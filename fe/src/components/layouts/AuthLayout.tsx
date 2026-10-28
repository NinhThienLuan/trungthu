import { Link, Outlet } from 'react-router-dom'
import { BRAND, ROUTES } from '../../constants'

/** Khung cho login / register: ảnh hộp quà trung thu làm nền, form giữa màn hình */
export function AuthLayout() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-navy px-4 py-12">
      {/* Ảnh để trong public/ (không phụ thuộc link ngoài); ảnh nhỏ nên làm mờ nhẹ cho mịn */}
      <img src="/login-bg.jpg" alt="" aria-hidden className="absolute inset-0 size-full scale-110 object-cover blur-[3px]" />
      {/* Lớp phủ tối để form và chữ luôn đủ tương phản */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink-dark/60 via-ink-dark/40 to-ink-dark/75" aria-hidden />
      <Link to={ROUTES.home} className="relative mb-8 font-serif text-h2 text-champagne-light drop-shadow">
        {BRAND}
      </Link>
      <div className="card relative w-full max-w-md p-6 shadow-2xl md:p-8">
        <Outlet />
      </div>
    </div>
  )
}
