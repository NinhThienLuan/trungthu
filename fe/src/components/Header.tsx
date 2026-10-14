import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Menu, Package, ShoppingBag, User, X } from 'lucide-react'
import { BRAND, ROUTES } from '../constants'
import { cartCount, useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { cn } from '../lib/format'

const NAV = [
  { to: ROUTES.products, label: 'Bộ sưu tập' },
  { to: ROUTES.rfq, label: 'Đặt hàng doanh nghiệp' },
  { to: ROUTES.policy, label: 'Chính sách' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const count = useCartStore((s) => cartCount(s.items))
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const navClass = ({ isActive }: { isActive: boolean }) =>
    cn('text-small font-semibold uppercase tracking-wider transition-colors', isActive ? 'text-gold' : 'text-white/80 hover:text-gold')

  const handleLogout = async () => {
    await logout()
    navigate(ROUTES.home)
  }

  return (
    <header className="sticky top-0 z-40 bg-navy">
      <div className="page flex h-16 items-center gap-8">
        <Link to={ROUTES.home} className="font-serif text-h3 text-gold" onClick={() => setOpen(false)}>
          {BRAND}
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Điều hướng chính">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          {user ? (
            <>
              <Link to={ROUTES.orders} className="hidden items-center gap-2 px-3 text-small text-white/80 hover:text-gold md:flex">
                <Package className="size-4" aria-hidden />
                Đơn của tôi
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden size-10 items-center justify-center text-white/80 hover:text-gold md:flex"
                aria-label="Đăng xuất"
                title={`Đăng xuất (${user.fullName})`}
              >
                <LogOut className="size-5" />
              </button>
            </>
          ) : (
            <Link to={ROUTES.login} className="hidden items-center gap-2 px-3 text-small text-white/80 hover:text-gold md:flex">
              <User className="size-4" aria-hidden />
              Đăng nhập
            </Link>
          )}

          <Link to={ROUTES.cart} className="relative flex size-10 items-center justify-center text-white/80 hover:text-gold" aria-label={`Giỏ hàng, ${count} sản phẩm`}>
            <ShoppingBag className="size-5" />
            {count > 0 && (
              <span className="absolute right-0.5 top-0.5 flex min-w-5 items-center justify-center rounded-full bg-gold px-1 text-label font-bold text-navy">
                {count}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="flex size-10 items-center justify-center text-white/80 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Mở menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="page flex flex-col gap-4 border-t border-white/10 pb-6 pt-4 md:hidden" aria-label="Menu di động">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass} onClick={() => setOpen(false)}>
              {item.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <NavLink to={ROUTES.orders} className={navClass} onClick={() => setOpen(false)}>
                Đơn của tôi
              </NavLink>
              <button type="button" className="text-left text-small font-semibold uppercase tracking-wider text-white/80" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
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
