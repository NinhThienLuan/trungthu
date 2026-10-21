package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Check;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "ORDER_BATCH", indexes = {
        @Index(name = "IX_ORDER_BATCH_provider_date", columnList = "provider_id,delivery_date"),
        @Index(name = "IX_ORDER_BATCH_capacity_id", columnList = "capacity_id")
}, uniqueConstraints = @UniqueConstraint(name = "UQ_ORDER_BATCH_order_id", columnNames = "order_id"))
@Check(name = "CK_ORDER_BATCH_subtotal", constraints = "subtotal >= 0")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class OrderBatch extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false, foreignKey = @ForeignKey(name = "FK_ORDER_BATCH_order_id"))
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "provider_id", nullable = false, foreignKey = @ForeignKey(name = "FK_ORDER_BATCH_provider_id"))
    private User provider;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "capacity_id", foreignKey = @ForeignKey(name = "FK_ORDER_BATCH_capacity_id"))
    private DailyCapacity capacity;

    @Column(name = "delivery_date", nullable = false)
    private LocalDate deliveryDate;

    @Column(name = "subtotal", nullable = false, precision = 18, scale = 2)
    private BigDecimal subtotal;

    // MVP has one batch per order, so production/delivery status belongs to Order.
    @PrePersist
    @PreUpdate
    protected void validateOwnership() {
        if (order == null || provider == null || !provider.getId().equals(order.getProvider().getId())) {
            throw new IllegalStateException("Batch provider must match order provider");
        }
        if (capacity != null && (!provider.getId().equals(capacity.getProvider().getId())
                || !deliveryDate.minusDays(1).equals(capacity.getCapacityDate()))) {
            throw new IllegalStateException("Capacity must match batch provider and bake date");
        }
    }
}
