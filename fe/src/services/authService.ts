import { http, unwrap } from '../apis/http'
import type { ApiResponse } from '../types/api'
import type { AuthResult, User } from '../types/user'

/** BE1 /api/auth: đăng nhập dựa trên cookie HttpOnly do BE đặt (xem apis/http.ts) */
export const authService = {
  login: (email: string, password: string): Promise<AuthResult> =>
    unwrap(http.post<ApiResponse<AuthResult>>('/auth/login', { email, password })),

  /** ID token từ nút Google; BE kiểm tra chữ ký + client id, tạo tài khoản CUSTOMER nếu chưa có */
  loginWithGoogle: (idToken: string): Promise<AuthResult> =>
    unwrap(http.post<ApiResponse<AuthResult>>('/auth/google', { idToken })),

  /** Khách tự đặt mật khẩu (PasswordPolicy). seller có giá trị -> tài khoản PROVIDER (chờ nộp hồ sơ + gói), không thì CUSTOMER */
  register: (body: { email: string; fullName: string; phone?: string; password: string },
    seller?: { storeName: string; address: string; bankCode: string; bankAccountNumber: string; bankAccountName: string }): Promise<User> =>
    unwrap(http.post<ApiResponse<User>>('/auth/register', { ...body, ...seller, role: seller ? 'PROVIDER' : 'CUSTOMER' })),

  me: (): Promise<User> => unwrap(http.get<ApiResponse<User>>('/auth/me')),

  logout: async () => {
    await http.post('/auth/logout')
  },

  /** Quên mật khẩu B1: gửi OTP 6 số (10 phút). Email chưa đăng ký -> 404 */
  forgotPassword: async (email: string): Promise<void> => {
    await http.post('/auth/forgot-password', { email })
  },

  /** Quên mật khẩu B2: kiểm tra OTP, chưa dùng mã */
  verifyOtp: async (email: string, otp: string): Promise<void> => {
    await http.post('/auth/verify-otp', { email, otp })
  },

  /** Quên mật khẩu B3: BE kiểm tra lại OTP rồi đặt mật khẩu mới */
  resetPassword: async (email: string, otp: string, newPassword: string): Promise<void> => {
    await http.post('/auth/reset-password', { email, otp, newPassword })
  },

  /** Đổi mật khẩu (cần đăng nhập) */
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await http.post('/auth/change-password', { oldPassword, newPassword })
  },
}
