import { http, unwrap } from '../apis/http'
import { USE_MOCK, delay, readStore, writeStore } from '../apis/mock'
import type { ApiResponse } from '../types/api'
import type { AuthResult, User } from '../types/user'

const SESSION_KEY = 'mock_session'

export const DEMO_ACCOUNTS = [
  {
    label: 'Khách hàng (Buyer)',
    email: 'buyer@gmail.com',
    role: 'CUSTOMER',
    fullName: 'Nguyễn Văn Mua',
  },
  {
    label: 'Chủ xưởng (Seller)',
    email: 'seller@kinhdo.vn',
    role: 'PROVIDER',
    fullName: 'Bánh Trung Thu Kinh Đô',
  },
  {
    label: 'Quản trị sàn (Admin)',
    email: 'admin@trungthu.fpt.edu.vn',
    role: 'PLATFORM_ADMIN',
    fullName: 'Platform Administrator',
  },
] as const

const DEMO_USERS: Record<string, User> = {
  'buyer@gmail.com': {
    id: '7f9fe3e7-e457-4b58-ae5d-6ce8a762f3bf',
    email: 'buyer@gmail.com',
    fullName: 'Nguyễn Văn Mua',
    phone: '0903000003',
    role: 'CUSTOMER',
    storeName: null,
    address: '12 Tràng Tiền, Hoàn Kiếm, Hà Nội',
    status: 'ACTIVE',
  },
  'seller@kinhdo.vn': {
    id: '25631fbf-3df0-4167-ab72-f257a02c9e31',
    email: 'seller@kinhdo.vn',
    fullName: 'Kinh Do Mooncake Store',
    phone: '0902000002',
    role: 'PROVIDER',
    storeName: 'Bánh Trung Thu Kinh Đô',
    address: '172 Cầu Đất, Ngô Quyền, Hải Phòng',
    status: 'ACTIVE',
  },
  'admin@trungthu.fpt.edu.vn': {
    id: '00000000-0000-4000-8000-000000000000',
    email: 'admin@trungthu.fpt.edu.vn',
    fullName: 'Platform Administrator',
    phone: '0901000001',
    role: 'PLATFORM_ADMIN',
    storeName: null,
    address: 'Trụ sở Nguyệt Viên Đài, Hà Nội',
    status: 'ACTIVE',
  },
  // Giữ alias cũ
  'demo@buyer.vn': {
    id: '99999999-9999-4999-8999-999999999999',
    email: 'demo@buyer.vn',
    fullName: 'Nguyễn Văn Demo',
    phone: '0912345678',
    role: 'CUSTOMER',
    storeName: null,
    address: '12 Tràng Tiền, Hoàn Kiếm, Hà Nội',
    status: 'ACTIVE',
  },
  'seller@trungthu.vn': {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'seller@trungthu.vn',
    fullName: 'Nghệ Nhân Lương Thế Cường',
    phone: '0988776655',
    role: 'PROVIDER',
    storeName: 'Đông Phương - Hải Phòng',
    address: '172 Cầu Đất, Ngô Quyền, Hải Phòng',
    status: 'ACTIVE',
  },
  'admin@trungthu.vn': {
    id: '00000000-0000-4000-8000-000000000000',
    email: 'admin@trungthu.vn',
    fullName: 'Quản Trị Sàn Nguyệt Viên',
    phone: '0909090909',
    role: 'PLATFORM_ADMIN',
    storeName: null,
    address: 'Trụ sở Nguyệt Viên Đài, Hà Nội',
    status: 'ACTIVE',
  },
}

const DEMO_PASSWORD = '12345678'

export const authService = {
  login: async (email: string, password: string): Promise<AuthResult> => {
    if (!USE_MOCK.auth) {
      return unwrap(http.post<ApiResponse<AuthResult>>('/auth/login', { email, password }))
    }
    await delay(300)
    const normalizedEmail = email.trim().toLowerCase()
    const user = DEMO_USERS[normalizedEmail]
    if (!user || password !== DEMO_PASSWORD) {
      throw new Error(`Tài khoản demo: buyer@gmail.com, seller@kinhdo.vn, hoặc admin@trungthu.fpt.edu.vn (Mật khẩu: ${DEMO_PASSWORD})`)
    }
    writeStore(SESSION_KEY, user)
    return { accessToken: 'mock', tokenType: 'Bearer', expiresInSeconds: 900, user }
  },

  /** ID token từ nút Google; BE kiểm tra chữ ký + client id, tạo tài khoản CUSTOMER nếu chưa có */
  loginWithGoogle: async (idToken: string): Promise<AuthResult> => {
    if (!USE_MOCK.auth) {
      return unwrap(http.post<ApiResponse<AuthResult>>('/auth/google', { idToken }))
    }
    await delay(300)
    const user = DEMO_USERS['buyer@gmail.com']
    writeStore(SESSION_KEY, user)
    return { accessToken: 'mock', tokenType: 'Bearer', expiresInSeconds: 900, user }
  },

  /** Khách tự đặt mật khẩu; BE kiểm tra PasswordPolicy, tạo tài khoản CUSTOMER */
  /** seller có giá trị -> tạo tài khoản PROVIDER (chờ nộp hồ sơ + gói), không thì CUSTOMER */
  register: async (body: { email: string; fullName: string; phone?: string; password: string },
    seller?: { storeName: string; address: string; bankCode: string; bankAccountNumber: string; bankAccountName: string }): Promise<User> => {
    if (!USE_MOCK.auth) {
      return unwrap(http.post<ApiResponse<User>>('/auth/register', { ...body, ...seller, role: seller ? 'PROVIDER' : 'CUSTOMER' }))
    }
    await delay(400)
    const newUser: User = {
      ...DEMO_USERS['buyer@gmail.com'],
      id: crypto.randomUUID(),
      ...body,
      role: 'CUSTOMER',
    }
    return newUser
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

  /** Quên mật khẩu B1: POST /auth/forgot-password — gửi OTP 6 số (10 phút). Email chưa đăng ký -> 404 */
  forgotPassword: async (email: string): Promise<void> => {
    if (!USE_MOCK.auth) {
      await http.post('/auth/forgot-password', { email })
      return
    }
    await delay(400)
  },

  /** Quên mật khẩu B2: POST /auth/verify-otp — kiểm tra OTP, chưa dùng mã */
  verifyOtp: async (email: string, otp: string): Promise<void> => {
    if (!USE_MOCK.auth) {
      await http.post('/auth/verify-otp', { email, otp })
      return
    }
    await delay(300)
    if (otp !== '123456') throw new Error('Mã OTP không đúng (mock: 123456)')
  },

  /** Quên mật khẩu B3: POST /auth/reset-password — BE kiểm tra lại OTP rồi đặt mật khẩu mới */
  resetPassword: async (email: string, otp: string, newPassword: string): Promise<void> => {
    if (!USE_MOCK.auth) {
      await http.post('/auth/reset-password', { email, otp, newPassword })
      return
    }
    await delay(400)
  },

  /** POST /auth/change-password — cần đăng nhập */
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    if (!USE_MOCK.auth) {
      await http.post('/auth/change-password', { oldPassword, newPassword })
      return
    }
    await delay(400)
    if (oldPassword !== DEMO_PASSWORD) throw new Error('Mật khẩu hiện tại không đúng')
  },
}
