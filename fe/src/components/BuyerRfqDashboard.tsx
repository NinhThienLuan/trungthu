import { useState } from 'react'
import { Link } from 'react-router-dom'
import { rfqService } from '../services/rfqService'
import { useApi } from '../hooks/useApi'
import { useAuthStore } from '../stores/authStore'
import { errorMessage } from '../apis/http'
import { formatDate, formatVnd, toIsoDate } from '../lib/format'
import { printRfqConfirmation } from '../lib/printRfqConfirmation'
import type { RfqResponse } from '../types/order'
import { Icon } from './Icon'
import { EmptyState, Notice, Spinner } from './ui/States'
import { ROUTES } from '../constants'

const statusText: Record<RfqResponse['status'], { label: string; tone: string }> = {
  NEW: { label: 'Mới tạo', tone: 'bg-navy/10 text-navy' },
  DISTRIBUTED: { label: 'Đang mời xưởng', tone: 'bg-amber-500/15 text-amber-800' },
  QUOTES_RECEIVED: { label: 'Đã có báo giá', tone: 'bg-primary-container text-secondary-fixed' },
  WON: { label: 'Đã chọn xưởng', tone: 'bg-emerald-500/15 text-emerald-800' },
  LOST: { label: 'Đã đóng', tone: 'bg-gray-200 text-gray-700' },
}

