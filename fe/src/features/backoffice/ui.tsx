import { useEffect, useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import type { ComplianceDoc } from './model'
export function OfficeLink({ to, children, className }: { to: string; children: ReactNode; className?: string }) {
  return <Link to={to} className={className ?? 'bo-text-link'}>{children}</Link>
}
export function PageHeading({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  useEffect(() => { document.title = `${title} | Nguyệt Viên Đài` }, [title])
  return <div className="bo-page-heading"><div><h1>{title}</h1><p>{description}</p></div>{action && <div className="bo-heading-action">{action}</div>}</div>
}
export function Panel({ title, note, action, children, className = '' }: { title: string; note?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`bo-panel ${className}`}><div className="bo-panel-heading"><div><h2>{title}</h2>{note && <p>{note}</p>}</div>{action}</div>{children}</section>
}
export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'good' | 'warning' | 'bad' }) {
  return <span className={`bo-badge bo-badge-${tone}`}>{children}</span>
}
export function Notice({ children }: { children: ReactNode }) { return <div className="bo-notice">{children}</div> }
export function Empty({ children }: { children: ReactNode }) { return <p className="bo-empty">{children}</p> }
export function MetricStrip({ items }: { items: { label: string; value: ReactNode; hint?: string }[] }) {
  return <div className="bo-metrics">{items.map(item => <div key={item.label}><span>{item.label}</span><strong>{item.value}</strong>{item.hint && <small>{item.hint}</small>}</div>)}</div>
}
export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close() }, [])
  return <dialog ref={ref} className="bo-modal" aria-label={title} onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose() }}><div className="bo-modal-heading"><h2>{title}</h2><button className="bo-icon-btn" aria-label="Đóng" onClick={onClose}><X size={18} /></button></div>{children}</dialog>
}
export function DocumentPreview({ doc, onClose }: { doc: ComplianceDoc; onClose: () => void }) {
  return <Modal title={doc.name} onClose={onClose}>{doc.url ? <><p className="bo-muted">{doc.filename}</p><a className="bo-button" href={doc.url} target="_blank" rel="noreferrer">Mở tài liệu đã chọn</a></> : <div className="bo-document"><span>Thông tin tài liệu</span><h3>{doc.name}</h3><p>Xưởng bánh Đông Phương</p><hr /><p>{doc.filename}</p><p>Chưa có tệp đính kèm để xem. Vui lòng nộp lại tài liệu.</p></div>}</Modal>
}
