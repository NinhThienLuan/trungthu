package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.CreatedEntity;
import fpt.sba.trungthu.entity.enumeration.SubscriptionStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Check;
import org.hibernate.annotations.Checks;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "SUBSCRIPTION", indexes = { @Index(name = "IX_SUBSCRIPTION_provider_id", columnList = "provider_id") })
@Checks({ @Check(name = "CK_SUBSCRIPTION_price", constraints = "price >= 0"),
        @Check(name = "CK_SUBSCRIPTION_dates", constraints = "end_date >= start_date"),
        @Check(name = "CK_SUBSCRIPTION_max_products", constraints = "max_products_allowed IS NULL OR max_products_allowed > 0") })
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Subscription extends CreatedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "provider_id", nullable = false, foreignKey = @ForeignKey(name = "FK_SUBSCRIPTION_provider_id"))
    private User provider;

    @Column(name = "plan_name", nullable = false, length = 255)
    private String planName;

    @Column(name = "price", nullable = false, precision = 18, scale = 2)
    private BigDecimal price;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    /** Ghi chú / mã giao dịch chuyển khoản seller gửi kèm yêu cầu gói */
    @Column(name = "payment_note", length = 500)
    private String paymentNote;

    @Column(name = "max_products_allowed")
    private Integer maxProductsAllowed;

    @Builder.Default
    @Column(name = "is_featured", nullable = false)
    private Boolean isFeatured = false;

    // Trạng thái đăng ký: PENDING → ACTIVE → EXPIRED / CANCELLED
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private SubscriptionStatus status;

    // Chuyển trạng thái subscription với validation
    public void transitionStatus(SubscriptionStatus newStatus) {
        this.status.validateTransition(newStatus);
        this.status = newStatus;
    }
}

