import { useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, List } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { addDays, cn, formatDate, parseIsoDate, toIsoDate } from '../lib/format'
import { sellerService } from '../services/sellerService'
import type { OrderStatus } from '../types/order'
import { ErrorState } from './ui/States'

const WEEKDAYS = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật']
const COUNT_FORMAT = new Intl.NumberFormat('vi-VN')
const STATUS_GROUP = {
  PENDING_DEPOSIT: 'processing',
  CONFIRMED: 'processing',
  DEPOSITED: 'processing',
  BAKING_QUEUED: 'processing',
  DELIVERING: 'delivery',
  COMPLETED: 'delivery',
  CANCELLED: 'cancelled',
} as const satisfies Record<OrderStatus, string>

const METRICS = [
  { key: 'total', label: 'Tổng đơn', color: 'bg-gold-ink' },
  { key: 'delivery', label: 'Đang giao / hoàn tất', color: 'bg-success' },
  { key: 'processing', label: 'Đang xử lý', color: 'bg-on-primary-container' },
  { key: 'cancelled', label: 'Đã hủy', color: 'bg-danger' },
] as const

const shiftMonth = (month: Date, offset: number) => {
  const next = new Date(month)
  next.setMonth(next.getMonth() + offset)
  return next
}

async function loadMonth(first: Date, next: Date) {
  // The orders endpoint filters by delivery date, one day after the bake date.
  const query = { from: toIsoDate(addDays(first, 1)), to: toIsoDate(next), size: 100 }
  const totals = { total: 0, delivery: 0, processing: 0, cancelled: 0 }
  const counts = new Map<string, number>()
  const seenOrders = new Set<string>()
  let page = await sellerService.orders({ ...query, page: 0 })

  for (let index = 0; index < page.totalPages; index++) {
    if (index > 0) page = await sellerService.orders({ ...query, page: index })
    for (const order of page.content) {
      if (seenOrders.has(order.id)) continue
      seenOrders.add(order.id)
      const bakeDate = toIsoDate(addDays(parseIsoDate(order.deliveryDate), -1))
      counts.set(bakeDate, (counts.get(bakeDate) ?? 0) + 1)
      totals.total++
      totals[STATUS_GROUP[order.status]]++
    }
  }
  return { counts, totals }
}

type CalendarMode = 'month' | 'list'

export function BakeCalendar({ month, date, today, onChangeMonth, onSelectDate, revision }: {
  month: string
  date: string
  today: string
  onChangeMonth: (month: string) => void
  onSelectDate: (date: string) => void
  revision: number
}) {
  const [mode, setMode] = useState<CalendarMode>('month')
  const first = parseIsoDate(month)
  const label = `Tháng ${first.getMonth() + 1}, ${first.getFullYear()}`

  return (
    <section aria-labelledby="bake-month-heading" className="no-print @container min-w-0 rounded-lg border border-line p-3 sm:p-4">
      <div className="mb-3 grid items-center gap-3 @min-[620px]:grid-cols-[1fr_auto_1fr]">
        <h2 id="bake-month-heading" className="flex items-center gap-2.5 text-h3 font-bold">
          <CalendarDays size={22} className="text-gold-ink" aria-hidden />Lịch theo tháng
        </h2>
        <div className="flex items-center justify-between gap-2 @min-[620px]:justify-center">
          <button type="button" className="grid size-11 place-items-center rounded-md border border-line bg-white text-navy hover:bg-champagne/50 sm:size-9" aria-label="Tháng trước" onClick={() => onChangeMonth(toIsoDate(shiftMonth(first, -1)))}>
            <ChevronLeft size={17} aria-hidden />
          </button>
          <span aria-live="polite" className="min-w-32 text-center font-bold text-navy">{label}</span>
          <button type="button" className="grid size-11 place-items-center rounded-md border border-line bg-white text-navy hover:bg-champagne/50 sm:size-9" aria-label="Tháng sau" onClick={() => onChangeMonth(toIsoDate(shiftMonth(first, 1)))}>
            <ChevronRight size={17} aria-hidden />
          </button>
        </div>
        <div className="inline-flex w-fit rounded-md border border-line bg-white @min-[620px]:justify-self-end" role="group" aria-label="Chế độ xem lịch">
          <button type="button" aria-pressed={mode === 'month'} className="bake-view-toggle" onClick={() => setMode('month')}>
            <CalendarDays size={15} aria-hidden />Tháng
          </button>
          <button type="button" aria-pressed={mode === 'list'} className="bake-view-toggle" onClick={() => setMode('list')}>
            <List size={16} aria-hidden />Danh sách
          </button>
        </div>
      </div>
      <MonthContents key={month} first={first} label={label} date={date} today={today} mode={mode} onSelectDate={onSelectDate} revision={revision} />
    </section>
  )
}

