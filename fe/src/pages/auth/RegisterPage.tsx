import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import { errorMessage } from '../../apis/http'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { fieldErrors, registerSchema } from '../../schemas'
import { ROUTES } from '../../constants'
import { TextInput } from '../../components/ui/Field'
import { Notice } from '../../components/ui/States'

export function RegisterPage() {
  useDocumentTitle('Đăng ký')
  const navigate = useNavigate()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const parsed = registerSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)))
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setErrors({})
    setSubmitError(undefined)
    setSubmitting(true)
    try {
      await authService.register(parsed.data)
      navigate(`${ROUTES.login}?registered=1`, { replace: true })
    } catch (err) {
      setSubmitError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <h1 className="text-h2">Tạo tài khoản</h1>
      <p className="mt-2 text-small text-muted">Mật khẩu tạm sẽ được gửi tới email. Lần đăng nhập đầu bạn cần đổi mật khẩu.</p>
      <form noValidate onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <TextInput label="Số điện thoại" name="phone" type="tel" autoComplete="tel" placeholder="0912345678" error={errors.phone} />
        <TextInput label="Họ tên" name="fullName" autoComplete="name" error={errors.fullName} />
        <TextInput label="Email" name="email" type="email" autoComplete="email" placeholder="name@example.com" error={errors.email} />
        {submitError && <Notice tone="danger">{submitError}</Notice>}
        <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
          {submitting ? 'Đang tạo...' : 'Đăng ký'}
        </button>
      </form>
      <p className="mt-6 text-center text-small text-muted">
        Đã có tài khoản?{' '}
        <Link to={ROUTES.login} className="font-semibold text-navy underline">
          Đăng nhập
        </Link>
      </p>
    </>
  )
}
