import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { errorMessage } from '../../apis/http'
import { USE_MOCK } from '../../apis/mock'
import { useAuthStore } from '../../stores/authStore'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { fieldErrors, loginSchema } from '../../schemas'
import { ROUTES } from '../../constants'
import { TextInput } from '../../components/ui/Field'
import { Notice } from '../../components/ui/States'

export function LoginPage() {
  useDocumentTitle('Đăng nhập')
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  // Chỉ cho quay về đường dẫn nội bộ (chặn open redirect)
  const next = params.get('next')
  const target = next && next.startsWith('/') && !next.startsWith('//') ? next : ROUTES.home

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const parsed = loginSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)))
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setErrors({})
    setSubmitError(undefined)
    setSubmitting(true)
    try {
      await login(parsed.data.email, parsed.data.password)
      navigate(target, { replace: true })
    } catch (err) {
      setSubmitError(errorMessage(err, 'Email hoặc mật khẩu không đúng'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <h1 className="text-h2">Đăng nhập</h1>
      {params.get('registered') && (
        <div className="mt-4">
          <Notice tone="success">Đăng ký thành công. Mật khẩu đã được gửi tới email của bạn.</Notice>
        </div>
      )}
      {USE_MOCK.auth && (
        <div className="mt-4">
          <Notice>Chế độ demo: đăng nhập bằng <strong>demo@buyer.vn</strong> / <strong>12345678</strong></Notice>
        </div>
      )}
      <form noValidate onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <TextInput label="Email" name="email" type="email" autoComplete="email" error={errors.email} />
        <TextInput label="Mật khẩu" name="password" type="password" autoComplete="current-password" error={errors.password} />
        {submitError && <Notice tone="danger">{submitError}</Notice>}
        <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
          {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
      <p className="mt-6 text-center text-small text-muted">
        Chưa có tài khoản?{' '}
        <Link to={ROUTES.register} className="font-semibold text-navy underline">
          Đăng ký
        </Link>
      </p>
    </>
  )
}