function MonthContents({ first, label, date, today, mode, onSelectDate, revision }: {
  first: Date
  label: string
  date: string
  today: string
  mode: CalendarMode
  onSelectDate: (date: string) => void
  revision: number
}) {
  const next = shiftMonth(first, 1)
  const { data, loading, error, reload } = useApi(() => loadMonth(first, next), [revision])
  const daysInMonth = addDays(next, -1).getDate()
  const leadingDays = (first.getDay() + 6) % 7
  const cellCount = Math.ceil((leadingDays + daysInMonth) / 7) * 7
  const monthDays = Array.from({ length: daysInMonth }, (_, index) => toIsoDate(addDays(first, index)))
  const weeks = Array.from({ length: cellCount / 7 }, (_, week) =>
    Array.from({ length: 7 }, (_, weekday) => {
      const offset = week * 7 + weekday - leadingDays
      const day = addDays(first, offset)
      return { iso: toIsoDate(day), number: day.getDate(), inMonth: offset >= 0 && offset < daysInMonth }
    }),
  )
  const listDays = monthDays.filter((day) => data?.counts.has(day) || day === date)

  return (
    <div className="grid items-start gap-3 @min-[740px]:grid-cols-[minmax(10.5rem,18%)_minmax(0,1fr)]" aria-busy={loading}>
      <div className="rounded-md border border-line bg-white px-3 @max-[500px]:order-2">
        <h3 className="border-b border-line py-2.5 text-body font-bold">{label}</h3>
        <dl className="grid grid-cols-2 gap-x-3 @min-[740px]:grid-cols-1 @min-[740px]:divide-y @min-[740px]:divide-line">
          {METRICS.map(({ key, label: metricLabel, color }) => (
            <div key={key} className="flex items-center justify-between gap-1.5 py-2 text-small">
              <dt className="flex items-center gap-1.5">
                <span className={cn('size-2 shrink-0 rounded-full', color)} aria-hidden />
                {metricLabel}
              </dt>
              <dd className="font-bold tabular-nums">{data && !error ? COUNT_FORMAT.format(data.totals[key]) : '—'}</dd>
            </div>
          ))}
        </dl>
        <p className="border-t border-line py-2.5 text-small text-muted">Số đơn tính theo ngày trước ngày giao, gồm cả đơn chờ cọc và đã hủy.</p>
      </div>
      <div className="min-w-0">
        {error ? <ErrorState message="Không tải được lịch theo tháng." onRetry={reload} /> : mode === 'month' ? (
          <div className="overflow-hidden rounded-md border border-line bg-white">
            {loading && !data && <p role="status" className="sr-only">Đang tải lịch theo tháng...</p>}
            <table className="bake-calendar-grid w-full table-fixed border-collapse text-small" aria-label={`Lịch nướng ${label}`}>
              <thead className="bg-surface-container-low">
                <tr>
                  {WEEKDAYS.map((day, index) => (
                    <th key={day} scope="col" className="py-1.5 font-semibold text-navy">
                      <span className="sr-only">{day}</span>
                      <span aria-hidden className="hidden @min-[500px]:inline">{day}</span>
                      <span aria-hidden className="@min-[500px]:hidden">{index < 6 ? `T${index + 2}` : 'CN'}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeks.map((week) => (
                  <tr key={week[0].iso}>
                    {week.map(({ iso, number, inMonth }) => {
                      const count = data ? data.counts.get(iso) ?? 0 : null
                      const selected = iso === date
                      return (
                        <td key={iso} className="border-t border-line align-top">
                          {inMonth ? (
                            <button type="button" className="bake-calendar-day" aria-current={iso === today ? 'date' : undefined} aria-pressed={selected}
                              aria-label={`${formatDate(iso)}${count === null ? '' : `, ${COUNT_FORMAT.format(count)} đơn`}`}
                              onClick={() => onSelectDate(iso)}>
                              <span className="font-bold">{number}</span>
                              {count === null ? <span className="h-3 w-5 rounded-sm bg-surface-container-high" aria-hidden /> : (count > 0 || selected) && (
                                <span className="flex max-w-full items-center gap-1 tabular-nums text-muted">
                                  {count > 0 && <span className="hidden size-1.5 shrink-0 rounded-full bg-gold-ink @min-[500px]:inline-block" aria-hidden />}
                                  {COUNT_FORMAT.format(count)}<span className="hidden @min-[500px]:inline">đơn</span>
                                </span>
                              )}
                            </button>
                          ) : <span className="block min-h-12 bg-surface-container-low px-1.5 py-1 text-outline sm:px-2.5">{number}</span>}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-line bg-white">
            {loading && !data ? <p role="status" className="p-4 text-small text-muted">Đang tải lịch theo tháng...</p>
              : listDays.length === 0 ? <p className="p-4 text-small text-muted">Không có đơn hàng trong tháng này.</p>
              : <ul className="divide-y divide-line" aria-label={`Các ngày nướng ${label}`}>
                {listDays.map((day) => (
                  <li key={day}>
                    <button type="button" aria-pressed={day === date} aria-current={day === today ? 'date' : undefined} onClick={() => onSelectDate(day)}
                      className="flex min-h-11 w-full items-center justify-between gap-3 px-3 py-2 text-left font-semibold text-navy hover:bg-champagne/40 focus-visible:outline-offset-[-2px] aria-pressed:bg-champagne">
                      {formatDate(day)}
                      <span className="whitespace-nowrap text-small tabular-nums text-muted">{COUNT_FORMAT.format(data?.counts.get(day) ?? 0)} đơn</span>
                    </button>
                  </li>
                ))}
              </ul>}
          </div>
        )}
      </div>
    </div>
  )
}
