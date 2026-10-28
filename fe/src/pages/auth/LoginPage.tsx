import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { errorMessage } from '../../apis/http'
import { useAuthStore } from '../../stores/authStore'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { fieldErrors, loginSchema } from '../../schemas'
import { HOME_BY_ROLE, ROUTES } from '../../constants'
import { TextInput } from '../../components/ui/Field'
import { Notice } from '../../components/ui/States'
import { GoogleLoginButton } from '../../components/GoogleLoginButton'
import type { User } from '../../types/user'

export function LoginPage() {
  useDocumentTitle('Đăng nhập')
  const login = useAuthStore((s) => s.login)
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle)
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)

  // Chỉ cho quay về đường dẫn nội bộ (chặn open redirect)
  const next = params.get('next')
  const target = next && next.startsWith('/') && !next.startsWith('//') ? next : ROUTES.home

  // Mật khẩu tạm -> bắt đổi trước; còn lại về `next` hoặc trang theo vai trò
  const goAfterLogin = (user: User) => {
    if (user.requirePasswordChange) return navigate(ROUTES.changePassword, { replace: true })
    navigate(next ? target : HOME_BY_ROLE[user.role], { replace: true })
  }

  const run = async (action: () => Promise<User>, fallbackError: string) => {
    if (submittingRef.current) return
    submittingRef.current = true
    setErrors({})
    setSubmitError(undefined)
    setSubmitting(true)
    try {
      goAfterLogin(await action())
    } catch (err) {
      setSubmitError(errorMessage(err, fallbackError))
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const parsed = loginSchema.safeParse({ email, password })
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    void run(() => login(parsed.data.email, parsed.data.password), 'Email hoặc mật khẩu không đúng')
  }

  const handleGoogle = (idToken: string) => void run(() => loginWithGoogle(idToken), 'Đăng nhập Google thất bại')

  return (
    <>
      <h1 className="text-h2">Đăng nhập</h1>
      {params.get('reset') && (
        <div className="mt-4">
          <Notice tone="success">Đặt lại mật khẩu thành công. Đăng nhập bằng mật khẩu mới.</Notice>
        </div>
      )}
      {params.get('registered') && (
        <div className="mt-4">
          <Notice tone="success">Đăng ký thành công. Đăng nhập bằng email và mật khẩu bạn vừa đặt.</Notice>
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
      <div className="mt-4">
        <GoogleLoginButton onCredential={handleGoogle} onError={setSubmitError} disabled={submitting} />
      </div>
      <p className="mt-6 text-center text-small text-muted">
        Chưa có tài khoản?{' '}
        <Link to={ROUTES.register} className="font-semibold text-navy underline">
          Đăng ký
        </Link>
      </p>
    </>
  )
}
