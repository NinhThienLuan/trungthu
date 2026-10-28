import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RfqFormCatcher } from '../../components/RfqFormCatcher'
import { B2bPortalView } from './B2bPortalView'
import { rfqService } from '../../services/rfqService'
import { useApi } from '../../hooks/useApi'
import { useAuthStore } from '../../stores/authStore'
import { errorMessage } from '../../apis/http'
import { formatDate, formatVnd, toIsoDate } from '../../lib/format'
import type { RfqResponse } from '../../types/order'

const statusText: Record<RfqResponse['status'], string> = {
  NEW: 'Mới tạo', DISTRIBUTED: 'Đang mời xưởng', QUOTES_RECEIVED: 'Đã có báo giá',
  WON: 'Đã chọn xưởng', LOST: 'Đã đóng',
}

export function RfqPortalPage() {
  const [created, setCreated] = useState<RfqResponse | null>(null)
  return (
    <RfqFormCatcher onSubmitted={setCreated}>
      <B2bPortalView />
      <BuyerRfqDashboard key={created?.id ?? 'initial'} created={created} />
    </RfqFormCatcher>
  )
}

function BuyerRfqDashboard({ created }: { created: RfqResponse | null }) {
  const { user, ready } = useAuthStore()
  const isBuyer = user?.role === 'CUSTOMER'
  const [selected, setSelected] = useState<string | null>(null)
  const [version, setVersion] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const list = useApi(() => isBuyer ? rfqService.mine() : Promise.resolve([]), [isBuyer, created?.id, version])
  const requestId = selected ?? created?.id ?? list.data?.[0]?.id
  const quotes = useApi(() => requestId && isBuyer ? rfqService.quotes(requestId) : Promise.resolve([]),
    [requestId, isBuyer, version])

  const accept = async (quoteId: string) => {
    if (!requestId || busy) return
    setBusy(true)
    setMessage(null)
    try {
      await rfqService.acceptQuote(requestId, quoteId)
      setMessage('Đã chọn báo giá. Xưởng sẽ liên hệ để hoàn tất hợp đồng.')
      setVersion((value) => value + 1)
    } catch (error) {
      setMessage(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section id="my-rfqs" className="bg-surface-container-low px-margin-mobile py-space-xl lg:px-margin">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-space-lg flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary">Yêu cầu báo giá của tôi</h2>
            <p className="text-on-surface-variant">Theo dõi RFQ và so sánh báo giá thực từ các xưởng.</p>
          </div>
          {isBuyer && <button type="button" className="btn btn-secondary" onClick={() => setVersion((value) => value + 1)}>Tải lại</button>}
        </div>
        {!ready ? <p>Đang kiểm tra tài khoản...</p> : !isBuyer ? (
          <p className="rounded-sm bg-white p-space-lg text-on-surface-variant">
            <Link to="/login?next=%2Frfq" className="font-semibold text-primary underline">Đăng nhập bằng tài khoản khách hàng</Link>
            {' '}để gửi và theo dõi yêu cầu báo giá.
          </p>
        ) : list.loading ? <p>Đang tải yêu cầu...</p> : list.error ? (
          <p role="alert" className="text-danger">{list.error}</p>
        ) : !list.data?.length ? <p>Chưa có yêu cầu báo giá nào.</p> : (
          <div className="grid gap-space-lg lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            <div className="space-y-space-sm">
              {list.data.map((rfq) => (
                <button key={rfq.id} type="button" onClick={() => { setSelected(rfq.id); setMessage(null) }}
                  className={`w-full rounded-sm border p-space-md text-left shadow-sm ${requestId === rfq.id ? 'border-secondary bg-champagne-light' : 'border-line bg-white'}`}>
                  <span className="block font-semibold text-primary">{rfq.code}</span>
                  <span className="block text-small text-on-surface-variant">
                    {rfq.requestedQuantity} hộp · nhận {formatDate(rfq.expectedDeliveryDate)}
                  </span>
                  <span className="mt-1 block text-small font-medium text-secondary">{statusText[rfq.status]}</span>
                </button>
              ))}
            </div>
            <div className="rounded-sm bg-white p-space-lg shadow-sm">
              <h3 className="mb-space-md font-headline-sm text-headline-sm text-primary">Báo giá từ xưởng</h3>
              {quotes.loading ? <p>Đang tải báo giá...</p> : quotes.error ? (
                <p role="alert" className="text-danger">{quotes.error}</p>
              ) : !quotes.data?.length ? <p className="text-on-surface-variant">Chưa có xưởng nào gửi báo giá cho yêu cầu này.</p> : (
                <div className="space-y-space-sm">
                  {quotes.data.map((quote) => (
                    <div key={quote.id} className="rounded-sm border border-line p-space-md">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-primary">{quote.providerName}</p>
                          <p className="text-small text-on-surface-variant">{quote.offeredQuantity} hộp · giao {formatDate(quote.estimatedDeliveryDate)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary">{formatVnd(quote.unitPrice)}/hộp</p>
                          <p className="text-small text-on-surface-variant">Tổng dự kiến {formatVnd(quote.unitPrice * quote.offeredQuantity)}</p>
                        </div>
                      </div>
                      {quote.note && <p className="mt-2 text-small">{quote.note}</p>}
                      <p className="mt-2 text-small text-on-surface-variant">
                        {quote.validUntil ? `Hiệu lực đến ${formatDate(quote.validUntil)}` : 'Chưa có hạn hiệu lực'} · {quote.status}
                      </p>
                      {quote.status === 'SUBMITTED' && (!quote.validUntil || quote.validUntil >= toIsoDate(new Date()))
                        && (list.data?.find((item) => item.id === requestId)?.status === 'QUOTES_RECEIVED') && (
                        <button type="button" disabled={busy} className="btn btn-primary mt-3"
                          onClick={() => accept(quote.id)}>Chọn báo giá này</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {message && <p role="status" className="mt-3 text-small text-primary">{message}</p>}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
