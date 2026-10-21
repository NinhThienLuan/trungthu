package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Check;
import org.hibernate.annotations.Checks;

import java.math.BigDecimal;

@Entity
@Table(name = "PRODUCT_VARIANT", indexes = {
        @Index(name = "IX_PRODUCT_VARIANT_product_id", columnList = "product_id") }, uniqueConstraints = {
                @UniqueConstraint(name = "UQ_PRODUCT_VARIANT_sku", columnNames = { "sku" }) })
@Checks({ @Check(name = "CK_PRODUCT_VARIANT_price", constraints = "price >= 0"),
        @Check(name = "CK_PRODUCT_VARIANT_stock_quantity", constraints = "stock_quantity >= 0"),
        @Check(name = "CK_PRODUCT_VARIANT_box_capacity", constraints = "box_capacity IS NULL OR box_capacity > 0") })
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariant extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false, foreignKey = @ForeignKey(name = "FK_PRODUCT_VARIANT_product_id"))
    private Product product;

    @Column(name = "variant_name", nullable = false, length = 255)
    private String variantName;

    @Column(name = "sku", nullable = false, length = 255)
    private String sku;

    @Column(name = "price", nullable = false, precision = 18, scale = 2)
    private BigDecimal price;

    @Builder.Default
    @ColumnDefault("0")
    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    // Chỉ dùng cho LOOSE_CAKE (150/200/250g)
    @Column(name = "weight_gram")
    private Integer weightGram;

    // Chỉ dùng cho BOX_SHELL: số ô bánh trong hộp (dung tích linh hoạt > 0)
    @Column(name = "box_capacity")
    private Integer boxCapacity;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private fpt.sba.trungthu.entity.enumeration.ProductStatus status;
}
