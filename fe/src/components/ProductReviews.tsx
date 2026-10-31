import { Icon } from './Icon'
import { MOCK_REVIEWS } from '../apis/mockData'
import { formatDate } from '../lib/format'
import type { Product } from '../types/product'

function Stars({ value, size = 'text-[16px]' }: { value: number; size?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-secondary" aria-label={`${value} trên 5 sao`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon key={i} name={value >= i ? 'star' : value >= i - 0.5 ? 'star_half' : 'star_border'} filled={value >= i} className={size} aria-hidden />
      ))}
    </span>
  )
}

/** Điểm + số lượt đánh giá rút gọn, đặt dưới tên sản phẩm */
export function RatingSummary({ product, onClick }: { product: Product; onClick?: () => void }) {
  const rating = Number(product.display?.rating ?? 0)
  const count = product.display?.reviews.replace(/\D/g, '') ?? '0'
  if (!rating) return null
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-2 text-left hover:opacity-80">
      <Stars value={rating} />
      <span className="font-label-md text-label-md text-ink-dark font-bold">{rating}</span>
      <span className="font-body-sm text-body-sm text-on-surface-variant underline underline-offset-2">{count} đánh giá</span>
    </button>
  )
}

/** Tab "Đánh giá" ở trang chi tiết: tổng quan + phân bố sao + danh sách */
export function ProductReviews({ product }: { product: Product }) {
  const rating = Number(product.display?.rating ?? 0)
  const count = Number(product.display?.reviews.replace(/\D/g, '') ?? 0)
  // Phân bố sao suy ra từ điểm trung bình (dữ liệu mẫu — BE sẽ trả số thật)
  const share = rating >= 4.9 ? [88, 9, 2, 1, 0] : rating >= 4.8 ? [80, 14, 4, 1, 1] : [70, 20, 6, 2, 2]

  // Sản phẩm thật (BE chưa có chức năng đánh giá): không hiện số liệu và review mẫu như thật
  if (!rating) {
    return (
      <p className="p-space-lg rounded-[0.25rem] bg-surface-container-lowest shadow-sm font-body-md text-body-md text-on-surface-variant">
        Chưa có đánh giá cho sản phẩm này.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
      <div className="lg:col-span-4 space-y-space-md">
        <div className="p-space-lg rounded-[0.25rem] bg-surface-container-lowest shadow-sm text-center">
          <p className="font-headline-xl text-headline-xl text-ink-dark">{rating || '—'}</p>
          <Stars value={rating} size="text-[20px]" />
          <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{count} đánh giá</p>
          <div className="mt-space-md space-y-1.5">
            {share.map((pct, i) => (
              <div key={i} className="flex items-center gap-2 font-body-sm text-body-sm">
                <span className="w-8 text-right text-on-surface-variant">{5 - i}★</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container">
                  <span className="block h-full bg-secondary" style={{ width: `${pct}%` }} />
                </span>
                <span className="w-9 text-left text-outline">{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ul className="lg:col-span-8 space-y-space-sm">
        {MOCK_REVIEWS.map((r) => (
          <li key={r.id} className="p-space-md rounded-[0.25rem] bg-surface-container-lowest shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-space-sm">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary-container font-label-md text-label-md text-secondary-fixed">
                  {r.author.charAt(0)}
                </span>
                <div>
                  <p className="font-label-lg text-label-lg normal-case tracking-normal text-ink-dark">{r.author}</p>
                  <p className="font-body-sm text-body-sm text-outline">
                    {formatDate(r.date)} · {r.variant}
                  </p>
                </div>
              </div>
              <Stars value={r.rating} size="text-[14px]" />
            </div>
            <p className="mt-space-sm font-body-md text-body-md text-on-surface-variant">{r.content}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
