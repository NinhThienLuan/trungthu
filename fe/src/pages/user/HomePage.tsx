// Tự sinh từ bản thiết kế Stitch — giữ nguyên nội dung. Sửa logic ở trang bọc ngoài.
// Khu "Lễ vị" và "Thương hiệu" lấy dữ liệu thật (GET /api/products) thay cho dữ liệu mẫu của Stitch.
import { Link } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { HeroMotion } from '../../components/HeroMotion'
import { useApi } from '../../hooks/useApi'
import { productService } from '../../services/productService'
import { ROUTES } from '../../constants'
import { formatVnd } from '../../lib/format'
import type { Product } from '../../types/product'

interface Shop {
  providerId: string
  storeName: string
  imageUrl?: string | null
  productCount: number
  minPrice: number
}

const minPrice = (p: Product) => Math.min(...p.variants.map((v) => v.price))

/** Gom sản phẩm theo xưởng để hiện khu "Thương hiệu" */
function toShops(products: Product[]): Shop[] {
  const shops = new Map<string, Shop>()
  for (const p of products) {
    if (!p.variants.length) continue
    const shop = shops.get(p.providerId)
    if (!shop) {
      shops.set(p.providerId, { providerId: p.providerId, storeName: p.storeName, imageUrl: p.imageUrl, productCount: 1, minPrice: minPrice(p) })
    } else {
      shop.productCount += 1
      shop.minPrice = Math.min(shop.minPrice, minPrice(p))
    }
  }
  return [...shops.values()]
}

