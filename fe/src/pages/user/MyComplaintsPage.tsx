import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { complaintService, COMPLAINT_STATUS, COMPLAINT_TYPE_LABEL } from '../../services/complaintService'
import { formatDateTime } from '../../lib/format'
import { PageHeader } from '../../components/ui/PageHeader'
import { ErrorState, Spinner } from '../../components/ui/States'

export function MyComplaintsPage() {
  const { data, loading, error, reload } = useApi(complaintService.mine, [])
  return <div className="page section">
    <PageHeader title="Khiếu nại / đổi trả của tôi" description="Theo dõi phản hồi của xưởng và kết quả xử lý từng đơn hàng." />
    {loading ? <Spinner /> : error ? <ErrorState message={error} onRetry={reload} />
      : !data?.length ? <p className="card p-5">Bạn chưa gửi khiếu nại nào.</p>
        : <div className="space-y-4">{data.map((c) => <article key={c.id} className="card p-5">
          <div className="flex flex-wrap justify-between gap-2"><h2 className="text-h3">{c.subject}</h2>
            <span className={COMPLAINT_STATUS[c.status].tone}>{COMPLAINT_STATUS[c.status].text}</span></div>
          <p className="text-small text-muted">{COMPLAINT_TYPE_LABEL[c.type]} · {c.storeName} · gửi {formatDateTime(c.createdAt)}</p>
          {c.description && <p className="mt-2 whitespace-pre-line">{c.description}</p>}
          {c.imageUrls?.length > 0 && <div className="mt-2 flex gap-2">{c.imageUrls.map((url) =>
            <a href={url} target="_blank" rel="noreferrer" key={url}><img src={url} alt="Ảnh minh chứng" className="h-20 w-20 rounded object-cover" /></a>)}</div>}
          {c.resolution && <p className="mt-2">Phản hồi: {c.resolution}</p>}
          <Link to={`/orders/${c.orderId}`} className="mt-3 inline-block text-navy underline">Xem đơn {c.orderCode}</Link>
        </article>)}</div>}
  </div>
}
