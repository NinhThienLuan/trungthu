package fpt.sba.trungthu.service.impl;

import fpt.sba.trungthu.common.mapper.UserMapper;
import fpt.sba.trungthu.dto.response.UserResponse;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import fpt.sba.trungthu.repository.UserRepository;
import fpt.sba.trungthu.service.ProviderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProviderServiceImpl implements ProviderService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getMyStoreProfile(String providerEmail) {
        log.info("Fetching store profile for provider: {}", providerEmail);
        try {
            User provider = findActiveProvider(providerEmail);
            return userMapper.toResponse(provider);
        } catch (ResponseStatusException rse) {
            throw rse;
        } catch (Exception ex) {
            log.error("Error retrieving store profile for {}: {}", providerEmail, ex.getMessage(), ex);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cannot fetch store profile");
        } finally {
            log.debug("Completed getMyStoreProfile for: {}", providerEmail);
        }
    }

    @Override
    @Transactional
    public UserResponse updateStoreProfile(String providerEmail, String storeName, String address) {
        log.info("Updating store profile for provider: {} with storeName: {}", providerEmail, storeName);
        try {
            User provider = findActiveProvider(providerEmail);
            if (storeName != null && !storeName.trim().isEmpty()) {
                provider.setStoreName(storeName.trim());
            }
            if (address != null) {
                provider.setAddress(address.trim());
            }
            User saved = userRepository.save(provider);
            log.info("Store profile updated successfully for provider: {}", providerEmail);
            return userMapper.toResponse(saved);
        } catch (ResponseStatusException rse) {
            throw rse;
        } catch (Exception ex) {
            log.error("Error updating store profile for {}: {}", providerEmail, ex.getMessage(), ex);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cannot update store profile");
        } finally {
            log.debug("Completed updateStoreProfile for: {}", providerEmail);
        }
    }

    @Override
    @Transactional
    public UserResponse toggleSeasonActive(String providerEmail, boolean isActive) {
        log.info("Toggling season active for provider: {} to: {}", providerEmail, isActive);
        try {
            User provider = findActiveProvider(providerEmail);
            // Cập nhật công tắc nhận đơn mùa vụ
            provider.setIsSeasonActive(isActive);
            User saved = userRepository.save(provider);
            return userMapper.toResponse(saved);
        } catch (ResponseStatusException rse) {
            throw rse;
        } catch (Exception ex) {
            log.error("Error toggling season active for {}: {}", providerEmail, ex.getMessage(), ex);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cannot toggle season status");
        } finally {
            log.debug("Completed toggleSeasonActive for: {}", providerEmail);
        }
    }

    private User findActiveProvider(String providerEmail) {
        User user = userRepository.findByEmailAndStatus(providerEmail, UserStatus.ACTIVE)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Provider account not found"));
        if (user.getRole() != UserRole.PROVIDER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is not a Provider");
        }
        return user;
    }
}
