import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App as AntdApp, ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#c2410c',
          colorInfo: '#b45309',
          colorLink: '#c2410c',
          borderRadius: 10,
          fontFamily: '"Be Vietnam Pro", system-ui, sans-serif',
          colorBgLayout: '#fff7ed',
        },
        components: {
          Layout: { headerBg: '#fffaf3', bodyBg: '#fff7ed' },
          Menu: { horizontalItemSelectedColor: '#c2410c' },
        },
      }}
    >
      <AntdApp>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  </StrictMode>,
)
