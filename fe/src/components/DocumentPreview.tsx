import { useEffect, useId, useRef, useState } from 'react'

export function DocumentPreview({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const [zoom, setZoom] = useState(1)
  const [failed, setFailed] = useState(false)
  const isPdf = /\.pdf(?:[?#]|$)/i.test(url)

  useEffect(() => {
    const element = dialog.current!
    element.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      element.close()
      document.body.style.overflow = previousOverflow
    }
  }, [])

  return (
    <dialog ref={dialog} aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onClose() }}
      className="fixed inset-0 m-auto max-h-[94dvh] w-[calc(100%-2rem)] max-w-6xl overflow-hidden rounded-sm bg-white p-0 text-ink shadow-xl backdrop:bg-black/60">
      <div className="flex max-h-[94dvh] flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
          <h2 id={titleId} className="min-w-0 break-words text-h3">{title}</h2>
          <button type="button" autoFocus className="btn btn-outline btn-sm" onClick={onClose}>Đóng</button>
        </div>
        <div className="flex flex-wrap items-center gap-2 px-4 py-3">
          {!isPdf && !failed && <>
            <button type="button" className="btn btn-outline btn-sm" disabled={zoom <= 1} onClick={() => setZoom((value) => Math.max(1, value - 0.5))}>Thu nhỏ</button>
            <span className="text-small" role="status">{zoom * 100}%</span>
            <button type="button" className="btn btn-outline btn-sm" disabled={zoom >= 3} onClick={() => setZoom((value) => Math.min(3, value + 0.5))}>Phóng to</button>
          </>}
          <a href={url} target="_blank" rel="noreferrer" className="text-small underline">Mở tệp gốc</a>
        </div>
        <div className="min-h-0 overflow-auto bg-surface p-3">
          {isPdf ? <iframe src={url} title={title} className="h-[65dvh] w-full border-0 bg-white" />
            : failed ? <p role="alert" className="p-4 text-small text-danger">Không tải được ảnh. Hãy mở tệp gốc hoặc thử lại sau.</p>
              : <div style={{ width: `${zoom * 100}%` }}><img src={url} alt={title} className="mx-auto block max-h-none w-full object-contain" onError={() => setFailed(true)} /></div>}
        </div>
      </div>
    </dialog>
  )
}
