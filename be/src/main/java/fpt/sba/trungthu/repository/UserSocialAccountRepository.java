package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.UserSocialAccount;
import fpt.sba.trungthu.entity.enumeration.AuthProviderType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserSocialAccountRepository extends JpaRepository<UserSocialAccount, UUID> {

    Optional<UserSocialAccount> findByProviderAndProviderUserId(AuthProviderType provider, String providerUserId);

    List<UserSocialAccount> findByUser(User user);

    boolean existsByProviderAndProviderUserId(AuthProviderType provider, String providerUserId);
}
