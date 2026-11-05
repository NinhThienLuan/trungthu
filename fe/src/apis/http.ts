import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse } from '../types/api'
import { useAuthStore } from '../stores/authStore'

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
  try {
    await refreshing
  } catch (refreshError) {
    if ((refreshError as AxiosError).response?.status === 401) await expireSession()
    throw error
  }
  return http(original)
})

/**
 * Refresh token hết hạn: đăng xuất rồi về trang đăng nhập kèm `next` để quay lại sau khi đăng nhập.
 * Chỉ khi đang có phiên (khách chưa đăng nhập gọi /auth/me bị 401 là bình thường, không chuyển trang).
 */
async function expireSession() {
  if (!useAuthStore.getState().user) return
  // Lấy trang hiện tại trước khi logout (logout làm ProtectedRoute tự chuyển sang /login)
  const next = window.location.pathname + window.location.search
  await useAuthStore.getState().logout().catch(() => undefined)
  window.location.assign(`/login?expired=1&next=${encodeURIComponent(next)}`)
}

/** Bóc `data` khỏi ApiResponseDTO */
export async function unwrap<T>(request: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const res = await request
  return res.data.data
}

/** Lấy message lỗi thân thiện từ response BE */
export function errorMessage(error: unknown, fallback = 'Đã có lỗi xảy ra, vui lòng thử lại.'): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Không kết nối được máy chủ.'
    if (error.response.status >= 500) return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.'
    const message = (error.response.data as Partial<ApiResponse<unknown>> | undefined)?.message
    if (message) return message
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}
