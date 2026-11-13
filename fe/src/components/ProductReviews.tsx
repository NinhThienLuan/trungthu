import { useState, type FormEvent } from 'react'
import { Star, CheckCircle2 } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { orderService } from '../services/orderService'
import { storeReviewService } from '../services/storeReviewService'
import { productReviewService } from '../services/productReviewService'
import { useAuthStore } from '../stores/authStore'
import { errorMessage } from '../apis/http'
import type { OrderSummary } from '../types/order'

export function ProductReviews({
  productId,
  productName,
  providerId,
  storeName,
  completedOrder,
}: {
  productId?: string
  productName?: string
  providerId: string
  storeName: string
  completedOrder?: OrderSummary
}) {
  const customer = useAuthStore((s) => s.user?.role === 'CUSTOMER')

  // Product reviews
  const { data: productReviewsData } = useApi(
    () => (productId ? productReviewService.list(productId) : Promise.resolve(null)),
    [productId],
  )

  // Store reviews
  const { data: storeReviews, reload: reloadStoreReviews } = useApi(
    () => storeReviewService.list(providerId),
    [providerId],
  )

  const { data: orders } = useApi(
    () =>
      completedOrder
        ? Promise.resolve([completedOrder])
        : customer
        ? orderService.myOrders({ status: 'COMPLETED', size: 100 }).then((page) => page.content)
        : Promise.resolve([]),
    [customer, completedOrder],
  )

  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  // Eligible store review
  const eligibleStore = (orders ?? []).filter(
    (o) => o.providerId === providerId && !storeReviews?.some((review) => review.orderId === o.id),
  )

  const storeAverage = storeReviews?.length
    ? (storeReviews.reduce((sum, review) => sum + review.rating, 0) / storeReviews.length).toFixed(1)
    : null

  const productAverage = productReviewsData?.averageRating ? productReviewsData.averageRating.toFixed(1) : null

  const submitStoreReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setBusy(true)
    setMessage('')
    try {
      await storeReviewService.create(
        providerId,
        String(form.get('orderId')),
        Number(form.get('rating')),
        String(form.get('comment') ?? ''),
      )
      setMessage('Đã gửi đánh giá gian hàng.')
      reloadStoreReviews()
      event.currentTarget.reset()
    } catch (error) {
      setMessage(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  const renderStars = (rating: number) => (
    <span className="inline-flex items-center gap-0.5 text-amber-500">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`size-3.5 ${i <= rating ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}`}
          aria-hidden
        />
      ))}
    </span>
  )

  return (
    <section className="space-y-6">
      {/* Product-specific reviews section */}
      {productId && (
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-line">
            <h3 className="text-h3 font-semibold text-navy">
              Đánh giá bánh {productName ? `"${productName}"` : ''}
            </h3>
            {productAverage && (
              <span className="inline-flex items-center gap-1.5 text-small font-medium text-slate-700">
                <Star className="size-4 fill-amber-400 text-amber-500" aria-hidden />
                {productAverage} / 5 ({productReviewsData?.totalReviews ?? 0} đánh giá)
              </span>
            )}
          </div>
          {!productReviewsData?.reviews?.length ? (
            <p className="text-small text-muted py-2">Sản phẩm này chưa có đánh giá từ người mua.</p>
          ) : (
            <div className="grid gap-3">
              {productReviewsData.reviews.map((r) => (
                <article key={r.id} className="card p-4 text-small">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{r.customerName}</span>
                    {renderStars(r.rating)}
                  </div>
                  {r.comment && <p className="mt-1.5 text-slate-600 whitespace-pre-line">{r.comment}</p>}
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Store reviews section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between pb-2 border-b border-line">
          <h3 className="text-h3 font-semibold text-navy">Đánh giá gian hàng {storeName}</h3>
          {storeAverage && (
            <span className="inline-flex items-center gap-1.5 text-small font-medium text-slate-700">
              <Star className="size-4 fill-amber-400 text-amber-500" aria-hidden />
              {storeAverage} / 5 ({storeReviews?.length ?? 0} đánh giá)
            </span>
          )}
        </div>
        {!storeReviews?.length ? (
          <p className="text-small text-muted py-2">Gian hàng chưa có đánh giá.</p>
        ) : (
          <div className="grid gap-3">
            {storeReviews.map((review) => (
              <article key={review.orderId} className="card p-4 text-small">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{review.customerName}</span>
                  {renderStars(review.rating)}
                </div>
                {review.comment && <p className="mt-1.5 text-slate-600 whitespace-pre-line">{review.comment}</p>}
              </article>
            ))}
          </div>
        )}

        {eligibleStore.length > 0 && (
          <form onSubmit={submitStoreReview} className="card space-y-3 p-4 bg-slate-50/70 border border-slate-200">
            <h4 className="font-semibold text-slate-800">Đánh giá gian hàng sau khi nhận đơn</h4>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Đơn hoàn tất</label>
                <select name="orderId" className="input text-small" required aria-label="Đơn đã hoàn tất">
                  {eligibleStore.map((order) => (
                    <option key={order.id} value={order.id}>
                      Đơn {order.code}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Đánh giá dịch vụ</label>
                <select name="rating" className="input text-small" defaultValue="5" aria-label="Số sao">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} sao
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <textarea
              name="comment"
              className="input text-small"
              maxLength={1000}
              rows={2}
              placeholder="Chia sẻ trải nghiệm về thái độ phục vụ, đóng gói của xưởng..."
            />
            <div className="flex items-center justify-between">
              <button className="btn btn-primary btn-sm" disabled={busy}>
                Gửi đánh giá gian hàng
              </button>
              {message && (
                <span className="text-xs text-success flex items-center gap-1">
                  <CheckCircle2 className="size-3.5" aria-hidden /> {message}
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
