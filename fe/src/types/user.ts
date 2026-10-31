export type UserRole = 'CUSTOMER' | 'PROVIDER' | 'PLATFORM_ADMIN'

export interface User {
  id: string
  email: string
  fullName: string
  phone: string | null
  role: UserRole
  storeName: string | null
  /** Seller: admin đã duyệt đủ ATTP + giấy phép + CCCD (điều kiện được bán) */
  isComplianceApproved?: boolean
  address: string | null
  status: string
  /** Đăng ký nhận mật khẩu tạm qua email -> phải đổi ở lần đăng nhập đầu */
  requirePasswordChange?: boolean
}

export interface AuthResult {
  accessToken: string
  tokenType: string
  expiresInSeconds: number
  user: User
}
