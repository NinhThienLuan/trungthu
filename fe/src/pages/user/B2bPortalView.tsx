// Tự sinh từ bản thiết kế Stitch — giữ nguyên nội dung. Sửa logic ở trang bọc ngoài.
import { useEffect, useState } from 'react'
import { Icon } from '../../components/Icon'
import { RFQ_MIN_QUANTITY } from '../../constants'
import { formatDate } from '../../lib/format'
import { useApi } from '../../hooks/useApi'
import { productService } from '../../services/productService'
import { rfqService } from '../../services/rfqService'
import { BudgetCalculator, ProviderProductPicker, type B2bCatalog, type RfqDraft } from './B2bRfqTools'

/** Bánh lẻ và set quà đang bán (BE đã bỏ vỏ hộp khỏi danh sách); danh sách xưởng lấy từ chính sản phẩm */
function useB2bCatalog(): B2bCatalog {
  const { data, loading } = useApi(() => productService.list({ size: 200 }), [])
  const products = (data?.content ?? []).filter((p) => p.productType === 'LOOSE_CAKE' || p.productType === 'GIFT_SET')
  const providers = [...new Map(products.map((p) => [p.providerId, p.storeName])).entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
  return { products, providers, loading }
}

export function B2bPortalView() {
  const catalog = useB2bCatalog()
  // Bảng tính và form RFQ dùng chung lựa chọn xưởng / bánh / số lượng
  const [draft, setDraft] = useState<RfqDraft>({ providerId: '', productId: '', quantity: 100, cakesPerBox: 4 })
  const [customerType, setCustomerType] = useState<'BUSINESS' | 'INDIVIDUAL'>('BUSINESS')
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('')
  const [dateTouched, setDateTouched] = useState(false)
  const deliveryEstimate = useApi(
    () => draft.quantity >= RFQ_MIN_QUANTITY && draft.cakesPerBox > 0
      ? rfqService.earliestDelivery(draft.quantity, draft.cakesPerBox, draft.providerId || undefined)
      : Promise.resolve(null),
    [draft.quantity, draft.cakesPerBox, draft.providerId],
  )
  const estimate = !deliveryEstimate.loading && !deliveryEstimate.error
    && deliveryEstimate.data?.cakeQuantity === draft.quantity * draft.cakesPerBox
    && (!draft.providerId || deliveryEstimate.data.providerId === draft.providerId)
    ? deliveryEstimate.data : null
  const earliestDeliveryDate = estimate?.earliestDeliveryDate ?? ''
  useEffect(() => {
    if (earliestDeliveryDate) setExpectedDeliveryDate((current) =>
      !dateTouched || !current || current < earliestDeliveryDate ? earliestDeliveryDate : current)
    else setExpectedDeliveryDate('')
  }, [earliestDeliveryDate, dateTouched])
  /** "Điền vào yêu cầu báo giá": ghi ngân sách + dịch vụ thêm vào form rồi cuộn tới form */
  const applyEstimate = (budget: number | undefined, addons: string[]) => {
    const budgetInput = document.getElementById('rfq-budget') as HTMLInputElement | null
    if (budgetInput && budget) budgetInput.value = String(budget)
    const description = document.getElementById('rfq-description') as HTMLTextAreaElement | null
    if (description) {
      const missing = addons.filter((a) => !description.value.includes(a))
      if (missing.length) description.value = [description.value.trim(), ...missing.map((a) => `- ${a}`)].filter(Boolean).join('\n')
    }
    document.getElementById('rfq-section')?.scrollIntoView({ behavior: 'smooth' })
  }
  return (
    <>
      <div className="flex flex-col w-full">
        {' '}
        <section className="relative bg-primary-container text-surface overflow-hidden px-margin-mobile lg:px-margin py-space-xl lg:py-24">
          {' '}
          <div className="absolute -right-24 -top-24 w-96 h-96 bg-secondary-container/10 rounded-[0.75rem] blur-3xl pointer-events-none"></div>{' '}
          <div className="absolute left-1/4 -bottom-32 w-80 h-80 bg-primary/40 rounded-[0.75rem] blur-3xl pointer-events-none"></div>{' '}
          <div className="max-w-[1320px] mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
            {' '}
            <div className="lg:col-span-7 space-y-space-lg">
              {' '}
              <div className="inline-flex items-center gap-space-xs px-space-md py-1 bg-surface-container-lowest/10 rounded-[0.125rem] backdrop-blur-md">
                {' '}
                <Icon name="verified" className="text-secondary-fixed text-[18px]" aria-hidden />{' '}
                <span className="font-label-sm text-label-sm text-secondary-fixed tracking-widest uppercase">
                  Đại Nguyện Giao Thảo • Mùa Trăng Ất Tỵ 2026
                </span>{' '}
              </div>{' '}
              <h1 className="font-headline-xl text-headline-xl lg:text-[52px] lg:leading-[62px] text-champagne-light tracking-tight">
                {' Giải Pháp Quà Tặng Doanh Nghiệp & Ngoại Giao Mùa Trăng 2026 '}
              </h1>{' '}
              <p className="font-body-lg text-body-lg text-on-primary-container leading-relaxed max-w-2xl">
                {' Năng lực bảo chứng bao tiêu hơn '}
                <span className="text-secondary-fixed font-semibold">100.000+ bảo hộp hoàng gia</span>
                {
                  ' cho các tập đoàn ngân hàng, FDI và tổ chức tài chính. Vận hành chuỗi logistics kiểm soát nhiệt độ lạnh kép 100%, xuất hóa đơn điện tử hợp lệ trong ngày và chính sách chiết khấu linh hoạt đến '
                }
                <span className="text-secondary-fixed font-semibold">38%</span>
                {'. '}
              </p>{' '}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-md pt-space-xs">
                {' '}
                <div className="bg-primary/50 p-space-md rounded-[0.125rem] shadow-sm">
                  {' '}
                  <span className="font-headline-md text-headline-md text-secondary-fixed block">100.000+</span>{' '}
                  <span className="font-label-sm text-label-sm text-on-primary-container uppercase tracking-wider">
                    Hộp năng lực cung ứng
                  </span>{' '}
                </div>{' '}
                <div className="bg-primary/50 p-space-md rounded-[0.125rem] shadow-sm">
                  {' '}
                  <span className="font-headline-md text-headline-md text-secondary-fixed block">100%</span>{' '}
                  <span className="font-label-sm text-label-sm text-on-primary-container uppercase tracking-wider">
                    Chuỗi vận chuyển lạnh
                  </span>{' '}
                </div>{' '}
                <div className="col-span-2 sm:col-span-1 bg-primary/50 p-space-md rounded-[0.125rem] shadow-sm">
                  {' '}
                  <span className="font-headline-md text-headline-md text-secondary-fixed block">2 Giờ</span>{' '}
                  <span className="font-label-sm text-label-sm text-on-primary-container uppercase tracking-wider">
                    Hoàn tất báo giá & VAT
                  </span>{' '}
                </div>{' '}
              </div>{' '}
              <div className="flex flex-wrap items-center gap-space-md pt-space-sm">
                {' '}
                <a
                  className="sheen-gold-btn inline-flex items-center justify-center gap-space-xs px-space-lg py-3.5 text-primary rounded-[0.125rem] font-label-md text-label-md tracking-wider uppercase shadow-md"
                  href="#rfq-section"
                >
                  {' '}
                  <Icon name="local_shipping" className="text-[20px]" aria-hidden />{' '}
                  <span>Đăng Ký Nhận Hộp Mẫu Thử</span>{' '}
                </a>{' '}
                <a
                  className="inline-flex items-center justify-center gap-space-xs px-space-lg py-3.5 bg-surface-container-lowest/10 text-champagne-light hover:bg-surface-container-lowest/20 rounded-[0.125rem] font-label-md text-label-md tracking-wider uppercase transition-all"
                  href="#budget-calculator"
                >
                  {' '}
                  <Icon name="calculate" className="text-[20px]" aria-hidden /> <span>Tính Nhanh Ngân Sách</span>{' '}
                </a>{' '}
              </div>{' '}
            </div>{' '}
            <div className="lg:col-span-5 relative">
              {' '}
              <div className="relative bg-primary/60 p-space-md rounded-[0.125rem] shadow-xl overflow-hidden">
                {' '}
                <div className="relative w-full h-[400px] overflow-hidden rounded-[0.125rem]">
                  {' '}
                  <img
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    data-alt="High-end Vietnamese royal mooncake gift box with gold-leaf debossed dragon and peony motifs, lacquered dark navy wood casing, nested with four artisanal mooncakes brushed with 24k edible gold dust, dramatic cinematic studio lighting, warm champagne tone highlights, ultra luxury bakery catalog aesthetics"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCK1jcVm_dW3-uVi3kYIB6A8wVroeQnLk5mgfhrX6IzNdffJS0nZxGHhCXhOuyJLGHM9x04wzFNbppvLk8wiSr8J_UIMfjpaSUfi2FIyyMdd7LronN5iUDi-a_2LM33Bq2B7NLaH0bx957xP_vy-hzqY2TT6e8f-FIFjdlQwVd3P_npYwOWCX6yGuPqu3MMKVyCKfHE4A0jeTeZsBI9JN6KHaceOmwk7Xc3k7gBjS5kBVCVnKlghzPX"
                  />{' '}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent opacity-80"></div>{' '}
                  <div className="absolute bottom-4 left-4 right-4 p-space-sm bg-primary-container/80 backdrop-blur-md rounded-[0.125rem]">
                    {' '}
                    <span className="font-label-sm text-label-sm text-secondary-fixed uppercase tracking-wider block">
                      Bảo Hộp Quốc Phẩm Tuyển Chọn
                    </span>{' '}
                    <p className="font-headline-sm text-headline-sm text-champagne-light">
                      Tuyệt Tác Sơn Hà Kim Nguyệt
                    </p>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="mt-space-md flex items-center justify-between text-on-primary-container font-label-sm text-label-sm">
                  {' '}
                  <span className="flex items-center gap-1">
                    <Icon name="workspace_premium" className="text-[16px] text-secondary-fixed" aria-hidden />
                    {' Khảm trai thủ công di sản'}
                  </span>{' '}
                  <span className="flex items-center gap-1">
                    <Icon name="severe_cold" className="text-[16px] text-secondary-fixed" aria-hidden />
                    {' 18°C tiêu chuẩn'}
                  </span>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
        </section>{' '}
        <section className="bg-surface-container-low py-space-xl lg:py-24 px-margin-mobile lg:px-margin">
          {' '}
          <div className="max-w-[1320px] mx-auto space-y-space-xl">
            {' '}
            <div className="text-center max-w-3xl mx-auto space-y-space-sm">
              {' '}
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest block">
                Minh Bạch & Đặc Quyền Cung Đình
              </span>{' '}
              <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                Thang Chiết Khấu & Quyền Lợi Tập Đoàn
              </h2>{' '}
              <p className="font-body-md text-body-md text-on-surface-variant">
                {
                  ' Chính sách ưu đãi theo số lượng tối ưu được thiết kế chuyên biệt cho công đoàn, đối tác chiến lược và quà tặng ngoại giao phân bổ đa chi nhánh. '
                }
              </p>{' '}
            </div>{' '}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-lg">
              {' '}
              <div className="bg-surface-container-lowest p-space-lg rounded-[0.125rem] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                {' '}
                <div className="space-y-space-md">
                  {' '}
                  <div className="flex items-center justify-between">
                    {' '}
                    <span className="font-label-sm text-label-sm text-secondary tracking-widest uppercase">
                      Mốc Khởi Tạo
                    </span>{' '}
                    <Icon name="military_tech" className="text-secondary text-[22px]" aria-hidden />{' '}
                  </div>{' '}
                  <div>
                    {' '}
                    <p className="font-headline-md text-headline-md text-primary">
                      {'50 - 199 '}
                      <span className="text-body-md font-body-md text-on-surface-variant">hộp</span>
                    </p>{' '}
                    <div className="mt-2 inline-block px-space-sm py-1 bg-secondary-container/40 text-on-secondary-container rounded-[0.125rem] font-label-md text-label-md">
                      {' Chiết khấu -15% '}
                    </div>{' '}
                  </div>{' '}
                  <ul className="space-y-space-sm pt-space-xs font-body-sm text-body-sm text-on-surface-variant">
                    {' '}
                    <li className="flex items-start gap-space-xs">
                      {' '}
                      <Icon name="check_circle" className="text-[16px] text-secondary mt-0.5" aria-hidden />{' '}
                      <span>Tặng thiệp chúc mừng mạ vàng 18K in lời chúc riêng.</span>{' '}
                    </li>{' '}
                    <li className="flex items-start gap-space-xs">
                      {' '}
                      <Icon name="check_circle" className="text-[16px] text-secondary mt-0.5" aria-hidden />{' '}
                      <span>Miễn phí giao hàng 01 điểm nội thành trọng điểm.</span>{' '}
                    </li>{' '}
                    <li className="flex items-start gap-space-xs">
                      {' '}
                      <Icon name="check_circle" className="text-[16px] text-secondary mt-0.5" aria-hidden />{' '}
                      <span>Xuất hóa đơn VAT điện tử trong ngày.</span>{' '}
                    </li>{' '}
                  </ul>{' '}
                </div>{' '}
                <div className="pt-space-md mt-space-md bg-surface-container-low p-space-sm rounded-[0.125rem]">
                  {' '}
                  <span className="font-label-sm text-[10px] text-secondary-fixed-dim uppercase tracking-wider block">
                    BẢO CHỨNG
                  </span>{' '}
                  <span className="font-body-sm text-[11px] text-on-surface-variant">
                    Hỗ trợ thanh toán công nợ 50-50
                  </span>{' '}
                </div>{' '}
              </div>{' '}
              <div className="bg-surface-container-lowest p-space-lg rounded-[0.125rem] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                {' '}
                <div className="space-y-space-md">
                  {' '}
                  <div className="flex items-center justify-between">
                    {' '}
                    <span className="font-label-sm text-label-sm text-secondary tracking-widest uppercase">
                      Mốc Đối Tác
                    </span>{' '}
                    <Icon name="stars" className="text-secondary text-[22px]" aria-hidden />{' '}
                  </div>{' '}
                  <div>
                    {' '}
                    <p className="font-headline-md text-headline-md text-primary">
                      {'200 - 499 '}
                      <span className="text-body-md font-body-md text-on-surface-variant">hộp</span>
                    </p>{' '}
                    <div className="mt-2 inline-block px-space-sm py-1 bg-secondary-container/40 text-on-secondary-container rounded-[0.125rem] font-label-md text-label-md">
                      {' Chiết khấu -22% '}
                    </div>{' '}
                  </div>{' '}
                  <ul className="space-y-space-sm pt-space-xs font-body-sm text-body-sm text-on-surface-variant">
                    {' '}
                    <li className="flex items-start gap-space-xs">
                      {' '}
                      <Icon name="check_circle" className="text-[16px] text-secondary mt-0.5" aria-hidden />{' '}
                      <span>Khắc Laser kim loại logo doanh nghiệp sắc nét trên nắp hộp.</span>{' '}
                    </li>{' '}
                    <li className="flex items-start gap-space-xs">
                      {' '}
                      <Icon name="check_circle" className="text-[16px] text-secondary mt-0.5" aria-hidden />{' '}
                      <span>Tùy phối 6 dòng nhân thượng hạng theo khẩu vị.</span>{' '}
                    </li>{' '}
                    <li className="flex items-start gap-space-xs">
                      {' '}
                      <Icon name="check_circle" className="text-[16px] text-secondary mt-0.5" aria-hidden />{' '}
                      <span>Giao hàng chia 03 đợt bảo quản tươi mới.</span>{' '}
                    </li>{' '}
                  </ul>{' '}
                </div>{' '}
                <div className="pt-space-md mt-space-md bg-surface-container-low p-space-sm rounded-[0.125rem]">
                  {' '}
                  <span className="font-label-sm text-[10px] text-secondary-fixed-dim uppercase tracking-wider block">
                    BẢO CHỨNG
                  </span>{' '}
                  <span className="font-body-sm text-[11px] text-on-surface-variant">
                    Gửi mẫu thật tận văn phòng trong 24h
                  </span>{' '}
                </div>{' '}
              </div>{' '}
              <div className="bg-surface-container-lowest p-space-lg rounded-[0.125rem] shadow-lg flex flex-col justify-between relative transform lg:-translate-y-2">
                {' '}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-on-secondary px-space-md py-0.5 rounded-[0.125rem] font-label-sm text-[10px] uppercase tracking-widest shadow-sm">
                  {' Khuyên Chọn Cho Doanh Nghiệp '}
                </div>{' '}
                <div className="space-y-space-md">
                  {' '}
                  <div className="flex items-center justify-between">
                    {' '}
                    <span className="font-label-sm text-label-sm text-secondary tracking-widest uppercase">
                      Mốc Thượng Hạng
                    </span>{' '}
                    <Icon name="workspace_premium" className="text-secondary text-[22px]" aria-hidden />{' '}
                  </div>{' '}
                  <div>
                    {' '}
                    <p className="font-headline-md text-headline-md text-primary">
                      {'500 - 999 '}
                      <span className="text-body-md font-body-md text-on-surface-variant">hộp</span>
                    </p>{' '}
                    <div className="mt-2 inline-block px-space-sm py-1 bg-secondary text-on-secondary rounded-[0.125rem] font-label-md text-label-md">
                      {' Chiết khấu -30% '}
                    </div>{' '}
                  </div>{' '}
                  <ul className="space-y-space-sm pt-space-xs font-body-sm text-body-sm text-on-surface-variant">
                    {' '}
                    <li className="flex items-start gap-space-xs">
                      {' '}
                      <Icon name="check_circle" className="text-[16px] text-secondary mt-0.5" aria-hidden />{' '}
                      <span>Vận chuyển lạnh đa điểm toàn quốc (Hà Nội, TP.HCM, Đà Nẵng).</span>{' '}
                    </li>{' '}
                    <li className="flex items-start gap-space-xs">
                      {' '}
                      <Icon name="check_circle" className="text-[16px] text-secondary mt-0.5" aria-hidden />{' '}
                      <span>Dải lụa gấm thêu kim tuyến mang bộ nhận diện công ty.</span>{' '}
                    </li>{' '}
                    <li className="flex items-start gap-space-xs">
                      {' '}
                      <Icon name="check_circle" className="text-[16px] text-secondary mt-0.5" aria-hidden />{' '}
                      <span>Bộ phận nhân sự chuyên biệt giám sát giao vận 1:1.</span>{' '}
                    </li>{' '}
                  </ul>{' '}
                </div>{' '}
                <div className="pt-space-md mt-space-md bg-secondary-container/20 p-space-sm rounded-[0.125rem]">
                  {' '}
                  <span className="font-label-sm text-[10px] text-secondary uppercase tracking-wider block">
                    ĐẶC QUYỀN ĐỈNH CAO
                  </span>{' '}
                  <span className="font-body-sm text-[11px] text-on-surface">Bảo hiểm 100% rủi ro móp vỡ trong 2h</span>{' '}
                </div>{' '}
              </div>{' '}
              <div className="bg-surface-container-lowest p-space-lg rounded-[0.125rem] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                {' '}
                <div className="space-y-space-md">
                  {' '}
                  <div className="flex items-center justify-between">
                    {' '}
                    <span className="font-label-sm text-label-sm text-secondary tracking-widest uppercase">
                      Mốc Hoàng Gia Tập Đoàn
                    </span>{' '}
                    <Icon name="crown" className="text-secondary text-[22px]" aria-hidden />{' '}
                  </div>{' '}
                  <div>
                    {' '}
                    <p className="font-headline-md text-headline-md text-primary">
                      {'1.000+ '}
                      <span className="text-body-md font-body-md text-on-surface-variant">hộp</span>
                    </p>{' '}
                    <div className="mt-2 inline-block px-space-sm py-1 bg-secondary-container/40 text-on-secondary-container rounded-[0.125rem] font-label-md text-label-md">
                      {' Chiết khấu -38% '}
                    </div>{' '}
                  </div>{' '}
                  <ul className="space-y-space-sm pt-space-xs font-body-sm text-body-sm text-on-surface-variant">
                    {' '}
                    <li className="flex items-start gap-space-xs">
                      {' '}
                      <Icon name="check_circle" className="text-[16px] text-secondary mt-0.5" aria-hidden />{' '}
                      <span>Khuôn hộp độc quyền, đúc biểu trưng theo yêu cầu thiết kế.</span>{' '}
                    </li>{' '}
                    <li className="flex items-start gap-space-xs">
                      {' '}
                      <Icon name="check_circle" className="text-[16px] text-secondary mt-0.5" aria-hidden />{' '}
                      <span>Công thức bánh tùy chỉnh (Giảm ngọt / Yến sào / Đông trùng).</span>{' '}
                    </li>{' '}
                    <li className="flex items-start gap-space-xs">
                      {' '}
                      <Icon name="check_circle" className="text-[16px] text-secondary mt-0.5" aria-hidden />{' '}
                      <span>Áp dụng hạn mức công nợ 30 - 70 ngày linh hoạt.</span>{' '}
                    </li>{' '}
                  </ul>{' '}
                </div>{' '}
                <div className="pt-space-md mt-space-md bg-surface-container-low p-space-sm rounded-[0.125rem]">
                  {' '}
                  <span className="font-label-sm text-[10px] text-secondary-fixed-dim uppercase tracking-wider block">
                    BẢO CHỨNG
                  </span>{' '}
                  <span className="font-body-sm text-[11px] text-on-surface-variant">
                    Hợp đồng kinh tế bảo mật thông tin
                  </span>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md pt-space-md">
              {' '}
              <div className="bg-surface-container-lowest p-space-md rounded-[0.125rem] flex items-center gap-space-md shadow-sm">
                {' '}
                <div className="w-12 h-12 rounded-[0.125rem] bg-champagne-light flex items-center justify-center shrink-0">
                  {' '}
                  <Icon name="bakery_dining" className="text-secondary text-[26px]" aria-hidden />{' '}
                </div>{' '}
                <div>
                  {' '}
                  <h4 className="font-label-lg text-label-lg text-primary">Date Mới Ra Lò Trong Ngày</h4>{' '}
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Sản xuất sát thời điểm bàn giao, vỏ bánh mộc vàng ươm chuẩn vị.
                  </p>{' '}
                </div>{' '}
              </div>{' '}
              <div className="bg-surface-container-lowest p-space-md rounded-[0.125rem] flex items-center gap-space-md shadow-sm">
                {' '}
                <div className="w-12 h-12 rounded-[0.125rem] bg-champagne-light flex items-center justify-center shrink-0">
                  {' '}
                  <Icon name="health_and_safety" className="text-secondary text-[26px]" aria-hidden />{' '}
                </div>{' '}
                <div>
                  {' '}
                  <h4 className="font-label-lg text-label-lg text-primary">Kiểm Định VSATTP & ISO 22000</h4>{' '}
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Hồ sơ pháp lý, công bố chất lượng và kiểm nghiệm vi sinh đầy đủ.
                  </p>{' '}
                </div>{' '}
              </div>{' '}
              <div className="bg-surface-container-lowest p-space-md rounded-[0.125rem] flex items-center gap-space-md shadow-sm">
                {' '}
                <div className="w-12 h-12 rounded-[0.125rem] bg-champagne-light flex items-center justify-center shrink-0">
                  {' '}
                  <Icon name="verified_user" className="text-secondary text-[26px]" aria-hidden />{' '}
                </div>{' '}
                <div>
                  {' '}
                  <h4 className="font-label-lg text-label-lg text-primary">Bảo Hiểm Đổi Trả Trong 2H</h4>{' '}
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Cam kết 1 đổi 1 ngay lập tức nếu xuất hiện bất kỳ sự cố móp méo hộp.
                  </p>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
        </section>{' '}
        <section className="bg-surface py-space-xl lg:py-24 px-margin-mobile lg:px-margin" id="budget-calculator">
          {' '}
          <div className="max-w-[1320px] mx-auto space-y-space-xl">
            {' '}
            <div className="text-center max-w-3xl mx-auto space-y-space-xs">
              {' '}
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest block">
                Ước Lượng Trực Quan Minh Bạch
              </span>{' '}
              <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                Bộ Công Cụ Tính Nhanh Ngân Sách B2B
              </h2>{' '}
              <p className="font-body-md text-body-md text-on-surface-variant">
                {
                  ' Chọn xưởng, dòng bánh và số lượng để ước tính ngân sách theo giá niêm yết, rồi gửi yêu cầu để các xưởng báo giá sỉ. '
                }
              </p>{' '}
            </div>{' '}
            <BudgetCalculator catalog={catalog} draft={draft} onChange={setDraft} onApply={applyEstimate} />
          </div>{' '}
        </section>{' '}
        <section
          className="bg-surface-container-low py-space-xl lg:py-24 px-margin-mobile lg:px-margin"
          id="rfq-section"
        >
          {' '}
          <div className="max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
            {' '}
            <div className="lg:col-span-5 space-y-space-lg">
              {' '}
              <div className="space-y-space-xs">
                {' '}
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest block">
                  Quy Trình Tiếp Nhận Khẩn
                </span>{' '}
                <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                  Cổng Yêu Cầu Báo Giá & Hộp Mẫu Doanh Nghiệp
                </h2>{' '}
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {
                    ' Chuyên viên tư vấn cấp cao của Nguyệt Viên Đài sẽ thẩm định yêu cầu, liên hệ tư vấn hợp đồng kinh tế và chuyển mẫu bánh nếm thử trực tiếp đến văn phòng quý tập đoàn trong vòng 24 giờ làm việc. '
                  }
                </p>{' '}
              </div>{' '}
              <div className="bg-surface-container-lowest p-space-lg rounded-[0.125rem] space-y-space-md shadow-sm">
                {' '}
                <h3 className="font-headline-sm text-headline-sm text-primary">Tài Liệu Mẫu Phục Vụ Đặt Hàng</h3>{' '}
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {
                    ' Tải mẫu danh sách phân bổ các chi nhánh để bộ phận kho vận chúng tôi chuẩn bị kế hoạch chia xe lạnh tối ưu nhất. '
                  }
                </p>{' '}
                <a
                  className="inline-flex items-center gap-space-xs px-space-md py-2.5 bg-surface-container text-primary rounded-[0.125rem] font-label-md text-label-md hover:bg-champagne-light transition-colors"
                  href="/mau-phan-bo-chi-nhanh.csv"
                  download
                >
                  {' '}
                  <Icon name="table_view" className="text-secondary text-[20px]" aria-hidden />{' '}
                  <span>Tải Bảng Mẫu Phân Bổ Chi Nhánh (Excel .csv)</span>{' '}
                </a>{' '}
                <div className="pt-space-xs flex items-center gap-space-sm font-label-sm text-label-sm text-on-surface-variant">
                  {' '}
                  <Icon name="schedule" className="text-secondary text-[16px]" aria-hidden />{' '}
                  <span>Cam kết phản hồi văn bản chính thức trong 2 giờ</span>{' '}
                </div>{' '}
              </div>{' '}
              <div className="p-space-md bg-secondary-container/20 rounded-[0.125rem] space-y-2">
                {' '}
                <div className="flex items-center gap-2 text-secondary font-label-md text-label-md uppercase">
                  {' '}
                  <Icon name="call" className="text-[20px]" aria-hidden />{' '}
                  <span>Đường Dây Nóng Khách Hàng Ưu Tiên</span>{' '}
                </div>{' '}
                <p className="font-headline-md text-headline-md text-primary">
                  {'1800 8899 '}
                  <span className="text-body-sm font-body-sm text-on-surface-variant">
                    (Nhánh 2 - Khối Doanh Nghiệp B2B)
                  </span>
                </p>{' '}
              </div>{' '}
            </div>{' '}
            <div className="lg:col-span-7 bg-surface-container-lowest p-space-lg lg:p-space-xl rounded-[0.125rem] shadow-md space-y-space-lg">
              {' '}
              <div className="pb-space-sm">
                {' '}
                <h3 className="font-headline-md text-headline-md text-primary">Thông Tin Đề Nghị Báo Giá (RFQ)</h3>{' '}
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Vui lòng điền thông tin doanh nghiệp để các xưởng gửi báo giá chi tiết.
                </p>{' '}
              </div>{' '}
              <form className="space-y-space-md" id="rfq-form" noValidate>
                <input type="hidden" name="customerType" value={customerType} />
                <div className="space-y-2 pb-2">
                  <label className="font-label-md text-label-md text-primary uppercase block">
                    Đối Tượng Đặt Hàng *
                  </label>
                  <div className="flex flex-wrap gap-4">
                    <label className="inline-flex items-center gap-2 cursor-pointer font-body-md text-body-md text-primary">
                      <input
                        type="radio"
                        name="customerTypeChoice"
                        value="BUSINESS"
                        checked={customerType === 'BUSINESS'}
                        onChange={() => setCustomerType('BUSINESS')}
                        className="accent-secondary"
                      />
                      Doanh Nghiệp / Tổ Chức (Xuất VAT)
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer font-body-md text-body-md text-primary">
                      <input
                        type="radio"
                        name="customerTypeChoice"
                        value="INDIVIDUAL"
                        checked={customerType === 'INDIVIDUAL'}
                        onChange={() => setCustomerType('INDIVIDUAL')}
                        className="accent-secondary"
                      />
                      Khách Hàng Cá Nhân / Gia Đình Đặt Sỉ
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                  <div className="space-y-1">
                    <label className="font-label-md text-label-md text-primary uppercase block">
                      {customerType === 'BUSINESS' ? 'Tên Doanh Nghiệp / Tập Đoàn *' : 'Tên Nhóm / Gia Đình (Tùy chọn)'}
                    </label>
                    <input
                      className="w-full px-space-md py-2.5 bg-surface-container-low text-primary rounded-[0.125rem] font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-secondary aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-error"
                      name="companyName"
                      required={customerType === 'BUSINESS'}
                      placeholder={customerType === 'BUSINESS' ? 'Công ty TNHH...' : 'Gia đình / Bạn bè...'}
                      type="text"
                    />
                  </div>
                  {customerType === 'BUSINESS' ? (
                    <div className="space-y-1">
                      <label className="font-label-md text-label-md text-primary uppercase block">
                        Mã Số Thuế (Xuất VAT) *
                      </label>
                      <input
                        className="w-full px-space-md py-2.5 bg-surface-container-low text-primary rounded-[0.125rem] font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-secondary aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-error"
                        name="taxCode"
                        inputMode="numeric"
                        maxLength={14}
                        placeholder="0123456789 hoặc 0123456789-001"
                        required
                        type="text"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="font-label-md text-label-md text-primary uppercase block">
                        Phân Loại Đặt Hàng
                      </label>
                      <input
                        className="w-full px-space-md py-2.5 bg-surface-container-low text-primary rounded-[0.125rem] font-body-md text-body-md focus:outline-none"
                        name="contactPosition"
                        defaultValue="Khách hàng cá nhân"
                        type="text"
                        readOnly
                      />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                  <div className="space-y-1">
                    <label className="font-label-md text-label-md text-primary uppercase block">
                      {customerType === 'BUSINESS' ? 'Người Phụ Trách Thu Mua *' : 'Họ và Tên Khách Hàng *'}
                    </label>
                    <input
                      className="w-full px-space-md py-2.5 bg-surface-container-low text-primary rounded-[0.125rem] font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-secondary aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-error"
                      name="contactName"
                      required
                      type="text"
                    />
                  </div>
                  {customerType === 'BUSINESS' ? (
                    <div className="space-y-1">
                      <label className="font-label-md text-label-md text-primary uppercase block">
                        Chức Vụ / Phòng Ban *
                      </label>
                      <input
                        className="w-full px-space-md py-2.5 bg-surface-container-low text-primary rounded-[0.125rem] font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-secondary aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-error"
                        name="contactPosition"
                        placeholder="Trưởng phòng thu mua, HR..."
                        required
                        type="text"
                      />
                    </div>
                  ) : null}
                </div>{' '}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                  {' '}
                  <div className="space-y-1">
                    {' '}
                    <label className="font-label-md text-label-md text-primary uppercase block">
                      Số Điện Thoại / Zalo Nhận Báo Giá *
                    </label>{' '}
                    <input
                      className="w-full px-space-md py-2.5 bg-surface-container-low text-primary rounded-[0.125rem] font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-secondary aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-error"
                      name="contactPhone"
                      inputMode="tel"
                      maxLength={11}
                      placeholder="0901234567"
                      required
                      type="tel"
                    />{' '}
                  </div>{' '}
                  <div className="space-y-1">
                    {' '}
                    <label className="font-label-md text-label-md text-primary uppercase block">
                      Email Doanh Nghiệp *
                    </label>{' '}
                    <input
                      className="w-full px-space-md py-2.5 bg-surface-container-low text-primary rounded-[0.125rem] font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-secondary aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-error"
                      name="contactEmail"
                      required
                      type="email"
                    />{' '}
                  </div>{' '}
                </div>{' '}
                <ProviderProductPicker catalog={catalog} draft={draft} onChange={setDraft} named />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                  {' '}
                  <div className="space-y-1">
                    {' '}
                    <label className="font-label-md text-label-md text-primary uppercase block">
                      Dự Kiến Ngày Nhận Hàng *
                    </label>{' '}
                    <input
                      className="w-full px-space-md py-2.5 bg-surface-container-low text-primary rounded-[0.125rem] font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-secondary aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-error"
                      name="expectedDeliveryDate"
                      min={earliestDeliveryDate || undefined}
                      value={expectedDeliveryDate}
                      onChange={(event) => { setExpectedDeliveryDate(event.target.value); setDateTouched(true) }}
                      disabled={!earliestDeliveryDate || deliveryEstimate.loading}
                      required
                      type="date"
                    />{' '}
                    <p className="font-body-sm text-[11px] text-on-surface-variant">
                      {deliveryEstimate.loading ? 'Đang tính ngày nhận theo suất nướng…'
                        : deliveryEstimate.error ? deliveryEstimate.error
                          : estimate ? `${draft.quantity} hộp × ${draft.cakesPerBox} bánh = ${estimate.cakeQuantity} bánh; cần ${estimate.productionDays} ngày nướng. Sớm nhất giao ${formatDate(estimate.earliestDeliveryDate)}${draft.providerId ? '.' : ' theo xưởng có lịch phù hợp; ngày giao từng xưởng có thể khác.'}`
                            : 'Nhập số hộp và số bánh mỗi hộp để tính ngày nhận.'}
                    </p>
                  </div>{' '}
                  <div className="space-y-1">
                    {' '}
                    <label className="font-label-md text-label-md text-primary uppercase block">
                      Số lượng hộp cần báo giá *
                    </label>{' '}
                    <input className="w-full px-space-md py-2.5 bg-surface-container-low text-primary rounded-[0.125rem] font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-secondary aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-error"
                      name="requestedQuantity" type="number" min={RFQ_MIN_QUANTITY} required
                      value={draft.quantity} onChange={(e) => setDraft({ ...draft, quantity: Number(e.target.value) })} />{' '}
                  </div>{' '}
                  <div className="space-y-1">
                    <label className="font-label-md text-label-md text-primary uppercase block">Số bánh trong mỗi hộp *</label>
                    <input className="w-full px-space-md py-2.5 bg-surface-container-low text-primary rounded-[0.125rem] font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-secondary"
                      name="cakesPerBox" type="number" min={1} max={100} required
                      value={draft.cakesPerBox} onChange={(e) => setDraft({ ...draft, cakesPerBox: Number(e.target.value) })} />
                  </div>{' '}
                </div>{' '}
                <div className="space-y-space-sm pt-space-xs">
                  {' '}
                  <label className="font-label-md text-label-md text-primary uppercase block" htmlFor="rfq-budget">
                    Ngân sách dự kiến (không bắt buộc)
                  </label>{' '}
                  <input id="rfq-budget" name="expectedBudget" type="number" min="0"
                    className="w-full px-space-md py-2.5 bg-surface-container-low text-primary rounded-[0.125rem] font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-secondary aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-error" />{' '}
                </div>{' '}
                <div className="space-y-space-xs pt-space-xs">
                  <label className="font-label-md text-label-md text-primary uppercase block" htmlFor="rfq-description">
                    Yêu cầu về mẫu hộp, in logo hoặc lịch giao
                  </label>
                  <textarea id="rfq-description" name="description" rows={3}
                    className="w-full px-space-md py-2.5 bg-surface-container-low text-primary rounded-[0.125rem] font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-secondary aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-error" />
                </div>
                <div className="pt-space-md">
                  {' '}
                  <button
                    className="w-full py-4 bg-secondary text-on-secondary rounded-[0.125rem] font-label-lg text-label-lg tracking-widest uppercase hover:bg-primary-container hover:text-champagne-light transition-all shadow-md flex items-center justify-center gap-space-xs"
                    type="submit"
                    disabled={!earliestDeliveryDate || deliveryEstimate.loading || !!deliveryEstimate.error}
                  >
                    {' '}
                    <Icon name="verified" className="text-[20px]" aria-hidden />{' '}
                    <span>Gửi yêu cầu báo giá</span>{' '}
                  </button>{' '}
                  <p className="font-body-sm text-[11px] text-center text-on-surface-variant mt-2">
                    {' Thông tin của Quý Khách được bảo mật theo tiêu chuẩn ngoại giao của Nguyệt Viên Đài. '}
                  </p>{' '}
                </div>{' '}
              </form>{' '}
            </div>{' '}
          </div>{' '}
        </section>{' '}

      </div>
    </>
  )
}
