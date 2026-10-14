/**
 * Bản Stitch gắn data-path="..." cho mọi link. Bảng này đổi data-path -> route thật,
 * để các trang chuyển nguyên từ Stitch điều hướng được mà không phải sửa từng thẻ <a>.
 */
export const STITCH_PATHS: Record<string, string> = {
  'trang-chu': '/',
  'bo-suu-tap': '/products',
  'tu-phoi-hop-qua': '/box-builder',
  'bao-gia-b2b': '/rfq',
  'gio-hang-hoang-gia': '/cart',
  'kenh-nghe-nhan': '/seller/profile',
  'tong-quan-quan-tri': '/seller',
  // Khu vực nghệ nhân (seller)
  'bang-dieu-khien': '/seller',
  'quan-ly-menu-me-ra-lo': '/seller/products',
  'yeu-cau-bao-gia-si-b2b': '/seller/b2b',
  'don-hang-giao-lanh': '/seller/orders',
  'ho-so-nghe-nhan-tham-dinh': '/seller/profile',
}

/** Nút/link Stitch không có data-path: điều hướng theo chữ hiển thị trên nút */
const TEXT_PATHS: Record<string, string> = {
  'Xem Menu': '/products',
  'Báo Giá Sỉ': '/rfq',
  'Gửi Yêu Cầu Báo Giá Sỉ (Miễn Phí)': '/rfq',
  'Đặt Sỉ B2B & Nhận Báo Giá Doanh Nghiệp': '/rfq',
  'Tư vấn in logo': '/rfq',
  'Nhận Báo Giá Đóng Dấu & Hộp Mẫu Thử': '/rfq',
  'Đặt Hàng Doanh Nghiệp B2B': '/rfq',
  'Khám Phá Gian Hàng Nghệ Nhân': '/products',
  'Khám Phá Bộ Sưu Tập': '/products',
  'Bắt đầu phối hộp': '/box-builder',
  'Đăng ký tham gia': '/seller/profile',
}

/**
 * Gắn vào onClick của khung layout:
 * - link Stitch có data-path -> điều hướng SPA
 * - nút/link chưa có đích nhưng chữ khớp TEXT_PATHS -> điều hướng theo chữ
 * - link href="#" còn lại -> chặn để trang không nhảy lên đầu
 */
export function handleStitchLinkClick(event: React.MouseEvent, navigate: (to: string) => void) {
  const el = (event.target as HTMLElement).closest<HTMLElement>('a, button')
  // <button> không ghi type mặc định là submit -> chỉ bỏ qua khi thật sự nằm trong form
  if (!el || (el instanceof HTMLButtonElement && el.type === 'submit' && el.form)) return
  const isDeadLink = el instanceof HTMLAnchorElement && el.getAttribute('href') === '#'
  const to = STITCH_PATHS[el.dataset.path ?? ''] ?? TEXT_PATHS[el.textContent?.trim() ?? '']
  if (isDeadLink) event.preventDefault()
  if (to) {
    event.preventDefault()
    navigate(to)
  }
}
