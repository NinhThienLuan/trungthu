package fpt.sba.trungthu.dto.response;

import fpt.sba.trungthu.entity.enumeration.InventoryAuditType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryAuditResponse {
    private UUID id;
    private InventoryAuditType type;
    private Integer quantityDelta;
    private Integer stockAfter;
    private String reason;
    private LocalDateTime createdAt;
    private String createdBy;
}
