import { useState, type FormEvent } from 'react'
import { useApi } from '../hooks/useApi'
import { orderService } from '../services/orderService'
import { storeReviewService } from '../services/storeReviewService'
import { useAuthStore } from '../stores/authStore'
import { errorMessage } from '../apis/http'
import type { OrderSummary } from '../types/order'

export function ProductReviews({ providerId, storeName, completedOrder }: {
  providerId: string; storeName: string; completedOrder?: OrderSummary
}) {
  const customer = useAuthStore((s) => s.user?.role === 'CUSTOMER')
  const { data: reviews, reload } = useApi(() => storeReviewService.list(providerId), [providerId])
  const { data: orders } = useApi(() => completedOrder ? Promise.resolve([completedOrder]) : customer
    ? orderService.myOrders({ status: 'COMPLETED', size: 100 }).then((page) => page.content)
    : Promise.resolve([]), [customer, completedOrder])
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const eligible = (orders ?? []).filter((o) => o.providerId === providerId
    && !reviews?.some((review) => review.orderId === o.id))
  const average = reviews?.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : null

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setBusy(true)
    setMessage('')
    try {
      await storeReviewService.create(providerId, String(form.get('orderId')), Number(form.get('rating')),
        String(form.get('comment') ?? ''))
      setMessage('Đã gửi đánh giá gian hàng.')
      reload()
      event.currentTarget.reset()
    } catch (error) { setMessage(errorMessage(error)) }
    finally { setBusy(false) }
  }

  return <section className="space-y-4">
    <h3 className="text-h3">Đánh giá gian hàng {storeName}</h3>
    <p className="text-small text-muted">{average ? `★ ${average}/5 · ${reviews?.length} đánh giá` : 'Gian hàng chưa có đánh giá.'}</p>
    {reviews?.map((review) => <article key={review.orderId} className="card p-4 text-small">
      <p className="font-semibold">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)} · {review.customerName}</p>
      {review.comment && <p className="mt-1 whitespace-pre-line">{review.comment}</p>}
    </article>)}
    {eligible.length > 0 && <form onSubmit={submit} className="card space-y-3 p-4">
      <h4 className="font-semibold">Đánh giá sau khi mua</h4>
      <select name="orderId" className="input" required aria-label="Đơn đã hoàn tất">
        {eligible.map((order) => <option key={order.id} value={order.id}>Đơn {order.code}</option>)}
      </select>
      <select name="rating" className="input" defaultValue="5" aria-label="Số sao">
        {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} sao</option>)}
      </select>
      <textarea name="comment" className="input" maxLength={1000} rows={3} placeholder="Chia sẻ trải nghiệm của bạn" />
      <button className="btn btn-primary btn-sm" disabled={busy}>Gửi đánh giá</button>
    </form>}
    {message && <p className="text-small">{message}</p>}
  </section>
}
