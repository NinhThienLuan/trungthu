package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndStatusTrue(String email);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);
}
