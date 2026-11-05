import { http, unwrap } from '../apis/http'
import type { ApiResponse } from '../types/api'

export interface DayAvailability {
  date: string // yyyy-MM-dd
  available: boolean
}

export const capacityService = {
  /**
   * Ngày nhận khả dụng của 1 Provider trong khoảng [from, to].
   * BE2: GET /api/providers/{providerId}/available-dates?from=&to= (công khai, tối đa 120 ngày)
   */
  availableDates: (providerId: string, from: string, to: string): Promise<DayAvailability[]> =>
    unwrap(http.get<ApiResponse<DayAvailability[]>>(`/providers/${providerId}/available-dates`, { params: { from, to } })),
}
