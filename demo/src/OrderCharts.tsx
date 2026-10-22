import { useEffect, useState } from 'react'
import { Card, Select, Statistic, Typography } from 'antd'
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { api } from './api'
import { orderStatusLabel } from './labels'

export const statusColors: Record<string, string> = {
  PENDING_DEPOSIT: '#b45309',
  CONFIRMED: '#ca8a04',
  DEPOSITED: '#1d4ed8',
  BAKING_QUEUED: '#7c3aed',
  DELIVERING: '#0891b2',
  COMPLETED: '#15803d',
  CANCELLED: '#a8a29e',
}

const statuses = Object.keys(statusColors)

type OrderStats = {
  placedToday: number
  soldToday: number
  cancelledToday: number
  todayByStatus: Record<string, number>
  series: { label: string; counts: Record<string, number> }[]
}

function hasAnyOrder(stats: OrderStats) {
  const counts = [
    ...Object.values(stats.todayByStatus ?? {}),
    ...stats.series.flatMap((period) => Object.values(period.counts ?? {})),
    stats.placedToday,
    stats.soldToday,
    stats.cancelledToday,
  ]
  return counts.some((count) => Number(count) > 0)
}

type Granularity = 'DAY' | 'MONTH' | 'YEAR'

export function VariantOrderCharts({ productId, variantId, stamp, scope = 'variant' }: {
  productId: string
  variantId?: string
  stamp: number
  scope?: 'variant' | 'set'
}) {
  const [granularity, setGranularity] = useState<Granularity>('DAY')
  const [stats, setStats] = useState<OrderStats | null>(null)
  const path = scope === 'set'
    ? `/api/provider/products/${productId}/set-order-stats?granularity=${granularity}`
    : `/api/provider/products/${productId}/variants/${variantId}/order-stats?granularity=${granularity}`

  useEffect(() => {
    api.get<OrderStats>(path)
      .then(setStats)
      .catch(() => setStats(null))
  }, [path, stamp])

  if (!stats || !hasAnyOrder(stats)) return null

  const donut = statuses
    .map((status) => ({ status, name: orderStatusLabel[status], value: stats.todayByStatus[status] ?? 0 }))
    .filter((slice) => slice.value > 0)
  const bars = stats.series.map((period) => ({ label: period.label, ...period.counts }))

  return (
    <div>
      <Typography.Title level={4}>{scope === 'set' ? 'Đơn hàng của set' : 'Đơn hàng của phân loại'}</Typography.Title>
      <div className="stats">
        <Stat label="Đơn đặt hôm nay" value={stats.placedToday} />
        <Stat label="Đơn bán hôm nay" value={stats.soldToday} />
        <Stat label="Đơn hủy hôm nay" value={stats.cancelledToday} />
      </div>
      <div className="chart-row">
        <div className="chart-box">
          <p className="muted">Tỉ trọng trạng thái của đơn đặt hôm nay</p>
          {donut.length === 0 ? <p className="muted">Hôm nay chưa có đơn.</p> : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={donut} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}
                  isAnimationActive={false} label>
                  {donut.map((slice) => <Cell key={slice.status} fill={statusColors[slice.status]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="chart-box wide">
          <div className="toolbar">
            <Typography.Text type="secondary">Số đơn theo thời gian</Typography.Text>
            <Select
              value={granularity}
              style={{ width: 220 }}
              onChange={(value) => setGranularity(value)}
              options={[
                { value: 'DAY', label: 'Theo ngày (14 ngày)' },
                { value: 'MONTH', label: 'Theo tháng (12 tháng)' },
                { value: 'YEAR', label: 'Theo năm (5 năm)' },
              ]}
            />
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={bars}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              {statuses.map((status) => (
                <Bar key={status} dataKey={status} name={orderStatusLabel[status]} stackId="orders"
                  fill={statusColors[status]} isAnimationActive={false} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card size="small" style={{ minWidth: 150, flex: '1 1 150px' }}>
      <Statistic title={label} value={value} />
    </Card>
  )
}
