import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, ChevronLeft, ShoppingBag } from 'lucide-react'
import { productApi } from '../apis/products'
import { useApi } from '../hooks/useApi'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useCartStore } from '../stores/cartStore'
import { PRODUCT_TYPE_LABEL, ROUTES } from '../constants'
import { cn, formatVnd } from '../lib/format'
import { ProductThumb } from '../components/ProductThumb'
import { QuantityStepper } from '../components/ui/QuantityStepper'
import { ErrorState, Notice, Spinner } from '../components/ui/States'

export function ProductDetailPage() {
  const { id = '' } = useParams()
  const { data: product, loading, error, reload } = useApi(() => productApi.detail(id), [id])
  const add = useCartStore((s) => s.add)
  const [variantId, setVariantId] = useState<string>()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  useDocumentTitle(product?.name)

  // Mặc định chọn biến thể còn hàng đầu tiên
  useEffect(() => {
    if (product) setVariantId(product.variants.find((v) => v.stockQuantity > 0)?.id ?? product.variants[0]?.id)
  }, [product])

  if (loading) return <Spinner />
  if (error || !product) {
    return (
      <div className="page section">
        <ErrorState message={error ?? 'Không tìm thấy sản phẩm'} onRetry={reload} />
      </div>
    )
  }

  const variant = product.variants.find((v) => v.id === variantId)
  const inStock = !!variant && variant.stockQuantity > 0

  const handleAdd = () => {
    if (!variant) return
    add(
      {
        variantId: variant.id,
        productId: product.id,
        providerId: product.providerId,
        storeName: product.storeName,
        productName: product.name,
        variantName: variant.variantName,
        unitPrice: variant.price,
        stock: variant.stockQuantity,
      },
      quantity,
    )
    setAdded(true)
  }

  return (
    <div className="page section">
      <Link to={ROUTES.products} className="mb-6 inline-flex items-center gap-1 text-small text-muted hover:text-navy">
        <ChevronLeft className="size-4" aria-hidden /> Bộ sưu tập
      </Link>

      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <ProductThumb type={product.productType} name={product.name} className="card" />

        <div>
          <p className="eyebrow">{PRODUCT_TYPE_LABEL[product.productType]}</p>
          <h1 className="mt-2 text-h1">{product.name}</h1>
          <p className="mt-2 text-small text-muted">Xưởng: {product.storeName}</p>

          <p className="mt-6 font-serif text-h1 text-navy">{variant ? formatVnd(variant.price) : '—'}</p>

          {product.variants.length > 0 && (
            <fieldset className="mt-6">
              <legend className="field-label">Chọn quy cách</legend>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const soldOut = v.stockQuantity <= 0
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={soldOut}
                      onClick={() => {
                        setVariantId(v.id)
                        setQuantity(1)
                        setAdded(false)
                      }}
                      aria-pressed={v.id === variantId}
                      className={cn(
                        'rounded-sm border px-4 py-2 text-left text-small transition-colors',
                        v.id === variantId ? 'border-navy bg-navy text-gold' : 'border-line bg-white text-navy hover:border-gold',
                        soldOut && 'cursor-not-allowed opacity-40 line-through',
                      )}
                    >
                      <span className="block font-semibold">{v.variantName}</span>
                      <span className="block opacity-80">{formatVnd(v.price)}</span>
                    </button>
                  )
                })}
              </div>
            </fieldset>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <QuantityStepper value={quantity} max={variant?.stockQuantity ?? 1} onChange={(q) => { setQuantity(q); setAdded(false) }} />
            <button type="button" className="btn btn-primary flex-1 sm:flex-none" disabled={!inStock} onClick={handleAdd}>
              <ShoppingBag className="size-4" aria-hidden />
              {inStock ? 'Thêm vào giỏ' : 'Hết hàng'}
            </button>
          </div>
          {variant && inStock && <p className="mt-2 text-small text-muted">Còn {variant.stockQuantity} sản phẩm</p>}

          {added && (
            <div className="mt-4">
              <Notice tone="success">
                <span className="inline-flex items-center gap-2">
                  <Check className="size-4" aria-hidden /> Đã thêm vào giỏ.{' '}
                  <Link to={ROUTES.cart} className="font-semibold underline">Xem giỏ hàng</Link>
                </span>
              </Notice>
            </div>
          )}

          {product.description && (
            <div className="mt-8 border-t border-line pt-6">
              <h2 className="text-h3">Mô tả</h2>
              <p className="mt-2 whitespace-pre-line text-body text-muted">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
