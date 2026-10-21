package fpt.sba.trungthu.service.impl;

import fpt.sba.trungthu.dto.request.ReviewComplianceDocRequest;
import fpt.sba.trungthu.dto.request.UploadComplianceDocRequest;
import fpt.sba.trungthu.dto.response.ComplianceDocResponse;
import fpt.sba.trungthu.entity.StoreComplianceDoc;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.ComplianceDocStatus;
import fpt.sba.trungthu.entity.enumeration.ComplianceDocType;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import fpt.sba.trungthu.repository.StoreComplianceDocRepository;
import fpt.sba.trungthu.repository.UserRepository;
import fpt.sba.trungthu.service.ComplianceService;
import fpt.sba.trungthu.service.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ComplianceServiceImpl implements ComplianceService {

    private final StoreComplianceDocRepository complianceDocRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;

    private static final String[] ALLOWED_DOC_TYPES = {"application/pdf", "image/png", "image/jpeg"};
    private static final int MAX_DOC_SIZE_MB = 10;

    @Override
    @Transactional
    public ComplianceDocResponse uploadDocument(String providerEmail, UploadComplianceDocRequest request) {
        log.info("Provider {} uploading compliance document type: {}", providerEmail, request.getDocumentType());
        
        try {
            // Find provider
            User provider = userRepository.findByEmailAndStatus(providerEmail, UserStatus.ACTIVE)
                    .orElseThrow(() -> new IllegalArgumentException("Provider not found or inactive: " + providerEmail));

            // Parse document type from string
            ComplianceDocType docType;
            try {
                docType = ComplianceDocType.valueOf(request.getDocumentType());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid document type: " + request.getDocumentType());
            }

            // Validate file: only images/PDF, max 10MB (NFR-SEC-03: block executables)
            storageService.validateFile(request.getFile(), ALLOWED_DOC_TYPES, MAX_DOC_SIZE_MB);

            // Store file
            String documentUrl = storageService.uploadFile(request.getFile(), "compliance");

            // Create document
            StoreComplianceDoc doc = StoreComplianceDoc.builder()
                    .provider(provider)
                    .documentType(docType)
                    .documentUrl(documentUrl)
                    .verificationStatus(ComplianceDocStatus.PENDING)
                    .submittedAt(LocalDateTime.now())
                    .build();

            StoreComplianceDoc savedDoc = complianceDocRepository.save(doc);
            log.info("Compliance document uploaded successfully: {}", savedDoc.getId());

            return mapToResponse(savedDoc);
        } catch (Exception e) {
            log.error("Error uploading compliance document for provider: {}", providerEmail, e);
            throw e;
        } finally {
            log.debug("Finished uploadDocument for provider: {}", providerEmail);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComplianceDocResponse> getProviderDocuments(String providerEmail) {
        log.info("Getting compliance documents for provider: {}", providerEmail);
        
        try {
            User provider = userRepository.findByEmailAndStatus(providerEmail, UserStatus.ACTIVE)
                    .orElseThrow(() -> new IllegalArgumentException("Provider not found or inactive: " + providerEmail));

            List<StoreComplianceDoc> documents = complianceDocRepository
                    .findByProviderIdOrderBySubmittedAtDesc(provider.getId());

            log.info("Found {} documents for provider: {}", documents.size(), providerEmail);
            return documents.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting documents for provider: {}", providerEmail, e);
            throw e;
        } finally {
            log.debug("Finished getProviderDocuments for provider: {}", providerEmail);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasApprovedDocument(String providerEmail) {
        log.info("Checking approved document for provider: {}", providerEmail);
        
        try {
            User provider = userRepository.findByEmailAndStatus(providerEmail, UserStatus.ACTIVE)
                    .orElse(null);

            if (provider == null) {
                log.warn("Provider not found: {}", providerEmail);
                return false;
            }

            boolean hasApproved = complianceDocRepository.hasApprovedDocument(provider.getId());
            log.info("Provider {} has approved document: {}", providerEmail, hasApproved);
            
            return hasApproved;
        } catch (Exception e) {
            log.error("Error checking approved document for provider: {}", providerEmail, e);
            return false;
        } finally {
            log.debug("Finished hasApprovedDocument for provider: {}", providerEmail);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComplianceDocResponse> getDocumentsByStatus(ComplianceDocStatus status) {
        log.info("Getting compliance documents with status: {}", status);
        
        try {
            List<StoreComplianceDoc> documents = complianceDocRepository
                    .findByVerificationStatusOrderBySubmittedAtAsc(status);

            log.info("Found {} documents with status: {}", documents.size(), status);
            return documents.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting documents by status: {}", status, e);
            throw e;
        } finally {
            log.debug("Finished getDocumentsByStatus for status: {}", status);
        }
    }

    @Override
    @Transactional
    public ComplianceDocResponse reviewDocument(UUID docId, ReviewComplianceDocRequest request) {
        log.info("Reviewing compliance document: {}", docId);
        
        try {
            // Find document with pessimistic lock
            StoreComplianceDoc doc = complianceDocRepository.findByIdWithLock(docId)
                    .orElseThrow(() -> new IllegalArgumentException("Document not found: " + docId));

            // Validate status transition
            if (doc.getVerificationStatus() != ComplianceDocStatus.PENDING) {
                throw new IllegalStateException("Only PENDING documents can be reviewed. Current status: " + doc.getVerificationStatus());
            }

            // Validate rejection reason
            if (request.getNewStatus() == ComplianceDocStatus.REJECTED) {
                if (request.getRejectionReason() == null || request.getRejectionReason().trim().isEmpty()) {
                    throw new IllegalArgumentException("Rejection reason is required when rejecting document");
                }
            }

            // Update document
            doc.transitionVerificationStatus(request.getNewStatus());
            doc.setVerifiedAt(LocalDateTime.now());
            doc.setRejectionReason(request.getRejectionReason());

            StoreComplianceDoc updatedDoc = complianceDocRepository.save(doc);
            log.info("Document reviewed successfully: {}", docId);

            return mapToResponse(updatedDoc);
        } catch (Exception e) {
            log.error("Error reviewing document: {}", docId, e);
            throw e;
        } finally {
            log.debug("Finished reviewDocument for ID: {}", docId);
        }
    }

    private ComplianceDocResponse mapToResponse(StoreComplianceDoc doc) {
        return ComplianceDocResponse.builder()
                .id(doc.getId())
                .providerEmail(doc.getProvider().getEmail())
                .providerName(doc.getProvider().getFullName())
                .documentType(doc.getDocumentType())
                .documentUrl(doc.getDocumentUrl())
                .verificationStatus(doc.getVerificationStatus())
                .rejectionReason(doc.getRejectionReason())
                .verifiedByEmail(doc.getVerifiedBy() != null ? doc.getVerifiedBy().getEmail() : null)
                .verifiedAt(doc.getVerifiedAt())
                .submittedAt(doc.getSubmittedAt())
                .build();
    }
}
