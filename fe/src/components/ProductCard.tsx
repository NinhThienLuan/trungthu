import { Link } from 'react-router-dom'
import type { Product } from '../types/product'
import { PRODUCT_TYPE_LABEL, ROUTES } from '../constants'
import { formatVnd } from '../lib/format'
import { ProductThumb } from './ProductThumb'

export function ProductCard({ product }: { product: Product }) {
  const prices = product.variants.map((v) => v.price)
  const minPrice = prices.length ? Math.min(...prices) : null
  const soldOut = product.variants.every((v) => v.stockQuantity <= 0)

  return (
    <Link
      to={ROUTES.product(product.id)}
      className="card group flex flex-col p-3 transition-shadow hover:shadow-card-hover"
    >
      <ProductThumb type={product.productType} name={product.name} className="transition-transform group-hover:scale-[1.02]" />
      <div className="flex flex-1 flex-col px-1 pt-4">
        <p className="eyebrow">{PRODUCT_TYPE_LABEL[product.productType]}</p>
        <h3 className="mt-1 line-clamp-2 text-h3">{product.name}</h3>
        <p className="mt-1 text-small text-muted">{product.storeName}</p>
        <div className="mt-auto flex items-baseline justify-between pt-4">
          {minPrice !== null ? (
            <p className="font-semibold text-navy">
              {product.variants.length > 1 && <span className="text-small font-normal text-muted">Từ </span>}
              {formatVnd(minPrice)}
            </p>
          ) : (
            <p className="text-small text-muted">Chưa có giá</p>
          )}
          {soldOut && <span className="chip">Hết hàng</span>}
        </div>
      </div>
    </Link>
  )
}
