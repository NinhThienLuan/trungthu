import { Link } from 'react-router-dom'
import { ArrowRight, CalendarCheck, QrCode, Store } from 'lucide-react'
import { productApi } from '../apis/products'
import { HERO_IMAGE } from '../apis/mockData'
import { useApi } from '../hooks/useApi'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { MIN_LEAD_DAYS, ROUTES, RFQ_MIN_QUANTITY } from '../constants'
import { ProductCard } from '../components/ProductCard'
import { ErrorState, Spinner } from '../components/ui/States'

const STEPS = [
  { icon: Store, title: 'Chọn xưởng & vị bánh', text: 'Mua từ nhiều xưởng trong một giỏ hàng.' },
  { icon: CalendarCheck, title: 'Chọn ngày nhận', text: `Đặt trước tối thiểu ${MIN_LEAD_DAYS} ngày, bánh nướng mới.` },
  { icon: QrCode, title: 'Đặt cọc qua VietQR', text: 'Chuyển khoản thẳng cho xưởng, không qua trung gian.' },
]

export function HomePage() {
  useDocumentTitle()
  const { data, loading, error, reload } = useApi(() => productApi.list({ size: 4 }), [])

  return (
    <>
      <section className="bg-navy">
        <div className="page section grid items-center gap-10 md:grid-cols-[1.1fr_1fr]">
          <div>
          <p className="eyebrow text-gold">Mùa trăng 2026</p>
          <h1 className="mt-4 max-w-2xl text-display text-white">
            Bánh Trung Thu thủ công, <span className="text-gold">nướng mới theo ngày bạn chọn</span>
          </h1>
          <p className="mt-5 max-w-xl text-body text-white/70">
            Đặt trực tiếp từ các xưởng bánh, nhận đúng ngày, đặt cọc qua VietQR.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={ROUTES.products} className="btn border-gold bg-gold text-navy hover:bg-champagne">
              Xem bộ sưu tập
            </Link>
            <Link to={ROUTES.rfq} className="btn border-gold/60 text-white hover:bg-white/10">
              Đặt hàng doanh nghiệp
            </Link>
          </div>
          </div>
          <img
            src={HERO_IMAGE}
            alt="Bánh nướng trứng muối cắt đôi, nhân lava chảy"
            className="hidden aspect-[4/3] w-full rounded-md border border-gold/30 object-cover md:block"
          />
        </div>
      </section>

      <section className="page grid gap-4 py-12 md:grid-cols-3">
        {STEPS.map(({ icon: Icon, title, text }, i) => (
          <div key={title} className="card flex gap-4 p-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-champagne text-navy">
              <Icon className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-label font-semibold text-gold-ink">Bước {i + 1}</p>
              <h2 className="mt-1 text-h3">{title}</h2>
              <p className="mt-1 text-small text-muted">{text}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="page pb-16 md:pb-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Mới ra lò</p>
            <h2 className="mt-2 text-h2">Sản phẩm nổi bật</h2>
          </div>
          <Link to={ROUTES.products} className="btn btn-ghost btn-sm">
            Xem tất cả <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : data && data.content.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            {data.content.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-muted">Các xưởng đang cập nhật sản phẩm mùa mới.</p>
        )}
      </section>

      <section className="bg-jade">
        <div className="page flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow text-gold">Doanh nghiệp</p>
            <h2 className="mt-2 text-h2 text-white">Quà tặng số lượng lớn từ {RFQ_MIN_QUANTITY} hộp</h2>
            <p className="mt-2 text-body text-white/70">Gửi yêu cầu, các xưởng sẽ liên hệ báo giá trực tiếp.</p>
          </div>
          <Link to={ROUTES.rfq} className="btn shrink-0 border-gold bg-gold text-navy hover:bg-champagne">
            Gửi yêu cầu báo giá
          </Link>
        </div>
      </section>
    </>
  )
}
