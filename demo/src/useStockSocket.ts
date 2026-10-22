import { useEffect, useRef } from 'react'

export function useStockSocket(onUpdate: (variantId: string) => void) {
  const handler = useRef(onUpdate)
  handler.current = onUpdate

  useEffect(() => {
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
    const socket = new WebSocket(`${protocol}://${location.host}/ws/stock`)
    socket.onmessage = (event) => {
      const update = JSON.parse(event.data) as { variantId: string }
      handler.current(update.variantId)
    }
    return () => socket.close()
  }, [])
}
