package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.dto.request.UploadComplianceDocRequest;
import fpt.sba.trungthu.dto.response.ComplianceDocResponse;
import fpt.sba.trungthu.service.ComplianceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/provider/compliance")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Provider Compliance", description = "Provider compliance document management")
@PreAuthorize("hasRole('PROVIDER')")
public class ProviderComplianceController {

    private final ComplianceService complianceService;
    private final SecurityContextService securityContextService;

    private String getCurrentUserEmail() {
        return securityContextService.getCurrentUser().getEmail();
    }

    @PostMapping("/upload")
    @Operation(summary = "Upload compliance document")
    public ResponseEntity<ApiResponseDTO<ComplianceDocResponse>> uploadDocument(
            @RequestParam("documentType") String documentType,
            @RequestParam("file") MultipartFile file) {
        
        log.info("Provider uploading compliance document: {}", documentType);
        
        try {
            String providerEmail = getCurrentUserEmail();
            
            UploadComplianceDocRequest request = UploadComplianceDocRequest.builder()
                    .documentType(documentType)
                    .file(file)
                    .build();
            
            ComplianceDocResponse response = complianceService.uploadDocument(providerEmail, request);
            
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponseDTO.success("Compliance document uploaded successfully", response));
        } catch (Exception e) {
            log.error("Error uploading compliance document", e);
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponseDTO.error(HttpStatus.BAD_REQUEST, "Failed to upload document: " + e.getMessage()));
        }
    }

    @GetMapping
    @Operation(summary = "Get my compliance documents")
    public ResponseEntity<ApiResponseDTO<List<ComplianceDocResponse>>> getMyDocuments() {
        log.info("Provider getting compliance documents");
        
        try {
            String providerEmail = getCurrentUserEmail();
            List<ComplianceDocResponse> documents = complianceService.getProviderDocuments(providerEmail);
            
            return ResponseEntity.ok(ApiResponseDTO.success("Documents retrieved successfully", documents));
        } catch (Exception e) {
            log.error("Error getting compliance documents", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDTO.error(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to retrieve documents: " + e.getMessage()));
        }
    }

    @GetMapping("/status")
    @Operation(summary = "Check if provider has approved compliance documents")
    public ResponseEntity<ApiResponseDTO<Boolean>> checkComplianceStatus() {
        log.info("Provider checking compliance status");
        
        try {
            String providerEmail = getCurrentUserEmail();
            boolean hasApproved = complianceService.hasApprovedDocument(providerEmail);
            
            return ResponseEntity.ok(ApiResponseDTO.success("Compliance status checked", hasApproved));
        } catch (Exception e) {
            log.error("Error checking compliance status", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDTO.error(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to check status: " + e.getMessage()));
        }
    }
}
