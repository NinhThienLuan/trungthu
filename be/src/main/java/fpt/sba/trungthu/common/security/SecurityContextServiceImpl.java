package fpt.sba.trungthu.common.security;

import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Slf4j
@Service("securityContextService")
@RequiredArgsConstructor
public class SecurityContextServiceImpl implements SecurityContextService {

    private final UserRepository userRepository;

    @Override
    public User getCurrentUser() {
        String email = getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    @Override
    public UUID getCurrentUserId() {
        return getCurrentUser().getId();
    }

    @Override
    public String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated access");
        }
        return auth.getName();
    }

    @Override
    public boolean hasRole(UserRole role) {
        try {
            User user = getCurrentUser();
            return user.getRole() == role;
        } catch (Exception ex) {
            log.debug("Error checking role {}: {}", role, ex.getMessage());
            return false;
        }
    }

    @Override
    public boolean isOwner(UUID resourceOwnerId) {
        if (resourceOwnerId == null) {
            return false;
        }
        try {
            UUID currentId = getCurrentUserId();
            return currentId.equals(resourceOwnerId);
        } catch (Exception ex) {
            log.debug("Ownership verification failed: {}", ex.getMessage());
            return false;
        }
    }
}
