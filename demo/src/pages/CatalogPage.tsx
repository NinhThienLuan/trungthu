import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Card, Empty, Input, Select, Spin, Typography } from 'antd'
import { api, ApiError } from '../api'
import type { Page, Product } from '../types'
import { ProductStatusTag, ProductTypeTag, money, productTypeOptions } from '../ui'

function unitPrice(product: Product) {
  if (product.productType === 'GIFT_SET') return Number(product.salePrice ?? product.listPrice ?? 0)
  return product.variants[0]?.price ?? 0
}

function available(product: Product) {
  if (product.productType === 'GIFT_SET') {
    return product.status === 'ACTIVE' && (product.assembledQuantity ?? 0) > 0
  }
  return product.status !== 'SOLD_OUT' && product.variants.some((variant) => variant.purchasable)
}

export function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [stock, setStock] = useState('all')
  const [sort, setSort] = useState('default')

  useEffect(() => {
    const params = new URLSearchParams({ page: '0', size: '100' })
    if (type !== 'all') params.set('type', type)
    setLoading(true)
    api.get<Page<Product>>(`/api/products?${params}`)
      .then((page) => setProducts(page.content))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Không tải được catalog'))
      .finally(() => setLoading(false))
  }, [type])

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const filtered = products.filter((product) => {
      const text = `${product.name} ${product.storeName ?? ''}`.toLowerCase()
      if (needle && !text.includes(needle)) return false
      if (stock === 'in' && !available(product)) return false
      if (stock === 'out' && available(product)) return false
      return true
    })
    if (sort === 'name') filtered.sort((left, right) => left.name.localeCompare(right.name, 'vi'))
    if (sort === 'price-asc') filtered.sort((left, right) => unitPrice(left) - unitPrice(right))
    if (sort === 'price-desc') filtered.sort((left, right) => unitPrice(right) - unitPrice(left))
    return filtered
  }, [products, query, stock, sort])

  return (
    <div className="page">
      <Typography.Title level={2}>Cửa hàng</Typography.Title>
      {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />}
      <div className="toolbar">
        <Input.Search
          allowClear
          placeholder="Tìm tên bánh hoặc cửa hàng"
          style={{ width: 280 }}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <label className="filter-field">
          Thể loại
          <Select
            style={{ width: 180 }}
            value={type}
            onChange={setType}
            options={[{ value: 'all', label: 'Tất cả' }, ...productTypeOptions]}
          />
        </label>
        <label className="filter-field">
          Tồn kho
          <Select
            style={{ width: 160 }}
            value={stock}
            onChange={setStock}
            options={[
              { value: 'all', label: 'Tất cả' },
              { value: 'in', label: 'Còn hàng' },
              { value: 'out', label: 'Hết hàng' },
            ]}
          />
        </label>
        <label className="filter-field">
          Sắp xếp
          <Select
            style={{ width: 180 }}
            value={sort}
            onChange={setSort}
            options={[
              { value: 'default', label: 'Tất cả / mới nhất' },
              { value: 'name', label: 'Tên A–Z' },
              { value: 'price-asc', label: 'Giá tăng dần' },
              { value: 'price-desc', label: 'Giá giảm dần' },
            ]}
          />
        </label>
        <Button onClick={() => { setQuery(''); setType('all'); setStock('all'); setSort('default') }}>Reset</Button>
      </div>
      {loading ? <Spin /> : shown.length === 0 ? (
        <Empty description={products.length === 0 ? 'Chưa có sản phẩm đang bán.' : 'Không có sản phẩm khớp bộ lọc.'} />
      ) : (
        <div className="catalog-grid">
          {shown.map((product) => (
            <Link key={product.id} to={`/catalog/${product.id}`} style={{ color: 'inherit' }}>
              <Card
                className="catalog-card"
                hoverable
                cover={product.primaryImageUrl
                  ? <img src={product.primaryImageUrl} alt="" />
                  : <div className="catalog-cover-empty">{product.name.slice(0, 1)}</div>}
              >
                <Card.Meta
                  title={product.name}
                  description={
                    <>
                      <div>{product.storeName}</div>
                      <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <ProductTypeTag type={product.productType} />
                        {!available(product) && <ProductStatusTag status="SOLD_OUT" />}
                      </div>
                      <Typography.Text strong style={{ display: 'block', marginTop: 8, color: '#9a3412' }}>
                        {unitPrice(product) > 0 ? money(unitPrice(product)) : 'Chưa có giá'}
                      </Typography.Text>
                    </>
                  }
                />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
