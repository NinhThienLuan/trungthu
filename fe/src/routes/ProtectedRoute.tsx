import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { ROUTES } from '../constants'
import { Spinner } from '../components/ui/States'
import type { UserRole } from '../types/user'

const ROLE_NAME: Record<UserRole, string> = {
  CUSTOMER: 'Khách mua hàng (Customer)',
  PROVIDER: 'Chủ gian hàng (Seller / Provider)',
  PLATFORM_ADMIN: 'Quản trị viên sàn (Platform Admin)',
}

interface ProtectedRouteProps {
  /** Danh sách vai trò được phép truy cập. Bỏ trống = mọi user đã đăng nhập. */
  allowedRoles?: UserRole[]
}

/** Chặn trang cần đăng nhập; hỗ trợ kiểm tra vai trò (Role Guard) */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, ready, logout } = useAuthStore()
  const location = useLocation()

  if (!ready) return <Spinner />

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`${ROUTES.login}?next=${next}`} replace />
  }

  // Mật khẩu tạm (vừa đăng ký): chỉ cho vào trang đổi mật khẩu
  if (user.requirePasswordChange && location.pathname !== ROUTES.changePassword) {
    return <Navigate to={ROUTES.changePassword} replace />
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-line rounded-lg p-6 shadow-card text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-danger-soft text-danger flex items-center justify-center text-2xl font-bold mb-4">
            !
          </div>
          <h1 className="text-h3 text-navy font-semibold">Quyền truy cập bị giới hạn (403)</h1>
          <p className="mt-2 text-body text-muted">
            Khu vực này yêu cầu vai trò:{' '}
            <strong className="text-navy">
              {allowedRoles.map((r) => ROLE_NAME[r] ?? r).join(' hoặc ')}
            </strong>
          </p>
          <p className="mt-1 text-small text-muted">
            Tài khoản hiện tại của bạn: <strong>{user.fullName}</strong> ({ROLE_NAME[user.role] ?? user.role})
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full justify-center">
            <Link to={ROUTES.home} className="btn btn-secondary">
              Về trang chủ
            </Link>
            <button
              type="button"
              onClick={async () => {
                await logout()
              }}
              className="btn btn-primary"
            >
              Đăng nhập lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <Outlet />
}
