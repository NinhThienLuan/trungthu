import { http, unwrap } from '../apis/http'
import type { ApiResponse } from '../types/api'
import type { ComplianceDoc } from './sellerService'

export type ComplianceStatus = ComplianceDoc['verificationStatus']

export interface AdminComplianceDoc extends ComplianceDoc {
  providerEmail: string
  providerName: string | null
  verifiedByEmail: string | null
}

/** BE1 /api/admin/compliance: admin duyệt giấy tờ của seller */
export const adminService = {
  documents: (status: ComplianceStatus) =>
    unwrap(http.get<ApiResponse<AdminComplianceDoc[]>>(`/admin/compliance/status/${status}`)),
  approve: (id: string) => unwrap(http.put<ApiResponse<AdminComplianceDoc>>(`/admin/compliance/${id}/approve`)),
  reject: (id: string, reason: string) =>
    unwrap(http.put<ApiResponse<AdminComplianceDoc>>(`/admin/compliance/${id}/reject`, null, { params: { reason } })),
}
