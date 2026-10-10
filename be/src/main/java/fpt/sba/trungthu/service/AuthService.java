package fpt.sba.trungthu.service;

import fpt.sba.trungthu.dto.request.ChangePasswordRequest;
import fpt.sba.trungthu.dto.request.ForgotPasswordRequest;
import fpt.sba.trungthu.dto.request.LoginRequest;
import fpt.sba.trungthu.dto.request.RegisterRequest;
import fpt.sba.trungthu.dto.request.ResetPasswordRequest;
import fpt.sba.trungthu.dto.response.AuthResponse;
import fpt.sba.trungthu.dto.response.UserResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {
    UserResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request, HttpServletResponse response);
    AuthResponse refresh(HttpServletRequest request, HttpServletResponse response, String explicitRefreshToken);
    UserResponse getCurrentUser(String email);
    void logout(HttpServletResponse response);
    void changePassword(String email, ChangePasswordRequest request);
    AuthResponse loginWithGoogle(String email, String fullName, HttpServletResponse response);
    AuthResponse loginWithGoogleIdToken(String idToken, HttpServletResponse response);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
}
