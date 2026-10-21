import { useState, type FormEvent } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Icon } from '../Icon'
import { ROUTES } from '../../constants'
import { cartCount, useCartStore } from '../../stores/cartStore'
import { useAuthStore } from '../../stores/authStore'
import { cn } from '../../lib/format'

/** Header chuyển từ bản Stitch (bộ sưu tập), dùng chung cho mọi trang buyer */
const NAV = [
  { to: '/', label: 'Trang Chủ', end: true },
  { to: ROUTES.products, label: 'Bộ Sưu Tập' },
  { to: ROUTES.boxBuilder, label: 'Tự Phối Hộp Quà' },
  { to: ROUTES.rfq, label: 'Báo Giá B2B' },
  { to: '/seller/profile', label: 'Kênh Nghệ Nhân' },
  { to: '/seller', label: 'Hoàng Đài Quản Trị' },
]

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'whitespace-nowrap transition-colors font-headline-sm text-[15px] font-medium tracking-wide py-1',
    isActive ? 'text-secondary-fixed font-bold' : 'text-champagne-light/80 hover:text-champagne-light',
  )

export function Header() {
  const [open, setOpen] = useState(false)
  const count = useCartStore((s) => cartCount(s.items))
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    navigate(ROUTES.products)
  }

  return (
    <header className="sticky top-0 w-full z-50 bg-primary-container shadow-[0_4px_20px_rgba(9,36,65,0.18)]">
      <div className="h-20 max-w-[1320px] mx-auto px-margin-mobile lg:px-margin flex items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-lg shrink-0">
          <Link className="flex flex-col text-left" to="/" onClick={() => setOpen(false)}>
            <span className="font-headline-sm text-headline-sm text-champagne-light tracking-wide">Nguyệt Viên Đài</span>
            <span className="font-label-sm text-label-sm text-secondary-fixed tracking-widest uppercase">Đại Sàn Trung Thu Hoàng Gia</span>
          </Link>
        </div>

        <form className="hidden 2xl:flex items-center flex-1 max-w-xs mx-space-md" role="search" onSubmit={handleSearch}>
          <div className="relative w-full">
            <Icon name="search" className="absolute left-space-sm top-1/2 -translate-y-1/2 text-on-primary-container text-[18px]" aria-hidden />
            <input
              className="w-full bg-primary pl-9 pr-space-sm py-1.5 rounded-[0.125rem] text-champagne-light font-body-sm text-body-sm placeholder:text-on-primary-container focus:outline-none focus:ring-1 focus:ring-secondary-fixed"
              placeholder="Tìm bộ sưu tập, hương vị hoàng gia..."
              type="search"
              aria-label="Tìm kiếm"
            />
          </div>
        </form>

        <nav className="hidden xl:flex items-center gap-5" aria-label="Điều hướng chính">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-space-md shrink-0">
          <Link
            className="hidden sm:inline-flex whitespace-nowrap items-center gap-space-xs border border-secondary-fixed/40 text-champagne-light px-space-md py-2 rounded-[0.125rem] font-headline-sm text-[14px] font-medium tracking-wide hover:border-secondary-fixed hover:bg-white/5 transition-colors"
            to={ROUTES.rfq}
          >
            <Icon name="request_quote" className="text-[18px] text-secondary-fixed-dim" aria-hidden />
            <span>RFQ Doanh Nghiệp</span>
          </Link>
          <Link
            className="relative p-2 text-champagne-light hover:text-secondary-fixed transition-colors flex items-center justify-center"
            to={ROUTES.cart}
            aria-label={`Giỏ hàng, ${count} sản phẩm`}
          >
            <Icon name="shopping_bag" className="text-[22px]" aria-hidden />
            {count > 0 && (
              <span className="absolute top-1 right-1 min-w-4 h-4 px-0.5 rounded-[0.75rem] bg-secondary text-on-secondary font-label-sm text-[10px] flex items-center justify-center leading-none">
                {count}
              </span>
            )}
          </Link>
          <Link
            to={user ? ROUTES.orders : ROUTES.login}
            className="w-8 h-8 rounded-[0.75rem] bg-primary flex items-center justify-center"
            aria-label={user ? `Đơn của tôi (${user.fullName})` : 'Đăng nhập'}
            title={user ? user.fullName : 'Đăng nhập'}
          >
            <Icon name="person" className="text-on-primary text-[18px]" aria-hidden />
          </Link>
          <button
            type="button"
            className="xl:hidden p-1 text-champagne-light"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Mở menu"
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="xl:hidden flex flex-col gap-space-md px-margin-mobile pb-space-lg pt-space-sm border-t border-white/10" aria-label="Menu di động">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navClass} onClick={() => setOpen(false)}>
              {item.label}
            </NavLink>
          ))}
          {user ? (
            <button
              type="button"
              className="text-left text-champagne-light/80 font-headline-sm text-[15px] font-medium tracking-wide"
              onClick={async () => {
                setOpen(false)
                await logout()
                navigate('/')
              }}
            >
              Đăng xuất ({user.fullName})
            </button>
          ) : (
            <NavLink to={ROUTES.login} className={navClass} onClick={() => setOpen(false)}>
              Đăng nhập
            </NavLink>
          )}
        </nav>
      )}
    </header>
  )
}
