import { Link, Outlet } from 'react-router-dom'
import { BRAND, ROUTES } from '../../constants'

/** Khung cho login / register: nền ivory, form giữa màn hình */
export function AuthLayout() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <Link to={ROUTES.home} className="mb-8 font-serif text-h2 text-navy">
        {BRAND}
      </Link>
      <div className="card w-full max-w-md p-6 md:p-8">
        <Outlet />
      </div>
    </div>
  )
}
