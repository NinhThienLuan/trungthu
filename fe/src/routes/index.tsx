import type { ReactNode } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import { UserLayout } from '../components/layouts/UserLayout'
import { ROUTES } from '../constants'
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
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage'
import { VerifyCodePage } from '../pages/auth/VerifyCodePage'
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage'
import { ChangePasswordPage } from '../pages/user/ChangePasswordPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { StitchPage } from '../components/layouts/StitchPage'
import { HomePage } from '../pages/user/HomePage'
import { CatalogPage } from '../pages/user/CatalogPage'
import { ProductDetailPage } from '../pages/user/ProductDetailPage'
import { BoxBuilderPage } from '../pages/user/BoxBuilderPage'
import { RfqPortalPage } from '../pages/user/RfqPortalPage'
import { RfqFormCatcher } from '../components/RfqFormCatcher'
import { ProfilePage } from '../pages/admin/ProfilePage'
import { SettingsPage } from '../pages/admin/SettingsPage'
import { BakeBatchPage } from '../pages/admin/BakeBatchPage'
import { OrdersPage } from '../pages/admin/OrdersPage'
import { SellerRfqPage } from '../pages/admin/SellerRfqPage'
import { PromotionsPage } from '../pages/admin/PromotionsPage'
import { SubscriptionPage } from '../pages/admin/SubscriptionPage'
import { SubscriptionsAdminPage } from '../pages/admin/SubscriptionsAdminPage'
import { QualityReviewPage } from '../pages/admin/QualityReviewPage'
import { DashboardPage } from '../pages/admin/DashboardPage'

const stitch = (title: string | undefined, page: ReactNode) => <StitchPage title={title}>{page}</StitchPage>

export const router = createBrowserRouter([
  {
    element: <UserLayout />,
    children: [
      // Trang buyer chuyển nguyên từ Stitch
      { path: '/', element: stitch('', <RfqFormCatcher><HomePage /></RfqFormCatcher>) },
      { path: '/products', element: stitch('Bộ sưu tập', <CatalogPage />) },
      { path: '/products/:id', element: stitch(undefined, <ProductDetailPage />) },
      { path: '/box-builder', element: stitch('Tự phối hộp quà', <BoxBuilderPage />) },
      { path: '/rfq', element: stitch('Báo giá doanh nghiệp', <RfqPortalPage />) },
      // Đặt sỉ đi qua RFQ (báo giá -> chấp nhận); link cũ chuyển về đó
      { path: '/b2b/checkout', element: <Navigate to={ROUTES.rfq} replace /> },
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
    // Khu vực nghệ nhân / quản trị (FE2) — Có Route Guard phân quyền
    element: <AdminLayout />,
    children: [
      {
        // Khu vực Seller: API /api/provider/** chỉ nhận PROVIDER
        element: <ProtectedRoute allowedRoles={['PROVIDER']} />,
        children: [
          { path: '/seller', element: <DashboardPage /> },
          { path: '/seller/products', element: <BakeBatchPage /> },
          { path: '/seller/orders', element: <OrdersPage /> },
          { path: '/seller/profile', element: <ProfilePage /> },
          { path: '/seller/settings', element: <SettingsPage /> },
          { path: '/seller/b2b', element: <SellerRfqPage /> },
          { path: '/seller/promotions', element: <PromotionsPage /> },
          { path: '/seller/subscription', element: <SubscriptionPage /> },
        ],
      },
      {
        // Khu vực Admin sàn duy nhất
        element: <ProtectedRoute allowedRoles={['PLATFORM_ADMIN']} />,
        children: [
          { path: '/admin/kyc', element: <QualityReviewPage /> },
          { path: '/admin/subscriptions', element: <SubscriptionsAdminPage /> },
        ],
      },
    ],
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
