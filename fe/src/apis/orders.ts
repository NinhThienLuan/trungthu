import { http, unwrap } from './http'
import { USE_MOCK, delay, readStore, writeStore } from './mock'
import { DEPOSIT_RATE, HOLD_MINUTES } from '../constants'
import type { ApiResponse } from '../types/api'
import type { CheckoutRequest, Order, OrderLine, RfqRequest } from '../types/order'
import type { CartItem } from '../stores/cartStore'

const MOCK_KEY = 'mock_orders'

export const orderApi = {
  /**
   * Đề xuất API cho BE3: POST /api/checkout -> trả về danh sách đơn con (mỗi Provider 1 đơn).
   * Nếu 1 Provider hết slot, BE rollback toàn bộ và trả 409 kèm message.
   */
  checkout: async (body: CheckoutRequest, cart: CartItem[]): Promise<Order[]> => {
    if (!USE_MOCK.checkout) {
      return unwrap(http.post<ApiResponse<Order[]>>('/checkout', body))
    }
    await delay(600)
    const now = new Date()
    const created: Order[] = body.groups.map((group, index) => {
      // Mock dựng dòng đơn từ giỏ; BE thật tự tra giá theo variantId
      const lines: OrderLine[] = cart
        .filter((item) => item.providerId === group.providerId)
        .map((item) => ({
          variantId: item.variantId,
          productName: item.productName,
          variantName: item.variantName,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          boxContents: item.slots?.map((slot) => `${slot.productName} ${slot.variantName}`),
        }))
      const total = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
      const code = `NVD${now.getTime().toString().slice(-6)}${index + 1}`
      return {
        id: crypto.randomUUID(),
        code,
        providerId: group.providerId,
        storeName: cart.find((item) => item.providerId === group.providerId)!.storeName,
        deliveryDate: group.deliveryDate,
        status: 'PENDING_DEPOSIT',
        totalAmount: total,
        depositAmount: Math.ceil(total * DEPOSIT_RATE),
        holdExpiresAt: new Date(now.getTime() + HOLD_MINUTES * 60_000).toISOString(),
        // QR demo chỉ chứa chữ, không phải tài khoản thật
        qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`DEMO - KHONG CHUYEN KHOAN - ${code}`)}`,
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
