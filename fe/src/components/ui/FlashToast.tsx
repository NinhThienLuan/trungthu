import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Icon } from '../Icon'

/** Thông báo một lần sau khi chuyển trang: navigate(path, { state: { flash: '...' } }) */
export function FlashToast() {
  const location = useLocation()
  const flash = (location.state as { flash?: string } | null)?.flash
  const [text, setText] = useState<string>()

  useEffect(() => {
    if (!flash) return
    setText(flash)
    // Xoá khỏi history để F5 không hiện lại
    window.history.replaceState({ ...window.history.state, usr: null }, '')
    const id = window.setTimeout(() => setText(undefined), 3000)
    return () => window.clearTimeout(id)
  }, [flash])

  if (!text) return null
  return (
    <div role="status" aria-live="polite"
      className="fixed top-24 right-6 z-50 flex max-w-sm items-center gap-3 rounded-[0.25rem] bg-primary px-5 py-3 text-champagne-light shadow-2xl">
      <Icon name="check_circle" className="text-[22px] text-secondary" aria-hidden />
      <span className="font-body-sm text-body-sm">{text}</span>
    </div>
  )
}
