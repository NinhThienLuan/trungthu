import { create } from 'zustand'
import { authApi } from '../apis/auth'
import type { User } from '../types/user'

interface AuthState {
  user: User | null
  /** true sau lần gọi /auth/me đầu tiên — tránh redirect login khi đang kiểm tra */
  ready: boolean
  init: () => Promise<void>
  login: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  ready: false,

  init: async () => {
    try {
      set({ user: await authApi.me() })
    } catch {
      set({ user: null })
    } finally {
      set({ ready: true })
    }
  },

  login: async (email, password) => {
    const { user } = await authApi.login(email, password)
    set({ user })
    return user
  },

  logout: async () => {
    try {
      await authApi.logout()
    } finally {
      set({ user: null })
    }
  },
}))
