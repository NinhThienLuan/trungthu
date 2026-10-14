import { http, unwrap } from './http'
import type { ApiResponse } from '../types/api'
import type { AuthResult, User } from '../types/user'

export const authApi = {
  login: (email: string, password: string) =>
    unwrap(http.post<ApiResponse<AuthResult>>('/auth/login', { email, password })),

  /** BE tự sinh mật khẩu và gửi qua email */
  register: (body: { email: string; fullName: string; phone?: string }) =>
    unwrap(http.post<ApiResponse<User>>('/auth/register', { ...body, role: 'CUSTOMER' })),

  me: () => unwrap(http.get<ApiResponse<User>>('/auth/me')),

  logout: () => http.post('/auth/logout'),

  forgotPassword: (email: string) => http.post('/auth/forgot-password', { email }),
}
