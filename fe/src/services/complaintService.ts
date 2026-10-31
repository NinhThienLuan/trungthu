import { http, unwrap } from '../apis/http'
import type { ApiResponse } from '../types/api'

export type ComplaintType = 'DAMAGED' | 'MOLDED' | 'WRONG_SPECIFICATION' | 'LATE_DELIVERY' | 'OTHER'
export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED'

export const COMPLAINT_TYPE_LABEL: Record<ComplaintType, string> = {
  DAMAGED: 'Bánh dập vỡ / hỏng hộp',
  MOLDED: 'Bánh mốc, chua, quá hạn',
  WRONG_SPECIFICATION: 'Sai loại, sai trọng lượng, thiếu hàng',
  LATE_DELIVERY: 'Giao trễ',
  OTHER: 'Khác',
}

export const COMPLAINT_STATUS: Record<ComplaintStatus, { text: string; tone: string }> = {
  OPEN: { text: 'Mới gửi', tone: 'text-navy' },
  IN_PROGRESS: { text: 'Xưởng đang xử lý', tone: 'text-navy' },
  RESOLVED: { text: 'Đã giải quyết', tone: 'text-success' },
  REJECTED: { text: 'Bị từ chối', tone: 'text-danger' },
}

/** ComplaintController.ComplaintResponse */
export interface Complaint {
  id: string
  orderId: string
  orderCode: string
  storeName: string
  customerName: string
  customerPhone: string | null
  type: ComplaintType
  subject: string
  description: string | null
  status: ComplaintStatus
  resolution: string | null
  createdAt: string
  resolvedAt: string | null
}

/** Khiếu nại / đổi trả: khách gửi cho đơn đang giao/đã hoàn tất; xưởng xử lý; admin sàn phân xử */
export const complaintService = {
  create: (body: { orderId: string; type: ComplaintType; subject: string; description?: string }) =>
    unwrap(http.post<ApiResponse<Complaint>>('/complaints', body)),
  mine: () => unwrap(http.get<ApiResponse<Complaint[]>>('/complaints/me')),
  forProvider: () => unwrap(http.get<ApiResponse<Complaint[]>>('/provider/complaints')),
  all: () => unwrap(http.get<ApiResponse<Complaint[]>>('/admin/complaints')),
  update: (scope: 'provider' | 'admin', id: string, status: ComplaintStatus, resolution?: string) =>
    unwrap(http.put<ApiResponse<Complaint>>(`/${scope}/complaints/${id}`, { status, resolution })),
}
