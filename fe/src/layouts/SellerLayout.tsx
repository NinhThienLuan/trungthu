import { NavLink, Outlet, ScrollRestoration, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { handleStitchLinkClick } from '../routes/stitchPaths'
import { cn } from '../lib/format'

/**
 * Khung khu vực nghệ nhân / quản trị — chuyển nguyên sidebar + topbar từ bản Stitch.
 * (Phần của FE2 - Thạch: các trang bên trong hiện là giao diện tĩnh, chưa nối API.)
 */
const NAV = [
  { to: '/seller', icon: 'dashboard', label: 'Bảng Điều Khiển', end: true },
  { to: '/seller/products', icon: 'bakery_dining', label: 'Menu & Mẻ Ra Lò' },
  { to: '/seller/b2b', icon: 'request_quote', label: 'Báo Giá Sỉ B2B' },
  { to: '/seller/orders', icon: 'local_shipping', label: 'Đơn Hàng & Giao Lạnh' },
  { to: '/seller/profile', icon: 'workspace_premium', label: 'Hồ Sơ & Thẩm Định' },
]
const ADMIN_NAV = [{ to: '/admin/kyc', icon: 'biotech', label: 'Thẩm Định Chất Lượng' }]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-space-sm px-space-md py-3 rounded-[0.25rem] transition-all',
    isActive
      ? 'bg-ink-dark text-secondary-fixed font-semibold'
      : 'text-inverse-on-surface/80 hover:bg-ink-dark/50 hover:text-champagne-light',
  )

