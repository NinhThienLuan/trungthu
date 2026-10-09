package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Check;
import org.hibernate.annotations.Checks;

import java.util.UUID;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "PROVIDER_QUOTATION", indexes = {@Index(name = "IX_PROVIDER_QUOTATION_request_id", columnList = "request_id"), @Index(name = "IX_PROVIDER_QUOTATION_provider_id", columnList = "provider_id")})
@Checks({@Check(name = "CK_PROVIDER_QUOTATION_quoted_price", constraints = "quoted_price >= 0"), @Check(name = "CK_PROVIDER_QUOTATION_offered_quantity", constraints = "offered_quantity > 0")})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderQuotation extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "quotation_id", nullable = false, updatable = false)
    private UUID id;

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

    @Column(name = "note", length = 100000)
    private String note;

    @Column(name = "status", nullable = false, length = 30)
    private String status;
}
