import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { ROUTES } from '../constants'
import { Spinner } from '../components/ui/States'

/** Chặn trang cần đăng nhập; sau khi login sẽ quay về trang cũ qua ?next= */
export function ProtectedRoute() {
  const { user, ready } = useAuthStore()
  const location = useLocation()

  if (!ready) return <Spinner />
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`${ROUTES.login}?next=${next}`} replace />
  }
  return <Outlet />
}
