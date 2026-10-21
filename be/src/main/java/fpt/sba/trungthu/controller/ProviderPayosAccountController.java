package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.service.impl.ProviderPayosAccountService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/provider/payos/account")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PROVIDER')")
public class ProviderPayosAccountController {
    private final ProviderPayosAccountService accounts;

    public record Credentials(@NotBlank String clientId, @NotBlank String apiKey, @NotBlank String checksumKey) {}

    @PutMapping
    public ResponseEntity<ApiResponseDTO<String>> configure(@Valid @RequestBody Credentials request) {
        accounts.configure(request.clientId(), request.apiKey(), request.checksumKey());
        return ResponseEntity.ok(ApiResponseDTO.success("payOS channel configured"));
    }

    @PostMapping("/webhook")
    public ResponseEntity<ApiResponseDTO<String>> registerWebhook() {
        accounts.registerWebhook();
        return ResponseEntity.ok(ApiResponseDTO.success("payOS webhook registered"));
    }
}
