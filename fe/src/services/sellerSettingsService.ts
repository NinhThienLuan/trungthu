import { http, unwrap } from '../apis/http'
import type { ApiResponse } from '../types/api'

export interface SellerSettings {
  bankCode: string | null
  accountNumber: string | null
  accountName: string | null
}

export interface CapacityDay {
  date: string // ngày nướng yyyy-MM-dd
  maxQuantity: number
  reservedQuantity: number
}

/** Cấu hình để buyer đặt được hàng: BE3 checkout-settings (tài khoản VietQR), BE2 capacity. Sàn miễn phí giao hàng */
export const sellerSettingsService = {
  get: () => unwrap(http.get<ApiResponse<SellerSettings>>('/provider/checkout-settings')),

  setBankAccount: (body: { bankCode: string; accountNumber: string; accountName: string }) =>
    unwrap(http.put<ApiResponse<null>>('/provider/checkout-settings/bank-account', body)),


  capacities: (from: string, to: string) =>
    unwrap(http.get<ApiResponse<CapacityDay[]>>('/provider/capacities', { params: { from, to } })),

  setCapacity: (body: { from: string; to: string; maxQuantity: number }) =>
    unwrap(http.put<ApiResponse<CapacityDay[]>>('/provider/capacities', body)),
}
