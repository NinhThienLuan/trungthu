package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.CreatedEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Check;

@Entity
@Table(name = "PRODUCT_REVIEW",
        uniqueConstraints = { @UniqueConstraint(name = "UQ_PRODUCT_REVIEW_order_product", columnNames = { "order_id", "product_id" }) },
        indexes = {
                @Index(name = "IX_PRODUCT_REVIEW_product_id", columnList = "product_id"),
                @Index(name = "IX_PRODUCT_REVIEW_customer_id", columnList = "customer_id"),
                @Index(name = "IX_PRODUCT_REVIEW_order_id", columnList = "order_id")
        })
@Check(name = "CK_PRODUCT_REVIEW_rating", constraints = "rating >= 1 AND rating <= 5")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ProductReview extends CreatedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false, foreignKey = @ForeignKey(name = "FK_PRODUCT_REVIEW_product_id"))
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false, foreignKey = @ForeignKey(name = "FK_PRODUCT_REVIEW_customer_id"))
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false, foreignKey = @ForeignKey(name = "FK_PRODUCT_REVIEW_order_id"))
    private Order order;

    @Column(name = "rating", nullable = false)
    private int rating;

    @org.hibernate.annotations.Nationalized
    @Column(name = "comment", length = 2000)
    private String comment;
}
