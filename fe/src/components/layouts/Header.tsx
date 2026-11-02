// import { useState, useRef, useEffect, type FormEvent } from 'react'
import { useState, useRef, useEffect} from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Icon } from '../Icon'
import { HOME_BY_ROLE, ROUTES } from '../../constants'
import { cartCount, useCartStore } from '../../stores/cartStore'
import { useAuthStore } from '../../stores/authStore'
import { cn } from '../../lib/format'

/** Header dùng chung cho mọi trang client */
const BASE_NAV = [
  { to: '/', label: 'Trang Chủ', end: true },
  { to: ROUTES.products, label: 'Bộ Sưu Tập' },
  { to: ROUTES.boxBuilder, label: 'Tự Phối Hộp Quà' },
  { to: ROUTES.rfq, label: 'Báo Giá B2B' },
  { to: '/seller/profile', label: 'Kênh Nghệ Nhân' },
]

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'whitespace-nowrap transition-colors font-headline-sm text-[15px] font-medium tracking-wide py-1',
    isActive ? 'text-secondary-fixed font-bold' : 'text-champagne-light/80 hover:text-champagne-light',
  )

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profilePopupOpen, setProfilePopupOpen] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)
  const count = useCartStore((s) => cartCount(s.items))
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  // Đóng popup khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setProfilePopupOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // const handleSearch = (e: FormEvent<HTMLFormElement>) => {
  //   e.preventDefault()
  //   navigate(ROUTES.products)
  // }

  const handleLogout = async () => {
    setProfilePopupOpen(false)
    setMobileMenuOpen(false)
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 w-full z-50 bg-primary-container shadow-[0_4px_20px_rgba(9,36,65,0.18)]">
      <div className="h-20 max-w-[1320px] mx-auto px-margin-mobile lg:px-margin flex items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-lg shrink-0">
          <Link className="flex flex-col text-left" to="/" onClick={() => setMobileMenuOpen(false)}>
            <span className="font-headline-sm text-headline-sm text-champagne-light tracking-wide">Nguyệt Viên Đài</span>
            <span className="font-label-sm text-label-sm text-secondary-fixed tracking-widest uppercase">Đại Sàn Trung Thu Hoàng Gia</span>
          </Link>
        </div>

        {/*<form className="hidden 2xl:flex items-center flex-1 max-w-xs mx-space-md" role="search" onSubmit={handleSearch}>*/}
        {/*  <div className="relative w-full">*/}
        {/*    <Icon name="search" className="absolute left-space-sm top-1/2 -translate-y-1/2 text-on-primary-container text-[18px]" aria-hidden />*/}
        {/*    <input*/}
        {/*      className="w-full bg-primary pl-9 pr-space-sm py-1.5 rounded-[0.125rem] text-champagne-light font-body-sm text-body-sm placeholder:text-on-primary-container focus:outline-none focus:ring-1 focus:ring-secondary-fixed"*/}
        {/*      placeholder="Tìm bộ sưu tập, hương vị hoàng gia..."*/}
        {/*      type="search"*/}
        {/*      aria-label="Tìm kiếm"*/}
        {/*    />*/}
        {/*  </div>*/}
        {/*</form>*/}

        <nav className="hidden xl:flex items-center gap-5" aria-label="Điều hướng chính">
          {BASE_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
              {item.label}
            </NavLink>
          ))}
          {/* Link quản trị chỉ hiển thị khi có vai trò phù hợp */}
          {user && (user.role === 'PROVIDER' || user.role === 'PLATFORM_ADMIN') && (
            <NavLink to={HOME_BY_ROLE[user.role]} className={navClass}>
              Hoàng Đài Quản Trị
            </NavLink>
          )}
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

          {/* NÚT BẤM PROFILE CÁ NHÂN -> MỞ POPUP */}
          <div className="relative" ref={popupRef}>
            <button
              type="button"
              onClick={() => setProfilePopupOpen((prev) => !prev)}
              className={cn(
                'flex items-center gap-2 p-1.5 rounded-[0.25rem] transition-all cursor-pointer text-left',
                profilePopupOpen ? 'bg-ink-dark/80 ring-1 ring-secondary-fixed' : 'hover:bg-ink-dark/50',
              )}
              aria-expanded={profilePopupOpen}
              aria-label="Hồ sơ tài khoản cá nhân"
              title="Hồ sơ cá nhân"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center border border-gold/40 text-secondary-fixed shadow-sm">
                {user ? (
                  <span className="font-bold text-sm text-secondary-fixed">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </span>
                ) : (
                  <Icon name="person" className="text-[20px] text-secondary-fixed" aria-hidden />
                )}
              </div>
              <div className="hidden lg:flex flex-col text-left max-w-[120px]">
                <span className="font-body-sm text-[13px] text-champagne-light font-medium truncate">
                  {user ? user.fullName : 'Tài Khoản'}
                </span>
                <span className="font-label-sm text-[10px] text-secondary-fixed-dim uppercase tracking-wider">
                  {user
                    ? user.role === 'PLATFORM_ADMIN'
                      ? 'Admin'
                      : user.role === 'PROVIDER'
                        ? 'Seller'
                        : 'Khách hàng'
                    : 'Cá Nhân'}
                </span>
              </div>
              <Icon
                name="expand_more"
                className={cn('text-champagne-light/70 text-[18px] transition-transform', profilePopupOpen && 'rotate-180')}
                aria-hidden
              />
            </button>

            {/* POPUP HỒ SƠ CÁ NHÂN (CHỨA CẢ LOGIN VÀ LOGOUT) */}
            {profilePopupOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white text-ink border border-line rounded-lg shadow-card-hover z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {user ? (
                  /* ================= TRƯỜNG HỢP: ĐÃ ĐĂNG NHẬP ================= */
                  <div>
                    {/* Header thông tin cá nhân */}
                    <div className="p-4 border-b border-line bg-gradient-to-br from-ivory to-champagne/40">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary-container text-secondary-fixed flex items-center justify-center font-bold text-lg shadow-inner shrink-0">
                          {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-headline-sm text-[15px] font-bold text-navy truncate">
                            {user.fullName}
                          </span>
                          <span className="text-small text-muted truncate">{user.email}</span>
                          <div className="mt-1">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-gold/20 text-gold-ink border border-gold/40">
                              {user.role === 'PLATFORM_ADMIN'
                                ? '👑 Quản Trị Viên Sàn'
                                : user.role === 'PROVIDER'
                                  ? '🏮 Chủ Gian Hàng'
                                  : '✨ Khách Hàng Thân Thiết'}
                            </span>
                          </div>
                        </div>
                      </div>
                      {user.storeName && (
                        <div className="mt-2.5 pt-2 border-t border-line/60 flex items-center gap-1.5 text-xs text-secondary font-medium">
                          <Icon name="storefront" className="text-[14px]" aria-hidden />
                          <span className="truncate">Lò: {user.storeName}</span>
                        </div>
                      )}
                    </div>

                    {/* Danh sách liên kết tiện ích */}
                    <div className="py-2 px-1">
                      <Link
                        to={ROUTES.orders}
                        onClick={() => setProfilePopupOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2 text-body rounded-md hover:bg-champagne/30 transition-colors"
                      >
                        <Icon name="receipt_long" className="text-navy text-[18px]" aria-hidden />
                        <div className="flex flex-col">
                          <span className="font-medium text-navy text-[13px]">Đơn hàng của tôi</span>
                          <span className="text-[11px] text-muted">Xem tiến độ nướng bánh & giao nhận</span>
                        </div>
                      </Link>

                      <Link
                        to={ROUTES.changePassword}
                        onClick={() => setProfilePopupOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2 text-body rounded-md hover:bg-champagne/30 transition-colors"
                      >
                        <Icon name="key" className="text-navy text-[18px]" aria-hidden />
                        <span className="font-medium text-navy text-[13px]">Đổi mật khẩu</span>
                      </Link>

                      {user.role === 'PROVIDER' && (
                        <Link
                          to="/seller"
                          onClick={() => setProfilePopupOpen(false)}
                          className="flex items-center gap-3 px-3.5 py-2 text-body rounded-md hover:bg-champagne/30 transition-colors"
                        >
                          <Icon name="storefront" className="text-secondary text-[18px]" aria-hidden />
                          <div className="flex flex-col">
                            <span className="font-semibold text-secondary text-[13px]">Khu vực Gian Hàng Seller</span>
                            <span className="text-[11px] text-muted">Quản lý lò nướng, đơn sỉ & mẻ ra lò</span>
                          </div>
                        </Link>
                      )}

                      {user.role === 'PLATFORM_ADMIN' && (
                        <Link
                          to="/admin/kyc"
                          onClick={() => setProfilePopupOpen(false)}
                          className="flex items-center gap-3 px-3.5 py-2 text-body rounded-md hover:bg-champagne/30 transition-colors"
                        >
                          <Icon name="shield" className="text-primary text-[18px]" aria-hidden />
                          <div className="flex flex-col">
                            <span className="font-semibold text-primary text-[13px]">Quản Trị Sàn (Duyệt KYC)</span>
                            <span className="text-[11px] text-muted">Thẩm định chứng nhận ATTP các xưởng</span>
                          </div>
                        </Link>
                      )}
                    </div>

                    {/* Nút Đăng Xuất nằm trong popup */}
                    <div className="p-2 border-t border-line bg-surface/50">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-danger-soft hover:bg-danger text-danger hover:text-white font-medium text-body-sm transition-all cursor-pointer"
                      >
                        <span>Đăng xuất tài khoản</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ================= TRƯỜNG HỢP: CHƯA ĐĂNG NHẬP ================= */
                  <div className="p-5 text-center flex flex-col items-center">
                    <h3 className="font-headline-sm text-headline-sm text-navy font-bold">
                      Tài Khoản Cá Nhân
                    </h3>
                    <p className="mt-1 text-small text-muted leading-relaxed">
                      Đăng nhập để theo dõi lịch nướng bánh tươi, giỏ hàng và đặt sỉ B2B.
                    </p>

                    {/* NÚT ĐĂNG NHẬP TRONG POPUP */}
                    <div className="mt-5 w-full flex flex-col gap-2.5">
                      <Link
                        to={ROUTES.login}
                        onClick={() => setProfilePopupOpen(false)}
                        className="btn btn-primary w-full justify-center py-2.5 text-body-sm font-semibold shadow-sm"
                      >
                        <span>Đăng nhập ngay</span>
                      </Link>

                      <Link
                        to={ROUTES.register}
                        onClick={() => setProfilePopupOpen(false)}
                        className="btn btn-secondary w-full justify-center py-2 text-body-sm"
                      >
                        Tạo tài khoản mới
                      </Link>
                    </div>

                    <div className="mt-4 pt-3 border-t border-line w-full flex items-center justify-around text-xs text-muted">
                      <Link
                        to="/seller/profile"
                        onClick={() => setProfilePopupOpen(false)}
                        className="hover:text-navy underline"
                      >
                        Kênh nghệ nhân
                      </Link>
                      <span>•</span>
                      <Link
                        to="/policy"
                        onClick={() => setProfilePopupOpen(false)}
                        className="hover:text-navy underline"
                      >
                        Chính sách sàn
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            className="xl:hidden p-1 text-champagne-light"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-expanded={mobileMenuOpen}
            aria-label="Mở menu"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Menu di động */}
      {mobileMenuOpen && (
        <nav className="xl:hidden flex flex-col gap-space-md px-margin-mobile pb-space-lg pt-space-sm border-t border-white/10" aria-label="Menu di động">
          {BASE_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navClass} onClick={() => setMobileMenuOpen(false)}>
              {item.label}
            </NavLink>
          ))}
          {user && (user.role === 'PROVIDER' || user.role === 'PLATFORM_ADMIN') && (
            <NavLink to={HOME_BY_ROLE[user.role]} className={navClass} onClick={() => setMobileMenuOpen(false)}>
              Hoàng Đài Quản Trị
            </NavLink>
          )}

          <div className="pt-2 border-t border-white/10">
            {user ? (
              <div className="flex flex-col gap-2">
                <span className="text-champagne-light text-small font-medium">
                  Đang đăng nhập: <strong>{user.fullName}</strong> ({user.role})
                </span>
                <button
                  type="button"
                  className="text-left text-danger-soft font-headline-sm text-[15px] font-medium tracking-wide flex items-center gap-1.5 cursor-pointer"
                  onClick={handleLogout}
                >
                  <Icon name="logout" className="text-[18px]" aria-hidden />
                  <span>Đăng xuất</span>
                </button>
              </div>
            ) : (
              <NavLink to={ROUTES.login} className={navClass} onClick={() => setMobileMenuOpen(false)}>
                Đăng nhập
              </NavLink>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
