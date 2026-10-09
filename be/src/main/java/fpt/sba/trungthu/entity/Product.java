package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Entity
@Table(name = "PRODUCT", indexes = {@Index(name = "IX_PRODUCT_provider_id", columnList = "provider_id")})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Product extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "product_id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "provider_id", nullable = false, foreignKey = @ForeignKey(name = "FK_PRODUCT_provider_id"))
    private User provider;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", length = 100000)
    private String description;

    @Column(name = "status", nullable = false, length = 30)
    private String status;
}
