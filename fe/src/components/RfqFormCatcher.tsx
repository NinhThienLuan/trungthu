import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import { rfqService } from '../services/rfqService'
import { errorMessage } from '../apis/http'
import { MIN_LEAD_DAYS, ROUTES, RFQ_MIN_QUANTITY } from '../constants'
import { addDays, cn, toIsoDate } from '../lib/format'
import { useAuthStore } from '../stores/authStore'
import type { RfqResponse } from '../types/order'

const RFQ_FORM_IDS = ['rfq-form', 'rfqForm']

/**
 * Bọc trang Stitch có form yêu cầu báo giá (trang chủ #rfqForm, cổng B2B #rfq-form):
 * chặn submit (tránh tải lại trang), gửi qua rfqService rồi hiện thông báo.
 * Form B2B dùng các trường có name để gửi đúng dữ liệu RFQ lên API.
 */
export function RfqFormCatcher({ children, onSubmitted }: { children: ReactNode; onSubmitted?: (rfq: RfqResponse) => void }) {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null)
  const submitting = useRef(false)

  const handleSubmit = async (e: FormEvent<HTMLDivElement>) => {
    const form = e.target as HTMLFormElement
    if (!RFQ_FORM_IDS.includes(form.id)) return
    e.preventDefault()
    if (form.id !== 'rfq-form') {
      navigate(ROUTES.rfq)
      return
    }
    if (!user) {
      navigate(`${ROUTES.login}?next=${encodeURIComponent(ROUTES.rfq)}`)
      return
    }
    if (user.role !== 'CUSTOMER') {
      setToast({ ok: false, text: 'Yêu cầu báo giá cần tài khoản khách hàng.' })
      return
    }
    if (submitting.current) return
    const data = new FormData(form)
    const get = (key: string) => String(data.get(key) ?? '').trim()
    const quantity = Number(get('requestedQuantity'))
    const deliveryDate = get('expectedDeliveryDate')
    if (!Number.isInteger(quantity) || quantity < RFQ_MIN_QUANTITY
      || !deliveryDate || deliveryDate < toIsoDate(addDays(new Date(), MIN_LEAD_DAYS))) {
      setToast({ ok: false, text: `Cần ít nhất ${RFQ_MIN_QUANTITY} hộp và ngày nhận cách tối thiểu ${MIN_LEAD_DAYS} ngày.` })
      return
    }
    submitting.current = true
    const button = form.querySelector<HTMLButtonElement>('button[type=submit]')
    if (button) button.disabled = true
    try {
      const created = await rfqService.submit({
        companyName: get('companyName'),
        taxCode: get('taxCode'),
        contactName: get('contactName'),
        contactPosition: get('contactPosition'),
        contactPhone: get('contactPhone'),
        contactEmail: get('contactEmail'),
        requestedQuantity: quantity,
        expectedDeliveryDate: deliveryDate,
        expectedBudget: get('expectedBudget') ? Number(get('expectedBudget')) : undefined,
        description: get('description') || undefined,
      })
      form.reset()
      onSubmitted?.(created)
      document.getElementById('my-rfqs')?.scrollIntoView({ behavior: 'smooth' })
      setToast({ ok: true, text: `Đã tạo yêu cầu ${created.code}. Xem báo giá ở mục Yêu cầu của tôi.` })
    } catch (err) {
      setToast({ ok: false, text: errorMessage(err) })
    } finally {
      submitting.current = false
      if (button) button.disabled = false
    }
    window.setTimeout(() => setToast(null), 4000)
  }

  return (
    <div onSubmit={handleSubmit}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'fixed top-24 right-6 z-50 flex max-w-sm items-center gap-3 rounded-[0.25rem] bg-primary px-5 py-3 text-champagne-light shadow-2xl transition-all duration-300',
          toast ? 'opacity-100 translate-y-0' : 'pointer-events-none -translate-y-5 opacity-0',
        )}
      >
        <Icon name={toast?.ok === false ? 'warning' : 'check_circle'} className="text-[22px] text-secondary" aria-hidden />
        <span className="font-body-sm text-body-sm">{toast?.text}</span>
      </div>
    </div>
  )
}
