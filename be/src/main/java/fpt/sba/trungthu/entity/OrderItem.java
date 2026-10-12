package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.CreatedEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Check;
import org.hibernate.annotations.Checks;

import java.math.BigDecimal;

@Entity
@Table(name = "ORDER_ITEM", indexes = { @Index(name = "IX_ORDER_ITEM_order_batch_id", columnList = "order_batch_id"),
        @Index(name = "IX_ORDER_ITEM_variant_id", columnList = "variant_id") })
@Checks({ @Check(name = "CK_ORDER_ITEM_quantity", constraints = "quantity > 0"),
        @Check(name = "CK_ORDER_ITEM_unit_price", constraints = "unit_price >= 0"),
        @Check(name = "CK_ORDER_ITEM_subtotal", constraints = "subtotal >= 0") })
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem extends CreatedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_batch_id", nullable = false, foreignKey = @ForeignKey(name = "FK_ORDER_ITEM_order_batch_id"))
    private OrderBatch orderBatch;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "variant_id", nullable = false, foreignKey = @ForeignKey(name = "FK_ORDER_ITEM_variant_id"))
    private ProductVariant variant;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false, precision = 18, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "subtotal", nullable = false, precision = 18, scale = 2)
    private BigDecimal subtotal;
}
