import { useRef, useState, type Ref } from 'react'
import { CalendarDays, PackageOpen, Printer, RefreshCw } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { addDays, cn, formatDate, parseIsoDate, toIsoDate } from '../lib/format'
import { sellerService, type BakeLineItem } from '../services/sellerService'
import { useAuthStore } from '../stores/authStore'
import { BakeCalendar } from './BakeCalendar'
import { ErrorState, Spinner } from './ui/States'

const monthOf = (date: string) => `${date.slice(0, -2)}01`

export function BakeSheet() {
  const today = toIsoDate(new Date())
  const [date, setDate] = useState(() => toIsoDate(new Date()))
  const [month, setMonth] = useState(() => monthOf(date))
  const [revision, setRevision] = useState(0)
  const dayHeading = useRef<HTMLHeadingElement>(null)

  const selectDate = (value: string) => {
    setDate(value)
    if (value) setMonth(monthOf(value))
  }

  const selectCalendarDate = (value: string) => {
    selectDate(value)
    dayHeading.current?.scrollIntoView({ block: 'nearest' })
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <DailyBakeSheet date={date} today={today} headingRef={dayHeading} onSelectDate={selectDate} revision={revision} onReload={() => setRevision((value) => value + 1)} />
      <BakeCalendar month={month} date={date} today={today} onChangeMonth={setMonth} onSelectDate={selectCalendarDate} revision={revision} />
    </div>
  )
}

function DailyBakeSheet({ date, today, headingRef, onSelectDate, revision, onReload }: {
  date: string
  today: string
  headingRef: Ref<HTMLHeadingElement>
  onSelectDate: (date: string) => void
  revision: number
  onReload: () => void
}) {
  const { data, loading, error, reload } = useApi(async () => ({
    date,
    rows: date ? await sellerService.getBakeSheet(date) : [],
  }), [date, revision])
  const rows = data?.date === date ? data.rows : []
  const ready = !loading && !error && rows.length > 0
  const tomorrow = toIsoDate(addDays(parseIsoDate(today), 1))

  return (
    <section aria-labelledby="bake-day-heading" className="min-w-0 rounded-lg border border-line p-3 sm:p-4 print:border-0 print:p-0">
      <div className="no-print mb-3">
        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
          <h2 id="bake-day-heading" ref={headingRef} className="flex scroll-mt-24 items-center gap-2.5 text-h3 font-bold">
            <CalendarDays size={22} className="text-gold-ink" aria-hidden />Lịch trong ngày
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex w-full flex-wrap items-center gap-2 text-small font-semibold sm:w-auto" htmlFor="bake-date">
              Ngày nướng
              <input id="bake-date" type="date" className="input min-h-10 w-40 flex-1 py-1.5 text-body sm:flex-none" value={date} onChange={(event) => onSelectDate(event.target.value)} />
            </label>
            <button type="button" className={cn('btn btn-outline btn-sm h-11 border-line sm:h-9', date === today && 'border-gold bg-champagne/60')} onClick={() => onSelectDate(today)}>Hôm nay</button>
            <button type="button" className={cn('btn btn-outline btn-sm h-11 border-line sm:h-9', date === tomorrow && 'border-gold bg-champagne/60')} onClick={() => onSelectDate(tomorrow)}>Ngày mai</button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="btn btn-outline btn-sm h-11 border-line sm:h-9" disabled={!date || loading} onClick={onReload}><RefreshCw size={16} aria-hidden />Tải lại</button>
            <button type="button" className="btn btn-primary btn-sm h-11 sm:h-9" disabled={!ready} onClick={() => window.print()}><Printer size={16} aria-hidden />In phiếu nướng</button>
          </div>
        </div>
        <p className="mt-2 text-small text-muted">Phiếu nướng tổng hợp đơn từ bước xác nhận trở đi. Đơn chờ cọc và đã hủy chỉ xuất hiện trong lịch tháng.</p>
      </div>
      {!date ? <p role="status" className="no-print rounded-md border border-line bg-white px-4 py-6 text-center">Chọn ngày nướng để xem phiếu.</p>
        : loading ? <div className="no-print rounded-md border border-line bg-white"><Spinner label="Đang tổng hợp phiếu nướng..." /></div>
        : error ? <div className="no-print"><ErrorState message={error} onRetry={reload} /></div>
        : !rows.length ? (
          <div role="status" className="no-print flex min-h-32 flex-col items-center justify-center gap-2.5 rounded-md border border-line bg-white px-4 py-5 text-center">
            <PackageOpen size={32} className="text-gold-ink" aria-hidden />
            <p className="text-base font-medium text-navy">Không có bánh cần nướng trong ngày này</p>
          </div>
        ) : <BakeSheetResult date={date} rows={rows} />}
    </section>
  )
}

