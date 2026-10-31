// Trang chi tiết: markup chuyển nguyên từ Stitch, đổ dữ liệu sản phẩm + giỏ hàng thật.
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { ProductReviews, RatingSummary } from '../../components/ProductReviews'
import { ErrorState, Spinner } from '../../components/ui/States'
import { productService } from '../../services/productService'
import { promotionService, type Promotion } from '../../services/sellerService'
import { DETAIL_GALLERY } from '../../apis/mockData'
import { useApi } from '../../hooks/useApi'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useCartStore } from '../../stores/cartStore'
import { ROUTES } from '../../constants'

const DETAIL_TABS = [
  { id: 'story', label: 'Câu Chuyện Sản Phẩm' },
  { id: 'nutrition', label: 'Bảng Dinh Dưỡng & Nguyên Liệu' },
  { id: 'reviews', label: 'Đánh Giá' },
] as const
type DetailTab = (typeof DETAIL_TABS)[number]['id']

const vnd = (n: number) => `${n.toLocaleString('vi-VN')}₫`

export function ProductDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const add = useCartStore((st) => st.add)
  const { data: product, loading, error, reload } = useApi(() => productService.detail(id), [id])
  const providerId = product?.providerId
  const { data: running } = useApi(() => (providerId ? promotionService.running(providerId) : Promise.resolve([])), [providerId])
  const [variantId, setVariantId] = useState<string>()
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [logoName, setLogoName] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
  const [tab, setTab] = useState<DetailTab>('story')
  useDocumentTitle(product?.name)

  useEffect(() => {
    setVariantId(product?.variants[0]?.id)
    setActiveImage(0)
    setQuantity(1)
  }, [product])

  if (loading) return <Spinner />
  if (error || !product) {
    return (
      <div className="max-w-[1320px] mx-auto px-margin-mobile lg:px-margin py-space-xl">
        <ErrorState message={error ?? 'Không tìm thấy sản phẩm'} onRetry={reload} />
      </div>
    )
  }

  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0]
  const promotions = (running ?? []).filter((p) => !p.productId || p.productId === product.id)
  const price = variant?.price ?? 0
  // Giá gốc giữ cùng tỉ lệ giảm như quy cách chuẩn trong danh mục
  const ratio = product.display ? product.display.oldPrice / product.variants[0].price : 1
  const oldPrice = Math.round((price * ratio) / 1000) * 1000
  const discountPct = oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0
  const canPreorder = product.productType === 'LOOSE_CAKE'
  const maxQty = canPreorder ? 10_000 : Math.max(1, variant?.stockQuantity ?? 1)
  const inStock = !!variant && (variant.stockQuantity > 0 || canPreorder)
  const gallery = product.gallery?.length
    ? product.gallery
    : [product.imageUrl ?? DETAIL_GALLERY[0], ...DETAIL_GALLERY.slice(2, 5)]
  const configs =
    product.display?.configs ??
    product.variants.map((v) => ({ variantId: v.id, label: 'Quy Cách', title: v.variantName, sub: '' }))

  const selectVariant = (vid: string) => {
    setVariantId(vid)
    setQuantity(1)
    setAdded(false)
  }

  const addToCart = () => {
    if (!variant) return
    add(
      {
        variantId: variant.id,
        setProductId: product.productType === 'GIFT_SET' ? product.id : undefined,
        productId: product.id,
        providerId: product.providerId,
        storeName: product.storeName,
        productName: product.name,
        variantName: variant.variantName,
        unitPrice: variant.price,
        stock: variant.stockQuantity,
        canPreorder,
        imageUrl: product.imageUrl,
      },
      quantity,
    )
    setAdded(true)
  }

  const showReviews = () => {
    setTab('reviews')
    document.getElementById('product-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const buyNow = () => {
    addToCart()
    navigate(ROUTES.cart)
  }

  return (

    <>
      <div className="flex flex-col w-full">
        {' '}
        <div className="w-full bg-surface-container-low py-space-sm">
          {' '}
          <div className="max-w-[1320px] mx-auto px-margin-mobile lg:px-margin flex flex-wrap items-center justify-between gap-y-space-xs text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest">
            {' '}
            <div className="flex items-center gap-space-xs">
              {' '}
              <a className="hover:text-gold-burnished transition-colors" data-path="trang-chu" href="#">
                Đại Sàn
              </a>{' '}
              <span className="text-outline-variant">/</span>{' '}
              <a className="hover:text-gold-burnished transition-colors" data-path="bo-suu-tap" href="#">
                Bộ Sưu Tập Thượng Tuyển
              </a>{' '}
              <span className="text-outline-variant">/</span>{' '}
              <span className="text-ink-dark font-bold">{product.name}</span>{' '}
            </div>{' '}
            <div className="flex items-center gap-space-md">
              {' '}
              <span className="inline-flex items-center gap-1.5 text-secondary">
                {' '}
                <span className="w-1.5 h-1.5 rounded-[0.75rem] bg-secondary animate-ping"></span>
                {' Mẻ Mới Ra Lò Hôm Nay • 08:30 Sáng '}
              </span>{' '}
              <span className="text-outline-variant hidden sm:inline">|</span>{' '}
              <span className="hidden sm:inline text-on-surface-variant">Mã Di Sản: {variant?.sku}</span>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
        <section className="max-w-[1320px] mx-auto px-margin-mobile lg:px-margin py-space-xl w-full">
          {' '}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
            {' '}
            <div className="lg:col-span-7 flex flex-col gap-space-md">
              {' '}
              <div className="relative w-full aspect-[4/3] rounded-[0.25rem] bg-surface-container-lowest overflow-hidden shadow-xl group">
                {' '}
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt={product.imageAlt ?? product.name}
                  id="mainProductView"
                  src={gallery[activeImage]}
                />{' '}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-dark/60 via-transparent to-transparent pointer-events-none"></div>{' '}
                <div className="absolute top-space-md left-space-md bg-surface-container-lowest/95 backdrop-blur-md px-space-md py-space-xs rounded-[0.125rem] shadow-md flex items-center gap-space-xs">
                  {' '}
                  <Icon name="verified" className="text-secondary text-[20px]" filled aria-hidden />{' '}
                  <div className="flex flex-col">
                    {' '}
                    <span className="font-label-sm text-[9px] uppercase tracking-wider text-secondary">
                      Tiêu Chuẩn ATTP Quốc Tế
                    </span>{' '}
                    <span className="font-label-md text-label-md text-ink-dark font-bold">HACCP & ISO 22000</span>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="absolute bottom-space-md left-space-md right-space-md flex items-center justify-between text-on-primary">
                  {' '}
                  <div className="flex items-center gap-2">
                    {' '}
                    <Icon name="workspace_premium" className="text-champagne-light text-[18px]" aria-hidden />{' '}
                    <span className="font-label-sm text-champagne-light uppercase tracking-widest text-[11px]">
                      Nghệ Nhân Đông Phương • Thượng Hạng
                    </span>{' '}
                  </div>{' '}
                  <span className="font-label-sm text-secondary-fixed text-[10px] uppercase bg-ink-dark/80 px-2 py-1 rounded-[0.125rem] backdrop-blur">
                    Ảnh Chụp Thực Tế 100%
                  </span>{' '}
                </div>{' '}
              </div>{' '}
              <div className="grid grid-cols-4 gap-space-sm">
                {gallery.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    aria-label={`Xem ảnh ${i + 1}`}
                    className="thumb-btn relative aspect-square rounded-[0.125rem] overflow-hidden bg-surface-container-lowest shadow-sm hover:shadow-md transition-all group"
                  >
                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="" src={src} />
                    <div
                      className={`absolute inset-0 rounded-[0.125rem] pointer-events-none thumb-indicator ${i === activeImage ? 'bg-secondary/15 ring-2 ring-secondary' : 'bg-transparent'}`}
                    ></div>
                  </button>
                ))}
              </div>{' '}
              <div className="grid grid-cols-3 gap-space-sm p-space-md bg-surface-container rounded-[0.25rem] mt-space-xs">
                {' '}
                <div className="flex items-center gap-space-xs">
                  {' '}
                  <Icon name="cloud_download" className="text-secondary text-[22px]" aria-hidden />{' '}
                  <div className="flex flex-col">
                    {' '}
                    <span className="font-label-sm text-label-sm text-ink-dark uppercase">Bảo Quản Chuẩn</span>{' '}
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Lạnh 18°C – 22°C</span>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="flex items-center gap-space-xs">
                  {' '}
                  <Icon name="eco" className="text-secondary text-[22px]" aria-hidden />{' '}
                  <div className="flex flex-col">
                    {' '}
                    <span className="font-label-sm text-label-sm text-ink-dark uppercase">100% Tự Nhiên</span>{' '}
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Không chất bảo quản</span>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="flex items-center gap-space-xs">
                  {' '}
                  <Icon name="local_shipping" className="text-secondary text-[22px]" aria-hidden />{' '}
                  <div className="flex flex-col">
                    {' '}
                    <span className="font-label-sm text-label-sm text-ink-dark uppercase">Giao Lạnh Hỏa Tốc</span>{' '}
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Đảm bảo dòng lava</span>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
            <div className="lg:col-span-5 flex flex-col gap-space-lg">
              {' '}
              <div className="space-y-space-xs">
                {' '}
                <div className="flex items-center gap-space-sm">
                  {' '}
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold bg-secondary-fixed/40 px-2 py-0.5 rounded-[0.125rem]">
                    {' Tuyển Chọn Hoàng Gia '}
                  </span>{' '}
                  <span className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase">
                    {`Nghệ Nhân ${product.storeName} × Nguyệt Viên Đài`}
                  </span>{' '}
                </div>{' '}
                <h1 className="font-headline-lg text-headline-lg text-ink-dark leading-tight pt-1">
                  {product.name}
                </h1>
                <RatingSummary product={product} onClick={showReviews} />{' '}
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {product.description}
                </p>{' '}
              </div>{' '}
              <div className="p-space-md rounded-[0.25rem] bg-surface-container-lowest shadow-sm flex flex-col gap-space-xs">
                {' '}
                <div className="flex items-baseline justify-between">
                  {' '}
                  <div className="flex items-baseline gap-space-xs">
                    {' '}
                    <span className="font-headline-lg text-headline-lg text-secondary font-bold">{vnd(price)}</span>{' '}
                    {discountPct > 0 && (
                      <>
                        <span className="font-body-sm text-body-sm text-outline line-through">{vnd(oldPrice)}</span>
                        <span className="font-label-sm text-label-sm text-on-secondary-container bg-secondary-container px-1.5 py-0.5 rounded-[0.125rem] font-semibold">
                          -{discountPct}%
                        </span>
                      </>
                    )}
                  </div>{' '}
                  <span className="font-label-sm text-label-sm text-secondary-fixed-dim uppercase tracking-wider text-right">
                    {' Giá Bán Lẻ Đã Gồm VAT '}
                  </span>{' '}
                </div>{' '}
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {' Đã bao gồm hộp sơn mài mạ vàng kim nhũ, dao cắt ngọc giả sứ và thiệp chúc mừng dập nổi thủ công. '}
                </p>{' '}
              </div>{' '}
              <PromotionBox promotions={promotions} />
              <div className="space-y-space-xs">
                {' '}
                <div className="flex items-center justify-between">
                  {' '}
                  <span className="font-label-md text-label-md uppercase tracking-wider text-ink-dark font-bold">
                    1. Chọn Quy Cách Hộp Quà
                  </span>{' '}
                  <span className="font-body-sm text-body-sm text-secondary cursor-pointer hover:underline">
                    Xem sơ đồ kích thước
                  </span>{' '}
                </div>{' '}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-xs" id="boxConfigGroup">
                  {configs.map((c) => {
                    const active = c.variantId === variant?.id
                    return (
                      <button
                        key={c.variantId}
                        type="button"
                        onClick={() => selectVariant(c.variantId)}
                        aria-pressed={active}
                        className={`box-config-btn p-space-sm rounded-[0.125rem] text-left bg-surface-container-lowest shadow-sm hover:bg-surface-container transition-all ${active ? 'ring-2 ring-secondary' : ''}`}
                      >
                        <div className={`font-label-sm text-label-sm uppercase font-bold ${active ? 'text-secondary' : 'text-on-surface-variant'}`}>
                          {c.label}
                        </div>
                        <div className="font-body-md text-body-md font-bold text-ink-dark">{c.title}</div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant">{c.sub}</div>
                      </button>
                    )
                  })}
                </div>{' '}
              </div>{' '}
              <div className="p-space-md rounded-[0.25rem] bg-surface-container-lowest shadow-sm space-y-space-sm">
                {' '}
                <div className="flex items-center justify-between">
                  {' '}
                  <div className="flex items-center gap-space-xs">
                    {' '}
                    <Icon name="stars" className="text-secondary text-[20px]" aria-hidden />{' '}
                    <span className="font-label-md text-label-md uppercase tracking-wider text-ink-dark font-bold">
                      2. Tùy Chọn Khắc Kim & Ép Kim Logo
                    </span>{' '}
                  </div>{' '}
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Đơn từ 20 hộp</span>{' '}
                </div>{' '}
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  {
                    ' Áp dụng kỹ thuật ép nhũ vàng 24K hoặc khắc nhiệt lazer trên nắp hộp gỗ sơn mài theo nhận diện thương hiệu doanh nghiệp. '
                  }
                </p>{' '}
                <label htmlFor="vectorLogoInput" className="w-full p-space-md rounded-[0.125rem] bg-surface-container-low flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container transition-colors group">
                  {' '}
                  <input accept=".ai,.eps,.pdf,.png,.svg" className="hidden" id="vectorLogoInput" type="file" onChange={(e) => setLogoName(e.target.files?.[0]?.name ?? null)} />{' '}
                  <Icon
                    name="cloud_upload"
                    className="text-secondary text-[28px] mb-1 group-hover:-translate-y-0.5 transition-transform"
                    aria-hidden
                  />{' '}
                  <span className="font-label-md text-label-md text-ink-dark font-bold" id="uploadLabelText">
                    {logoName ? `Đã nhận file: ${logoName}` : 'Nhấp để tải lên Vector Logo (.AI, .PDF, .PNG nét cao)'}
                  </span>{' '}
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Dung lượng tối đa 25MB • Đội ngũ thiết kế sẽ dựng maquette 3D miễn phí
                  </span>{' '}
                </label>{' '}
              </div>{' '}
              <div className="space-y-space-sm pt-space-xs">
                {' '}
                <div className="flex items-center gap-space-md">
                  {' '}
                  <div className="flex items-center bg-surface-container-lowest rounded-[0.125rem] shadow-sm px-space-xs py-1">
                    {' '}
                    <button type="button" aria-label="Giảm số lượng" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-8 h-8 rounded-[0.125rem] flex items-center justify-center text-ink-dark hover:bg-surface-container transition-colors">
                      {' '}
                      <Icon name="remove" className="text-[18px]" aria-hidden />{' '}
                    </button>{' '}
                    <input
                      className="w-12 text-center bg-transparent font-headline-sm text-headline-sm text-ink-dark font-bold focus:outline-none"
                      id="itemQuantity"
                      max={maxQty}
                      min={1}
                      type="number"
                      aria-label="Số lượng"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(maxQty, Number(e.target.value) || 1)))}
                    />{' '}
                    <button type="button" aria-label="Tăng số lượng" onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))} className="w-8 h-8 rounded-[0.125rem] flex items-center justify-center text-ink-dark hover:bg-surface-container transition-colors">
                      {' '}
                      <Icon name="add" className="text-[18px]" aria-hidden />{' '}
                    </button>{' '}
                  </div>{' '}
                  <button
                    className="flex-1 bg-primary text-champagne-light hover:bg-ink-dark px-space-lg py-3 rounded-[0.125rem] shadow-md flex items-center justify-center gap-space-xs font-label-md text-label-md uppercase tracking-wider transition-all"
                    type="button"
                    onClick={buyNow}
                    disabled={!inStock}
                  >
                    {' '}
                    <Icon name="bolt" className="text-[20px] text-secondary-fixed" aria-hidden />{' '}
                    <span>Đặt Mua Thượng Tuyển Ngay</span>{' '}
                  </button>{' '}
                </div>{' '}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                  {' '}
                  <button
                    className="bg-surface-container-lowest text-ink-dark hover:bg-surface-container px-space-md py-2.5 rounded-[0.125rem] shadow-sm flex items-center justify-center gap-space-xs font-label-md text-label-md uppercase tracking-wider transition-colors"
                    type="button"
                    onClick={addToCart}
                    disabled={!inStock}
                  >
                    {' '}
                    <Icon name="add_shopping_cart" className="text-secondary text-[20px]" aria-hidden />{' '}
                    <span>{added ? 'Đã Thêm Vào Giỏ' : variant?.stockQuantity === 0 && canPreorder
                      ? 'Đặt Trước Bánh Tươi' : 'Thêm Vào Giỏ Hàng'}</span>{' '}
                  </button>{' '}
                  <button
                    className="bg-tertiary-container text-secondary-fixed hover:bg-tertiary px-space-md py-2.5 rounded-[0.125rem] shadow-sm flex items-center justify-center gap-space-xs font-label-md text-label-md uppercase tracking-wider transition-colors"
                    type="button"
                    onClick={() => navigate(ROUTES.rfq)}
                  >
                    {' '}
                    <Icon name="mark_email_read" className="text-[20px]" aria-hidden /> <span>Yêu Cầu Mẫu Thử B2B</span>{' '}
                  </button>{' '}
                </div>{' '}
                <div className="flex items-center justify-center gap-2 pt-space-xs text-on-surface-variant font-body-sm text-body-sm">
                  {' '}
                  <Icon name="security" className="text-secondary text-[18px]" aria-hidden />{' '}
                  <Link to={ROUTES.policy} className="underline underline-offset-2 hover:text-secondary">Chính sách đổi mới & bảo hiểm bánh vỡ</Link>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
        </section>{' '}
        <section id="product-tabs" className="w-full bg-surface-container-low py-space-xl scroll-mt-24">
          {' '}
          <div className="max-w-[1320px] mx-auto px-margin-mobile lg:px-margin">
            {' '}
            <div className="flex items-center justify-start gap-space-lg overflow-x-auto pb-space-sm" role="tablist">
              {DETAIL_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={`detail-tab pb-space-xs font-headline-sm text-headline-sm relative shrink-0 transition-colors ${tab === t.id ? 'text-ink-dark font-bold' : 'text-on-surface-variant font-medium hover:text-ink-dark'}`}
                >
                  {t.id === 'reviews' && product.display ? `${t.label} ${product.display.reviews}` : t.label}
                  <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-secondary tab-indicator ${tab === t.id ? '' : 'hidden'}`}></span>
                </button>
              ))}
            </div>{' '}
            {tab === 'story' && (
              <ProductText id="tab-story" text={product.story} empty="Xưởng chưa cập nhật câu chuyện cho sản phẩm này." />
            )}
            {tab === 'nutrition' && (
              <ProductText id="tab-nutrition" text={product.ingredients} empty="Xưởng chưa cập nhật nguyên liệu và thông tin dinh dưỡng." />
            )}
            {tab === 'reviews' && (
              <div className="tab-panel py-space-lg" id="tab-reviews">
                <ProductReviews product={product} />
              </div>
            )}{' '}
          </div>{' '}
        </section>{' '}
      </div>
    </>
  )
}

/** Khuyến mãi đang chạy của xưởng cho sản phẩm này; BE tự trừ khi đặt hàng */
function PromotionBox({ promotions }: { promotions: Promotion[] }) {
  if (promotions.length === 0) {
    return (
      <Link to={ROUTES.rfq} className="block p-space-md rounded-[0.25rem] bg-surface-container-lowest shadow-sm font-body-sm text-body-sm text-on-surface-variant hover:bg-champagne-light/40">
        Mua số lượng lớn? <span className="font-semibold text-primary underline">Gửi yêu cầu báo giá sỉ</span> để các xưởng báo giá riêng.
      </Link>
    )
  }
  return (
    <div className="bg-primary-container text-champagne-light p-space-md rounded-[0.25rem] shadow-md space-y-space-sm">
      <div className="flex items-center gap-space-xs">
        <Icon name="sell" className="text-secondary-fixed text-[20px]" aria-hidden />
        <span className="font-label-lg text-label-lg text-secondary-fixed uppercase tracking-wider">Khuyến mãi của xưởng</span>
      </div>
      <ul className="space-y-1.5">
        {promotions.map((p) => (
          <li key={p.id} className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-headline-sm text-headline-sm text-secondary-fixed font-bold">{p.label}</span>
            <span className="font-label-sm text-[11px] text-on-primary-container">
              {p.name} · đến {new Date(p.endDate).toLocaleDateString('vi-VN')}
            </span>
          </li>
        ))}
      </ul>
      <p className="font-label-sm text-[11px] text-on-primary-container">Tự động trừ vào giá khi đặt hàng, áp cho số lượng trong cùng một đơn.</p>
    </div>
  )
}

/** Nội dung do xưởng nhập (BE: Product.story / Product.ingredients), giữ xuống dòng */
function ProductText({ id, text, empty }: { id: string; text?: string | null; empty: string }) {
  return (
    <div className="tab-panel py-space-lg" id={id}>
      {text?.trim()
        ? <p className="max-w-3xl whitespace-pre-line font-body-lg text-body-lg text-on-surface-variant leading-relaxed">{text}</p>
        : <p className="p-space-lg rounded-[0.25rem] bg-surface-container-lowest shadow-sm font-body-md text-body-md text-on-surface-variant">{empty}</p>}
    </div>
  )
}
