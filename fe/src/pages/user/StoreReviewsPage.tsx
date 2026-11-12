import { Link, useParams } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { formatDateTime } from '../../lib/format'
import { storeReviewService } from '../../services/storeReviewService'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState, ErrorState, Spinner } from '../../components/ui/States'

export function StoreReviewsPage() {
  const { providerId = '' } = useParams()
  useDocumentTitle('Đánh giá gian hàng')
  const { data, loading, error, reload } = useApi(() => storeReviewService.byStore(providerId), [providerId])
  const average = data?.length ? data.reduce((sum, review) => sum + review.rating, 0) / data.length : 0
  return <div className="page section flex flex-col gap-6">
    <PageHeader title="Đánh giá gian hàng" description="Đánh giá từ khách đã hoàn tất đơn hàng tại xưởng." />
    {loading ? <Spinner /> : error ? <ErrorState message={error} onRetry={reload} />
      : !data?.length ? <EmptyState title="Gian hàng chưa có đánh giá" />
        : <><p className="text-h3 text-navy">★ {average.toFixed(1)} / 5 · {data.length} đánh giá</p>
          <div className="flex flex-col gap-4">{data.map((review) => <article key={review.id} className="card p-5">
            <p className="font-semibold text-navy">{review.customerName} · {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
            <p className="text-small text-muted">{formatDateTime(review.createdAt)} · Đơn đã hoàn tất</p>
            {review.comment && <p className="mt-2 whitespace-pre-line">{review.comment}</p>}
          </article>)}</div></>}
    <Link to="/products" className="btn btn-outline self-start">Xem bộ sưu tập</Link>
  </div>
}
