import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import { errorMessage } from '../../apis/http'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { fieldErrors, forgotPasswordSchema, resetPasswordSchema } from '../../schemas'
import { ROUTES } from '../../constants'
import { TextInput } from '../../components/ui/Field'
import { Notice } from '../../components/ui/States'

/**
 * Quên mật khẩu (BE1): bước 1 gửi email -> BE gửi mã reset qua email;
 * bước 2 dán mã + đặt mật khẩu mới. Mã chỉ dùng một lần và có hạn.
 */
export function ForgotPasswordPage() {
  useDocumentTitle('Quên mật khẩu')
  const navigate = useNavigate()
  const [step, setStep] = useState<'email' | 'reset'>('email')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  const run = async (action: () => Promise<void>) => {
    setErrors({})
    setSubmitError(undefined)
    setSubmitting(true)
    try {
      await action()
    } catch (err) {
      setSubmitError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEmail = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)))
    if (!parsed.success) return setErrors(fieldErrors(parsed.error))
    void run(async () => {
      await authService.forgotPassword(parsed.data.email)
      setEmail(parsed.data.email)
      setStep('reset')
    })
  }

  const handleReset = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const parsed = resetPasswordSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)))
    if (!parsed.success) return setErrors(fieldErrors(parsed.error))
    void run(async () => {
      await authService.resetPassword(parsed.data.token, parsed.data.newPassword)
      navigate(`${ROUTES.login}?reset=1`, { replace: true })
    })
  }

  return (
    <>
      <h1 className="text-h2">Quên mật khẩu</h1>

      {step === 'email' ? (
        <>
          <p className="mt-2 text-small text-muted">Nhập email tài khoản, chúng tôi sẽ gửi mã đặt lại mật khẩu.</p>
          <form noValidate onSubmit={handleEmail} className="mt-6 flex flex-col gap-4">
            <TextInput label="Email" name="email" type="email" autoComplete="email" error={errors.email} />
            {submitError && <Notice tone="danger">{submitError}</Notice>}
            <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
              {submitting ? 'Đang gửi...' : 'Gửi mã đặt lại'}
            </button>
          </form>
        </>
      ) : (
        <>
          <div className="mt-4">
            <Notice tone="success">
              Nếu <strong>{email}</strong> có tài khoản, mã đặt lại đã được gửi tới hộp thư. Mã chỉ dùng được một lần.
            </Notice>
          </div>
          <form noValidate onSubmit={handleReset} className="mt-6 flex flex-col gap-4">
            <TextInput label="Mã trong email" name="token" autoComplete="one-time-code" error={errors.token} />
            <TextInput label="Mật khẩu mới" name="newPassword" type="password" autoComplete="new-password" error={errors.newPassword} />
            <TextInput label="Nhập lại mật khẩu mới" name="confirmPassword" type="password" autoComplete="new-password" error={errors.confirmPassword} />
            {submitError && <Notice tone="danger">{submitError}</Notice>}
            <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
              {submitting ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
            </button>
            <button type="button" className="btn btn-ghost w-full" onClick={() => setStep('email')} disabled={submitting}>
              Gửi lại mã
            </button>
          </form>
        </>
      )}

      <p className="mt-6 text-center text-small text-muted">
        Nhớ ra mật khẩu?{' '}
        <Link to={ROUTES.login} className="font-semibold text-navy underline">
          Đăng nhập
        </Link>
      </p>
    </>
  )
}
