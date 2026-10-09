package fpt.sba.trungthu.dto.response;

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
public class ProductImageResponse {
    private UUID id;
    private UUID variantId;
    private String imageUrl;
    private String cloudinaryPublicId;
    private Boolean isPrimary;
    private Integer displayOrder;
    private LocalDateTime createdAt;
}
