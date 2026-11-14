import { z } from 'zod'

const positiveInt = (label: string, max: number) => z.preprocess(
  (value) => value === '' || value == null ? undefined : value,
  z.coerce.number({ required_error: `Vui lòng nhập ${label}` }).int(`${label} phải là số nguyên`)
    .min(1, `${label} phải lớn hơn 0`).max(max, `${label} tối đa ${max}`),
)

const promotionSchema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập tên sự kiện').max(150, 'Tên sự kiện tối đa 150 ký tự'),
  type: z.enum(['BUY_X_GET_Y', 'BUY_X_PAY_Y', 'PERCENT_OFF']),
  startDate: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
  endDate: z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
  minQuantity: positiveInt('số lượng tối thiểu', 10000).optional(),
  percentOff: positiveInt('phần trăm giảm', 90).optional(),
  buyQuantity: positiveInt('số lượng mua', 1000).optional(),
  freeQuantity: positiveInt('số lượng tặng hoặc tính tiền', 1000).optional(),
}).superRefine((data, ctx) => {
  const add = (message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, message })
  if (data.startDate && data.endDate && data.endDate < data.startDate) add('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu')
  if (data.type === 'PERCENT_OFF') {
    if (data.minQuantity == null || data.percentOff == null) add('Vui lòng nhập số lượng tối thiểu và phần trăm giảm')
  } else {
    if (data.buyQuantity == null || data.freeQuantity == null) add('Vui lòng nhập số lượng mua và số lượng tặng hoặc tính tiền')
    if (data.type === 'BUY_X_PAY_Y' && data.buyQuantity != null && data.freeQuantity != null
      && data.freeQuantity >= data.buyQuantity) add('Số bánh tính tiền phải ít hơn số bánh nhận')
  }
})

export function promotionFormError(values: Record<string, string>): string | null {
  const result = promotionSchema.safeParse(values)
  return result.success ? null : result.error.issues[0].message
}
