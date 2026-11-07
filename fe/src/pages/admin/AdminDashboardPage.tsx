import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { formatDateTime, formatVnd } from '../../lib/format'
import { adminService } from '../../services/adminService'
import { Icon } from '../../components/Icon'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState, ErrorState, Spinner } from '../../components/ui/States'

const DOC_TYPE_LABEL: Record<string, string> = {
  FOOD_SAFETY_CERT: 'Giấy chứng nhận ATTP',
  BUSINESS_LICENSE: 'Giấy phép kinh doanh',
  IDENTITY_KYC: 'CCCD / Định danh',
}

const COMPLAINT_TYPE_LABEL: Record<string, string> = {
  DAMAGED: 'Bánh dập vỡ',
  MOLDED: 'Bánh mốc / hỏng',
  WRONG_SPECIFICATION: 'Sai quy cách',
  LATE_DELIVERY: 'Giao trễ',
  OTHER: 'Khác',
}

const STATUS_ORDER: Array<{ key: string; label: string; tone: string }> = [
  { key: 'PENDING_DEPOSIT', label: 'Chờ cọc', tone: 'text-amber-700 bg-amber-50 border-amber-200' },
  { key: 'CONFIRMED', label: 'Đã xác nhận', tone: 'text-blue-700 bg-blue-50 border-blue-200' },
  { key: 'DEPOSITED', label: 'Đã cọc', tone: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  { key: 'BAKING_QUEUED', label: 'Chờ nướng', tone: 'text-purple-700 bg-purple-50 border-purple-200' },
  { key: 'DELIVERING', label: 'Đang giao', tone: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
  { key: 'COMPLETED', label: 'Hoàn tất', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { key: 'CANCELLED', label: 'Đã huỷ', tone: 'text-rose-700 bg-rose-50 border-rose-200' },
]

export function AdminDashboardPage() {
  useDocumentTitle('Bảng Điều Khiển Sàn')
  const { data, loading, error, reload } = useApi(() => adminService.dashboard(), [])

  if (loading && !data) return <Spinner />
  if (error || !data) {
    return (
      <div className="page section">
        <ErrorState message={error ?? 'Không tải được chỉ số sàn'} onRetry={reload} />
      </div>
    )
  }

  return (
    <div className="page section flex flex-col gap-6">
      <PageHeader
        eyebrow="Quản Trị Hệ Thống"
        title="Bảng Điều Khiển Sàn"
        description="Tổng quan chỉ số kinh doanh toàn sàn, doanh thu gói SaaS và các hàng đợi tác vụ vận hành khẩn cấp."
        action={
          <button
            type="button"
            onClick={reload}
            className="btn btn-secondary flex items-center gap-1.5"
            title="Làm mới chỉ số"
          >
            <Icon name="sync" className="text-[18px]" />
            Làm mới
          </button>
        }
      />

      {/* 1. Hàng đợi tác vụ cần xử lý ngay */}
      <section className="flex flex-col gap-3">
        <h2 className="text-h3 text-navy font-semibold flex items-center gap-2">
          <Icon name="pending_actions" className="text-primary text-[22px]" />
          Hàng Đợi Cần Xử Lý Ngay
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card p-5 border-l-4 border-l-amber-500 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-small text-muted">
                <span>Hồ sơ KYC chờ duyệt</span>
                <Icon name="biotech" className="text-amber-600 text-[20px]" />
              </div>
              <p className="mt-2 text-h1 font-bold text-navy">{data.pendingKycDocs}</p>
              <p className="mt-1 text-small text-muted">Hồ sơ ATTP, GPKD và CCCD xưởng</p>
            </div>
            <Link
              to="/admin/kyc"
              className="mt-4 inline-flex items-center gap-1 text-small font-semibold text-primary hover:underline"
            >
              Thẩm định ngay
              <Icon name="arrow_forward" className="text-[16px]" />
            </Link>
          </div>

          <div className="card p-5 border-l-4 border-l-blue-500 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-small text-muted">
                <span>Gói SaaS chờ đối soát</span>
                <Icon name="receipt_long" className="text-blue-600 text-[20px]" />
              </div>
              <p className="mt-2 text-h1 font-bold text-navy">{data.pendingSubscriptions}</p>
              <p className="mt-1 text-small text-muted">Yêu cầu kích hoạt gian hàng</p>
            </div>
            <Link
              to="/admin/subscriptions"
              className="mt-4 inline-flex items-center gap-1 text-small font-semibold text-primary hover:underline"
            >
              Đối soát chuyển khoản
              <Icon name="arrow_forward" className="text-[16px]" />
            </Link>
          </div>

          <div className="card p-5 border-l-4 border-l-rose-500 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-small text-muted">
                <span>Khiếu nại tồn đọng</span>
                <Icon name="report_problem" className="text-rose-600 text-[20px]" />
              </div>
              <p className="mt-2 text-h1 font-bold text-navy">{data.pendingComplaints}</p>
              <p className="mt-1 text-small text-muted">Sự cố bánh hỏng, giao trễ</p>
            </div>
            <Link
              to="/admin/complaints"
              className="mt-4 inline-flex items-center gap-1 text-small font-semibold text-primary hover:underline"
            >
              Xem khiếu nại
              <Icon name="arrow_forward" className="text-[16px]" />
            </Link>
          </div>

          <div className="card p-5 border-l-4 border-l-emerald-500 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-small text-muted">
                <span>Đơn sỉ B2B đang mở</span>
                <Icon name="request_quote" className="text-emerald-600 text-[20px]" />
              </div>
              <p className="mt-2 text-h1 font-bold text-navy">{data.openRfqs}</p>
              <p className="mt-1 text-small text-muted">Nhu cầu đặt bánh số lượng lớn</p>
            </div>
            <span className="mt-4 text-small text-muted">Các xưởng đang nộp báo giá</span>
          </div>
        </div>
      </section>

      {/* 2. Thống kê kinh doanh & vận hành toàn sàn */}
      <section className="flex flex-col gap-3">
        <h2 className="text-h3 text-navy font-semibold flex items-center gap-2">
          <Icon name="analytics" className="text-primary text-[22px]" />
          Chỉ Số Kinh Doanh Toàn Sàn
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card p-5">
            <div className="flex items-center justify-between text-small text-muted">
              <span>Doanh thu phí SaaS</span>
              <Icon name="payments" className="text-primary text-[20px]" />
            </div>
            <p className="mt-1 text-h2 font-bold text-primary">{formatVnd(data.totalSaasRevenue)}</p>
            <p className="mt-1 text-small text-muted">Phí kích hoạt quyền bán đã thu</p>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between text-small text-muted">
              <span>Tổng giá trị GMV sàn</span>
              <Icon name="account_balance_wallet" className="text-navy text-[20px]" />
            </div>
            <p className="mt-1 text-h2 font-bold text-navy">{formatVnd(data.totalGmv)}</p>
            <p className="mt-1 text-small text-muted">Tổng tiền các đơn đặt thành công</p>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between text-small text-muted">
              <span>Tổng số đơn đặt</span>
              <Icon name="local_shipping" className="text-navy text-[20px]" />
            </div>
            <p className="mt-1 text-h2 font-bold text-navy">{data.totalOrders}</p>
            <p className="mt-1 text-small text-muted">Đơn hàng của toàn bộ khách hàng</p>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between text-small text-muted">
              <span>Xưởng sản xuất đối tác</span>
              <Icon name="storefront" className="text-navy text-[20px]" />
            </div>
            <p className="mt-1 text-h2 font-bold text-navy">{data.totalProviders}</p>
            <p className="mt-1 text-small text-muted">
              <strong className="text-emerald-700">{data.approvedProviders}</strong> đã duyệt ATTP ·{' '}
              <strong className="text-blue-700">{data.activeSeasonProviders}</strong> đang mở bán
            </p>
          </div>
        </div>
      </section>

      {/* 3. Phễu trạng thái đơn hàng */}
      <section className="card p-5 flex flex-col gap-4">
        <h2 className="text-h3 text-navy font-semibold flex items-center gap-2">
          <Icon name="fact_check" className="text-primary text-[22px]" />
          Phân Bổ Trạng Thái Đơn Hàng Toàn Hệ Thống
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7">
          {STATUS_ORDER.map(({ key, label, tone }) => {
            const count = data.ordersByStatus[key] ?? 0
            return (
              <div key={key} className={`rounded-lg border p-3 flex flex-col justify-between ${tone}`}>
                <span className="text-small font-medium">{label}</span>
                <span className="mt-2 text-h2 font-bold">{count}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* 4. Danh sách chờ xử lý chi tiết */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bảng Gói SaaS chờ kích hoạt */}
        <section className="card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-h3 font-semibold text-navy flex items-center gap-2">
              <Icon name="receipt_long" className="text-primary text-[20px]" />
              Gói Bán Hàng Chờ Kích Hoạt
            </h3>
            <Link to="/admin/subscriptions" className="text-small font-semibold text-primary hover:underline">
              Xem tất cả
            </Link>
          </div>
          {data.recentSubscriptions.length === 0 ? (
            <EmptyState title="Không có gói nào đang chờ đối soát" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-small">
                <thead className="text-left text-muted border-b border-line">
                  <tr>
                    <th className="pb-2 font-medium">Xưởng / Gói</th>
                    <th className="pb-2 font-medium">Mã GD</th>
                    <th className="pb-2 font-medium text-right">Phí</th>
                    <th className="pb-2 font-medium text-right">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {data.recentSubscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-surface-dim/40 transition-colors">
                      <td className="py-2.5">
                        <p className="font-semibold text-navy">{sub.providerName || sub.providerEmail}</p>
                        <p className="text-muted text-[12px]">{sub.planName}</p>
                      </td>
                      <td className="py-2.5 font-mono text-[13px] text-ink">{sub.paymentNote || '—'}</td>
                      <td className="py-2.5 text-right font-semibold text-primary">{formatVnd(sub.price)}</td>
                      <td className="py-2.5 text-right text-muted text-[12px]">{formatDateTime(sub.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Bảng Hồ sơ KYC chờ thẩm định */}
        <section className="card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-h3 font-semibold text-navy flex items-center gap-2">
              <Icon name="biotech" className="text-primary text-[20px]" />
              Hồ Sơ ATTP & Pháp Lý Chờ Duyệt
            </h3>
            <Link to="/admin/kyc" className="text-small font-semibold text-primary hover:underline">
              Xem tất cả
            </Link>
          </div>
          {data.recentKycDocs.length === 0 ? (
            <EmptyState title="Không có hồ sơ nào đang chờ duyệt" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-small">
                <thead className="text-left text-muted border-b border-line">
                  <tr>
                    <th className="pb-2 font-medium">Xưởng nộp</th>
                    <th className="pb-2 font-medium">Loại tài liệu</th>
                    <th className="pb-2 font-medium text-right">Gửi lúc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {data.recentKycDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-surface-dim/40 transition-colors">
                      <td className="py-2.5">
                        <p className="font-semibold text-navy">{doc.providerName || doc.providerEmail}</p>
                        <p className="text-muted text-[12px]">{doc.providerEmail}</p>
                      </td>
                      <td className="py-2.5">
                        <span className="badge badge-neutral text-[12px]">
                          {DOC_TYPE_LABEL[doc.documentType] ?? doc.documentType}
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-muted text-[12px]">{formatDateTime(doc.submittedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* 5. Sự cố & Khiếu nại gần nhất */}
      {data.recentComplaints.length > 0 && (
        <section className="card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-h3 font-semibold text-navy flex items-center gap-2">
              <Icon name="report_problem" className="text-rose-600 text-[20px]" />
              Khiếu Nại Cần Phân Xử Gần Nhất
            </h3>
            <Link to="/admin/complaints" className="text-small font-semibold text-primary hover:underline">
              Xem tất cả khiếu nại
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-small">
              <thead className="text-left text-muted border-b border-line">
                <tr>
                  <th className="pb-2 font-medium">Mã đơn</th>
                  <th className="pb-2 font-medium">Xưởng bị khiếu nại</th>
                  <th className="pb-2 font-medium">Loại sự cố</th>
                  <th className="pb-2 font-medium">Tiêu đề</th>
                  <th className="pb-2 font-medium text-right">Gửi lúc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {data.recentComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-dim/40 transition-colors">
                    <td className="py-2.5 font-mono font-semibold text-navy">{c.orderCode}</td>
                    <td className="py-2.5 text-ink">{c.providerName || 'Xưởng'}</td>
                    <td className="py-2.5">
                      <span className="badge badge-danger text-[12px]">
                        {COMPLAINT_TYPE_LABEL[c.complaintType] ?? c.complaintType}
                      </span>
                    </td>
                    <td className="py-2.5 text-ink max-w-xs truncate">{c.subject}</td>
                    <td className="py-2.5 text-right text-muted text-[12px]">{formatDateTime(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
