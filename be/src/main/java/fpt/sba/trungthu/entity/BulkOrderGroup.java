package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.math.BigDecimal;

/** Đơn tổng B2B; mỗi đơn theo xưởng là một BulkOrder con. */
@Entity
@Table(name = "BULK_ORDER_GROUP", uniqueConstraints = @UniqueConstraint(name = "UQ_BULK_ORDER_GROUP_request", columnNames = "request_id"))
@Getter @Setter @SuperBuilder @NoArgsConstructor @AllArgsConstructor
public class BulkOrderGroup extends BaseEntity {
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "request_id", nullable = false)
    private BulkRequest request;

    @Column(name = "quantity", nullable = false)
    private int quantity;
    @Column(name = "gross_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal grossAmount;
    @Column(name = "discount_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal discountAmount;
    @Column(name = "total_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalAmount;
    @Column(name = "deposit_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal depositAmount;
}
