import type { ReactNode } from 'react'
import { AlertCircle, Loader2, PackageOpen } from 'lucide-react'

export function Spinner({ label = 'Đang tải...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-muted" role="status">
      <Loader2 className="size-5 animate-spin text-gold" aria-hidden />
      <span className="text-small">{label}</span>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center" role="alert">
      <AlertCircle className="size-8 text-danger" aria-hidden />
      <p className="text-body text-ink">{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-outline btn-sm" onClick={onRetry}>
          Thử lại
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-4 px-6 py-16 text-center">
      <PackageOpen className="size-10 text-gold" aria-hidden />
      <p className="font-sans text-h3 text-navy">{title}</p>
      {action}
    </div>
  )
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'danger' | 'success'; children: ReactNode }) {
  const styles = {
    info: 'border-line bg-champagne/40 text-ink',
    danger: 'border-danger/30 bg-danger-soft text-danger',
    success: 'border-success/30 bg-success-soft text-success',
  }[tone]
  return <div className={`rounded-sm border px-4 py-3 text-small ${styles}`}>{children}</div>
}
