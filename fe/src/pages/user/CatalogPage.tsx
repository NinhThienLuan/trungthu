// Trang bộ sưu tập: markup chuyển nguyên từ Stitch, lưới sản phẩm + phân trang chạy theo dữ liệu.
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { PRODUCT_TYPE_LABEL } from '../../constants'
import type { ProductType } from '../../types/product'
import { CatalogCard } from '../../components/CatalogCard'
import { StitchPagination } from '../../components/StitchPagination'
import { ErrorState, Spinner } from '../../components/ui/States'
import { productService } from '../../services/productService'
import { promotionService } from '../../services/sellerService'
import { useApi } from '../../hooks/useApi'

const PAGE_SIZE = 6
// Vỏ hộp chỉ bán kèm bánh (Tự phối / set quà) nên không có trong bộ lọc
const TYPES: ProductType[] = ['LOOSE_CAKE', 'GIFT_SET', 'GREETING_CARD', 'ADDON_SERVICE']
// BE sắp xếp theo trường của Product; giá nằm ở từng phân loại nên chưa sắp theo giá được
const SORTS = {
  newest: { label: 'Mới nhất', sortBy: 'createdAt', direction: 'desc' },
  oldest: { label: 'Cũ nhất', sortBy: 'createdAt', direction: 'asc' },
  'name-asc': { label: 'Tên: A → Z', sortBy: 'name', direction: 'asc' },
  'name-desc': { label: 'Tên: Z → A', sortBy: 'name', direction: 'desc' },
} as const
type SortKey = keyof typeof SORTS

