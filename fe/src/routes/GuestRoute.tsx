import { Navigate, Outlet, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { homeAfterLogin } from '../constants'
import { Spinner } from '../components/ui/States'

/** Trang chỉ dành cho khách chưa đăng nhập (đăng nhập, đăng ký, quên mật khẩu): đã đăng nhập thì chuyển đi */
export function GuestRoute() {
  const { user, ready } = useAuthStore()
  const [params] = useSearchParams()
  if (!ready) return <Spinner />
  if (user) return <Navigate to={homeAfterLogin(user, params.get('next'))} replace />
  return <Outlet />
}
