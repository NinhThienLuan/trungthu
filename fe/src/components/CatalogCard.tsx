import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from './Icon'
import { useCartStore } from '../stores/cartStore'
import { ROUTES } from '../constants'
import type { Product } from '../types/product'

const vnd = (n: number) => `${n.toLocaleString('vi-VN')} đ`

/** Thẻ sản phẩm theo đúng markup bản Stitch (bộ sưu tập), dữ liệu lấy từ Product */
export function CatalogCard({ product }: { product: Product }) {
  const add = useCartStore((s) => s.add)
  const [added, setAdded] = useState(false)
  const variant = product.variants[0]
  const d = product.display
  const inStock = !!variant && variant.stockQuantity > 0

  const buyOne = () => {
    if (!variant) return
    add(
      {
        variantId: variant.id,
        setProductId: product.productType === 'GIFT_SET' ? product.id : undefined,
        productId: product.id,
        providerId: product.providerId,
        storeName: product.storeName,
        productName: product.name,
        variantName: variant.variantName,
        unitPrice: variant.price,
        stock: variant.stockQuantity,
        imageUrl: product.imageUrl,
      },
      1,
    )
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <article className="group bg-surface-container-lowest rounded-[0.125rem] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
      <Link to={ROUTES.product(product.id)} className="relative block w-full aspect-[4/3] bg-surface-container-high overflow-hidden">
        {product.imageUrl && (
          <img
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            alt={product.imageAlt ?? product.name}
            src={product.imageUrl}
            loading="lazy"
          />
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          <span className="px-2 py-0.5 rounded-[0.125rem] bg-primary/90 text-champagne-light font-label-sm text-label-sm uppercase tracking-wider backdrop-blur-sm">
            {product.storeName}
          </span>
          {d && (
            <span className="px-2 py-0.5 rounded-[0.125rem] bg-secondary text-on-secondary font-label-sm text-label-sm uppercase tracking-wider flex items-center gap-1">
              <Icon name={d.badgeIcon} className="text-[12px]" aria-hidden />
              {d.badgeLabel}
            </span>
          )}
        </div>
        {d && (
          <div className="absolute bottom-3 right-3 px-2 py-1 rounded-[0.125rem] bg-surface/90 backdrop-blur-sm flex items-center gap-1">
            <Icon name="star" className="text-secondary text-[14px]" filled aria-hidden />
            <span className="font-label-sm text-label-sm text-primary font-bold">{d.rating}</span>
            <span className="font-body-sm text-[11px] text-outline">{d.reviews}</span>
          </div>
        )}
      </Link>

      <div className="p-space-md flex-1 flex flex-col justify-between space-y-space-sm">
        <div>
          {d && (
            <div className="flex items-center gap-2 mb-1">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">{d.packLabel}</span>
              <span className="text-outline-variant">•</span>
              <span className="font-body-sm text-body-sm text-outline">{d.weightLabel}</span>
            </div>
          )}
          <h3 className="font-headline-sm text-headline-sm text-primary group-hover:text-secondary transition-colors">
            <Link to={ROUTES.product(product.id)}>{product.name}</Link>
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-1">{product.description}</p>
        </div>

        <div className="space-y-space-xs pt-2">
          <div className="flex items-baseline justify-between">
            <div>
              {d && <span className="font-body-sm text-body-sm text-outline line-through block">{vnd(d.oldPrice)}</span>}
              <span className="font-headline-sm text-headline-sm text-primary font-bold">
                {variant ? `${variant.price.toLocaleString('vi-VN')} ` : '— '}
                <span className="text-body-sm font-normal">đ{d?.unit ?? ''}</span>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={buyOne}
            disabled={!inStock}
            className="mt-2 w-full py-2.5 px-2 rounded-[0.125rem] bg-primary text-secondary-fixed hover:bg-ink-dark font-label-sm text-label-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
          >
            <Icon name={added ? 'check' : 'shopping_cart'} className="text-[16px]" aria-hidden />
            {added ? 'Đã thêm vào giỏ' : inStock ? 'Thêm vào giỏ' : 'Hết hàng'}
          </button>
        </div>
      </div>
    </article>
  )
}
