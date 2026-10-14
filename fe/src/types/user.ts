export type UserRole = 'CUSTOMER' | 'PROVIDER' | 'PLATFORM_ADMIN'

export interface User {
  id: string
  email: string
  fullName: string
  phone: string | null
  role: UserRole
  storeName: string | null
  address: string | null
  status: string
}

export interface AuthResult {
  accessToken: string
  tokenType: string
  expiresInSeconds: number
  user: User
}
