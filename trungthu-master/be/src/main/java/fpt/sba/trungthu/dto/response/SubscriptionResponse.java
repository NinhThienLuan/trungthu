package fpt.sba.trungthu.dto.response;

import fpt.sba.trungthu.entity.enumeration.SubscriptionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionResponse {
    private UUID id;
    private String providerEmail;
    private String providerName;
    private String planName;
    private BigDecimal price;
    private Integer maxProductsAllowed;
    private Boolean isFeatured;
    private SubscriptionStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime createdAt;
}
