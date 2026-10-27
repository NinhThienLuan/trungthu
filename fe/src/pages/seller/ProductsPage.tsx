import { useState, type FormEvent } from 'react'
import { Plus, Search } from 'lucide-react'
import { Badge, Empty, Modal, Notice, OfficeLink, PageHeading } from '../../features/backoffice/ui'
import { eligible, planFor, useBackoffice } from '../../features/backoffice/store'
import { formatVnd } from '../../lib/format'

export function SellerProductsPage() {
  const { skus, docs, subscriptions, changeSkuStatus, saveSku } = useBackoffice()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [adding, setAdding] = useState(false)
  const canPublish = eligible(docs, subscriptions)
  const plan = planFor(subscriptions)
  const rows = skus.filter(sku => (filter === 'ALL' || sku.status === filter) && `${sku.id} ${sku.name} ${sku.variant}`.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi')))
  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const id = String(form.get('id')).trim().toUpperCase()
    if (skus.some(sku => sku.id === id)) { event.currentTarget.querySelector<HTMLInputElement>('[name="id"]')?.setCustomValidity('Mã SKU đã tồn tại.'); event.currentTarget.reportValidity(); return }
    saveSku({ id, name: String(form.get('name')).trim(), variant: String(form.get('variant')).trim(), price: Number(form.get('price')), stock: Number(form.get('stock')), cakeUnits: Number(form.get('units')), status: 'DRAFT' })
    setAdding(false)
  }
  return <>
    <PageHeading title="Danh mục SKU" description="Quản lý từng mã hàng, tồn có thể bán và trạng thái đăng bán." action={<button className="bo-button bo-button-primary" disabled={skus.length >= plan.limit} onClick={() => setAdding(true)}><Plus size={16} /> Thêm SKU nháp</button>} />
    <div className="bo-inline-summary"><span><strong>{skus.length}</strong> / {plan.limit} SKU · Gói {plan.name}</span><OfficeLink to="/seller/subscription">Xem hạn mức gói</OfficeLink></div>
    {!canPublish && <Notice>Chưa thể đăng bán SKU mới. Cần <OfficeLink to="/seller/profile">hồ sơ KYC được duyệt</OfficeLink> và <OfficeLink to="/seller/subscription">gói dịch vụ ACTIVE</OfficeLink>.</Notice>}
    <div className="bo-tabs" aria-label="Lọc trạng thái SKU">{[['ALL', 'Tất cả'], ['PUBLISHED', 'Đang đăng bán'], ['DRAFT', 'Bản nháp'], ['HIDDEN', 'Tạm ẩn']].map(([value, label]) => <button key={value} className={filter === value ? 'is-active' : ''} onClick={() => setFilter(value)} aria-pressed={filter === value}>{label} <span>{skus.filter(sku => value === 'ALL' || sku.status === value).length}</span></button>)}</div>
    <div className="bo-toolbar"><label className="bo-search"><Search size={16} /><input aria-label="Tìm SKU" placeholder="Tìm mã SKU hoặc tên bánh…" value={query} onChange={event => setQuery(event.target.value)} /></label><span className="bo-muted">{rows.length} SKU</span></div>
    <div className="bo-table-wrap"><table className="bo-table"><thead><tr><th>SKU / Sản phẩm</th><th className="bo-num">Đơn giá</th><th className="bo-num">Tồn có thể bán</th><th className="bo-num">Quy đổi nướng</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{rows.map(sku => <tr key={sku.id}><td><strong>{sku.name}</strong><small>{sku.id} · {sku.variant}</small></td><td className="bo-num">{formatVnd(sku.price)}</td><td className="bo-num">{sku.stock}</td><td className="bo-num">{sku.cakeUnits} chiếc / đơn vị</td><td><Badge tone={sku.status === 'PUBLISHED' ? 'good' : 'neutral'}>{sku.status === 'PUBLISHED' ? 'Đang đăng bán' : sku.status === 'DRAFT' ? 'Bản nháp' : 'Tạm ẩn'}</Badge></td><td><button className="bo-button bo-button-small" disabled={sku.status !== 'PUBLISHED' && !canPublish} title={!canPublish && sku.status !== 'PUBLISHED' ? 'Cần KYC được duyệt và gói ACTIVE' : undefined} onClick={() => changeSkuStatus(sku.id)}>{sku.status === 'PUBLISHED' ? 'Tạm ẩn' : 'Đăng bán'}</button></td></tr>)}</tbody></table>{!rows.length && <Empty>Không có SKU phù hợp. Thử tên khác hoặc chọn tất cả trạng thái.</Empty>}</div>
    <p className="bo-footnote">Tồn có thể bán đã trừ các đơn đang giữ chỗ. Set 4 bánh quy đổi 4 chiếc vào hạn ngạch nướng.</p>
    {adding && <Modal title="Thêm SKU nháp" onClose={() => setAdding(false)}><form onSubmit={add} className="bo-form"><label>Mã SKU<input name="id" required maxLength={40} pattern="[a-zA-Z0-9-]+" onInput={event => event.currentTarget.setCustomValidity('')} placeholder="DP-SEN-200" /></label><label>Tên sản phẩm<input name="name" required maxLength={120} /></label><label>Quy cách / vị bánh<input name="variant" required maxLength={120} /></label><div className="bo-form-grid"><label>Đơn giá (đ)<input name="price" type="number" min="1" max="100000000" step="1" required /></label><label>Tồn có thể bán<input name="stock" type="number" min="0" max="1000000" step="1" defaultValue="0" required /></label></div><label>Số chiếc bánh / đơn vị bán<select name="units"><option value="1">1 chiếc · bánh lẻ</option><option value="4">4 chiếc · set 4</option><option value="6">6 chiếc · set 6</option></select></label><p className="bo-muted">SKU mới luôn bắt đầu ở trạng thái nháp.</p><button className="bo-button bo-button-primary">Lưu SKU</button></form></Modal>}
  </>
}
