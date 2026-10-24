import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import { errorMessage } from '../../apis/http'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { fieldErrors, forgotPasswordSchema } from '../../schemas'
import { ROUTES } from '../../constants'
import { TextInput } from '../../components/ui/Field'
import { Notice } from '../../components/ui/States'

/** State chuyển giữa 3 bước quên mật khẩu (README 3.2) */
export interface ForgotPasswordState {
  email: string
  type: 'forgot-password'
  otp?: string
}

/** Quên mật khẩu B1: nhập email đã đăng ký -> BE gửi OTP 6 số -> /verify-code */
export function ForgotPasswordPage() {
  useDocumentTitle('Quên mật khẩu')
  const navigate = useNavigate()
  const [error, setError] = useState<string>()
  const [submitError, setSubmitError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)))
    if (!parsed.success) return setError(fieldErrors(parsed.error).email)
    setError(undefined)
    setSubmitError(undefined)
    setSubmitting(true)
    try {
      await authService.forgotPassword(parsed.data.email)
      const state: ForgotPasswordState = { email: parsed.data.email, type: 'forgot-password' }
      navigate(ROUTES.verifyCode, { state })
    } catch (err) {
      setSubmitError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <h1 className="text-h2">Quên mật khẩu</h1>
      <p className="mt-2 text-small text-muted">Nhập email đã đăng ký, chúng tôi sẽ gửi mã xác thực 6 số.</p>
      <form noValidate onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <TextInput label="Email" name="email" type="email" autoComplete="email" placeholder="name@example.com" error={error} />
        {submitError && <Notice tone="danger">{submitError}</Notice>}
        <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
          {submitting ? 'Đang gửi...' : 'Gửi mã'}
        </button>
      </form>
      <div className="mt-6 flex justify-between text-small">
        <Link to={ROUTES.login} className="text-navy underline">← Quay lại đăng nhập</Link>
        <Link to={ROUTES.register} className="font-semibold text-navy underline">Đăng ký ngay</Link>
      </div>
    </>
  )
}
