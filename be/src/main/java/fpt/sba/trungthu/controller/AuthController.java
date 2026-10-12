package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.dto.request.ChangePasswordRequest;
import fpt.sba.trungthu.dto.request.ForgotPasswordRequest;
import fpt.sba.trungthu.dto.request.GoogleLoginRequest;
import fpt.sba.trungthu.dto.request.LoginRequest;
import fpt.sba.trungthu.dto.request.RefreshTokenRequest;
import fpt.sba.trungthu.dto.request.RegisterRequest;
import fpt.sba.trungthu.dto.request.ResetPasswordRequest;
import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.dto.response.AuthResponse;
import fpt.sba.trungthu.dto.response.UserResponse;
import fpt.sba.trungthu.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication & Authorization endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new User (CUSTOMER or PROVIDER)")
    public ResponseEntity<ApiResponseDTO<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseDTO.<UserResponse>builder()
                        .status(HttpStatus.CREATED.value())
                        .message("User registered successfully")
                        .data(response)
                        .build());
    }

    @PostMapping("/authenticate/{provider}")
    @Operation(summary = "Unified authentication gateway endpoint (local, google, etc.)")
    public ResponseEntity<ApiResponseDTO<AuthResponse>> authenticate(
            @PathVariable("provider") String providerStr,
            @RequestBody fpt.sba.trungthu.dto.request.AuthGatewayRequest request,
            HttpServletResponse response) {
        fpt.sba.trungthu.entity.enumeration.AuthProviderType provider;
        try {
            provider = fpt.sba.trungthu.entity.enumeration.AuthProviderType.valueOf(providerStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid auth provider: " + providerStr);
        }

        request.setProvider(provider);
        AuthResponse authResponse = authService.authenticate(request, response);
        return ResponseEntity.ok(ApiResponseDTO.success("Login successful", authResponse));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with Email & Password")
    public ResponseEntity<ApiResponseDTO<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request, response);
        return ResponseEntity.ok(ApiResponseDTO.success("Login successful", authResponse));
    }

    @PostMapping("/google")
    @Operation(summary = "Login with a Google ID token (from the Google Sign-In button on the frontend)")
    public ResponseEntity<ApiResponseDTO<AuthResponse>> loginWithGoogle(
            @Valid @RequestBody GoogleLoginRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.authenticate(
                fpt.sba.trungthu.dto.request.AuthGatewayRequest.builder()
                        .provider(fpt.sba.trungthu.entity.enumeration.AuthProviderType.GOOGLE)
                        .idToken(request.getIdToken())
                        .build(),
                response);
        return ResponseEntity.ok(ApiResponseDTO.success("Login successful", authResponse));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token using HTTP-only cookie or request body")
    public ResponseEntity<ApiResponseDTO<AuthResponse>> refresh(
            HttpServletRequest request,
            HttpServletResponse response,
            @RequestBody(required = false) RefreshTokenRequest tokenRequest) {
        String explicitToken = (tokenRequest != null) ? tokenRequest.getRefreshToken() : null;
        AuthResponse authResponse = authService.refresh(request, response, explicitToken);
        return ResponseEntity.ok(ApiResponseDTO.success("Token refreshed successfully", authResponse));
    }

    @GetMapping("/me")
    @Operation(summary = "Get currently authenticated user profile")
    public ResponseEntity<ApiResponseDTO<UserResponse>> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized access");
        }
        UserResponse userResponse = authService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(ApiResponseDTO.success(userResponse));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password of the currently authenticated user")
    public ResponseEntity<ApiResponseDTO<String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        authService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponseDTO.success("Password changed successfully", null));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Email a one-time password reset token (always 200, even for unknown emails)")
    public ResponseEntity<ApiResponseDTO<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponseDTO.success(
                "If this email is registered, a password reset token has been sent", null));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Set a new password using the reset token from the email")
    public ResponseEntity<ApiResponseDTO<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponseDTO.success("Password has been reset successfully", null));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user and invalidate HTTP-only auth cookies")
    public ResponseEntity<ApiResponseDTO<String>> logout(HttpServletResponse response) {
        authService.logout(response);
        return ResponseEntity.ok(ApiResponseDTO.success("Logged out successfully", "Session terminated"));
    }
}
