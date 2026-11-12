import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { orderService } from '../../services/orderService'
import { errorMessage } from '../../apis/http'
import { useApi } from '../../hooks/useApi'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { CANCELLABLE_STATUSES, PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL, ROUTES } from '../../constants'
import { formatDate, formatDateTime, formatVnd } from '../../lib/format'
import { displayOrderLines } from '../../lib/orderDisplay'
import { OrderPaymentPanel } from '../../components/OrderPaymentPanel'
import { OrderStatusChip } from '../../components/OrderStatusChip'
import { ErrorState, Notice, Spinner } from '../../components/ui/States'
import { Field, TextArea, TextInput } from '../../components/ui/Field'
import { COMPLAINT_STATUS, COMPLAINT_TYPE_LABEL, complaintService, type ComplaintType } from '../../services/complaintService'
import { storeReviewService } from '../../services/storeReviewService'
import { ProductReviews } from '../../components/ProductReviews'

/** GET /api/orders/{id} + huỷ đơn (POST /api/orders/{id}/cancel) khi còn được phép */
export function OrderDetailPage() {
  const { id = '' } = useParams()
  const { data: order, loading, error, reload } = useApi(() => orderService.detail(id), [id])
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string>()
  useDocumentTitle(order ? `Đơn ${order.code}` : 'Chi tiết đơn')

  if (loading) return <Spinner />
  if (error || !order) {
    return (
      <div className="page section">
        <ErrorState message={error ?? 'Không tìm thấy đơn hàng'} onRetry={reload} />
      </div>
    )
  }

  const handleCancel = async () => {
    if (!window.confirm(`Huỷ đơn ${order.code}? Hàng và suất nướng sẽ được trả lại cho xưởng.`)) return
    setCancelling(true)
    setCancelError(undefined)
    try {
      await orderService.cancel(order.id)
      reload()
    } catch (err) {
      setCancelError(errorMessage(err))
    } finally {
      setCancelling(false)
    }
  }

  const displayLines = displayOrderLines(order.lines)
  const discount = order.discountAmount ?? 0
  const setOnly = order.lines.length > 0 && order.lines.every((line) => !!line.sourceSetId)

  return (
    <div className="page section">
      <Link to={ROUTES.orders} className="mb-6 inline-flex items-center gap-1 text-small text-muted hover:text-navy">
        <ChevronLeft className="size-4" aria-hidden /> Đơn của tôi
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3 pb-6">
        <div>
          <p className="eyebrow">Đơn {order.code}</p>
          <h1 className="mt-1 text-h1">{order.storeName}</h1>
          <p className="mt-1 text-small text-muted">
            Đặt {formatDateTime(order.createdAt)} · Nhận {formatDate(order.deliveryDate)}
          </p>
        </div>
        <OrderStatusChip status={order.status} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-6">
          <section className="card p-5 md:p-6">
            <h2 className="text-h3">Thanh toán</h2>
            <p className="mt-1 text-small text-muted">
              {PAYMENT_METHOD_LABEL[order.paymentMethod]} · {PAYMENT_STATUS_LABEL[order.paymentStatus]}
            </p>
            <div className="mt-4">
              <OrderPaymentPanel order={order} />
            </div>
          </section>

          <section className="card p-5 md:p-6">
            <h2 className="text-h3">Sản phẩm</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {displayLines.map((line) => (
                <li key={line.key} className="flex justify-between gap-4 text-small">
                  <span>
                    <span className="font-semibold text-navy">{line.name}{line.components && ` × ${line.quantity}`}</span>
                    {line.components ? <span className="block text-muted">
                      Gồm: {line.components.map((item) => `${item.productName} · ${item.variantName} × ${item.quantity}`).join('; ')}
                    </span> : <span className="block text-muted">
                      {formatVnd(line.listUnitPrice ?? line.unitPrice ?? line.subtotal / (line.quantity ?? 1))} / bánh × {line.quantity} bánh
                    </span>}
                    {!!line.freeQuantity && <span className="block text-success">Tặng {line.freeQuantity} bánh · tính tiền {line.quantity! - line.freeQuantity} bánh</span>}
                    {line.promotionLabel && <span className="block text-success">{line.promotionLabel}</span>}
                    {line.boxContents && <span className="block text-muted">Gồm: {line.boxContents.join(', ')}</span>}
                  </span>
                  <span className="shrink-0 font-semibold text-navy">{formatVnd(line.subtotal)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="flex h-fit flex-col gap-6">
          <section className="card p-5">
            <h2 className="text-h3">Số tiền</h2>
            <dl className="mt-4 grid grid-cols-[1fr_auto] gap-y-1.5 text-small">
              <dt className="text-muted">{discount > 0 ? 'Giá gốc' : 'Tiền hàng'}</dt>
              <dd>{formatVnd(order.subtotalAmount + discount)}</dd>
              {discount > 0 && <>
                <dt className="text-success">{setOnly ? 'Ưu đãi set quà' : 'Giảm giá'}</dt>
                <dd className="text-success">−{formatVnd(discount)}</dd>
              </>}
              <dt className="text-muted">Giao hàng</dt>
              <dd>Miễn phí</dd>
              <dt className="font-semibold">Tổng</dt>
              <dd className="font-semibold text-navy">{formatVnd(order.totalAmount)}</dd>
              <dt className="text-muted">Đã thanh toán</dt>
              <dd>{formatVnd(order.paidAmount)}</dd>
              <dt className="text-muted">Còn lại</dt>
              <dd>{formatVnd(order.remainingAmount)}</dd>
            </dl>
          </section>

          <section className="card p-5">
            <h2 className="text-h3">Người nhận</h2>
            <p className="mt-3 text-small text-ink">{order.receiverName}</p>
            <p className="text-small text-muted">{order.receiverPhone}</p>
            <p className="mt-1 whitespace-pre-line text-small text-muted">{order.shippingAddress}</p>
          </section>

          {CANCELLABLE_STATUSES.includes(order.status) && (
            <div>
              {cancelError && (
                <div className="mb-3">
                  <Notice tone="danger">{cancelError}</Notice>
                </div>
              )}
              <button type="button" className="btn btn-outline w-full" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? 'Đang huỷ...' : 'Huỷ đơn'}
              </button>
            </div>
          )}
          {(order.status === 'DELIVERING' || order.status === 'COMPLETED') && <OrderComplaint orderId={order.id} />}
          {order.status === 'COMPLETED' && <OrderStoreReview orderId={order.id} providerId={order.providerId} />}
        </aside>
      </div>
      {order.status === 'COMPLETED' && <div className="mt-6 card p-5">
        <ProductReviews providerId={order.providerId} storeName={order.storeName} completedOrder={order} />
      </div>}
    </div>
  )
}

function OrderStoreReview({ orderId, providerId }: { orderId: string; providerId: string }) {
  const { data, reload } = useApi(() => storeReviewService.byStore(providerId), [providerId])
  const existing = data?.find((review) => review.orderId === orderId)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string>()

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    setBusy(true)
    setMessage(undefined)
    try {
      await storeReviewService.create(orderId, Number(values.get('rating')), String(values.get('comment') ?? ''))
      reload()
    } catch (error) {
      setMessage(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return <section className="card p-5">
    <h2 className="text-h3">Đánh giá gian hàng</h2>
    {existing ? <><p className="mt-2 text-small text-navy">Bạn đã đánh giá {'★'.repeat(existing.rating)}{'☆'.repeat(5 - existing.rating)}</p>
      {existing.comment && <p className="mt-1 text-small">{existing.comment}</p>}</>
      : <form onSubmit={submit} className="mt-3 flex flex-col gap-3">
        <Field label="Số sao" name="rating"><select id="rating" name="rating" className="input" defaultValue="5">
          {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} sao</option>)}
        </select></Field>
        <TextArea label="Nhận xét" name="comment" rows={3} maxLength={2000} />
        {message && <Notice tone="danger">{message}</Notice>}
        <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>{busy ? 'Đang gửi...' : 'Gửi đánh giá'}</button>
      </form>}
    <Link to={`/stores/${providerId}/reviews`} className="mt-3 inline-block text-small underline">Xem đánh giá gian hàng</Link>
  </section>
}

/** Khiếu nại / đổi trả cho đơn đang giao hoặc đã hoàn tất; mỗi đơn một khiếu nại đang mở */
function OrderComplaint({ orderId }: { orderId: string }) {
  const { data, reload } = useApi(() => complaintService.mine(), [])
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string }>()
  const mine = (data ?? []).filter((c) => c.orderId === orderId)
  const active = mine.some((c) => c.status === 'OPEN' || c.status === 'IN_PROGRESS')

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const f = Object.fromEntries(form) as Record<string, string>
    if (!f.subject?.trim()) return setMessage({ ok: false, text: 'Vui lòng nhập tiêu đề khiếu nại.' })
    setBusy(true)
    setMessage(undefined)
    try {
      const files = (form.getAll('images') as File[]).filter((file) => file.size > 0)
      const singleFile = (form.get('image') as File | null)
      if (singleFile && singleFile.size > 0 && !files.includes(singleFile)) {
        files.push(singleFile)
      }
      if (files.length > 3) throw new Error('Tối đa 3 ảnh minh chứng.')
      for (const f of files) {
        if (f.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
          throw new Error('Ảnh cần là JPG, PNG hoặc WebP và không quá 5 MB mỗi ảnh.')
        }
      }
      const imageUrls = await Promise.all(files.map(complaintService.uploadImage))
      await complaintService.create({ orderId, type: f.type as ComplaintType, subject: f.subject,
        description: f.description || undefined, imageUrls })
      setMessage({ ok: true, text: 'Đã gửi khiếu nại. Xưởng sẽ liên hệ xử lý.' })
      setOpen(false)
      reload()
    } catch (err) {
      setMessage({ ok: false, text: errorMessage(err) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card flex flex-col gap-3 p-5">
      <h2 className="text-h3">Khiếu nại / đổi trả</h2>
      {mine.map((c) => (
        <div key={c.id} className="rounded-sm border border-line p-3 text-small">
          <p className="font-semibold">{c.subject} · <span className={COMPLAINT_STATUS[c.status].tone}>{COMPLAINT_STATUS[c.status].text}</span></p>
          <p className="text-muted">{COMPLAINT_TYPE_LABEL[c.type]} · gửi {formatDateTime(c.createdAt)}</p>
          {c.imageUrl && <a href={c.imageUrl} target="_blank" rel="noopener noreferrer"><img src={c.imageUrl} alt={`Ảnh minh chứng: ${c.subject}`} className="mt-2 max-h-48 rounded-sm object-contain" /></a>}
          {c.resolution && <p className="mt-1">Xưởng phản hồi: {c.resolution}</p>}
          {c.imageUrls?.length > 0 && <div className="mt-2 flex gap-2">{c.imageUrls.map((url) =>
            <a href={url} target="_blank" rel="noreferrer" key={url}><img src={url} alt="Ảnh minh chứng khiếu nại" className="h-20 w-20 rounded object-cover" /></a>)}</div>}
        </div>
      ))}
      {message && <Notice tone={message.ok ? 'success' : 'danger'}>{message.text}</Notice>}
      {!active && (open ? (
        <form noValidate onSubmit={submit} className="flex flex-col gap-3">
          <Field label="Vấn đề" name="type">
            <select id="type" name="type" className="input" defaultValue="DAMAGED">
              {(Object.keys(COMPLAINT_TYPE_LABEL) as ComplaintType[]).map((t) => <option key={t} value={t}>{COMPLAINT_TYPE_LABEL[t]}</option>)}
            </select>
          </Field>
          <TextInput label="Tiêu đề" name="subject" maxLength={255} placeholder="2 bánh bị vỡ khi nhận" />
          <TextArea label="Mô tả (nên kèm thời điểm nhận, tình trạng hộp)" name="description" rows={3} maxLength={5000} />
          <Field label="Ảnh minh chứng (tối đa 3 ảnh, mỗi ảnh 5 MB)" name="images">
            <input id="images" name="images" type="file" accept="image/png,image/jpeg,image/webp" multiple className="input" />
          </Field>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>{busy ? 'Đang gửi...' : 'Gửi khiếu nại'}</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>Thôi</button>
          </div>
        </form>
      ) : (
        <button type="button" className="btn btn-outline btn-sm self-start" onClick={() => setOpen(true)}>Gửi khiếu nại</button>
      ))}
    </section>
  )
}
