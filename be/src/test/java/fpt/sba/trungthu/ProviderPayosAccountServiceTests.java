package fpt.sba.trungthu;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.entity.ProviderPayosAccount;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.repository.ProviderPayosAccountRepository;
import fpt.sba.trungthu.repository.OrderRepository;
import fpt.sba.trungthu.service.PayosGateway;
import fpt.sba.trungthu.service.impl.ProviderPayosAccountService;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Base64;
import java.util.Optional;
import java.util.UUID;
import java.time.Instant;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ProviderPayosAccountServiceTests {
    @Test
    void sellerKeysAreEncryptedBeforePersistenceAndRecoveredForTheirChannel() {
        var repository = mock(ProviderPayosAccountRepository.class);
        var security = mock(SecurityContextService.class);
        var gateway = mock(PayosGateway.class);
        var service = new ProviderPayosAccountService(repository, mock(OrderRepository.class), security, gateway);
        ReflectionTestUtils.setField(service, "masterKey", Base64.getEncoder().encodeToString(new byte[32]));
        UUID providerId = UUID.randomUUID();
        when(security.getCurrentUser()).thenReturn(User.builder().id(providerId).role(UserRole.PROVIDER).build());
        when(repository.findByProviderId(providerId)).thenReturn(Optional.empty());
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        service.configure("client", "api-secret", "checksum-secret");
        var captured = org.mockito.ArgumentCaptor.forClass(ProviderPayosAccount.class);
        verify(repository).save(captured.capture());
        ProviderPayosAccount stored = captured.getValue();
        assertThat(stored.getProvider().getId()).isEqualTo(providerId);
        assertThat(stored.getApiKeyCiphertext()).doesNotContain("api-secret");
        assertThat(stored.getChecksumKeyCiphertext()).doesNotContain("checksum-secret");
        when(repository.findByProviderId(providerId)).thenReturn(Optional.of(stored));
        assertThat(service.forProvider(providerId))
                .isEqualTo(new PayosGateway.Channel("client", "api-secret", "checksum-secret"));
        assertThatThrownBy(() -> service.requireReady(providerId))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        stored.setWebhookConfirmedAt(Instant.now());
        assertThat(service.requireReady(providerId))
                .isEqualTo(new PayosGateway.Channel("client", "api-secret", "checksum-secret"));
    }
}
