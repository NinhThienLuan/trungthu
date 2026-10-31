import { formatDate, formatVnd, toIsoDate } from './format'
import type { QuoteResponse, RfqResponse } from '../types/order'

const esc = (value: unknown) =>
  String(value ?? '—').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

/**
 * Phiếu xác nhận đơn sỉ sau khi khách chấp nhận báo giá: hai bên in/lưu PDF để ký hợp đồng.
 * Mở cửa sổ in riêng (không kèm menu/trang web).
 */
export function printRfqConfirmation(rfq: RfqResponse, quote: QuoteResponse) {
  const total = quote.unitPrice * quote.offeredQuantity
  const row = (label: string, value: unknown) => `<tr><th>${esc(label)}</th><td>${esc(value)}</td></tr>`
  const html = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Xác nhận đơn sỉ ${esc(rfq.code)}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap">
<style>body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;margin:40px;color:#111}h1{font-size:22px;margin:0 0 4px}p{margin:0 0 16px;color:#555}
table{width:100%;border-collapse:collapse;margin-bottom:20px}th,td{border:1px solid #ccc;padding:8px;text-align:left;vertical-align:top}
th{width:34%;background:#f6f3ec}h2{font-size:16px;margin:20px 0 8px}.sign{display:flex;justify-content:space-between;margin-top:48px}
.sign div{width:45%;text-align:center}</style></head><body>
<h1>Phiếu xác nhận đơn hàng sỉ</h1><p>Mã yêu cầu ${esc(rfq.code)} · lập ngày ${esc(formatDate(toIsoDate(new Date())))}</p>
<h2>Bên mua</h2><table>${row('Doanh nghiệp', rfq.companyName)}${row('Mã số thuế', rfq.taxCode)}
${row('Người liên hệ', `${rfq.contactName ?? ''} — ${rfq.contactPosition ?? ''}`)}${row('Điện thoại', rfq.contactPhone)}${row('Email', rfq.contactEmail)}</table>
<h2>Bên bán</h2><table>${row('Xưởng', quote.providerName)}${row('Điện thoại', quote.providerPhone)}${row('Email', quote.providerEmail)}${row('Địa chỉ', quote.providerAddress)}</table>
<h2>Nội dung đơn</h2><table>${row('Số lượng', `${quote.offeredQuantity} hộp`)}${row('Đơn giá', formatVnd(quote.unitPrice))}
${row('Thành tiền (chưa gồm VAT)', formatVnd(total))}${row('Ngày giao dự kiến', formatDate(quote.estimatedDeliveryDate))}${row('Ghi chú của xưởng', quote.note)}
${row('Yêu cầu của khách', rfq.description)}</table>
<div class="sign"><div>ĐẠI DIỆN BÊN MUA<br><br><br><br>(Ký, ghi rõ họ tên)</div><div>ĐẠI DIỆN BÊN BÁN<br><br><br><br>(Ký, ghi rõ họ tên)</div></div>
<script>window.onload=()=>document.fonts.ready.then(()=>window.print())</script></body></html>`
  const win = window.open('', '_blank')
  if (!win) return false
  win.document.write(html)
  win.document.close()
  return true
}
