import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Check, Plus, X } from 'lucide-react'
import { productApi } from '../apis/products'
import { useApi } from '../hooks/useApi'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useCartStore, type BoxSlot } from '../stores/cartStore'
import { ROUTES } from '../constants'
import { cn, formatVnd } from '../lib/format'
import type { Product, ProductVariant } from '../types/product'
import { ProductThumb } from '../components/ProductThumb'
import { PageHeader } from '../components/ui/PageHeader'
import { QuantityStepper } from '../components/ui/QuantityStepper'
import { ErrorState, Notice, Spinner } from '../components/ui/States'

const NOTE_MAX = 120

interface Option {
  product: Product
  variant: ProductVariant
}

/** Danh sách (sản phẩm, biến thể) đang bán của 1 loại */
const flatten = (products: Product[]): Option[] =>
  products.flatMap((product) =>
    product.variants.filter((v) => v.status !== 'HIDDEN' && v.stockQuantity > 0).map((variant) => ({ product, variant })),
  )

async function loadCatalog() {
  const [boxes, cakes] = await Promise.all([
    productApi.list({ type: 'BOX_SHELL', size: 100 }),
    productApi.list({ type: 'LOOSE_CAKE', size: 100 }),
  ])
  return { boxes: flatten(boxes.content), cakes: flatten(cakes.content) }
}

