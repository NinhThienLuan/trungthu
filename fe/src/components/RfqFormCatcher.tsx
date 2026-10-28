import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import { rfqService } from '../services/rfqService'
import { errorMessage } from '../apis/http'
import { ROUTES } from '../constants'
import { cn } from '../lib/format'
import { rfqSchema } from '../schemas'
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
  const hideTimer = useRef<number>(undefined)
  /** Một hẹn giờ dùng chung: thông báo mới không bị hẹn giờ của thông báo cũ tắt sớm */
  const show = (next: { ok: boolean; text: string }) => {
    setToast(next)
    window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setToast(null), 4000)
  }

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
      show({ ok: false, text: 'Yêu cầu báo giá cần tài khoản khách hàng.' })
      return
    }
    if (submitting.current) return
    // Bỏ lỗi cũ rồi kiểm tra lại toàn bộ form (BE kiểm tra lại cùng quy tắc)
    form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'))
    const parsed = rfqSchema.safeParse(Object.fromEntries(new FormData(form)))
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      const field = form.elements.namedItem(String(issue.path[0]))
      if (field instanceof HTMLElement) {
        field.setAttribute('aria-invalid', 'true')
        field.focus()
      }
      show({ ok: false, text: issue.message })
      return
    }
    submitting.current = true
    const button = form.querySelector<HTMLButtonElement>('button[type=submit]')
    if (button) button.disabled = true
    try {
      const created = await rfqService.submit(parsed.data)
      form.reset()
      onSubmitted?.(created)
      document.getElementById('my-rfqs')?.scrollIntoView({ behavior: 'smooth' })
      show({ ok: true, text: `Đã tạo yêu cầu ${created.code}. Xem báo giá ở mục Yêu cầu của tôi.` })
    } catch (err) {
      show({ ok: false, text: errorMessage(err) })
    } finally {
      submitting.current = false
      if (button) button.disabled = false
    }
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
