import { Icon } from '../../components/Icon'
import { RFQ_MIN_QUANTITY } from '../../constants'
import { formatVnd } from '../../lib/format'
import type { Product } from '../../types/product'

/** Lựa chọn dùng chung giữa bảng tính ngân sách và form RFQ */
export interface RfqDraft {
  providerId: string
  productId: string
  quantity: number
  cakesPerBox: number
}

const INPUT =
  'w-full px-space-md py-2.5 bg-surface-container-low text-primary rounded-[0.125rem] font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-secondary aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-error'
const LABEL = 'font-label-md text-label-md text-primary uppercase block'
const ADDONS = ['Khắc kim nhũ logo', 'Giao tách nhiều chi nhánh', 'Túi quà ngoại giao']

export interface B2bCatalog {
  products: Product[]
  providers: { id: string; name: string }[]
  loading: boolean
}

const listPrice = (p: Product) => Math.min(...p.variants.map((v) => v.price))

/** Chọn xưởng rồi chọn bánh của xưởng đó; để trống = gửi mọi xưởng */
export function ProviderProductPicker({ catalog, draft, onChange, named = false }: {
  catalog: B2bCatalog
  draft: RfqDraft
  onChange: (next: RfqDraft) => void
  /** true trong form RFQ: select có name để RfqFormCatcher đọc qua FormData */
  named?: boolean
}) {
  const id = named ? 'rfq' : 'calc'
  const products = catalog.products.filter((p) => !draft.providerId || p.providerId === draft.providerId)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
      <div className="space-y-space-xs">
        <label className={LABEL} htmlFor={`${id}-provider`}>Xưởng nhận báo giá</label>
        <select id={`${id}-provider`} name={named ? 'providerId' : undefined} className={INPUT} value={draft.providerId}
          onChange={(e) => onChange({ ...draft, providerId: e.target.value, productId: '' })}>
          <option value="">Tất cả xưởng (gửi rộng để so sánh giá)</option>
          {catalog.providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div className="space-y-space-xs">
        <label className={LABEL} htmlFor={`${id}-product`}>Bánh / set quà</label>
        <select id={`${id}-product`} name={named ? 'productId' : undefined} className={INPUT} value={draft.productId}
          disabled={catalog.loading}
          onChange={(e) => {
            const product = catalog.products.find((p) => p.id === e.target.value)
            onChange({ ...draft, productId: e.target.value, providerId: product?.providerId ?? draft.providerId })
          }}>
          <option value="">{catalog.loading ? 'Đang tải…' : 'Chưa chọn (mô tả ở yêu cầu bên dưới)'}</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}{draft.providerId ? '' : ` — ${p.storeName}`} · từ {formatVnd(listPrice(p))}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

/** Bảng tính theo giá niêm yết thật của bánh đã chọn; giá sỉ thực tế do xưởng báo trong RFQ */
export function BudgetCalculator({ catalog, draft, onChange, onApply }: {
  catalog: B2bCatalog
  draft: RfqDraft
  onChange: (next: RfqDraft) => void
  onApply: (budget: number | undefined, addons: string[]) => void
}) {
  const product = catalog.products.find((p) => p.id === draft.productId)
  const unit = product ? listPrice(product) : 0
  const subtotal = unit * draft.quantity
  const setQuantity = (value: number) =>
    onChange({ ...draft, quantity: Math.max(RFQ_MIN_QUANTITY, Math.min(5000, Math.round(value) || RFQ_MIN_QUANTITY)) })

  const apply = (form: HTMLFormElement) => {
    const addons = ADDONS.filter((_, i) => (form.elements.namedItem(`addon-${i}`) as HTMLInputElement | null)?.checked)
    onApply(product ? subtotal : undefined, addons)
  }

  return (
    <form className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start" onSubmit={(e) => { e.preventDefault(); apply(e.currentTarget) }}>
      <div className="lg:col-span-7 bg-surface-container-lowest p-space-lg lg:p-space-xl rounded-[0.125rem] shadow-md space-y-space-lg">
        <div className="space-y-space-sm">
          <div className="flex items-center justify-between">
            <label className="font-label-lg text-label-lg text-primary" htmlFor="quantity-number">1. Số lượng hộp quà dự kiến:</label>
            <div className="flex items-center gap-2">
              <input id="quantity-number" type="number" min={RFQ_MIN_QUANTITY} max={5000} step={10} value={draft.quantity}
                onChange={(e) => onChange({ ...draft, quantity: Number(e.target.value) })}
                onBlur={(e) => setQuantity(Number(e.target.value))}
                className="w-24 text-right px-2 py-1 bg-surface-container-low text-primary font-headline-sm text-headline-sm rounded-[0.125rem] focus:outline-none focus:ring-1 focus:ring-secondary" />
              <span className="font-label-md text-label-md text-on-surface-variant">hộp</span>
            </div>
          </div>
          <input type="range" aria-label="Số lượng hộp" min={RFQ_MIN_QUANTITY} max={5000} step={10} value={draft.quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full h-2 bg-surface-container-high rounded-[0.25rem] appearance-none cursor-pointer accent-secondary" />
          <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
            <span>{RFQ_MIN_QUANTITY} hộp</span><span>5.000 hộp</span>
          </div>
        </div>
        <div className="space-y-space-sm">
          <p className="font-label-lg text-label-lg text-primary">2. Chọn xưởng và bánh:</p>
          <ProviderProductPicker catalog={catalog} draft={draft} onChange={onChange} />
        </div>
        <div className="space-y-space-sm">
          <p className="font-label-lg text-label-lg text-primary">3. Dịch vụ thêm (ghi vào yêu cầu để xưởng báo giá):</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
            {ADDONS.map((label, i) => (
              <label key={label} className="flex items-center gap-space-xs p-space-sm bg-surface-container-low rounded-[0.125rem] cursor-pointer hover:bg-surface-container">
                <input name={`addon-${i}`} type="checkbox" className="rounded-[0.125rem] accent-secondary w-4 h-4" />
                <span className="font-body-sm text-body-sm text-on-surface">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="lg:col-span-5 bg-primary-container text-surface p-space-lg lg:p-space-xl rounded-[0.125rem] shadow-xl space-y-space-lg">
        <div className="space-y-1">
          <span className="font-label-sm text-label-sm text-secondary-fixed uppercase tracking-widest block">Bảng tổng hợp dự toán B2B</span>
          <h3 className="font-headline-md text-headline-md text-champagne-light">Bản Tính Khái Toán Nhanh</h3>
        </div>
        {product ? (
          <dl className="space-y-space-sm font-body-md text-body-md">
            <div className="flex justify-between gap-4 py-2 text-on-primary-container">
              <dt>Sản phẩm:</dt><dd className="text-right text-champagne-light">{product.name} · {product.storeName}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2 text-on-primary-container">
              <dt>Đơn giá niêm yết:</dt><dd className="text-champagne-light">{formatVnd(unit)}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2 text-on-primary-container">
              <dt>Số lượng:</dt><dd className="text-champagne-light">{draft.quantity.toLocaleString('vi-VN')} hộp</dd>
            </div>
          </dl>
        ) : (
          <p className="text-on-primary-container">Chọn xưởng và bánh ở bước 2 để xem giá niêm yết.</p>
        )}
        <div className="bg-primary/70 p-space-md rounded-[0.125rem] space-y-1">
          <span className="font-label-sm text-label-sm text-on-primary-container uppercase tracking-wider block">Ngân sách theo giá niêm yết:</span>
          <span className="block font-headline-lg text-headline-lg text-champagne-light font-bold">{product ? formatVnd(subtotal) : '—'}</span>
          <p className="font-body-sm text-[11px] text-on-primary-container pt-1">
            Giá sỉ thực tế do xưởng báo trong RFQ (thường thấp hơn niêm yết khi đặt số lượng lớn).
          </p>
        </div>
        <button type="submit"
          className="w-full inline-flex items-center justify-center gap-space-xs py-3.5 bg-secondary text-on-secondary rounded-[0.125rem] font-label-md text-label-md tracking-wider uppercase hover:bg-secondary-fixed hover:text-on-secondary-fixed transition-colors shadow-md">
          <Icon name="send" className="text-[18px]" aria-hidden />
          <span>Điền vào yêu cầu báo giá</span>
        </button>
      </div>
    </form>
  )
}
