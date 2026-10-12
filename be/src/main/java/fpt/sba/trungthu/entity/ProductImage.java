package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.CreatedEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Check;

@Entity
@Table(name = "PRODUCT_IMAGE", indexes = { @Index(name = "IX_PRODUCT_IMAGE_variant_id", columnList = "variant_id") })
@Check(name = "CK_PRODUCT_IMAGE_display_order", constraints = "display_order >= 0")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ProductImage extends CreatedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "variant_id", nullable = false, foreignKey = @ForeignKey(name = "FK_PRODUCT_IMAGE_variant_id"))
    private ProductVariant variant;

    @Column(name = "image_url", nullable = false, length = 2048)
    private String imageUrl;

    @Builder.Default
    @ColumnDefault("0")
    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary = false;

    @Builder.Default
    @ColumnDefault("0")
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;
}
