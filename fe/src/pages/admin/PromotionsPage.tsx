import { useState, type FormEvent } from 'react'
import { errorMessage } from '../../apis/http'
import { useApi } from '../../hooks/useApi'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { addDays, formatDate, toIsoDate } from '../../lib/format'
import { promotionService, sellerService, type Promotion, type PromotionInput, type PromotionType } from '../../services/sellerService'
import { Field, TextInput } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState, ErrorState, Notice, Spinner } from '../../components/ui/States'

const today = () => toIsoDate(new Date())

const statusOf = (p: Promotion) =>
  !p.active ? { text: 'Đang tắt', tone: 'text-muted' }
    : p.running ? { text: 'Đang chạy', tone: 'text-success' }
      : p.startDate > today() ? { text: 'Sắp diễn ra', tone: 'text-navy' }
        : { text: 'Đã kết thúc', tone: 'text-muted' }

/** Gửi lại đủ trường khi chỉ đổi bật/tắt (BE nhận cả bản ghi) */
const toInput = (p: Promotion, active: boolean): PromotionInput => ({
  name: p.name, type: p.type, productId: p.productId ?? undefined,
  minQuantity: p.minQuantity ?? undefined, percentOff: p.percentOff ?? undefined,
  buyQuantity: p.buyQuantity ?? undefined, freeQuantity: p.freeQuantity ?? undefined,
  startDate: p.startDate, endDate: p.endDate, active,
})

/** Seller: sự kiện khuyến mãi (giảm % theo số lượng, mua X tặng Y). BE tự trừ vào đơn khi khách đặt */
export function PromotionsPage() {
  useDocumentTitle('Khuyến mãi')
  const { data, loading, error, reload } = useApi(() => promotionService.mine(), [])
  const products = useApi(() => sellerService.products(), [])
  const [type, setType] = useState<PromotionType>('BUY_X_GET_Y')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<{ ok: boolean; text: string }>()

  const run = async (action: () => Promise<unknown>, done: string) => {
    setBusy(true)
    setNotice(undefined)
    try {
      await action()
      setNotice({ ok: true, text: done })
      reload()
      return true
    } catch (err) {
      setNotice({ ok: false, text: errorMessage(err) })
      return false
    } finally {
      setBusy(false)
    }
  }

  const create = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const f = Object.fromEntries(new FormData(form)) as Record<string, string>
    const num = (k: string) => (f[k] ? Number(f[k]) : undefined)
    const ok = await run(() => promotionService.create({
      name: f.name, type, productId: f.productId || undefined,
      minQuantity: num('minQuantity'), percentOff: num('percentOff'),
      buyQuantity: num('buyQuantity'), freeQuantity: num('freeQuantity'),
      startDate: f.startDate, endDate: f.endDate,
    }), `Đã tạo khuyến mãi "${f.name}".`)
    if (ok) form.reset()
  }

  const sellable = (products.data ?? []).filter((p) => p.status !== 'ARCHIVED' && p.productType !== 'GIFT_SET')

  return (
    <div className="page section flex flex-col gap-6">
      <PageHeader eyebrow="Gian hàng" title="Khuyến mãi"
        description="Tạo sự kiện giảm giá khi khách mua nhiều. Khuyến mãi tự trừ vào giá khi khách đặt hàng; mỗi dòng hàng lấy mức giảm lớn nhất." />

      <form noValidate onSubmit={create} className="card grid gap-4 p-5 md:grid-cols-2">
        <h2 className="text-h3 md:col-span-2">Tạo sự kiện mới</h2>
        <TextInput label="Tên sự kiện" name="name" placeholder="Trung thu đoàn viên" required maxLength={150} />
        <Field label="Áp dụng cho" name="productId">
          <select id="productId" name="productId" className="input" defaultValue="">
            <option value="">Tất cả sản phẩm của xưởng (trừ set quà)</option>
            {sellable.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <fieldset className="md:col-span-2">
          <legend className="field-label">Kiểu khuyến mãi</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {([['BUY_X_GET_Y', 'Mua X tặng Y'], ['PERCENT_OFF', 'Giảm % khi mua từ N cái']] as const).map(([value, label]) => (
              <label key={value} className={`chip cursor-pointer ${type === value ? 'chip-active' : ''}`}>
                <input type="radio" name="type" value={value} className="sr-only" checked={type === value} onChange={() => setType(value)} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        {type === 'BUY_X_GET_Y' ? (
          <>
            <TextInput key="buy" label="Mua (cái)" name="buyQuantity" type="number" min={1} defaultValue={3} required hint="Vd mua 3" />
            <TextInput key="free" label="Tặng (cái)" name="freeQuantity" type="number" min={1} defaultValue={1} required hint="tặng 1 — lặp lại theo từng bộ 4 cái" />
          </>
        ) : (
          <>
            <TextInput key="min" label="Từ số lượng (cái)" name="minQuantity" type="number" min={1} defaultValue={10} required />
            <TextInput key="pct" label="Giảm (%)" name="percentOff" type="number" min={1} max={90} defaultValue={10} required />
          </>
        )}
        <TextInput label="Bắt đầu" name="startDate" type="date" min={today()} defaultValue={today()} required />
        <TextInput label="Kết thúc" name="endDate" type="date" min={today()} defaultValue={toIsoDate(addDays(new Date(), 14))} required />
        <button type="submit" className="btn btn-primary self-start" disabled={busy}>Tạo khuyến mãi</button>
      </form>

      {notice && <Notice tone={notice.ok ? 'success' : 'danger'}>{notice.text}</Notice>}

      {loading && !data ? <Spinner /> : error ? <ErrorState message={error} onRetry={reload} />
        : !data?.length ? <EmptyState title="Chưa có khuyến mãi nào" /> : (
          <div className="card overflow-x-auto p-0">
            <table className="w-full text-small">
              <thead className="text-left text-muted">
                <tr><th className="p-3">Sự kiện</th><th>Ưu đãi</th><th>Áp dụng</th><th>Thời gian</th><th>Trạng thái</th><th className="p-3 text-right">Thao tác</th></tr>
              </thead>
              <tbody>
                {data.map((p) => {
                  const status = statusOf(p)
                  return (
                    <tr key={p.id} className="border-t border-line">
                      <td className="p-3 font-medium">{p.name}</td>
                      <td className="whitespace-nowrap font-semibold text-navy">{p.label}</td>
                      <td>{p.productName ?? 'Cả xưởng'}</td>
                      <td className="whitespace-nowrap">{formatDate(p.startDate)} – {formatDate(p.endDate)}</td>
                      <td className={`whitespace-nowrap font-medium ${status.tone}`}>{status.text}</td>
                      <td className="whitespace-nowrap p-3 text-right">
                        <button type="button" className="btn btn-ghost btn-sm" disabled={busy}
                          onClick={() => run(() => promotionService.update(p.id, toInput(p, !p.active)), p.active ? `Đã tắt "${p.name}".` : `Đã bật "${p.name}".`)}>
                          {p.active ? 'Tắt' : 'Bật'}
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm text-danger" disabled={busy}
                          onClick={() => window.confirm(`Xoá khuyến mãi "${p.name}"? Đơn đã đặt vẫn giữ giá đã giảm.`)
                            && run(() => promotionService.remove(p.id), `Đã xoá "${p.name}".`)}>
                          Xoá
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
    </div>
  )
}
