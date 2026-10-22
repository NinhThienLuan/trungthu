import { ShopOutlined, UserOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd'
import { useAuthStore } from '../stores/authStore'
import { homeFor } from '../routes'

const SELLER = { email: 'seller@kinhdo.vn', password: '12345678' }
const BUYER = { email: 'buyer@gmail.com', password: '12345678' }

export function LoginPage() {
  const user = useAuthStore((state) => state.user)
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()
  const [email, setEmail] = useState(SELLER.email)
  const [password, setPassword] = useState(SELLER.password)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={homeFor(user.role)} replace />

  async function submit() {
    setError('')
    setBusy(true)
    try {
      const signedIn = await login(email, password)
      navigate(homeFor(signedIn.role))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không đăng nhập được')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-screen">
      <Card style={{ width: 420, boxShadow: '0 16px 40px rgba(154, 52, 18, 0.12)' }}>
        <Typography.Title level={2} style={{ marginTop: 0, color: '#9a3412' }}>Bánh Trung Thu</Typography.Title>
        <Typography.Paragraph type="secondary">Đăng nhập để xem cửa hàng hoặc quản lý lò bánh.</Typography.Paragraph>
        {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />}
        <Form layout="vertical" onFinish={submit}>
          <Form.Item label="Email">
            <Input value={email} onChange={(event) => setEmail(event.target.value)} />
          </Form.Item>
          <Form.Item label="Mật khẩu">
            <Input.Password value={password} onChange={(event) => setPassword(event.target.value)} />
          </Form.Item>
          <Space wrap>
            <Button icon={<ShopOutlined />} onClick={() => { setEmail(SELLER.email); setPassword(SELLER.password) }}>
              Điền seller
            </Button>
            <Button icon={<ShopOutlined />} onClick={() => { setEmail('seller@dongkhanh.vn'); setPassword(SELLER.password) }}>
              Điền Đồng Khánh
            </Button>
            <Button icon={<ShopOutlined />} onClick={() => { setEmail('seller@givral.vn'); setPassword(SELLER.password) }}>
              Điền Givral
            </Button>
            <Button icon={<UserOutlined />} onClick={() => { setEmail(BUYER.email); setPassword(BUYER.password) }}>
              Điền buyer
            </Button>
          </Space>
          <Button block type="primary" htmlType="submit" loading={busy} style={{ marginTop: 16 }}>
            Đăng nhập
          </Button>
        </Form>
      </Card>
    </div>
  )
}
