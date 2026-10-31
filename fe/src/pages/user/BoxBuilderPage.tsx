import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { cn, formatVnd } from '../../lib/format'
import { ROUTES } from '../../constants'
import { productService } from '../../services/productService'
import { useCartStore, type BoxSlot } from '../../stores/cartStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { QuantityStepper } from '../../components/ui/QuantityStepper'
import { EmptyState, ErrorState, Notice, Spinner } from '../../components/ui/States'
import type { Product, ProductVariant } from '../../types/product'

interface BoxOption { product: Product; variant: ProductVariant }

/**
 * Tự phối hộp: vỏ hộp N ô (BOX_SHELL) của một xưởng + một bánh lẻ của chính xưởng đó cho mỗi ô.
 * Giá 1 hộp = giá vỏ + giá từng bánh (BE tính y như vậy và trừ kho bánh; vị ghi vào dòng đơn — Item.boxContents).
 */
export function BoxBuilderPage() {
  useDocumentTitle('Tự phối hộp quà')
  // ponytail: một trang 100 sản phẩm mỗi loại đủ cho catalog hiện tại; cần API lọc theo xưởng khi danh mục lớn hơn
  // Danh mục chung không có vỏ hộp (chỉ bán kèm bánh) -> tải riêng theo loại
  const { data, loading, error, reload } = useApi(async () => {
    const [shells, cakes] = await Promise.all([
      productService.list({ type: 'BOX_SHELL', size: 100 }), productService.list({ type: 'LOOSE_CAKE', size: 100 })])
    return [...shells.content, ...cakes.content]
  }, [])
  const { items, addBox, setQuantity } = useCartStore()
  const [providerId, setProviderId] = useState<string>()
  const [boxId, setBoxId] = useState<string>()
  const [slots, setSlots] = useState<Array<BoxSlot | null>>([])
  const [active, setActive] = useState(0)
  const [quantity, setQty] = useState(1)
  const [notice, setNotice] = useState<{ ok: boolean; text: string }>()

  if (loading && !data) return <Spinner />
  if (error) return <div className="page section"><ErrorState message={error} onRetry={reload} /></div>

  const products = (data ?? []).filter((p) => p.status === 'ACTIVE')
  const boxes: BoxOption[] = products.filter((p) => p.productType === 'BOX_SHELL')
    .flatMap((product) => product.variants.filter((v) => (v.boxCapacity ?? 0) > 0 && v.stockQuantity > 0).map((variant) => ({ product, variant })))
  const shops = [...new Map(boxes.map((b) => [b.product.providerId, b.product.storeName])).entries()]
  const shop = providerId ?? shops[0]?.[0]
  const shopBoxes = boxes.filter((b) => b.product.providerId === shop)
  const box = shopBoxes.find((b) => b.variant.id === boxId) ?? shopBoxes[0]
  const cakes = products.filter((p) => p.providerId === shop && p.productType === 'LOOSE_CAKE')
    .flatMap((product) => product.variants.filter((v) => v.stockQuantity > 0).map((variant) => ({ product, variant })))
  const capacity = box?.variant.boxCapacity ?? 0
  const filled = slots.slice(0, capacity)
  const isFull = capacity > 0 && filled.length === capacity && filled.every(Boolean)
  // Giá 1 hộp = vỏ + các bánh đã chọn
  const cakesTotal = filled.reduce((sum, s) => sum + (s?.unitPrice ?? 0), 0)
  const boxTotal = (box?.variant.price ?? 0) + cakesTotal

  const pickBox = (option: BoxOption) => {
    setBoxId(option.variant.id)
    setSlots([])
    setActive(0)
    setNotice(undefined)
  }
  const pickShop = (id: string) => {
    setProviderId(id)
    setBoxId(undefined)
    setSlots([])
    setActive(0)
  }
  const fill = (cake: (typeof cakes)[number]) => {
    const slot: BoxSlot = { variantId: cake.variant.id, productName: cake.product.name, variantName: cake.variant.variantName,
      unitPrice: cake.variant.price, imageUrl: cake.product.imageUrl }
    const next = Array.from({ length: capacity }, (_, i) => slots[i] ?? null)
    next[active] = slot
    setSlots(next)
    // Sang ô trống kế tiếp (nếu có)
    const after = next.findIndex((s, i) => !s && i > active)
    const anyEmpty = next.findIndex((s) => !s)
    setActive(after >= 0 ? after : anyEmpty >= 0 ? anyEmpty : active)
  }

  const addToCart = () => {
    if (!box || !isFull) return
    const chosen = filled as BoxSlot[]
    const signature = chosen.map((s) => s.variantId).sort().join()
    const existing = items.find((i) => i.kind === 'box' && i.variantId === box.variant.id)
    if (existing) {
      // BE: mỗi loại hộp một cấu hình vị trong một đơn của xưởng
      if ((existing.slots ?? []).map((s) => s.variantId).sort().join() !== signature) {
        setNotice({ ok: false, text: `Giỏ đã có "${box.variant.variantName}" với vị khác. Mỗi loại hộp chỉ phối một kiểu vị trong một đơn — hãy xoá hộp cũ trong giỏ hoặc chọn loại hộp khác.` })
        return
      }
      setQuantity(existing.lineId, existing.quantity + quantity)
    } else {
      addBox({
        variantId: box.variant.id, productId: box.product.id, providerId: box.product.providerId, storeName: box.product.storeName,
        productName: `${box.product.name} (tự phối)`, variantName: box.variant.variantName, unitPrice: boxTotal,
        stock: box.variant.stockQuantity, imageUrl: box.product.imageUrl, slots: chosen,
        priceLines: [{ label: `Vỏ hộp ${box.variant.variantName}`, amount: box.variant.price },
          { label: `${capacity} bánh trong hộp`, amount: cakesTotal }],
      }, quantity)
    }
    setNotice({ ok: true, text: `Đã thêm ${quantity} hộp vào giỏ.` })
  }

  if (boxes.length === 0) {
    return <div className="page section"><EmptyState title="Chưa có xưởng nào mở bán hộp để tự phối" action={<Link to={ROUTES.products} className="btn btn-outline">Xem bộ sưu tập</Link>} /></div>
  }

  return (
    <div className="page section flex flex-col gap-6">
      <PageHeader eyebrow="Quà tặng" title="Tự phối hộp quà"
        description="Chọn xưởng và loại hộp, rồi chọn bánh cho từng ô. Giá 1 hộp = giá vỏ hộp + giá từng chiếc bánh." />

      <section className="card flex flex-col gap-4 p-5">
        <h2 className="text-h3">1. Xưởng & loại hộp</h2>
        <div className="flex flex-wrap gap-2">
          {shops.map(([id, name]) => (
            <button key={id} type="button" className={cn('chip', shop === id && 'chip-active')} onClick={() => pickShop(id)}>{name}</button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shopBoxes.map((option) => (
            <button key={option.variant.id} type="button" onClick={() => pickBox(option)}
              className={cn('flex items-center gap-3 rounded-sm border p-3 text-left', box?.variant.id === option.variant.id ? 'border-navy bg-champagne/40' : 'border-line')}>
              {option.product.imageUrl && <img src={option.product.imageUrl} alt="" className="size-14 rounded-sm object-cover" />}
              <span>
                <span className="block font-semibold text-navy">{option.product.name} · {option.variant.variantName}</span>
                <span className="block text-small text-muted">{option.variant.boxCapacity} ô · vỏ hộp {formatVnd(option.variant.price)}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {box && (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <section className="card flex flex-col gap-4 p-5">
            <h2 className="text-h3">2. Các ô trong hộp ({filled.filter(Boolean).length}/{capacity})</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: capacity }, (_, i) => {
                const slot = slots[i]
                return (
                  <button key={i} type="button" onClick={() => setActive(i)} aria-pressed={active === i}
                    className={cn('flex aspect-square flex-col items-center justify-center gap-1 rounded-sm border-2 p-2 text-center text-small',
                      active === i ? 'border-navy' : 'border-dashed border-line', slot && 'bg-champagne/40')}>
                    {slot ? <><span className="font-semibold text-navy">{slot.productName}</span><span className="text-muted">{slot.variantName}</span></>
                      : <span className="text-muted">Ô {i + 1}<br />Chọn vị</span>}
                  </button>
                )
              })}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-small">Số hộp</span>
              <QuantityStepper value={quantity} max={Math.max(1, box.variant.stockQuantity)} onChange={setQty} />
              <span className="ml-auto font-serif text-h3 text-navy">{formatVnd(boxTotal * quantity)}</span>
            </div>
            <dl className="flex flex-col gap-0.5 rounded-sm bg-champagne/30 p-3 text-small">
              <div className="flex justify-between"><dt>Vỏ hộp {box.variant.variantName}</dt><dd>{formatVnd(box.variant.price)}</dd></div>
              {filled.map((s, i) => s && (
                <div key={i} className="flex justify-between text-muted"><dt>Ô {i + 1}: {s.productName} · {s.variantName}</dt><dd>{formatVnd(s.unitPrice)}</dd></div>
              ))}
              <div className="flex justify-between border-t border-line pt-1 font-semibold"><dt>Giá 1 hộp</dt><dd>{formatVnd(boxTotal)}</dd></div>
            </dl>
            {notice && <Notice tone={notice.ok ? 'success' : 'danger'}>{notice.text}</Notice>}
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-primary" disabled={!isFull} onClick={addToCart}>
                {isFull ? 'Thêm vào giỏ' : `Chọn thêm ${capacity - filled.filter(Boolean).length} vị`}
              </button>
              {notice?.ok && <Link to={ROUTES.cart} className="btn btn-outline">Xem giỏ hàng</Link>}
              <button type="button" className="btn btn-ghost" onClick={() => { setSlots([]); setActive(0) }}>Làm lại</button>
            </div>
          </section>

          <section className="card flex flex-col gap-3 p-5">
            <h2 className="text-h3">3. Chọn vị cho ô {active + 1}</h2>
            {cakes.length === 0 ? <p className="text-small text-muted">Xưởng chưa có bánh lẻ đang bán.</p> : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {cakes.map((cake) => (
                  <li key={cake.variant.id}>
                    <button type="button" onClick={() => fill(cake)}
                      className="flex w-full items-center gap-3 rounded-sm border border-line p-2 text-left hover:bg-champagne/40">
                      {cake.product.imageUrl && <img src={cake.product.imageUrl} alt="" className="size-12 rounded-sm object-cover" />}
                      <span className="text-small"><span className="block font-semibold text-navy">{cake.product.name}</span>{cake.variant.variantName} · {formatVnd(cake.variant.price)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
