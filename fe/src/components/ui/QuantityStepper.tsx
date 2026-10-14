import { Minus, Plus } from 'lucide-react'

interface Props {
  value: number
  max: number
  onChange: (value: number) => void
  size?: 'md' | 'sm'
}

export function QuantityStepper({ value, max, onChange, size = 'md' }: Props) {
  const h = size === 'sm' ? 'h-9' : 'h-11'
  return (
    <div className={`inline-flex ${h} items-center rounded-sm border border-line bg-white`}>
      <button
        type="button"
        className="flex h-full w-9 items-center justify-center text-navy disabled:opacity-40"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Giảm số lượng"
      >
        <Minus className="size-4" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        className="h-full w-12 border-x border-line text-center text-body [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
        value={value}
        min={1}
        max={max}
        onChange={(e) => onChange(Number(e.target.value) || 1)}
        aria-label="Số lượng"
      />
      <button
        type="button"
        className="flex h-full w-9 items-center justify-center text-navy disabled:opacity-40"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Tăng số lượng"
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}
