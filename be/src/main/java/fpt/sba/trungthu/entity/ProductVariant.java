package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Check;
import org.hibernate.annotations.Checks;

import java.util.UUID;
import java.math.BigDecimal;

@Entity
@Table(name = "PRODUCT_VARIANT", indexes = {@Index(name = "IX_PRODUCT_VARIANT_product_id", columnList = "product_id")}, uniqueConstraints = {@UniqueConstraint(name = "UQ_PRODUCT_VARIANT_sku", columnNames = {"sku"})})
@Checks({@Check(name = "CK_PRODUCT_VARIANT_price", constraints = "price >= 0"), @Check(name = "CK_PRODUCT_VARIANT_stock_quantity", constraints = "stock_quantity >= 0")})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariant extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "variant_id", nullable = false, updatable = false)
    private UUID id;

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

    @Column(name = "status", nullable = false, length = 30)
    private String status;
}
