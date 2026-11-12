import type { ReactNode } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import { UserLayout } from '../components/layouts/UserLayout'
import { ROUTES } from '../constants'
import { AuthLayout } from '../components/layouts/AuthLayout'
import { AdminLayout } from '../components/layouts/AdminLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { GuestRoute } from './GuestRoute'
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
import { ProfilePage } from '../pages/seller/ProfilePage'
import { SettingsPage } from '../pages/seller/SettingsPage'
import { BakeBatchPage } from '../pages/seller/BakeBatchPage'
import { OrdersPage } from '../pages/seller/OrdersPage'
import { SellerRfqPage } from '../pages/seller/SellerRfqPage'
import { PromotionsPage } from '../pages/seller/PromotionsPage'
import { ComplaintsPage } from '../pages/shared/ComplaintsPage'
import { MyComplaintsPage } from '../pages/user/MyComplaintsPage'
import { StorePage } from '../pages/user/StorePage'
import { SubscriptionPage } from '../pages/seller/SubscriptionPage'
import { SubscriptionsAdminPage } from '../pages/admin/SubscriptionsAdminPage'
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage'
import { QualityReviewPage } from '../pages/admin/QualityReviewPage'
import { DashboardPage } from '../pages/seller/DashboardPage'
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'

const stitch = (title: string | undefined, page: ReactNode) => <StitchPage title={title}>{page}</StitchPage>

export const router = createBrowserRouter([
  {
    element: <UserLayout />,
    children: [
      {
        // Toàn bộ các trang công khai/bán lẻ: Cấm PLATFORM_ADMIN truy cập (Admin chỉ vào khu vực quản trị)
        element: <ProtectedRoute requireAuth={false} disallowedRoles={['PLATFORM_ADMIN']} />,
        children: [
          // Trang xem sản phẩm / thông tin (Guest, Customer, Provider đều xem được)
          { path: '/', element: stitch('', <RfqFormCatcher><HomePage /></RfqFormCatcher>) },
          { path: '/products', element: stitch('Bộ sưu tập', <CatalogPage />) },
          { path: '/products/:id', element: stitch(undefined, <ProductDetailPage />) },
          { path: '/box-builder', element: <BoxBuilderPage /> },
          { path: '/rfq', element: stitch('Báo giá doanh nghiệp', <RfqPortalPage />) },
          // Đặt sỉ đi qua RFQ (báo giá -> chấp nhận); link cũ chuyển về đó
          { path: '/b2b/checkout', element: <Navigate to={ROUTES.rfq} replace /> },
          { path: '/policy', element: <PolicyPage /> },
          { path: '/stores/:id', element: <StorePage /> },

          // Giỏ hàng: Khách vãng lai và Customer được xem; Cấm PROVIDER và PLATFORM_ADMIN
          {
            element: <ProtectedRoute requireAuth={false} disallowedRoles={['PROVIDER', 'PLATFORM_ADMIN']} />,
            children: [
              { path: '/cart', element: <CartPage /> },
            ],
          },

          // Luồng mua hàng & quản lý đơn cá nhân: Yêu cầu đăng nhập và chỉ dành cho CUSTOMER
          {
            element: <ProtectedRoute allowedRoles={['CUSTOMER']} />,
            children: [
              { path: '/checkout', element: <CheckoutPage /> },
              { path: '/payment', element: <PaymentPage /> },
              { path: '/orders', element: <MyOrdersPage /> },
              { path: '/complaints', element: <MyComplaintsPage /> },
              { path: '/orders/:id', element: <OrderDetailPage /> },
            ],
          },
        ],
      },
      // Trang đổi mật khẩu: Mọi vai trò đã đăng nhập đều có thể truy cập
      {
        element: <ProtectedRoute />,
        children: [
          { path: ROUTES.changePassword, element: <ChangePasswordPage /> },
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
          { path: '/seller/complaints', element: <ComplaintsPage scope="provider" /> },
          { path: '/seller/subscription', element: <SubscriptionPage /> },
        ],
      },
      {
        // Khu vực Admin sàn duy nhất
        element: <ProtectedRoute allowedRoles={['PLATFORM_ADMIN']} />,
        children: [
          { path: '/admin', element: <AdminDashboardPage /> },
          { path: '/admin/dashboard', element: <AdminDashboardPage /> },
          { path: '/admin/orders', element: <AdminOrdersPage /> },
          { path: '/admin/kyc', element: <QualityReviewPage /> },
          { path: '/admin/subscriptions', element: <SubscriptionsAdminPage /> },
          { path: '/admin/complaints', element: <ComplaintsPage scope="admin" /> },
        ],
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        // Đã đăng nhập thì không xem lại form: chuyển về trang theo vai trò (GuestRoute)
        element: <GuestRoute />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
          // Quên mật khẩu: email -> OTP -> mật khẩu mới (README 3.2)
          { path: ROUTES.forgotPassword, element: <ForgotPasswordPage /> },
          { path: ROUTES.verifyCode, element: <VerifyCodePage /> },
          { path: ROUTES.resetPassword, element: <ResetPasswordPage /> },
        ],
      },
    ],
  },
])
