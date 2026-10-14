import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/format'

/** page bắt đầu từ 0 như Spring Data */
export function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null
  return (
    <nav className="flex items-center justify-center gap-1 pt-10" aria-label="Phân trang">
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
        aria-label="Trang trước"
      >
        <ChevronLeft className="size-4" />
      </button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          aria-current={i === page ? 'page' : undefined}
          className={cn('size-9 rounded-sm text-small font-semibold', i === page ? 'bg-navy text-gold' : 'text-navy hover:bg-champagne/50')}
        >
          {i + 1}
        </button>
      ))}
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages - 1}
        aria-label="Trang sau"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  )
}
