import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { formatDateTime } from '../../lib/format'
import { COMPLAINT_STATUS, COMPLAINT_TYPE_LABEL, complaintService } from '../../services/complaintService'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState, ErrorState, Spinner } from '../../components/ui/States'

export function MyComplaintsPage() {
  useDocumentTitle('Khiếu nại / đổi trả của tôi')
  const { data, loading, error, reload } = useApi(complaintService.mine, [])

  return <div className="page section flex flex-col gap-6">
    <PageHeader title="Khiếu nại / đổi trả của tôi" description="Theo dõi yêu cầu và phản hồi của xưởng. Mở chi tiết đơn hàng để gửi yêu cầu mới." />
    {loading ? <Spinner /> : error ? <ErrorState message={error} onRetry={reload} />
      : !data?.length ? <EmptyState title="Bạn chưa gửi yêu cầu nào" />
        : <div className="flex flex-col gap-4">{data.map((c) => <article key={c.id} className="card p-5 text-small">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div><h2 className="text-h3">{c.subject}</h2><p className="text-muted">{c.storeName} · {COMPLAINT_TYPE_LABEL[c.type]} · {formatDateTime(c.createdAt)}</p></div>
            <span className={COMPLAINT_STATUS[c.status].tone}>{COMPLAINT_STATUS[c.status].text}</span>
          </div>
          {c.description && <p className="mt-3 whitespace-pre-line">{c.description}</p>}
          {c.imageUrl && <a href={c.imageUrl} target="_blank" rel="noopener noreferrer"><img src={c.imageUrl} alt={`Ảnh minh chứng: ${c.subject}`} className="mt-3 max-h-48 rounded-sm object-contain" /></a>}
          {c.resolution && <p className="mt-3 font-medium">Phản hồi: {c.resolution}</p>}
          <Link to={`/orders/${c.orderId}`} className="btn btn-outline btn-sm mt-3">Xem đơn {c.orderCode}</Link>
        </article>)}</div>}
  </div>
}
