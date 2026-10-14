// Trang chi tiết: markup chuyển nguyên từ Stitch, đổ dữ liệu sản phẩm + giỏ hàng thật.
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { ErrorState, Spinner } from '../components/ui/States'
import { productApi } from '../apis/products'
import { DETAIL_GALLERY } from '../apis/mockData'
import { useApi } from '../hooks/useApi'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useCartStore } from '../stores/cartStore'
import { ROUTES } from '../constants'

const vnd = (n: number) => `${n.toLocaleString('vi-VN')}₫`

export function ProductDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const add = useCartStore((st) => st.add)
  const { data: product, loading, error, reload } = useApi(() => productApi.detail(id), [id])
  const [variantId, setVariantId] = useState<string>()
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [logoName, setLogoName] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
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
  const price = variant?.price ?? 0
  // Giá gốc giữ cùng tỉ lệ giảm như quy cách chuẩn trong danh mục
  const ratio = product.display ? product.display.oldPrice / product.variants[0].price : 1
  const oldPrice = Math.round((price * ratio) / 1000) * 1000
  const discountPct = oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0
  const maxQty = Math.max(1, variant?.stockQuantity ?? 1)
  const inStock = !!variant && variant.stockQuantity > 0
  const gallery = [product.imageUrl ?? DETAIL_GALLERY[0], ...DETAIL_GALLERY.slice(2, 5)]
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
        productId: product.id,
        providerId: product.providerId,
        storeName: product.storeName,
        productName: product.name,
        variantName: variant.variantName,
        unitPrice: variant.price,
        stock: variant.stockQuantity,
        imageUrl: product.imageUrl,
      },
      quantity,
    )
    setAdded(true)
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
                </h1>{' '}
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
                    <span className="font-body-sm text-body-sm text-outline line-through">{vnd(oldPrice)}</span>{' '}
                    <span className="font-label-sm text-label-sm text-on-secondary-container bg-secondary-container px-1.5 py-0.5 rounded-[0.125rem] font-semibold">
                      -{discountPct}%
                    </span>{' '}
                  </div>{' '}
                  <span className="font-label-sm text-label-sm text-secondary-fixed-dim uppercase tracking-wider text-right">
                    {' Giá Bán Lẻ Đã Gồm VAT '}
                  </span>{' '}
                </div>{' '}
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {' Đã bao gồm hộp sơn mài mạ vàng kim nhũ, dao cắt ngọc giả sứ và thiệp chúc mừng dập nổi thủ công. '}
                </p>{' '}
              </div>{' '}
              <div className="bg-primary-container text-champagne-light p-space-md rounded-[0.25rem] shadow-md space-y-space-sm">
                {' '}
                <div className="flex items-center justify-between">
                  {' '}
                  <div className="flex items-center gap-space-xs">
                    {' '}
                    <Icon name="corporate_fare" className="text-secondary-fixed text-[20px]" aria-hidden />{' '}
                    <span className="font-label-lg text-label-lg text-secondary-fixed uppercase tracking-wider">
                      Thang Chiết Khấu Doanh Nghiệp (B2B)
                    </span>{' '}
                  </div>{' '}
                  <span className="font-label-sm text-[10px] text-on-primary-container uppercase tracking-wider">
                    Mùa Trăng 2024
                  </span>{' '}
                </div>{' '}
                <div className="grid grid-cols-3 gap-space-xs text-center pt-space-xs">
                  {' '}
                  <div className="p-space-xs rounded-[0.125rem] bg-primary/60 flex flex-col items-center">
                    {' '}
                    <span className="font-label-sm text-label-sm text-champagne-light/70 uppercase">
                      Từ 50 Hộp
                    </span>{' '}
                    <span className="font-headline-sm text-headline-sm text-secondary-fixed font-bold">-15%</span>{' '}
                    <span className="font-label-sm text-[10px] text-on-primary-container">{vnd(Math.round(price * 0.85))} / hộp</span>{' '}
                  </div>{' '}
                  <div className="p-space-xs rounded-[0.125rem] bg-primary/60 flex flex-col items-center">
                    {' '}
                    <span className="font-label-sm text-label-sm text-champagne-light/70 uppercase">
                      Từ 200 Hộp
                    </span>{' '}
                    <span className="font-headline-sm text-headline-sm text-secondary-fixed font-bold">-25%</span>{' '}
                    <span className="font-label-sm text-[10px] text-on-primary-container">{vnd(Math.round(price * 0.75))} / hộp</span>{' '}
                  </div>{' '}
                  <div className="p-space-xs rounded-[0.125rem] bg-secondary/30 flex flex-col items-center">
                    {' '}
                    <span className="font-label-sm text-label-sm text-secondary-fixed uppercase font-bold">
                      Từ 1.000 Hộp
                    </span>{' '}
                    <span className="font-headline-sm text-headline-sm text-champagne-light font-bold">-35%</span>{' '}
                    <span className="font-label-sm text-[10px] text-secondary-fixed font-bold">Miễn Phí Khắc Kim</span>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
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
                    <span>{added ? 'Đã Thêm Vào Giỏ' : 'Thêm Vào Giỏ Hàng'}</span>{' '}
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
                  <span>Bảo chứng hoàng triều • Đổi mới 100% trong 2h nếu bánh lỗi khuôn hoặc bể vỡ</span>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
        </section>{' '}
        <section className="w-full bg-surface-container-low py-space-xl">
          {' '}
          <div className="max-w-[1320px] mx-auto px-margin-mobile lg:px-margin">
            {' '}
            <div className="flex items-center justify-start gap-space-lg overflow-x-auto pb-space-sm">
              {' '}
              <button className="detail-tab active pb-space-xs font-headline-sm text-headline-sm text-ink-dark font-bold relative shrink-0 transition-colors">
                {' Câu Chuyện Nghệ Nhân 70 Năm '}
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary tab-indicator"></span>{' '}
              </button>{' '}
              <button className="detail-tab pb-space-xs font-headline-sm text-headline-sm text-on-surface-variant font-medium relative shrink-0 hover:text-ink-dark transition-colors">
                {' Bảng Dinh Dưỡng & Nguyên Liệu '}
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary tab-indicator hidden"></span>{' '}
              </button>{' '}
              <button className="detail-tab pb-space-xs font-headline-sm text-headline-sm text-on-surface-variant font-medium relative shrink-0 hover:text-ink-dark transition-colors">
                {' Chính Sách Bảo Hiểm Bánh Vỡ Hỏng 2H '}
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary tab-indicator hidden"></span>{' '}
              </button>{' '}
            </div>{' '}
            <div className="tab-panel py-space-lg" id="tab-story">
              {' '}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
                {' '}
                <div className="lg:col-span-5 relative rounded-[0.25rem] overflow-hidden shadow-lg aspect-[4/5] bg-surface-container-lowest">
                  {' '}
                  <img
                    className="w-full h-full object-cover"
                    data-alt="Black and white authentic portrait of a 75-year-old Vietnamese master pastry artisan carefully dusting flour and placing a mooncake into a hand-carved wooden heritage mold inside a vintage warm kitchen"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLWd3HF_DYoy_d4sYRXAZJjJIzJrQrvln4xojEit9j1gXPvxziQLA4-cfsfS8xbw1fa3Huq0Q4-jHqRu6DX_D0Oa8PEKc_eN7wA7QZCPzgB5lbPEoaptfUjdTCZYtJ9sPXpggeDkCs5APR6W-GwfILz_l_51EUmC2u5Vka-Zf2soL0H_dTYiPTiXO1SKrllqCwg-5xO4qagauNDJVnV-4dyuiNxCKg41cpEbnL6aDQnIspUDDP3W8M"
                  />{' '}
                  <div className="absolute bottom-space-md left-space-md right-space-md bg-ink-dark/80 backdrop-blur p-space-md rounded-[0.125rem] text-champagne-light">
                    {' '}
                    <span className="font-label-sm text-label-sm text-secondary-fixed uppercase tracking-widest block">
                      Nghệ Nhân Bàn Tay Vàng
                    </span>{' '}
                    <p className="font-headline-sm text-headline-sm text-champagne-light">
                      Đặng Văn Đông • Đông Phương Phủ
                    </p>{' '}
                    <p className="font-body-sm text-body-sm text-on-primary-container pt-1">
                      Gìn giữ 3 đời bí kíp ủ bột và canh lửa than củi từ năm 1954.
                    </p>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="lg:col-span-7 space-y-space-md">
                  {' '}
                  <span className="font-label-lg text-label-lg uppercase tracking-widest text-secondary font-bold">
                    Kế Thừa Tinh Hoa Hoàng Cung Huế & Cổ Độ Phố Hiến
                  </span>{' '}
                  <h2 className="font-headline-xl text-headline-xl text-ink-dark leading-tight">
                    {' Dòng Sốt Lava Tam Cấp: Kiệt Tác 36 Giờ Chưng Cất '}
                  </h2>{' '}
                  <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                    {
                      ' Khác với dòng bánh công nghiệp sử dụng phụ gia nhũ hóa, dòng sốt Lava Hoàng Kim tại Nguyệt Viên Đài được tạo tác hoàn toàn từ lòng đỏ trứng vịt muối thảo mộc ủ chum sành 30 ngày. Mỗi mẻ trứng được chưng cất cùng cốt dừa tươi Bến Tre và sữa hột điều nguyên bản trong suốt 36 giờ ở nhiệt độ lửa chìm 72°C. '
                    }
                  </p>{' '}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md pt-space-xs">
                    {' '}
                    <div className="p-space-md rounded-[0.125rem] bg-surface-container-lowest shadow-sm">
                      {' '}
                      <span className="font-headline-md text-headline-md text-secondary font-bold">70 Năm</span>{' '}
                      <p className="font-body-sm text-body-sm text-ink-dark font-medium pt-1">Khuôn Gỗ Thị Cổ</p>{' '}
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Tạo hình vân sen nổi mang linh khí hoàng triều.
                      </p>{' '}
                    </div>{' '}
                    <div className="p-space-md rounded-[0.125rem] bg-surface-container-lowest shadow-sm">
                      {' '}
                      <span className="font-headline-md text-headline-md text-secondary font-bold">100%</span>{' '}
                      <p className="font-body-sm text-body-sm text-ink-dark font-medium pt-1">Trứng Muối Thảo Mộc</p>{' '}
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Ủ sao biển cùng quế chi, hoa hồi và rượu nếp thơm.
                      </p>{' '}
                    </div>{' '}
                    <div className="p-space-md rounded-[0.125rem] bg-surface-container-lowest shadow-sm">
                      {' '}
                      <span className="font-headline-md text-headline-md text-secondary font-bold">0%</span>{' '}
                      <p className="font-body-sm text-body-sm text-ink-dark font-medium pt-1">Hóa Chất Bảo Quản</p>{' '}
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Tươi mới mỗi sáng, tiêu thụ trong vòng 15 ngày lạnh.
                      </p>{' '}
                    </div>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
            <div className="tab-panel py-space-lg hidden" id="tab-nutrition">
              {' '}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
                {' '}
                <div className="lg:col-span-6 bg-surface-container-lowest p-space-xl rounded-[0.25rem] shadow-sm space-y-space-md">
                  {' '}
                  <div className="pb-space-sm">
                    {' '}
                    <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">
                      Bảng Giá Trị Dinh Dưỡng Thực Nghiệm
                    </span>{' '}
                    <h3 className="font-headline-md text-headline-md text-ink-dark">Khẩu Phần: 1 Chiếc (150g)</h3>{' '}
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Đo lường kiểm nghiệm theo tiêu chuẩn Viện Dinh Dưỡng Quốc Gia
                    </p>{' '}
                  </div>{' '}
                  <div className="space-y-space-xs text-ink-dark font-body-md text-body-md">
                    {' '}
                    <div className="flex justify-between py-2">
                      {' '}
                      <span className="font-bold">Năng Lượng (Calories)</span>{' '}
                      <span className="font-bold">428 kcal</span>{' '}
                    </div>{' '}
                    <div className="flex justify-between py-2">
                      {' '}
                      <span className="text-on-surface-variant">Chất đạm (Protein)</span> <span>8.6 g</span>{' '}
                    </div>{' '}
                    <div className="flex justify-between py-2">
                      {' '}
                      <span className="text-on-surface-variant">Tổng chất béo tự nhiên (Total Fat)</span>{' '}
                      <span>18.2 g</span>{' '}
                    </div>{' '}
                    <div className="flex justify-between py-2 pl-space-md text-on-surface-variant">
                      {' '}
                      <span>Chất béo bão hòa tự nhiên</span> <span>4.1 g</span>{' '}
                    </div>{' '}
                    <div className="flex justify-between py-2">
                      {' '}
                      <span className="text-on-surface-variant">Chất bột đường (Carbohydrates)</span>{' '}
                      <span>54.5 g</span>{' '}
                    </div>{' '}
                    <div className="flex justify-between py-2 pl-space-md text-on-surface-variant">
                      {' '}
                      <span>Đường tự nhiên tự luyện (Cane Sugar)</span> <span>21.0 g</span>{' '}
                    </div>{' '}
                    <div className="flex justify-between py-2">
                      {' '}
                      <span className="text-on-surface-variant">Natri (Sodium)</span> <span>240 mg</span>{' '}
                    </div>{' '}
                    <div className="flex justify-between py-2">
                      {' '}
                      <span className="text-secondary font-bold">Vàng thực phẩm 24K (Edible Gold)</span>{' '}
                      <span className="text-secondary font-bold">Vi lượng thuần khiết 99.9%</span>{' '}
                    </div>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="lg:col-span-6 flex flex-col justify-between gap-space-lg">
                  {' '}
                  <div className="space-y-space-md bg-surface-container-lowest p-space-xl rounded-[0.25rem] shadow-sm">
                    {' '}
                    <h3 className="font-headline-md text-headline-md text-ink-dark">
                      Minh Bạch Nguyên Liệu Tự Nhiên
                    </h3>{' '}
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      {
                        ' Thành phần trọn vẹn: Bột mì nguyên cám thượng hạng, lòng đỏ trứng vịt muối thảo mộc (26%), hạt sen Tịnh Tâm Huế, đường mía hữu cơ kết tinh tự nhiên, bơ sữa nhập khẩu New Zealand, cốt dừa Bến Tre ép lạnh, bột nghệ tây tây á tạo màu tự nhiên, lá vàng ẩm thực 24K nguyên chất. '
                      }
                    </p>{' '}
                    <div className="p-space-md rounded-[0.125rem] bg-surface-container-low flex items-start gap-space-sm">
                      {' '}
                      <Icon name="info" className="text-secondary text-[24px]" aria-hidden />{' '}
                      <div className="flex flex-col">
                        {' '}
                        <span className="font-label-md text-label-md text-ink-dark font-bold uppercase">
                          Cảnh báo dị ứng
                        </span>{' '}
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Có chứa gluten từ bột mì, trứng và các chế phẩm từ sữa hữu cơ. Hoàn toàn không chứa đậu phộng.
                        </span>{' '}
                      </div>{' '}
                    </div>{' '}
                  </div>{' '}
                  <div className="p-space-xl rounded-[0.25rem] bg-tertiary-container text-on-tertiary shadow-md space-y-space-xs">
                    {' '}
                    <div className="flex items-center gap-space-xs text-secondary-fixed">
                      {' '}
                      <Icon name="thermostat" aria-hidden />{' '}
                      <span className="font-label-lg text-label-lg uppercase tracking-wider">
                        Quy Trình Bảo Quản Hoàng Cung
                      </span>{' '}
                    </div>{' '}
                    <p className="font-body-md text-body-md text-champagne-light leading-relaxed">
                      {
                        ' Ngon nhất khi thưởng thức ở nhiệt độ phòng sau khi rã đông 15 phút, hoặc nướng lại trong lò vi sóng ở mức nhiệt 150°C trong 45 giây để kích hoạt dòng chảy sốt lava trứng muối óng ả. '
                      }
                    </p>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
            <div className="tab-panel py-space-lg hidden" id="tab-policy">
              {' '}
              <div className="bg-surface-container-lowest p-space-xl rounded-[0.25rem] shadow-md space-y-space-lg">
                {' '}
                <div className="max-w-3xl space-y-space-xs">
                  {' '}
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">
                    Cam Kết Dịch Vụ Hoàng Gia
                  </span>{' '}
                  <h3 className="font-headline-lg text-headline-lg text-ink-dark">
                    {' Đặc Quyền Bảo Hiểm Đổi Mới 100% Trong 2 Giờ '}
                  </h3>{' '}
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    {
                      ' Mỗi hộp quà trao đi là một lời thệ ước về danh dự và mỹ cảm. Chúng tôi thấu hiểu tính chất thiêng liêng của quà tặng ngoại giao và gia đình trong dịp Tết Đoàn Viên. '
                    }
                  </p>{' '}
                </div>{' '}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
                  {' '}
                  <div className="p-space-md rounded-[0.125rem] bg-surface-container-low space-y-space-xs">
                    {' '}
                    <div className="w-10 h-10 rounded-[0.75rem] bg-secondary/15 flex items-center justify-center text-secondary">
                      {' '}
                      <Icon name="broken_image" className="text-[24px]" aria-hidden />{' '}
                    </div>{' '}
                    <h4 className="font-headline-sm text-headline-sm text-ink-dark">1. Bể Vỡ & Biến Dạng</h4>{' '}
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {
                        ' Nếu hoa văn trên mặt bánh bị nứt gãy hoặc hộp sơn mài bị trầy xước trong lúc vận chuyển, tài xế hoàng triều đổi hộp mới ngay lập tức. '
                      }
                    </p>{' '}
                  </div>{' '}
                  <div className="p-space-md rounded-[0.125rem] bg-surface-container-low space-y-space-xs">
                    {' '}
                    <div className="w-10 h-10 rounded-[0.75rem] bg-secondary/15 flex items-center justify-center text-secondary">
                      {' '}
                      <Icon name="timer_10" className="text-[24px]" aria-hidden />{' '}
                    </div>{' '}
                    <h4 className="font-headline-sm text-headline-sm text-ink-dark">2. Hỏa Tốc 2 Giờ Nội Thành</h4>{' '}
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {
                        ' Đội ngũ Concierge trực chiến 24/7 giao hộp thay thế trong vòng 120 phút tại Hà Nội và TP. Hồ Chí Minh mà không cần hoàn trả hộp cũ. '
                      }
                    </p>{' '}
                  </div>{' '}
                  <div className="p-space-md rounded-[0.125rem] bg-surface-container-low space-y-space-xs">
                    {' '}
                    <div className="w-10 h-10 rounded-[0.75rem] bg-secondary/15 flex items-center justify-center text-secondary">
                      {' '}
                      <Icon name="support_agent" className="text-[24px]" aria-hidden />{' '}
                    </div>{' '}
                    <h4 className="font-headline-sm text-headline-sm text-ink-dark">3. Trực Đài Ngoại Giao</h4>{' '}
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {
                        ' Chuyên viên quản trị quà tặng doanh nghiệp đại diện giải quyết mọi phát sinh trực tiếp với đối tác nhận quà của quý khách. '
                      }
                    </p>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
        </section>{' '}
      </div>
    </>
  )
}
