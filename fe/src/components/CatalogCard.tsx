import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from './Icon'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { ROUTES } from '../constants'
import type { Product } from '../types/product'


/** Thẻ sản phẩm theo đúng markup bản Stitch (bộ sưu tập), dữ liệu lấy từ Product */
/** promotion: nhãn khuyến mãi đang chạy của xưởng cho sản phẩm này (vd "Mua 3 tặng 1") */
export function CatalogCard({ product, promotion }: { product: Product; promotion?: string }) {
  const add = useCartStore((s) => s.add)
  const user = useAuthStore((s) => s.user)
  const isSeller = user?.role === 'PROVIDER'
  const [added, setAdded] = useState(false)
  const variant = product.variants[0]
  const canPreorder = product.productType === 'LOOSE_CAKE'
  const inStock = !!variant && (variant.stockQuantity > 0 || canPreorder)

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
        canPreorder,
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
          {promotion && (
            <span className="px-2 py-0.5 rounded-[0.125rem] bg-error text-on-error font-label-sm text-label-sm uppercase tracking-wider flex items-center gap-1">
              <Icon name="sell" className="text-[12px]" aria-hidden />
              {promotion}
            </span>
          )}
        </div>
      </Link>

      <div className="p-space-md flex-1 flex flex-col justify-between space-y-space-sm">
        <div>
          <h3 className="font-headline-sm text-headline-sm text-primary group-hover:text-secondary transition-colors">
            <Link to={ROUTES.product(product.id)}>{product.name}</Link>
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-1">{product.description}</p>
        </div>

        <div className="space-y-space-xs pt-2">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="font-headline-sm text-headline-sm text-primary font-bold">
                {variant ? `${variant.price.toLocaleString('vi-VN')} ` : '— '}
                <span className="text-body-sm font-normal">đ</span>
              </span>
            </div>
          </div>
          {isSeller ? (
            <Link
              to={ROUTES.product(product.id)}
              className="mt-2 w-full py-2.5 px-2 rounded-[0.125rem] bg-surface-container text-primary hover:bg-surface-container-high font-label-sm text-label-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 border border-line"
            >
              <Icon name="visibility" className="text-[16px]" aria-hidden />
              <span>Xem chi tiết</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={buyOne}
              disabled={!inStock}
              className="mt-2 w-full py-2.5 px-2 rounded-[0.125rem] bg-primary text-secondary-fixed hover:bg-ink-dark font-label-sm text-label-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <Icon name={added ? 'check' : 'shopping_cart'} className="text-[16px]" aria-hidden />
              {added ? 'Đã thêm vào giỏ' : variant?.stockQuantity === 0 && canPreorder
                ? 'Đặt trước · nhận sau 7 ngày' : inStock ? 'Thêm vào giỏ' : 'Hết hàng'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
