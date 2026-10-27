import { useState, type FormEvent } from 'react'
import { Search } from 'lucide-react'
import { Badge, Empty, Modal, Notice, PageHeading } from '../../features/backoffice/ui'
import { useBackoffice } from '../../features/backoffice/store'
import { STAGES, bakeDate, orderTotal, orderUnits, type DemoOrder, type OrderStage } from '../../features/backoffice/model'
import { formatVnd } from '../../lib/format'

export function SellerOrdersPage() {
  const { orders, skus, transition, notify } = useBackoffice()
  const [filter, setFilter] = useState<OrderStage | 'ALL'>('ALL')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string>()
  const selected = orders.find(order => order.id === selectedId)
  const rows = orders.filter(order => (filter === 'ALL' || order.stage === filter) && `${order.id} ${order.customer}`.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi')))
  function confirm(event: FormEvent<HTMLFormElement>, order: DemoOrder) {
    event.preventDefault()
    const received = Number(new FormData(event.currentTarget).get('received'))
    if (order.stage === 'DELIVERING' && received !== orderTotal(order) - order.paid) return notify('Cần xác nhận đã thu đủ số tiền còn lại để hoàn tất đơn.')
    transition(order.id, order.stage === 'PENDING_DEPOSIT' ? 'DEPOSITED' : order.stage === 'DEPOSITED' ? 'DELIVERING' : 'COMPLETED', received)
  }
  return <>
    <PageHeading title="Đơn hàng" description="Xác nhận cọc, giao hàng và hoàn tất theo đúng vòng đời đơn B2C." />
    <div className="bo-flow"><span>Chờ cọc</span><b>→</b><span>Đã cọc / COD</span><b>→</b><span>Đang giao</span><b>→</b><span>Hoàn tất</span><small>Chỉ hủy khi còn chờ cọc</small></div>
    <div className="bo-tabs" aria-label="Lọc đơn hàng">{(['ALL', ...Object.keys(STAGES)] as (OrderStage | 'ALL')[]).map(stage => <button key={stage} className={filter === stage ? 'is-active' : ''} onClick={() => setFilter(stage)} aria-pressed={filter === stage}>{stage === 'ALL' ? 'Tất cả' : STAGES[stage]} <span>{orders.filter(order => stage === 'ALL' || order.stage === stage).length}</span></button>)}</div>
    <div className="bo-toolbar"><label className="bo-search"><Search size={16} /><input aria-label="Tìm đơn hàng" placeholder="Tìm mã đơn hoặc khách hàng…" value={query} onChange={event => setQuery(event.target.value)} /></label><span className="bo-muted">{rows.length} đơn hàng</span></div>
    <div className="bo-table-wrap"><table className="bo-table"><thead><tr><th>Đơn / Khách hàng</th><th>Ngày nhận</th><th className="bo-num">Tổng tiền</th><th>Thanh toán</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{rows.map(order => <tr key={order.id}><td><strong>{order.customer}</strong><small>{order.id}</small></td><td>{order.deliveryDate}<small>Nướng {bakeDate(order.deliveryDate)}</small></td><td className="bo-num">{formatVnd(orderTotal(order))}<small>Đã thu {formatVnd(order.paid)}</small></td><td>{order.method === 'COD' ? 'COD' : 'Chuyển khoản'}<small>{order.method === 'COD' && order.stage !== 'COMPLETED' ? 'Chưa thu tiền' : order.paid ? 'Đã ghi nhận thanh toán' : 'Chưa nhận cọc'}</small></td><td><Badge tone={order.stage === 'PENDING_DEPOSIT' ? 'warning' : order.stage === 'COMPLETED' ? 'good' : 'neutral'}>{STAGES[order.stage]}</Badge>{order.stage === 'PENDING_DEPOSIT' && <small>Giữ chỗ tối đa 15 phút</small>}</td><td><button className="bo-button bo-button-small" onClick={() => setSelectedId(order.id)}>{order.stage === 'PENDING_DEPOSIT' ? 'Xác nhận cọc' : order.stage === 'DEPOSITED' ? 'Giao hàng' : 'Xem đơn'}</button></td></tr>)}</tbody></table>{!rows.length && <Empty>Không có đơn hàng phù hợp với bộ lọc.</Empty>}</div>
    <p className="bo-footnote">Đơn COD được tạo ở trạng thái DEPOSITED, nhưng chưa thu tiền; chỉ áp dụng khi không in tên và tổng dưới 2.000.000đ.</p>
    {selected && <Modal title={`Đơn ${selected.id}`} onClose={() => setSelectedId(undefined)}>
      <div className="bo-detail-title"><strong>{selected.customer}</strong><Badge tone={selected.stage === 'PENDING_DEPOSIT' ? 'warning' : 'neutral'}>{STAGES[selected.stage]}</Badge></div>
      <p className="bo-muted">{selected.phone} · {selected.address}</p><p className="bo-muted">Nhận {selected.deliveryDate} · Nướng {bakeDate(selected.deliveryDate)} · {orderUnits(selected, skus)} chiếc bánh</p>
      {selected.printName && <p>In tên: {selected.printName}</p>}
      <div className="bo-list">{selected.lines.map(line => <div className="bo-list-row" key={line.skuId}><div><strong>{skus.find(sku => sku.id === line.skuId)?.name}</strong><small>{line.skuId} · {line.quantity} × {formatVnd(line.unitPrice)}</small></div><span className="bo-num">{formatVnd(line.quantity * line.unitPrice)}</span></div>)}<div className="bo-list-row"><span>Phí giao hàng</span><span className="bo-num">{formatVnd(selected.shipping)}</span></div><div className="bo-list-row"><strong>Tổng tiền</strong><strong className="bo-num">{formatVnd(orderTotal(selected))}</strong></div></div>
      {selected.stage === 'PENDING_DEPOSIT' && <Notice>Hạn giữ chỗ: {selected.holdUntil ? new Date(selected.holdUntil).toLocaleTimeString('vi-VN') : '—'}. Chỉ xác nhận sau khi đã kiểm tra tiền vào tài khoản xưởng. Hết hạn sẽ hoàn tồn kho và nhả hạn ngạch.</Notice>}
      {['PENDING_DEPOSIT', 'DEPOSITED', 'DELIVERING'].includes(selected.stage) && <form key={selected.stage} className="bo-form" onSubmit={event => confirm(event, selected)}>
        {selected.stage === 'PENDING_DEPOSIT' && <label>Số tiền cọc thực nhận (đ)<input name="received" type="number" min={Math.ceil(orderTotal(selected) / 2)} max={orderTotal(selected)} step="1" defaultValue={Math.ceil(orderTotal(selected) / 2)} required /><small>Tối thiểu {formatVnd(Math.ceil(orderTotal(selected) / 2))} · tối đa {formatVnd(orderTotal(selected))}</small></label>}
        {selected.stage === 'DELIVERING' && <label>Số tiền còn lại đã thu (đ)<input name="received" type="number" min="0" step="1" defaultValue={orderTotal(selected) - selected.paid} required /><small>Cần thu đủ {formatVnd(orderTotal(selected) - selected.paid)} trước khi hoàn tất.</small></label>}
        <button className="bo-button bo-button-primary">{selected.stage === 'PENDING_DEPOSIT' ? 'Xác nhận đã nhận cọc' : selected.stage === 'DEPOSITED' ? 'Chuyển sang đang giao' : 'Xác nhận hoàn tất đơn'}</button>
      </form>}
      {selected.stage === 'PENDING_DEPOSIT' && <details className="bo-cancel"><summary>Hủy đơn chưa cọc</summary><p>Tồn kho và hạn ngạch của đơn sẽ được hoàn lại.</p><button className="bo-button bo-button-danger" onClick={() => transition(selected.id, 'CANCELLED')}>Xác nhận hủy {selected.id}</button></details>}
      {selected.stage === 'CANCELLED' && <Notice>Đơn đã hủy; tồn kho và hạn ngạch giữ chỗ đã được hoàn.</Notice>}
    </Modal>}
  </>
}