export function HomePage() {
  // ponytail: một trang đầu (24 sp) đủ cho 4 sản phẩm + các xưởng; cần đủ xưởng khi > 24 sp thì thêm API danh sách xưởng
  const { data, loading } = useApi(() => productService.list({ size: 24 }), [])
  const products = (data?.content ?? []).filter((p) => p.status === 'ACTIVE' && p.variants.length > 0)
  const featured = products.slice(0, 4)
  const shops = toShops(products).slice(0, 4)
  return (
    <>
      <div className="flex flex-col w-full">
        {' '}
        <section className="relative w-full overflow-hidden bg-primary -mt-20 pt-20 shadow-2xl">
          {' '}
          <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
            {' '}
            <HeroMotion firstSrc="https://lh3.googleusercontent.com/aida/AEtjO1WA3bE4RLcHOKQ7kyM6600CviTSESGNC0hvHTzZFhzJGy2pAmBIk0ZsMdgI43BzJejUMlNiQZ75VmxiiGc-zq3b09d_tqEv6Bdr58W41_fMUGHBRe4UFXdsawCRsbR3PZUTNdz_Ac0XYRK_Lyb6p3PxiL-ZxRlQKs0ALWNaU0efJsaN-z5LZ7ncsf9OHnwpZAS33Hn2rTmsttDxFmkUvtH2d07sy5lQ_uN-f7kbfzMxjvd2Z3XOb2Wxyq0" />{' '}
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary/30"></div>{' '}
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-primary/60"></div>{' '}
            <div className="absolute -top-32 right-1/4 w-96 h-96 rounded-[0.75rem] bg-secondary-container/15 blur-3xl"></div>{' '}
          </div>{' '}
          <div className="relative z-10 w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin pt-space-xl pb-space-xl md:pb-28 flex flex-col justify-center min-h-[640px]">
            {' '}
            <div className="max-w-3xl flex flex-col gap-space-md">
              {' '}
              <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-[0.75rem] bg-primary-container/70 border border-border-gold-subtle backdrop-blur-md shadow-sm">
                {' '}
                <Icon name="workspace_premium" className="text-[15px] text-secondary-fixed-dim" aria-hidden />{' '}
                <span className="font-label-sm text-label-sm tracking-widest text-champagne-light uppercase">
                  Đại Sàn Thượng Phẩm Mùa Trăng 2025
                </span>{' '}
              </div>{' '}
              <h1 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-surface-container-lowest font-semibold tracking-tight">
                {' Tinh Hoa Lễ Phẩm Mùa Trăng '}
                <br className="hidden md:inline" />{' '}
                <span className="text-secondary-fixed-dim font-headline-xl">Nguyệt Viên Đài</span>{' '}
              </h1>{' '}
              <p className="font-body-lg text-body-lg text-surface-container-highest/90 max-w-2xl leading-relaxed">
                {
                  ' Hội tụ các thương hiệu & xưởng bánh trung thu truyền thống danh tiếng nhất Việt Nam. Dịch vụ đặt sỉ B2B Doanh nghiệp, khắc logo mạ vàng gia truyền và bảo quản chuỗi lạnh tươi ngon vẹn tròn tới từng bàn tiệc gia bảo. '
                }
              </p>{' '}
              <div className="flex flex-wrap items-center gap-space-md pt-space-sm">
                {' '}
                <a
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[0.125rem] bg-primary-container border border-secondary-fixed-dim/40 text-champagne-light font-label-lg text-label-lg shadow-xl hover:bg-secondary-fixed-dim hover:text-ink-dark transition-all"
                  href="#b2b-rfq"
                >
                  {' '}
                  <Icon name="request_quote" className="text-[19px] text-secondary-fixed-dim" aria-hidden />{' '}
                  <span>Đặt Sỉ B2B & Nhận Báo Giá Doanh Nghiệp</span>{' '}
                </a>{' '}
                <a
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[0.125rem] bg-surface-container-lowest/15 border border-white/20 backdrop-blur-md text-surface-container-lowest font-label-lg text-label-lg hover:bg-surface-container-lowest hover:text-primary transition-all"
                  href="#artisan-guild"
                >
                  {' '}
                  <Icon name="palette" className="text-[19px] text-secondary-fixed-dim" aria-hidden />{' '}
                  <span>Khám Phá Gian Hàng Nghệ Nhân</span>{' '}
                </a>{' '}
              </div>{' '}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm pt-space-md max-w-2xl">
                {' '}
                <div className="flex items-center gap-3 bg-primary-container/60 border border-border-gold-subtle/50 backdrop-blur-md p-3.5 rounded-[0.125rem]">
                  {' '}
                  <div className="w-10 h-10 rounded-[0.75rem] bg-secondary-fixed/10 border border-border-gold-subtle flex items-center justify-center text-secondary-fixed-dim">
                    {' '}
                    <Icon name="verified" className="text-[20px]" aria-hidden />{' '}
                  </div>{' '}
                  <div className="flex flex-col">
                    {' '}
                    <span className="font-headline-sm text-headline-sm text-surface-container-lowest">42+</span>{' '}
                    <span className="font-label-sm text-label-sm text-champagne-light/75 uppercase">
                      Nghệ nhân bảo chứng
                    </span>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="flex items-center gap-3 bg-primary-container/60 border border-border-gold-subtle/50 backdrop-blur-md p-3.5 rounded-[0.125rem]">
                  {' '}
                  <div className="w-10 h-10 rounded-[0.75rem] bg-secondary-fixed/10 border border-border-gold-subtle flex items-center justify-center text-secondary-fixed-dim">
                    {' '}
                    <Icon name="schedule" className="text-[20px]" aria-hidden />{' '}
                  </div>{' '}
                  <div className="flex flex-col">
                    {' '}
                    <span className="font-headline-sm text-headline-sm text-surface-container-lowest">100%</span>{' '}
                    <span className="font-label-sm text-label-sm text-champagne-light/75 uppercase">
                      Date tươi xuất xưởng
                    </span>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="flex items-center gap-3 bg-primary-container/60 border border-border-gold-subtle/50 backdrop-blur-md p-3.5 rounded-[0.125rem]">
                  {' '}
                  <div className="w-10 h-10 rounded-[0.75rem] bg-secondary-fixed/10 border border-border-gold-subtle flex items-center justify-center text-secondary-fixed-dim">
                    {' '}
                    <Icon name="ac_unit" className="text-[20px]" aria-hidden />{' '}
                  </div>{' '}
                  <div className="flex flex-col">
                    {' '}
                    <span className="font-headline-sm text-headline-sm text-surface-container-lowest">
                      18°C - 22°C
                    </span>{' '}
                    <span className="font-label-sm text-label-sm text-champagne-light/75 uppercase">
                      Chuỗi lạnh nguyên vẹn
                    </span>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
        </section>{' '}
        <section className="w-full bg-surface-container-low py-space-xl px-margin-mobile md:px-margin">
          {' '}
          <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-space-xl">
            {' '}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-4">
              {' '}
              <div className="flex flex-col gap-1">
                {' '}
                <div className="flex items-center gap-2">
                  {' '}
                  <span className="w-2 h-2 rounded-[0.75rem] bg-secondary"></span>{' '}
                  <span className="font-label-md text-label-md text-secondary uppercase tracking-widest font-semibold">
                    Tuyển tập mỹ vị cung đình
                  </span>{' '}
                </div>{' '}
                <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary font-semibold">
                  Lễ Vị Độc Bản Mùa Trăng
                </h2>{' '}
                <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
                  Hương vị di sản lưu truyền qua nhiều thế hệ, được chăm chút bởi các đôi bàn tay nghệ nhân danh giá xứ
                  Kinh Kỳ và phương Nam.
                </p>{' '}
              </div>{' '}
              <div className="flex items-center gap-2 self-start md:self-auto">
                {' '}
                <span className="font-label-sm text-label-sm text-secondary px-3.5 py-1.5 rounded-[0.75rem] bg-surface-container border border-border-gold-subtle">
                  Hương Vị Hoàng Tộc 2025
                </span>{' '}
              </div>{' '}
            </div>{' '}
            <FeaturedProducts products={featured} loading={loading} />{' '}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter pt-space-sm">
              {' '}
              <div className="p-space-lg rounded-[0.125rem] bg-surface-container-lowest border border-border-gold-subtle shadow-sm hover:shadow-md transition-shadow flex items-start gap-space-md">
                {' '}
                <div className="w-12 h-12 rounded-[0.125rem] bg-surface-container border border-border-gold-subtle flex items-center justify-center text-secondary shrink-0">
                  {' '}
                  <Icon name="tune" className="text-[26px]" aria-hidden />{' '}
                </div>{' '}
                <div className="flex flex-col gap-1">
                  {' '}
                  <h4 className="font-headline-sm text-headline-sm text-primary">Tự Phối Hộp Quà 4-6-8 Bánh</h4>{' '}
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Tùy chọn hương vị từ các lò bánh khác nhau, kết hợp vỏ hộp gấm lụa hoàng gia theo sở thích.
                  </p>{' '}
                  <a
                    className="font-label-md text-label-md text-secondary hover:underline inline-flex items-center gap-1 mt-1 font-semibold"
                    href="#"
                  >
                    {'Bắt đầu phối hộp '}
                    <Icon name="arrow_forward" className="text-[14px]" aria-hidden />
                  </a>{' '}
                </div>{' '}
              </div>{' '}
              <div className="p-space-lg rounded-[0.125rem] bg-surface-container-lowest border border-border-gold-subtle shadow-sm hover:shadow-md transition-shadow flex items-start gap-space-md">
                {' '}
                <div className="w-12 h-12 rounded-[0.125rem] bg-surface-container border border-border-gold-subtle flex items-center justify-center text-primary shrink-0">
                  {' '}
                  <Icon name="corporate_fare" className="text-[26px]" aria-hidden />{' '}
                </div>{' '}
                <div className="flex flex-col gap-1">
                  {' '}
                  <h4 className="font-headline-sm text-headline-sm text-primary">In Khắc Logo Doanh Nghiệp</h4>{' '}
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Mạ nhũ vàng kim, in thiệp thư pháp phong thủy trao tặng khách hàng VIP và đối tác chiến lược.
                  </p>{' '}
                  <a
                    className="font-label-md text-label-md text-secondary hover:underline inline-flex items-center gap-1 mt-1 font-semibold"
                    href="#b2b-rfq"
                  >
                    {'Tư vấn in logo '}
                    <Icon name="arrow_forward" className="text-[14px]" aria-hidden />
                  </a>{' '}
                </div>{' '}
              </div>{' '}
              <div className="p-space-lg rounded-[0.125rem] bg-surface-container-lowest border border-border-gold-subtle shadow-sm hover:shadow-md transition-shadow flex items-start gap-space-md">
                {' '}
                <div className="w-12 h-12 rounded-[0.125rem] bg-surface-container border border-border-gold-subtle flex items-center justify-center text-secondary shrink-0">
                  {' '}
                  <Icon name="storefront" className="text-[26px]" aria-hidden />{' '}
                </div>{' '}
                <div className="flex flex-col gap-1">
                  {' '}
                  <h4 className="font-headline-sm text-headline-sm text-primary">Mở Gian Hàng Cho Nghệ Nhân</h4>{' '}
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Tiếp cận 100.000+ người mua B2B và người sành ẩm thực toàn quốc với hạ tầng chuỗi lạnh tối ưu.
                  </p>{' '}
                  <a
                    className="font-label-md text-label-md text-secondary hover:underline inline-flex items-center gap-1 mt-1 font-semibold"
                    href="#"
                  >
                    {'Đăng ký tham gia '}
                    <Icon name="arrow_forward" className="text-[14px]" aria-hidden />
                  </a>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
        </section>{' '}
        <section
          className="w-full bg-surface py-space-xl px-margin-mobile md:px-margin"
          id="artisan-guild"
        >
          {' '}
          <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-space-xl">
            {' '}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md pb-4">
              {' '}
              <div className="flex flex-col gap-1 max-w-xl">
                {' '}
                <div className="flex items-center gap-2">
                  {' '}
                  <Icon name="stars" className="text-secondary text-[20px]" aria-hidden />{' '}
                  <span className="font-label-md text-label-md text-secondary uppercase tracking-widest font-semibold">
                    Danh vị đệ nhất xưởng bánh
                  </span>{' '}
                </div>{' '}
                <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary font-semibold">
                  Thương Hiệu Bảo Chứng Hoàng Gia
                </h2>{' '}
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Các lò bánh cổ truyền lừng danh ba miền với tuổi đời hàng chục năm, cam kết đúng tiêu chuẩn an toàn
                  thực phẩm ngự viện.
                </p>{' '}
              </div>{' '}
            </div>{' '}
            <FeaturedShops shops={shops} loading={loading} />{' '}
          </div>{' '}
        </section>{' '}
        <section className="w-full bg-surface-container-low py-space-xl px-margin-mobile md:px-margin" id="b2b-rfq">
          {' '}
          <div className="w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
            {' '}
            <div className="lg:col-span-7 flex flex-col gap-space-lg">
              {' '}
              <div className="flex flex-col gap-2">
                {' '}
                <div className="flex items-center gap-2">
                  {' '}
                  <Icon name="bolt" className="text-secondary text-[20px]" aria-hidden />{' '}
                  <span className="font-label-md text-label-md text-secondary uppercase tracking-widest font-semibold">
                    Quy trình B2B Chuyên Nghiệp
                  </span>{' '}
                </div>{' '}
                <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary font-semibold">
                  Báo Giá Đặt Sỉ Doanh Nghiệp Trong 2 Giờ
                </h2>{' '}
                
              </div>{' '}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                {' '}
                <div className="p-space-md rounded-[0.125rem] bg-surface-container-lowest border border-border-gold-subtle shadow-sm flex flex-col gap-2">
                  {' '}
                  <div className="w-8 h-8 rounded-[0.125rem] bg-primary text-champagne-light font-label-lg text-label-lg flex items-center justify-center font-bold">
                    1
                  </div>{' '}
                  <h4 className="font-headline-sm text-headline-sm text-primary">Gửi Nhu Cầu & Ngân Sách</h4>{' '}
                </div>{' '}
                <div className="p-space-md rounded-[0.125rem] bg-surface-container-lowest border border-border-gold-subtle shadow-sm flex flex-col gap-2">
                  {' '}
                  <div className="w-8 h-8 rounded-[0.125rem] bg-secondary text-surface-container-lowest font-label-lg text-label-lg flex items-center justify-center font-bold">
                    2
                  </div>{' '}
                  <h4 className="font-headline-sm text-headline-sm text-primary">Báo Giá Sỉ Trong 2 Giờ</h4>{' '}
                </div>{' '}
                <div className="p-space-md rounded-[0.125rem] bg-surface-container-lowest border border-border-gold-subtle shadow-sm flex flex-col gap-2">
                  {' '}
                  <div className="w-8 h-8 rounded-[0.125rem] bg-primary-container text-champagne-light border border-border-gold-subtle font-label-lg text-label-lg flex items-center justify-center font-bold">
                    3
                  </div>{' '}
                  <h4 className="font-headline-sm text-headline-sm text-primary">Thử Mẫu & Khắc Thử Logo</h4>{' '}
                </div>{' '}
                <div className="p-space-md rounded-[0.125rem] bg-surface-container-lowest border border-border-gold-subtle shadow-sm flex flex-col gap-2">
                  {' '}
                  <div className="w-8 h-8 rounded-[0.125rem] bg-primary text-secondary-fixed-dim font-label-lg text-label-lg flex items-center justify-center font-bold">
                    4
                  </div>{' '}
                  <h4 className="font-headline-sm text-headline-sm text-primary">Giao Chuỗi Lạnh Tận Nơi</h4>{' '}
                </div>{' '}
              </div>{' '}
              
            </div>{' '}
            <div className="lg:col-span-5 bg-surface-container-lowest border border-border-gold-subtle p-space-xl rounded-[0.125rem] shadow-xl flex flex-col gap-space-md">
              {' '}
              <div className="flex flex-col gap-1 pb-3">
                {' '}
                <span className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider">
                  Cổng Yêu Cầu Doanh Nghiệp VIP
                </span>{' '}
                <h3 className="font-headline-md text-headline-md text-primary">Nhận Báo Giá Đặt Sỉ Ngay</h3>{' '}
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Phản hồi nhanh qua Zalo Doanh Nghiệp hoặc Email trong 120 phút.
                </p>{' '}
              </div>{' '}
              <form className="flex flex-col gap-space-sm" id="rfqForm">
                {' '}
                <div className="flex flex-col gap-1">
                  {' '}
                  <label className="font-label-sm text-label-sm text-on-surface font-semibold">
                    Tên Doanh Nghiệp / Tổ Chức *
                  </label>{' '}
                  <input
                    className="w-full px-3.5 py-2.5 rounded-[0.125rem] border border-border-gold-subtle bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-colors"
                    required
                    type="text"
                  />{' '}
                </div>{' '}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                  {' '}
                  <div className="flex flex-col gap-1">
                    {' '}
                    <label className="font-label-sm text-label-sm text-on-surface font-semibold">
                      Người Liên Hệ *
                    </label>{' '}
                    <input
                      className="w-full px-3.5 py-2.5 rounded-[0.125rem] border border-border-gold-subtle bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-colors"
                      required
                      type="text"
                    />{' '}
                  </div>{' '}
                  <div className="flex flex-col gap-1">
                    {' '}
                    <label className="font-label-sm text-label-sm text-on-surface font-semibold">
                      Số Điện Thoại / Zalo *
                    </label>{' '}
                    <input
                      className="w-full px-3.5 py-2.5 rounded-[0.125rem] border border-border-gold-subtle bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-colors"
                      required
                      type="tel"
                    />{' '}
                  </div>{' '}
                </div>{' '}
                <div className="flex flex-col gap-1">
                  {' '}
                  <label className="font-label-sm text-label-sm text-on-surface font-semibold">
                    Email Nhận Báo Giá *
                  </label>{' '}
                  <input
                    className="w-full px-3.5 py-2.5 rounded-[0.125rem] border border-border-gold-subtle bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-colors"
                    required
                    type="email"
                  />{' '}
                </div>{' '}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                  {' '}
                  <div className="flex flex-col gap-1">
                    {' '}
                    <label className="font-label-sm text-label-sm text-on-surface font-semibold">
                      Dự Kiến Số Lượng Hộp
                    </label>{' '}
                    <select className="w-full px-3.5 py-2.5 rounded-[0.125rem] border border-border-gold-subtle bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-colors">
                      {' '}
                      <option value="20-50">20 - 50 hộp</option>{' '}
                      <option value="51-100">51 - 100 hộp</option>{' '}
                      <option value="101-300">101 - 300 hộp</option>{' '}
                      <option value="301-1000">301 - 1.000 hộp</option>{' '}
                      <option value="1000+">Trên 1.000 hộp</option>{' '}
                    </select>{' '}
                  </div>{' '}
                  <div className="flex flex-col gap-1">
                    {' '}
                    <label className="font-label-sm text-label-sm text-on-surface font-semibold">
                      Ngân Sách Dự Kiến / Hộp
                    </label>{' '}
                    <select className="w-full px-3.5 py-2.5 rounded-[0.125rem] border border-border-gold-subtle bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-colors">
                      {' '}
                      <option value="400-600">400.000đ - 600.000đ</option>{' '}
                      <option value="600-1000">600.000đ - 1.000.000đ</option>{' '}
                      <option value="1000-2000">1.000.000đ - 2.000.000đ</option>{' '}
                      <option value="luxury">{'Dòng Cung Đình Thượng Hạng (>2tr)'}</option>{' '}
                    </select>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="flex flex-col gap-1">
                  {' '}
                  <label className="font-label-sm text-label-sm text-on-surface font-semibold">
                    Yêu Cầu Đặc Biệt
                  </label>{' '}
                  <textarea
                    className="w-full px-3.5 py-2.5 rounded-[0.125rem] border border-border-gold-subtle bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-colors resize-none"
                    rows={2}
                  />{' '}
                </div>{' '}
                <button
                  className="w-full mt-2 py-3.5 px-4 rounded-[0.125rem] bg-primary text-champagne-light border border-secondary-fixed-dim/40 font-label-lg text-label-lg hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-lg"
                  type="submit"
                >
                  {' '}
                  <Icon name="send" className="text-[19px] text-secondary-fixed-dim" aria-hidden />{' '}
                  <span>Gửi Yêu Cầu Báo Giá Sỉ (Miễn Phí)</span>{' '}
                </button>{' '}
              </form>{' '}
            </div>{' '}
          </div>{' '}
        </section>{' '}
      </div>
    </>
  )
}

