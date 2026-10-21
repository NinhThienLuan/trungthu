package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.BaseEntity;
import fpt.sba.trungthu.entity.enumeration.ProductType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "PRODUCT", indexes = { @Index(name = "IX_PRODUCT_provider_id", columnList = "provider_id") })
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

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private fpt.sba.trungthu.entity.enumeration.ProductStatus status;

    @Builder.Default
    @OneToMany(mappedBy = "product")
    private List<ProductVariant> variants = new ArrayList<>();
}
