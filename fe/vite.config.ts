import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Proxy /api sang Spring Boot để FE và BE cùng origin -> cookie HttpOnly hoạt động, không vướng CORS.
// BE chạy cổng khác 8080: đặt API_TARGET, vd `API_TARGET=http://localhost:8081 npm run dev`
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      proxy: {
        '/api': env.API_TARGET || 'http://localhost:8080',
        '/uploads': env.API_TARGET || 'http://localhost:8080',
      },
    },
  }
})
