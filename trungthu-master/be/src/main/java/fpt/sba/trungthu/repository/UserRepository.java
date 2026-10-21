package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndStatus(String email, fpt.sba.trungthu.entity.enumeration.UserStatus status);

    default Optional<User> findByEmailAndStatus(String email, String status) {
        if (status == null) {
            return Optional.empty();
        }
        return findByEmailAndStatus(email, fpt.sba.trungthu.entity.enumeration.UserStatus.valueOf(status.toUpperCase()));
    }

    boolean existsByEmail(String email);

}
