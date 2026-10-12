package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.BaseEntity;
import fpt.sba.trungthu.entity.enumeration.AuthProviderType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "user_social_accounts", uniqueConstraints = @UniqueConstraint(name = "uq_social_provider_account", columnNames = {
                "provider", "provider_user_id" }), indexes = {
                                @Index(name = "idx_social_provider_user_id", columnList = "provider, provider_user_id"),
                                @Index(name = "idx_social_user_id", columnList = "user_id")
                })
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class UserSocialAccount extends BaseEntity {

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "user_id", nullable = false)
        private User user;

        @Enumerated(EnumType.STRING)
        @Column(name = "provider", nullable = false, length = 30)
        private AuthProviderType provider;

        @Column(name = "provider_user_id", nullable = false, length = 150)
        private String providerUserId;

        @Column(name = "provider_email", length = 254)
        private String providerEmail;
}
