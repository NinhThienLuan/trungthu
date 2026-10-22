import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Empty, Input, Select, Space, Table, Typography } from 'antd'
import { api, ApiError } from '../api'
import { formatTime } from '../labels'
import type { OrderSummary, Page } from '../types'
import { OrderStatusTag, money, orderStatusOptions } from '../ui'

export function OrdersPage({ role }: { role: 'CUSTOMER' | 'PROVIDER' }) {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const listPath = role === 'CUSTOMER' ? '/api/orders/me' : '/api/provider/orders'

  function load() {
    api.get<Page<OrderSummary>>(`${listPath}?page=0&size=100`)
      .then((page) => setOrders(page.content))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Không tải được đơn'))
  }

  useEffect(load, [listPath])

  async function run(path: string) {
    setError('')
    try {
      await api.post(path)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Thao tác thất bại')
    }
  }

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return orders.filter((order) => {
      const text = `${order.code} ${order.storeName ?? ''}`.toLowerCase()
      if (needle && !text.includes(needle)) return false
      if (status !== 'all' && order.status !== status) return false
      return true
    })
  }, [orders, query, status])

  return (
    <div className="page">
      <Typography.Title level={2}>{role === 'CUSTOMER' ? 'Đơn của tôi' : 'Đơn hàng của shop'}</Typography.Title>
      <Typography.Paragraph type="secondary">
        Thanh toán và chuyển trạng thái ở đây là API giả lập để thử luồng kho.
      </Typography.Paragraph>
      {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />}
      <div className="toolbar">
        <Input.Search
          allowClear
          placeholder="Tìm mã đơn"
          style={{ width: 240 }}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <label className="filter-field">
          Trạng thái
          <Select
            style={{ width: 220 }}
            value={status}
            onChange={setStatus}
            options={[{ value: 'all', label: 'Tất cả' }, ...orderStatusOptions]}
          />
        </label>
        <Button onClick={() => { setQuery(''); setStatus('all') }}>Reset</Button>
      </div>
      <Table
        rowKey="id"
        dataSource={shown}
        pagination={{ pageSize: 8, showSizeChanger: false }}
        locale={{ emptyText: <Empty description={orders.length === 0 ? 'Chưa có đơn.' : 'Không có đơn khớp bộ lọc.'} /> }}
        columns={[
          {
            title: 'Mã đơn',
            dataIndex: 'code',
            render: (code: string, order: OrderSummary) => (
              <Link to={role === 'CUSTOMER' ? `/orders/${order.id}` : `/seller/orders/${order.id}`}>{code}</Link>
            ),
          },
          { title: 'Ngày tạo', dataIndex: 'createdAt', render: (value: string) => formatTime(value) },
          { title: 'Ngày nhận', dataIndex: 'deliveryDate' },
          { title: 'Trạng thái', dataIndex: 'status', render: (value: string) => <OrderStatusTag status={value} /> },
          { title: 'Tổng', dataIndex: 'totalAmount', render: (value: number) => money(value) },
          {
            title: '',
            key: 'actions',
            render: (_: unknown, order: OrderSummary) => (
              <Space wrap>
                {role === 'CUSTOMER' && order.status === 'PENDING_DEPOSIT' && (
                  <>
                    <Button size="small" type="primary" onClick={() => run(`/api/dummy/orders/${order.id}/pay`)}>Thanh toán</Button>
                    <Button size="small" onClick={() => run(`/api/dummy/orders/${order.id}/cancel`)}>Hủy</Button>
                  </>
                )}
                {role === 'PROVIDER' && ['CONFIRMED', 'DEPOSITED', 'BAKING_QUEUED', 'DELIVERING'].includes(order.status) && (
                  <Button size="small" type="primary" onClick={() => run(`/api/dummy/provider/orders/${order.id}/advance`)}>
                    Bước tiếp theo
                  </Button>
                )}
              </Space>
            ),
          },
        ]}
      />
    </div>
  )
}
