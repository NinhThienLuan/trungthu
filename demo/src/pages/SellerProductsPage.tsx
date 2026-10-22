import { PlusOutlined } from '@ant-design/icons'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Empty, Flex, Input, Select, Table, Typography } from 'antd'
import { api, ApiError } from '../api'
import type { Product } from '../types'
import { ProductStatusTag, ProductTypeTag, productStatusOptions, productTypeOptions } from '../ui'

export function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('all')

  useEffect(() => {
    api.get<Product[]>('/api/provider/products')
      .then(setProducts)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Không tải được sản phẩm'))
  }, [])

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return products.filter((product) => {
      if (needle && !product.name.toLowerCase().includes(needle)) return false
      if (type !== 'all' && product.productType !== type) return false
      if (status !== 'all' && product.status !== status) return false
      return true
    })
  }, [products, query, type, status])

  function reset() {
    setQuery('')
    setType('all')
    setStatus('all')
  }

  return (
    <div className="page">
      <Flex justify="space-between" align="center" wrap gap={12} style={{ marginBottom: 8 }}>
        <Typography.Title level={2} style={{ margin: 0 }}>Sản phẩm của shop</Typography.Title>
        <Link to="/seller/products/new"><Button type="primary" icon={<PlusOutlined />}>Tạo sản phẩm</Button></Link>
      </Flex>
      {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />}
      <div className="toolbar">
        <Input.Search
          allowClear
          placeholder="Tìm theo tên"
          style={{ width: 260 }}
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
          Trạng thái
          <Select
            style={{ width: 180 }}
            value={status}
            onChange={setStatus}
            options={[{ value: 'all', label: 'Tất cả' }, ...productStatusOptions]}
          />
        </label>
        <Button onClick={reset}>Reset</Button>
      </div>
      <Table
        rowKey="id"
        dataSource={shown}
        pagination={{ pageSize: 8, showSizeChanger: false }}
        locale={{ emptyText: <Empty description={products.length === 0 ? 'Chưa có sản phẩm.' : 'Không khớp bộ lọc.'} /> }}
        columns={[
          {
            title: 'Ảnh',
            width: 84,
            render: (_: unknown, product: Product) => (
              product.primaryImageUrl
                ? <img className="table-thumb" src={product.primaryImageUrl} alt="" />
                : <span className="table-thumb empty">—</span>
            ),
          },
          {
            title: 'Tên',
            dataIndex: 'name',
            render: (name: string, product: Product) => <Link to={`/seller/products/${product.id}`}>{name}</Link>,
          },
          {
            title: 'Thể loại',
            dataIndex: 'productType',
            render: (value: Product['productType']) => <ProductTypeTag type={value} />,
          },
          {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (value: Product['status']) => <ProductStatusTag status={value} />,
          },
          {
            title: 'Phân loại',
            width: 110,
            dataIndex: 'variants',
            render: (variants: Product['variants']) => variants.length,
          },
        ]}
      />
    </div>
  )
}
