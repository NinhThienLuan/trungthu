package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.VerificationToken;
import fpt.sba.trungthu.entity.enumeration.VerificationTokenType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, UUID> {

    /** Mã còn hiệu lực gần nhất (mỗi lần gửi mới đã xoá mã cũ chưa dùng) */
    Optional<VerificationToken> findFirstByUserIdAndTokenTypeAndUsedAtIsNullOrderByCreatedAtDesc(
            UUID userId, VerificationTokenType tokenType);

    @Modifying
    void deleteByUserIdAndTokenTypeAndUsedAtIsNull(UUID userId, VerificationTokenType tokenType);
}
