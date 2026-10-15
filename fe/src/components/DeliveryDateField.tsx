import { useEffect, useId, useRef, useState } from 'react'
import { CalendarDays, ChevronDown } from 'lucide-react'
import { DeliveryDatePicker } from './DeliveryDatePicker'
import { cn, formatDate } from '../lib/format'

interface Props {
  providerId: string
  value?: string
  onChange: (date: string) => void
}

/**
 * Ô chọn ngày nhận dạng thu gọn: chỉ hiện nút, bấm mới sổ lịch xuống.
 * Lịch đóng khi chọn xong, bấm ra ngoài hoặc nhấn Esc.
 */
export function DeliveryDateField({ providerId, value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          'flex h-11 w-full items-center gap-2 rounded-sm border bg-white px-3 text-left text-body transition-colors sm:w-64',
          value ? 'border-line text-navy' : 'border-gold text-gold-ink',
          open && 'border-navy',
        )}
      >
        <CalendarDays className="size-4 shrink-0 text-gold" aria-hidden />
        <span className="flex-1 truncate">{value ? formatDate(value) : 'Chọn ngày nhận'}</span>
        <ChevronDown className={cn('size-4 shrink-0 transition-transform', open && 'rotate-180')} aria-hidden />
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute right-0 z-20 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-md border border-line bg-white p-4 shadow-card"
        >
          <DeliveryDatePicker
            providerId={providerId}
            value={value}
            onChange={(d) => {
              onChange(d)
              setOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
