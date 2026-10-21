package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.CreatedEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Check;

import java.math.BigDecimal;

@Entity
@Table(name = "CUSTOM_BOX", indexes = { @Index(name = "IX_CUSTOM_BOX_order_batch_id", columnList = "order_batch_id") })
@Check(name = "CK_CUSTOM_BOX_box_price", constraints = "box_price >= 0")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CustomBox extends CreatedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_batch_id", nullable = false, foreignKey = @ForeignKey(name = "FK_CUSTOM_BOX_order_batch_id"))
    private OrderBatch orderBatch;

    @Column(name = "box_name", nullable = false, length = 255)
    private String boxName;

    @Column(name = "box_price", nullable = false, precision = 18, scale = 2)
    private BigDecimal boxPrice;

    @Column(name = "note", length = 255)
    private String note;
}
