package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.BaseEntity;
import fpt.sba.trungthu.entity.enumeration.VerificationTokenType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

/**
 * Mã OTP gửi qua email (quên mật khẩu). Chỉ lưu SHA-256 của mã, không lưu mã gốc.
 * Mã hết hiệu lực khi quá expires_at, đã dùng (used_at) hoặc nhập sai quá số lần cho phép.
 */
@Entity
@Table(name = "verification_tokens", indexes = {
        @Index(name = "IX_verification_tokens_user_type", columnList = "user_id, token_type") })
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationToken extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "FK_verification_tokens_user_id"))
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "token_type", nullable = false, length = 30)
    private VerificationTokenType tokenType;

    @Column(name = "token_hash", nullable = false, length = 64)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "used_at")
    private Instant usedAt;

    @Builder.Default
    @ColumnDefault("0")
    @Column(name = "failed_attempts", nullable = false)
    private Integer failedAttempts = 0;
}
