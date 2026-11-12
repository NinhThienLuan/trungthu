import type { Page } from '../types/api'

const count = new Intl.NumberFormat('vi-VN')

export function AdminListPagination({ data, page, loading, error, noun, onChange }: {
  data: Page<unknown> | null
  page: number
  loading: boolean
  error: string | null
  noun: string
  onChange: (page: number) => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-small">
      <p className="text-muted" role="status">{data && `${count.format(data.totalElements)} ${noun}`}</p>
      <nav aria-label={`Phân trang ${noun}`} className="flex items-center gap-3">
        <button type="button" className="btn btn-outline px-3 normal-case tracking-normal"
          disabled={loading || page === 0} onClick={() => onChange(page - 1)}>
          Trước
        </button>
        <span role="status">Trang {count.format(page + 1)} / {data ? count.format(Math.max(1, data.totalPages)) : '—'}</span>
        <button type="button" className="btn btn-outline px-3 normal-case tracking-normal"
          disabled={loading || !!error || !data || page + 1 >= data.totalPages} onClick={() => onChange(page + 1)}>
          Sau
        </button>
      </nav>
    </div>
  )
}
