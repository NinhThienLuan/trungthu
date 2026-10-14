import { http, unwrap } from './http'
import { USE_MOCK, delay } from './mock'
import { MIN_LEAD_DAYS } from '../constants'
import { addDays, parseIsoDate, toIsoDate } from '../lib/format'
import type { ApiResponse } from '../types/api'

export interface DayAvailability {
  date: string // yyyy-MM-dd
  available: boolean
}

export const capacityApi = {
  /**
   * Ngày nhận khả dụng của 1 Provider trong khoảng [from, to].
   * Đề xuất API cho BE2: GET /api/providers/{providerId}/available-dates?from=&to=
   */
  availableDates: async (providerId: string, from: string, to: string): Promise<DayAvailability[]> => {
    if (!USE_MOCK.capacity) {
      return unwrap(
        http.get<ApiResponse<DayAvailability[]>>(`/providers/${providerId}/available-dates`, { params: { from, to } }),
      )
    }
    await delay(250)
    const min = toIsoDate(addDays(new Date(), MIN_LEAD_DAYS))
    const days: DayAvailability[] = []
    for (let d = parseIsoDate(from); toIsoDate(d) <= to; d = addDays(d, 1)) {
      const iso = toIsoDate(d)
      // Giả lập: mỗi ngày thứ 5 trong tháng đã kín hạn ngạch
      days.push({ date: iso, available: iso >= min && d.getDate() % 5 !== 0 })
    }
    return days
  },
}
