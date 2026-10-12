package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.dto.response.UserResponse;
import fpt.sba.trungthu.service.ProviderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/provider")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PROVIDER')")
@Tag(name = "Provider Management", description = "Provider store settings, profile and operations")
public class ProviderController {

    private final ProviderService providerService;
    private final SecurityContextService securityContextService;

    @GetMapping("/profile")
    @Operation(summary = "Get current provider store profile")
    public ResponseEntity<ApiResponseDTO<UserResponse>> getMyStoreProfile() {
        String providerEmail = securityContextService.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponseDTO.success(providerService.getMyStoreProfile(providerEmail)));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update store name and address")
    public ResponseEntity<ApiResponseDTO<UserResponse>> updateStoreProfile(
            @RequestParam(required = false) String storeName,
            @RequestParam(required = false) String address) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponseDTO.success("Store profile updated successfully",
                providerService.updateStoreProfile(providerEmail, storeName, address)));
    }

    @PatchMapping("/season-active")
    @Operation(summary = "Toggle season active status")
    public ResponseEntity<ApiResponseDTO<UserResponse>> toggleSeasonActive(
            @RequestParam boolean isActive) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponseDTO.success("Season active status updated",
                providerService.toggleSeasonActive(providerEmail, isActive)));
    }
}
