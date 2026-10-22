import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Alert, Button, Card, Descriptions, List, Space, Spin, Table, Typography } from 'antd'
import { api, ApiError } from '../api'
import { ProductGallery } from '../ProductGallery'
import { variantStatusLabel } from '../labels'
import type { Product, Variant } from '../types'
import { ProductStatusTag, ProductTypeTag, StockTag, money } from '../ui'

export function ProductDetailPage() {
  const { productId } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [error, setError] = useState('')

  function load() {
    api.get<Product>(`/api/products/${productId}`)
      .then(setProduct)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Không tải được sản phẩm'))
  }

  useEffect(load, [productId])

  async function add(body: { variantId?: string; setProductId?: string; quantity: number }) {
    setError('')
    try {
      await api.post('/api/cart', body)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không thêm được vào giỏ')
    }
  }

  if (!product) {
    return <div className="page">{error ? <Alert type="error" showIcon message={error} /> : <Spin />}</div>
  }

  const discounted = Number(product.discountAmount ?? 0) > 0
  const gift = product.productType === 'GIFT_SET'
  const giftBuyable = gift && (product.assembledQuantity ?? 0) > 0 && product.status === 'ACTIVE'
  const prices = gift
    ? [Number(discounted ? product.salePrice : product.listPrice)]
    : product.variants.map((variant) => variant.price)
  const minPrice = prices.length ? Math.min(...prices) : 0
  const maxPrice = prices.length ? Math.max(...prices) : 0

  return (
    <div className="page">
      {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />}
      <div className="detail-layout">
        <ProductGallery key={product.id} images={product.images.map((image) => image.imageUrl)} />
        <div>
          <Typography.Title level={2} style={{ marginTop: 0 }}>{product.name}</Typography.Title>
          <Space wrap style={{ marginBottom: 12 }}>
            <Typography.Text type="secondary">{product.storeName}</Typography.Text>
            <ProductTypeTag type={product.productType} />
            {product.status === 'SOLD_OUT' && <ProductStatusTag status="SOLD_OUT" />}
          </Space>
          <Typography.Title level={3} style={{ marginTop: 0, color: '#9a3412' }}>
            {minPrice <= 0 ? 'Chưa có giá' : minPrice === maxPrice ? money(minPrice) : `${money(minPrice)} – ${money(maxPrice)}`}
          </Typography.Title>
          {gift && discounted && (
            <Typography.Paragraph type="secondary">
              Giá gốc {money(product.listPrice)} · giảm {money(product.discountAmount)} ({product.discountPercent}%)
            </Typography.Paragraph>
          )}
          {product.description && <Typography.Paragraph>{product.description}</Typography.Paragraph>}
          {gift && (
            <Card>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Số set đang bán">{product.assembledQuantity ?? 0}</Descriptions.Item>
              </Descriptions>
              <List
                style={{ marginTop: 8 }}
                size="small"
                dataSource={product.components ?? []}
                locale={{ emptyText: 'Chưa có thành phần.' }}
                renderItem={(line) => (
                  <List.Item>{line.productName} · {line.variantName} × {line.quantity}</List.Item>
                )}
              />
              {giftBuyable && (
                <Button type="primary" block style={{ marginTop: 12 }} onClick={() => add({ setProductId: product.id, quantity: 1 })}>
                  Thêm set vào giỏ
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>
      {!gift && (
        <Table
          style={{ marginTop: 24 }}
          rowKey="id"
          dataSource={product.variants}
          pagination={false}
          columns={[
            { title: 'Phân loại', dataIndex: 'variantName' },
            {
              title: 'Quy cách',
              render: (_: unknown, variant: Variant) => (
                <>
                  {variant.weightGram ? `${variant.weightGram} g` : ''}
                  {variant.boxCapacity ? `${variant.boxCapacity} bánh/hộp` : ''}
                </>
              ),
            },
            { title: 'Giá', dataIndex: 'price', render: (value: number) => money(value) },
            {
              title: 'Trạng thái',
              render: (_: unknown, variant: Variant) => (
                <StockTag
                  inStock={variant.purchasable}
                  label={variant.purchasable ? 'Còn hàng' : variantStatusLabel[variant.status]}
                />
              ),
            },
            {
              title: '',
              render: (_: unknown, variant: Variant) => (
                variant.purchasable ? (
                  <Button type="primary" size="small" onClick={() => add({ variantId: variant.id, quantity: 1 })}>
                    Thêm vào giỏ
                  </Button>
                ) : null
              ),
            },
          ]}
        />
      )}
    </div>
  )
}
