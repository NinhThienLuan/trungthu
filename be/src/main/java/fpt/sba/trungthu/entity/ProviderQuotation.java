package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.BaseEntity;
import fpt.sba.trungthu.entity.enumeration.QuoteStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Check;
import org.hibernate.annotations.Checks;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "PROVIDER_QUOTATION", uniqueConstraints = {
        @UniqueConstraint(name = "UQ_PROVIDER_QUOTATION_request_provider", columnNames = { "request_id", "provider_id" }) }, indexes = {
        @Index(name = "IX_PROVIDER_QUOTATION_request_id", columnList = "request_id"),
        @Index(name = "IX_PROVIDER_QUOTATION_provider_id", columnList = "provider_id") })
@Checks({ @Check(name = "CK_PROVIDER_QUOTATION_quoted_price", constraints = "quoted_price >= 0"),
        @Check(name = "CK_PROVIDER_QUOTATION_offered_quantity", constraints = "offered_quantity > 0") })
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderQuotation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "request_id", nullable = false, foreignKey = @ForeignKey(name = "FK_PROVIDER_QUOTATION_request_id"))
    private BulkRequest request;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "provider_id", nullable = false, foreignKey = @ForeignKey(name = "FK_PROVIDER_QUOTATION_provider_id"))
    private User provider;

    @Column(name = "quoted_price", nullable = false, precision = 18, scale = 2)
    private BigDecimal quotedPrice;

    @Column(name = "offered_quantity", nullable = false)
    private Integer offeredQuantity;

    @Column(name = "estimated_delivery_date")
    private LocalDate estimatedDeliveryDate;

    @Column(name = "valid_until")
    private LocalDate validUntil;

    @Column(name = "note", length = 100000)
    private String note;

    // Trạng thái báo giá: PENDING → ACCEPTED / REJECTED / EXPIRED
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private QuoteStatus status;

    // Chuyển trạng thái báo giá với validation
    public void transitionStatus(QuoteStatus newStatus) {
        this.status.validateTransition(newStatus);
        this.status = newStatus;
    }
}

