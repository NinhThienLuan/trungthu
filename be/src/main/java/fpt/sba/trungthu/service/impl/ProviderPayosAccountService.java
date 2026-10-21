package fpt.sba.trungthu.service.impl;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.entity.ProviderPayosAccount;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.entity.enumeration.OrderStatus;
import fpt.sba.trungthu.entity.enumeration.PaymentMethod;
import fpt.sba.trungthu.repository.OrderRepository;
import fpt.sba.trungthu.repository.ProviderPayosAccountRepository;
import fpt.sba.trungthu.service.PayosGateway;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;
import java.util.UUID;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ProviderPayosAccountService {
    private final ProviderPayosAccountRepository accounts;
    private final OrderRepository orders;
    private final SecurityContextService security;
    private final PayosGateway gateway;
    private final SecureRandom random = new SecureRandom();

    @Value("${payos.master-key:}")
    private String masterKey;

    @Value("${payos.webhook-url:}")
    private String webhookUrl;

    @Transactional
    public void configure(String clientId, String apiKey, String checksumKey) {
        User provider = security.getCurrentUser();
        if (provider.getRole() != UserRole.PROVIDER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Provider account required");
        }
        if (clientId == null || clientId.isBlank() || apiKey == null || apiKey.isBlank()
                || checksumKey == null || checksumKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "All three payOS keys are required");
        }
        var existing = accounts.findByProviderId(provider.getId());
        if (existing.isPresent() && orders.existsByProviderIdAndPaymentMethodAndOrderStatus(
                provider.getId(), PaymentMethod.PAYOS, OrderStatus.PENDING_DEPOSIT)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot rotate payOS keys while payment links are active");
        }
        ProviderPayosAccount account = existing
                .orElseGet(() -> ProviderPayosAccount.builder().provider(provider).build());
        account.setClientId(clientId.trim());
        account.setApiKeyCiphertext(encrypt(apiKey.trim()));
        account.setChecksumKeyCiphertext(encrypt(checksumKey.trim()));
        account.setWebhookConfirmedAt(null);
        accounts.save(account);
    }

    @Transactional(readOnly = true)
    public PayosGateway.Channel forProvider(UUID providerId) {
        ProviderPayosAccount account = accounts.findByProviderId(providerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT,
                        "Provider has not configured payOS"));
        return new PayosGateway.Channel(account.getClientId(), decrypt(account.getApiKeyCiphertext()),
                decrypt(account.getChecksumKeyCiphertext()));
    }

    @Transactional(readOnly = true)
    public PayosGateway.Channel requireReady(UUID providerId) {
        ProviderPayosAccount account = accounts.findByProviderId(providerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT,
                        "Provider has not configured payOS"));
        if (account.getWebhookConfirmedAt() == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Provider has not registered the payOS webhook");
        }
        return new PayosGateway.Channel(account.getClientId(), decrypt(account.getApiKeyCiphertext()),
                decrypt(account.getChecksumKeyCiphertext()));
    }

    @Transactional
    public void registerWebhook() {
        User provider = security.getCurrentUser();
        if (provider.getRole() != UserRole.PROVIDER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Provider account required");
        }
        if (webhookUrl == null || !webhookUrl.startsWith("https://")) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "PAYOS_WEBHOOK_URL must be a public HTTPS URL");
        }
        ProviderPayosAccount account = accounts.findByProviderId(provider.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT,
                        "Provider has not configured payOS"));
        gateway.confirmWebhook(new PayosGateway.Channel(account.getClientId(), decrypt(account.getApiKeyCiphertext()),
                decrypt(account.getChecksumKeyCiphertext())), webhookUrl);
        account.setWebhookConfirmedAt(Instant.now());
    }

    private String encrypt(String value) {
        try {
            byte[] iv = new byte[12];
            random.nextBytes(iv);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, key(), new GCMParameterSpec(128, iv));
            byte[] encrypted = cipher.doFinal(value.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            byte[] packed = Arrays.copyOf(iv, iv.length + encrypted.length);
            System.arraycopy(encrypted, 0, packed, iv.length, encrypted.length);
            return Base64.getEncoder().encodeToString(packed);
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalStateException("Cannot encrypt payOS credentials", ex);
        }
    }

    private String decrypt(String encoded) {
        try {
            byte[] packed = Base64.getDecoder().decode(encoded);
            if (packed.length < 29) throw new IllegalArgumentException("Invalid ciphertext");
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, key(), new GCMParameterSpec(128, packed, 0, 12));
            return new String(cipher.doFinal(packed, 12, packed.length - 12), java.nio.charset.StandardCharsets.UTF_8);
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalStateException("Cannot decrypt payOS credentials", ex);
        }
    }

    private SecretKeySpec key() {
        if (masterKey == null || masterKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "PAYOS_MASTER_KEY is not configured");
        }
        byte[] bytes;
        try {
            bytes = Base64.getDecoder().decode(masterKey);
        } catch (IllegalArgumentException ex) {
            throw new IllegalStateException("PAYOS_MASTER_KEY must be base64", ex);
        }
        if (bytes.length != 32) throw new IllegalStateException("PAYOS_MASTER_KEY must contain 32 bytes");
        return new SecretKeySpec(bytes, "AES");
    }
}
