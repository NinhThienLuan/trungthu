import { useEffect, type ReactNode } from 'react'
import { BRAND } from '../../constants'

/**
 * Bọc trang chuyển từ Stitch: font/màu nền chữ giống thẻ <body> của bản thiết kế.
 * title = undefined -> để trang con tự đặt tiêu đề tab (vd trang chi tiết theo tên sản phẩm).
 */
export function StitchPage({ title, children }: { title?: string; children: ReactNode }) {
  useEffect(() => {
    if (title !== undefined) document.title = title ? `${title} | ${BRAND}` : BRAND
  }, [title])
  return <div className="stitch font-body-md text-body-md text-on-surface antialiased">{children}</div>
}
