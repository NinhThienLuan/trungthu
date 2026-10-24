import { useApi } from '../hooks/useApi'
import { orderService } from '../services/orderService'
import { formatVnd } from '../lib/format'
import { Field } from './ui/Field'
import { Notice } from './ui/States'

export type ShippingZone = { province: string; district: string }

const titleCase = (s: string) => s.replace(/(^|\s)\p{L}/gu, (c) => c.toUpperCase())
const keyOf = (z: ShippingZone) => `${z.province}|${z.district}`

/** Chọn khu vực giao trong danh sách xưởng đã khai báo phí (tránh gõ lệch -> SHIPPING_RATE_MISSING) */
export function ShippingZoneSelect({ providerId, storeName, value, onChange }: {
  providerId: string
  storeName: string
  value?: ShippingZone
  onChange: (zone: ShippingZone) => void
}) {
  const { data: zones, loading, error } = useApi(() => orderService.shippingZones(providerId), [providerId])
  const name = `zone-${providerId}`

  if (error) return <Notice tone="danger">{error}</Notice>
  if (!loading && zones?.length === 0) {
    return <Notice tone="danger">{storeName} chưa khai báo khu vực giao hàng, tạm thời chưa đặt được.</Notice>
  }
  return (
    <Field label={`Khu vực giao của ${storeName}`} name={name}>
      <select
        id={name}
        className="input"
        disabled={loading}
        value={value ? keyOf(value) : ''}
        onChange={(e) => {
          const zone = zones?.find((z) => keyOf(z) === e.target.value)
          if (zone) onChange({ province: zone.province, district: zone.district })
        }}
      >
        <option value="" disabled>{loading ? 'Đang tải khu vực...' : 'Chọn quận/huyện, tỉnh/thành'}</option>
        {zones?.map((z) => (
          <option key={keyOf(z)} value={keyOf(z)}>
            {titleCase(z.district)}, {titleCase(z.province)} — phí giao {formatVnd(z.fee)}
          </option>
        ))}
      </select>
    </Field>
  )
}
