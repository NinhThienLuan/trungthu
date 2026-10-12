package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.BaseEntity;
import fpt.sba.trungthu.entity.enumeration.ProductType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Check;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "PRODUCT", indexes = { @Index(name = "IX_PRODUCT_provider_id", columnList = "provider_id") })
@Check(name = "CK_PRODUCT_shelf_life_days", constraints = "shelf_life_days IS NULL OR shelf_life_days > 0")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Product extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "provider_id", nullable = false, foreignKey = @ForeignKey(name = "FK_PRODUCT_provider_id"))
    private User provider;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", length = 100000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", nullable = false, length = 30)
    private ProductType productType;

    // Hạn sử dụng bánh tươi tính từ ngày ra lò; chỉ áp dụng cho LOOSE_CAKE
    @Column(name = "shelf_life_days")
    private Integer shelfLifeDays;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private fpt.sba.trungthu.entity.enumeration.ProductStatus status;

    @Builder.Default
    @OneToMany(mappedBy = "product")
    private List<ProductVariant> variants = new ArrayList<>();
}
