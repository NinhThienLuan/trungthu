import { Link, useParams } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { storeReviewService } from '../../services/storeReviewService'
import { ProductReviews } from '../../components/ProductReviews'
import { PageHeader } from '../../components/ui/PageHeader'
import { ErrorState, Spinner } from '../../components/ui/States'
import { ROUTES } from '../../constants'

export function StorePage() {
  const { id = '' } = useParams()
  const { data, loading, error, reload } = useApi(() => storeReviewService.store(id), [id])
  return <div className="page section">
    {loading ? <Spinner /> : error ? <ErrorState message={error} onRetry={reload} /> : data && <>
      <PageHeader title={data.name} description="Đánh giá của khách hàng đã mua từ gian hàng." />
      <ProductReviews providerId={id} storeName={data.name} />
      <Link to={ROUTES.products} className="mt-6 inline-block text-navy underline">Xem bộ sưu tập</Link>
    </>}
  </div>
}
