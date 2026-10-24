import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import { errorMessage } from '../../apis/http'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { otpSchema } from '../../schemas'
import { OTP_EXPIRE_SECONDS, OTP_LENGTH, OTP_RESEND_SECONDS, ROUTES } from '../../constants'
import { Notice } from '../../components/ui/States'
import type { ForgotPasswordState } from './ForgotPasswordPage'

const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

/** Quên mật khẩu B2: nhập OTP 6 số (6 ô), đếm ngược 10 phút, gửi lại sau 60 giây */
export function VerifyCodePage() {
  useDocumentTitle('Nhập mã xác thực')
  const navigate = useNavigate()
  const state = useLocation().state as ForgotPasswordState | null
  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(''))
  const [sentAt, setSentAt] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())
  const [error, setError] = useState<string>()
  const [notice, setNotice] = useState<string>()
  const [busy, setBusy] = useState(false)
  const boxes = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])
  useEffect(() => boxes.current[0]?.focus(), [])

  // Vào thẳng trang này (không qua bước nhập email) -> quay lại bước 1
  if (!state?.email) return <Navigate to={ROUTES.forgotPassword} replace />

  const elapsed = Math.floor((now - sentAt) / 1000)
  const expiresIn = Math.max(0, OTP_EXPIRE_SECONDS - elapsed)
  const resendIn = Math.max(0, OTP_RESEND_SECONDS - elapsed)

  const fill = (from: number, chars: string) => {
    const next = [...digits]
    chars.split('').slice(0, OTP_LENGTH - from).forEach((c, i) => (next[from + i] = c))
    setDigits(next)
    boxes.current[Math.min(from + chars.length, OTP_LENGTH - 1)]?.focus()
  }

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) boxes.current[i - 1]?.focus()
  }

  const onPaste = (i: number, e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '')
    if (!pasted) return
    e.preventDefault()
    fill(i, pasted)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const otp = digits.join('')
    const parsed = otpSchema.safeParse(otp)
    if (!parsed.success) return setError(parsed.error.issues[0].message)
    if (expiresIn === 0) return setError('Mã đã hết hạn. Vui lòng gửi lại')
    setError(undefined)
    setBusy(true)
    try {
      await authService.verifyOtp(state.email, otp)
      const next: ForgotPasswordState = { ...state, otp }
      navigate(ROUTES.resetPassword, { state: next, replace: true })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const resend = async () => {
    setBusy(true)
    setError(undefined)
    try {
      await authService.forgotPassword(state.email)
      setDigits(Array(OTP_LENGTH).fill(''))
      setSentAt(Date.now())
      setNotice('Đã gửi mã mới.')
      boxes.current[0]?.focus()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <h1 className="text-h2">Nhập mã xác thực</h1>
      <p className="mt-2 text-small text-muted">
        Mã đã gửi đến: <strong className="text-navy">{state.email}</strong>
      </p>
      <form noValidate onSubmit={submit} className="mt-6 flex flex-col gap-4">
        <div className="flex justify-between gap-2" role="group" aria-label="Mã OTP 6 số">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                boxes.current[i] = el
              }}
              value={d}
              inputMode="numeric"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              aria-label={`Chữ số ${i + 1}`}
              className="input h-12 w-12 text-center text-h3 font-semibold"
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '')
                if (v.length > 1) return fill(i, v)
                const next = [...digits]
                next[i] = v
                setDigits(next)
                if (v && i < OTP_LENGTH - 1) boxes.current[i + 1]?.focus()
              }}
              onKeyDown={(e) => onKeyDown(i, e)}
              onPaste={(e) => onPaste(i, e)}
            />
          ))}
        </div>
        <p className="text-small text-muted">
          {expiresIn > 0 ? <>Mã hết hạn sau: <strong className="text-navy">{mmss(expiresIn)}</strong></> : 'Mã đã hết hạn.'}
        </p>
        {error && <Notice tone="danger">{error}</Notice>}
        {notice && !error && <Notice tone="success">{notice}</Notice>}
        <button type="submit" className="btn btn-primary w-full" disabled={busy}>
          {busy ? 'Đang kiểm tra...' : 'Xác nhận'}
        </button>
        <button type="button" className="btn btn-ghost w-full" onClick={() => void resend()} disabled={busy || resendIn > 0}>
          {resendIn > 0 ? `Gửi lại mã (sau ${resendIn}s)` : 'Gửi lại mã'}
        </button>
      </form>
      <p className="mt-6 text-center text-small">
        <Link to={ROUTES.forgotPassword} className="text-navy underline">← Đổi email khác</Link>
      </p>
    </>
  )
}
