import innerWardCodes from '../data/hcmInnerWardCodes.json'

/** Backend quyết định phí cuối cùng; mã phường này dùng để hiển thị gợi ý. */
export const HCM_PROVINCE_CODE = '79'
export const SHIPPING_FEE = { inner: 35000, outer: 70000 } as const

const innerWards = new Set<string>(innerWardCodes)

export const isInnerHcmWard = (provinceCode: string, wardCode: string) =>
  provinceCode === HCM_PROVINCE_CODE && innerWards.has(wardCode)
