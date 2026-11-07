import { useState } from 'react'
import { Printer, RefreshCw } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { addDays, formatDate, toIsoDate } from '../lib/format'
import { sellerService } from '../services/sellerService'
import { useAuthStore } from '../stores/authStore'
import { EmptyState, ErrorState, Spinner } from './ui/States'

export function BakeSheet() {
  const [date, setDate] = useState(() => toIsoDate(new Date()))
  return (
    <section className="flex flex-col gap-5">
      <div className="no-print flex flex-wrap items-end gap-3">
        <label className="text-small font-semibold" htmlFor="bake-date">Ngày nướng
          <input id="bake-date" type="date" className="input mt-1" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <button type="button" className="btn btn-outline" onClick={() => setDate(toIsoDate(new Date()))}>Hôm nay</button>
        <button type="button" className="btn btn-outline" onClick={() => setDate(toIsoDate(addDays(new Date(), 1)))}>Ngày mai</button>
      </div>
      {date ? <BakeSheetResult key={date} date={date} /> : <p role="status" className="text-small">Chọn ngày nướng để xem phiếu.</p>}
    </section>
  )
}

function BakeSheetResult({ date }: { date: string }) {
  const storeName = useAuthStore((state) => state.user?.storeName ?? state.user?.fullName)
  const { data, loading, error, reload } = useApi(() => sellerService.getBakeSheet(date), [date])
  const rows = data ?? []
  const ready = !loading && !error && rows.length > 0
  const total = rows.reduce((sum, line) => sum + line.bakeQuantity, 0)
  const orders = new Set(rows.flatMap((line) => line.orderCodes))
  const deliveryDate = toIsoDate(addDays(new Date(`${date}T12:00:00`), 1))

  return (
    <>
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <p className="text-small text-muted">Chỉ tổng hợp đơn đã xác nhận trở đi, không gồm đơn chờ cọc hoặc đã hủy.</p>
        <div className="flex gap-2">
          <button type="button" className="btn btn-outline btn-sm" disabled={loading} onClick={reload}><RefreshCw size={16} aria-hidden="true" />Tải lại</button>
          <button type="button" className="btn btn-primary btn-sm" disabled={!ready} onClick={() => window.print()}><Printer size={16} aria-hidden="true" />In phiếu nướng</button>
        </div>
      </div>
      {loading ? <Spinner label="Đang tổng hợp phiếu nướng..." /> : error ? <ErrorState message={error} onRetry={reload} />
        : rows.length === 0 ? <EmptyState title="Không có bánh cần nướng trong ngày này" /> : (
          <article className="bake-sheet card p-4 sm:p-6" aria-label="Phiếu nướng bánh">
            <div className="mb-5 flex flex-wrap justify-between gap-4">
              <div>
                <h2 className="text-h2">Phiếu nướng bánh</h2>
                <p className="mt-1 font-semibold">{storeName}</p>
                <p className="mt-2 text-small">Ngày nướng: <b>{formatDate(date)}</b> · Ngày giao: {formatDate(deliveryDate)}</p>
              </div>
              <p className="text-small">Tổng: <b>{total.toLocaleString('vi-VN')} cái</b> · {orders.size} đơn hàng</p>
            </div>
            <p className="no-print mb-2 text-small text-muted sm:hidden">Vuốt ngang để xem đủ số lượng và mã đơn hàng.</p>
            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full min-w-[640px] text-small print:min-w-0">
                <thead><tr className="border-b border-line text-left"><th className="py-3 pr-3">Sản phẩm</th><th className="px-3">Biến thể</th><th className="px-3 text-right">Số cái cần nướng</th><th className="py-3 pl-3">Mã đơn hàng</th></tr></thead>
                <tbody>
                  {rows.map((line, index) => <tr key={`${line.variantId ?? 'set'}-${index}`} className="border-b border-line align-top">
                    <td className="py-3 pr-3 font-semibold">{line.productName}</td>
                    <td className="p-3">{line.variantName ?? '—'}</td>
                    <td className="p-3 text-right font-semibold tabular-nums">{line.bakeQuantity.toLocaleString('vi-VN')}</td>
                    <td className="py-3 pl-3"><ul aria-label={`Mã đơn của ${line.productName} ${line.variantName ?? ''}`} tabIndex={0} className="flex max-h-40 flex-col gap-1 overflow-y-auto pr-1 focus-visible:outline-2 focus-visible:outline-navy print:max-h-none print:overflow-visible">{[...new Set(line.orderCodes)].map((code) => <li key={code} className="break-all">{code}</li>)}</ul></td>
                  </tr>)}
                </tbody>
                <tfoot><tr className="font-semibold"><td colSpan={2} className="py-3">Tổng số bánh</td><td className="p-3 text-right tabular-nums">{total.toLocaleString('vi-VN')}</td><td /></tr></tfoot>
              </table>
            </div>
            <p className="mt-4 text-small text-muted">Số lượng đã được quy đổi theo đơn hàng. Set quà được báo theo thông tin sản phẩm, không tách vị bánh khi chưa có định mức.</p>
          </article>
        )}
    </>
  )
}
