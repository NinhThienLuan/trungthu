import { create } from 'zustand'
import { authService } from '../services/authService'
import type { User } from '../types/user'

interface AuthState {
  user: User | null
  /** true sau lần gọi /auth/me đầu tiên — tránh redirect login khi đang kiểm tra */
  ready: boolean
  init: () => Promise<void>
  login: (email: string, password: string) => Promise<User>
  loginWithGoogle: (idToken: string) => Promise<User>
  /** Đổi mật khẩu rồi gỡ cờ requirePasswordChange để thoát khỏi trang bắt buộc đổi */
  changePassword: (oldPassword: string, newPassword: string) => Promise<User>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  ready: false,

  init: async () => {
    try {
      set({ user: await authService.me() })
    } catch {
      set({ user: null })
    } finally {
      set({ ready: true })
    }
  },

  login: async (email, password) => {
    const { user } = await authService.login(email, password)
    set({ user })
    return user
  },

  loginWithGoogle: async (idToken) => {
    const { user } = await authService.loginWithGoogle(idToken)
    set({ user })
    return user
  },

  changePassword: async (oldPassword, newPassword) => {
    await authService.changePassword(oldPassword, newPassword)
    const user = { ...get().user!, requirePasswordChange: false }
    set({ user })
    return user
  },

  logout: async () => {
    try {
      await authService.logout()
    } finally {
      set({ user: null })
    }
  },
}))