export function CatalogPage() {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') ?? 0)
  const type = (params.get('type') as ProductType | null) ?? undefined
  const sortKey: SortKey = (params.get('sort') as SortKey | null) ?? 'newest'
  const sort = SORTS[sortKey] ?? SORTS.newest
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const { data: promotions } = useApi(() => promotionService.running(), [])
  const promotionOf = (providerId: string, productId: string) =>
    promotions?.find((p) => p.providerId === providerId && (!p.productId || p.productId === productId))?.label
  const { data, loading, error, reload } = useApi(
    () => productService.list({ page, size: PAGE_SIZE, type, sortBy: sort.sortBy, direction: sort.direction }), [page, type, sortKey])
  /** Đổi bộ lọc trên URL; đổi lọc/sắp xếp thì về trang đầu */
  const update = (next: { page?: number; type?: ProductType | null; sort?: SortKey }) => {
    const p = new URLSearchParams(params)
    const set = (k: string, v?: string | null) => (v ? p.set(k, v) : p.delete(k))
    if ('type' in next) set('type', next.type)
    if (next.sort) set('sort', next.sort === 'newest' ? null : next.sort)
    set('page', next.page ? String(next.page) : null)
    setParams(p)
  }
  const setPage = (p: number) => {
    update({ page: p })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const filterButton = (active: boolean) =>
    `w-full text-left p-2 rounded-[0.125rem] flex items-center justify-between transition-colors ${active ? 'bg-primary-container text-champagne-light shadow-sm' : 'bg-surface-container-low hover:bg-champagne-light/40 text-on-surface'}`
  const from = data && data.totalElements ? page * PAGE_SIZE + 1 : 0
  const to = data ? Math.min((page + 1) * PAGE_SIZE, data.totalElements) : 0
  const rangeLabel = `${from} - ${to}`

  if (loading && !data) return <Spinner />
  if (error) return <div className="max-w-[1320px] mx-auto px-margin-mobile lg:px-margin py-space-xl"><ErrorState message={error} onRetry={reload} /></div>

  return (
    <>
      <div className="flex flex-col w-full">
        {' '}
        <section className="relative w-full bg-primary overflow-hidden">
          {' '}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#d6a75c_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>{' '}
          <div className="relative max-w-[1320px] mx-auto px-margin-mobile lg:px-margin py-space-xl lg:py-20 flex flex-col md:flex-row md:items-end justify-between gap-space-lg">
            {' '}
            <div className="space-y-space-sm max-w-2xl">
              {' '}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[0.125rem] bg-secondary-container/20 text-secondary-fixed">
                {' '}
                <Icon name="stars" className="text-[15px]" filled aria-hidden />{' '}
                <span className="font-label-sm text-label-sm tracking-widest uppercase">
                  Mùa Trăng 2025 • Đại Tuyển Tuyển Chọn
                </span>{' '}
              </div>{' '}
              <h1 className="font-headline-xl text-headline-xl text-champagne-light tracking-tight">
                {' Tuyển Tập Ngự Thiện Hoàng Kim '}
              </h1>{' '}
              <p className="font-body-lg text-body-lg text-on-primary-container max-w-xl">
                {
                  ' Quy tụ tinh hoa đúc kết từ những lò bánh di sản trăm năm khắp ba miền: Hải Phòng, Hà Nội, Hội An và Gia Định. Cam kết nướng tươi mới trong ngày và bảo quản chuỗi lạnh ngặt nghèo. '
                }
              </p>{' '}
            </div>{' '}
            <div className="flex flex-wrap items-center gap-space-md">
              {' '}
              <div className="px-space-md py-space-sm rounded-[0.125rem] bg-primary-container text-champagne-light shadow-sm">
                {' '}
                <div className="flex items-center gap-2 text-secondary-fixed mb-1">
                  {' '}
                  <Icon name="ac_unit" className="text-[18px]" aria-hidden />{' '}
                  <span className="font-label-sm text-label-sm uppercase tracking-wider">Chuỗi Lạnh Tiêu Chuẩn</span>{' '}
                </div>{' '}
                <span className="font-headline-sm text-headline-sm block">18°C – 22°C</span>{' '}
                <span className="font-body-sm text-body-sm text-on-primary-container">Độ ẩm tương đối 55%</span>{' '}
              </div>{' '}
              <div className="px-space-md py-space-sm rounded-[0.125rem] bg-primary-container text-champagne-light shadow-sm">
                {' '}
                <div className="flex items-center gap-2 text-secondary-fixed mb-1">
                  {' '}
                  <Icon name="workspace_premium" className="text-[18px]" aria-hidden />{' '}
                  <span className="font-label-sm text-label-sm uppercase tracking-wider">Chứng Nhận Hoàng Triều</span>{' '}
                </div>{' '}
                <span className="font-headline-sm text-headline-sm block">100% VSATTP</span>{' '}
                <span className="font-body-sm text-body-sm text-on-primary-container">
                  Kiểm định lô hàng số 2025-QG
                </span>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
        </section>{' '}
        <div className="sticky top-20 z-30 w-full bg-surface-container-low shadow-sm">
          {' '}
          <div className="max-w-[1320px] mx-auto px-margin-mobile lg:px-margin py-3 flex flex-wrap items-center justify-between gap-4">
            {' '}
            <div className="flex items-center gap-3">
              {' '}
              <span className="font-label-md text-label-md uppercase tracking-wider text-secondary">
                Đang hiển thị:
              </span>{' '}
              <span
                className="font-label-lg text-label-lg text-primary px-2 py-0.5 rounded-[0.125rem] bg-surface-container-high"
                id="active-count-label"
              >
                {data?.totalElements ?? 0} tác phẩm cao cấp
              </span>{' '}
              <span className="hidden md:inline text-outline-variant">|</span>{' '}
              <div className="hidden md:flex items-center gap-1.5 text-tertiary-container">
                {' '}
                <span className="inline-block w-2 h-2 rounded-[0.75rem] bg-emerald-700 animate-pulse"></span>{' '}
                <span className="font-body-sm text-body-sm text-on-surface">
                  Lò nướng hoạt động liên tục lúc 04:30 sáng
                </span>{' '}
              </div>{' '}
            </div>{' '}
            <div className="flex items-center gap-4">
              {' '}
              <div className="flex items-center gap-2">
                {' '}
                <label
                  className="font-label-sm text-label-sm uppercase tracking-wider text-outline"
                  htmlFor="sort-select"
                >
                  Sắp xếp:
                </label>{' '}
                <select
                  className="bg-surface-container-lowest text-primary font-body-sm text-body-sm px-3 py-1.5 rounded-[0.125rem] shadow-sm focus:outline-none focus:ring-1 focus:ring-secondary"
                  id="sort-select"
                  value={sortKey}
                  onChange={(e) => update({ sort: e.target.value as SortKey })}
                >
                  {(Object.keys(SORTS) as SortKey[]).map((k) => <option key={k} value={k}>{SORTS[k].label}</option>)}
                </select>{' '}
              </div>{' '}
              <div className="flex items-center bg-surface-container-high p-0.5 rounded-[0.125rem]">
                {' '}
                <button
                  type="button"
                  className={`p-1 rounded-[0.125rem] transition-colors ${view === 'grid' ? 'text-primary bg-surface-container-lowest' : 'text-outline hover:text-primary hover:bg-surface-container-lowest'}`}
                  title="Dạng lưới"
                  aria-pressed={view === 'grid'}
                  onClick={() => setView('grid')}
                >
                  <Icon name="grid_view" className="text-[20px]" aria-hidden />
                </button>
                <button
                  type="button"
                  className={`p-1 rounded-[0.125rem] transition-colors ${view === 'list' ? 'text-primary bg-surface-container-lowest' : 'text-outline hover:text-primary hover:bg-surface-container-lowest'}`}
                  title="Dạng danh sách"
                  aria-pressed={view === 'list'}
                  onClick={() => setView('list')}
                >
                  <Icon name="view_agenda" className="text-[20px]" aria-hidden />
                </button>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
        <div className="max-w-[1320px] mx-auto w-full px-margin-mobile lg:px-margin py-space-xl">
          {' '}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
            {' '}
            <aside className="lg:col-span-3 space-y-space-lg bg-surface-container-lowest p-space-lg rounded-[0.125rem] shadow-sm">
              <div className="flex items-center justify-between pb-space-sm bg-surface-container-low px-3 py-2 rounded-[0.125rem]">
                <div className="flex items-center gap-2 text-primary">
                  <Icon name="tune" className="text-[20px]" aria-hidden />
                  <span className="font-label-lg text-label-lg uppercase tracking-wider">Bộ Lọc</span>
                </div>
                <button
                  type="button"
                  className="text-secondary font-label-sm text-label-sm hover:underline tracking-wider uppercase disabled:opacity-40 disabled:no-underline"
                  disabled={!type && sortKey === 'newest'}
                  onClick={() => setParams({})}
                >
                  Đặt lại
                </button>
              </div>
              <div className="space-y-space-xs">
                <h4 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant flex items-center gap-2">
                  <Icon name="inventory_2" className="text-[16px] text-secondary" aria-hidden />
                  Loại Sản Phẩm
                </h4>
                <div className="grid grid-cols-1 gap-2 pt-1">
                  <button type="button" className={filterButton(!type)} aria-pressed={!type} onClick={() => update({ type: null })}>
                    <span className="font-body-sm text-body-sm">Tất cả</span>
                  </button>
                  {TYPES.map((t) => (
                    <button key={t} type="button" className={filterButton(type === t)} aria-pressed={type === t} onClick={() => update({ type: t })}>
                      <span className="font-body-sm text-body-sm">{PRODUCT_TYPE_LABEL[t]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>{' '}
            <section className="lg:col-span-9 space-y-space-lg">
              {' '}
              {type && (
                <div className="flex flex-wrap items-center gap-2 pb-2">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Đang áp dụng:</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[0.125rem] bg-champagne-light text-primary font-body-sm text-body-sm">
                    {PRODUCT_TYPE_LABEL[type]}
                    <button type="button" className="hover:text-error" aria-label={`Bỏ lọc ${PRODUCT_TYPE_LABEL[type]}`} onClick={() => update({ type: null })}>
                      <Icon name="close" className="text-[14px]" aria-hidden />
                    </button>
                  </span>
                  <button type="button" className="text-secondary hover:text-secondary-fixed-variant font-label-sm text-label-sm underline ml-2" onClick={() => setParams({})}>
                    Xóa tất cả
                  </button>
                </div>
              )}{' '}
              <div
                className={`grid grid-cols-1 gap-space-lg transition-all duration-300 ${view === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : ''}`}
                id="product-grid"
              >
                {' '}
                {data?.content.map((p) => (
                  <CatalogCard key={p.id} product={p} promotion={p.productType === 'GIFT_SET' ? undefined : promotionOf(p.providerId, p.id)} />
                ))}
                {data?.content.length === 0 && <p className="font-body-md text-on-surface-variant">Chưa có sản phẩm thuộc loại này.</p>}
              </div>{' '}
              <div className="pt-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md">
                {' '}
                <div className="font-body-sm text-body-sm text-on-surface-variant">
                  {' Hiển thị '}
                  <span className="font-bold text-primary">{rangeLabel}</span>
                  {' của '}
                  <span className="font-bold text-primary">{data?.totalElements ?? 0}</span>
                  {' bộ tác phẩm trăng rằm 2025 '}
                </div>{' '}
                <StitchPagination page={page} totalPages={data?.totalPages ?? 1} onChange={setPage} />{' '}
              </div>{' '}
              <div className="p-space-lg rounded-[0.125rem] bg-gradient-to-r from-primary-container via-primary to-primary-container text-champagne-light shadow-lg flex flex-col lg:flex-row items-center justify-between gap-space-md">
                {' '}
                <div className="space-y-1">
                  {' '}
                  <div className="inline-flex items-center gap-2 text-secondary-fixed font-label-sm text-label-sm uppercase tracking-widest">
                    {' '}
                    <Icon name="corporate_fare" className="text-[16px]" aria-hidden />
                    {' Bộ Phận Phục Vụ Ngoại Giao & Doanh Nghiệp '}
                  </div>{' '}
                  <h4 className="font-headline-sm text-headline-sm">Cần Thiết Kế Hộp Quà & Khắc Logo Riêng?</h4>{' '}
                  <p className="font-body-sm text-body-sm text-on-primary-container max-w-xl">
                    {
                      ' Cung cấp bộ kit mẫu nếm thử tận nơi trong 24h, miễn phí khắc kim logo công ty trên thẻ mạ vàng từ 100 hộp. '
                    }
                  </p>{' '}
                </div>{' '}
                <div className="flex flex-wrap items-center gap-space-sm shrink-0">
                  {' '}
                  <a
                    className="px-space-md py-2.5 rounded-[0.125rem] bg-secondary text-on-secondary font-label-md text-label-md uppercase tracking-wider hover:bg-secondary-container hover:text-on-secondary-container transition-colors shadow-sm"
                    data-path="bao-gia-b2b"
                    href="#"
                  >
                    {' Yêu Cầu Hộp Mẫu Thử '}
                  </a>{' '}
                  <a
                    className="px-space-md py-2.5 rounded-[0.125rem] bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-champagne-light font-label-md text-label-md uppercase tracking-wider transition-colors flex items-center gap-2"
                    href="tel:18008899"
                  >
                    {' '}
                    <Icon name="call" className="text-[16px]" aria-hidden />
                    {' Hotline B2B: 1800 8899 '}
                  </a>{' '}
                </div>{' '}
              </div>{' '}
            </section>{' '}
          </div>{' '}
        </div>{' '}
      </div>
    </>
  )
}
