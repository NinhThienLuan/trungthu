import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { DEPOSIT_RATE, HOLD_MINUTES, MIN_LEAD_DAYS } from '../../constants'
import { PageHeader } from '../../components/ui/PageHeader'

const SECTIONS = [
  {
    title: 'Đặt hàng & ngày nhận',
    points: [
      `Ngày nhận phải sau ngày đặt ít nhất ${MIN_LEAD_DAYS} ngày để xưởng chuẩn bị.`,
      'Bánh được nướng trước ngày giao 1 ngày, không lưu kho dài ngày.',
      'Giỏ có nhiều xưởng sẽ được tách thành nhiều đơn, mỗi đơn một ngày nhận.',
    ],
  },
  {
    title: 'Đặt cọc',
    points: [
      `Đặt cọc tối thiểu ${DEPOSIT_RATE * 100}% giá trị đơn, chuyển khoản trực tiếp cho xưởng qua VietQR.`,
      `Đơn được giữ chỗ ${HOLD_MINUTES / 60} giờ. Quá thời gian chưa xác nhận cọc, đơn tự huỷ.`,
      'Sàn không thu hộ và không giữ tiền của người mua.',
    ],
  },
  {
    title: 'Bảo hiểm bánh vỡ & đổi mới trong 2 giờ',
    points: [
      'Áp dụng cho mọi sản phẩm trên sàn.',
      'Mặt bánh nứt gãy hoặc hộp bị trầy xước khi vận chuyển: đổi hộp mới ngay.',
      'Hà Nội và TP. Hồ Chí Minh: giao hộp thay thế trong 2 giờ, không cần hoàn trả hộp cũ.',
    ],
  },
  {
    title: 'Giao hàng chuỗi lạnh',
    points: [
      'Xe giao giữ nhiệt độ 18°C – 22°C trong suốt quá trình vận chuyển.',
      'Đền bù 100% nếu bánh biến dạng hoặc giảm chất lượng do nhiệt độ vận chuyển.',
    ],
  },
  {
    title: 'Bánh tươi & hoàn tiền',
    points: [
      'Bánh tươi không áp dụng đổi trả vì lý do đổi ý.',
      'Bánh hỏng, mốc, sai đơn: báo xưởng kèm hình ảnh trong 24 giờ sau khi nhận.',
      'Được hoàn tiền hoặc giao bù mà không cần gửi trả bánh hỏng.',
    ],
  },
]

export function PolicyPage() {
  useDocumentTitle('Chính sách')
  return (
    <div className="page section">
      <PageHeader eyebrow="Hỗ trợ" title="Chính sách mua hàng" />
      <div className="grid max-w-3xl gap-6">
        {SECTIONS.map((s) => (
          <section key={s.title} className="card p-5 md:p-6">
            <h2 className="text-h3">{s.title}</h2>
            <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-body text-muted marker:text-gold">
              {s.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
