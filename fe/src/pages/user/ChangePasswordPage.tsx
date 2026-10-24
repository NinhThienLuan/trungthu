import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { errorMessage } from '../../apis/http'
import { useAuthStore } from '../../stores/authStore'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { changePasswordSchema, fieldErrors } from '../../schemas'
import { HOME_BY_ROLE, ROUTES } from '../../constants'
import { PasswordInput } from '../../components/ui/PasswordInput'
import { PageHeader } from '../../components/ui/PageHeader'
import { Notice } from '../../components/ui/States'

/**
 * Đổi mật khẩu (cần đăng nhập): mật khẩu hiện tại + mới + nhập lại.
 * Tài khoản mới đăng ký (mật khẩu tạm qua email) bị chuyển tới đây cho tới khi đổi xong -> vào trang theo vai trò.
 */
export function ChangePasswordPage() {
  useDocumentTitle('Đổi mật khẩu')
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const changePassword = useAuthStore((s) => s.changePassword)
  const forced = !!user?.requirePasswordChange
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string>()
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const parsed = changePasswordSchema.safeParse(Object.fromEntries(new FormData(form)))
    if (!parsed.success) return setErrors(fieldErrors(parsed.error))
    setErrors({})
    setSubmitError(undefined)
    setDone(false)
    setSubmitting(true)
    try {
      const updated = await changePassword(parsed.data.oldPassword, parsed.data.newPassword)
      if (forced) return navigate(HOME_BY_ROLE[updated.role], { replace: true })
      form.reset()
      setDone(true)
    } catch (err) {
      setSubmitError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page section">
      <PageHeader eyebrow="Tài khoản" title="Đổi mật khẩu" />
      <form noValidate onSubmit={handleSubmit} className="card flex max-w-md flex-col gap-4 p-5 md:p-6">
        {forced && (
          <Notice tone="danger">⚠️ Bạn đang dùng mật khẩu tạm từ email. Bạn cần đổi mật khẩu để tiếp tục.</Notice>
        )}
        <PasswordInput
          label={forced ? 'Mật khẩu tạm (trong email)' : 'Mật khẩu hiện tại'}
          name="oldPassword"
          autoComplete="current-password"
          error={errors.oldPassword}
        />
        <PasswordInput label="Mật khẩu mới" name="newPassword" autoComplete="new-password" showStrength error={errors.newPassword} />
        <PasswordInput label="Nhập lại mật khẩu mới" name="confirmPassword" autoComplete="new-password" error={errors.confirmPassword} />
        {submitError && <Notice tone="danger">{submitError}</Notice>}
        {done && <Notice tone="success">Đổi mật khẩu thành công.</Notice>}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Đang lưu...' : 'Đổi mật khẩu'}
        </button>
        {!forced && (
          <p className="text-small text-muted">
            Đăng nhập bằng Google, chưa có mật khẩu?{' '}
            <Link to={ROUTES.forgotPassword} className="text-navy underline">Đặt mật khẩu qua email</Link>
          </p>
        )}
      </form>
    </div>
  )
}
