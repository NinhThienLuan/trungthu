package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.BaseEntity;
import fpt.sba.trungthu.entity.enumeration.BulkOrderStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "BULK_ORDER", uniqueConstraints = @UniqueConstraint(name = "UQ_BULK_ORDER_quote", columnNames = "quote_id"))
@Getter @Setter @SuperBuilder @NoArgsConstructor @AllArgsConstructor
public class BulkOrder extends BaseEntity {
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quote_id", nullable = false)
    private ProviderQuotation quote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private BulkOrderGroup group;

    @Column(name = "quantity", nullable = false)
    private int quantity;
    @Column(name = "cakes_per_box", nullable = false)
    private int cakesPerBox;
    @Column(name = "unit_price", nullable = false, precision = 18, scale = 2)
    private BigDecimal unitPrice;
    @Column(name = "gross_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal grossAmount;
    @Column(name = "discount_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal discountAmount;
    @Column(name = "total_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalAmount;
    @Column(name = "deposit_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal depositAmount;
    @Column(name = "delivery_date", nullable = false)
    private LocalDate deliveryDate;
    @Column(name = "deposit_deadline", nullable = false)
    private LocalDateTime depositDeadline;
    @Column(name = "recipient_name", length = 255)
    private String recipientName;
    @Column(name = "recipient_phone", length = 20)
    private String recipientPhone;
    @Column(name = "delivery_address", length = 1000)
    private String deliveryAddress;
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private BulkOrderStatus status;
}