const CARD = 'group relative rounded-[0.125rem] bg-surface-container-lowest border border-border-gold-subtle shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden'

function FeaturedProducts({ products, loading }: { products: Product[]; loading: boolean }) {
  if (!loading && products.length === 0) {
    return <p className="font-body-md text-body-md text-on-surface-variant">Chưa có sản phẩm đang bán.</p>
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter" aria-busy={loading}>
      {products.map((p) => (
        <Link key={p.id} to={`${ROUTES.products}/${p.id}`} className={CARD}>
          <div className="relative h-60 w-full overflow-hidden bg-surface-container">
            {p.imageUrl && (
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={p.imageUrl} alt={p.imageAlt ?? p.name} loading="lazy" />
            )}
            <div className="absolute top-3 left-3 bg-primary/90 text-champagne-light border border-border-gold-subtle font-label-sm text-label-sm px-2.5 py-1 rounded-[0.125rem] uppercase tracking-wider backdrop-blur-sm">
              {p.storeName}
            </div>
          </div>
          <div className="p-space-md flex flex-col gap-2">
            <h3 className="font-headline-sm text-headline-sm text-primary">{p.name}</h3>
            {p.description && <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">{p.description}</p>}
            <div className="pt-2 flex items-center justify-between">
              <span className="font-label-md text-label-md text-secondary font-bold">Từ {formatVnd(minPrice(p))}</span>
              <span className="w-8 h-8 rounded-[0.125rem] bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-champagne-light transition-colors border border-border-gold-subtle">
                <Icon name="arrow_forward" className="text-[17px]" aria-hidden />
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

function FeaturedShops({ shops, loading }: { shops: Shop[]; loading: boolean }) {
  if (!loading && shops.length === 0) return null
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter" aria-busy={loading}>
      {shops.map((shop) => (
        <div key={shop.providerId} className="rounded-[0.125rem] bg-surface-container-lowest border border-border-gold-subtle p-space-md shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
          <div className="flex flex-col gap-space-sm">
            <div className="relative h-48 w-full rounded-[0.125rem] overflow-hidden bg-surface-container border border-border-gold-subtle/50">
              {shop.imageUrl && <img className="w-full h-full object-cover" src={shop.imageUrl} alt={shop.storeName} loading="lazy" />}
            </div>
            <span className="pt-1 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              {shop.productCount} sản phẩm đang bán
            </span>
            <h3 className="font-headline-sm text-headline-sm text-primary">{shop.storeName}</h3>
          </div>
          <div className="pt-space-md flex flex-col gap-2 mt-2">
            <div className="flex items-baseline justify-between">
              <span className="font-body-sm text-body-sm text-on-surface-variant">Bán lẻ từ:</span>
              <span className="font-headline-sm text-headline-sm text-primary font-bold">{formatVnd(shop.minPrice)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link to={ROUTES.products} className="py-2 px-3 text-center rounded-[0.125rem] bg-surface-container text-primary border border-border-gold-subtle font-label-md text-label-md hover:bg-surface-container-high transition-colors">
                Xem Menu
              </Link>
              <Link to={ROUTES.rfq} className="py-2 px-3 text-center rounded-[0.125rem] bg-primary text-champagne-light font-label-md text-label-md hover:bg-primary-container transition-colors">
                Báo Giá Sỉ
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
