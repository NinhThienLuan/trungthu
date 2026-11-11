import { http, unwrap } from '../apis/http'
import type { ApiResponse } from '../types/api'

export interface DayAvailability {
  date: string // yyyy-MM-dd
  available: boolean
}

export const capacityService = {
  /**
   * Ngày nhận khả dụng của 1 Provider trong khoảng [from, to].
   * BE2: GET /api/providers/{providerId}/available-dates?from=&to=&quantity= (công khai, tối đa 120 ngày).
   * quantity = số bánh cần nướng: ngày nướng theo đơn chỉ mở khi xưởng còn đủ chừng ấy suất.
   */
  availableDates: (providerId: string, from: string, to: string, quantity = 1): Promise<DayAvailability[]> =>
    unwrap(http.get<ApiResponse<DayAvailability[]>>(`/providers/${providerId}/available-dates`,
      { params: { from, to, quantity: Math.max(1, quantity) } })),
}
