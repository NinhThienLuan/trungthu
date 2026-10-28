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

@Entity
@Table(name = "CART_ITEM", indexes = {
        @Index(name = "IX_CART_ITEM_customer_id", columnList = "customer_id"),
        @Index(name = "IX_CART_ITEM_set_product_id", columnList = "set_product_id") }, uniqueConstraints = {
                @UniqueConstraint(name = "UQ_CART_ITEM_customer_variant", columnNames = { "customer_id", "variant_id" }),
                @UniqueConstraint(name = "UQ_CART_ITEM_customer_set", columnNames = { "customer_id", "set_product_id" }) })
@org.hibernate.annotations.Checks({
        @Check(name = "CK_CART_ITEM_quantity", constraints = "quantity > 0"),
        @Check(name = "CK_CART_ITEM_target", constraints = "(variant_id IS NOT NULL AND set_product_id IS NULL) "
                + "OR (variant_id IS NULL AND set_product_id IS NOT NULL)")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CartItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false, foreignKey = @ForeignKey(name = "FK_CART_ITEM_customer_id"))
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", foreignKey = @ForeignKey(name = "FK_CART_ITEM_variant_id"))
    private ProductVariant variant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "set_product_id", foreignKey = @ForeignKey(name = "FK_CART_ITEM_set_product_id"))
    private Product setProduct;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @lombok.Builder.Default
    @Column(name = "selected", nullable = false)
    private Boolean selected = false;
}
