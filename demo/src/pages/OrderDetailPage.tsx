import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert, Button, Descriptions, Space, Spin, Table, Typography } from 'antd'
import { api, ApiError } from '../api'
import { formatTime } from '../labels'
import type { OrderSummary } from '../types'
import { OrderStatusTag, money } from '../ui'

type OrderLine = {
  variantId: string
  sourceSetId?: string | null
  sourceSetName?: string | null
  productName: string
  variantName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

type OrderDetail = OrderSummary & {
  receiverName?: string | null
  receiverPhone?: string | null
  shippingAddress?: string | null
  subtotalAmount?: number | null
  shippingFee?: number | null
  listAmount?: number | null
  discountAmount?: number | null
  lines?: OrderLine[]
}

type DisplayLine = {
  key: string
  productName: string
  variantName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

function gcd(left: number, right: number): number {
  return right === 0 ? left : gcd(right, left % right)
}

function displayLines(lines: OrderLine[]): DisplayLine[] {
  const loose = lines.filter((line) => !line.sourceSetId)
  const groups = new Map<string, OrderLine[]>()
  for (const line of lines) {
    if (!line.sourceSetId) continue
    const current = groups.get(line.sourceSetId) ?? []
    current.push(line)
    groups.set(line.sourceSetId, current)
  }
  const rows: DisplayLine[] = loose.map((line) => ({
    key: line.variantId,
    productName: line.productName,
    variantName: line.variantName,
    quantity: line.quantity,
    unitPrice: Number(line.unitPrice),
    subtotal: Number(line.subtotal),
  }))
  for (const [id, group] of groups) {
    const subtotal = group.reduce((sum, line) => sum + Number(line.subtotal), 0)
    const sets = group.reduce((value, line) => gcd(value, line.quantity), group[0].quantity)
    rows.push({
      key: id,
      productName: group[0].sourceSetName || 'Set',
      variantName: group.map((line) => `${line.productName} · ${line.variantName} × ${line.quantity / sets}`).join('; '),
      quantity: sets,
      unitPrice: subtotal / sets,
      subtotal,
    })
  }
  return rows
}

export function OrderDetailPage({ role }: { role: 'CUSTOMER' | 'PROVIDER' }) {
  const { orderId } = useParams()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [error, setError] = useState('')
  const back = role === 'CUSTOMER' ? '/orders' : '/seller/orders'

  function load() {
    api.get<OrderDetail>(`/api/orders/${orderId}`)
      .then(setOrder)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Không tải được đơn'))
  }

  useEffect(load, [orderId])

  async function run(path: string) {
    setError('')
    try {
      await api.post(path)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Thao tác thất bại')
    }
  }

  if (!order) {
    return <div className="page">{error ? <Alert type="error" showIcon message={error} /> : <Spin />}</div>
  }

  return (
    <div className="page">
      <Link to={back}>← Danh sách đơn</Link>
      <Typography.Title level={2} style={{ marginTop: 8 }}>{order.code}</Typography.Title>
      {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />}
      <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Trạng thái"><OrderStatusTag status={order.status} /></Descriptions.Item>
        <Descriptions.Item label="Thanh toán">{order.paymentStatus}</Descriptions.Item>
        <Descriptions.Item label="Cửa hàng">{order.storeName || '—'}</Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">{formatTime(order.createdAt)}</Descriptions.Item>
        <Descriptions.Item label="Ngày nhận">{order.deliveryDate}</Descriptions.Item>
        <Descriptions.Item label="Người nhận">{order.receiverName || '—'}</Descriptions.Item>
        <Descriptions.Item label="Điện thoại">{order.receiverPhone || '—'}</Descriptions.Item>
        <Descriptions.Item label="Địa chỉ">{order.shippingAddress || '—'}</Descriptions.Item>
        <Descriptions.Item label="Tạm tính">{money(order.subtotalAmount)}</Descriptions.Item>
        {Number(order.discountAmount) > 0 && (
          <Descriptions.Item label="Giá gốc">{money(order.listAmount)}</Descriptions.Item>
        )}
        {Number(order.discountAmount) > 0 && (
          <Descriptions.Item label="Chiết khấu">{money(order.discountAmount)}</Descriptions.Item>
        )}
        <Descriptions.Item label="Phí giao">{money(order.shippingFee)}</Descriptions.Item>
        <Descriptions.Item label="Tổng thanh toán">{money(order.totalAmount)}</Descriptions.Item>
      </Descriptions>
      <Table
        tableLayout="fixed"
        rowKey="key"
        dataSource={displayLines(order.lines ?? [])}
        pagination={false}
        columns={[
          { title: 'Sản phẩm', dataIndex: 'productName' },
          { title: 'Phân loại', dataIndex: 'variantName', width: 280 },
          { title: 'Số lượng', dataIndex: 'quantity', width: 110 },
          { title: 'Đơn giá', width: 150, render: (_: unknown, line: DisplayLine) => <span className="money-cell">{money(line.unitPrice)}</span> },
          { title: 'Thành tiền', width: 160, render: (_: unknown, line: DisplayLine) => <span className="money-cell">{money(line.subtotal)}</span> },
        ]}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={4}><strong>Tổng</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={4}><strong className="money-cell">{money(order.totalAmount)}</strong></Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
      <Space style={{ marginTop: 16 }}>
        {role === 'CUSTOMER' && order.status === 'PENDING_DEPOSIT' && (
          <>
            <Button type="primary" onClick={() => run(`/api/dummy/orders/${order.id}/pay`)}>Thanh toán</Button>
            <Button onClick={() => run(`/api/dummy/orders/${order.id}/cancel`)}>Hủy</Button>
          </>
        )}
        {role === 'PROVIDER' && ['CONFIRMED', 'DEPOSITED', 'BAKING_QUEUED', 'DELIVERING'].includes(order.status) && (
          <Button type="primary" onClick={() => run(`/api/dummy/provider/orders/${order.id}/advance`)}>Bước tiếp theo</Button>
        )}
      </Space>
    </div>
  )
}
