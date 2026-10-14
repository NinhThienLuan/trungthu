import { Cake, Gift, Mail, Sparkles } from 'lucide-react'
import type { ProductType } from '../types/product'
import { cn } from '../lib/format'

const ICONS = { LOOSE_CAKE: Cake, BOX_SHELL: Gift, GREETING_CARD: Mail, ADDON_SERVICE: Sparkles }

/**
 * Ảnh đại diện sản phẩm. API chưa trả ảnh -> hiển thị khối màu + icon theo loại.
 * Khi BE2 trả imageUrl, truyền vào `src` là xong.
 */
export function ProductThumb({ type, name, src, className }: { type: ProductType; name: string; src?: string | null; className?: string }) {
  const Icon = ICONS[type]
  return (
    <div className={cn('relative aspect-square overflow-hidden rounded-sm bg-champagne/60', className)}>
      {src ? (
        <img src={src} alt={name} loading="lazy" className="size-full object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center" aria-hidden>
          <Icon className="size-1/4 text-gold" strokeWidth={1.25} />
        </div>
      )}
    </div>
  )
}
