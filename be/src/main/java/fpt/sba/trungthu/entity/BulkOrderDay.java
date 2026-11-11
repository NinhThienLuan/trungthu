package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Entity
@Table(name = "BULK_ORDER_DAY", uniqueConstraints = @UniqueConstraint(name = "UQ_BULK_ORDER_DAY_date", columnNames = {"order_id", "production_date"}))
@Getter @Setter @SuperBuilder @NoArgsConstructor @AllArgsConstructor
public class BulkOrderDay extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private BulkOrder order;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "capacity_id", nullable = false)
    private DailyCapacity capacity;
    @Column(name = "production_date", nullable = false)
    private LocalDate productionDate;
    @Column(name = "planned_cakes", nullable = false)
    private int plannedCakes;
    @Column(name = "completed", nullable = false)
    private boolean completed;
}
