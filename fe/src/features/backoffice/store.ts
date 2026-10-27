import { create } from 'zustand'
import { DEMO_DATE, INITIAL_DOCS, INITIAL_SKUS, PLANS, SELLER_ID, bakeDate, initialOrders, orderTotal, orderUnits } from './model'
import type { ComplianceDoc, DemoOrder, OrderStage, PlanId, ReviewStatus, Sku, Subscription } from './model'

interface BackofficeState {
  docs: ComplianceDoc[]; skus: Sku[]; orders: DemoOrder[]; subscriptions: Subscription[]
  seasonActive: boolean; capacities: Record<string, number>; bank: { code: string; number: string; name: string }; notice: string
  notify: (text: string) => void
  uploadDoc: (id: string, file: File) => void
  reviewDoc: (id: string, status: ReviewStatus, reason?: string) => void
  requestPlan: (plan: PlanId) => void
  activatePlan: (id: string) => void
  toggleSeason: () => void
  saveBank: (bank: BackofficeState['bank']) => void
  saveCapacity: (date: string, max: number) => void
  saveSku: (sku: Sku) => void
  changeSkuStatus: (id: string) => void
  transition: (id: string, target: OrderStage, received?: number) => void
  expireHolds: () => void
}
export const useBackoffice = create<BackofficeState>((set, get) => ({
  docs: INITIAL_DOCS.map(doc => ({ ...doc })), skus: INITIAL_SKUS.map(sku => ({ ...sku })), orders: initialOrders(),
  subscriptions: [{ id: 'SUB-001', plan: 'STANDARD', status: 'ACTIVE', start: '2026-10-01', end: '2026-12-31', transferNote: `SUB-${SELLER_ID}`, submittedAt: '2026-10-01' }],
  seasonActive: true, capacities: { '2026-10-30': 60, '2026-10-31': 80, '2026-11-01': 100 },
  bank: { code: '', number: '', name: '' }, notice: '',
  notify: notice => set({ notice }),
  uploadDoc: (id, file) => {
    const previous = get().docs.find(doc => doc.id === id)?.url
    if (previous) URL.revokeObjectURL(previous)
    set(state => ({ docs: state.docs.map(doc => doc.id === id ? { ...doc, filename: file.name, url: URL.createObjectURL(file), submittedAt: DEMO_DATE, status: 'PENDING', reason: undefined } : doc), notice: 'Đã nộp tài liệu. Hồ sơ đang chờ admin duyệt.' }))
  },
  reviewDoc: (id, status, reason) => {
    if (status === 'PENDING' || !get().docs.some(doc => doc.id === id && doc.status === 'PENDING')) return
    if (status === 'REJECTED' && !reason?.trim()) return get().notify('Vui lòng nhập lý do từ chối.')
    set(state => ({ docs: state.docs.map(doc => doc.id === id ? { ...doc, status, reason: status === 'REJECTED' ? reason?.trim() : undefined } : doc), notice: status === 'APPROVED' ? 'Đã duyệt tài liệu. Điều kiện KYC được cập nhật.' : 'Đã từ chối tài liệu, kèm lý do cho seller.' }))
  },
  requestPlan: plan => {
    if (get().subscriptions.some(sub => sub.status === 'PENDING')) return get().notify('Bạn đã có một yêu cầu gói chờ xác nhận.')
    set(state => ({ subscriptions: [{ id: `SUB-${Date.now()}`, plan, status: 'PENDING', transferNote: `SUB-${SELLER_ID}`, submittedAt: DEMO_DATE }, ...state.subscriptions], notice: 'Đã tạo yêu cầu đăng ký gói. Gói chỉ có hiệu lực sau khi admin xác nhận chuyển khoản.' }))
  },
  activatePlan: id => {
    if (!get().subscriptions.some(sub => sub.id === id && sub.status === 'PENDING')) return
    set(state => ({ subscriptions: state.subscriptions.map(sub => sub.id === id ? { ...sub, status: 'ACTIVE', start: DEMO_DATE, end: '2026-12-31' } : sub.status === 'ACTIVE' ? { ...sub, status: 'EXPIRED' } : sub), notice: 'Đã kích hoạt gói dịch vụ. Hạn mức SKU và quyền ưu tiên đã cập nhật.' }))
  },
  toggleSeason: () => set(state => ({ seasonActive: !state.seasonActive, notice: state.seasonActive ? 'Đã tạm ngừng nhận đơn mới.' : 'Đã bật nhận đơn.' })),
  saveBank: bank => set({ bank, notice: 'Đã lưu thông tin tài khoản.' }),
  saveCapacity: (date, max) => {
    const booked = bookedFor(get().orders, get().skus, date)
    if (!date || !Number.isInteger(max) || max < booked || max > 1000000) return get().notify(`Hạn ngạch phải là số nguyên từ ${booked} đến 1.000.000 chiếc.`)
    set(state => ({ capacities: { ...state.capacities, [date]: max }, notice: 'Đã cập nhật hạn ngạch nướng.' }))
  },
  saveSku: sku => {
    const state = get()
    if (state.skus.some(row => row.id === sku.id)) return state.notify('Mã SKU đã tồn tại.')
    if (state.skus.length >= planFor(state.subscriptions).limit) return state.notify('Đã đạt giới hạn SKU của gói.')
    set({ skus: [...state.skus, { ...sku, status: 'DRAFT' }], notice: 'Đã thêm SKU nháp vào danh mục.' })
  },
  changeSkuStatus: id => {
    const state = get()
    const sku = state.skus.find(row => row.id === id)
    if (!sku) return
    if (sku.status !== 'PUBLISHED' && !eligible(state.docs, state.subscriptions)) return state.notify('Cần KYC được duyệt và gói ACTIVE để đăng bán SKU.')
    set({ skus: state.skus.map(row => row.id === id ? { ...row, status: row.status === 'PUBLISHED' ? 'HIDDEN' : 'PUBLISHED' } : row), notice: 'Đã cập nhật trạng thái SKU.' })
  },
  transition: (id, target, received) => {
    const state = get()
    const order = state.orders.find(row => row.id === id)
    if (!order || order.stage === target) return
    const allowed = (order.stage === 'PENDING_DEPOSIT' && ['DEPOSITED', 'CANCELLED'].includes(target)) || (order.stage === 'DEPOSITED' && target === 'DELIVERING') || (order.stage === 'DELIVERING' && target === 'COMPLETED')
    if (!allowed) return state.notify('Không thể chuyển sang trạng thái này.')
    if (target === 'DEPOSITED' && order.holdUntil && Date.now() >= order.holdUntil) { state.expireHolds(); return state.notify('Đã hết 15 phút giữ chỗ. Đơn được hủy và hoàn tồn kho / hạn ngạch.') }
    const paid = target === 'DEPOSITED' ? received ?? 0 : target === 'COMPLETED' ? orderTotal(order) : order.paid
    if (target === 'DEPOSITED' && (!Number.isFinite(paid) || paid < Math.ceil(orderTotal(order) / 2) || paid > orderTotal(order))) return state.notify('Số tiền nhận phải từ 50% đến toàn bộ giá trị đơn.')
    set({ orders: state.orders.map(row => row.id === id ? { ...row, stage: target, paid, holdUntil: undefined } : row), skus: target === 'CANCELLED' ? releaseStock(state.skus, [order]) : state.skus, notice: target === 'CANCELLED' ? 'Đã hủy đơn, hoàn tồn kho và nhả hạn ngạch nướng.' : 'Đã cập nhật đơn hàng.' })
  },
  expireHolds: () => {
    const state = get()
    const expired = state.orders.filter(row => row.stage === 'PENDING_DEPOSIT' && row.holdUntil != null && row.holdUntil <= Date.now())
    if (!expired.length) return
    set({ orders: state.orders.map(row => expired.some(order => order.id === row.id) ? { ...row, stage: 'CANCELLED', holdUntil: undefined } : row), skus: releaseStock(state.skus, expired), notice: 'Đơn hết 15 phút giữ chỗ đã được hủy; tồn kho và hạn ngạch đã được hoàn.' })
  },
}))
function releaseStock(skus: Sku[], orders: DemoOrder[]) {
  return skus.map(sku => ({ ...sku, stock: sku.stock + orders.reduce((sum, order) => sum + order.lines.filter(line => line.skuId === sku.id).reduce((qty, line) => qty + line.quantity, 0), 0) }))
}
export const activePlan = (subscriptions: Subscription[]) => subscriptions.find(sub => sub.status === 'ACTIVE' && (sub.start ?? '') <= DEMO_DATE && (sub.end ?? '') >= DEMO_DATE)
export const planFor = (subscriptions: Subscription[]) => { const sub = activePlan(subscriptions); return sub ? PLANS[sub.plan] : { name: 'Chưa có gói', price: 0, limit: 0, featured: false } }
export const kycApproved = (docs: ComplianceDoc[]) => docs.some(doc => doc.type === 'FOOD_SAFETY' && doc.status === 'APPROVED') && docs.some(doc => doc.type === 'LEGAL' && doc.status === 'APPROVED')
export const eligible = (docs: ComplianceDoc[], subscriptions: Subscription[]) => kycApproved(docs) && !!activePlan(subscriptions)
export const bookedFor = (orders: DemoOrder[], skus: Sku[], date: string) => orders.filter(order => order.stage !== 'CANCELLED' && bakeDate(order.deliveryDate) === date).reduce((sum, order) => sum + orderUnits(order, skus), 0)
