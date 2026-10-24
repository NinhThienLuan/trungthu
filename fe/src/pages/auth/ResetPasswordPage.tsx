import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import { errorMessage } from '../../apis/http'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { fieldErrors, resetPasswordSchema } from '../../schemas'
import { ROUTES } from '../../constants'
import { PasswordInput } from '../../components/ui/PasswordInput'
import { Notice } from '../../components/ui/States'
import type { ForgotPasswordState } from './ForgotPasswordPage'

/** Quên mật khẩu B3: mật khẩu mới + nhập lại (không có mật khẩu cũ; OTP đã xác minh ở B2, BE kiểm tra lại) */
export function ResetPasswordPage() {
  useDocumentTitle('Đặt lại mật khẩu')
  const navigate = useNavigate()
  const state = useLocation().state as ForgotPasswordState | null
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  if (!state?.email || !state.otp) return <Navigate to={ROUTES.forgotPassword} replace />

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const parsed = resetPasswordSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)))
    if (!parsed.success) return setErrors(fieldErrors(parsed.error))
    setErrors({})
    setSubmitError(undefined)
    setSubmitting(true)
    try {
      await authService.resetPassword(state.email, state.otp!, parsed.data.newPassword)
      navigate(`${ROUTES.login}?reset=1`, { replace: true })
    } catch (err) {
      setSubmitError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <h1 className="text-h2">Đặt lại mật khẩu</h1>
      <p className="mt-2 text-small text-muted">
        Tài khoản: <strong className="text-navy">{state.email}</strong>
      </p>
      <form noValidate onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <PasswordInput label="Mật khẩu mới" name="newPassword" autoComplete="new-password" showStrength error={errors.newPassword} />
        <PasswordInput label="Nhập lại mật khẩu mới" name="confirmPassword" autoComplete="new-password" error={errors.confirmPassword} />
        {submitError && <Notice tone="danger">{submitError}</Notice>}
        <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
          {submitting ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
        </button>
      </form>
      <p className="mt-6 text-center text-small">
        <Link to={ROUTES.login} className="text-navy underline">← Quay lại đăng nhập</Link>
      </p>
    </>
  )
}
