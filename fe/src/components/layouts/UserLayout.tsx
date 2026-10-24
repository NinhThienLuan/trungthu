import { Outlet, ScrollRestoration, useNavigate } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { handleStitchLinkClick } from '../../routes/stitchPaths'
import { FlashToast } from '../ui/FlashToast'

export function UserLayout() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:p-2">
        Bỏ qua tới nội dung
      </a>
      <Header />
      {/* onClick: link trong trang Stitch (data-path) -> điều hướng SPA */}
      <main id="main" className="flex-1" onClick={(e) => handleStitchLinkClick(e, navigate)}>
        <Outlet />
      </main>
      <Footer />
      <FlashToast />
      <ScrollRestoration />
    </div>
  )
}
