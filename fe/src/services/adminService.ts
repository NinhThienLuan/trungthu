import { http, unwrap } from '../apis/http'
import type { ApiResponse } from '../types/api'
import type { ComplianceDoc } from './sellerService'

export type ComplianceStatus = ComplianceDoc['verificationStatus']

export interface AdminComplianceDoc extends ComplianceDoc {
  providerRejectionCount: number
  providerEmail: string
  providerName: string | null
  verifiedByEmail: string | null
}

export interface RecentSubscriptionItem {
  id: string
  providerEmail: string
  providerName: string | null
  planName: string
  price: number
  paymentNote: string | null
  createdAt: string
}

export interface RecentKycDocItem {
  id: string
  providerEmail: string
  providerName: string | null
  documentType: string
  submittedAt: string
}

export interface RecentComplaintItem {
  id: string
  orderCode: string
  providerName: string | null
  complaintType: string
  subject: string
  status: string
  createdAt: string
}

export interface AdminDashboardData {
  totalProviders: number
  approvedProviders: number
  activeSeasonProviders: number
  totalCustomers: number
  totalOrders: number
  totalGmv: number
  totalSaasRevenue: number
  pendingKycDocs: number
  pendingSubscriptions: number
  pendingComplaints: number
  openRfqs: number
  ordersByStatus: Record<string, number>
  recentSubscriptions: RecentSubscriptionItem[]
  recentKycDocs: RecentKycDocItem[]
  recentComplaints: RecentComplaintItem[]
}

/** BE1 /api/admin/compliance & dashboard: admin duyệt giấy tờ của seller và theo dõi vận hành sàn */
export const adminService = {
  dashboard: () => unwrap(http.get<ApiResponse<AdminDashboardData>>('/admin/dashboard')),
  documents: (status: ComplianceStatus) =>
    unwrap(http.get<ApiResponse<AdminComplianceDoc[]>>(`/admin/compliance/status/${status}`)),
  approve: (id: string, verificationNote: string) =>
    unwrap(http.put<ApiResponse<AdminComplianceDoc>>(`/admin/compliance/${id}/approve`, null, { params: { verificationNote } })),
  reject: (id: string, reason: string) =>
    unwrap(http.put<ApiResponse<AdminComplianceDoc>>(`/admin/compliance/${id}/reject`, null, { params: { reason } })),
}
