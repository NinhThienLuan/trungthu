import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'

interface Props {
  value: number
  max: number
  onChange: (value: number) => void
  size?: 'md' | 'sm'
  /** Lý do giới hạn, hiện khi khách chạm mức tối đa (mặc định "Tối đa N") */
  maxHint?: string
}

export function QuantityStepper({ value, max, onChange, size = 'md', maxHint }: Props) {
  const h = size === 'sm' ? 'h-9' : 'h-11'
  // Chữ đang gõ: cho phép xoá trống rồi gõ số mới; rời ô thì hiện lại số đã chốt
  const [draft, setDraft] = useState<string | null>(null)
  const typed = draft === null ? value : Number(draft)
  const overMax = typed >= max

  const type = (text: string) => {
    setDraft(text)
    const n = Math.floor(Number(text))
    if (text !== '' && n >= 1) onChange(Math.min(n, max))
  }

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <div className={`inline-flex ${h} items-center rounded-sm border border-line bg-white`}>
        <button
          type="button"
          className="flex h-full w-9 items-center justify-center text-navy disabled:opacity-40"
          onClick={() => { setDraft(null); onChange(value - 1) }}
          disabled={value <= 1}
          aria-label="Giảm số lượng"
        >
          <Minus className="size-4" />
        </button>
        <input
          type="number"
          inputMode="numeric"
          className="h-full w-12 border-x border-line text-center text-body [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
          value={draft ?? value}
          min={1}
          max={max}
          onChange={(e) => type(e.target.value)}
          onBlur={() => setDraft(null)}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          aria-label="Số lượng"
        />
        <button
          type="button"
          className="flex h-full w-9 items-center justify-center text-navy disabled:opacity-40"
          onClick={() => { setDraft(null); onChange(value + 1) }}
          disabled={value >= max}
          aria-label="Tăng số lượng"
        >
          <Plus className="size-4" />
        </button>
      </div>
      {overMax && <p className="max-w-40 text-center text-[11px] leading-tight text-gold-ink" role="status">{maxHint ?? `Tối đa ${max}`}</p>}
    </div>
  )
}