export function SellerLayout() {
  const navigate = useNavigate()
  return (
    <div className="min-h-dvh bg-surface font-body-md text-body-md text-on-surface antialiased">
      <aside className="fixed left-0 top-0 h-full w-72 bg-primary-container z-50 flex flex-col justify-between shadow-[4px_0_24px_rgba(5,19,34,0.18)]">
        <div className="flex flex-col">
          <NavLink to="/" className="h-20 px-space-lg flex items-center justify-between bg-ink-dark/40">
            <div className="flex items-center gap-space-sm">
              <div className="w-9 h-9 rounded-[0.25rem] bg-primary flex items-center justify-center">
                <Icon name="nest_clock_farsight_analog" className="text-secondary-fixed text-[22px]" aria-hidden />
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-champagne-light tracking-wide leading-none">Nguyệt Viên</span>
                <span className="font-label-sm text-label-sm text-secondary-fixed uppercase tracking-[0.2em] mt-1">Đài Nghệ Nhân</span>
              </div>
            </div>
          </NavLink>
          <div className="px-space-md py-space-sm">
            <div className="p-space-sm rounded-[0.25rem] bg-ink-dark/30 flex items-center justify-between">
              <div className="flex flex-col min-w-0 pr-space-xs">
                <span className="font-label-sm text-label-sm text-secondary-fixed-dim uppercase tracking-wider truncate">Xưởng Bánh Tinh Hoa</span>
                <span className="font-body-sm text-body-sm text-champagne-light font-medium truncate">Đông Phương • Hải Phòng</span>
              </div>
              <Icon name="verified" className="text-secondary-fixed text-[18px]" aria-hidden />
            </div>
          </div>
          <div className="px-space-md mt-space-xs">
            <span className="font-label-sm text-label-sm text-outline-variant/60 uppercase tracking-[0.16em] px-space-sm mb-space-xs block">
              Hệ Thống Gian Hàng
            </span>
          </div>
          <nav className="flex flex-col gap-1 px-space-md" aria-label="Khu vực nghệ nhân">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                <Icon name={item.icon} className="text-[20px] text-secondary-fixed-dim" aria-hidden />
                <span className="font-body-md text-body-md">{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="px-space-md mt-space-md">
            <span className="font-label-sm text-label-sm text-outline-variant/60 uppercase tracking-[0.16em] px-space-sm mb-space-xs block">
              Quản Trị Sàn
            </span>
          </div>
          <nav className="flex flex-col gap-1 px-space-md" aria-label="Quản trị sàn">
            {ADMIN_NAV.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                <Icon name={item.icon} className="text-[20px] text-secondary-fixed-dim" aria-hidden />
                <span className="font-body-md text-body-md">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="p-space-md flex flex-col gap-space-sm">
          <div className="p-space-sm rounded-[0.25rem] bg-ink-dark/40 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-secondary-fixed-dim uppercase tracking-wider">Bảo Chứng Nghệ Nhân</span>
              <span className="font-label-sm text-label-sm text-champagne-light">Hạng Vàng</span>
            </div>
            <div className="w-full h-1.5 rounded-[0.75rem] bg-primary overflow-hidden">
              <div className="w-4/5 h-full bg-secondary-fixed" />
            </div>
            <span className="font-body-sm text-body-sm text-outline-variant/80 text-[11px]">Đã chuẩn hóa tiêu chuẩn OCOP 5★</span>
          </div>
          <div className="flex items-center justify-between px-space-sm pt-space-xs text-outline-variant hover:text-champagne-light cursor-pointer transition-colors">
            <span className="font-body-sm text-body-sm">Trợ giúp Pháp quy & B2B</span>
            <Icon name="support_agent" className="text-[16px]" aria-hidden />
          </div>
        </div>
      </aside>

      <div className="pl-72">
        <header className="fixed top-0 left-72 right-0 h-20 bg-primary-container z-40 shadow-[0_4px_20px_rgba(5,19,34,0.12)]">
          <div className="h-20 w-full px-space-lg flex items-center justify-between">
            <div className="flex items-center gap-space-lg">
              <div className="flex items-center gap-space-sm px-space-md py-space-xs rounded-[0.25rem] bg-ink-dark/50 cursor-pointer">
                <Icon name="storefront" className="text-secondary-fixed text-[20px]" aria-hidden />
                <div className="flex flex-col text-left">
                  <span className="font-headline-sm text-[15px] leading-tight text-champagne-light font-medium">Đông Phương - Cầu Đất Hải Phòng</span>
                  <span className="font-label-sm text-label-sm text-secondary-fixed-dim uppercase tracking-wider">Lò Bánh Di Sản 70 Năm</span>
                </div>
                <Icon name="expand_more" className="text-outline-variant text-[18px]" aria-hidden />
              </div>
              <div className="hidden xl:flex items-center gap-space-sm px-space-md py-space-xs rounded-[0.75rem] bg-tertiary-container text-tertiary-fixed">
                <span className="w-2 h-2 rounded-[0.75rem] bg-tertiary-fixed animate-pulse" />
                <span className="font-body-sm text-body-sm tracking-wide text-champagne-light">Lò nướng đang hoạt động • 18°C Chuỗi Lạnh B2B</span>
              </div>
            </div>
            <div className="flex items-center gap-space-md">
              <button
                type="button"
                className="w-10 h-10 rounded-[0.25rem] bg-ink-dark/40 flex items-center justify-center text-champagne-light hover:bg-ink-dark transition-colors relative"
                aria-label="Thông báo"
              >
                <Icon name="notifications" className="text-[20px]" aria-hidden />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-[0.75rem] bg-secondary-fixed" />
              </button>
              <button
                type="button"
                className="w-10 h-10 rounded-[0.25rem] bg-ink-dark/40 flex items-center justify-center text-champagne-light hover:bg-ink-dark transition-colors"
                aria-label="Lịch"
              >
                <Icon name="schedule" className="text-[20px]" aria-hidden />
              </button>
              <div className="flex items-center gap-space-sm pl-space-sm">
                <div className="hidden md:flex flex-col text-right">
                  <span className="font-body-sm text-body-sm font-semibold text-champagne-light">Nghệ Nhân Lương Thế Cường</span>
                  <span className="font-label-sm text-label-sm text-secondary-fixed-dim uppercase tracking-wider">Chủ Mẻ Trưởng Đài</span>
                </div>
                <div className="w-8 h-8 rounded-[0.75rem] bg-primary flex items-center justify-center">
                  <Icon name="person" className="text-on-primary text-[18px]" aria-hidden />
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="relative pt-20 bg-surface min-h-screen" onClick={(e) => handleStitchLinkClick(e, navigate)}>
          <Outlet />
        </main>
      </div>
      <ScrollRestoration />
    </div>
  )
}
