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
    
    @NotNull(message = "Trạng thái là bắt buộc")
    private ComplianceDocStatus newStatus; // APPROVED or REJECTED
    
    @Size(max = 500, message = "Lý do từ chối tối đa 500 ký tự")
    private String rejectionReason; // required if newStatus = REJECTED
}
