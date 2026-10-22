import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Button, Checkbox, Empty, InputNumber, Modal, Space, Statistic, Table, Typography } from 'antd'
import { api, ApiError } from '../api'
import { variantStatusLabel } from '../labels'
import type { CartLine, DummyOrder, Product, Variant } from '../types'
import { StockTag, money } from '../ui'

export function CartPage() {
  const navigate = useNavigate()
  const [lines, setLines] = useState<CartLine[]>([])
  const [swapLine, setSwapLine] = useState<CartLine | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function load() {
    api.get<CartLine[]>('/api/cart')
      .then(setLines)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Không tải được giỏ'))
  }

  useEffect(load, [])

  useEffect(() => {
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
    const socket = new WebSocket(`${protocol}://${location.host}/ws/stock`)
    socket.onmessage = (event) => {
      const update = JSON.parse(event.data) as {
        variantId?: string
        stockQuantity?: number
        setProductId?: string
        assembledQuantity?: number
        status: string
      }
      setLines((current) => current.map((line) => {
        if (update.setProductId && line.setProductId === update.setProductId) {
          const stock = update.assembledQuantity ?? 0
          const buyable = update.status === 'IN_STOCK' && stock >= line.quantity
          if (!buyable && line.selected) {
            api.patch(`/api/cart/${line.setProductId}`, { selected: false }).catch(() => undefined)
          }
          return {
            ...line,
            stockQuantity: stock,
            status: update.status as CartLine['status'],
            buyable,
            selected: buyable ? line.selected : false,
          }
        }
        if (!update.variantId || line.variantId !== update.variantId) return line
        const buyable = update.status === 'IN_STOCK' && (update.stockQuantity ?? 0) >= line.quantity
        if (!buyable && line.selected) {
          api.patch(`/api/cart/${line.variantId}`, { selected: false }).catch(() => undefined)
        }
        return {
          ...line,
          stockQuantity: update.stockQuantity ?? line.stockQuantity,
          status: update.status as CartLine['status'],
          buyable,
          selected: buyable ? line.selected : false,
        }
      }))
    }
    return () => socket.close()
  }, [])

  function lineKey(line: CartLine) {
    return line.setProductId ?? line.variantId ?? line.productId
  }

  function replace(id: string, saved: CartLine) {
    setLines((current) => current.map((item) => lineKey(item) === id ? saved : item))
  }

  async function toggle(line: CartLine, selected: boolean) {
    setError('')
    const id = lineKey(line)
    try {
      replace(id, await api.patch<CartLine>(`/api/cart/${id}`, { selected }))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không chọn được dòng này')
      setLines((current) => current.map((item) => lineKey(item) === id
        ? { ...item, selected: false, buyable: false } : item))
    }
  }

  async function changeQuantity(line: CartLine, quantity: number) {
    if (quantity < 1) return
    setError('')
    try {
      replace(lineKey(line), await api.patch<CartLine>(`/api/cart/${lineKey(line)}`, { quantity }))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không đổi được số lượng')
    }
  }

  async function remove(line: CartLine) {
    setError('')
    try {
      await api.del(`/api/cart/${lineKey(line)}`)
      setLines((current) => current.filter((item) => lineKey(item) !== lineKey(line)))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không xóa được dòng này')
    }
  }

  async function checkout() {
    setError('')
    setBusy(true)
    try {
      await api.post<DummyOrder[]>('/api/dummy/checkout')
      navigate('/orders')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không thanh toán được')
      load()
    } finally {
      setBusy(false)
    }
  }

  const selected = lines.filter((line) => line.selected && line.buyable)
  const total = selected.reduce((sum, line) => sum + line.price * line.quantity, 0)

  return (
    <div className="page">
      <Typography.Title level={2}>Giỏ hàng</Typography.Title>
      {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />}
      <Table
        tableLayout="fixed"
        rowKey={lineKey}
        dataSource={lines}
        pagination={false}
        locale={{ emptyText: <Empty description="Giỏ đang trống." /> }}
        columns={[
          {
            title: '',
            width: 48,
            render: (_: unknown, line: CartLine) => (
              <Checkbox
                checked={line.selected && line.buyable}
                disabled={!line.buyable}
                onChange={(event) => toggle(line, event.target.checked)}
              />
            ),
          },
          { title: 'Sản phẩm', dataIndex: 'productName' },
          {
            title: 'Phân loại',
            render: (_: unknown, line: CartLine) => (
              <Space direction="vertical" size={4}>
                <span>{line.variantName}</span>
                {!line.buyable && <StockTag inStock={false} label="Hết hàng" />}
                {!line.buyable && line.variantId && (
                  <Button size="small" onClick={() => setSwapLine(line)}>Đổi phân loại</Button>
                )}
              </Space>
            ),
          },
          {
            title: 'Số lượng',
            render: (_: unknown, line: CartLine) => (
              <InputNumber
                min={1}
                max={Math.max(line.stockQuantity, 1)}
                value={line.quantity}
                onChange={(value) => {
                  if (value && value !== line.quantity) changeQuantity(line, value)
                }}
              />
            ),
          },
          { title: 'Tồn', dataIndex: 'stockQuantity' },
          { title: 'Thành tiền', width: 160, align: 'right' as const, render: (_: unknown, line: CartLine) => (
            <span className="money-cell">{money(line.price * line.quantity)}</span>
          ) },
          {
            title: '',
            render: (_: unknown, line: CartLine) => (
              <Button danger size="small" onClick={() => remove(line)}>Xóa</Button>
            ),
          },
        ]}
      />
      <Space style={{ marginTop: 16 }} align="end" wrap>
        <Statistic
          title="Tạm tính các dòng đã chọn"
          value={total}
          formatter={(value) => `${Number(value).toLocaleString('vi-VN')} đ`}
        />
        <Button type="primary" disabled={selected.length === 0 || busy} loading={busy} onClick={checkout}>
          Checkout
        </Button>
      </Space>
      <Typography.Paragraph type="secondary" style={{ marginTop: 12 }}>
        Thanh toán ở đây là giả lập: tạo đơn chờ thanh toán và giữ hàng 15 phút.
      </Typography.Paragraph>
      <SwapModal
        line={swapLine}
        onClose={() => setSwapLine(null)}
        onSwapped={(saved) => {
          if (!swapLine) return
          setLines((current) => [saved, ...current.filter((item) =>
            item.variantId !== swapLine.variantId && item.variantId !== saved.variantId)])
          setSwapLine(null)
        }}
      />
    </div>
  )
}

