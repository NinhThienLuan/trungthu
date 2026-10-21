import type { HTMLAttributes } from 'react'
import { ICON_SET } from '../constants/icons'
import { cn } from '../lib/format'

interface Props extends HTMLAttributes<HTMLSpanElement> {
  /** Tên icon Google Material Symbols, vd 'shopping_bag' (tra tại https://fonts.google.com/icons) */
  name: string
  /** Tô đặc (FILL 1) — dùng cho sao đánh giá, dấu tick... */
  filled?: boolean
}

/**
 * Icon chính thức Google Material Symbols Outlined — đúng bộ icon bản thiết kế Stitch dùng.
 * Cỡ icon theo cỡ chữ: thêm class text-[18px], text-[22px]... (mặc định 24px).
 * Font chỉ chứa các icon khai báo trong constants/icons.ts.
 */
export function Icon({ name, filled, className, style, ...rest }: Props) {
  if (import.meta.env.DEV && !ICON_SET.has(name)) {
    console.warn(`[Icon] "${name}" chưa có trong constants/icons.ts nên sẽ không hiển thị — hãy thêm vào danh sách.`)
  }
  return (
    <span
      className={cn('ms-icon', className)}
      style={filled ? { fontVariationSettings: "'FILL' 1", ...style } : style}
      aria-hidden
      {...rest}
    >
      {name}
    </span>
  )
}
