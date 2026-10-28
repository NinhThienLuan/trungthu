import { useState, type FormEvent } from 'react'
import { rfqService } from '../../services/rfqService'
import { useApi } from '../../hooks/useApi'
import { errorMessage } from '../../apis/http'
import { addDays, formatDate, formatVnd, toIsoDate } from '../../lib/format'

export function SellerRfqPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [version, setVersion] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const feed = useApi(rfqService.providerFeed, [version])
  const ownQuotes = useApi(rfqService.providerQuotes, [version])
  const currentId = selectedId ?? feed.data?.[0]?.id
  const selected = feed.data?.find((item) => item.id === currentId)
  const ownQuote = ownQuotes.data?.find((quote) => quote.requestId === currentId)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selected || busy) return
    const data = new FormData(event.currentTarget)
    const unitPrice = Number(data.get('unitPrice'))
    const offeredQuantity = Number(data.get('offeredQuantity'))
    if (!Number.isFinite(unitPrice) || unitPrice <= 0 || !Number.isInteger(offeredQuantity)
      || offeredQuantity < selected.requestedQuantity) {
      setMessage('Đơn giá phải lớn hơn 0 và số lượng phải đáp ứng yêu cầu của khách.')
      return
    }
    setBusy(true)
    setMessage(null)
    try {
      await rfqService.submitQuote(selected.id, {
        unitPrice,
        offeredQuantity,
        estimatedDeliveryDate: String(data.get('estimatedDeliveryDate')),
        validUntil: String(data.get('validUntil')),
        note: String(data.get('note') ?? '').trim() || undefined,
      })
      setMessage('Đã gửi báo giá cho khách hàng.')
      setVersion((value) => value + 1)
    } catch (error) {
      setMessage(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6 lg:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h2 text-primary">Yêu cầu báo giá B2B</h1>
          <p className="text-on-surface-variant">Xem RFQ đang mở và nộp một báo giá cho mỗi yêu cầu.</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => setVersion((value) => value + 1)}>Tải lại</button>
      </div>
      {feed.loading || ownQuotes.loading ? <p>Đang tải RFQ...</p> : feed.error || ownQuotes.error ? (
        <p role="alert" className="text-danger">{feed.error || ownQuotes.error}</p>
      ) : !feed.data?.length ? <p>Chưa có yêu cầu báo giá đang mở.</p> : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div className="space-y-3">
            {feed.data.map((rfq) => (
              <button key={rfq.id} type="button" onClick={() => { setSelectedId(rfq.id); setMessage(null) }}
                className={`w-full rounded-sm border p-4 text-left ${currentId === rfq.id ? 'border-secondary bg-champagne-light' : 'border-line bg-white'}`}>
                <span className="block font-semibold text-primary">{rfq.code}</span>
                <span className="block text-small text-on-surface-variant">
                  {rfq.requestedQuantity} hộp · cần nhận {formatDate(rfq.expectedDeliveryDate)}
                </span>
                {ownQuotes.data?.some((quote) => quote.requestId === rfq.id) &&
                  <span className="mt-1 block text-small font-medium text-secondary">Đã nộp báo giá</span>}
              </button>
            ))}
          </div>
          {selected && <section className="rounded-sm bg-white p-5 shadow-sm">
            <h2 className="text-h3 text-primary">{selected.code}</h2>
            <dl className="mt-3 grid gap-2 text-small sm:grid-cols-2">
              <div><dt className="text-muted">Doanh nghiệp</dt><dd>{selected.companyName}</dd></div>
              <div><dt className="text-muted">Số lượng</dt><dd>{selected.requestedQuantity} hộp</dd></div>
              <div><dt className="text-muted">Ngày nhận mong muốn</dt><dd>{formatDate(selected.expectedDeliveryDate)}</dd></div>
              <div><dt className="text-muted">Ngân sách</dt><dd>{selected.expectedBudget == null ? 'Chưa cung cấp' : formatVnd(selected.expectedBudget)}</dd></div>
            </dl>
            {selected.description && <p className="mt-3 whitespace-pre-wrap text-small">{selected.description}</p>}
            {ownQuote?.status === 'ACCEPTED' && (
              <div className="mt-4 rounded-sm border border-secondary p-4 text-small">
                <p className="font-semibold text-primary">Khách đã chọn báo giá của xưởng</p>
                <p>Liên hệ: {selected.contactName} · {selected.contactPhone} · {selected.contactEmail}</p>
              </div>
            )}
            {ownQuote ? (
              <div className="mt-5 rounded-sm bg-champagne-light p-4 text-small">
                <p className="font-semibold text-primary">Báo giá của xưởng: {formatVnd(ownQuote.unitPrice)}/hộp</p>
                <p>{ownQuote.offeredQuantity} hộp · trạng thái {ownQuote.status}</p>
              </div>
            ) : (
              <form key={selected.id} onSubmit={submit} className="mt-5 grid gap-3 sm:grid-cols-2">
                <label className="text-small font-semibold">Đơn giá mỗi hộp (đ)
                  <input className="input mt-1" name="unitPrice" type="number" min="1" required />
                </label>
                <label className="text-small font-semibold">Số lượng chào
                  <input className="input mt-1" name="offeredQuantity" type="number" min={selected.requestedQuantity}
                    defaultValue={selected.requestedQuantity} required />
                </label>
                <label className="text-small font-semibold">Ngày giao dự kiến
                  <input className="input mt-1" name="estimatedDeliveryDate" type="date"
                    min={toIsoDate(new Date())} defaultValue={selected.expectedDeliveryDate} required />
                </label>
                <label className="text-small font-semibold">Báo giá có hiệu lực đến
                  <input className="input mt-1" name="validUntil" type="date" min={toIsoDate(new Date())}
                    defaultValue={toIsoDate(addDays(new Date(), 7))} required />
                </label>
                <label className="text-small font-semibold sm:col-span-2">Ghi chú
                  <textarea className="input mt-1 h-auto py-2" name="note" rows={3} maxLength={2000} />
                </label>
                <button className="btn btn-primary sm:col-span-2" type="submit" disabled={busy}>
                  {busy ? 'Đang gửi...' : 'Nộp báo giá'}
                </button>
              </form>
            )}
            {message && <p role="status" className="mt-3 text-small text-primary">{message}</p>}
          </section>}
        </div>
      )}
    </main>
  )
}
