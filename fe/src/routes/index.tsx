import type { ReactNode } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { UserLayout } from '../components/layouts/UserLayout'
import { AuthLayout } from '../components/layouts/AuthLayout'
import { AdminLayout } from '../components/layouts/AdminLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { CartPage } from '../pages/user/CartPage'
import { CheckoutPage } from '../pages/user/CheckoutPage'
import { PaymentPage } from '../pages/user/PaymentPage'
import { MyOrdersPage } from '../pages/user/MyOrdersPage'
import { OrderDetailPage } from '../pages/user/OrderDetailPage'
import { PolicyPage } from '../pages/user/PolicyPage'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { StitchPage } from '../components/layouts/StitchPage'
import { HomePage } from '../pages/user/HomePage'
import { HomeClassicPage } from '../pages/user/HomeClassicPage'
import { CatalogPage } from '../pages/user/CatalogPage'
import { ProductDetailPage } from '../pages/user/ProductDetailPage'
import { BoxBuilderPage } from '../pages/user/BoxBuilderPage'
import { B2bPortalView } from '../pages/user/B2bPortalView'
import { RfqFormCatcher } from '../components/RfqFormCatcher'
import { B2bCheckoutPage } from '../pages/user/B2bCheckoutPage'
import { ProfilePage } from '../pages/admin/ProfilePage'
import { BakeBatchPage } from '../pages/admin/BakeBatchPage'
import { OrdersPage } from '../pages/admin/OrdersPage'
import { B2bDispatchPage } from '../pages/admin/B2bDispatchPage'
import { QualityReviewPage } from '../pages/admin/QualityReviewPage'
import { DashboardPage } from '../pages/admin/DashboardPage'

const stitch = (title: string | undefined, page: ReactNode) => <StitchPage title={title}>{page}</StitchPage>

export const router = createBrowserRouter([
  {
    element: <UserLayout />,
    children: [
      // Trang buyer chuyển nguyên từ Stitch
      { path: '/', element: stitch('', <RfqFormCatcher><HomePage /></RfqFormCatcher>) },
      { path: '/trang-chu-co-dien', element: stitch('Trang chủ', <HomeClassicPage />) },
      { path: '/products', element: stitch('Bộ sưu tập', <CatalogPage />) },
      { path: '/products/:id', element: stitch(undefined, <ProductDetailPage />) },
      { path: '/box-builder', element: stitch('Tự phối hộp quà', <BoxBuilderPage />) },
      { path: '/rfq', element: stitch('Báo giá doanh nghiệp', <RfqFormCatcher><B2bPortalView /></RfqFormCatcher>) },
      { path: '/b2b/checkout', element: stitch('Đặt hàng doanh nghiệp', <B2bCheckoutPage />) },
      // Luồng đặt hàng chạy được
      { path: '/cart', element: <CartPage /> },
      { path: '/policy', element: <PolicyPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/checkout', element: <CheckoutPage /> },
          { path: '/payment', element: <PaymentPage /> },
          { path: '/orders', element: <MyOrdersPage /> },
          { path: '/orders/:id', element: <OrderDetailPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    // Khu vực nghệ nhân / quản trị (FE2) — Có Route Guard phân quyền
    element: <AdminLayout />,
    children: [
      {
        // Khu vực Seller (Provider & Admin)
        element: <ProtectedRoute allowedRoles={['PROVIDER', 'PLATFORM_ADMIN']} />,
        children: [
          { path: '/seller', element: stitch('Bảng điều khiển', <DashboardPage />) },
          { path: '/seller/products', element: stitch('Menu & mẻ ra lò', <BakeBatchPage />) },
          { path: '/seller/b2b', element: stitch('Điều phối B2B', <B2bDispatchPage />) },
          { path: '/seller/orders', element: stitch('Đơn hàng & giao lạnh', <OrdersPage />) },
          { path: '/seller/profile', element: stitch('Hồ sơ & thẩm định', <ProfilePage />) },
        ],
      },
      {
        // Khu vực Admin sàn duy nhất
        element: <ProtectedRoute allowedRoles={['PLATFORM_ADMIN']} />,
        children: [
          { path: '/admin/kyc', element: stitch('Thẩm định chất lượng', <QualityReviewPage />) },
        ],
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
])
