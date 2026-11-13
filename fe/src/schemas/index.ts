import { z } from 'zod'
import { BANK_CODES, RFQ_MIN_QUANTITY } from '../constants'
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


// Giống VnFormats.TAX_CODE bên BE: 10 số, hoặc 10 số-3 số (chi nhánh)
const taxCode = z
  .string()
  .trim()
  .regex(/^\d{10}(-\d{3})?$/, 'Mã số thuế gồm 10 số hoặc dạng 10 số-3 số (chi nhánh)')

const vatSchema = z.object({
  taxCode,
  companyName: required('tên công ty'),
  companyAddress: required('địa chỉ công ty'),
  invoiceEmail: email,
})

// Mật khẩu mới: khớp PasswordPolicy của BE (8–50 ký tự, hoa, thường, số, ký tự đặc biệt @$!%*?&#)
export const PASSWORD_RULES = [
  { test: (v: string) => v.length >= 8 && v.length <= 50, label: '8–50 ký tự' },
  { test: (v: string) => /[A-Z]/.test(v), label: 'Chữ hoa' },
  { test: (v: string) => /[a-z]/.test(v), label: 'Chữ thường' },
  { test: (v: string) => /\d/.test(v), label: 'Chữ số' },
  { test: (v: string) => /[@$!%*?&#]/.test(v), label: 'Ký tự đặc biệt @$!%*?&#' },
]
const strongPassword = z
  .string()
  .min(1, 'Vui lòng nhập mật khẩu mới')
  .refine((v) => PASSWORD_RULES.every((r) => r.test(v)), 'Mật khẩu chưa đủ mạnh, xem các yêu cầu bên dưới')
const matches = { path: ['confirmPassword'], message: 'Mật khẩu nhập lại không khớp' }

// Đăng ký: khách tự đặt mật khẩu (cùng quy tắc PasswordPolicy của BE)
export const registerSchema = z
  .object({
    phone,
    fullName: required('họ tên').max(255),
    email,
    password: strongPassword,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, matches)

/** Phần thêm khi đăng ký mở gian hàng (RegisterRequest role PROVIDER) */
export const sellerRegisterSchema = z.object({
  storeName: required('tên gian hàng').max(255),
  address: required('địa chỉ xưởng').max(500),
  bankCode: z.enum(BANK_CODES, { errorMap: () => ({ message: 'Vui lòng chọn ngân hàng' }) }),
  bankAccountNumber: z.string().trim().regex(/^\d{6,20}$/, 'Số tài khoản gồm 6–20 chữ số'),
  bankAccountName: required('tên chủ tài khoản').max(150),
})

export const forgotPasswordSchema = z.object({ email })

export const otpSchema = z.string().regex(/^\d{6}$/, 'Vui lòng nhập đủ 6 chữ số')

export const resetPasswordSchema = z
  .object({ newPassword: strongPassword, confirmPassword: z.string() })
  .refine((d) => d.newPassword === d.confirmPassword, matches)

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: strongPassword,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, matches)
  .refine((d) => d.newPassword !== d.oldPassword, { path: ['newPassword'], message: 'Mật khẩu mới phải khác mật khẩu hiện tại' })

export const checkoutSchema = z.object({
  receiverName: required('tên người nhận'),
  receiverPhone: phone,
  shippingAddress: required('địa chỉ giao hàng'),
  note: z.string().trim().max(500).optional(),
  vat: vatSchema.optional(),
})

/** Form RFQ ở /rfq (B2bPortalView #rfq-form): tên trường = name của input = CreateRfqRequest bên BE */
export const rfqSchema = z
  .object({
    customerType: z.enum(['BUSINESS', 'INDIVIDUAL']).default('BUSINESS'),
    companyName: z.string().trim().max(255).optional(),
    taxCode: z.string().trim().optional(),
    contactName: required('người phụ trách').max(255),
    contactPosition: z.string().trim().max(255).optional(),
    contactPhone: phone,
    contactEmail: email,
    expectedDeliveryDate: z
      .string()
      .min(1, 'Vui lòng chọn ngày nhận')
      .refine((d) => d >= toIsoDate(addDays(new Date(), 1)), 'Ngày nhận phải sau hôm nay'),
    requestedQuantity: z.coerce
      .number({ invalid_type_error: 'Vui lòng nhập số lượng' })
      .int('Số lượng phải là số nguyên')
      .min(RFQ_MIN_QUANTITY, `Báo giá sỉ áp dụng từ ${RFQ_MIN_QUANTITY} hộp`),
    cakesPerBox: z.coerce.number().int('Số bánh mỗi hộp phải là số nguyên').min(1).max(100),
    expectedBudget: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().min(0, 'Ngân sách không được âm').optional()),
    description: z.string().trim().max(100000).optional().transform((v) => v || undefined),
    // Ô chọn để trống = gửi mọi xưởng / chưa chọn sản phẩm
    providerId: z.string().optional().transform((v) => v || undefined),
    productId: z.string().optional().transform((v) => v || undefined),
  })
  .superRefine((data, ctx) => {
    if (data.customerType === 'BUSINESS') {
      if (!data.companyName || data.companyName.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Tên doanh nghiệp tối thiểu 3 ký tự',
          path: ['companyName'],
        })
      }
      if (!data.taxCode || !/^[0-9]{10}(-[0-9]{3})?$/.test(data.taxCode.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Mã số thuế gồm 10 hoặc 13 số (vd: 0123456789 hoặc 0123456789-001)',
          path: ['taxCode'],
        })
      }
      if (!data.contactPosition || !data.contactPosition.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Vui lòng nhập chức vụ',
          path: ['contactPosition'],
        })
      }
    }
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
