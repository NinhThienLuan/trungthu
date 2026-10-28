package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.CreatedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Check;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Table(name = "PRODUCT_IMAGE", indexes = {
        @Index(name = "IX_PRODUCT_IMAGE_product_id", columnList = "product_id") })
@Check(name = "CK_PRODUCT_IMAGE_display_order", constraints = "display_order >= 0")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ProductImage extends CreatedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false, foreignKey = @ForeignKey(name = "FK_PRODUCT_IMAGE_product_id"))
    private Product product;

    @Column(name = "image_url", nullable = false, length = 2_000_000)
    private String imageUrl;

    @lombok.Builder.Default
    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary = false;

    @lombok.Builder.Default
    @ColumnDefault("0")
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;
}
