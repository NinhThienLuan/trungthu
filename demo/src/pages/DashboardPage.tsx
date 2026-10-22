import { useEffect, useState } from 'react'
import { Alert, Card, Spin, Table, Typography } from 'antd'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api, ApiError } from '../api'
import { Stat } from '../OrderCharts'
import { useStockSocket } from '../useStockSocket'

type VariantRank = {
  variantId: string
  productName: string
  variantName: string
  soldQuantity: number
  cancelledQuantity: number
  soldOrders: number
  cancelledOrders: number
}

type CustomerRank = {
  customerId: string
  fullName: string
  email: string
  quantity: number
  orders: number
}

type Dashboard = {
  totalOrders: number
  soldOrders: number
  cancelledOrders: number
  pendingOrders: number
  listRevenue: number
  discountTotal: number
  revenue: number
  variants: VariantRank[]
  topBuyers: CustomerRank[]
  topCancellers: CustomerRank[]
}

export function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null)
  const [error, setError] = useState('')

  function load() {
    api.get<Dashboard>('/api/provider/dashboard')
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Không tải được dashboard'))
  }

  useEffect(load, [])
  useStockSocket(() => load())

  if (!data) {
    return <div className="page">{error ? <Alert type="error" showIcon message={error} /> : <Spin />}</div>
  }

  const topSold = [...data.variants].sort((left, right) => right.soldQuantity - left.soldQuantity)[0]
  const topCancelled = [...data.variants].sort((left, right) => right.cancelledQuantity - left.cancelledQuantity)[0]
  const chart = data.variants.map((variant) => ({
    name: `${variant.productName} · ${variant.variantName}`,
    sold: variant.soldQuantity,
    cancelled: variant.cancelledQuantity,
  }))

  return (
    <div className="page">
      <Typography.Title level={2}>Dashboard</Typography.Title>
      {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />}
      <div className="stats">
        <Stat label="Tổng đơn" value={data.totalOrders} />
        <Stat label="Đã bán" value={data.soldOrders} />
        <Stat label="Đã hủy" value={data.cancelledOrders} />
        <Stat label="Đang chờ" value={data.pendingOrders} />
        <Stat label="Doanh thu gốc" value={data.listRevenue} />
        <Stat label="Chiết khấu" value={data.discountTotal} />
        <Stat label="Doanh thu" value={data.revenue} />
      </div>

      <Card title="So sánh phân loại" style={{ marginBottom: 16 }}>
        <Typography.Paragraph>
          Bán nhiều nhất: <strong>{topSold && topSold.soldQuantity > 0
            ? `${topSold.productName} · ${topSold.variantName} (${topSold.soldQuantity})` : 'chưa có'}</strong>
          {' · '}
          Bị hủy nhiều nhất: <strong>{topCancelled && topCancelled.cancelledQuantity > 0
            ? `${topCancelled.productName} · ${topCancelled.variantName} (${topCancelled.cancelledQuantity})`
            : 'chưa có'}          </strong>
        </Typography.Paragraph>
        {chart.length === 0 ? <Typography.Text type="secondary">Chưa có đơn hàng.</Typography.Text> : (
          <ResponsiveContainer width="100%" height={Math.max(220, chart.length * 48)}>
            <BarChart data={chart} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="sold" name="Số bánh đã bán" fill="#15803d" isAnimationActive={false} />
              <Bar dataKey="cancelled" name="Số bánh bị hủy" fill="#a8a29e" isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="chart-row">
        <CustomerTable title="Khách mua nhiều nhất" rows={data.topBuyers} />
        <CustomerTable title="Khách hủy nhiều nhất" rows={data.topCancellers} />
      </div>
    </div>
  )
}

function CustomerTable({ title, rows }: { title: string; rows: CustomerRank[] }) {
  return (
    <Card className="chart-box" title={title}>
      <Table
        rowKey="customerId"
        size="small"
        pagination={false}
        dataSource={rows}
        locale={{ emptyText: 'Chưa có dữ liệu.' }}
        columns={[
          {
            title: 'Khách hàng',
            render: (_: unknown, row: CustomerRank) => (
              <>
                {row.fullName}
                <div><Typography.Text type="secondary">{row.email}</Typography.Text></div>
              </>
            ),
          },
          { title: 'Số bánh', dataIndex: 'quantity' },
          { title: 'Số đơn', dataIndex: 'orders' },
        ]}
      />
    </Card>
  )
}
