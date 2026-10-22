import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import type { Role } from './types'

export function homeFor(role: Role) {
  return role === 'PROVIDER' ? '/seller/products' : '/catalog'
}

export function RequireRole({ role }: { role: Role }) {
  const user = useAuthStore((state) => state.user)
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={homeFor(user.role)} replace />
  return <Outlet />
}
