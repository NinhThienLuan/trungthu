import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/style.css'
import App from './App'
import { ICON_FONT_URL } from './constants/icons'

// Tải font icon Material Symbols (chỉ các icon trong constants/icons.ts) trước khi render
const iconFont = document.createElement('link')
iconFont.rel = 'stylesheet'
iconFont.href = ICON_FONT_URL
document.head.appendChild(iconFont)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
