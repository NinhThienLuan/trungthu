import { http, unwrap } from '../apis/http'
import { USE_MOCK, delay, readStore, writeStore } from '../apis/mock'
import type { ApiResponse } from '../types/api'
import type { AuthResult, User } from '../types/user'

const SESSION_KEY = 'mock_session'

const DEMO_USER: User = {
  id: '99999999-9999-4999-8999-999999999999',
  email: 'demo@buyer.vn',
  fullName: 'Nguyễn Văn Demo',
  phone: '0912345678',
  role: 'CUSTOMER',
  storeName: null,
  address: '12 Tràng Tiền, Hoàn Kiếm, Hà Nội',
  status: 'ACTIVE',
}
const DEMO_PASSWORD = '12345678'

export const authService = {
  login: async (email: string, password: string): Promise<AuthResult> => {
    if (!USE_MOCK.auth) {
      return unwrap(http.post<ApiResponse<AuthResult>>('/auth/login', { email, password }))
    }
    await delay(300)
    if (email.trim().toLowerCase() !== DEMO_USER.email || password !== DEMO_PASSWORD) {
      throw new Error(`Tài khoản demo: ${DEMO_USER.email} / ${DEMO_PASSWORD}`)
    }
    writeStore(SESSION_KEY, DEMO_USER)
    return { accessToken: 'mock', tokenType: 'Bearer', expiresInSeconds: 900, user: DEMO_USER }
  },

  /** BE tự sinh mật khẩu và gửi qua email */
  register: async (body: { email: string; fullName: string; phone?: string }): Promise<User> => {
    if (!USE_MOCK.auth) {
      return unwrap(http.post<ApiResponse<User>>('/auth/register', { ...body, role: 'CUSTOMER' }))
    }
    await delay(400)
    return { ...DEMO_USER, ...body }
  },

  me: async (): Promise<User> => {
    if (!USE_MOCK.auth) {
      return unwrap(http.get<ApiResponse<User>>('/auth/me'))
    }
    const user = readStore<User | null>(SESSION_KEY, null)
    if (!user) throw new Error('Chưa đăng nhập')
    return user
  },

  logout: async () => {
    if (!USE_MOCK.auth) {
      await http.post('/auth/logout')
      return
    }
    writeStore(SESSION_KEY, null)
  },
}
