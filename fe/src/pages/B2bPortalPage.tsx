import { useState, type FormEvent } from 'react'
import { Icon } from '../components/Icon'
import { StitchB2bPortal } from './stitch/StitchB2bPortal'
import { rfqApi } from '../apis/orders'
import { errorMessage } from '../apis/http'
import { RFQ_MIN_QUANTITY } from '../constants'
import { cn } from '../lib/format'

/**
 * Cổng B2B: giao diện Stitch giữ nguyên, chỉ bắt sự kiện submit của form RFQ (#rfq-form)
 * để gửi yêu cầu qua rfqApi. Ô bắt buộc đã có `required` nên trình duyệt tự kiểm tra trước.
 */
export function B2bPortalPage() {
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLDivElement>) => {
    const form = e.target as HTMLFormElement
    if (form.id !== 'rfq-form') return
    e.preventDefault()
    // Form Stitch không đặt name cho input -> đọc theo thứ tự ô trong form
    const [companyName, , contactName, position, phone, email, expectedDate] = Array.from(
      form.querySelectorAll<HTMLInputElement>('input:not([type=checkbox])'),
    ).map((input) => input.value.trim())
    const qtyInput = (e.currentTarget as HTMLDivElement).querySelector<HTMLInputElement>('input[type=number]')
    const quantity = Math.max(RFQ_MIN_QUANTITY, Number(qtyInput?.value) || RFQ_MIN_QUANTITY)
    try {
      await rfqApi.submit({
        companyName,
        contactName,
        phone,
        email,
        quantity,
        expectedDate,
        message: position ? `Chức vụ: ${position}` : undefined,
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
      <StitchB2bPortal />
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
