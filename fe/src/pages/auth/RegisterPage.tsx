import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '../../services/authService'
import { errorMessage } from '../../apis/http'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { fieldErrors, registerSchema, sellerRegisterSchema } from '../../schemas'
import { BANK_CODES, ROUTES } from '../../constants'
import { cn } from '../../lib/format'
import { Field, TextInput } from '../../components/ui/Field'
import { PasswordInput } from '../../components/ui/PasswordInput'
import { Notice } from '../../components/ui/States'

export function RegisterPage() {
  const [params, setParams] = useSearchParams()
  const isSeller = params.get('role') === 'seller'
  useDocumentTitle(isSeller ? 'Đăng ký mở gian hàng' : 'Đăng ký')
  const navigate = useNavigate()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = Object.fromEntries(new FormData(e.currentTarget))
    const parsed = registerSchema.safeParse(form)
    const seller = isSeller ? sellerRegisterSchema.safeParse(form) : undefined
    if (!parsed.success || (seller && !seller.success)) {
      setErrors({ ...(parsed.success ? {} : fieldErrors(parsed.error)), ...(seller && !seller.success ? fieldErrors(seller.error) : {}) })
      return
    }
    setErrors({})
    setSubmitError(undefined)
    setSubmitting(true)
    try {
      const { phone, fullName, email, password } = parsed.data
      await authService.register({ phone, fullName, email, password }, seller?.success ? seller.data : undefined)
      navigate(`${ROUTES.login}?registered=1`, { replace: true })
    } catch (err) {
      setSubmitError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <h1 className="text-h2">{isSeller ? 'Mở gian hàng' : 'Tạo tài khoản'}</h1>
      <div className="mt-4 grid grid-cols-2 gap-1 rounded-sm bg-champagne/40 p-1" role="tablist" aria-label="Loại tài khoản">
        {[['', 'Khách mua'], ['seller', 'Mở gian hàng']].map(([role, label]) => (
          <button key={label} type="button" role="tab" aria-selected={isSeller === !!role}
            className={cn('rounded-sm px-3 py-2 text-small font-semibold', isSeller === !!role ? 'bg-white text-navy shadow-sm' : 'text-muted')}
            onClick={() => { setErrors({}); setParams(role ? { role } : {}, { replace: true }) }}>
            {label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-small text-muted">
        {isSeller
          ? 'Sau khi đăng ký: nộp giấy tờ ATTP, giấy phép kinh doanh, CCCD và chọn gói bán hàng. Admin duyệt xong gian hàng mới được bán.'
          : 'Đăng ký xong bạn đăng nhập ngay bằng email và mật khẩu vừa đặt.'}
      </p>
      <form noValidate onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <TextInput label="Số điện thoại" name="phone" type="tel" autoComplete="tel" placeholder="0912345678" error={errors.phone} />
        <TextInput label={isSeller ? 'Họ tên chủ cơ sở' : 'Họ tên'} name="fullName" autoComplete="name" error={errors.fullName} />
        <TextInput label="Email" name="email" type="email" autoComplete="email" placeholder="name@example.com" error={errors.email} />
        {isSeller && (
          <>
            <TextInput label="Tên gian hàng" name="storeName" placeholder="Bánh Trung Thu Nhà Làm" error={errors.storeName} />
            <TextInput label="Địa chỉ xưởng" name="address" autoComplete="street-address" error={errors.address} />
            <Field label="Ngân hàng nhận tiền" name="bankCode" error={errors.bankCode}>
              <select id="bankCode" name="bankCode" className="input" defaultValue="">
                <option value="" disabled>Chọn ngân hàng</option>
                {BANK_CODES.map((code) => <option key={code} value={code}>{code}</option>)}
              </select>
            </Field>
            <TextInput label="Số tài khoản" name="bankAccountNumber" inputMode="numeric" error={errors.bankAccountNumber} />
            <TextInput label="Tên chủ tài khoản" name="bankAccountName" placeholder="NGUYEN VAN A" error={errors.bankAccountName} />
          </>
        )}
        <PasswordInput label="Mật khẩu" name="password" autoComplete="new-password" showStrength error={errors.password} />
        <PasswordInput label="Nhập lại mật khẩu" name="confirmPassword" autoComplete="new-password" error={errors.confirmPassword} />
        {submitError && <Notice tone="danger">{submitError}</Notice>}
        <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
          {submitting ? 'Đang tạo...' : isSeller ? 'Đăng ký mở gian hàng' : 'Đăng ký'}
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
