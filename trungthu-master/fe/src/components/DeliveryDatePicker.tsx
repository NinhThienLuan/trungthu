import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { capacityService } from '../services/capacityService'
import { useApi } from '../hooks/useApi'
import { MIN_LEAD_DAYS } from '../constants'
import { addDays, cn, parseIsoDate, toIsoDate } from '../lib/format'

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

interface Props {
  providerId: string
  value?: string
  onChange: (date: string) => void
}

/**
 * Lịch chọn ngày nhận cho 1 Provider.
 * Ngày < hôm nay + MIN_LEAD_DAYS hoặc đã kín hạn ngạch thì bị khoá (dữ liệu từ capacityService).
 */
export function DeliveryDatePicker({ providerId, value, onChange }: Props) {
  const minDate = useMemo(() => addDays(new Date(), MIN_LEAD_DAYS), [])
  const [month, setMonth] = useState(() => {
    const start = value ? parseIsoDate(value) : minDate
    return new Date(start.getFullYear(), start.getMonth(), 1)
  })

  const first = toIsoDate(month)
  const last = toIsoDate(new Date(month.getFullYear(), month.getMonth() + 1, 0))
  const { data, loading, error } = useApi(() => capacityService.availableDates(providerId, first, last), [providerId, first])
  const availability = useMemo(() => new Map(data?.map((d) => [d.date, d.available])), [data])

  // Ô trống đầu tháng để ngày 1 rơi đúng thứ (tuần bắt đầu từ T2)
  const offset = (month.getDay() + 6) % 7
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const canGoBack = month > new Date(minDate.getFullYear(), minDate.getMonth(), 1)

  return (
    <div className="w-full max-w-xs">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          disabled={!canGoBack}
          aria-label="Tháng trước"
        >
          <ChevronLeft className="size-4" />
        </button>
        <p className="text-small font-semibold text-navy" aria-live="polite">
          Tháng {month.getMonth() + 1}/{month.getFullYear()}
        </p>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          aria-label="Tháng sau"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center" role="grid" aria-busy={loading}>
        {WEEKDAYS.map((d) => (
          <span key={d} className="pb-1 text-label font-semibold text-muted">
            {d}
          </span>
        ))}
        {Array.from({ length: offset }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const iso = toIsoDate(new Date(month.getFullYear(), month.getMonth(), i + 1))
          const available = !loading && availability.get(iso) === true
          const selected = iso === value
          return (
            <button
              key={iso}
              type="button"
              disabled={!available}
              onClick={() => onChange(iso)}
              aria-pressed={selected}
              aria-label={`Ngày ${i + 1}${available ? '' : ', không nhận đơn'}`}
              className={cn(
                'h-9 rounded-sm text-small transition-colors',
                selected && 'bg-navy font-semibold text-gold',
                !selected && available && 'text-navy hover:bg-champagne',
                !available && 'cursor-not-allowed text-muted/40 line-through',
              )}
            >
              {i + 1}
            </button>
          )
        })}
      </div>

      {error ? (
        <p className="field-error">{error}</p>
      ) : (
        <p className="mt-2 text-small text-muted">Ngày bị gạch: chưa đủ {MIN_LEAD_DAYS} ngày chuẩn bị hoặc xưởng đã kín lịch.</p>
      )}
    </div>
  )
}
