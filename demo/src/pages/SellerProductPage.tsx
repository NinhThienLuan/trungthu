import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, App, Button, Card, Checkbox, Form, Input, Modal, Select, Space, Table, Typography } from 'antd'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api, ApiError } from '../api'
import { ImageAlbum } from '../ImageAlbum'
import { VariantOrderCharts } from '../OrderCharts'
import { auditLabel, formatTime, variantStatusLabel } from '../labels'
import type { Audit, Page, Product, Variant } from '../types'
import { ProductStatusTag, ProductTypeTag, money, productTypeOptions } from '../ui'

type StockBalance = {
  inbound: number
  looseOnHand: number
  inSet: number
  onHand: number
  broken: number
  expired: number
  terminateClear: number
  sold: number
  awaitingPayment: number
  cancelled: number
  discrepancy: number
}

function VariantChart({ productId, variantId, stamp }: { productId: string; variantId: string; stamp: number }) {
  const [stats, setStats] = useState<StockBalance | null>(null)
  useEffect(() => {
    api.get<StockBalance>(`/api/provider/products/${productId}/variants/${variantId}/stats`)
      .then(setStats)
      .catch(() => setStats(null))
  }, [productId, variantId, stamp])
  if (!stats || Number(stats.inbound) <= 0) return null
  const data = waterfall(stats)
  return (
    <div>
      <Typography.Paragraph type="secondary">
        Mỗi cột trừ bám đúng mức cột trước để tụt dần từ nhập kho.
        Trong set bám ngay dưới mức còn lại, bán lẻ đi từ 0 lên chạm đáy cột trong set.
      </Typography.Paragraph>
      {stats.discrepancy !== 0 && (
        <Alert type="error" showIcon message={`Lệch ${stats.discrepancy} so với tồn kho thực tế.`} style={{ marginBottom: 12 }} />
      )}
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 28, right: 8, left: 0, bottom: 24 }} barCategoryGap="22%">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" interval={0} tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip content={<WaterfallTooltip />} />
            <Bar
              dataKey="range"
              isAnimationActive={false}
              shape={(bar) => <StockBar {...bar} />}
              background={{ fill: 'transparent' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

type WaterfallRow = {
  name: string
  index: number
  range: [number, number]
  amount: number
  fill: string
  link?: 'top' | 'bottom'
}

function StockBar(props: {
  x?: number
  y?: number
  width?: number
  height?: number
  fill?: string
  payload?: WaterfallRow
}) {
  const { x = 0, y = 0, width = 0, height = 0, fill, payload } = props
  if (!payload || width <= 0) return null
  const color = fill ?? payload.fill
  return (
    <g>
      {height > 0 && <rect data-step={payload.index} x={x} y={y} width={width} height={height} fill={color} />}
      <text x={x + width / 2} y={Math.max(11, y - 4)} textAnchor="middle" fontSize={11} fill="#44403c">
        {payload.amount}
      </text>
    </g>
  )
}

function WaterfallTooltip({ active, payload }: { active?: boolean; payload?: { payload: WaterfallRow }[] }) {
  const row = payload?.[0]?.payload
  if (!active || !row) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #e7e5e4', padding: '8px 10px' }}>
      <div>{row.name}: {row.amount}</div>
    </div>
  )
}

function waterfall(stats: StockBalance) {
  const rows: WaterfallRow[] = []
  let level = 0
  const step = (name: string, amount: number, fill: string) => {
    if (amount === 0) return
    const low = Math.min(level, level + amount)
    const high = Math.max(level, level + amount)
    rows.push({ name, index: rows.length, range: [low, high], amount, fill, link: amount > 0 ? 'top' : 'bottom' })
    level += amount
  }
  step('Nhập kho', stats.inbound, '#1d4ed8')
  step('Hỏng', -stats.broken, '#b91c1c')
  step('Hết dùng', -stats.expired, '#b91c1c')
  step('Báo hết hàng', -stats.terminateClear, '#b91c1c')
  step('Đã bán', -stats.sold, '#b45309')
  step('Chờ thanh toán', -stats.awaitingPayment, '#b45309')
  const loose = stats.looseOnHand ?? stats.onHand
  const packed = stats.inSet ?? 0
  const floor = Math.max(0, level - packed)
  rows.push({
    name: 'Trong set',
    index: rows.length,
    range: [floor, floor + packed],
    amount: packed,
    fill: '#0f766e',
    link: 'bottom',
  })
  rows.push({ name: 'Bán lẻ', index: rows.length, range: [0, loose], amount: loose, fill: '#15803d' })
  return rows
}

function SetStockChart({ productId, stamp }: { productId: string; stamp: number }) {
  const [stats, setStats] = useState<StockBalance | null>(null)
  useEffect(() => {
    api.get<StockBalance>(`/api/provider/products/${productId}/set-stats`)
      .then(setStats)
      .catch(() => setStats(null))
  }, [productId, stamp])
  if (!stats || Number(stats.inbound) <= 0) return null
  const data = setWaterfall(stats)
  return (
    <div>
      <div className="stats">
        <Card size="small"><Typography.Text type="secondary">Tồn set</Typography.Text><Typography.Title level={3} style={{ margin: 0 }}>{stats.onHand}</Typography.Title></Card>
        <Card size="small"><Typography.Text type="secondary">Hỏng</Typography.Text><Typography.Title level={3} style={{ margin: 0 }}>{stats.broken}</Typography.Title></Card>
        <Card size="small"><Typography.Text type="secondary">Hết dùng</Typography.Text><Typography.Title level={3} style={{ margin: 0 }}>{stats.expired}</Typography.Title></Card>
      </div>
      <Typography.Paragraph type="secondary">
        Nhập set − hỏng − hết dùng − hủy bán − đã bán − chờ thanh toán = tồn set.
        Đơn hủy đứng riêng.
      </Typography.Paragraph>
      {stats.discrepancy !== 0 && (
        <Alert type="error" showIcon message={`Lệch ${stats.discrepancy} so với số set đang có.`} style={{ marginBottom: 12 }} />
      )}
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 24 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" interval={0} tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip formatter={(_, __, item) => item.payload.amount} />
            <Bar dataKey="range" isAnimationActive={false}>
              {data.map((item) => (
                <Cell key={item.name} fill={item.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function setWaterfall(stats: StockBalance) {
  const rows: { name: string; range: [number, number]; amount: number; fill: string }[] = []
  let level = 0
  const step = (name: string, amount: number, fill: string) => {
    rows.push({ name, range: [level, level + amount], amount, fill })
    level += amount
  }
  step('Nhập set', stats.inbound, '#1d4ed8')
  step('Hỏng', -stats.broken, '#b91c1c')
  step('Hết dùng', -stats.expired, '#b91c1c')
  step('Hủy bán', -stats.terminateClear, '#b91c1c')
  step('Đã bán', -stats.sold, '#b45309')
  step('Chờ thanh toán', -stats.awaitingPayment, '#b45309')
  rows.push({ name: 'Tồn set', range: [0, stats.onHand], amount: stats.onHand, fill: '#15803d' })
  rows.push({ name: 'Đơn hủy', range: [0, stats.cancelled], amount: stats.cancelled, fill: '#a8a29e' })
  return rows
}

function SetAuditTable({ productId, stamp }: { productId: string; stamp: number }) {
  const [audits, setAudits] = useState<Audit[]>([])
  useEffect(() => {
    api.get<Page<Audit>>(`/api/provider/products/${productId}/set-audits?page=0&size=20`)
      .then((page) => setAudits(page.content))
      .catch(() => setAudits([]))
  }, [productId, stamp])
  if (audits.length === 0) return null
  return <AuditTable audits={audits} />
}

type PendingVariant = {
  key: string
  variantName: string
  sku: string
  price: string
  stockQuantity: string
  weightGram: string
  boxCapacity: string
}

type ShopChoice = {
  id: string
  type: Product['productType']
  label: string
  price: number
  stock: number
  capacity: number
}

function shopChoices(shop: Product[]): ShopChoice[] {
  return shop
    .filter((item) => item.status === 'ACTIVE' || item.status === 'SOLD_OUT')
    .flatMap((item) => item.variants.map((choice) => ({
      id: choice.id,
      type: item.productType,
      label: `${item.name} · ${choice.variantName}`,
      price: choice.price,
      stock: choice.stockQuantity ?? 0,
      capacity: choice.boxCapacity ?? 0,
    })))
}

function variantProblem(row: PendingVariant, earlier: PendingVariant[], productType: Product['productType'] = 'LOOSE_CAKE') {
  if (!row.variantName.trim() || !row.sku.trim()) return 'Nhập tên và SKU của phân loại'
  if (!/^[A-Za-z0-9_-]{1,50}$/.test(row.sku.trim())) return `SKU không hợp lệ: ${row.sku}`
  const sku = row.sku.trim().toUpperCase()
  if (earlier.some((item) => item.sku.trim().toUpperCase() === sku)) return `SKU bị trùng: ${sku}`
  if (!Number.isFinite(Number(row.price)) || Number(row.price) < 0) return 'Giá phân loại không hợp lệ'
  const stock = Number(row.stockQuantity)
  if (!Number.isInteger(stock) || stock <= 0) return 'Tồn mở đầu phải lớn hơn 0'
  if (productType === 'LOOSE_CAKE' && !(Number(row.weightGram) > 0)) return 'Nhập khối lượng cho phân loại bánh'
  if (productType === 'BOX_SHELL' && !(Number(row.boxCapacity) > 0)) return 'Nhập số bánh trong hộp'
  return ''
}

function AuditTable({ audits }: { audits: Audit[] }) {
  return (
    <Table
      rowKey="id"
      size="small"
      pagination={false}
      dataSource={audits}
      columns={[
        { title: 'Loại', dataIndex: 'type', render: (value: string) => auditLabel[value] ?? value },
        { title: 'Thay đổi', dataIndex: 'quantityDelta' },
        { title: 'Tồn sau', dataIndex: 'stockAfter' },
        { title: 'Lý do', dataIndex: 'reason' },
        { title: 'Thời điểm', dataIndex: 'createdAt', render: (value: string) => formatTime(value) },
        { title: 'Người thực hiện', dataIndex: 'createdBy' },
      ]}
    />
  )
}

export function SellerProductPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { message } = App.useApp()
  const isNew = !productId
  const [productType, setProductType] = useState<Product['productType']>('LOOSE_CAKE')
  const [busy, setBusy] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [shop, setShop] = useState<Product[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [variantName, setVariantName] = useState('')
  const [sku, setSku] = useState('')
  const [price, setPrice] = useState('50000')
  const [stockQuantity, setStockQuantity] = useState('1')
  const [weightGram, setWeightGram] = useState('200')
  const [boxCapacity, setBoxCapacity] = useState('4')
  const [images, setImages] = useState<string[]>([])
  const [selected, setSelected] = useState('')
  const [audits, setAudits] = useState<Audit[]>([])
  const [liveTick, setLiveTick] = useState(0)
  const [importReason, setImportReason] = useState('')
  const [soldOutNote, setSoldOutNote] = useState('')
  const [edit, setEdit] = useState({ variantName: '', sku: '', price: '', weightGram: '', boxCapacity: '', stockQuantity: '' })
  const [confirmed, setConfirmed] = useState(false)
  const [importQty, setImportQty] = useState('1')
  const [adjustQty, setAdjustQty] = useState('1')
  const [adjustType, setAdjustType] = useState('ADJUSTMENT_BROKEN')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [setCount, setSetCount] = useState('1')
  const [stockReason, setStockReason] = useState('')
  const [boxId, setBoxId] = useState('')
  const [cakeRows, setCakeRows] = useState<{ variantId: string; quantity: string }[]>([
    { variantId: '', quantity: '1' },
  ])
  const [acceptDiscount, setAcceptDiscount] = useState(false)
  const [salePriceInput, setSalePriceInput] = useState('')
  const [pendingVariants, setPendingVariants] = useState<PendingVariant[]>([])

  function apply(next: Product) {
    setProduct(next)
    setName(next.name)
    setDescription(next.description ?? '')
    setAcceptDiscount(Boolean(next.discountAccepted))
    setSalePriceInput(next.discountAccepted ? String(next.salePrice ?? '') : '')
    setImages([...next.images]
      .sort((left, right) => Number(right.isPrimary) - Number(left.isPrimary) || left.displayOrder - right.displayOrder)
      .map((image) => image.imageUrl))
    setSelected((current) => next.variants.some((item) => item.id === current) ? current : (next.variants[0]?.id ?? ''))
    const sets = next.assembledQuantity ?? 0
    if (next.productType === 'GIFT_SET' && sets > 0 && next.components?.length) {
      const box = next.components.find((line) => line.productType === 'BOX_SHELL')
      const cakes = next.components.filter((line) => line.productType === 'LOOSE_CAKE')
      if (box) {
        setBoxId(box.variantId)
      }
      if (cakes.length > 0) {
        setCakeRows(cakes.map((line) => ({
          variantId: line.variantId,
          quantity: String(line.perSetQuantity ?? line.quantity),
        })))
      }
    }
  }

  function load() {
    api.get<Product[]>('/api/provider/products')
      .then((products) => {
        const found = products.find((item) => item.id === productId)
        if (!found) throw new ApiError('Không tìm thấy sản phẩm')
        apply(found)
        setShop(products)
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Không tải được sản phẩm'))
  }

  useEffect(() => {
    if (!productId) {
      api.get<Product[]>('/api/provider/products')
        .then(setShop)
        .catch(() => setShop([]))
      return
    }
    load()
  }, [productId])

  const variantIds = product?.variants.map((item) => item.id).join(',') ?? ''
  const setWatch = product?.productType === 'GIFT_SET' ? product.id : ''
  useEffect(() => {
    if (!variantIds && !setWatch) return
    const watched = new Set(variantIds ? variantIds.split(',') : [])
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
    const socket = new WebSocket(`${protocol}://${location.host}/ws/stock`)
    socket.onmessage = (event) => {
      const update = JSON.parse(event.data) as { variantId?: string; setProductId?: string }
      if ((update.variantId && watched.has(update.variantId)) || (setWatch && update.setProductId === setWatch)) {
        load()
        setLiveTick((tick) => tick + 1)
      }
    }
    return () => socket.close()
  }, [variantIds, setWatch])

  useEffect(() => {
    if (!selected || !productId) return
    api.get<Page<Audit>>(`/api/provider/products/${productId}/variants/${selected}/audits?page=0&size=20`)
      .then((page) => setAudits(page.content))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Không tải được audit'))
  }, [selected, productId, product])

  useEffect(() => {
    const current = product?.variants.find((item) => item.id === selected)
    if (!current) return
    setEdit({
      variantName: current.variantName,
      sku: current.sku,
      price: String(current.price),
      weightGram: current.weightGram == null ? '' : String(current.weightGram),
      boxCapacity: current.boxCapacity == null ? '' : String(current.boxCapacity),
      stockQuantity: current.stockQuantity == null ? '0' : String(current.stockQuantity),
    })
    setConfirmed(false)
  }, [selected, product])

  useEffect(() => {
    if (!product || product.productType !== 'GIFT_SET' || product.status !== 'DRAFT') return
    const sets = product.assembledQuantity ?? 0
    setSetCount(sets > 0 ? String(sets) : '1')
  }, [product])

  async function run(action: () => Promise<unknown>) {
    setError('')
    try {
      await action()
      setLiveTick((tick) => tick + 1)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Thao tác thất bại')
    }
  }

  function queueVariant() {
    const row = currentVariant()
    if (!row) {
      setError('Nhập tên và SKU của phân loại')
      return
    }
    const problem = variantProblem(row, pendingVariants, productType)
    if (problem) {
      setError(problem)
      return
    }
    setError('')
    setPendingVariants([...pendingVariants, row])
    setVariantName('')
    setSku('')
  }

  function currentVariant(): PendingVariant | null {
    if (!variantName.trim() && !sku.trim()) return null
    return {
      key: crypto.randomUUID(),
      variantName: variantName.trim(),
      sku: sku.trim(),
      price,
      stockQuantity,
      weightGram,
      boxCapacity,
    }
  }

  async function createDraft() {
    if (!name.trim()) {
      setError('Nhập tên sản phẩm')
      return
    }
    const variants = productType === 'GIFT_SET' ? [] : [...pendingVariants]
    const typing = productType === 'GIFT_SET' ? null : currentVariant()
    if (typing) variants.push(typing)
    for (const [index, row] of variants.entries()) {
      const problem = variantProblem(row, variants.slice(0, index), productType)
      if (problem) {
        setError(problem)
        return
      }
    }
    const packing = productType === 'GIFT_SET' && (Boolean(boxId) || cakeRows.some((row) => row.variantId))
    const setQuantity = Number(setCount)
    if (packing) {
      const box = shopChoices(shop).find((choice) => choice.id === boxId && choice.type === 'BOX_SHELL')
      const cakes = cakeRows.reduce((sum, row) => sum + (Number(row.quantity) || 0), 0)
      if (!box) {
        setError('Chọn hộp cho set')
        return
      }
      if (cakeRows.some((row) => !row.variantId || !(Number(row.quantity) > 0))) {
        setError('Chọn đủ loại bánh và số lượng trong một set')
        return
      }
      if (cakes !== box.capacity) {
        setError(`Tổng số bánh trong một set phải bằng ${box.capacity}, hiện là ${cakes}`)
        return
      }
      if (!Number.isInteger(setQuantity) || setQuantity <= 0) {
        setError('Số set khởi điểm phải lớn hơn 0')
        return
      }
    }
    setError('')
    setBusy(true)
    let created: Product | null = null
    try {
      created = await api.post<Product>('/api/provider/products', {
        name: name.trim(),
        description,
        productType,
      })
      if (images.length > 0) {
        await api.put(`/api/provider/products/${created.id}/images`, {
          images: images.map((imageUrl, index) => ({
            imageUrl,
            displayOrder: index,
            isPrimary: index === 0,
          })),
        })
      }
      for (const row of variants) {
        const body: Record<string, unknown> = {
          variantName: row.variantName,
          sku: row.sku,
          price: Number(row.price),
          stockQuantity: Number(row.stockQuantity),
        }
        if (productType === 'LOOSE_CAKE') body.weightGram = Number(row.weightGram)
        if (productType === 'BOX_SHELL') body.boxCapacity = Number(row.boxCapacity)
        await api.post(`/api/provider/products/${created.id}/variants`, body)
      }
      if (packing) {
        await api.post(`/api/provider/products/${created.id}/composition`, {
          box: { variantId: boxId, quantity: 1 },
          cakes: cakeRows.map((row) => ({
            variantId: row.variantId,
            quantity: Number(row.quantity),
          })),
        })
        await api.post(`/api/provider/products/${created.id}/composition/stock`, {
          setCount: setQuantity,
        })
      }
      message.success('Đã tạo bản nháp')
      navigate(`/seller/products/${created.id}`)
    } catch (err) {
      const detail = err instanceof ApiError ? err.message : 'Không tạo được sản phẩm'
      if (created) {
        message.warning('Đã lưu nháp. Ảnh, phân loại hoặc kho chưa lưu hết.')
        navigate(`/seller/products/${created.id}`)
      }
      setError(detail)
    } finally {
      setBusy(false)
    }
  }

  if (isNew) {
    return (
      <div className="page">
        <Space align="center" wrap style={{ marginBottom: 8 }}>
          <Typography.Title level={2} style={{ margin: 0 }}>Sản phẩm mới</Typography.Title>
          <ProductStatusTag status="DRAFT" />
          <ProductTypeTag type={productType} />
        </Space>
        {error && <Alert type="error" showIcon message={error} style={{ margin: '12px 0' }} />}
        <Form layout="vertical" onFinish={createDraft}>
          <Card title="Thông tin" style={{ marginBottom: 16 }}>
            <Form.Item label="Tên" required>
              <Input value={name} onChange={(event) => setName(event.target.value)} required />
            </Form.Item>
            <Form.Item label="Mô tả">
              <Input.TextArea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} />
            </Form.Item>
            <Form.Item label="Thể loại">
              <Select
                value={productType}
                options={productTypeOptions}
                onChange={(value) => {
                  setProductType(value)
                  setPendingVariants([])
                }}
              />
            </Form.Item>
            {productType === 'GIFT_SET' && (
              <Typography.Paragraph type="secondary">Giá bán của set đặt ở mục thành phần, sau khi hệ thống đã tính giá gốc.</Typography.Paragraph>
            )}
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              Ảnh, phân loại và nhập kho lưu cùng bản nháp. Có thể bổ sung sau.{' '}
              {productType === 'GIFT_SET'
                ? 'Cần nhập ít nhất một set trước khi đăng bán.'
                : 'Cần ít nhất một phân loại và một ảnh trước khi đăng bán.'}
            </Typography.Paragraph>
          </Card>
          <Card title="Ảnh bánh" style={{ marginBottom: 16 }}>
            <ImageAlbum images={images} onChange={setImages} />
            <Typography.Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
              Ảnh đầu tiên là ảnh chính.
            </Typography.Paragraph>
          </Card>
          {productType === 'GIFT_SET' ? (
            <DraftSetCard
              shop={shop}
              boxId={boxId}
              cakeRows={cakeRows}
              setCount={setCount}
              onBoxId={setBoxId}
              onCakeRows={setCakeRows}
              onSetCount={setSetCount}
            />
          ) : (
            <Card title="Phân loại và nhập kho" style={{ marginBottom: 16 }}>
              <Typography.Paragraph type="secondary">
                Số lượng nhập kho là tồn mở đầu của phân loại, phải lớn hơn 0. Bấm thêm phân loại nếu sản phẩm có nhiều loại.
              </Typography.Paragraph>
              <Space wrap align="start">
                <Form.Item label="Tên"><Input value={variantName} onChange={(event) => setVariantName(event.target.value)} /></Form.Item>
                <Form.Item label="SKU"><Input value={sku} onChange={(event) => setSku(event.target.value)} /></Form.Item>
                <Form.Item label="Giá"><Input value={price} onChange={(event) => setPrice(event.target.value)} /></Form.Item>
                <Form.Item label="Tồn mở đầu"><Input value={stockQuantity} onChange={(event) => setStockQuantity(event.target.value)} /></Form.Item>
                {productType === 'LOOSE_CAKE' && (
                  <Form.Item label="Khối lượng (g)"><Input value={weightGram} onChange={(event) => setWeightGram(event.target.value)} /></Form.Item>
                )}
                {productType === 'BOX_SHELL' && (
                  <Form.Item label="Số bánh trong hộp"><Input value={boxCapacity} onChange={(event) => setBoxCapacity(event.target.value)} /></Form.Item>
                )}
              </Space>
              <Button htmlType="button" onClick={queueVariant}>Thêm phân loại</Button>
              {pendingVariants.length > 0 && (
                <Table
                  style={{ marginTop: 12 }}
                  size="small"
                  pagination={false}
                  rowKey="key"
                  dataSource={pendingVariants}
                  columns={[
                    { title: 'Tên', dataIndex: 'variantName' },
                    { title: 'SKU', dataIndex: 'sku' },
                    { title: 'Giá', dataIndex: 'price', render: (value: string) => money(Number(value)) },
                    { title: 'Tồn mở đầu', dataIndex: 'stockQuantity' },
                    {
                      title: '',
                      render: (_: unknown, row: PendingVariant) => (
                        <Button
                          htmlType="button"
                          onClick={() => setPendingVariants(pendingVariants.filter((item) => item.key !== row.key))}
                        >
                          Bỏ
                        </Button>
                      ),
                    },
                  ]}
                />
              )}
            </Card>
          )}
          <Button type="primary" htmlType="submit" loading={busy}>Lưu nháp</Button>
        </Form>
      </div>
    )
  }

  if (!product) {
    return <div className="page">{error ? <Alert type="error" showIcon message={error} /> : <Typography.Text>Đang tải...</Typography.Text>}</div>
  }

  const variant: Variant | undefined = product.variants.find((item) => item.id === selected)
  const choices = shop
    .filter((item) => item.status === 'ACTIVE' || item.status === 'SOLD_OUT')
    .flatMap((item) => item.variants.map((choice) => ({
    id: choice.id,
    type: item.productType,
    label: `${item.name} · ${choice.variantName}`,
    price: choice.price,
    stock: choice.stockQuantity ?? 0,
    capacity: choice.boxCapacity ?? 0,
  })))
  const boxChoices = choices.filter((choice) => choice.type === 'BOX_SHELL')
  const cakeChoices = choices.filter((choice) => choice.type === 'LOOSE_CAKE')
  const selectedBox = boxChoices.find((choice) => choice.id === boxId)
  const cakeTotal = cakeRows.reduce((sum, row) => sum + (Number(row.quantity) || 0), 0)
  const recipeLocked = (product.components ?? []).length > 0
  const draft = product.status === 'DRAFT'
  const hasSetStock = (product.assembledQuantity ?? 0) > 0
  const archived = product.status === 'ARCHIVED'
  const hasImages = product.images.length > 0
  const canPublish = product.status === 'DRAFT' && hasImages && (
    product.productType === 'GIFT_SET'
      ? (product.assembledQuantity ?? 0) >= 1
      : product.variants.length > 0
  )
  const onSale = product.status === 'ACTIVE' || product.status === 'SOLD_OUT'

  function updateCake(index: number, patch: Partial<{ variantId: string; quantity: string }>) {
    setCakeRows(cakeRows.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row))
  }

  function saveOpeningSets() {
    const opening = Number(setCount)
    if (!Number.isInteger(opening) || opening <= 0) {
      setError('Số set khởi điểm phải lớn hơn 0')
      return
    }
    run(() => api.post(`/api/provider/products/${product!.id}/composition/stock`, {
      setCount: opening,
    }))
  }

  function stockSets() {
    run(() => api.post(`/api/provider/products/${product!.id}/composition/stock`, {
      setCount: Number(setCount),
      reason: stockReason.trim(),
    }))
  }

  function saveComposition() {
    if (recipeLocked) return
    if (!selectedBox) return
    if (cakeTotal !== selectedBox.capacity) {
      setError(`Tổng số bánh trong một set phải bằng ${selectedBox.capacity}, hiện là ${cakeTotal}`)
      return
    }
    run(() => api.post(`/api/provider/products/${product!.id}/composition`, {
      box: { variantId: boxId, quantity: 1 },
      cakes: cakeRows.map((row) => ({
        variantId: row.variantId,
        quantity: Number(row.quantity),
      })),
    }))
  }

  function undoRecipe() {
    run(() => api.del(`/api/provider/products/${product!.id}/composition`))
  }

  return (
    <div className="page">
      <Space align="center" wrap style={{ marginBottom: 8 }}>
        <Typography.Title level={2} style={{ margin: 0 }}>{product.name}</Typography.Title>
        <ProductStatusTag status={product.status} />
        <ProductTypeTag type={product.productType} />
      </Space>
      {error && <Alert type="error" showIcon message={error} style={{ margin: '12px 0' }} />}

      <Card title="Thông tin" style={{ marginBottom: 16 }}>
        <Form layout="vertical" onFinish={() => {
          if (archived) return
          run(() => api.put(`/api/provider/products/${product.id}`, {
            name,
            description,
            productType: product.productType,
            salePrice: product.productType === 'GIFT_SET' && acceptDiscount ? Number(salePriceInput) : null,
          }))
        }}>
          <Form.Item label="Tên" required>
            <Input value={name} readOnly={archived} onChange={(event) => setName(event.target.value)} required />
          </Form.Item>
          <Form.Item label="Mô tả">
            <Input.TextArea rows={3} readOnly={archived} value={description} onChange={(event) => setDescription(event.target.value)} />
          </Form.Item>
          {product.productType === 'GIFT_SET' && (
            <Typography.Paragraph type="secondary">Giá bán của set đặt ở mục thành phần, sau khi hệ thống đã tính giá gốc.</Typography.Paragraph>
          )}
          {archived && <Alert type="info" showIcon message="Sản phẩm đã lưu trữ, chỉ xem." style={{ marginBottom: 12 }} />}
          <Space wrap>
            {!archived && <Button type="primary" htmlType="submit">Lưu</Button>}
            {canPublish && (
              <Button
                onClick={() => run(() => api.put(`/api/provider/products/${product.id}`, {
                  name, description, productType: product.productType, status: 'ACTIVE',
                  salePrice: product.productType === 'GIFT_SET' && acceptDiscount ? Number(salePriceInput) : null,
                }))}
              >
                Đăng bán
              </Button>
            )}
            {onSale && (
              <Button onClick={() => {
                const giftSet = product.productType === 'GIFT_SET'
                Modal.confirm({
                  title: giftSet ? 'Ngừng kinh doanh set?' : 'Ngừng kinh doanh bán lẻ?',
                  content: giftSet
                    ? 'Chỉ dừng bán set này và xóa số set đang đóng. Kho bán lẻ của bánh và hộp không đổi.'
                    : 'Chỉ dừng bán lẻ và xóa tồn lẻ. Đơn đang chờ cọc có sản phẩm này sẽ bị hủy. Set không bị ngừng bán.',
                  okText: 'Ngừng',
                  cancelText: 'Hủy',
                  onOk: () => run(() => api.post(`/api/provider/products/${product.id}/discontinue`)),
                })
              }}>
                {product.productType === 'GIFT_SET' ? 'Ngừng kinh doanh set' : 'Ngừng kinh doanh bán lẻ'}
              </Button>
            )}
            {!archived && (
              <Button danger onClick={() => {
                const giftSet = product.productType === 'GIFT_SET'
                Modal.confirm({
                  title: 'Xóa mềm?',
                  content: giftSet
                    ? 'Ẩn set này. Tồn bán lẻ không đổi. Chỉ xóa khi mọi đơn set đã hủy hoặc hoàn tất.'
                    : 'Ẩn sản phẩm bán lẻ. Set đang dùng sản phẩm này không đổi. Chỉ xóa khi mọi đơn bán lẻ đã hủy hoặc hoàn tất.',
                  okText: 'Xóa mềm',
                  okButtonProps: { danger: true },
                  cancelText: 'Hủy',
                  onOk: () => run(() => api.post(`/api/provider/products/${product.id}/archive`)),
                })
              }}>
                Xóa mềm
              </Button>
            )}
          </Space>
          {product.status === 'DRAFT' && !canPublish && (
            <Typography.Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
              {!hasImages && 'Cần lưu ít nhất một ảnh trước khi đăng bán. '}
              {product.productType === 'GIFT_SET' && (product.assembledQuantity ?? 0) < 1 && 'Cần nhập ít nhất một set trước khi đăng bán. '}
              {product.productType !== 'GIFT_SET' && product.variants.length === 0 && 'Cần ít nhất một phân loại trước khi đăng bán.'}
            </Typography.Paragraph>
          )}
        </Form>
      </Card>

      <Card title="Ảnh bánh" style={{ marginBottom: 16 }}>
        <Form layout="vertical" onFinish={() => {
          if (archived) return
          run(() => api.put(`/api/provider/products/${product.id}/images`, {
            images: images.map((imageUrl, index) => ({
              imageUrl,
              displayOrder: index,
              isPrimary: index === 0,
            })),
          }))
        }}>
          <ImageAlbum key={product.id} images={images} onChange={archived ? undefined : setImages} />
          {!archived && <Button type="primary" htmlType="submit" style={{ marginTop: 12 }}>Lưu album</Button>}
        </Form>
      </Card>

      {!archived && product.productType !== 'GIFT_SET' && (
      <Card title="Thêm phân loại" style={{ marginBottom: 16 }}>
        <Form layout="vertical" onFinish={() => {
          const opening = Number(stockQuantity)
          if (!Number.isInteger(opening) || opening <= 0) {
            setError('Tồn mở đầu phải lớn hơn 0')
            return
          }
          const body: Record<string, unknown> = {
            variantName, sku, price: Number(price), stockQuantity: opening,
          }
          if (product.productType === 'LOOSE_CAKE') body.weightGram = Number(weightGram)
          if (product.productType === 'BOX_SHELL') body.boxCapacity = Number(boxCapacity)
          run(async () => {
            const created = await api.post<Variant>(`/api/provider/products/${product.id}/variants`, body)
            setSelected(created.id)
          })
        }}>
          <Space wrap align="start">
            <Form.Item label="Tên" required><Input value={variantName} onChange={(event) => setVariantName(event.target.value)} required /></Form.Item>
            <Form.Item label="SKU" required><Input value={sku} onChange={(event) => setSku(event.target.value)} required /></Form.Item>
            <Form.Item label="Giá" required><Input value={price} onChange={(event) => setPrice(event.target.value)} required /></Form.Item>
            <Form.Item label="Tồn mở đầu" required><Input value={stockQuantity} onChange={(event) => setStockQuantity(event.target.value)} required /></Form.Item>
            {product.productType === 'LOOSE_CAKE' && (
              <Form.Item label="Khối lượng (g)" required><Input value={weightGram} onChange={(event) => setWeightGram(event.target.value)} required /></Form.Item>
            )}
            {product.productType === 'BOX_SHELL' && (
              <Form.Item label="Số bánh trong hộp" required><Input value={boxCapacity} onChange={(event) => setBoxCapacity(event.target.value)} required /></Form.Item>
            )}
          </Space>
          <Button type="primary" htmlType="submit">Thêm</Button>
        </Form>
      </Card>
      )}

      {product.productType === 'GIFT_SET' && (
        <Card title="Thành phần set" style={{ marginBottom: 16 }}>
          {recipeLocked ? (
            <Typography.Title level={4} style={{ marginTop: 0 }}>
              Giá gốc một set: {money(product.listPrice)}
              <Typography.Text type="secondary" style={{ marginLeft: 12, fontSize: 14, fontWeight: 400 }}>
                {product.assembledQuantity ?? 0} set trong kho
              </Typography.Text>
            </Typography.Title>
          ) : (
            <Typography.Paragraph type="secondary">
              Giá gốc một set là tổng đơn giá hộp và từng loại bánh. Lưu công thức xong mới nhập hàng.
            </Typography.Paragraph>
          )}
          {Number(product.listPrice) > 0 && !archived && (
            <Checkbox
              checked={acceptDiscount}
              onChange={(event) => setAcceptDiscount(event.target.checked)}
            >
              Tôi chấp nhận chiết khấu
            </Checkbox>
          )}
          {acceptDiscount && Number(product.listPrice) > 0 && (
            <Form.Item label="Giá chiết khấu" style={{ marginTop: 12 }} required>
              <Input value={salePriceInput} onChange={(event) => setSalePriceInput(event.target.value)} required />
            </Form.Item>
          )}
          {acceptDiscount && Number(product.listPrice) > 0 && Number(salePriceInput) >= 0 && Number(salePriceInput) < Number(product.listPrice) && (
            <Alert
              type="success"
              showIcon
              style={{ marginBottom: 12 }}
              message={`Giá bán ${money(Number(salePriceInput))} · giảm ${((Number(product.listPrice) - Number(salePriceInput)) / Number(product.listPrice) * 100).toLocaleString('vi-VN', { maximumFractionDigits: 2 })}%`}
              description={`Giá gốc ${money(product.listPrice)} · giảm ${money(Number(product.listPrice) - Number(salePriceInput))}`}
            />
          )}
          {acceptDiscount && Number(product.listPrice) > 0 && Number(salePriceInput) >= Number(product.listPrice) && (
            <Alert type="error" showIcon message="Giá chiết khấu phải nhỏ hơn giá gốc." style={{ marginBottom: 12 }} />
          )}
          {acceptDiscount && Number(product.listPrice) > 0 && !archived && (
            <Button style={{ marginBottom: 16 }} onClick={() => run(() => api.put(`/api/provider/products/${product.id}`, {
              name, description, productType: product.productType,
              salePrice: Number(salePriceInput),
            }))}>
              Lưu giá
            </Button>
          )}
          {!recipeLocked && (
          <>
          <Typography.Title level={4}>1. Công thức</Typography.Title>
          <Typography.Paragraph type="secondary">Chỉ chọn hộp và bánh. Bước này chưa nhập hàng. Tổng bánh phải bằng sức chứa hộp.</Typography.Paragraph>
          <Form layout="vertical" onFinish={saveComposition}>
            <Form.Item label="Hộp" required>
              <Select
                value={boxId || undefined}
                placeholder="Chọn hộp"
                onChange={setBoxId}
                options={boxChoices.map((choice) => ({
                  value: choice.id,
                  label: `${choice.label} · chứa ${choice.capacity} bánh · ${money(choice.price)}`,
                }))}
              />
            </Form.Item>
            <Typography.Title level={5}>Chọn bánh</Typography.Title>
            {cakeRows.map((row, index) => (
              <div className="recipe-cake" key={index}>
                <Form.Item label="Bánh" required>
                  <Select
                    value={row.variantId || undefined}
                    placeholder="Chọn bánh"
                    onChange={(value) => updateCake(index, { variantId: value })}
                    options={cakeChoices.map((choice) => ({
                      value: choice.id,
                      label: `${choice.label} · ${money(choice.price)}`,
                    }))}
                  />
                </Form.Item>
                <Form.Item label="Số bánh trong một set" required>
                  <Input value={row.quantity}
                    onChange={(event) => updateCake(index, { quantity: event.target.value })} required />
                </Form.Item>
                {cakeRows.length > 1 ? (
                  <Button onClick={() => setCakeRows(cakeRows.filter((_, rowIndex) => rowIndex !== index))}>Bỏ</Button>
                ) : <span />}
              </div>
            ))}
            <Button onClick={() => setCakeRows([...cakeRows, { variantId: '', quantity: '1' }])}>
              Thêm loại bánh
            </Button>
            <Alert
              style={{ margin: '12px 0' }}
              showIcon
              type={!selectedBox || cakeTotal === selectedBox.capacity ? 'info' : 'warning'}
              message={`Hộp chứa ${selectedBox?.capacity ?? 0} bánh. Đã chọn ${cakeTotal} bánh trong một set.`}
              description={!selectedBox || cakeTotal === selectedBox.capacity ? undefined : 'Tổng bánh phải bằng sức chứa hộp.'}
            />
            <PriceLines
              lines={[
                ...(selectedBox ? [{ key: selectedBox.id, name: selectedBox.label, price: selectedBox.price, quantity: 1 }] : []),
                ...cakeRows.flatMap((row, index) => {
                  const cake = cakeChoices.find((choice) => choice.id === row.variantId)
                  if (!cake) return []
                  return [{ key: `${index}-${cake.id}`, name: cake.label, price: cake.price, quantity: Number(row.quantity) || 0 }]
                }),
              ]}
            />
            <Button type="primary" htmlType="submit" style={{ marginTop: 12 }}>Lưu công thức</Button>
          </Form>
          </>
          )}
          {recipeLocked && (
            <>
              <Typography.Title level={4}>2. Nhập hàng</Typography.Title>
              <Typography.Paragraph type="secondary">
                {draft
                  ? `Đang có ${product.assembledQuantity ?? 0} set. Số set khởi điểm thay cho số đang có, không cộng thêm.`
                  : `Đang có ${product.assembledQuantity ?? 0} set. Nhập set là nhập bánh và hộp mới, không trừ kho bán lẻ.`}
              </Typography.Paragraph>
              <Table
                rowKey="id"
                size="small"
                pagination={false}
                dataSource={product.components ?? []}
                columns={[
                  { title: 'Thành phần', render: (_: unknown, line: NonNullable<Product['components']>[number]) => `${line.productName} · ${line.variantName}` },
                  { title: 'Đơn giá', dataIndex: 'price', render: (value: number) => money(value) },
                  { title: 'Số lượng trong một set', render: (_: unknown, line: NonNullable<Product['components']>[number]) => line.perSetQuantity ?? line.quantity },
                  { title: 'Thành tiền', render: (_: unknown, line: NonNullable<Product['components']>[number]) => money(line.price * (line.perSetQuantity ?? line.quantity)) },
                ]}
                summary={() => (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}><strong>Giá gốc một set</strong></Table.Summary.Cell>
                    <Table.Summary.Cell index={3}><strong>{money(product.listPrice)}</strong></Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
              />
              {draft && !hasSetStock && (
                <Button style={{ marginTop: 12 }} onClick={undoRecipe}>Hoàn tác</Button>
              )}
              {!archived && hasSetStock && !draft && (
              <Form layout="vertical" style={{ marginTop: 16 }} onFinish={() => run(() => api.post(`/api/provider/products/${product.id}/set-adjustments`, {
                type: adjustType, quantity: Number(adjustQty), reason,
              }))}>
                <Space wrap align="start">
                  <Form.Item label="Hao hụt">
                    <Select
                      style={{ width: 160 }}
                      value={adjustType}
                      onChange={setAdjustType}
                      options={[
                        { value: 'ADJUSTMENT_BROKEN', label: 'Hỏng' },
                        { value: 'ADJUSTMENT_EXPIRED', label: 'Hết dùng' },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item label="Số set"><Input value={adjustQty} onChange={(event) => setAdjustQty(event.target.value)} /></Form.Item>
                  <Form.Item label="Lý do" required><Input value={reason} onChange={(event) => setReason(event.target.value)} required /></Form.Item>
                </Space>
                <Button htmlType="submit">Trừ kho</Button>
              </Form>
              )}
              {!archived && (draft ? (
              <Form layout="vertical" onFinish={saveOpeningSets} style={{ marginTop: 12 }}>
                <Form.Item label="Số set khởi điểm" required>
                  <Input value={setCount} onChange={(event) => setSetCount(event.target.value)} required />
                </Form.Item>
                <Button type="primary" htmlType="submit">Lưu số set</Button>
                {hasSetStock && (
                  <Button style={{ marginLeft: 8 }} onClick={() => run(() => api.post(`/api/provider/products/${product.id}/composition/release`))}>
                    Hoàn tác nhập kho
                  </Button>
                )}
              </Form>
              ) : (
              <Form layout="vertical" onFinish={stockSets} style={{ marginTop: 12 }}>
                <Space wrap align="start">
                  <Form.Item label="Số set muốn nhập" required>
                    <Input value={setCount} onChange={(event) => setSetCount(event.target.value)} required />
                  </Form.Item>
                  <Form.Item label="Lý do" required>
                    <Input value={stockReason} onChange={(event) => setStockReason(event.target.value)} required />
                  </Form.Item>
                </Space>
                <Button type="primary" htmlType="submit">Nhập set</Button>
              </Form>
              ))}
              {hasSetStock && <SetStockChart productId={product.id} stamp={liveTick} />}
              <VariantOrderCharts productId={product.id} stamp={liveTick} scope="set" />
              <SetAuditTable productId={product.id} stamp={liveTick} />
              {!draft && hasSetStock && (
                <Button style={{ marginTop: 12 }} onClick={() => run(() => api.post(`/api/provider/products/${product.id}/composition/release`))}>
                  Hủy số set đã nhập
                </Button>
              )}
            </>
          )}
        </Card>
      )}

      {product.productType !== 'GIFT_SET' && product.variants.length > 0 && (
      <Card title="Kho">
        <Form.Item label="Phân loại">
          <Select
            value={selected || undefined}
            placeholder="Chọn phân loại"
            onChange={setSelected}
            options={product.variants.map((item) => ({
              value: item.id,
              label: `${item.variantName} · ${item.sku} · ${variantStatusLabel[item.status]} · tồn ${item.stockQuantity}`,
            }))}
          />
        </Form.Item>
        {variant && (
          <>
            <Form layout="vertical" onFinish={() => {
              if (draft) {
                const opening = Number(edit.stockQuantity)
                if (!Number.isInteger(opening) || opening <= 0) {
                  setError('Tồn mở đầu phải lớn hơn 0')
                  return
                }
              }
              run(() => api.put(`/api/provider/products/${product.id}/variants/${variant.id}`, {
              variantName: edit.variantName,
              sku: edit.sku,
              price: Number(edit.price),
              weightGram: product.productType === 'LOOSE_CAKE' ? Number(edit.weightGram) : null,
              boxCapacity: product.productType === 'BOX_SHELL' ? Number(edit.boxCapacity) : null,
              ...(draft ? { stockQuantity: Number(edit.stockQuantity) } : {}),
            }))
            }}>
              <Typography.Title level={4}>Cập nhật phân loại</Typography.Title>
              {variant.hasOrders && (
                <Typography.Paragraph type="secondary">Phân loại đã có đơn hàng nên chỉ đổi được tên và giá.</Typography.Paragraph>
              )}
              <Space wrap align="start">
                <Form.Item label="Tên" required>
                  <Input value={edit.variantName} required onChange={(event) => setEdit({ ...edit, variantName: event.target.value })} />
                </Form.Item>
                <Form.Item label="SKU" required>
                  <Input value={edit.sku} required disabled={variant.hasOrders} onChange={(event) => setEdit({ ...edit, sku: event.target.value })} />
                </Form.Item>
                <Form.Item label="Giá" required>
                  <Input value={edit.price} required onChange={(event) => setEdit({ ...edit, price: event.target.value })} />
                </Form.Item>
                {product.productType === 'LOOSE_CAKE' && (
                  <Form.Item label="Khối lượng (g)" required>
                    <Input value={edit.weightGram} required disabled={variant.hasOrders} onChange={(event) => setEdit({ ...edit, weightGram: event.target.value })} />
                  </Form.Item>
                )}
                {product.productType === 'BOX_SHELL' && (
                  <Form.Item label="Số bánh trong hộp" required>
                    <Input value={edit.boxCapacity} required disabled={variant.hasOrders} onChange={(event) => setEdit({ ...edit, boxCapacity: event.target.value })} />
                  </Form.Item>
                )}
                {draft && (
                  <Form.Item label="Số lượng bán lẻ khởi điểm" required>
                    <Input value={edit.stockQuantity} required onChange={(event) => setEdit({ ...edit, stockQuantity: event.target.value })} />
                  </Form.Item>
                )}
              </Space>
              {!archived && !draft && (
              <Checkbox checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)}>
                Tôi xác nhận thông tin phân loại ở trên là đúng
              </Checkbox>
              )}
              {!archived && (draft || confirmed) && (
              <Space wrap style={{ marginTop: 12 }}>
                <Button type="primary" htmlType="submit">Lưu phân loại</Button>
                {!variant.hasOrders && (
                  <Button danger onClick={() => {
                    Modal.confirm({
                      title: 'Xóa hẳn phân loại này?',
                      content: 'Thao tác không hoàn tác được.',
                      okText: 'Xóa',
                      okButtonProps: { danger: true },
                      cancelText: 'Hủy',
                      onOk: () => run(async () => {
                        await api.del(`/api/provider/products/${product.id}/variants/${variant.id}`)
                        setSelected('')
                      }),
                    })
                  }}>
                    Xóa phân loại
                  </Button>
                )}
              </Space>
              )}
            </Form>
            {!archived && !draft && (
            <>
            <Form layout="vertical" style={{ marginTop: 16 }} onFinish={() => run(async () => {
              await api.post(`/api/provider/products/${product.id}/variants/${variant.id}/imports`, {
                quantity: Number(importQty),
                reason: importReason,
              })
              setImportReason('')
            })}>
              <Space wrap align="start">
                <Form.Item label="Nhập kho"><Input value={importQty} onChange={(event) => setImportQty(event.target.value)} /></Form.Item>
                <Form.Item label="Lý do nhập" required>
                  <Input value={importReason} required onChange={(event) => setImportReason(event.target.value)} />
                </Form.Item>
              </Space>
              <Button type="primary" htmlType="submit">Nhập</Button>
            </Form>
            <Form layout="vertical" style={{ marginTop: 12 }} onFinish={() => run(async () => {
              await api.post(`/api/provider/products/${product.id}/variants/${variant.id}/terminate`, {
                reason: soldOutNote.trim(),
              })
              setSoldOutNote('')
            })}>
              <Form.Item label="Ghi chú báo hết hàng" required>
                <Input value={soldOutNote} required onChange={(event) => setSoldOutNote(event.target.value)} />
              </Form.Item>
              <Button htmlType="submit">Báo hết hàng</Button>
            </Form>
            {(variant.stockQuantity ?? 0) > 0 && (
            <Form layout="vertical" onFinish={() => run(() => api.post(`/api/provider/products/${product.id}/variants/${variant.id}/adjustments`, {
              type: adjustType, quantity: Number(adjustQty), reason,
            }))}>
              <Space wrap align="start">
                <Form.Item label="Hao hụt">
                  <Select
                    style={{ width: 160 }}
                    value={adjustType}
                    onChange={setAdjustType}
                    options={[
                      { value: 'ADJUSTMENT_BROKEN', label: 'Hỏng' },
                      { value: 'ADJUSTMENT_EXPIRED', label: 'Hết dùng' },
                    ]}
                  />
                </Form.Item>
                <Form.Item label="Số lượng"><Input value={adjustQty} onChange={(event) => setAdjustQty(event.target.value)} /></Form.Item>
                <Form.Item label="Lý do" required><Input value={reason} onChange={(event) => setReason(event.target.value)} required /></Form.Item>
              </Space>
              <Button htmlType="submit">Trừ kho</Button>
            </Form>
            )}
            </>
            )}
            {audits.some((audit) => audit.type === 'INBOUND_IMPORT' && Number(audit.quantityDelta) > 0) && (
              <VariantChart productId={product.id} variantId={variant.id} stamp={liveTick + audits.length} />
            )}
            <VariantOrderCharts productId={product.id} variantId={variant.id} stamp={liveTick} />
            <AuditTable audits={audits} />
          </>
        )}
      </Card>
      )}
    </div>
  )
}

function DraftSetCard({
  shop,
  boxId,
  cakeRows,
  setCount,
  onBoxId,
  onCakeRows,
  onSetCount,
}: {
  shop: Product[]
  boxId: string
  cakeRows: { variantId: string; quantity: string }[]
  setCount: string
  onBoxId: (value: string) => void
  onCakeRows: (rows: { variantId: string; quantity: string }[]) => void
  onSetCount: (value: string) => void
}) {
  const choices = shopChoices(shop)
  const boxChoices = choices.filter((choice) => choice.type === 'BOX_SHELL')
  const cakeChoices = choices.filter((choice) => choice.type === 'LOOSE_CAKE')
  const selectedBox = boxChoices.find((choice) => choice.id === boxId)
  const cakeTotal = cakeRows.reduce((sum, row) => sum + (Number(row.quantity) || 0), 0)
  function updateCake(index: number, patch: Partial<{ variantId: string; quantity: string }>) {
    onCakeRows(cakeRows.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row))
  }
  return (
    <Card title="Thành phần set và nhập kho" style={{ marginBottom: 16 }}>
      <Typography.Paragraph type="secondary">
        Chọn hộp và bánh đang bán, rồi điền số set khởi điểm. Không cần lý do.
      </Typography.Paragraph>
      {boxChoices.length === 0 && (
        <Alert type="info" showIcon message="Shop chưa có hộp đang bán, nên chưa lập được công thức set." style={{ marginBottom: 12 }} />
      )}
      <Form.Item label="Hộp">
        <Select
          value={boxId || undefined}
          placeholder="Chọn hộp"
          onChange={onBoxId}
          options={boxChoices.map((choice) => ({
            value: choice.id,
            label: `${choice.label} · chứa ${choice.capacity} bánh · ${money(choice.price)}`,
          }))}
        />
      </Form.Item>
      {cakeRows.map((row, index) => (
        <div className="recipe-cake" key={index}>
          <Form.Item label="Bánh">
            <Select
              value={row.variantId || undefined}
              placeholder="Chọn bánh"
              onChange={(value) => updateCake(index, { variantId: value })}
              options={cakeChoices.map((choice) => ({
                value: choice.id,
                label: `${choice.label} · ${money(choice.price)}`,
              }))}
            />
          </Form.Item>
          <Form.Item label="Số bánh trong một set">
            <Input value={row.quantity} onChange={(event) => updateCake(index, { quantity: event.target.value })} />
          </Form.Item>
          {cakeRows.length > 1 ? (
            <Button htmlType="button" onClick={() => onCakeRows(cakeRows.filter((_, rowIndex) => rowIndex !== index))}>Bỏ</Button>
          ) : <span />}
        </div>
      ))}
      <Button htmlType="button" onClick={() => onCakeRows([...cakeRows, { variantId: '', quantity: '1' }])}>
        Thêm loại bánh
      </Button>
      <Alert
        style={{ margin: '12px 0' }}
        showIcon
        type={!selectedBox || cakeTotal === selectedBox.capacity ? 'info' : 'warning'}
        message={`Hộp chứa ${selectedBox?.capacity ?? 0} bánh. Đã chọn ${cakeTotal} bánh trong một set.`}
      />
      <PriceLines
        lines={[
          ...(selectedBox ? [{ key: selectedBox.id, name: selectedBox.label, price: selectedBox.price, quantity: 1 }] : []),
          ...cakeRows.flatMap((row, index) => {
            const cake = cakeChoices.find((choice) => choice.id === row.variantId)
            if (!cake) return []
            return [{ key: `${index}-${cake.id}`, name: cake.label, price: cake.price, quantity: Number(row.quantity) || 0 }]
          }),
        ]}
      />
      <Form.Item label="Số set khởi điểm" style={{ marginTop: 12 }}>
        <Input value={setCount} onChange={(event) => onSetCount(event.target.value)} />
      </Form.Item>
    </Card>
  )
}

function PriceLines({ lines }: { lines: { key: string; name: string; price: number; quantity: number }[] }) {
  if (lines.length === 0) return null
  const total = lines.reduce((sum, line) => sum + line.price * line.quantity, 0)
  return (
    <Table
      size="small"
      pagination={false}
      rowKey="key"
      dataSource={lines}
      style={{ marginTop: 12 }}
      columns={[
        { title: 'Thành phần', dataIndex: 'name' },
        { title: 'Đơn giá', dataIndex: 'price', render: (value: number) => money(value) },
        { title: 'Số lượng', dataIndex: 'quantity' },
        {
          title: 'Thành tiền',
          render: (_: unknown, line: { price: number; quantity: number }) => money(line.price * line.quantity),
        },
      ]}
      summary={() => (
        <Table.Summary.Row>
          <Table.Summary.Cell index={0} colSpan={3}><strong>Giá gốc một set</strong></Table.Summary.Cell>
          <Table.Summary.Cell index={3}><strong>{money(total)}</strong></Table.Summary.Cell>
        </Table.Summary.Row>
      )}
    />
  )
}
