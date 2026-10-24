import { useEffect, useRef } from 'react'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const GIS_SRC = 'https://accounts.google.com/gsi/client'

interface GoogleId {
  initialize: (opts: { client_id: string; callback: (res: { credential: string }) => void }) => void
  renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void
}
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } }
  }
}

let gisLoading: Promise<void> | undefined
function loadGis() {
  gisLoading ??= new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = GIS_SRC
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => {
      gisLoading = undefined
      reject(new Error('Không tải được Google Sign-In'))
    }
    document.head.appendChild(s)
  })
  return gisLoading
}

/** Nút "Đăng nhập với Google" (Google Identity Services). Trả ID token cho BE1: POST /auth/google. */
export function GoogleLoginButton({ onCredential }: { onCredential: (idToken: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const callback = useRef(onCredential)
  callback.current = onCredential

  useEffect(() => {
    if (!CLIENT_ID) return
    let cancelled = false
    loadGis()
      .then(() => {
        const el = ref.current
        const gid = window.google?.accounts.id
        if (cancelled || !el || !gid) return
        gid.initialize({ client_id: CLIENT_ID, callback: (res) => callback.current(res.credential) })
        gid.renderButton(el, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'signin_with',
          locale: 'vi',
          width: Math.min(el.offsetWidth || 400, 400),
        })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  // Chưa cấu hình VITE_GOOGLE_CLIENT_ID -> ẩn nút thay vì hiện nút hỏng
  if (!CLIENT_ID) return null
  return <div ref={ref} className="flex min-h-11 w-full justify-center" />
}
