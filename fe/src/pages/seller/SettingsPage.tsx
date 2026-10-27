import type { FormEvent } from 'react'
import { Badge, Notice, PageHeading, Panel } from '../../features/backoffice/ui'
import { eligible, useBackoffice } from '../../features/backoffice/store'

export function SellerSettingsPage() {
  const { bank, seasonActive, toggleSeason, saveBank, docs, subscriptions } = useBackoffice()
  const allowed = eligible(docs, subscriptions)
  function save(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); saveBank({ code: String(data.get('code')).trim(), number: String(data.get('number')).trim(), name: String(data.get('name')).trim() }) }
  return <>
    <PageHeading title="Cài đặt bán hàng" description="Chủ động nhận đơn theo mùa và thiết lập tài khoản nhận chuyển khoản của xưởng." />
    <div className="bo-settings-row"><div><h2>Nhận đơn theo mùa</h2><p>Tắt để ngừng nhận đơn mới. Đơn đã nhận vẫn tiếp tục được xử lý.</p><p className="bo-muted">KYC và gói dịch vụ vẫn được kiểm tra độc lập.</p></div><Panel title="Trạng thái gian hàng"><div className="bo-switch-row"><div><strong>{seasonActive ? 'Đang bật nhận đơn' : 'Tạm ngừng nhận đơn'}</strong><p>{allowed && seasonActive ? 'Đủ điều kiện nhận đơn mới.' : 'Cần đủ KYC, gói ACTIVE và bật nhận đơn.'}</p></div><button role="switch" aria-checked={seasonActive} aria-label="Nhận đơn theo mùa" className={`bo-switch ${seasonActive ? 'is-on' : ''}`} onClick={toggleSeason}><span /></button></div><Badge tone={allowed && seasonActive ? 'good' : 'warning'}>{allowed && seasonActive ? 'Sẵn sàng nhận đơn' : 'Chưa nhận đơn mới'}</Badge></Panel></div>
    <div className="bo-settings-row"><div><h2>Tài khoản nhận tiền</h2><p>Khách chuyển tiền cọc B2C trực tiếp đến tài khoản của xưởng.</p><Notice>Kiểm tra chính xác ngân hàng, số tài khoản và tên chủ tài khoản trước khi lưu.</Notice></div><Panel title="Thông tin chuyển khoản"><form className="bo-form" onSubmit={save}><label>Ngân hàng<input name="code" defaultValue={bank.code} required maxLength={100} /></label><label>Số tài khoản<input name="number" defaultValue={bank.number} inputMode="numeric" pattern="[0-9]{6,30}" required /></label><label>Tên chủ tài khoản<input name="name" defaultValue={bank.name} required maxLength={100} /></label><button className="bo-button bo-button-primary">Lưu thông tin</button></form></Panel></div>
  </>
}
