import { Tag } from 'antd'
import { orderStatusLabel, productStatusLabel, productTypeLabel, variantStatusLabel } from './labels'
import type { Product } from './types'

export function money(value: number | null | undefined) {
  return `${Number(value ?? 0).toLocaleString('vi-VN')} đ`
}

const typeColor: Record<Product['productType'], string> = {
  LOOSE_CAKE: 'gold',
  BOX_SHELL: 'blue',
  GIFT_SET: 'magenta',
  GREETING_CARD: 'cyan',
  ADDON_SERVICE: 'purple',
}

const productStatusColor: Record<Product['status'], string> = {
  DRAFT: 'default',
  ACTIVE: 'green',
  SOLD_OUT: 'red',
  ARCHIVED: 'default',
}

const orderStatusColor: Record<string, string> = {
  PENDING_DEPOSIT: 'gold',
  CONFIRMED: 'orange',
  DEPOSITED: 'blue',
  BAKING_QUEUED: 'purple',
  DELIVERING: 'cyan',
  COMPLETED: 'green',
  CANCELLED: 'default',
}

export function ProductTypeTag({ type }: { type: Product['productType'] }) {
  return <Tag color={typeColor[type]}>{productTypeLabel[type]}</Tag>
}

export function ProductStatusTag({ status }: { status: Product['status'] }) {
  return <Tag color={productStatusColor[status]}>{productStatusLabel[status]}</Tag>
}

export function OrderStatusTag({ status }: { status: string }) {
  return <Tag color={orderStatusColor[status] ?? 'default'}>{orderStatusLabel[status] ?? status}</Tag>
}

export function StockTag({ inStock, label }: { inStock: boolean; label?: string }) {
  return <Tag color={inStock ? 'green' : 'red'}>{label ?? (inStock ? variantStatusLabel.IN_STOCK : variantStatusLabel.OUT_OF_STOCK)}</Tag>
}

export const productTypeOptions = (Object.keys(productTypeLabel) as Product['productType'][]).map((value) => ({
  value,
  label: productTypeLabel[value],
}))

export const orderStatusOptions = Object.entries(orderStatusLabel).map(([value, label]) => ({ value, label }))

export const productStatusOptions = (Object.keys(productStatusLabel) as Product['status'][]).map((value) => ({
  value,
  label: productStatusLabel[value],
}))
