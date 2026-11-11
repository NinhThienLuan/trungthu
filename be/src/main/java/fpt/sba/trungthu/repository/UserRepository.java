package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    Optional<User> findForUpdateByEmailAndStatus(String email, fpt.sba.trungthu.entity.enumeration.UserStatus status);

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndStatus(String email, fpt.sba.trungthu.entity.enumeration.UserStatus status);

    default Optional<User> findByEmailAndStatus(String email, String status) {
        if (status == null) {
            return Optional.empty();
        }
        return findByEmailAndStatus(email, fpt.sba.trungthu.entity.enumeration.UserStatus.valueOf(status.toUpperCase()));
    }

    boolean existsByEmail(String email);

    long countByRole(UserRole role);

    long countByRoleAndIsComplianceApproved(UserRole role, Boolean isComplianceApproved);

    long countByRoleAndIsSeasonActive(UserRole role, Boolean isSeasonActive);

    List<User> findByRoleAndStatusAndIsComplianceApprovedTrueAndIsSeasonActiveTrue(UserRole role, UserStatus status);

    /**
     * Tìm User với pessimistic lock (để update isComplianceApproved thread-safe)
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<User> findForUpdateById(UUID id);

    default Optional<User> findByIdWithLock(UUID id) {
        return findForUpdateById(id);
    }

}
