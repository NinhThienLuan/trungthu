/**
 * Phí giao mỗi đơn (BE quyết định: ShippingFeePolicy.java): nội thành TP.HCM 35.000đ, ngoại thành và tỉnh khác 70.000đ.
 * Danh sách dưới đây chỉ để khách chọn; số tiền thật lấy từ preview của BE.
 */
export const HCM = 'TP. Hồ Chí Minh'
export const OTHER_PROVINCE = 'Tỉnh/thành khác'

export const SHIPPING_FEE = { inner: 35000, outer: 70000 } as const

export const HCM_INNER_DISTRICTS = [
  'Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 10', 'Quận 11', 'Quận 12',
  'Bình Thạnh', 'Gò Vấp', 'Phú Nhuận', 'Tân Bình', 'Tân Phú', 'Bình Tân', 'TP Thủ Đức',
] as const

export const HCM_OUTER_DISTRICTS = ['Huyện Bình Chánh', 'Huyện Hóc Môn', 'Huyện Củ Chi', 'Huyện Nhà Bè', 'Huyện Cần Giờ'] as const

export const isInnerHcm = (province: string, district: string) =>
  province === HCM && (HCM_INNER_DISTRICTS as readonly string[]).includes(district)
