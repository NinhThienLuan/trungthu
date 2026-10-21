package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Check;
import org.hibernate.annotations.Checks;
import org.hibernate.annotations.GeneratedColumn;

import java.time.LocalDate;

@Entity
@Table(name = "DAILY_CAPACITY", indexes = {
        @Index(name = "IX_DAILY_CAPACITY_provider_id", columnList = "provider_id") }, uniqueConstraints = {
                @UniqueConstraint(name = "UQ_DAILY_CAPACITY_provider_date", columnNames = { "provider_id",
                        "capacity_date" }) })
@Checks({ @Check(name = "CK_DAILY_CAPACITY_max_quantity", constraints = "max_quantity >= 0"),
        @Check(name = "CK_DAILY_CAPACITY_reserved_quantity", constraints = "reserved_quantity >= 0"),
        @Check(name = "CK_DAILY_CAPACITY_reserved", constraints = "reserved_quantity <= max_quantity") })
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class DailyCapacity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "provider_id", nullable = false, foreignKey = @ForeignKey(name = "FK_DAILY_CAPACITY_provider_id"))
    private User provider;

    @Column(name = "capacity_date", nullable = false)
    private LocalDate capacityDate;

    @Column(name = "max_quantity", nullable = false)
    private Integer maxQuantity;

    @Builder.Default
    @ColumnDefault("0")
    @Column(name = "reserved_quantity", nullable = false)
    private Integer reservedQuantity = 0;

    @GeneratedColumn("max_quantity - reserved_quantity")
    @Column(name = "available_quantity", insertable = false, updatable = false)
    private Integer availableQuantity;
}
