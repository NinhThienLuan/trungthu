import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { formatVnd } from '../../lib/format'
import { sellerService, subscriptionService } from '../../services/sellerService'
import { sellerSettingsService } from '../../services/sellerSettingsService'
import { useAuthStore } from '../../stores/authStore'
import { Icon } from '../../components/Icon'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState, ErrorState, Spinner } from '../../components/ui/States'

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="card p-5">
      <p className="text-small text-muted">{label}</p>
      <p className="mt-1 text-h2">{value}</p>
      {hint && <p className="mt-1 text-small text-muted">{hint}</p>}
    </div>
  )
}

/** Seller: số đơn, doanh thu, sản phẩm bán chạy và khách mua nhiều (GET /api/provider/dashboard) */
export function DashboardPage() {
  useDocumentTitle('Bảng điều khiển')
  const { data, loading, error, reload } = useApi(() => sellerService.dashboard(), [])
  const user = useAuthStore((s) => s.user)
  const subs = useApi(() => subscriptionService.mine(), [])
  const settings = useApi(() => sellerSettingsService.get(), [])

  if (loading) return <Spinner />
  if (error || !data) return <div className="page section"><ErrorState message={error ?? 'Không tải được số liệu'} onRetry={reload} /></div>

  return (
    <div className="page section flex flex-col gap-6">
      <PageHeader eyebrow="Gian hàng" title="Bảng điều khiển" description="Số liệu tính trên toàn bộ đơn của xưởng."
        action={<Link to="/seller/orders?status=PENDING_DEPOSIT" className="btn btn-primary">Đơn chờ xử lý ({data.pendingOrders})</Link>} />

      <ReadyChecklist steps={[
        { done: !!user?.isComplianceApproved, label: 'Hồ sơ được admin duyệt (ATTP, giấy phép kinh doanh, CCCD)', to: '/seller/profile' },
        { done: !!subs.data?.some((s) => s.status === 'ACTIVE'), label: 'Có gói bán hàng đang chạy', to: '/seller/subscription' },
        { done: !!settings.data?.accountNumber, label: 'Khai báo tài khoản nhận tiền VietQR và năng lực nướng', to: '/seller/settings' },
      ]} loaded={!subs.loading && !settings.loading} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Tổng đơn" value={data.totalOrders} />
        <Stat label="Đơn đã bán" value={data.soldOrders} />
        <Stat label="Đơn đã huỷ" value={data.cancelledOrders} />
        <Stat label="Doanh thu" value={formatVnd(data.revenue)} hint={data.discountTotal > 0 ? `Giảm giá ${formatVnd(data.discountTotal)}` : undefined} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="card overflow-x-auto p-5">
          <h2 className="text-h3 mb-3">Sản phẩm theo lượng bán</h2>
          {data.variants.length === 0 ? <EmptyState title="Chưa có đơn nào" /> : (
            <table className="w-full text-small">
              <thead className="text-left text-muted">
                <tr><th className="py-2">Sản phẩm</th><th className="text-right">Đã bán</th><th className="text-right">Bị huỷ</th></tr>
              </thead>
              <tbody>
                {data.variants.map((v) => (
                  <tr key={v.variantId} className="border-t border-line">
                    <td className="py-2">{v.productName}<span className="block text-muted">{v.variantName}</span></td>
                    <td className="text-right">{v.soldQuantity}</td>
                    <td className="text-right">{v.cancelledQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="card p-5">
          <h2 className="text-h3 mb-3">Khách mua nhiều</h2>
          {data.topBuyers.length === 0 ? <p className="text-small text-muted">Chưa có dữ liệu.</p> : (
            <ol className="flex flex-col gap-2 text-small">
              {data.topBuyers.map((c) => (
                <li key={c.customerId} className="flex justify-between gap-3 border-t border-line pt-2">
                  <span>{c.fullName}<span className="block text-muted">{c.email}</span></span>
                  <span className="text-right">{c.quantity} bánh<span className="block text-muted">{c.orders} đơn</span></span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  )
}

/** Điều kiện để khách đặt được hàng của gian hàng; ẩn khi đã đủ */
function ReadyChecklist({ steps, loaded }: { steps: Array<{ done: boolean; label: string; to: string }>; loaded: boolean }) {
  if (!loaded || steps.every((s) => s.done)) return null
  return (
    <section className="card p-5" aria-label="Việc cần làm để bắt đầu bán">
      <h2 className="text-h3">Hoàn tất để bắt đầu bán</h2>
      <ul className="mt-3 flex flex-col gap-2 text-small">
        {steps.map((s) => (
          <li key={s.to} className="flex items-center justify-between gap-3">
            <span className={s.done ? 'text-success' : ''}>
              <Icon name={s.done ? 'check_circle' : 'radio_button_unchecked'} className="mr-2 align-middle text-[18px]" aria-hidden />
              {s.label}
            </span>
            {!s.done && <Link to={s.to} className="btn btn-outline btn-sm shrink-0">Làm ngay</Link>}
          </li>
        ))}
      </ul>
    </section>
  )
}
