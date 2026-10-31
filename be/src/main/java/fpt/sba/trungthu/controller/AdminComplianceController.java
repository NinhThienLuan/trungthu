package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.dto.request.ReviewComplianceDocRequest;
import fpt.sba.trungthu.dto.response.ComplianceDocResponse;
import fpt.sba.trungthu.entity.enumeration.ComplianceDocStatus;
import fpt.sba.trungthu.service.ComplianceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/compliance")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Compliance", description = "Admin compliance document review")
@PreAuthorize("hasRole('PLATFORM_ADMIN')")
public class AdminComplianceController {

    private final ComplianceService complianceService;

    @GetMapping("/pending")
    @Operation(summary = "Get pending compliance documents")
    public ResponseEntity<ApiResponseDTO<List<ComplianceDocResponse>>> getPendingDocuments() {
        log.info("Admin getting pending compliance documents");

        try {
            List<ComplianceDocResponse> documents = complianceService
                    .getDocumentsByStatus(ComplianceDocStatus.PENDING);

            return ResponseEntity.ok(ApiResponseDTO.success("Pending documents retrieved successfully", documents));
        } catch (Exception e) {
            log.error("Error getting pending documents", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDTO.error(HttpStatus.INTERNAL_SERVER_ERROR,
                            "Failed to retrieve documents: " + e.getMessage()));
        }
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get compliance documents by status")
    public ResponseEntity<ApiResponseDTO<List<ComplianceDocResponse>>> getDocumentsByStatus(
            @PathVariable ComplianceDocStatus status) {

        log.info("Admin getting documents with status: {}", status);

        try {
            List<ComplianceDocResponse> documents = complianceService.getDocumentsByStatus(status);

            return ResponseEntity.ok(ApiResponseDTO.success("Documents retrieved successfully", documents));
        } catch (Exception e) {
            log.error("Error getting documents by status", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDTO.error(HttpStatus.INTERNAL_SERVER_ERROR,
                            "Failed to retrieve documents: " + e.getMessage()));
        }
    }

    @PutMapping("/{docId}/review")
    @Operation(summary = "Review compliance document")
    public ResponseEntity<ApiResponseDTO<ComplianceDocResponse>> reviewDocument(
            @PathVariable UUID docId,
            @Valid @RequestBody ReviewComplianceDocRequest request) {

        log.info("Admin reviewing compliance document: {}", docId);

        try {
            ComplianceDocResponse response = complianceService.reviewDocument(docId, request);

            return ResponseEntity.ok(ApiResponseDTO.success("Document reviewed successfully", response));
        } catch (IllegalArgumentException e) {
            log.error("Invalid request for document review", e);
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponseDTO.error(HttpStatus.BAD_REQUEST, e.getMessage()));
        } catch (Exception e) {
            log.error("Error reviewing document", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDTO.error(HttpStatus.INTERNAL_SERVER_ERROR,
                            "Failed to review document: " + e.getMessage()));
        }
    }

    @PutMapping("/{docId}/approve")
    @Operation(summary = "Approve compliance document")
    public ResponseEntity<ApiResponseDTO<ComplianceDocResponse>> approveDocument(
            @PathVariable UUID docId) {

        log.info("Admin approving compliance document: {}", docId);

        try {
            ReviewComplianceDocRequest request = ReviewComplianceDocRequest.builder()
                    .newStatus(ComplianceDocStatus.APPROVED)
                    .build();

            ComplianceDocResponse response = complianceService.reviewDocument(docId, request);

            return ResponseEntity.ok(ApiResponseDTO.success("Document approved successfully", response));
        } catch (Exception e) {
            log.error("Error approving document", e);
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponseDTO.error(HttpStatus.BAD_REQUEST,
                            "Failed to approve document: " + e.getMessage()));
        }
    }

    @PutMapping("/{docId}/reject")
    @Operation(summary = "Reject compliance document")
    public ResponseEntity<ApiResponseDTO<ComplianceDocResponse>> rejectDocument(
            @PathVariable UUID docId,
            @RequestParam(required = false) String reason) {

        log.info("Admin rejecting compliance document: {}", docId);

        try {
            ReviewComplianceDocRequest request = ReviewComplianceDocRequest.builder()
                    .newStatus(ComplianceDocStatus.REJECTED)
                    .rejectionReason(reason)
                    .build();

            ComplianceDocResponse response = complianceService.reviewDocument(docId, request);

            return ResponseEntity.ok(ApiResponseDTO.success("Document rejected successfully", response));
        } catch (Exception e) {
            log.error("Error rejecting document", e);
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponseDTO.error(HttpStatus.BAD_REQUEST, "Failed to reject document: " + e.getMessage()));
        }
    }
}
