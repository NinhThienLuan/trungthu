import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { HOME_BY_ROLE, ROUTES } from '../constants'
import { Spinner } from '../components/ui/States'
import type { UserRole } from '../types/user'

const ROLE_NAME: Record<UserRole, string> = {
  CUSTOMER: 'Khách mua hàng (Customer)',
  PROVIDER: 'Chủ gian hàng (Seller / Provider)',
  PLATFORM_ADMIN: 'Quản trị viên sàn (Platform Admin)',
}

export function AccessDenied({
  allowedRoles,
  disallowedRoles,
}: {
  allowedRoles?: UserRole[]
  disallowedRoles?: UserRole[]
}) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(3)
  const targetHome = user ? HOME_BY_ROLE[user.role] : ROUTES.home

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate(targetHome, { replace: true })
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [navigate, targetHome])

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-line rounded-lg p-6 shadow-card text-center flex flex-col items-center">
        <div className="w-14 h-14 rounded-full bg-danger-soft text-danger flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-h3 text-navy font-semibold">Quyền truy cập bị giới hạn (403)</h1>

        {allowedRoles && allowedRoles.length > 0 && (
          <p className="mt-2 text-body text-muted">
            Khu vực này yêu cầu vai trò:{' '}
            <strong className="text-navy">
              {allowedRoles.map((r) => ROLE_NAME[r] ?? r).join(' hoặc ')}
            </strong>
          </p>
        )}

        {disallowedRoles && disallowedRoles.length > 0 && user && (
          <p className="mt-2 text-body text-muted">
            Vai trò <strong className="text-navy">{ROLE_NAME[user.role] ?? user.role}</strong> không có quyền truy cập khu vực này.
          </p>
        )}

        {user && (
          <p className="mt-1 text-small text-muted">
            Tài khoản hiện tại của bạn: <strong>{user.fullName}</strong> ({ROLE_NAME[user.role] ?? user.role})
          </p>
        )}

        <div className="mt-4 px-3 py-2 rounded bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span>Tự động chuyển về trang phù hợp sau <strong>{countdown}s</strong>...</span>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full justify-center">
          <button
            type="button"
            onClick={() => navigate(targetHome, { replace: true })}
            className="btn btn-secondary"
          >
            Về trang chính ngay
          </button>
          <button
            type="button"
            onClick={async () => {
              await logout()
              navigate(ROUTES.login, { replace: true })
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

interface ProtectedRouteProps {
  /** Yêu cầu đăng nhập? Mặc định = true */
  requireAuth?: boolean
  /** Danh sách vai trò được phép truy cập. Bỏ trống = mọi user đã đăng nhập. */
  allowedRoles?: UserRole[]
  /** Danh sách vai trò bị cấm truy cập. */
  disallowedRoles?: UserRole[]
}

/** Chặn trang cần đăng nhập hoặc kiểm tra vai trò (Role Guard) */
export function ProtectedRoute({
  requireAuth = true,
  allowedRoles,
  disallowedRoles,
}: ProtectedRouteProps) {
  const { user, ready } = useAuthStore()
  const location = useLocation()

  if (!ready) return <Spinner />

  if (requireAuth && !user) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`${ROUTES.login}?next=${next}`} replace />
  }

  // Mật khẩu tạm (vừa đăng ký): chỉ cho vào trang đổi mật khẩu
  if (user?.requirePasswordChange && location.pathname !== ROUTES.changePassword) {
    return <Navigate to={ROUTES.changePassword} replace />
  }

  if (user) {
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return <AccessDenied allowedRoles={allowedRoles} />
    }
    if (disallowedRoles && disallowedRoles.length > 0 && disallowedRoles.includes(user.role)) {
      return <AccessDenied disallowedRoles={disallowedRoles} />
    }
  }

  return <Outlet />
}
