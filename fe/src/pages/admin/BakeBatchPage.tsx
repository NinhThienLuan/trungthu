import { useState, type FormEvent, type ReactNode } from 'react'
import { errorMessage } from '../../apis/http'
import { useApi } from '../../hooks/useApi'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { formatVnd } from '../../lib/format'
import { PRODUCT_TYPE_LABEL } from '../../constants'
import { sellerService, type ProductInput, type SellerProduct, type SellerProductStatus } from '../../services/sellerService'
import type { ProductType } from '../../types/product'
import { Field, TextArea, TextInput } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState, ErrorState, Notice, Spinner } from '../../components/ui/States'

const STATUS_LABEL: Record<SellerProductStatus, string> = { DRAFT: 'Nháp', ACTIVE: 'Đang bán', SOLD_OUT: 'Hết hàng', ARCHIVED: 'Đã lưu trữ' }
// ponytail: set quà (GIFT_SET) cần phối hộp + bánh, chưa làm form ở đây; thêm khi seller cần tự đóng set trên web
const CREATABLE: ProductType[] = ['LOOSE_CAKE', 'BOX_SHELL', 'GREETING_CARD', 'ADDON_SERVICE']

type Form = Record<string, string>
const read = (e: FormEvent<HTMLFormElement>): Form => {
  e.preventDefault()
  return Object.fromEntries(new FormData(e.currentTarget)) as Form
}
const optionalNumber = (value?: string) => (value ? Number(value) : undefined)
const MAX_IMAGE_BYTES = 1_400_000 // data URI base64 dài thêm ~1/3, BE nhận tối đa 2.000.000 ký tự
const readDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result as string)
  reader.onerror = () => reject(reader.error)
  reader.readAsDataURL(file)
})

/** Seller: sản phẩm, phân loại (SKU), nhập kho, báo hết hàng, mở bán / lưu trữ */
export function BakeBatchPage() {
  useDocumentTitle('Menu & kho')
  const { data, loading, error, reload } = useApi(() => sellerService.products(), [])
  const [creating, setCreating] = useState(false)
  const [notice, setNotice] = useState<{ ok: boolean; text: string }>()

  /** Gọi API, báo kết quả, tải lại danh sách. Trả về true nếu thành công */
  const run = async (action: () => Promise<unknown>, done: string) => {
    setNotice(undefined)
    try {
      await action()
      setNotice({ ok: true, text: done })
      reload()
      return true
    } catch (err) {
      setNotice({ ok: false, text: errorMessage(err) })
      return false
    }
  }

  const products = (data ?? []).filter((p) => p.status !== 'ARCHIVED')

  return (
    <div className="page section flex flex-col gap-6">
      <PageHeader eyebrow="Gian hàng" title="Menu & kho"
        description="Sản phẩm mới ở trạng thái nháp: thêm ảnh và ít nhất một phân loại (kèm tồn ban đầu) rồi bấm Mở bán."
        action={<button type="button" className="btn btn-primary" onClick={() => setCreating(!creating)}>{creating ? 'Đóng' : 'Thêm sản phẩm'}</button>} />

      {notice && <Notice tone={notice.ok ? 'success' : 'danger'}>{notice.text}</Notice>}

      {creating && (
        <form noValidate className="card grid gap-4 p-5 sm:grid-cols-2" onSubmit={async (e) => {
          const f = read(e)
          const ok = await run(() => sellerService.createProduct({ name: f.name, description: f.description || undefined, productType: f.productType as ProductType }), 'Đã tạo sản phẩm nháp.')
          if (ok) setCreating(false)
        }}>
          <TextInput label="Tên sản phẩm" name="name" required />
          <Field label="Loại" name="productType">
            <select id="productType" name="productType" className="input" defaultValue="LOOSE_CAKE">
              {CREATABLE.map((t) => <option key={t} value={t}>{PRODUCT_TYPE_LABEL[t]}</option>)}
            </select>
          </Field>
          <TextArea label="Mô tả" name="description" className="sm:col-span-2" rows={3} />
          <button type="submit" className="btn btn-primary self-start">Tạo sản phẩm</button>
        </form>
      )}

      {loading && !data ? <Spinner /> : error ? <ErrorState message={error} onRetry={reload} />
        : products.length === 0 ? <EmptyState title="Chưa có sản phẩm nào" /> : (
          <div className="flex flex-col gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} run={run} />)}
          </div>
        )}
    </div>
  )
}

type Panel = { kind: 'variant' } | { kind: 'import' | 'out'; variantId: string }

