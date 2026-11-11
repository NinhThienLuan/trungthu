package fpt.sba.trungthu.service;

import fpt.sba.trungthu.dto.request.ReviewComplianceDocRequest;
import fpt.sba.trungthu.dto.request.UploadComplianceDocRequest;
import fpt.sba.trungthu.dto.response.ComplianceDocResponse;
import fpt.sba.trungthu.dto.response.PageResponse;
import fpt.sba.trungthu.entity.enumeration.ComplianceDocStatus;

import java.util.List;
import java.util.UUID;

/**
 * Service quản lý hồ sơ KYC/Compliance của Provider
 * Pattern: Service nhận email từ Controller, internally convert to UUID for repository queries
 */
public interface ComplianceService {
    
    // Provider uploads compliance document
    ComplianceDocResponse uploadDocument(String providerEmail, UploadComplianceDocRequest request);
    
    // Provider gets their own documents
    List<ComplianceDocResponse> getProviderDocuments(String providerEmail);
    
    // Check if provider has approved document
    boolean hasApprovedDocument(String providerEmail);
    
    // Admin gets documents by status
    List<ComplianceDocResponse> getDocumentsByStatus(ComplianceDocStatus status);

    PageResponse<ComplianceDocResponse> getDocumentsPage(ComplianceDocStatus status, int page, int size);
    
    // Admin reviews (approve/reject) document
    ComplianceDocResponse reviewDocument(UUID docId, ReviewComplianceDocRequest request);
}
