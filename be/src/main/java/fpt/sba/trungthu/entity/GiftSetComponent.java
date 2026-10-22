package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Check;
import org.hibernate.annotations.Checks;

@Entity
@Table(name = "GIFT_SET_COMPONENT", indexes = {
        @Index(name = "IX_GIFT_SET_COMPONENT_set_product_id", columnList = "set_product_id"),
        @Index(name = "IX_GIFT_SET_COMPONENT_component_variant_id", columnList = "component_variant_id") }, uniqueConstraints = {
                @UniqueConstraint(name = "UQ_GIFT_SET_COMPONENT_set_component", columnNames = { "set_product_id",
                        "component_variant_id" }) })
@Checks({
        @Check(name = "CK_GIFT_SET_COMPONENT_quantity", constraints = "quantity >= 0"),
        @Check(name = "CK_GIFT_SET_COMPONENT_per_set", constraints = "per_set_quantity > 0"),
        @Check(name = "CK_GIFT_SET_COMPONENT_direct", constraints = "direct_quantity >= 0 AND direct_quantity <= quantity")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class GiftSetComponent extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "set_product_id", nullable = false, foreignKey = @ForeignKey(name = "FK_GIFT_SET_COMPONENT_set_product_id"))
    private Product setProduct;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "component_variant_id", nullable = false, foreignKey = @ForeignKey(name = "FK_GIFT_SET_COMPONENT_component_variant_id"))
    private ProductVariant componentVariant;

    @Column(name = "per_set_quantity", nullable = false)
    private Integer perSetQuantity;

    @lombok.Builder.Default
    @Column(name = "quantity", nullable = false)
    private Integer quantity = 0;

    @lombok.Builder.Default
    @Column(name = "direct_quantity", nullable = false)
    private Integer directQuantity = 0;
}
