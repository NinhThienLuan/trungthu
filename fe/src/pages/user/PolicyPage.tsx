import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { BULK_LEAD_DAYS, BULK_ORDER_QUANTITY, HOLD_MINUTES, MIN_LEAD_DAYS } from '../../constants'
import { PageHeader } from '../../components/ui/PageHeader'

const SECTIONS = [
  {
    title: 'Đặt hàng & ngày nhận',
    points: [
      `Bánh có sẵn trong kho: nhận sớm nhất sau ${MIN_LEAD_DAYS} ngày (từ ngày mai).`,
      `Đặt vượt số bánh có sẵn hoặc từ ${BULK_ORDER_QUANTITY} sản phẩm: xưởng nướng theo đơn, ngày nhận cách ít nhất ${BULK_LEAD_DAYS} ngày.`,
      'Bánh nướng theo đơn được nướng trước ngày giao 1 ngày.',
      'Giỏ có nhiều xưởng sẽ được tách thành nhiều đơn, mỗi đơn một ngày nhận.',
    ],
  },
  {
    title: 'Đặt cọc theo ngưỡng giá trị',
    points: [
      'Đặt cọc theo giá trị đơn hàng: từ 20% (đơn dưới 1.000.000đ), 30% (từ 1.000.000đ đến 3.000.000đ), và 50% (đơn từ 3.000.000đ trở lên hoặc có in lời chúc riêng).',
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
