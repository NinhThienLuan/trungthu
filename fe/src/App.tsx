import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { useAuthStore } from './stores/authStore'

export default function App() {
  const init = useAuthStore((s) => s.init)
  // Kiểm tra phiên đăng nhập (cookie) một lần khi mở app
  useEffect(() => {
    void init()
  }, [init])

  return <RouterProvider router={router} />
}
