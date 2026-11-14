import { z } from 'zod'
import type { ProductType } from '../types/product'

const text = (label: string) => z.string().trim().min(1, `Vui lòng nhập ${label}`).max(255, `${label} tối đa 255 ký tự`)
const optionalText = z.string().trim().max(100000, 'Nội dung quá dài').optional()
const optionalNumber = (value: unknown) => value === '' || value == null ? undefined : value
const salePrice = z.preprocess(optionalNumber, z.coerce.number().finite().min(1000, 'Giá bán set phải từ 1.000đ trở lên').optional())
const integer = (min: number, label: string) => z.preprocess(optionalNumber,
  z.coerce.number().int(`${label} phải là số nguyên`).min(min, `${label} phải từ ${min} trở lên`).optional())

export const sellerProductSchema = z.object({
  name: text('tên sản phẩm'),
  description: optionalText,
  story: optionalText,
  ingredients: optionalText,
  salePrice,
})

export const sellerVariantSchema = z.object({
  variantName: text('tên phân loại').regex(/\p{L}/u, 'Tên phân loại phải có ít nhất một chữ cái'),
  sku: z.string().trim().regex(/^[A-Za-z0-9_-]{1,50}$/, 'SKU chỉ gồm chữ, số, dấu - hoặc _ (tối đa 50 ký tự)'),
  price: z.preprocess((value) => value === '' || value == null ? undefined : value,
    z.coerce.number({ required_error: 'Vui lòng nhập giá' }).finite().min(1000, 'Giá phải từ 1.000đ trở lên')),
  stockQuantity: integer(0, 'Tồn kho'),
  weightGram: integer(1, 'Khối lượng'),
  boxCapacity: integer(1, 'Sức chứa hộp'),
})

export function productFormError(values: Record<string, string>): string | null {
  const result = sellerProductSchema.safeParse(values)
  if (!result.success) return result.error.issues[0].message
  return null
}

export function variantFormError(values: Record<string, string>, type: ProductType, sku?: string): string | null {
  const result = sellerVariantSchema.safeParse({ ...values, sku: sku ?? values.sku })
  if (!result.success) return result.error.issues[0].message
  if (type === 'LOOSE_CAKE' && result.data.weightGram == null) return 'Vui lòng nhập khối lượng'
  if (type === 'BOX_SHELL' && result.data.boxCapacity == null) return 'Vui lòng nhập sức chứa hộp'
  return null
}
