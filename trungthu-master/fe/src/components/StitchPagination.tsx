import { Icon } from './Icon'
import { cn } from '../lib/format'

/** Nhóm nút phân trang theo markup Stitch; page bắt đầu từ 0 như Spring Data */
export function StitchPagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  return (
    <nav className="flex items-center gap-1" aria-label="Phân trang">
      <button
        type="button"
        className="w-9 h-9 rounded-[0.125rem] flex items-center justify-center text-outline hover:bg-surface-container transition-colors disabled:opacity-30"
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
        aria-label="Trang trước"
      >
        <Icon name="chevron_left" className="text-[18px]" aria-hidden />
      </button>
      {Array.from({ length: Math.max(totalPages, 1) }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          aria-current={i === page ? 'page' : undefined}
          className={cn(
            'w-9 h-9 rounded-[0.125rem] font-label-md text-label-md transition-colors',
            i === page ? 'bg-primary text-champagne-light' : 'text-primary hover:bg-surface-container',
          )}
        >
          {i + 1}
        </button>
      ))}
      <button
        type="button"
        className="w-9 h-9 rounded-[0.125rem] flex items-center justify-center text-primary hover:bg-surface-container transition-colors disabled:opacity-30"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
        aria-label="Trang sau"
      >
        <Icon name="chevron_right" className="text-[18px]" aria-hidden />
      </button>
    </nav>
  )
}
