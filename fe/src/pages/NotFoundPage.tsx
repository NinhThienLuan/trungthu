import { Link } from 'react-router-dom'
import { ROUTES } from '../constants'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function NotFoundPage() {
  useDocumentTitle('Không tìm thấy trang')
  return (
    <div className="page section flex flex-col items-center gap-4 text-center">
      <p className="eyebrow">Lỗi 404</p>
      <h1 className="text-h1">Không tìm thấy trang</h1>
      <Link to={ROUTES.home} className="btn btn-primary">
        Về trang chủ
      </Link>
    </div>
  )
}
