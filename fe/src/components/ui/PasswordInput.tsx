import { useState, type InputHTMLAttributes } from 'react'
import { Field } from './Field'
import { Icon } from '../Icon'
import { PASSWORD_RULES } from '../../schemas'
import { cn } from '../../lib/format'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  name: string
  error?: string
  /** Hiện thanh độ mạnh + danh sách yêu cầu (ô mật khẩu mới) */
  showStrength?: boolean
}

const LEVELS = ['Rất yếu', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'] as const

/** Ô mật khẩu có nút hiện/ẩn; tuỳ chọn thanh đo độ mạnh theo PASSWORD_RULES (khớp PasswordPolicy của BE) */
export function PasswordInput({ label, name, error, showStrength, className, onChange, ...rest }: Props) {
  const [visible, setVisible] = useState(false)
  const [value, setValue] = useState('')
  const passed = PASSWORD_RULES.filter((r) => r.test(value)).length

  return (
    <Field label={label} name={name} error={error} className={className}>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={visible ? 'text' : 'password'}
          className="input pr-11"
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          onChange={(e) => {
            setValue(e.target.value)
            onChange?.(e)
          }}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-navy"
          aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        >
          <Icon name={visible ? 'visibility_off' : 'visibility'} className="text-[20px]" aria-hidden />
        </button>
      </div>
      {showStrength && value && (
        <div className="mt-2" aria-live="polite">
          <div className="flex gap-1" aria-hidden>
            {PASSWORD_RULES.map((_, i) => (
              <span key={i} className={cn('h-1 flex-1 rounded-full', i < passed ? (passed === PASSWORD_RULES.length ? 'bg-success' : 'bg-gold') : 'bg-line')} />
            ))}
          </div>
          <p className="mt-1 text-small text-muted">
            Độ mạnh: <strong className="text-navy">{LEVELS[Math.max(0, passed - 1)]}</strong>
          </p>
          <ul className="mt-1 grid grid-cols-2 gap-x-3 text-small">
            {PASSWORD_RULES.map((r) => (
              <li key={r.label} className={r.test(value) ? 'text-success' : 'text-muted'}>
                {r.test(value) ? '✓' : '•'} {r.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Field>
  )
}
