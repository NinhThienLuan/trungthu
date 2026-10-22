import { create } from 'zustand'
import { api } from '../api'
import type { User } from '../types'

const STORAGE_KEY = 'demo-auth'

interface Saved {
  token: string
  user: User
}

function readSaved(): Saved | null {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Saved
  } catch {
    return null
  }
}

interface AuthState {
  token: string | null
  user: User | null
  login: (email: string, password: string) => Promise<User>
  logout: () => void
}

const saved = readSaved()

export const useAuthStore = create<AuthState>((set) => ({
  token: saved?.token ?? null,
  user: saved?.user ?? null,

  login: async (email, password) => {
    const data = await api.login(email, password)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ token: data.accessToken, user: data.user }))
    set({ token: data.accessToken, user: data.user })
    return data.user
  },

  logout: () => {
    sessionStorage.removeItem(STORAGE_KEY)
    set({ token: null, user: null })
  },
}))
