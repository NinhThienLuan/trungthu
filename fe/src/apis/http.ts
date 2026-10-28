import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse } from '../types/api'

/**
 * Axios dùng chung. Đăng nhập dựa trên cookie HttpOnly do BE đặt
 * (access_token / refresh_token) nên FE không tự lưu token.
 */
export const http = axios.create({
  // Vite proxies /api locally; Vercel rewrites /api to Heroku in production.
  // Keeping this same-origin avoids cross-site auth cookie and CORS failures.
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Gặp 401 -> gọi /auth/refresh đúng 1 lần (dùng chung cho các request đồng thời) rồi gửi lại
let refreshing: Promise<void> | null = null

http.interceptors.response.use(undefined, async (error: AxiosError) => {
  const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined
  const noRetry = ['/auth/login', '/auth/google', '/auth/refresh', '/auth/logout'].includes(original?.url ?? '')
  if (error.response?.status !== 401 || !original || original._retried || noRetry) {
    throw error
  }
  original._retried = true
  refreshing ??= http.post('/auth/refresh').then(() => undefined).finally(() => (refreshing = null))
  await refreshing
  return http(original)
})

/** Bóc `data` khỏi ApiResponseDTO */
export async function unwrap<T>(request: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const res = await request
  return res.data.data
}

/** Lấy message lỗi thân thiện từ response BE */
export function errorMessage(error: unknown, fallback = 'Đã có lỗi xảy ra, vui lòng thử lại.'): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Không kết nối được máy chủ.'
    const message = (error.response.data as Partial<ApiResponse<unknown>> | undefined)?.message
    if (message) return message
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}
