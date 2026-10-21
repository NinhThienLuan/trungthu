import { z } from 'zod'
import { MIN_LEAD_DAYS, RFQ_MIN_QUANTITY } from '../constants'
import { addDays, toIsoDate } from '../lib/format'

// Giống regex của RegisterRequest bên BE
const phone = z
  .string()
  .trim()
  .regex(/^(84|0[35789])[0-9]{8}$/, 'Số điện thoại không hợp lệ')

const email = z.string().trim().min(1, 'Vui lòng nhập email').email('Email không hợp lệ')
const required = (label: string) => z.string().trim().min(1, `Vui lòng nhập ${label}`)

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

export const registerSchema = z.object({
  fullName: required('họ tên').max(255),
  email,
  phone,
})

const vatSchema = z.object({
  taxCode: z
    .string()
    .trim()
    .regex(/^\d{10}(-\d{3})?$/, 'Mã số thuế gồm 10 hoặc 13 số'),
  companyName: required('tên công ty'),
  companyAddress: required('địa chỉ công ty'),
  invoiceEmail: email,
})

export const checkoutSchema = z.object({
  receiverName: required('tên người nhận'),
  receiverPhone: phone,
  shippingAddress: required('địa chỉ giao hàng'),
  note: z.string().trim().max(500).optional(),
  vat: vatSchema.optional(),
})

export const rfqSchema = z.object({
  companyName: required('tên công ty'),
  contactName: required('người liên hệ'),
  phone,
  email,
  quantity: z.coerce
    .number({ invalid_type_error: 'Vui lòng nhập số lượng' })
    .int()
    .min(RFQ_MIN_QUANTITY, `Báo giá sỉ áp dụng từ ${RFQ_MIN_QUANTITY} hộp`),
  expectedDate: z
    .string()
    .min(1, 'Vui lòng chọn ngày nhận')
    .refine((d) => d >= toIsoDate(addDays(new Date(), MIN_LEAD_DAYS)), `Ngày nhận phải sau hôm nay ít nhất ${MIN_LEAD_DAYS} ngày`),
  budgetNote: z.string().trim().max(200).optional(),
  message: z.string().trim().max(1000).optional(),
})

/** Gom lỗi zod thành { field: message } để hiển thị dưới từng ô */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.')
    result[key] ??= issue.message
  }
  return result
}
