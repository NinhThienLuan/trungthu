import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from './Icon'
import { ROUTES } from '../constants'

/**
 * Hộp thoại khi BE trả 409 lúc đặt hàng (hết tồn kho / hết suất nướng): nêu rõ món hoặc ngày bị thiếu
 * (BE ghi trong message) và dẫn khách về giỏ để giảm số lượng hoặc đổi ngày nhận. Không đơn nào được tạo.
 */
export function StockConflictDialog({ message, onClose }: { message: string; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-dark/50 p-4" onClick={onClose}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="conflict-title" aria-describedby="conflict-body"
        className="card w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3">
          <Icon name="warning" className="text-[28px] text-danger" aria-hidden />
          <div>
            <h2 id="conflict-title" className="text-h3">Chưa đặt được hàng</h2>
            <p id="conflict-body" className="mt-2 text-body text-ink">{message}</p>
            <p className="mt-2 text-small text-muted">Chưa có đơn nào được tạo và giỏ hàng vẫn giữ nguyên.</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button ref={closeRef} type="button" className="btn btn-ghost" onClick={onClose}>Đóng</button>
          <Link to={ROUTES.cart} className="btn btn-primary">Sửa giỏ hàng</Link>
        </div>
      </div>
    </div>
  )
}
