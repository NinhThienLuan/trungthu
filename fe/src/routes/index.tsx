import type { ReactNode } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { UserLayout } from '../components/layouts/UserLayout'
import { ROUTES } from '../constants'
import { AuthLayout } from '../components/layouts/AuthLayout'
import { AdminLayout } from '../components/layouts/AdminLayout'
import { SellerLayout } from '../components/layouts/SellerLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { CartPage } from '../pages/user/CartPage'
import { CheckoutPage } from '../pages/user/CheckoutPage'
import { PaymentPage } from '../pages/user/PaymentPage'
import { MyOrdersPage } from '../pages/user/MyOrdersPage'
import { OrderDetailPage } from '../pages/user/OrderDetailPage'
import { PolicyPage } from '../pages/user/PolicyPage'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage'
import { VerifyCodePage } from '../pages/auth/VerifyCodePage'
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage'
import { ChangePasswordPage } from '../pages/user/ChangePasswordPage'
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
import { SellerDashboardPage } from '../pages/seller/DashboardPage'
import { SellerProductsPage } from '../pages/seller/ProductsPage'
import { SellerOrdersPage } from '../pages/seller/OrdersPage'
import { SellerCapacityPage } from '../pages/seller/CapacityPage'
import { SellerRfqPage } from '../pages/seller/RfqPage'
import { SellerProfilePage } from '../pages/seller/ProfilePage'
import { SellerSubscriptionPage } from '../pages/seller/SubscriptionPage'
import { SellerSettingsPage } from '../pages/seller/SettingsPage'
import { AdminOverviewPage } from '../pages/admin/OverviewPage'
import { AdminCompliancePage } from '../pages/admin/CompliancePage'
import { AdminSubscriptionsPage } from '../pages/admin/SubscriptionsPage'

const stitch = (title: string | undefined, page: ReactNode) => <StitchPage title={title}>{page}</StitchPage>

const sellerPages = () => [
  { path: `/seller`, element: <SellerDashboardPage /> },
  { path: `/seller/products`, element: <SellerProductsPage /> },
  { path: `/seller/orders`, element: <SellerOrdersPage /> },
  { path: `/seller/capacity`, element: <SellerCapacityPage /> },
  { path: `/seller/b2b`, element: <SellerRfqPage /> },
  { path: `/seller/profile`, element: <SellerProfilePage /> },
  { path: `/seller/subscription`, element: <SellerSubscriptionPage /> },
  { path: `/seller/settings`, element: <SellerSettingsPage /> },
]
const adminPages = () => [
  { path: `/admin`, element: <AdminOverviewPage /> },
  { path: `/admin/kyc`, element: <AdminCompliancePage /> },
  { path: `/admin/subscriptions`, element: <AdminSubscriptionsPage /> },
]

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
          { path: ROUTES.changePassword, element: <ChangePasswordPage /> },
          { path: '/orders/:id', element: <OrderDetailPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['PROVIDER']} />,
    children: [{ element: <SellerLayout />, children: sellerPages() }],
  },
  {
    element: <ProtectedRoute allowedRoles={['PLATFORM_ADMIN']} />,
    children: [{ element: <AdminLayout />, children: adminPages() }],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      // Quên mật khẩu: email -> OTP -> mật khẩu mới (README 3.2)
      { path: ROUTES.forgotPassword, element: <ForgotPasswordPage /> },
      { path: ROUTES.verifyCode, element: <VerifyCodePage /> },
      { path: ROUTES.resetPassword, element: <ResetPasswordPage /> },
    ],
  },
])
