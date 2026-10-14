import { http } from '../apis/http'
import { USE_MOCK, delay } from '../apis/mock'
import type { RfqRequest } from '../types/order'

export const rfqService = {
  /** Đề xuất API cho BE3: POST /api/rfqs */
  submit: async (body: RfqRequest): Promise<void> => {
    if (!USE_MOCK.rfq) {
      await http.post('/rfqs', body)
      return
    }
    await delay(600)
  },
}
