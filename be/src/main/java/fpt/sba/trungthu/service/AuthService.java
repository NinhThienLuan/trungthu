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
    AuthResponse authenticate(fpt.sba.trungthu.dto.request.AuthGatewayRequest request, HttpServletResponse response);
    /** Bước 1: gửi OTP 6 số (10 phút) tới email đã đăng ký */
    void forgotPassword(ForgotPasswordRequest request);

    /** Bước 2: kiểm tra OTP, chưa đánh dấu đã dùng */
    void verifyOtp(fpt.sba.trungthu.dto.request.VerifyOtpRequest request);

    /** Bước 3: kiểm tra lại OTP rồi đặt mật khẩu mới, OTP dùng một lần */
    void resetPassword(ResetPasswordRequest request);
}
