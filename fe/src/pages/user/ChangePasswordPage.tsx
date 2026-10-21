import { useState, type FormEvent } from 'react'
import { authService } from '../../services/authService'
import { errorMessage } from '../../apis/http'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { changePasswordSchema, fieldErrors } from '../../schemas'
import { TextInput } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { Notice } from '../../components/ui/States'

/** Đổi mật khẩu (BE1: POST /auth/change-password). Tài khoản mới nhận mật khẩu ngẫu nhiên qua email nên cần trang này. */
export function ChangePasswordPage() {
  useDocumentTitle('Đổi mật khẩu')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string>()
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const parsed = changePasswordSchema.safeParse(Object.fromEntries(new FormData(form)))
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setErrors({})
    setSubmitError(undefined)
    setDone(false)
    setSubmitting(true)
    try {
      await authService.changePassword(parsed.data.oldPassword, parsed.data.newPassword)
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
        <TextInput label="Mật khẩu hiện tại" name="oldPassword" type="password" autoComplete="current-password" error={errors.oldPassword} />
        <TextInput label="Mật khẩu mới" name="newPassword" type="password" autoComplete="new-password" hint="6–50 ký tự" error={errors.newPassword} />
        <TextInput label="Nhập lại mật khẩu mới" name="confirmPassword" type="password" autoComplete="new-password" error={errors.confirmPassword} />
        {submitError && <Notice tone="danger">{submitError}</Notice>}
        {done && <Notice tone="success">Đã đổi mật khẩu.</Notice>}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Đang lưu...' : 'Đổi mật khẩu'}
        </button>
      </form>
    </div>
  )
}
