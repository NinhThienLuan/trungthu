package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Check;

import java.util.UUID;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "ORDER_BATCH", indexes = {@Index(name = "IX_ORDER_BATCH_order_id", columnList = "order_id"), @Index(name = "IX_ORDER_BATCH_provider_id", columnList = "provider_id"), @Index(name = "IX_ORDER_BATCH_capacity_id", columnList = "capacity_id")})
@Check(name = "CK_ORDER_BATCH_subtotal", constraints = "subtotal >= 0")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class OrderBatch extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "order_batch_id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false, foreignKey = @ForeignKey(name = "FK_ORDER_BATCH_order_id"))
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "provider_id", nullable = false, foreignKey = @ForeignKey(name = "FK_ORDER_BATCH_provider_id"))
    private User provider;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "capacity_id", nullable = true, foreignKey = @ForeignKey(name = "FK_ORDER_BATCH_capacity_id"))
    private DailyCapacity capacity;

    @Column(name = "delivery_date", nullable = false)
    private LocalDate deliveryDate;

    @Column(name = "subtotal", nullable = false, precision = 18, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "batch_status", nullable = false, length = 30)
    private String batchStatus;
}
