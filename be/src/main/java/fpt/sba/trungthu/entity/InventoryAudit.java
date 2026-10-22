package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.CreatedEntity;
import fpt.sba.trungthu.entity.enumeration.InventoryAuditType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.Nationalized;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "INVENTORY_AUDIT", indexes = {
        @Index(name = "IX_INVENTORY_AUDIT_variant_id", columnList = "variant_id") })
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryAudit extends CreatedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "variant_id", nullable = false, foreignKey = @ForeignKey(name = "FK_INVENTORY_AUDIT_variant_id"))
    private ProductVariant variant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "provider_id", nullable = false, foreignKey = @ForeignKey(name = "FK_INVENTORY_AUDIT_provider_id"))
    private User provider;

    @Enumerated(EnumType.STRING)
    @Column(name = "audit_type", nullable = false, length = 30)
    private InventoryAuditType auditType;

    @Column(name = "quantity_delta", nullable = false)
    private Integer quantityDelta;

    @Column(name = "stock_after", nullable = false)
    private Integer stockAfter;

    @Nationalized
    @Column(name = "reason", length = 500)
    private String reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", foreignKey = @ForeignKey(name = "FK_INVENTORY_AUDIT_order_id"))
    private Order order;

    @Column(name = "created_by", nullable = false, length = 254)
    private String createdBy;

    @PrePersist
    protected void stampCreatedBy() {
        if (createdBy == null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            createdBy = auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())
                    ? auth.getName()
                    : "Hệ thống";
        }
    }
}
