package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.CreatedEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.UUID;
import java.time.LocalDateTime;
import org.hibernate.annotations.FractionalSeconds;
import java.time.ZoneOffset;

@Entity
@Table(name = "COMPLAINT", indexes = {@Index(name = "IX_COMPLAINT_customer_id", columnList = "customer_id"), @Index(name = "IX_COMPLAINT_order_id", columnList = "order_id"), @Index(name = "IX_COMPLAINT_provider_id", columnList = "provider_id")})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Complaint extends CreatedEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "complaint_id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false, foreignKey = @ForeignKey(name = "FK_COMPLAINT_customer_id"))
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false, foreignKey = @ForeignKey(name = "FK_COMPLAINT_order_id"))
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "provider_id", nullable = false, foreignKey = @ForeignKey(name = "FK_COMPLAINT_provider_id"))
    private User provider;

    @Column(name = "complaint_type", nullable = false, length = 255)
    private String complaintType;

    @Column(name = "subject", nullable = false, length = 255)
    private String subject;

    @Column(name = "description", length = 100000)
    private String description;

    @Column(name = "status", nullable = false, length = 30)
    private String status;

    @Column(name = "resolved_at")
    @FractionalSeconds(0)
    private LocalDateTime resolvedAt;
}
