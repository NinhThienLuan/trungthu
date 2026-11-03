import { useEffect, useRef, useState } from 'react'
import { FileText, Upload, X } from 'lucide-react'

export function DocumentUploadField({ id, label, file, disabled, onChange }: {
  id: string; label: string; file: File | null; disabled: boolean; onChange: (file: File | null) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string>()
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) { setPreview(undefined); return }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const select = (next: File | null) => {
    setDragging(false)
    if (disabled) return
    if (next && !['image/jpeg', 'image/png', 'application/pdf'].includes(next.type)) {
      setError('Vui lòng chọn ảnh JPG, PNG hoặc tài liệu PDF.')
      return
    }
    if (next && (next.size === 0 || next.size > 10 * 1024 * 1024)) {
      setError(next.size === 0 ? 'Tệp đang trống. Hãy chọn tệp khác.' : 'Tệp vượt quá 10 MB. Hãy chọn tệp nhỏ hơn.')
      return
    }
    setError(undefined)
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-3">
      <div onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragging(true) }}
        onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false) }}
        onDrop={(event) => { event.preventDefault(); select(event.dataTransfer.files[0] ?? null) }}
        className={`relative rounded-sm border border-dashed p-4 transition-colors focus-within:border-navy focus-within:ring-2 focus-within:ring-navy/20 ${dragging ? 'border-navy bg-champagne/60' : 'border-line bg-surface'} ${disabled ? 'opacity-60' : 'hover:border-navy'}`}>
        <input ref={input} id={id} name="file" type="file" accept="image/jpeg,image/png,application/pdf" disabled={disabled}
          aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`} aria-invalid={!!error}
          className="peer sr-only" onChange={(event) => { select(event.target.files?.[0] ?? null); event.target.value = '' }} />
        <label htmlFor={id} className={`flex flex-col items-center gap-2 text-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
          <Upload size={22} strokeWidth={1.5} className="text-navy" aria-hidden="true" />
          <span className="text-small font-semibold text-navy">{file ? 'Chọn tệp khác' : label}</span>
          <span id={`${id}-hint`} className="text-small text-muted">Kéo thả hoặc bấm để chọn<br />JPG, PNG, PDF · Tối đa 10 MB</span>
        </label>
      </div>
      {file && <div className="flex min-w-0 items-center gap-3 rounded-sm border border-line p-3" role="status">
        {preview ? <img src={preview} alt="Ảnh giấy tờ đã chọn" className="size-14 shrink-0 rounded-sm border border-line object-contain" />
          : <FileText size={28} strokeWidth={1.5} className="shrink-0 text-navy" aria-hidden="true" />}
        <div className="min-w-0 flex-1 text-small">
          <p className="break-all font-semibold text-ink">{file.name}</p>
          <p className="text-muted">{file.size < 1024 * 1024 ? `${Math.ceil(file.size / 1024)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`} · Chưa nộp</p>
        </div>
        <button type="button" disabled={disabled} aria-label="Bỏ tệp đã chọn" className="shrink-0 rounded-sm p-2 text-muted hover:bg-surface hover:text-danger focus-visible:outline-2 focus-visible:outline-navy disabled:opacity-50"
          onClick={() => { select(null); input.current?.focus() }}><X size={18} aria-hidden="true" /></button>
      </div>}
      {error && <p id={`${id}-error`} role="alert" className="text-small text-danger">{error}</p>}
    </div>
  )
}