function BakeSheetResult({ date, rows }: { date: string; rows: BakeLineItem[] }) {
  const storeName = useAuthStore((state) => state.user?.storeName ?? state.user?.fullName)
  const total = rows.reduce((sum, line) => sum + line.bakeQuantity, 0)
  const orders = new Set(rows.flatMap((line) => line.orderCodes))
  const deliveryDate = toIsoDate(addDays(parseIsoDate(date), 1))

  return (
    <article className="bake-sheet rounded-md border border-line bg-white p-4 sm:p-5" aria-label="Phiếu nướng bánh">
      <div className="mb-5 flex flex-wrap justify-between gap-4">
        <div>
          <h2 className="text-h2">Phiếu nướng bánh</h2>
          <p className="mt-1 font-semibold">{storeName}</p>
          <p className="mt-2 text-small">Ngày nướng: <b>{formatDate(date)}</b> · Ngày giao: {formatDate(deliveryDate)}</p>
        </div>
        <p className="text-small">Tổng: <b>{total.toLocaleString('vi-VN')} cái</b> · {orders.size} đơn hàng</p>
      </div>
      <p className="no-print mb-2 text-small text-muted sm:hidden">Vuốt ngang để xem đủ số lượng và mã đơn hàng.</p>
      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full min-w-[640px] text-small print:min-w-0">
          <thead><tr className="border-b border-line text-left"><th className="py-3 pr-3">Sản phẩm</th><th className="px-3">Biến thể</th><th className="px-3 text-right">Số cái cần nướng</th><th className="py-3 pl-3">Mã đơn hàng</th></tr></thead>
          <tbody>
            {rows.map((line, index) => <tr key={`${line.variantId ?? 'set'}-${index}`} className="border-b border-line align-top">
              <td className="py-3 pr-3 font-semibold">{line.productName}</td>
              <td className="p-3">{line.variantName ?? '—'}</td>
              <td className="p-3 text-right font-semibold tabular-nums">{line.bakeQuantity.toLocaleString('vi-VN')}</td>
              <td className="py-3 pl-3"><ul aria-label={`Mã đơn của ${line.productName} ${line.variantName ?? ''}`} tabIndex={0} className="flex max-h-40 flex-col gap-1 overflow-y-auto pr-1 focus-visible:outline-2 focus-visible:outline-navy print:max-h-none print:overflow-visible">{[...new Set(line.orderCodes)].map((code) => <li key={code} className="break-all">{code}</li>)}</ul></td>
            </tr>)}
          </tbody>
          <tfoot><tr className="font-semibold"><td colSpan={2} className="py-3">Tổng số bánh</td><td className="p-3 text-right tabular-nums">{total.toLocaleString('vi-VN')}</td><td /></tr></tfoot>
        </table>
      </div>
      <p className="mt-4 text-small text-muted">Số lượng đã được quy đổi theo đơn hàng. Set quà được báo theo thông tin sản phẩm, không tách vị bánh khi chưa có định mức.</p>
    </article>
  )
}
