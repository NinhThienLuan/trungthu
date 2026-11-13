import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, Tag, Package, Gift, Sparkles, Star, CheckCircle2, X } from 'lucide-react'
import { orderService } from '../../services/orderService'
import { productReviewService } from '../../services/productReviewService'
import { errorMessage } from '../../apis/http'
import { useApi } from '../../hooks/useApi'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { CANCELLABLE_STATUSES, PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL, ROUTES } from '../../constants'
import { formatDate, formatDateTime, formatVnd } from '../../lib/format'
import { displayOrderLines, type DisplayOrderLine } from '../../lib/orderDisplay'
import { OrderPaymentPanel } from '../../components/OrderPaymentPanel'
import { OrderStatusChip } from '../../components/OrderStatusChip'
import { ErrorState, Notice, Spinner } from '../../components/ui/States'
import { Field, TextArea, TextInput } from '../../components/ui/Field'
import { COMPLAINT_STATUS, COMPLAINT_TYPE_LABEL, complaintService, type ComplaintType } from '../../services/complaintService'
import { ProductReviews } from '../../components/ProductReviews'

/** GET /api/orders/{id} + huỷ đơn (POST /api/orders/{id}/cancel) khi còn được phép */
export function OrderDetailPage() {
  const { id = '' } = useParams()
  const { data: order, loading, error, reload } = useApi(() => orderService.detail(id), [id])
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string>()
  useDocumentTitle(order ? `Đơn ${order.code}` : 'Chi tiết đơn')
  const [reviewingLine, setReviewingLine] = useState<DisplayOrderLine | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState('')
  const { data: reviewedIds, reload: reloadReviewed } = useApi<string[]>(
    () => (order?.status === 'COMPLETED' ? productReviewService.reviewedProductIds(order.id) : Promise.resolve([])),
    [order?.id, order?.status],
  )

  if (loading) return <Spinner />
  if (error || !order) {
    return (
      <div className="page section">
        <ErrorState message={error ?? 'Không tìm thấy đơn hàng'} onRetry={reload} />
      </div>
    )
  }

  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!reviewingLine?.productId || !order) return
    setSubmittingReview(true)
    setReviewSuccess('')
    try {
      await productReviewService.create(reviewingLine.productId, order.id, reviewRating, reviewComment)
      setReviewSuccess('Đã gửi đánh giá thành công!')
      reloadReviewed()
      setTimeout(() => {
        setReviewingLine(null)
        setReviewComment('')
        setReviewRating(5)
        setReviewSuccess('')
      }, 1000)
    } catch (err) {
      alert(errorMessage(err))
    } finally {
      setSubmittingReview(false)
    }
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
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h2 className="text-h3">Chi tiết sản phẩm</h2>
              <span className="text-small text-muted">{displayLines.length} món</span>
            </div>

            <div className="mt-2 flex flex-col divide-y divide-line">
              {displayLines.map((line) => {
                const unitPrice = line.unitPrice ?? (line.quantity ? line.subtotal / line.quantity : 0)
                return (
                  <div key={line.key} className="py-4 first:pt-3 last:pb-0">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Product details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-navy text-base">{line.productName}</span>
                          {line.variantName && (
                            <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                              {line.variantName}
                            </span>
                          )}
                          {line.promotionLabel && (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-medium text-amber-700">
                              <Tag className="size-3 text-amber-600" aria-hidden />
                              {line.promotionLabel}
                            </span>
                          )}
                        </div>

                        {/* Gift set components */}
                        {line.components && line.components.length > 0 && (
                          <div className="mt-2.5 rounded-md bg-stone-50 p-2.5 text-xs text-muted border border-stone-200">
                            <p className="font-medium text-slate-700 mb-1 flex items-center gap-1">
                              <Gift className="size-3 text-primary" aria-hidden /> Thành phần trong set ({line.components.length} bánh):
                            </p>
                            <ul className="list-disc list-inside space-y-0.5 pl-1">
                              {line.components.map((item, idx) => (
                                <li key={idx}>
                                  <span className="text-slate-800 font-medium">{item.productName}</span>
                                  {item.variantName && <span className="text-muted"> ({item.variantName})</span>}
                                  <span className="text-muted"> × {item.quantity}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Custom box contents */}
                        {line.boxContents && line.boxContents.length > 0 && (
                          <div className="mt-2 text-xs text-muted flex items-start gap-1.5">
                            <Package className="size-3.5 text-slate-400 mt-0.5 shrink-0" aria-hidden />
                            <span>Vị bánh: {line.boxContents.join(', ')}</span>
                          </div>
                        )}

                        {/* Personalization text */}
                        {line.personalizationText && (
                          <div className="mt-2 text-xs text-primary flex items-start gap-1.5">
                            <Sparkles className="size-3.5 text-primary mt-0.5 shrink-0" aria-hidden />
                            <span>In lời chúc riêng: &quot;{line.personalizationText}&quot;</span>
                            {line.personalizationFee ? <span>(+{formatVnd(line.personalizationFee)})</span> : null}
                          </div>
                        )}
                      </div>

                      {/* Pricing & Quantity & Review Action */}
                      <div className="flex md:flex-col md:items-end justify-between items-center shrink-0 text-small pt-2 md:pt-0 border-t md:border-t-0 border-line/60">
                        <div className="text-muted">
                          {formatVnd(unitPrice)} <span className="text-ink font-medium">× {line.purchasedQuantity ?? line.quantity}</span>
                          {(line.quantity ?? 0) > (line.purchasedQuantity ?? line.quantity ?? 0) && (
                            <span className="ml-1 text-success">+ {(line.quantity ?? 0) - (line.purchasedQuantity ?? 0)} bánh tặng</span>
                          )}
                        </div>
                        <div className="font-semibold text-navy text-base md:mt-1">
                          {formatVnd(line.subtotal)}
                        </div>
                        {order.status === 'COMPLETED' && line.productId && (
                          <div className="mt-2.5">
                            {reviewedIds?.includes(line.productId) ? (
                              <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
                                <CheckCircle2 className="size-3.5" aria-hidden /> Đã đánh giá bánh
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded border border-amber-300 bg-amber-50/80 px-2 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 transition-colors"
                                onClick={() => {
                                  setReviewingLine(line)
                                  setReviewRating(5)
                                  setReviewComment('')
                                  setReviewSuccess('')
                                }}
                              >
                                <Star className="size-3 text-amber-500 fill-amber-400" aria-hidden />
                                Đánh giá bánh
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
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
        </aside>
      </div>
      {order.status === 'COMPLETED' && <div className="mt-6 card p-5">
        <ProductReviews providerId={order.providerId} storeName={order.storeName} completedOrder={order} />
      </div>}

      {/* Modal đánh giá bánh */}
      {reviewingLine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-md p-6 bg-white shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h3 className="text-h3 font-semibold text-navy">Đánh giá bánh</h3>
              <button
                type="button"
                onClick={() => setReviewingLine(null)}
                className="text-muted hover:text-navy p-1"
                aria-label="Đóng"
              >
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4">
              <div>
                <p className="text-small font-semibold text-navy">{reviewingLine.productName}</p>
                {reviewingLine.variantName && (
                  <p className="text-xs text-muted">{reviewingLine.variantName}</p>
                )}
              </div>
              <div>
                <label className="block text-small font-medium text-slate-700 mb-1.5">Số sao đánh giá</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={`size-6 transition-colors ${
                          star <= reviewRating ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-small font-medium text-amber-700 ml-1">{reviewRating} sao</span>
                </div>
              </div>
              <div>
                <label className="block text-small font-medium text-slate-700 mb-1">
                  Nhận xét về bánh (hương vị, độ ngọt, chất lượng):
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="input w-full text-small"
                  rows={3}
                  maxLength={2000}
                  placeholder="Bánh thơm ngon, vỏ mềm vừa ăn, nhân thập cẩm đậm đà..."
                />
              </div>
              {reviewSuccess ? (
                <div className="text-center text-small text-success font-medium flex items-center justify-center gap-1.5 py-1">
                  <CheckCircle2 className="size-4" /> {reviewSuccess}
                </div>
              ) : (
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setReviewingLine(null)}
                    disabled={submittingReview}
                  >
                    Huỷ
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={submittingReview}
                  >
                    {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
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
      if (files.length > 3) throw new Error('Tối đa 3 ảnh minh chứng.')
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
            <input id="images" name="images" type="file" accept="image/png,image/jpeg" multiple className="input" />
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
