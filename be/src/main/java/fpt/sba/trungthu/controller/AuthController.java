package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.dto.request.LoginRequest;
import fpt.sba.trungthu.dto.request.RefreshTokenRequest;
import fpt.sba.trungthu.dto.request.RegisterRequest;
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

    @PostMapping("/login")
    @Operation(summary = "Login with Email & Password")
    public ResponseEntity<ApiResponseDTO<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request, response);
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

    @PostMapping("/logout")
    @Operation(summary = "Logout user and invalidate HTTP-only auth cookies")
    public ResponseEntity<ApiResponseDTO<String>> logout(HttpServletResponse response) {
        authService.logout(response);
        return ResponseEntity.ok(ApiResponseDTO.success("Logged out successfully", "Session terminated"));
    }
}
