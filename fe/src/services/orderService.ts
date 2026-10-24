import { http, unwrap } from '../apis/http'
import { USE_MOCK, delay, readStore, writeStore } from '../apis/mock'
import { CANCELLABLE_STATUSES, COD_MAX_TOTAL, DEPOSIT_RATE, HOLD_MINUTES } from '../constants'
import type { ApiResponse, Page } from '../types/api'
import type {
  CheckoutPreview,
  CheckoutRequest,
  OrderDetail,
  OrderLine,
  OrderQuery,
  OrderSummary,
  ShippingZoneRate,
  VietQrInstruction,
} from '../types/order'
import type { CartItem } from '../stores/cartStore'

/**
 * Đơn hàng theo hợp đồng BE (backend-ownership-and-order-contract.md):
 * - BE4 (đã có): GET /api/orders/me, GET /api/orders/{id}
 * - BE3: POST /api/checkout/preview, POST /api/checkout, GET /api/orders/{id}/vietqr
 */

const MOCK_KEY = 'mock_orders_v2' // đổi key: đơn mock cũ có cấu trúc khác

/** Cọc tối thiểu 50%, tiền VNĐ nguyên, làm tròn lên */
const minDeposit = (total: number) => Math.ceil(total * DEPOSIT_RATE)

/** Mock: dựng số liệu preview từ giỏ (BE thật tự tra giá theo variantId, không tin giá client) */
function previewFromCart(body: CheckoutRequest, cart: CartItem[]): CheckoutPreview {
  const groups = body.groups.map((group) => {
    const items = cart.filter((item) => item.providerId === group.providerId)
    const subtotalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    const shippingFee = 0 // mock: BE3 tính phí ship theo xưởng
    const totalAmount = subtotalAmount + shippingFee
    const hasCustomBox = items.some((item) => item.kind === 'box')
    return {
      providerId: group.providerId,
      subtotalAmount,
      shippingFee,
      totalAmount,
      minDepositAmount: minDeposit(totalAmount),
      codAllowed: totalAmount < COD_MAX_TOTAL && !hasCustomBox,
    }
  })
  return { groups, grandTotal: groups.reduce((sum, g) => sum + g.totalAmount, 0) }
}

/** Mock: giả lập cron — đơn chờ cọc quá hạn giữ chỗ tự huỷ */
function readMockOrders(): OrderDetail[] {
  const now = Date.now()
  return readStore<OrderDetail[]>(MOCK_KEY, []).map((order) =>
    order.status === 'PENDING_DEPOSIT' && order.holdExpiresAt && Date.parse(order.holdExpiresAt) <= now
      ? { ...order, status: 'CANCELLED' as const, holdExpiresAt: null }
      : order,
  )
}

const toSummary = ({
  id, code, providerId, storeName, deliveryDate, status, paymentMethod, paymentStatus, totalAmount, paidAmount, remainingAmount, createdAt,
}: OrderDetail): OrderSummary => ({
  id, code, providerId, storeName, deliveryDate, status, paymentMethod, paymentStatus, totalAmount, paidAmount, remainingAmount, createdAt,
})

