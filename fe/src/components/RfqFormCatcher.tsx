import { useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import { rfqService } from '../services/rfqService'
import { errorMessage } from '../apis/http'
import { MIN_LEAD_DAYS, ROUTES, RFQ_MIN_QUANTITY } from '../constants'
import { addDays, cn, toIsoDate } from '../lib/format'

const RFQ_FORM_IDS = ['rfq-form', 'rfqForm']

/**
 * Bọc trang Stitch có form yêu cầu báo giá (trang chủ #rfqForm, cổng B2B #rfq-form):
 * chặn submit (tránh tải lại trang), gửi qua rfqService rồi hiện thông báo.
 * Form Stitch không đặt name cho ô nhập -> đọc theo loại ô: text (công ty, người liên hệ), tel, email, date.
 */
export function RfqFormCatcher({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLDivElement>) => {
    const form = e.target as HTMLFormElement
    if (!RFQ_FORM_IDS.includes(form.id)) return
    e.preventDefault()
    const inputs = Array.from(form.querySelectorAll<HTMLInputElement>('input'))
    const texts = inputs.filter((i) => i.type === 'text').map((i) => i.value.trim())
    const byType = (type: string) => inputs.find((i) => i.type === type)?.value.trim() ?? ''
    // Số lượng: ô number trong trang (bộ tính ngân sách) hoặc số đầu tiên trong ô chọn "20 - 50 hộp"
    const qtyInput = (e.currentTarget as HTMLDivElement).querySelector<HTMLInputElement>('input[type=number]')
    const qtySelect = form.querySelector('select')?.value.match(/\d+/)?.[0]
    const quantity = Math.max(RFQ_MIN_QUANTITY, Number(qtyInput?.value || qtySelect) || RFQ_MIN_QUANTITY)
    const message = form.querySelector('textarea')?.value.trim()
    // Form B2B: công ty, mã số thuế, người phụ trách, chức vụ. Form trang chủ chỉ có công ty, người liên hệ
    // mà BE bắt buộc mã số thuế + chức vụ -> chuyển sang form B2B đầy đủ
    if (form.id !== 'rfq-form') {
      navigate(ROUTES.rfq)
      return
    }
    const [companyName = '', taxCode = '', contactName = '', contactPosition = ''] = texts
    if (!taxCode || !contactPosition) {
      setToast({ ok: false, text: 'Vui lòng nhập Mã số thuế và Chức vụ / Phòng ban.' })
      window.setTimeout(() => setToast(null), 4000)
      return
    }
    try {
      await rfqService.submit({
        companyName,
        taxCode,
        contactName,
        contactPosition,
        contactPhone: byType('tel'),
        contactEmail: byType('email'),
        requestedQuantity: quantity,
        expectedDeliveryDate: byType('date') || toIsoDate(addDays(new Date(), MIN_LEAD_DAYS)),
        description: message || undefined,
      })
      form.reset()
      setToast({ ok: true, text: 'Đã gửi yêu cầu báo giá. Các xưởng phù hợp sẽ liên hệ bạn trong 24h.' })
    } catch (err) {
      setToast({ ok: false, text: errorMessage(err) })
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
