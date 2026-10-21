package fpt.sba.trungthu.dto.response;

import fpt.sba.trungthu.entity.enumeration.ComplianceDocStatus;
import fpt.sba.trungthu.entity.enumeration.ComplianceDocType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplianceDocResponse {
    private UUID id;
    private String providerEmail;
    private String providerName;
    private ComplianceDocType documentType;
    private String documentUrl;
    private ComplianceDocStatus verificationStatus;
    private String rejectionReason;
    private String verifiedByEmail;
    private LocalDateTime verifiedAt;
    private LocalDateTime submittedAt;
}