export const orderService = {
  /** Khu vực + phí giao của xưởng (công khai). Mock: 3 khu vực demo như DemoCheckoutSeeder */
  shippingZones: async (providerId: string): Promise<ShippingZoneRate[]> => {
    if (!USE_MOCK.checkout) {
      return unwrap(http.get<ApiResponse<ShippingZoneRate[]>>(`/providers/${providerId}/shipping-zones`))
    }
    await delay(150)
    return [
      { province: 'hà nội', district: 'hoàn kiếm', fee: 30000 },
      { province: 'hà nội', district: 'cầu giấy', fee: 35000 },
      { province: 'hồ chí minh', district: 'quận 1', fee: 30000 },
    ]
  },


  /** BE3: POST /api/checkout/preview — chỉ đọc, không giữ stock/slot */
  preview: async (body: CheckoutRequest, cart: CartItem[]): Promise<CheckoutPreview> => {
    if (!USE_MOCK.checkout) {
      return unwrap(http.post<ApiResponse<CheckoutPreview>>('/checkout/preview', body))
    }
    await delay(250)
    return previewFromCart(body, cart)
  },

  /**
   * BE3: POST /api/checkout -> ApiResponseDTO<List<OrderDetailResponse>>, mỗi Provider một Order.
   * Một Provider lỗi -> BE rollback toàn bộ, trả 409 (xung đột) / 400 (đầu vào sai).
   */
  checkout: async (body: CheckoutRequest, cart: CartItem[]): Promise<OrderDetail[]> => {
    if (!USE_MOCK.checkout) {
      return unwrap(http.post<ApiResponse<OrderDetail[]>>('/checkout', body))
    }
    await delay(600)
    const preview = previewFromCart(body, cart)
    const orderedAt = new Date()

    // Kiểm tra giống BE trước khi "lưu" (lỗi bất kỳ -> không tạo đơn nào)
    body.groups.forEach((group, i) => {
      if (group.paymentMethod === 'COD' && !preview.groups[i].codAllowed) {
        throw new Error('COD chỉ áp dụng cho đơn dưới 2.000.000đ và không có hộp tự phối. Vui lòng chọn VietQR.')
      }
    })

    const created: OrderDetail[] = body.groups.map((group, index) => {
      const p = preview.groups[index]
      const items = cart.filter((item) => item.providerId === group.providerId)
      const lines: OrderLine[] = items.map((item) => ({
        variantId: item.variantId,
        productName: item.productName,
        variantName: item.variantName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.unitPrice * item.quantity,
        boxContents: item.slots?.map((slot) => `${slot.productName} ${slot.variantName}`),
      }))
      const code = `NVD${orderedAt.getTime().toString().slice(-6)}${index + 1}`
      const isCod = group.paymentMethod === 'COD'
      const depositAmount = isCod ? 0 : group.depositOption === 'FULL' ? p.totalAmount : p.minDepositAmount
      return {
        id: crypto.randomUUID(),
        code,
        providerId: group.providerId,
        storeName: items[0]?.storeName ?? '',
        deliveryDate: group.deliveryDate,
        status: isCod ? 'CONFIRMED' : 'PENDING_DEPOSIT',
        paymentMethod: group.paymentMethod,
        paymentStatus: 'UNPAID',
        totalAmount: p.totalAmount,
        paidAmount: 0,
        remainingAmount: p.totalAmount,
        createdAt: orderedAt.toISOString(),
        receiverName: body.receiverName,
        receiverPhone: body.receiverPhone,
        shippingAddress: body.shippingAddress,
        subtotalAmount: p.subtotalAmount,
        shippingFee: p.shippingFee,
        depositAmount,
        holdExpiresAt: isCod ? null : new Date(orderedAt.getTime() + HOLD_MINUTES * 60_000).toISOString(),
        lines,
        // QR demo chỉ chứa chữ, không phải tài khoản thật
        payment: isCod
          ? undefined
          : {
              qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`DEMO - KHONG CHUYEN KHOAN - ${code}`)}`,
              bankName: 'Ngân hàng của xưởng (demo)',
              bankAccount: '0000 0000 0000',
              transferNote: code,
            },
      }
    })
    writeStore(MOCK_KEY, [...created, ...readMockOrders()])
    return created
  },

  /** Thông tin chuyển khoản của đúng đơn và đúng tài khoản seller. */
  vietQr: async (id: string): Promise<VietQrInstruction> => {
    if (!USE_MOCK.orders) {
      return unwrap(http.get<ApiResponse<VietQrInstruction>>(`/orders/${id}/vietqr`))
    }
    await delay(200)
    const order = readMockOrders().find((item) => item.id === id)
    if (!order || order.paymentMethod !== 'VIETQR' || order.status !== 'PENDING_DEPOSIT'
      || !order.holdExpiresAt || Date.parse(order.holdExpiresAt) <= Date.now() || !order.payment) {
      throw new Error('Đơn không còn trong thời gian thanh toán VietQR')
    }
    return {
      imageUrl: order.payment.qrImageUrl ?? '',
      bankCode: order.payment.bankName,
      accountNumber: order.payment.bankAccount,
      accountName: order.payment.accountName ?? '',
      amount: order.depositAmount,
      transferContent: order.payment.transferNote,
      holdExpiresAt: order.holdExpiresAt,
    }
  },

  /** BE4: GET /api/orders/me — phân trang, lọc trạng thái và ngày nhận (from/to gồm cả hai đầu) */
  myOrders: async (query: OrderQuery = {}): Promise<Page<OrderSummary>> => {
    const { page = 0, size = 10, status, from, to } = query
    if (!USE_MOCK.orders) {
      return unwrap(http.get<ApiResponse<Page<OrderSummary>>>('/orders/me', { params: { page, size, status, from, to } }))
    }
    await delay()
    const all = readMockOrders()
      .filter((o) => (!status || o.status === status) && (!from || o.deliveryDate >= from) && (!to || o.deliveryDate <= to))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const totalPages = Math.max(1, Math.ceil(all.length / size))
    return {
      content: all.slice(page * size, page * size + size).map(toSummary),
      page,
      size,
      totalElements: all.length,
      totalPages,
      first: page === 0,
      last: page >= totalPages - 1,
    }
  },

  /** BE4: GET /api/orders/{id} — ngoài phạm vi trả 404 */
  detail: async (id: string): Promise<OrderDetail> => {
    if (!USE_MOCK.orders) {
      return unwrap(http.get<ApiResponse<OrderDetail>>(`/orders/${id}`))
    }
    await delay(200)
    const order = readMockOrders().find((o) => o.id === id)
    if (!order) throw new Error('Không tìm thấy đơn hàng')
    return order
  },

  /** BE3: POST /api/orders/{id}/cancel — chỉ khi PENDING_DEPOSIT hoặc CONFIRMED (COD chưa sản xuất) */
  cancel: async (id: string): Promise<OrderDetail> => {
    if (!USE_MOCK.orders) {
      return unwrap(http.post<ApiResponse<OrderDetail>>(`/orders/${id}/cancel`))
    }
    await delay(400)
    const orders = readMockOrders()
    const order = orders.find((o) => o.id === id)
    if (!order) throw new Error('Không tìm thấy đơn hàng')
    if (!CANCELLABLE_STATUSES.includes(order.status)) throw new Error('Đơn đã cọc hoặc đang sản xuất, không thể tự huỷ.')
    const cancelled: OrderDetail = { ...order, status: 'CANCELLED', holdExpiresAt: null }
    writeStore(MOCK_KEY, orders.map((o) => (o.id === id ? cancelled : o)))
    return cancelled
  },
}
