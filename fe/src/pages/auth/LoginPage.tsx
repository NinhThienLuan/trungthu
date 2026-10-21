import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { errorMessage } from '../../apis/http'
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
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  // Chỉ cho quay về đường dẫn nội bộ (chặn open redirect)
  const next = params.get('next')
  const target = next && next.startsWith('/') && !next.startsWith('//') ? next : ROUTES.home

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const parsed = loginSchema.safeParse({ email, password })
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setErrors({})
    setSubmitError(undefined)
    setSubmitting(true)
    try {
      const user = await login(parsed.data.email, parsed.data.password)
      // Điều hướng thông minh theo vai trò nếu không có tham số next
      if (!next) {
        if (user.role === 'PLATFORM_ADMIN') {
          navigate('/admin/kyc', { replace: true })
          return
        }
        if (user.role === 'PROVIDER') {
          navigate('/seller', { replace: true })
          return
        }
      }
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
      {params.get('reset') && (
        <div className="mt-4">
          <Notice tone="success">Đã đặt lại mật khẩu. Đăng nhập bằng mật khẩu mới.</Notice>
        </div>
      )}
      {params.get('registered') && (
        <div className="mt-4">
          <Notice tone="success">Đăng ký thành công. Mật khẩu đã được gửi tới email của bạn.</Notice>
        </div>
      )}

      <form noValidate onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <TextInput
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <TextInput
          label="Mật khẩu"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Nhập mật khẩu..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <Link to={ROUTES.forgotPassword} className="-mt-2 self-end text-small text-navy underline">
          Quên mật khẩu?
        </Link>
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
