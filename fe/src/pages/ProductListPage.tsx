import { useSearchParams } from 'react-router-dom'
import { productApi } from '../apis/products'
import { useApi } from '../hooks/useApi'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { PRODUCT_TYPE_LABEL } from '../constants'
import type { ProductType } from '../types/product'
import { ProductCard } from '../components/ProductCard'
import { PageHeader } from '../components/ui/PageHeader'
import { Pagination } from '../components/ui/Pagination'
import { EmptyState, ErrorState, Spinner } from '../components/ui/States'
import { cn } from '../lib/format'

const TYPES = Object.keys(PRODUCT_TYPE_LABEL) as ProductType[]

export function ProductListPage() {
  useDocumentTitle('Bộ sưu tập')
  // Bộ lọc nằm trên URL để F5 / chia sẻ link vẫn giữ nguyên
  const [params, setParams] = useSearchParams()
  const type = (params.get('type') as ProductType | null) ?? undefined
  const page = Number(params.get('page') ?? 0)

  const { data, loading, error, reload } = useApi(() => productApi.list({ type, page, size: 12 }), [type, page])

  const update = (next: { type?: ProductType; page?: number }) => {
    const p = new URLSearchParams()
    if (next.type) p.set('type', next.type)
    if (next.page) p.set('page', String(next.page))
    setParams(p)
  }

  return (
    <div className="page section">
      <PageHeader eyebrow="Bộ sưu tập" title="Bánh & quà Trung Thu" description="Sản phẩm đang mở bán từ các xưởng trên sàn." />

      <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Lọc theo loại">
        <button type="button" className={cn('chip', !type && 'chip-active')} onClick={() => update({})}>
          Tất cả
        </button>
        {TYPES.map((t) => (
          <button key={t} type="button" className={cn('chip', type === t && 'chip-active')} onClick={() => update({ type: t })}>
            {PRODUCT_TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data || data.content.length === 0 ? (
        <EmptyState title="Chưa có sản phẩm phù hợp" />
      ) : (
        <>
          <p className="mb-4 text-small text-muted">{data.totalElements} sản phẩm</p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {data.content.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={(p) => update({ type, page: p })} />
        </>
      )}
    </div>
  )
}
