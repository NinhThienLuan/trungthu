import { LogoutOutlined } from '@ant-design/icons'
import { Button, Layout as AntLayout, Menu, Space, Typography } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'

const { Header, Content } = AntLayout

const customerItems = [
  { key: '/catalog', label: 'Cửa hàng' },
  { key: '/cart', label: 'Giỏ hàng' },
  { key: '/orders', label: 'Đơn của tôi' },
]

const sellerItems = [
  { key: '/seller/dashboard', label: 'Dashboard' },
  { key: '/seller/products', label: 'Sản phẩm' },
  { key: '/seller/orders', label: 'Đơn hàng' },
]

function selectedKey(pathname: string, seller: boolean) {
  const items = seller ? sellerItems : customerItems
  return items.find((item) => pathname === item.key || pathname.startsWith(`${item.key}/`))?.key ?? items[0].key
}

export function Layout() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const location = useLocation()
  const seller = user?.role === 'PROVIDER'
  const items = seller ? sellerItems : customerItems

  return (
    <AntLayout style={{ minHeight: '100vh', background: '#fff7ed' }}>
      <Header className="app-header">
        <Typography.Text className="brand" onClick={() => navigate(items[0].key)}>
          Bánh Trung Thu
        </Typography.Text>
        <Menu
          mode="horizontal"
          selectedKeys={[selectedKey(location.pathname, seller)]}
          items={items}
          onClick={({ key }) => navigate(key)}
          style={{ flex: 1, minWidth: 0, borderBottom: 'none', background: 'transparent' }}
        />
        {user && (
          <Space size="middle">
            <Typography.Text type="secondary">{user.email}</Typography.Text>
            <Button icon={<LogoutOutlined />} onClick={logout}>Đăng xuất</Button>
          </Space>
        )}
      </Header>
      <Content className="app-content">
        <Outlet />
      </Content>
    </AntLayout>
  )
}
