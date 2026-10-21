package fpt.sba.trungthu.dto.request;

import fpt.sba.trungthu.entity.enumeration.ComplianceDocStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewComplianceDocRequest {
    
    @NotNull(message = "Status is required")
    private ComplianceDocStatus newStatus; // APPROVED or REJECTED
    
    @Size(max = 500, message = "Rejection reason must not exceed 500 characters")
    private String rejectionReason; // required if newStatus = REJECTED
}