export function BuyerRfqDashboard({ created }: { created?: RfqResponse | null }) {
  const { user, ready } = useAuthStore()
  const isBuyer = user?.role === 'CUSTOMER'
  const [selected, setSelected] = useState<string | null>(null)
  const [version, setVersion] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const list = useApi(() => (isBuyer ? rfqService.mine() : Promise.resolve([])), [isBuyer, created?.id, version])
  const requestId = selected ?? created?.id ?? list.data?.[0]?.id
  const quotes = useApi(
    () => (requestId && isBuyer ? rfqService.quotes(requestId) : Promise.resolve([])),
    [requestId, isBuyer, version],
  )

  const accept = async (quoteId: string) => {
    if (!requestId || busy) return
    setBusy(true)
    setMessage(null)
    try {
      await rfqService.acceptQuote(requestId, quoteId)
      setMessage('Đã chọn báo giá thành công. Xưởng sẽ liên hệ để hoàn tất hợp đồng và đặt cọc.')
      setVersion((value) => value + 1)
    } catch (error) {
      setMessage(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  if (!ready) return <Spinner label="Đang kiểm tra tài khoản..." />
  if (!isBuyer) {
    return (
      <div className="card p-6 text-center">
        <Icon name="business_center" className="mx-auto text-4xl text-navy mb-2" aria-hidden />
        <h3 className="text-h3 font-semibold text-navy">Yêu cầu báo giá doanh nghiệp B2B</h3>
        <p className="mt-2 text-muted text-small">
          Vui lòng <Link to="/login?next=%2Forders%3Ftab%3Drfq" className="font-semibold text-primary underline">đăng nhập bằng tài khoản khách hàng</Link> để theo dõi các đơn hàng lớn và so sánh báo giá từ các xưởng.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-headline-sm text-headline-sm text-navy font-bold flex items-center gap-2">
            <Icon name="request_quote" className="text-secondary text-[22px]" aria-hidden />
            Danh Sách Đơn Lớn & Yêu Cầu Báo Giá (RFQ)
          </h2>
          <p className="text-small text-muted">Theo dõi tiến độ báo giá thực và chọn xưởng sản xuất cho đơn doanh nghiệp.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setVersion((v) => v + 1)}>
            <Icon name="sync" className="text-[14px]" aria-hidden /> Tải lại
          </button>
          <Link to={ROUTES.rfq} className="btn btn-primary btn-sm flex items-center gap-1.5">
            <Icon name="add" className="text-[16px]" aria-hidden /> Gửi RFQ Mới
          </Link>
        </div>
      </div>

      {list.loading && !list.data ? (
        <Spinner />
      ) : list.error ? (
        <Notice tone="danger">{list.error}</Notice>
      ) : !list.data?.length ? (
        <EmptyState
          title="Bạn chưa có yêu cầu báo giá đơn lớn nào"
          action={
            <Link to={ROUTES.rfq} className="btn btn-primary">
              Tạo yêu cầu báo giá B2B ngay
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
          {/* Cột trái: Danh sách các đơn lớn đã gửi */}
          <div className="flex flex-col gap-3">
            <span className="font-label-md text-label-md uppercase tracking-wider text-muted font-bold">
              Các yêu cầu đã gửi ({list.data.length})
            </span>
            <div className="space-y-2.5">
              {list.data.map((rfq) => {
                const active = requestId === rfq.id
                const st = statusText[rfq.status] ?? { label: rfq.status, tone: 'bg-gray-100 text-gray-700' }
                return (
                  <button
                    key={rfq.id}
                    type="button"
                    onClick={() => {
                      setSelected(rfq.id)
                      setMessage(null)
                    }}
                    className={`w-full rounded-md border p-4 text-left transition-all cursor-pointer ${
                      active
                        ? 'border-secondary bg-champagne/40 shadow-sm ring-1 ring-secondary'
                        : 'border-line bg-white hover:border-outline-variant hover:bg-surface/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-navy text-[14px]">{rfq.code}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${st.tone}`}>
                        {st.label}
                      </span>
                    </div>
                    <p className="mt-1 text-small text-ink">
                      <b>{rfq.companyName}</b> · {rfq.requestedQuantity} hộp quà
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted">
                      <span>Dự kiến nhận: <b>{formatDate(rfq.expectedDeliveryDate)}</b></span>
                      <span>{rfq.expectedBudget ? formatVnd(rfq.expectedBudget) : 'Chưa định ngân sách'}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Cột phải: Báo giá chi tiết từ các xưởng bánh */}
          <div className="rounded-md border border-line bg-white p-5 shadow-card flex flex-col gap-4">
            <div className="border-b border-line pb-3">
              <h3 className="font-headline-sm text-[16px] font-bold text-navy flex items-center gap-2">
                <Icon name="storefront" className="text-secondary text-[20px]" aria-hidden />
                Báo giá phản hồi từ các xưởng
              </h3>
              <p className="text-small text-muted mt-0.5">
                Các xưởng bánh thủ công xem thông số và gửi chào giá cạnh tranh kèm ngày giao cam kết.
              </p>
            </div>

            {message && <Notice tone="success">{message}</Notice>}

            {quotes.loading ? (
              <Spinner label="Đang tải báo giá..." />
            ) : quotes.error ? (
              <Notice tone="danger">{quotes.error}</Notice>
            ) : !quotes.data?.length ? (
              <div className="py-8 text-center text-muted flex flex-col items-center">
                <Icon name="hourglass_top" className="text-3xl text-gold mb-2" aria-hidden />
                <p className="font-medium text-navy text-small">Đang chờ các xưởng gửi báo giá</p>
                <p className="text-xs text-muted mt-1 max-w-sm">
                  Yêu cầu đang được gửi tới các xưởng bánh đủ điều kiện. Bạn sẽ nhận được báo giá chi tiết trong vòng 2–4 giờ làm việc.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {quotes.data.map((quote) => {
                  const currentRfq = list.data?.find((item) => item.id === requestId)
                  const isAccepted = quote.status === 'ACCEPTED'
                  const canAccept =
                    quote.status === 'SUBMITTED' &&
                    (!quote.validUntil || quote.validUntil >= toIsoDate(new Date())) &&
                    currentRfq?.status === 'QUOTES_RECEIVED'

                  return (
                    <div
                      key={quote.id}
                      className={`rounded-md border p-4 transition-all ${
                        isAccepted ? 'border-emerald-600 bg-emerald-50/50' : 'border-line bg-surface/30'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-navy text-[15px]">{quote.providerName}</h4>
                            {isAccepted && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-600 text-white">
                                Đã chọn xưởng này
                              </span>
                            )}
                          </div>
                          <p className="text-small text-muted mt-0.5">
                            Cung ứng: <b>{quote.offeredQuantity} hộp</b> · Giao hàng: <b>{formatDate(quote.estimatedDeliveryDate)}</b>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-secondary text-base">{formatVnd(quote.unitPrice)}</span>
                          <span className="text-xs text-muted block">/ hộp</span>
                          <span className="text-xs text-muted block mt-0.5">
                            Tổng dự kiến: <b>{formatVnd(quote.unitPrice * quote.offeredQuantity)}</b>
                          </span>
                        </div>
                      </div>

                      {quote.note && (
                        <div className="mt-2.5 rounded bg-white p-2.5 border border-line/60 text-small text-ink">
                          <span className="text-muted block text-[11px] uppercase font-semibold">Lời nhắn từ xưởng:</span>
                          <p className="mt-0.5">{quote.note}</p>
                        </div>
                      )}

                      {isAccepted && (
                        <div className="mt-3 rounded border border-emerald-500/40 bg-emerald-50 p-3 text-small text-emerald-950 flex flex-col gap-1.5">
                          <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                            <Icon name="check_circle" className="text-[16px]" aria-hidden />
                            Bạn đã chọn báo giá này — hãy liên hệ xưởng để ký kết hợp đồng:
                          </p>
                          <p className="text-xs text-emerald-900">
                            Điện thoại: <b>{quote.providerPhone ?? '—'}</b> · Email: <b>{quote.providerEmail ?? '—'}</b>
                            {quote.providerAddress && <> · Địa chỉ xưởng: <b>{quote.providerAddress}</b></>}
                          </p>
                          {currentRfq && (
                            <button
                              type="button"
                              className="btn btn-outline btn-sm self-start mt-1.5 bg-white text-emerald-900 border-emerald-600 hover:bg-emerald-100"
                              onClick={() => printRfqConfirmation(currentRfq, quote)}
                            >
                              <Icon name="print" className="text-[14px]" aria-hidden /> In phiếu xác nhận đơn sỉ (PDF)
                            </button>
                          )}
                        </div>
                      )}

                      <div className="mt-3 pt-2.5 border-t border-line/60 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                        <span>
                          {quote.validUntil ? `Hiệu lực báo giá đến ${formatDate(quote.validUntil)}` : 'Chưa có hạn'}
                        </span>
                        {canAccept && (
                          <button
                            type="button"
                            disabled={busy}
                            className="btn btn-primary btn-sm cursor-pointer"
                            onClick={() => accept(quote.id)}
                          >
                            Chấp nhận báo giá xưởng này
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
