import { useState, type FormEvent } from 'react'
import { Printer } from 'lucide-react'
import { Badge, Empty, Notice, PageHeading, Panel } from '../../features/backoffice/ui'
import { bookedFor, useBackoffice } from '../../features/backoffice/store'
import { DEMO_DATE, STORE_NAME, bakeDate, isProductionOrder } from '../../features/backoffice/model'

export function SellerCapacityPage() {
  const { orders, skus, capacities, saveCapacity } = useBackoffice()
  const [date, setDate] = useState('2026-10-31')
  const [tab, setTab] = useState<'capacity' | 'bake'>('capacity')
  const confirmed = orders.filter(order => isProductionOrder(order) && bakeDate(order.deliveryDate) === date)
  const bakeRows = skus.map(sku => ({ ...sku, quantity: confirmed.reduce((sum, order) => sum + order.lines.filter(line => line.skuId === sku.id).reduce((qty, line) => qty + line.quantity, 0), 0) })).filter(sku => sku.quantity > 0)
  const total = bakeRows.reduce((sum, sku) => sum + sku.quantity * sku.cakeUnits, 0)
  function save(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); saveCapacity(String(data.get('date')), Number(data.get('max'))) }
  return <>
    <div className="bo-print-hide"><PageHeading title="Hạn ngạch & phiếu ra lò" description="Lập năng lực theo ngày nướng. Ngày nướng luôn trước ngày nhận một ngày." />
      <div className="bo-tabs"><button className={tab === 'capacity' ? 'is-active' : ''} onClick={() => setTab('capacity')} aria-pressed={tab === 'capacity'}>Hạn ngạch nướng</button><button className={tab === 'bake' ? 'is-active' : ''} onClick={() => setTab('bake')} aria-pressed={tab === 'bake'}>Phiếu ra lò</button></div>
    </div>
    {tab === 'capacity' ? <>
      <Notice>Đơn chờ cọc cũng giữ hạn ngạch. Khi đơn bị hủy hoặc hết 15 phút chờ cọc, hạn ngạch được nhả lại. Không giảm hạn ngạch xuống dưới số chiếc đã giữ.</Notice>
      <div className="bo-grid-2"><Panel title="Lịch năng lực nướng" note="Đơn vị: chiếc bánh. Set 4 tính 4 chiếc, không tính thêm vỏ hộp.">{Object.entries(capacities).sort(([left], [right]) => left.localeCompare(right)).map(([day, max]) => { const booked = bookedFor(orders, skus, day); return <div key={day} className="bo-capacity-row"><div><strong>{day}</strong><span className="bo-num">{booked} / {max} chiếc</span></div><progress value={booked} max={max || 1} aria-label={`${day}: ${booked} trên ${max} chiếc`} /><small>Còn nhận {max - booked} chiếc <Badge tone={booked >= max ? 'warning' : 'good'}>{booked >= max ? 'Kín lịch' : 'Còn chỗ'}</Badge></small></div> })}</Panel>
      <Panel title="Thiết lập theo ngày" note="Hạn ngạch không được thấp hơn số chiếc đã giữ."><form className="bo-form" onSubmit={save}><label>Ngày nướng<input type="date" name="date" min={DEMO_DATE} defaultValue={date} required /></label><label>Hạn ngạch tối đa (chiếc bánh)<input type="number" name="max" min="0" max="1000000" step="1" defaultValue={capacities[date] ?? 100} required /></label><button className="bo-button bo-button-primary">Lưu hạn ngạch</button></form></Panel></div>
    </> : <>
      <div className="bo-toolbar bo-print-hide"><label className="bo-inline-label">Ngày nướng<input type="date" value={date} onChange={event => setDate(event.target.value)} /></label><button className="bo-button" onClick={() => window.print()} disabled={!bakeRows.length}><Printer size={16} /> In phiếu ra lò</button></div>
      <section className="bo-print-sheet"><div className="bo-report-heading"><div><span>{STORE_NAME}</span><h2>Phiếu ra lò · {date || 'Chọn ngày'}</h2><p>{confirmed.length} đơn hợp lệ · {total} chiếc bánh quy đổi</p></div><Badge>Ngày nướng</Badge></div><div className="bo-table-wrap"><table className="bo-table"><thead><tr><th>Mã SKU / Vị bánh</th><th className="bo-num">Số lượng đặt</th><th className="bo-num">Chiếc / đơn vị</th><th className="bo-num">Tổng chiếc bánh</th></tr></thead><tbody>{bakeRows.map(sku => <tr key={sku.id}><td><strong>{sku.name}</strong><small>{sku.id} · {sku.variant}</small></td><td className="bo-num">{sku.quantity}</td><td className="bo-num">{sku.cakeUnits}</td><td className="bo-num">{sku.quantity * sku.cakeUnits}</td></tr>)}</tbody><tfoot><tr><th colSpan={3}>Tổng số chiếc bánh cần chuẩn bị</th><td className="bo-num"><strong>{total}</strong></td></tr></tfoot></table>{!bakeRows.length && <Empty>Không có đơn đã cọc, đang giao hoặc hoàn tất cho ngày nướng này.</Empty>}</div><p className="bo-footnote">Chỉ gồm DEPOSITED, DELIVERING, COMPLETED. Không lấy đơn chờ cọc hoặc đã hủy.</p></section>
    </>}
  </>
}
