package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.BaseEntity;
import fpt.sba.trungthu.entity.enumeration.ProductionBatchStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Check;
import org.hibernate.annotations.Checks;

import java.time.LocalDate;

@Entity
@Table(name = "PRODUCTION_BATCH", indexes = {
        @Index(name = "IX_PRODUCTION_BATCH_capacity_id", columnList = "capacity_id"),
        @Index(name = "IX_PRODUCTION_BATCH_variant_id", columnList = "variant_id") })
@Checks({ @Check(name = "CK_PRODUCTION_BATCH_planned_quantity", constraints = "planned_quantity >= 0"),
        @Check(name = "CK_PRODUCTION_BATCH_produced_quantity", constraints = "produced_quantity >= 0") })
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ProductionBatch extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "capacity_id", nullable = true, foreignKey = @ForeignKey(name = "FK_PRODUCTION_BATCH_capacity_id"))
    private DailyCapacity capacity;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "variant_id", nullable = false, foreignKey = @ForeignKey(name = "FK_PRODUCTION_BATCH_variant_id"))
    private ProductVariant variant;

    @Column(name = "production_date", nullable = false)
    private LocalDate productionDate;

    @Column(name = "planned_quantity", nullable = false)
    private Integer plannedQuantity;

    @Builder.Default
    @ColumnDefault("0")
    @Column(name = "produced_quantity", nullable = false)
    private Integer producedQuantity = 0;

    // Trạng thái lô sản xuất: PLANNED → IN_PROGRESS → COMPLETED / CANCELLED
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ProductionBatchStatus status;

    // Chuyển trạng thái lô sản xuất với validation
    public void transitionStatus(ProductionBatchStatus newStatus) {
        this.status.validateTransition(newStatus);
        this.status = newStatus;
    }
}

