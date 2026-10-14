import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/format'

interface FieldProps {
  label: string
  name: string
  error?: string
  hint?: string
  className?: string
  children?: ReactNode
}

/** Khung label + control + lỗi; dùng cho mọi ô nhập để khoảng cách đồng nhất */
export function Field({ label, name, error, hint, className, children }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={name} className="field-label">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${name}-error`} className="field-error" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1 text-small text-muted">{hint}</p>
      )}
    </div>
  )
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string; name: string; error?: string; hint?: string }

export function TextInput({ label, name, error, hint, className, ...rest }: InputProps) {
  return (
    <Field label={label} name={name} error={error} hint={hint} className={className}>
      <input
        id={name}
        name={name}
        className="input"
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        {...rest}
      />
    </Field>
  )
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; name: string; error?: string }

export function TextArea({ label, name, error, className, ...rest }: TextareaProps) {
  return (
    <Field label={label} name={name} error={error} className={className}>
      <textarea id={name} name={name} rows={3} className={cn('input', 'resize-y')} aria-invalid={!!error} {...rest} />
    </Field>
  )
}