function SwapModal({
  line,
  onClose,
  onSwapped,
}: {
  line: CartLine | null
  onClose: () => void
  onSwapped: (saved: CartLine) => void
}) {
  const [product, setProduct] = useState<Product | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!line) return
    setProduct(null)
    api.get<Product>(`/api/products/${line.productId}`)
      .then(setProduct)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Không tải được phân loại'))
  }, [line])

  async function choose(variantId: string) {
    if (!line?.variantId) return
    setError('')
    try {
      onSwapped(await api.post<CartLine>(`/api/cart/${line.variantId}/swap/${variantId}`))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không đổi được phân loại')
    }
  }

  const choices = (product?.variants ?? []).filter((variant) => variant.id !== line?.variantId)

  return (
    <Modal
      open={Boolean(line)}
      title={line ? `Đổi phân loại cho ${line.productName}` : ''}
      onCancel={onClose}
      footer={<Button onClick={onClose}>Đóng</Button>}
    >
      {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 12 }} />}
      {!product ? <Typography.Text>Đang tải...</Typography.Text> : (
        <Table
          rowKey="id"
          pagination={false}
          dataSource={choices}
          columns={[
            { title: 'Phân loại', dataIndex: 'variantName' },
            { title: 'Giá', dataIndex: 'price', render: (value: number) => money(value) },
            {
              title: 'Trạng thái',
              render: (_: unknown, variant: Variant) => (
                <StockTag inStock={variant.purchasable} label={variant.purchasable ? 'Còn hàng' : variantStatusLabel[variant.status]} />
              ),
            },
            {
              title: '',
              render: (_: unknown, variant: Variant) => (
                <Button size="small" type="primary" disabled={!variant.purchasable} onClick={() => choose(variant.id)}>
                  Chọn
                </Button>
              ),
            },
          ]}
        />
      )}
    </Modal>
  )
}
