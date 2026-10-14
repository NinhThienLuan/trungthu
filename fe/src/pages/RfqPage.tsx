import { useState, type FormEvent } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { rfqApi } from '../apis/orders'
import { errorMessage } from '../apis/http'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useAuthStore } from '../stores/authStore'
import { fieldErrors, rfqSchema } from '../schemas'
import { MIN_LEAD_DAYS, RFQ_MIN_QUANTITY } from '../constants'
import { addDays, toIsoDate } from '../lib/format'
import { TextArea, TextInput } from '../components/ui/Field'
import { PageHeader } from '../components/ui/PageHeader'
import { Notice } from '../components/ui/States'

export function RfqPage() {
  useDocumentTitle('Đặt hàng doanh nghiệp')
  const user = useAuthStore((s) => s.user)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const minDate = toIsoDate(addDays(new Date(), MIN_LEAD_DAYS))

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const parsed = rfqSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)))
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setErrors({})
    setSubmitError(undefined)
    setSubmitting(true)
    try {
      await rfqApi.submit(parsed.data)
      setDone(true)
    } catch (err) {
      setSubmitError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page section">
      <PageHeader
        eyebrow="Doanh nghiệp"
        title="Yêu cầu báo giá sỉ"
        description={`Áp dụng từ ${RFQ_MIN_QUANTITY} hộp. Các xưởng phù hợp sẽ liên hệ báo giá trực tiếp cho bạn.`}
      />

      {done ? (
        <div className="card flex max-w-2xl flex-col items-start gap-3 p-6">
          <CheckCircle2 className="size-8 text-success" aria-hidden />
          <h2 className="text-h2">Đã gửi yêu cầu</h2>
          <p className="text-muted">Xưởng sẽ liên hệ qua email hoặc số điện thoại bạn cung cấp.</p>
          <button type="button" className="btn btn-outline" onClick={() => setDone(false)}>
            Gửi yêu cầu khác
          </button>
        </div>
      ) : (
        <form noValidate onSubmit={handleSubmit} className="card grid max-w-3xl gap-4 p-5 md:grid-cols-2 md:p-6">
          <TextInput label="Tên công ty" name="companyName" autoComplete="organization" error={errors.companyName} />
          <TextInput label="Người liên hệ" name="contactName" defaultValue={user?.fullName} autoComplete="name" error={errors.contactName} />
          <TextInput label="Số điện thoại" name="phone" type="tel" defaultValue={user?.phone ?? ''} autoComplete="tel" error={errors.phone} />
          <TextInput label="Email" name="email" type="email" defaultValue={user?.email} autoComplete="email" error={errors.email} />
          <TextInput label="Số lượng (hộp)" name="quantity" type="number" min={RFQ_MIN_QUANTITY} inputMode="numeric" error={errors.quantity} />
          <TextInput label="Ngày cần nhận" name="expectedDate" type="date" min={minDate} error={errors.expectedDate} />
          <TextInput label="Ngân sách dự kiến (không bắt buộc)" name="budgetNote" placeholder="VD: 500.000đ / hộp" error={errors.budgetNote} className="md:col-span-2" />
          <TextArea label="Yêu cầu thêm (không bắt buộc)" name="message" placeholder="Vị bánh, in logo, giao nhiều địa điểm..." error={errors.message} className="md:col-span-2" />
          {submitError && (
            <div className="md:col-span-2">
              <Notice tone="danger">{submitError}</Notice>
            </div>
          )}
          <div className="md:col-span-2">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
