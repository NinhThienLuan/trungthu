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
  if (window.google?.accounts.id) return Promise.resolve()
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

interface GoogleLoginButtonProps {
  onCredential: (idToken: string) => void
  onError: (message: string) => void
  disabled?: boolean
}

/** Google Identity Services trả ID token cho POST /auth/google. */
export function GoogleLoginButton({ onCredential, onError, disabled = false }: GoogleLoginButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const handlers = useRef({ onCredential, onError, disabled })
  handlers.current = { onCredential, onError, disabled }

  useEffect(() => {
    if (!CLIENT_ID) return
    let cancelled = false
    loadGis()
      .then(() => {
        const el = ref.current
        const gid = window.google?.accounts.id
        if (cancelled || !el) return
        if (!gid) throw new Error('Không khởi tạo được Google Sign-In')
        gid.initialize({
          client_id: CLIENT_ID,
          callback: (res) => {
            if (!cancelled && !handlers.current.disabled && res.credential) {
              handlers.current.onCredential(res.credential)
            }
          },
        })
        gid.renderButton(el, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'signin_with',
          locale: 'vi',
          width: Math.min(el.offsetWidth || 400, 400),
        })
      })
      .catch(() => {
        if (!cancelled) handlers.current.onError('Không tải được Google Sign-In. Vui lòng thử lại sau.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Chưa cấu hình Client ID thì không hiển thị nút Google.
  if (!CLIENT_ID) return null
  return <div ref={ref} className={`flex min-h-11 w-full justify-center ${disabled ? 'pointer-events-none opacity-50' : ''}`} />
}