export function BoxBuilderPage() {
  useDocumentTitle('Tự phối hộp quà')
  const [params] = useSearchParams()
  const { data, loading, error, reload } = useApi(loadCatalog, [])
  const addBox = useCartStore((s) => s.addBox)

  const [boxId, setBoxId] = useState<string | undefined>(params.get('box') ?? undefined)
  const [slots, setSlots] = useState<Array<BoxSlot | null>>([])
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')
  const [added, setAdded] = useState(false)

  const box = data?.boxes.find((o) => o.variant.id === boxId)
  const capacity = box?.variant.boxCapacity ?? 0
  // Mỗi hộp thuộc 1 xưởng -> chỉ được xếp bánh của chính xưởng đó (1 xưởng = 1 đơn)
  const providerId = box?.product.providerId ?? params.get('provider') ?? undefined
  const boxOptions = data?.boxes.filter((o) => !params.get('provider') || o.product.providerId === params.get('provider')) ?? []
  const cakeOptions = data?.cakes.filter((o) => o.product.providerId === providerId) ?? []

  // Đổi hộp -> khay đổi số ô, giữ lại các bánh còn vừa
  useEffect(() => {
    setSlots((prev) => Array.from({ length: capacity }, (_, i) => prev[i] ?? null))
  }, [capacity])

  // Vào từ trang bánh lẻ (?cake=) -> đặt sẵn bánh đó vào ô đầu khi đã chọn hộp
  const presetCake = params.get('cake')
  useEffect(() => {
    if (!presetCake || capacity === 0) return
    const cake = cakeOptions.find((o) => o.variant.id === presetCake)
    if (cake) setSlots((prev) => (prev.some(Boolean) ? prev : prev.map((s, i) => (i === 0 ? toSlot(cake) : s))))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetCake, capacity, data])

  const filled = slots.filter(Boolean) as BoxSlot[]
  const isFull = capacity > 0 && filled.length === capacity
  const countOf = (variantId: string) => filled.filter((s) => s.variantId === variantId).length

  // Số hộp tối đa = giới hạn bởi tồn kho vỏ hộp và từng vị bánh (mỗi hộp dùng countOf bánh)
  const maxQuantity = useMemo(() => {
    if (!box) return 1
    const limits = [box.variant.stockQuantity]
    for (const cake of cakeOptions) {
      const count = countOf(cake.variant.id)
      if (count > 0) limits.push(Math.floor(cake.variant.stockQuantity / count))
    }
    return Math.max(1, Math.min(...limits))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [box, cakeOptions, slots])

  useEffect(() => setQuantity((q) => Math.min(q, maxQuantity)), [maxQuantity])

  const unitPrice = (box?.variant.price ?? 0) + filled.reduce((sum, s) => sum + s.unitPrice, 0)

  const putCake = (option: Option) => {
    setAdded(false)
    setSlots((prev) => {
      const index = prev.indexOf(null)
      return index === -1 ? prev : prev.map((s, i) => (i === index ? toSlot(option) : s))
    })
  }

  const handleAdd = () => {
    if (!box || !isFull) return
    addBox(
      {
        variantId: box.variant.id,
        productId: box.product.id,
        providerId: box.product.providerId,
        storeName: box.product.storeName,
        productName: box.product.name,
        variantName: box.variant.variantName,
        unitPrice,
        stock: maxQuantity,
        imageUrl: box.product.imageUrl,
        slots: filled,
        note: note.trim() || undefined,
      },
      quantity,
    )
    setAdded(true)
    setSlots(Array.from({ length: capacity }, () => null))
    setQuantity(1)
    setNote('')
  }

  if (loading) return <Spinner />
  if (error || !data) {
    return (
      <div className="page section">
        <ErrorState message={error ?? 'Không tải được dữ liệu'} onRetry={reload} />
      </div>
    )
  }

  return (
    <div className="page section pb-32">
      <PageHeader eyebrow="Hộp quà" title="Tự phối hộp quà" description="Chọn vỏ hộp, rồi xếp vị bánh bạn thích vào từng ô." />

      {added && (
        <div className="mb-6">
          <Notice tone="success">
            <span className="inline-flex flex-wrap items-center gap-2">
              <Check className="size-4" aria-hidden /> Đã thêm hộp vào giỏ.
              <Link to={ROUTES.cart} className="font-semibold underline">Xem giỏ hàng</Link>
              hoặc tiếp tục phối hộp khác.
            </span>
          </Notice>
        </div>
      )}

      {/* Bước 1: chọn vỏ hộp */}
      <section aria-labelledby="step-box">
        <h2 id="step-box" className="text-h2">
          <span className="text-gold-ink">1.</span> Chọn vỏ hộp
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {boxOptions.map(({ product, variant }) => {
            const selected = variant.id === boxId
            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => {
                  setBoxId(variant.id)
                  setAdded(false)
                  // Đổi sang hộp của xưởng khác thì bánh cũ không còn hợp lệ
                  if (box && box.product.providerId !== product.providerId) {
                    setSlots(Array.from({ length: variant.boxCapacity ?? 0 }, () => null))
                  }
                }}
                aria-pressed={selected}
                className={cn('card p-2 text-left transition-shadow hover:shadow-card-hover', selected && 'border-navy ring-2 ring-navy')}
              >
                <ProductThumb type="BOX_SHELL" name={product.name} src={product.imageUrl} />
                <p className="mt-2 line-clamp-1 text-small font-semibold text-navy">{product.name}</p>
                <p className="text-small text-muted">
                  {variant.variantName} · {formatVnd(variant.price)}
                </p>
                <p className="line-clamp-1 text-small text-muted">{product.storeName}</p>
              </button>
            )
          })}
        </div>
      </section>

      {box && (
        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1fr]">
          {/* Khay bánh */}
          <section aria-labelledby="step-tray" className="rounded-md bg-navy p-5 md:p-6">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="step-tray" className="text-h3 text-white">
                <span className="text-gold">2.</span> Khay bánh
              </h2>
              <p className="text-small text-white/70" aria-live="polite">
                Đã xếp <strong className="text-gold">{filled.length}/{capacity}</strong>
              </p>
            </div>
            <div className={cn('mt-5 grid gap-3', capacity === 6 ? 'grid-cols-3' : 'grid-cols-2')}>
              {slots.map((slot, i) =>
                slot ? (
                  <div key={i} className="relative overflow-hidden rounded-sm border border-gold/50 bg-navy-deep">
                    <ProductThumb type="LOOSE_CAKE" name={slot.productName} src={slot.imageUrl} className="rounded-none" />
                    <p className="line-clamp-2 p-2 text-small text-white">
                      {slot.productName} <span className="text-white/60">{slot.variantName}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => setSlots((prev) => prev.map((s, j) => (j === i ? null : s)))}
                      className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-navy-deep/80 text-white hover:text-gold"
                      aria-label={`Bỏ ${slot.productName} khỏi ô ${i + 1}`}
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    key={i}
                    className="flex aspect-square flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-gold/40 text-white/50"
                  >
                    <Plus className="size-5" aria-hidden />
                    <span className="text-small">Ô {i + 1}</span>
                  </div>
                ),
              )}
            </div>
          </section>

          {/* Thư viện vị bánh của cùng xưởng */}
          <section aria-labelledby="step-cakes">
            <h2 id="step-cakes" className="text-h3">
              <span className="text-gold-ink">3.</span> Chọn vị bánh
            </h2>
            <p className="mt-1 text-small text-muted">Bánh của {box.product.storeName}</p>
            {cakeOptions.length === 0 ? (
              <p className="mt-4 text-muted">Xưởng này chưa có bánh lẻ đang bán.</p>
            ) : (
              <ul className="mt-4 flex flex-col gap-3">
                {cakeOptions.map((option) => {
                  const used = countOf(option.variant.id)
                  const outOfStock = (used + 1) * quantity > option.variant.stockQuantity
                  return (
                    <li key={option.variant.id} className="card flex items-center gap-3 p-3">
                      <ProductThumb type="LOOSE_CAKE" name={option.product.name} src={option.product.imageUrl} className="size-16 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 font-semibold text-navy">{option.product.name}</p>
                        <p className="text-small text-muted">
                          {option.variant.variantName} · {formatVnd(option.variant.price)}
                          {used > 0 && <span className="text-gold-ink"> · đã chọn {used}</span>}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => putCake(option)}
                        disabled={isFull || outOfStock}
                        aria-label={`Thêm ${option.product.name} ${option.variant.variantName} vào khay`}
                      >
                        <Plus className="size-4" aria-hidden /> Vào khay
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}

            <div className="mt-6">
              <label htmlFor="note" className="field-label">
                Lời chúc in kèm (không bắt buộc)
              </label>
              <textarea
                id="note"
                rows={2}
                maxLength={NOTE_MAX}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="input resize-none"
                placeholder="VD: Chúc gia đình Trung Thu an khang"
              />
              <p className="mt-1 text-right text-small text-muted">
                {note.length}/{NOTE_MAX}
              </p>
            </div>
          </section>
        </div>
      )}

      {/* Thanh tổng kết cố định cuối màn hình */}
      {box && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gold/30 bg-navy-deep">
          <div className="page flex flex-wrap items-center gap-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-small text-white/70">
                {box.product.name} · {box.variant.variantName}
              </p>
              <p className="font-serif text-h3 text-gold">{formatVnd(unitPrice * quantity)}</p>
            </div>
            <QuantityStepper value={quantity} max={maxQuantity} onChange={setQuantity} size="sm" />
            <button type="button" className="btn border-gold bg-gold text-navy hover:bg-champagne" disabled={!isFull} onClick={handleAdd}>
              {isFull ? 'Thêm vào giỏ' : `Còn ${capacity - filled.length} ô trống`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const toSlot = ({ product, variant }: Option): BoxSlot => ({
  variantId: variant.id,
  productName: product.name,
  variantName: variant.variantName,
  unitPrice: variant.price,
  imageUrl: product.imageUrl,
})
