import { ArrowRight, Check, Clock3 } from 'lucide-react'
import { Badge, MetricStrip, Notice, OfficeLink, PageHeading, Panel } from '../../features/backoffice/ui'
import { activePlan, bookedFor, eligible, kycApproved, planFor, useBackoffice } from '../../features/backoffice/store'
import { RFQS, STAGES, orderTotal } from '../../features/backoffice/model'
import { formatVnd } from '../../lib/format'

export function SellerDashboardPage() {
  const { docs, subscriptions, orders, skus, capacities, seasonActive } = useBackoffice()
  const approved = kycApproved(docs)
  const subscription = activePlan(subscriptions)
  const plan = planFor(subscriptions)
  const allowed = eligible(docs, subscriptions)
  const pending = orders.filter(order => order.stage === 'PENDING_DEPOSIT')
  return <>
    <PageHeading title="Tổng quan gian hàng" description="Ưu tiên đơn chờ cọc, lịch nướng và điều kiện nhận đơn của xưởng." action={<OfficeLink to="/seller/orders" className="bo-button bo-button-primary">Xử lý đơn hàng <ArrowRight size={15} /></OfficeLink>} />
    {!allowed && <Notice>Gian hàng chưa đủ điều kiện đăng bán SKU mới và nhận RFQ: {!approved ? 'hồ sơ KYC đang chờ duyệt' : 'chưa có gói dịch vụ ACTIVE'}. <OfficeLink to="/seller/profile">Xem hồ sơ</OfficeLink></Notice>}
    <MetricStrip items={[
      { label: 'Đơn chờ xác nhận cọc', value: pending.length, hint: 'Giữ hàng tối đa 15 phút' },
      { label: 'Đơn cần giao', value: orders.filter(order => order.stage === 'DEPOSITED').length, hint: 'Gồm đơn COD đủ điều kiện' },
      { label: 'SKU trong danh mục', value: `${skus.length} / ${plan.limit}`, hint: `Gói ${plan.name}` },
      { label: 'Nhận đơn theo mùa', value: seasonActive ? 'Đang bật' : 'Tạm ngừng', hint: 'Seller chủ động bật / tắt' },
    ]} />
    <div className="bo-grid-2">
      <Panel title="Đơn cần xử lý" note={`${pending.length} đơn đang chờ xác nhận cọc`} action={<OfficeLink to="/seller/orders">Tất cả đơn</OfficeLink>}>
        <div className="bo-list">{orders.filter(order => ['PENDING_DEPOSIT', 'DEPOSITED', 'DELIVERING'].includes(order.stage)).slice(0, 3).map(order => <OfficeLink key={order.id} to="/seller/orders" className="bo-list-row"><div><strong>{order.customer}</strong><small>{order.id} · {STAGES[order.stage]}</small></div><span className="bo-num">{formatVnd(orderTotal(order))}<ArrowRight size={14} /></span></OfficeLink>)}</div>
      </Panel>
      <Panel title="Hạn ngạch nướng" note="Số chiếc bánh đã giữ, gồm cả đơn đang chờ cọc" action={<OfficeLink to="/seller/capacity">Xem lịch</OfficeLink>}>
        {Object.entries(capacities).map(([date, max]) => { const booked = bookedFor(orders, skus, date); return <div className="bo-capacity-row" key={date}><div><span>{date}</span><strong className="bo-num">{booked} / {max} chiếc</strong></div><progress value={booked} max={max || 1} aria-label={`Đã giữ ${booked} trên ${max} chiếc ngày ${date}`} /></div> })}
      </Panel>
      <Panel title="Điều kiện hoạt động" note="KYC được duyệt và gói ACTIVE là hai điều kiện đăng bán.">
        <div className="bo-check-list"><div>{approved ? <Check size={17} /> : <Clock3 size={17} />}<span>Hồ sơ pháp lý và an toàn thực phẩm</span><Badge tone={approved ? 'good' : 'warning'}>{approved ? 'Đã duyệt' : 'Chờ duyệt'}</Badge></div><div><Check size={17} /><span>Gói {plan.name} · {plan.limit} SKU</span><Badge tone={subscription ? 'good' : 'warning'}>{subscription ? 'ACTIVE' : 'Chưa có gói'}</Badge></div></div>
        <OfficeLink to="/seller/subscription">Quản lý gói dịch vụ <ArrowRight size={14} /></OfficeLink>
      </Panel>
      <Panel title="Yêu cầu mua sỉ RFQ" note="Doanh nghiệp gửi nhu cầu; xưởng tự liên hệ ngoài hệ thống.">
        <div className="bo-rfq-summary"><strong>{allowed ? RFQS.length : 0}</strong><div>{allowed ? 'yêu cầu được phân phối đến gian hàng' : 'yêu cầu khả dụng khi đủ điều kiện'}<small>Từ 20 hộp · ngày nhận cách ngày gửi ít nhất 3 ngày</small></div></div>
        <OfficeLink to="/seller/b2b">{allowed ? 'Xem thông tin liên hệ' : 'Xem điều kiện nhận RFQ'} <ArrowRight size={14} /></OfficeLink>
      </Panel>
    </div>
  </>
}
