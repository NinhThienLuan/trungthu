import { http, unwrap } from './http'
import { USE_MOCK, delay, readStore, writeStore } from './mock'
import { DEPOSIT_RATE, HOLD_MINUTES } from '../constants'
import type { ApiResponse } from '../types/api'
import type { CheckoutRequest, Order, RfqRequest } from '../types/order'

const MOCK_KEY = 'mock_orders'

/** Dữ liệu dòng hàng mà mock cần để dựng đơn (BE thật sẽ tự tra theo variantId) */
export interface CartSnapshotLine {
  variantId: string
  providerId: string
  storeName: string
  productName: string
  variantName: string
  unitPrice: number
}

export const orderApi = {
  /**
   * Đề xuất API cho BE3: POST /api/checkout -> trả về danh sách đơn con (mỗi Provider 1 đơn).
   * Nếu 1 Provider hết slot, BE rollback toàn bộ và trả 409 kèm message.
   */
  checkout: async (body: CheckoutRequest, snapshot: CartSnapshotLine[]): Promise<Order[]> => {
    if (!USE_MOCK.checkout) {
      return unwrap(http.post<ApiResponse<Order[]>>('/checkout', body))
    }
    await delay(600)
    const now = new Date()
    const byVariant = new Map(snapshot.map((line) => [line.variantId, line]))
    const created: Order[] = body.groups.map((group, index) => {
      const lines = group.items.map((item) => {
        const info = byVariant.get(item.variantId)!
        return {
          variantId: item.variantId,
          productName: info.productName,
          variantName: info.variantName,
          unitPrice: info.unitPrice,
          quantity: item.quantity,
        }
      })
      const total = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
      const code = `NVD${now.getTime().toString().slice(-6)}${index + 1}`
      return {
        id: crypto.randomUUID(),
        code,
        providerId: group.providerId,
        storeName: byVariant.get(group.items[0].variantId)!.storeName,
        deliveryDate: group.deliveryDate,
        status: 'PENDING_DEPOSIT',
        totalAmount: total,
        depositAmount: Math.ceil(total * DEPOSIT_RATE),
        holdExpiresAt: new Date(now.getTime() + HOLD_MINUTES * 60_000).toISOString(),
        qrImageUrl: null,
        bankName: 'Ngân hàng của xưởng (demo)',
        bankAccount: '0000 0000 0000',
        transferNote: code,
        createdAt: now.toISOString(),
        lines,
      }
    })
    writeStore(MOCK_KEY, [...created, ...readStore<Order[]>(MOCK_KEY, [])])
    return created
  },

  /** Đề xuất API cho BE4: GET /api/orders/me */
  myOrders: async (): Promise<Order[]> => {
    if (!USE_MOCK.orders) {
      return unwrap(http.get<ApiResponse<Order[]>>('/orders/me'))
    }
    await delay()
    const now = Date.now()
    // Giả lập @Scheduled: đơn quá hạn giữ chỗ thì tự huỷ
    return readStore<Order[]>(MOCK_KEY, []).map((order) =>
      order.status === 'PENDING_DEPOSIT' && order.holdExpiresAt && Date.parse(order.holdExpiresAt) < now
        ? { ...order, status: 'CANCELLED' }
        : order,
    )
  },

  /** Đề xuất API cho BE4: GET /api/orders/{id} */
  byIds: async (ids: string[]): Promise<Order[]> => {
    if (!USE_MOCK.orders) {
      return Promise.all(ids.map((id) => unwrap(http.get<ApiResponse<Order>>(`/orders/${id}`))))
    }
    const all = await orderApi.myOrders()
    return all.filter((order) => ids.includes(order.id))
  },
}

export const rfqApi = {
  /** Đề xuất API cho BE3: POST /api/rfqs */
  submit: async (body: RfqRequest): Promise<void> => {
    if (!USE_MOCK.rfq) {
      await http.post('/rfqs', body)
      return
    }
    await delay(600)
  },
}
