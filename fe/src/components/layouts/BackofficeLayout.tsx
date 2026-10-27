import { useEffect, useState } from 'react'
import { NavLink, Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ClipboardList, FileCheck2, LayoutDashboard, LogOut, Menu, Package, Settings2, ShoppingBag, Store, WalletCards, X, CalendarDays } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useBackoffice } from '../../features/backoffice/store'
import { STORE_NAME } from '../../features/backoffice/model'
import '../../features/backoffice/backoffice.css'

const SELLER_NAV = [
  { to: '/seller', label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/seller/products', label: 'Danh mục SKU', icon: Package },
  { to: '/seller/orders', label: 'Đơn hàng', icon: ShoppingBag },
  { to: '/seller/capacity', label: 'Hạn ngạch & ra lò', icon: CalendarDays },
  { to: '/seller/b2b', label: 'Yêu cầu mua sỉ RFQ', icon: ClipboardList },
  { to: '/seller/profile', label: 'Hồ sơ pháp lý', icon: FileCheck2 },
  { to: '/seller/subscription', label: 'Gói dịch vụ', icon: WalletCards },
  { to: '/seller/settings', label: 'Cài đặt bán hàng', icon: Settings2 },
]
const ADMIN_NAV = [
  { to: '/admin', label: 'Tổng quan nền tảng', icon: LayoutDashboard },
  { to: '/admin/kyc', label: 'Duyệt hồ sơ KYC', icon: FileCheck2 },
  { to: '/admin/subscriptions', label: 'Kích hoạt gói SaaS', icon: WalletCards },
]
export function BackofficeLayout({ area }: { area: 'seller' | 'admin' }) {
  const { pathname } = useLocation()
  const [menu, setMenu] = useState(false)
  const { user, logout } = useAuthStore()
  const { notice, notify, expireHolds } = useBackoffice()
  const navigate = useNavigate()
  const isAdmin = area === 'admin'
  const nav = isAdmin ? ADMIN_NAV : SELLER_NAV
  useEffect(() => { expireHolds(); const timer = window.setInterval(expireHolds, 1000); return () => window.clearInterval(timer) }, [expireHolds])
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => notify(''), 6000); return () => window.clearTimeout(timer) }, [notice, notify])
  return <div className="bo-app">
    {menu && <button className="bo-menu-overlay" aria-label="Đóng menu" onClick={() => setMenu(false)} />}
    <aside className={`bo-sidebar ${menu ? 'is-open' : ''}`}>
      <NavLink to={isAdmin ? '/admin' : '/seller'} className="bo-brand" onClick={() => setMenu(false)}><span className="bo-brand-mark" aria-hidden>◐</span><span>Nguyệt Viên Đài<small>{isAdmin ? 'Quản trị nền tảng' : 'Không gian người bán'}</small></span></NavLink>
      <div className="bo-workspace"><Store size={17} /><div><strong>{isAdmin ? 'Nền tảng Nguyệt Viên Đài' : STORE_NAME}</strong><small>{isAdmin ? 'Hồ sơ & phí gian hàng' : 'Mã gian hàng NVD-001'}</small></div></div>
      <nav aria-label={isAdmin ? 'Điều hướng admin' : 'Điều hướng seller'}>{nav.map(item => <NavLink key={item.to} to={item.to} end={item.to === '/seller' || item.to === '/admin'} className={({ isActive }) => isActive ? 'is-active' : ''} onClick={() => setMenu(false)}><item.icon size={17} strokeWidth={1.6} />{item.label}</NavLink>)}</nav>
      <div className="bo-sidebar-bottom">
        <NavLink to="/"><ArrowLeft size={16} />Về trang mua hàng</NavLink>
        <div className="bo-account"><span>{user?.fullName}</span><button className="bo-icon-btn" aria-label="Đăng xuất" onClick={async () => { await logout(); navigate('/login') }}><LogOut size={16} /></button></div>
      </div>
    </aside>
    <div className="bo-workarea"><header className="bo-topbar"><div><button className="bo-icon-btn bo-menu-button" aria-expanded={menu} aria-label={menu ? 'Đóng điều hướng' : 'Mở điều hướng'} onClick={() => setMenu(!menu)}>{menu ? <X size={19} /> : <Menu size={19} />}</button><span>{isAdmin ? 'Quản trị sàn' : 'Gian hàng'}<b>/</b>{nav.find(item => item.to === pathname)?.label ?? 'Tổng quan'}</span></div></header>
      <main className="bo-sheet"><div className="bo-content"><Outlet /></div></main>
    </div>
    {notice && <div className="bo-toast" role="status"><span>{notice}</span><button className="bo-icon-btn" aria-label="Đóng thông báo" onClick={() => notify('')}><X size={15} /></button></div>}
    <ScrollRestoration />
  </div>
}
