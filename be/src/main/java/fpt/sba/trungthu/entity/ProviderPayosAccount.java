package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.time.Instant;

@Entity
@Table(name = "PROVIDER_PAYOS_ACCOUNT", uniqueConstraints =
        @UniqueConstraint(name = "UQ_PROVIDER_PAYOS_ACCOUNT_provider", columnNames = "provider_id"))
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderPayosAccount extends BaseEntity {
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "provider_id", nullable = false,
            foreignKey = @ForeignKey(name = "FK_PROVIDER_PAYOS_ACCOUNT_provider"))
    private User provider;

    @Column(name = "client_id", nullable = false, length = 255)
    private String clientId;

    @Column(name = "api_key_ciphertext", nullable = false, length = 1024)
    private String apiKeyCiphertext;

    @Column(name = "checksum_key_ciphertext", nullable = false, length = 1024)
    private String checksumKeyCiphertext;

    @Column(name = "webhook_confirmed_at")
    private Instant webhookConfirmedAt;
}