function ProductCard({ product: p, run }: { product: SellerProduct; run: (action: () => Promise<unknown>, done: string) => Promise<boolean> }) {
  const [panel, setPanel] = useState<Panel>()
  const toggle = (next: Panel) => setPanel(JSON.stringify(panel) === JSON.stringify(next) ? undefined : next)
  const input = (status: ProductInput['status']): ProductInput => ({ name: p.name, description: p.description ?? undefined, productType: p.productType, status })
  const close = (ok: boolean) => ok && setPanel(undefined)
  const isSet = p.productType === 'GIFT_SET'

  return (
    <article className="card flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-start gap-4">
        <label className="group relative size-16 shrink-0 cursor-pointer overflow-hidden rounded-sm border border-line bg-champagne/30 text-center text-small text-muted"
          title={p.primaryImageUrl ? 'Đổi ảnh' : 'Thêm ảnh (bắt buộc trước khi mở bán)'}>
          {p.primaryImageUrl ? <img src={p.primaryImageUrl} alt="" className="size-full object-cover" /> : <span className="flex size-full items-center justify-center">+ Ảnh</span>}
          <input type="file" accept="image/*" className="sr-only" aria-label={`Ảnh của ${p.name}`} onChange={async (e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (!file) return
            if (file.size > MAX_IMAGE_BYTES) return run(() => Promise.reject(new Error('Ảnh tối đa khoảng 1,4MB.')), '')
            await run(async () => sellerService.setImage(p.id, await readDataUrl(file)), `Đã cập nhật ảnh "${p.name}".`)
          }} />
        </label>
        <div className="min-w-0 flex-1">
          <h2 className="text-h3">{p.name}</h2>
          <p className="text-small text-muted">{PRODUCT_TYPE_LABEL[p.productType]} · {STATUS_LABEL[p.status]}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {p.status === 'DRAFT' && (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => run(() => sellerService.updateProduct(p.id, input('ACTIVE')), `Đã mở bán "${p.name}".`)}>Mở bán</button>
          )}
          {!isSet && <button type="button" className="btn btn-outline btn-sm" onClick={() => toggle({ kind: 'variant' })}>Thêm phân loại</button>}
          <button type="button" className="btn btn-ghost btn-sm text-danger"
            onClick={() => window.confirm(`Lưu trữ "${p.name}"? Sản phẩm sẽ ẩn khỏi cửa hàng.`) && run(() => sellerService.archiveProduct(p.id), `Đã lưu trữ "${p.name}".`)}>
            Lưu trữ
          </button>
        </div>
      </div>

      {isSet ? <p className="text-small text-muted">Set quà: giá và số set đóng sẵn quản lý theo công thức set.</p>
        : p.variants.length === 0 ? <p className="text-small text-muted">Chưa có phân loại nào.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-small">
              <thead className="text-left text-muted">
                <tr><th className="py-2">Phân loại / SKU</th><th className="text-right">Giá</th><th className="text-right">Tồn</th><th className="text-right">Thao tác</th></tr>
              </thead>
              <tbody>
                {p.variants.map((v) => (
                  <tr key={v.id} className="border-t border-line">
                    <td className="py-2">{v.variantName}<span className="block text-muted">{v.sku}</span></td>
                    <td className="text-right">{formatVnd(v.price)}</td>
                    <td className="text-right">{v.status === 'OUT_OF_STOCK' ? <span className="text-danger">Hết hàng</span> : v.stockQuantity}</td>
                    <td className="py-2 text-right">
                      {p.status !== 'DRAFT' && <button type="button" className="btn btn-ghost btn-sm" onClick={() => toggle({ kind: 'import', variantId: v.id })}>Nhập kho</button>}
                      {v.status === 'IN_STOCK' && <button type="button" className="btn btn-ghost btn-sm" onClick={() => toggle({ kind: 'out', variantId: v.id })}>Báo hết</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {panel?.kind === 'variant' && (
        <InlineForm submitLabel="Thêm phân loại" onSubmit={async (f) => close(await run(() => sellerService.addVariant(p.id, {
          variantName: f.variantName, sku: f.sku, price: Number(f.price), stockQuantity: optionalNumber(f.stockQuantity),
          weightGram: optionalNumber(f.weightGram), boxCapacity: optionalNumber(f.boxCapacity),
        }), 'Đã thêm phân loại.'))}>
          <TextInput label="Tên phân loại" name="variantName" placeholder="Hộp 4 bánh 150g" required />
          <TextInput label="SKU" name="sku" placeholder="KD-THAPCAM-150" required />
          <TextInput label="Giá (đ)" name="price" type="number" min={0} required />
          <TextInput label="Tồn ban đầu" name="stockQuantity" type="number" min={0} defaultValue={0} />
          {p.productType === 'LOOSE_CAKE' && <TextInput label="Khối lượng (gram)" name="weightGram" type="number" min={1} required />}
          {p.productType === 'BOX_SHELL' && <TextInput label="Sức chứa (số bánh)" name="boxCapacity" type="number" min={1} required />}
        </InlineForm>
      )}
      {panel?.kind === 'import' && (
        <InlineForm submitLabel="Nhập kho" onSubmit={async (f) => close(await run(() => sellerService.importStock(p.id, panel.variantId, Number(f.quantity), f.reason), 'Đã nhập kho.'))}>
          <TextInput label="Số lượng nhập" name="quantity" type="number" min={1} required />
          <TextInput label="Lý do" name="reason" defaultValue="Mẻ nướng mới" required />
        </InlineForm>
      )}
      {panel?.kind === 'out' && (
        <InlineForm submitLabel="Báo hết hàng" onSubmit={async (f) => close(await run(() => sellerService.markOutOfStock(p.id, panel.variantId, f.reason), 'Đã báo hết hàng.'))}>
          <TextInput label="Lý do" name="reason" placeholder="Hết mẻ trong ngày" required />
        </InlineForm>
      )}
    </article>
  )
}

function InlineForm({ submitLabel, onSubmit, children }: { submitLabel: string; onSubmit: (f: Form) => void; children: ReactNode }) {
  return (
    <form noValidate className="grid gap-3 border-t border-line pt-4 sm:grid-cols-3" onSubmit={(e) => onSubmit(read(e))}>
      {children}
      <button type="submit" className="btn btn-primary self-end">{submitLabel}</button>
    </form>
  )
}
