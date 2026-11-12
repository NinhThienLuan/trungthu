package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.CreatedEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "STORE_REVIEW", uniqueConstraints = @UniqueConstraint(name = "UQ_STORE_REVIEW_order", columnNames = "order_id"),
        indexes = @Index(name = "IX_STORE_REVIEW_provider_id", columnList = "provider_id"))
@Getter @Setter @SuperBuilder @NoArgsConstructor @AllArgsConstructor
public class StoreReview extends CreatedEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "provider_id", nullable = false)
    private User provider;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @Column(name = "rating", nullable = false)
    private int rating;

    @Column(name = "comment", length = 2000)
    private String comment;
}
