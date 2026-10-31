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
const CREATABLE: ProductType[] = ['LOOSE_CAKE', 'BOX_SHELL', 'GIFT_SET', 'GREETING_CARD', 'ADDON_SERVICE']

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
    <div className="page section flex flex-col gap-6 font-sans [&_h1]:font-sans [&_h2]:font-sans [&_h3]:font-sans">
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
            {products.map((p) => <ProductCard key={p.id} product={p} catalog={products} run={run} />)}
          </div>
        )}
    </div>
  )
}

type Panel = { kind: 'variant' | 'info' | 'recipe' | 'pack' } | { kind: 'import' | 'out' | 'edit'; variantId: string }

function ProductCard({ product: p, catalog, run }: { product: SellerProduct; catalog: SellerProduct[]; run: (action: () => Promise<unknown>, done: string) => Promise<boolean> }) {
  const [panel, setPanel] = useState<Panel>()
  const toggle = (next: Panel) => setPanel(JSON.stringify(panel) === JSON.stringify(next) ? undefined : next)
  // BE ghi đè mọi trường khi sửa -> luôn gửi lại mô tả, câu chuyện, nguyên liệu hiện có
  const input = (status: ProductInput['status']): ProductInput => ({
    name: p.name, description: p.description ?? undefined, story: p.story ?? undefined, ingredients: p.ingredients ?? undefined,
    salePrice: p.salePrice ?? undefined, productType: p.productType, status,
  })
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
          <button type="button" className="btn btn-outline btn-sm" onClick={() => toggle({ kind: 'info' })}>Sửa thông tin</button>
          {!isSet && <button type="button" className="btn btn-outline btn-sm" onClick={() => toggle({ kind: 'variant' })}>Thêm phân loại</button>}
          <button type="button" className="btn btn-ghost btn-sm text-danger"
            onClick={() => window.confirm(`Lưu trữ "${p.name}"? Sản phẩm sẽ ẩn khỏi cửa hàng.`) && run(() => sellerService.archiveProduct(p.id), `Đã lưu trữ "${p.name}".`)}>
            Lưu trữ
          </button>
        </div>
      </div>

      {isSet ? <SetSummary set={p} onRecipe={() => toggle({ kind: 'recipe' })} onPack={() => toggle({ kind: 'pack' })}
          onRelease={() => window.confirm('Trả toàn bộ set đã đóng về kho thành phần?') && run(() => sellerService.releaseSets(p.id), 'Đã trả set về kho.')} />
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
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => toggle({ kind: 'edit', variantId: v.id })}>Sửa</button>
                      {p.status !== 'DRAFT' && <button type="button" className="btn btn-ghost btn-sm" onClick={() => toggle({ kind: 'import', variantId: v.id })}>Nhập kho</button>}
                      {v.status === 'IN_STOCK' && <button type="button" className="btn btn-ghost btn-sm" onClick={() => toggle({ kind: 'out', variantId: v.id })}>Báo hết</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {panel?.kind === 'recipe' && <RecipeForm set={p} catalog={catalog} onSave={async (box, cakes) => close(await run(() => sellerService.saveSetRecipe(p.id, box, cakes), 'Đã lưu công thức set.'))} />}
      {panel?.kind === 'pack' && (
        <InlineForm submitLabel="Đóng set" onSubmit={async (f) => close(await run(() => sellerService.packSets(p.id, Number(f.setCount), f.reason || undefined), `Đã đóng ${f.setCount} set.`))}>
          <TextInput label={p.status === 'DRAFT' ? 'Số set ban đầu' : 'Đóng thêm (set)'} name="setCount" type="number" min={1} defaultValue={10} required />
          {p.status !== 'DRAFT' && <TextInput label="Lý do" name="reason" defaultValue="Đóng thêm set" required />}
        </InlineForm>
      )}
      {panel?.kind === 'info' && (
        <form noValidate className="grid gap-3 border-t border-line pt-4" onSubmit={async (e) => {
          const f = read(e)
          close(await run(() => sellerService.updateProduct(p.id, {
            name: f.name, description: f.description || undefined, story: f.story || undefined,
            ingredients: f.ingredients || undefined, productType: p.productType,
            salePrice: isSet ? optionalNumber(f.salePrice) : undefined,
          }), `Đã cập nhật thông tin "${f.name}".`))
        }}>
          <TextInput label="Tên sản phẩm" name="name" defaultValue={p.name} required />
          {isSet && <TextInput label={`Giá bán set (đ) — phải nhỏ hơn giá gốc ${formatVnd(p.listPrice ?? 0)}`} name="salePrice" type="number" min={0} defaultValue={p.salePrice ?? ''} />}
          <TextArea label="Mô tả ngắn" name="description" defaultValue={p.description ?? ''} rows={2} />
          <TextArea label="Câu chuyện sản phẩm (hiện ở tab Câu chuyện)" name="story" defaultValue={p.story ?? ''} rows={4}
            placeholder="Nguồn gốc công thức, nghệ nhân, cách làm..." />
          <TextArea label="Nguyên liệu & dinh dưỡng (hiện ở tab Dinh dưỡng)" name="ingredients" defaultValue={p.ingredients ?? ''} rows={4}
            placeholder="Nguyên liệu, năng lượng (kcal), chất gây dị ứng, cách bảo quản..." />
          <button type="submit" className="btn btn-primary self-start">Lưu thông tin</button>
        </form>
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
      {panel?.kind === 'edit' && (() => {
        const v = p.variants.find((x) => x.id === panel.variantId)
        if (!v) return null
        return (
          <InlineForm key={v.id} submitLabel="Lưu phân loại" onSubmit={async (f) => close(await run(() => sellerService.updateVariant(p.id, v.id, {
            variantName: f.variantName, sku: v.sku, price: Number(f.price),
            stockQuantity: p.status === 'DRAFT' ? optionalNumber(f.stockQuantity) : undefined,
            weightGram: v.weightGram ?? undefined, boxCapacity: v.boxCapacity ?? undefined,
          }), `Đã cập nhật "${f.variantName}".`))}>
            <TextInput label="Tên phân loại" name="variantName" defaultValue={v.variantName} required />
            <TextInput label="Giá (đ)" name="price" type="number" min={0} defaultValue={v.price} required />
            {p.status === 'DRAFT' && <TextInput label="Tồn ban đầu" name="stockQuantity" type="number" min={0} defaultValue={v.stockQuantity ?? 0} />}
          </InlineForm>
        )
      })()}
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

/** Set quà: công thức hiện tại, số set đã đóng, giá */
function SetSummary({ set, onRecipe, onPack, onRelease }: { set: SellerProduct; onRecipe: () => void; onPack: () => void; onRelease: () => void }) {
  const parts = set.components ?? []
  return (
    <div className="flex flex-col gap-2 text-small">
      {parts.length === 0
        ? <p className="text-muted">Chưa có công thức: chọn 1 hộp và các loại bánh lẻ cho mỗi set.</p>
        : <p>Mỗi set: {parts.map((c) => `${c.productName} ${c.variantName} ×${c.perSetQuantity ?? 1}`).join(' + ')}</p>}
      <p className="text-muted">
        Đã đóng {set.assembledQuantity ?? 0} set · giá gốc {formatVnd(set.listPrice ?? 0)}
        {set.salePrice ? ` · giá bán ${formatVnd(set.salePrice)}` : ' · chưa đặt giá bán (Sửa thông tin)'}
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-outline btn-sm" onClick={onRecipe}>{parts.length ? 'Đổi công thức' : 'Lập công thức'}</button>
        {parts.length > 0 && <button type="button" className="btn btn-outline btn-sm" onClick={onPack}>Đóng set</button>}
        {(set.assembledQuantity ?? 0) > 0 && <button type="button" className="btn btn-ghost btn-sm text-danger" onClick={onRelease}>Trả set về kho</button>}
      </div>
    </div>
  )
}

/** Công thức set: 1 hộp (sức chứa N) + số bánh từng loại, tổng = N. BE kiểm tra lại */
function RecipeForm({ set, catalog, onSave }: { set: SellerProduct; catalog: SellerProduct[]; onSave: (box: string, cakes: Array<{ variantId: string; quantity: number }>) => void }) {
  const boxes = catalog.filter((p) => p.productType === 'BOX_SHELL').flatMap((p) => p.variants.filter((v) => (v.boxCapacity ?? 0) > 0).map((v) => ({ p, v })))
  const cakes = catalog.filter((p) => p.productType === 'LOOSE_CAKE').flatMap((p) => p.variants.map((v) => ({ p, v })))
  const current = set.components ?? []
  const [box, setBox] = useState(current.find((c) => c.productType === 'BOX_SHELL')?.variantId ?? boxes[0]?.v.id ?? '')
  const [qty, setQty] = useState<Record<string, number>>(() => Object.fromEntries(
    current.filter((c) => c.productType === 'LOOSE_CAKE').map((c) => [c.variantId, c.perSetQuantity ?? 0])))
  const capacity = boxes.find((b) => b.v.id === box)?.v.boxCapacity ?? 0
  const total = Object.values(qty).reduce((a, b) => a + b, 0)
  if (boxes.length === 0 || cakes.length === 0) {
    return <p className="border-t border-line pt-4 text-small text-muted">Cần có ít nhất một sản phẩm Hộp quà (có sức chứa) và một Bánh lẻ để lập công thức set.</p>
  }
  return (
    <div className="flex flex-col gap-3 border-t border-line pt-4 text-small">
      <Field label="Hộp" name={`box-${set.id}`}>
        <select id={`box-${set.id}`} className="input" value={box} onChange={(e) => setBox(e.target.value)}>
          {boxes.map(({ p, v }) => <option key={v.id} value={v.id}>{p.name} · {v.variantName} ({v.boxCapacity} bánh)</option>)}
        </select>
      </Field>
      <p className="field-label">Bánh trong mỗi set ({total}/{capacity})</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {cakes.map(({ p, v }) => (
          <li key={v.id} className="flex items-center justify-between gap-2">
            <span>{p.name} · {v.variantName}</span>
            <input type="number" min={0} className="input w-20 text-right" aria-label={`Số ${p.name} ${v.variantName} mỗi set`} value={qty[v.id] ?? 0}
              onChange={(e) => setQty((q) => ({ ...q, [v.id]: Math.max(0, Math.floor(Number(e.target.value) || 0)) }))} />
          </li>
        ))}
      </ul>
      <button type="button" className="btn btn-primary self-start" disabled={total !== capacity}
        onClick={() => onSave(box, Object.entries(qty).filter(([, n]) => n > 0).map(([variantId, quantity]) => ({ variantId, quantity })))}>
        {total === capacity ? 'Lưu công thức' : `Cần đủ ${capacity} bánh`}
      </button>
    </div>
  )
}
