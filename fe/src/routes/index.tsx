import type { ReactNode } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import { SellerLayout } from '../layouts/SellerLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { CartPage } from '../pages/CartPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { PaymentPage } from '../pages/PaymentPage'
import { MyOrdersPage } from '../pages/MyOrdersPage'
import { PolicyPage } from '../pages/PolicyPage'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { StitchPage } from '../pages/stitch/StitchPage'
import { StitchHome } from '../pages/stitch/StitchHome'
import { StitchHomeClassic } from '../pages/stitch/StitchHomeClassic'
import { CatalogPage } from '../pages/CatalogPage'
import { ProductDetailPage } from '../pages/ProductDetailPage'
import { BoxBuilderPage } from '../pages/BoxBuilderPage'
import { B2bPortalPage } from '../pages/B2bPortalPage'
import { StitchB2bCheckout } from '../pages/stitch/StitchB2bCheckout'
import { StitchSellerRegister } from '../pages/stitch/StitchSellerRegister'
import { StitchSellerProducts } from '../pages/stitch/StitchSellerProducts'
import { StitchSellerOrders } from '../pages/stitch/StitchSellerOrders'
import { StitchSellerDispatch } from '../pages/stitch/StitchSellerDispatch'
import { StitchAdminKyc } from '../pages/stitch/StitchAdminKyc'
import { StitchAdminFinance } from '../pages/stitch/StitchAdminFinance'

const stitch = (title: string | undefined, page: ReactNode) => <StitchPage title={title}>{page}</StitchPage>

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      // Trang buyer chuyển nguyên từ Stitch
      { path: '/', element: stitch('', <StitchHome />) },
      { path: '/trang-chu-co-dien', element: stitch('Trang chủ', <StitchHomeClassic />) },
      { path: '/products', element: stitch('Bộ sưu tập', <CatalogPage />) },
      { path: '/products/:id', element: stitch(undefined, <ProductDetailPage />) },
      { path: '/box-builder', element: stitch('Tự phối hộp quà', <BoxBuilderPage />) },
      { path: '/rfq', element: stitch('Báo giá doanh nghiệp', <B2bPortalPage />) },
      { path: '/b2b/checkout', element: stitch('Đặt hàng doanh nghiệp', <StitchB2bCheckout />) },
      // Luồng đặt hàng chạy được (không có màn Stitch tương ứng)
      { path: '/cart', element: <CartPage /> },
      { path: '/policy', element: <PolicyPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/checkout', element: <CheckoutPage /> },
          { path: '/payment', element: <PaymentPage /> },
          { path: '/orders', element: <MyOrdersPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    // Khu vực nghệ nhân / quản trị (FE2) — giao diện Stitch tĩnh
    element: <SellerLayout />,
    children: [
      { path: '/seller', element: stitch('Bảng điều khiển', <StitchAdminFinance />) },
      { path: '/seller/products', element: stitch('Menu & mẻ ra lò', <StitchSellerProducts />) },
      { path: '/seller/b2b', element: stitch('Điều phối B2B', <StitchSellerDispatch />) },
      { path: '/seller/orders', element: stitch('Đơn hàng & giao lạnh', <StitchSellerOrders />) },
      { path: '/seller/profile', element: stitch('Hồ sơ & thẩm định', <StitchSellerRegister />) },
      { path: '/admin/kyc', element: stitch('Thẩm định chất lượng', <StitchAdminKyc />) },
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
