// Trang bộ sưu tập: markup chuyển nguyên từ Stitch, lưới sản phẩm + phân trang chạy theo dữ liệu.
import { useSearchParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { CatalogCard } from '../components/CatalogCard'
import { StitchPagination } from '../components/StitchPagination'
import { ErrorState, Spinner } from '../components/ui/States'
import { productApi } from '../apis/products'
import { useApi } from '../hooks/useApi'

const PAGE_SIZE = 6

export function CatalogPage() {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') ?? 0)
  const { data, loading, error, reload } = useApi(() => productApi.list({ page, size: PAGE_SIZE }), [page])
  const setPage = (p: number) => {
    setParams(p ? { page: String(p) } : {})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const from = data && data.totalElements ? page * PAGE_SIZE + 1 : 0
  const to = data ? Math.min((page + 1) * PAGE_SIZE, data.totalElements) : 0
  const rangeLabel = `${from} - ${to}`

  if (loading && !data) return <Spinner />
  if (error) return <div className="max-w-[1320px] mx-auto px-margin-mobile lg:px-margin py-space-xl"><ErrorState message={error} onRetry={reload} /></div>

  return (
    <>
      <div className="flex flex-col w-full">
        {' '}
        <section className="relative w-full bg-primary overflow-hidden">
          {' '}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#d6a75c_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>{' '}
          <div className="relative max-w-[1320px] mx-auto px-margin-mobile lg:px-margin py-space-xl lg:py-20 flex flex-col md:flex-row md:items-end justify-between gap-space-lg">
            {' '}
            <div className="space-y-space-sm max-w-2xl">
              {' '}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[0.125rem] bg-secondary-container/20 text-secondary-fixed">
                {' '}
                <Icon name="stars" className="text-[15px]" filled aria-hidden />{' '}
                <span className="font-label-sm text-label-sm tracking-widest uppercase">
                  Mùa Trăng 2025 • Đại Tuyển Tuyển Chọn
                </span>{' '}
              </div>{' '}
              <h1 className="font-headline-xl text-headline-xl text-champagne-light tracking-tight">
                {' Tuyển Tập Ngự Thiện Hoàng Kim '}
              </h1>{' '}
              <p className="font-body-lg text-body-lg text-on-primary-container max-w-xl">
                {
                  ' Quy tụ tinh hoa đúc kết từ những lò bánh di sản trăm năm khắp ba miền: Hải Phòng, Hà Nội, Hội An và Gia Định. Cam kết nướng tươi mới trong ngày và bảo quản chuỗi lạnh ngặt nghèo. '
                }
              </p>{' '}
            </div>{' '}
            <div className="flex flex-wrap items-center gap-space-md">
              {' '}
              <div className="px-space-md py-space-sm rounded-[0.125rem] bg-primary-container text-champagne-light shadow-sm">
                {' '}
                <div className="flex items-center gap-2 text-secondary-fixed mb-1">
                  {' '}
                  <Icon name="ac_unit" className="text-[18px]" aria-hidden />{' '}
                  <span className="font-label-sm text-label-sm uppercase tracking-wider">Chuỗi Lạnh Tiêu Chuẩn</span>{' '}
                </div>{' '}
                <span className="font-headline-sm text-headline-sm block">18°C – 22°C</span>{' '}
                <span className="font-body-sm text-body-sm text-on-primary-container">Độ ẩm tương đối 55%</span>{' '}
              </div>{' '}
              <div className="px-space-md py-space-sm rounded-[0.125rem] bg-primary-container text-champagne-light shadow-sm">
                {' '}
                <div className="flex items-center gap-2 text-secondary-fixed mb-1">
                  {' '}
                  <Icon name="workspace_premium" className="text-[18px]" aria-hidden />{' '}
                  <span className="font-label-sm text-label-sm uppercase tracking-wider">Chứng Nhận Hoàng Triều</span>{' '}
                </div>{' '}
                <span className="font-headline-sm text-headline-sm block">100% VSATTP</span>{' '}
                <span className="font-body-sm text-body-sm text-on-primary-container">
                  Kiểm định lô hàng số 2025-QG
                </span>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
        </section>{' '}
        <div className="sticky top-20 z-30 w-full bg-surface-container-low shadow-sm">
          {' '}
          <div className="max-w-[1320px] mx-auto px-margin-mobile lg:px-margin py-3 flex flex-wrap items-center justify-between gap-4">
            {' '}
            <div className="flex items-center gap-3">
              {' '}
              <span className="font-label-md text-label-md uppercase tracking-wider text-secondary">
                Đang hiển thị:
              </span>{' '}
              <span
                className="font-label-lg text-label-lg text-primary px-2 py-0.5 rounded-[0.125rem] bg-surface-container-high"
                id="active-count-label"
              >
                {data?.totalElements ?? 0} tác phẩm cao cấp
              </span>{' '}
              <span className="hidden md:inline text-outline-variant">|</span>{' '}
              <div className="hidden md:flex items-center gap-1.5 text-tertiary-container">
                {' '}
                <span className="inline-block w-2 h-2 rounded-[0.75rem] bg-emerald-700 animate-pulse"></span>{' '}
                <span className="font-body-sm text-body-sm text-on-surface">
                  Lò nướng hoạt động liên tục lúc 04:30 sáng
                </span>{' '}
              </div>{' '}
            </div>{' '}
            <div className="flex items-center gap-4">
              {' '}
              <div className="flex items-center gap-2">
                {' '}
                <label
                  className="font-label-sm text-label-sm uppercase tracking-wider text-outline"
                  htmlFor="sort-select"
                >
                  Sắp xếp:
                </label>{' '}
                <select
                  className="bg-surface-container-lowest text-primary font-body-sm text-body-sm px-3 py-1.5 rounded-[0.125rem] shadow-sm focus:outline-none focus:ring-1 focus:ring-secondary"
                  id="sort-select"
                >
                  {' '}
                  <option value="curated">Tuyển chọn nghệ nhân đề xuất</option>{' '}
                  <option value="price-asc">Giá: Thấp đến Cao</option>{' '}
                  <option value="price-desc">Giá: Cao đến Thấp</option>{' '}
                  <option value="rating">Đánh giá cao nhất (5.0★)</option>{' '}
                  <option value="b2b-tier">Chiết khấu B2B tối ưu</option>{' '}
                </select>{' '}
              </div>{' '}
              <div className="flex items-center bg-surface-container-high p-0.5 rounded-[0.125rem]">
                {' '}
                <button
                  className="p-1 rounded-[0.125rem] text-primary hover:bg-surface-container-lowest transition-colors"
                  id="view-grid-4"
                  title="Lưới 4 cột"
                >
                  {' '}
                  <Icon name="grid_view" className="text-[20px]" aria-hidden />{' '}
                </button>{' '}
                <button
                  className="p-1 rounded-[0.125rem] text-outline hover:text-primary hover:bg-surface-container-lowest transition-colors"
                  id="view-grid-3"
                  title="Lưới 3 cột"
                >
                  {' '}
                  <Icon name="view_agenda" className="text-[20px]" aria-hidden />{' '}
                </button>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
        <div className="max-w-[1320px] mx-auto w-full px-margin-mobile lg:px-margin py-space-xl">
          {' '}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
            {' '}
            <aside className="lg:col-span-3 space-y-space-lg bg-surface-container-lowest p-space-lg rounded-[0.125rem] shadow-sm">
              {' '}
              <div className="flex items-center justify-between pb-space-sm bg-surface-container-low px-3 py-2 rounded-[0.125rem]">
                {' '}
                <div className="flex items-center gap-2 text-primary">
                  {' '}
                  <Icon name="tune" className="text-[20px]" aria-hidden />{' '}
                  <span className="font-label-lg text-label-lg uppercase tracking-wider">Bộ Lọc Tinh Hoa</span>{' '}
                </div>{' '}
                <button
                  className="text-secondary font-label-sm text-label-sm hover:underline tracking-wider uppercase"
                  id="reset-filters"
                >
                  Đặt lại
                </button>{' '}
              </div>{' '}
              <div className="space-y-space-xs">
                {' '}
                <h4 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant flex items-center gap-2">
                  {' '}
                  <Icon name="local_fire_department" className="text-[16px] text-secondary" aria-hidden />
                  {' Độ Tươi & Tiêu Chuẩn '}
                </h4>{' '}
                <div className="space-y-2 pt-1">
                  {' '}
                  <label className="flex items-center justify-between p-2 rounded-[0.125rem] bg-surface-container-low hover:bg-champagne-light/30 cursor-pointer transition-colors">
                    {' '}
                    <div className="flex items-center gap-2">
                      {' '}
                      <input
                        defaultChecked
                        className="accent-secondary h-4 w-4 rounded-[0.125rem]"
                        type="checkbox"
                      />{' '}
                      <span className="font-body-sm text-body-sm text-on-surface">Bánh nướng mới trong ngày</span>{' '}
                    </div>{' '}
                    <span className="font-label-sm text-[10px] px-1.5 py-0.5 rounded-[0.125rem] bg-secondary-container text-on-secondary-container">
                      HOT
                    </span>{' '}
                  </label>{' '}
                  <label className="flex items-center justify-between p-2 rounded-[0.125rem] bg-surface-container-low hover:bg-champagne-light/30 cursor-pointer transition-colors">
                    {' '}
                    <div className="flex items-center gap-2">
                      {' '}
                      <input
                        defaultChecked
                        className="accent-secondary h-4 w-4 rounded-[0.125rem]"
                        type="checkbox"
                      />{' '}
                      <span className="font-body-sm text-body-sm text-on-surface">Kiểm định VSATTP Cấp 1</span>{' '}
                    </div>{' '}
                    <Icon name="verified" className="text-secondary text-[16px]" aria-hidden />{' '}
                  </label>{' '}
                  <label className="flex items-center justify-between p-2 rounded-[0.125rem] bg-surface-container-low hover:bg-champagne-light/30 cursor-pointer transition-colors">
                    {' '}
                    <div className="flex items-center gap-2">
                      {' '}
                      <input className="accent-secondary h-4 w-4 rounded-[0.125rem]" type="checkbox" />{' '}
                      <span className="font-body-sm text-body-sm text-on-surface">Chuỗi nhiệt độ lạnh 18°C</span>{' '}
                    </div>{' '}
                    <Icon name="device_thermostat" className="text-outline text-[16px]" aria-hidden />{' '}
                  </label>{' '}
                </div>{' '}
              </div>{' '}
              <div className="space-y-space-xs">
                {' '}
                <h4 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant flex items-center gap-2">
                  {' '}
                  <Icon name="history_edu" className="text-[16px] text-secondary" aria-hidden />
                  {' Thương Hiệu Nghệ Nhân '}
                </h4>{' '}
                <div className="space-y-1.5 pt-1">
                  {' '}
                  <label className="flex items-center justify-between cursor-pointer py-1 px-1.5 rounded-[0.125rem] hover:bg-surface-container">
                    {' '}
                    <div className="flex items-center gap-2">
                      {' '}
                      <input
                        defaultChecked
                        className="accent-secondary h-4 w-4 rounded-[0.125rem]"
                        name="artisan"
                        type="checkbox"
                        value="dong-phuong"
                        readOnly
                      />{' '}
                      <span className="font-body-sm text-body-sm text-primary font-medium">Đông Phương Cầu Đất</span>{' '}
                    </div>{' '}
                    <span className="font-label-sm text-label-sm text-outline">Hải Phòng</span>{' '}
                  </label>{' '}
                  <label className="flex items-center justify-between cursor-pointer py-1 px-1.5 rounded-[0.125rem] hover:bg-surface-container">
                    {' '}
                    <div className="flex items-center gap-2">
                      {' '}
                      <input
                        defaultChecked
                        className="accent-secondary h-4 w-4 rounded-[0.125rem]"
                        name="artisan"
                        type="checkbox"
                        value="bao-phuong"
                        readOnly
                      />{' '}
                      <span className="font-body-sm text-body-sm text-primary font-medium">Bảo Phương Thụy Khuê</span>{' '}
                    </div>{' '}
                    <span className="font-label-sm text-label-sm text-outline">Hà Nội</span>{' '}
                  </label>{' '}
                  <label className="flex items-center justify-between cursor-pointer py-1 px-1.5 rounded-[0.125rem] hover:bg-surface-container">
                    {' '}
                    <div className="flex items-center gap-2">
                      {' '}
                      <input
                        className="accent-secondary h-4 w-4 rounded-[0.125rem]"
                        name="artisan"
                        type="checkbox"
                        value="nhu-lan"
                        readOnly
                      />{' '}
                      <span className="font-body-sm text-body-sm text-primary font-medium">Như Lan Sài Gòn</span>{' '}
                    </div>{' '}
                    <span className="font-label-sm text-label-sm text-outline">Gia Định</span>{' '}
                  </label>{' '}
                  <label className="flex items-center justify-between cursor-pointer py-1 px-1.5 rounded-[0.125rem] hover:bg-surface-container">
                    {' '}
                    <div className="flex items-center gap-2">
                      {' '}
                      <input
                        className="accent-secondary h-4 w-4 rounded-[0.125rem]"
                        name="artisan"
                        type="checkbox"
                        value="ba-dan"
                        readOnly
                      />{' '}
                      <span className="font-body-sm text-body-sm text-primary font-medium">Bà Dần Phố Cổ</span>{' '}
                    </div>{' '}
                    <span className="font-label-sm text-label-sm text-outline">Hà Nội</span>{' '}
                  </label>{' '}
                  <label className="flex items-center justify-between cursor-pointer py-1 px-1.5 rounded-[0.125rem] hover:bg-surface-container">
                    {' '}
                    <div className="flex items-center gap-2">
                      {' '}
                      <input
                        className="accent-secondary h-4 w-4 rounded-[0.125rem]"
                        name="artisan"
                        type="checkbox"
                        value="vinh-hung"
                        readOnly
                      />{' '}
                      <span className="font-body-sm text-body-sm text-primary font-medium">Vĩnh Hưng Hội An</span>{' '}
                    </div>{' '}
                    <span className="font-label-sm text-label-sm text-outline">Quảng Nam</span>{' '}
                  </label>{' '}
                </div>{' '}
              </div>{' '}
              <div className="space-y-space-xs">
                {' '}
                <h4 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant flex items-center gap-2">
                  {' '}
                  <Icon name="ramen_dining" className="text-[16px] text-secondary" aria-hidden />
                  {' Dòng Nhân Thượng Hạng '}
                </h4>{' '}
                <div className="space-y-1.5 pt-1">
                  {' '}
                  <label className="flex items-center gap-2 cursor-pointer py-1 px-1.5 rounded-[0.125rem] hover:bg-surface-container">
                    {' '}
                    <input
                      defaultChecked
                      className="accent-secondary h-4 w-4 rounded-[0.125rem]"
                      type="checkbox"
                    />{' '}
                    <span className="font-body-sm text-body-sm text-on-surface">Trứng muối Lava Hoàng Kim</span>{' '}
                  </label>{' '}
                  <label className="flex items-center gap-2 cursor-pointer py-1 px-1.5 rounded-[0.125rem] hover:bg-surface-container">
                    {' '}
                    <input
                      defaultChecked
                      className="accent-secondary h-4 w-4 rounded-[0.125rem]"
                      type="checkbox"
                    />{' '}
                    <span className="font-body-sm text-body-sm text-on-surface">Thập cẩm Bát Bửu Cổ truyền</span>{' '}
                  </label>{' '}
                  <label className="flex items-center gap-2 cursor-pointer py-1 px-1.5 rounded-[0.125rem] hover:bg-surface-container">
                    {' '}
                    <input className="accent-secondary h-4 w-4 rounded-[0.125rem]" type="checkbox" />{' '}
                    <span className="font-body-sm text-body-sm text-on-surface">Bào Ngư Vi Cá Sốt XO</span>{' '}
                  </label>{' '}
                  <label className="flex items-center gap-2 cursor-pointer py-1 px-1.5 rounded-[0.125rem] hover:bg-surface-container">
                    {' '}
                    <input className="accent-secondary h-4 w-4 rounded-[0.125rem]" type="checkbox" />{' '}
                    <span className="font-body-sm text-body-sm text-on-surface">Sen Trắng Bách Hoa Uji Matcha</span>{' '}
                  </label>{' '}
                  <label className="flex items-center gap-2 cursor-pointer py-1 px-1.5 rounded-[0.125rem] hover:bg-surface-container">
                    {' '}
                    <input className="accent-secondary h-4 w-4 rounded-[0.125rem]" type="checkbox" />{' '}
                    <span className="font-body-sm text-body-sm text-on-surface">Tổ Yến Hạt Sen Ngự Dược</span>{' '}
                  </label>{' '}
                </div>{' '}
              </div>{' '}
              <div className="space-y-space-xs">
                {' '}
                <h4 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant flex items-center gap-2">
                  {' '}
                  <Icon name="inventory_2" className="text-[16px] text-secondary" aria-hidden />
                  {' Quy Cách Hộp Quà '}
                </h4>{' '}
                <div className="grid grid-cols-1 gap-2 pt-1">
                  {' '}
                  <button className="w-full text-left p-2 rounded-[0.125rem] bg-surface-container-low hover:bg-champagne-light/40 transition-colors flex items-center justify-between">
                    {' '}
                    <span className="font-body-sm text-body-sm text-on-surface">Bánh Lẻ Thưởng Trà (1 bánh)</span>{' '}
                    <span className="font-label-sm text-label-sm text-secondary font-bold">180g-250g</span>{' '}
                  </button>{' '}
                  <button className="w-full text-left p-2 rounded-[0.125rem] bg-primary-container text-champagne-light flex items-center justify-between shadow-sm">
                    {' '}
                    <span className="font-body-sm text-body-sm font-medium">Hộp Quà Hoàng Kim (4 bánh)</span>{' '}
                    <span className="font-label-sm text-label-sm text-secondary-fixed">Phổ Biến</span>{' '}
                  </button>{' '}
                  <button className="w-full text-left p-2 rounded-[0.125rem] bg-surface-container-low hover:bg-champagne-light/40 transition-colors flex items-center justify-between">
                    {' '}
                    <span className="font-body-sm text-body-sm text-on-surface">Hộp Ngọc Thạch (6 bánh)</span>{' '}
                    <span className="font-label-sm text-label-sm text-outline">Cao Cấp</span>{' '}
                  </button>{' '}
                  <button className="w-full text-left p-2 rounded-[0.125rem] bg-surface-container-low hover:bg-champagne-light/40 transition-colors flex items-center justify-between">
                    {' '}
                    <span className="font-body-sm text-body-sm text-on-surface">
                      Rương Sơn Mài (8 bánh + Trà Cổ Thụ)
                    </span>{' '}
                    <span className="font-label-sm text-label-sm text-secondary-fixed-variant">VIP</span>{' '}
                  </button>{' '}
                </div>{' '}
              </div>{' '}
              <div className="p-3.5 rounded-[0.125rem] bg-primary text-champagne-light space-y-2">
                {' '}
                <div className="flex items-center gap-2 text-secondary-fixed">
                  {' '}
                  <Icon name="percent" className="text-[18px]" aria-hidden />{' '}
                  <span className="font-label-sm text-label-sm uppercase tracking-wider">
                    Chiết Khấu Doanh Nghiệp B2B
                  </span>{' '}
                </div>{' '}
                <p className="font-body-sm text-body-sm text-on-primary-container">
                  Chính sách đặc quyền ký duyệt trực tiếp từ nhà lò:
                </p>{' '}
                <div className="space-y-1.5 pt-1 text-body-sm font-body-sm">
                  {' '}
                  <div className="flex justify-between items-center py-1 px-2 rounded-[0.125rem] bg-primary-container">
                    {' '}
                    <span>{'Đơn > 100 Hộp'}</span> <span className="font-bold text-secondary-fixed">Giảm 20%</span>{' '}
                  </div>{' '}
                  <div className="flex justify-between items-center py-1 px-2 rounded-[0.125rem] bg-primary-container">
                    {' '}
                    <span>{'Đơn > 500 Hộp'}</span>{' '}
                    <span className="font-bold text-secondary-fixed">Giảm 35% + In Kim Logo</span>{' '}
                  </div>{' '}
                  <div className="flex justify-between items-center py-1 px-2 rounded-[0.125rem] bg-primary-container">
                    {' '}
                    <span>{'Đơn > 1000 Hộp'}</span>{' '}
                    <span className="font-bold text-secondary-fixed">Chiết Khấu Riêng & Mẫu Thử</span>{' '}
                  </div>{' '}
                </div>{' '}
                <a
                  className="block text-center mt-2 py-2 px-3 rounded-[0.125rem] bg-secondary text-on-secondary font-label-md text-label-md uppercase tracking-wider hover:bg-secondary-container hover:text-on-secondary-container transition-colors"
                  data-path="bao-gia-b2b"
                  href="#"
                >
                  {' Tải Catalogue Báo Giá B2B '}
                </a>{' '}
              </div>{' '}
            </aside>{' '}
            <section className="lg:col-span-9 space-y-space-lg">
              {' '}
              <div className="flex flex-wrap items-center gap-2 pb-2">
                {' '}
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                  Đang áp dụng:
                </span>{' '}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[0.125rem] bg-champagne-light text-primary font-body-sm text-body-sm">
                  {' Đông Phương Cầu Đất '}
                  <button className="hover:text-error">
                    <Icon name="close" className="text-[14px]" aria-hidden />
                  </button>{' '}
                </span>{' '}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[0.125rem] bg-champagne-light text-primary font-body-sm text-body-sm">
                  {' Bảo Phương Thụy Khuê '}
                  <button className="hover:text-error">
                    <Icon name="close" className="text-[14px]" aria-hidden />
                  </button>{' '}
                </span>{' '}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[0.125rem] bg-secondary-container/50 text-on-secondary-container font-body-sm text-body-sm font-medium">
                  {' '}
                  <Icon name="search_off" className="text-[14px]" aria-hidden />
                  {' Ra lò hôm nay '}
                  <button className="hover:text-error">
                    <Icon name="close" className="text-[14px]" aria-hidden />
                  </button>{' '}
                </span>{' '}
                <button className="text-secondary hover:text-secondary-fixed-variant font-label-sm text-label-sm underline ml-2">
                  Xóa tất cả
                </button>{' '}
              </div>{' '}
              <div
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-space-lg transition-all duration-300"
                id="product-grid"
              >
                {' '}
                {data?.content.map((p) => (
                  <CatalogCard key={p.id} product={p} />
                ))}{' '}
              </div>{' '}
              <div className="pt-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md border-t border-border-gold-subtle">
                {' '}
                <div className="font-body-sm text-body-sm text-on-surface-variant">
                  {' Hiển thị '}
                  <span className="font-bold text-primary">{rangeLabel}</span>
                  {' của '}
                  <span className="font-bold text-primary">{data?.totalElements ?? 0}</span>
                  {' bộ tác phẩm trăng rằm 2025 '}
                </div>{' '}
                <StitchPagination page={page} totalPages={data?.totalPages ?? 1} onChange={setPage} />{' '}
              </div>{' '}
              <div className="p-space-lg rounded-[0.125rem] bg-gradient-to-r from-primary-container via-primary to-primary-container text-champagne-light shadow-lg flex flex-col lg:flex-row items-center justify-between gap-space-md">
                {' '}
                <div className="space-y-1">
                  {' '}
                  <div className="inline-flex items-center gap-2 text-secondary-fixed font-label-sm text-label-sm uppercase tracking-widest">
                    {' '}
                    <Icon name="corporate_fare" className="text-[16px]" aria-hidden />
                    {' Bộ Phận Phục Vụ Ngoại Giao & Doanh Nghiệp '}
                  </div>{' '}
                  <h4 className="font-headline-sm text-headline-sm">Cần Thiết Kế Hộp Quà & Khắc Logo Riêng?</h4>{' '}
                  <p className="font-body-sm text-body-sm text-on-primary-container max-w-xl">
                    {
                      ' Cung cấp bộ kit mẫu nếm thử tận nơi trong 24h, miễn phí khắc kim logo công ty trên thẻ mạ vàng từ 100 hộp. '
                    }
                  </p>{' '}
                </div>{' '}
                <div className="flex flex-wrap items-center gap-space-sm shrink-0">
                  {' '}
                  <a
                    className="px-space-md py-2.5 rounded-[0.125rem] bg-secondary text-on-secondary font-label-md text-label-md uppercase tracking-wider hover:bg-secondary-container hover:text-on-secondary-container transition-colors shadow-sm"
                    data-path="bao-gia-b2b"
                    href="#"
                  >
                    {' Yêu Cầu Hộp Mẫu Thử '}
                  </a>{' '}
                  <a
                    className="px-space-md py-2.5 rounded-[0.125rem] bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-champagne-light font-label-md text-label-md uppercase tracking-wider transition-colors flex items-center gap-2"
                    href="tel:18008899"
                  >
                    {' '}
                    <Icon name="call" className="text-[16px]" aria-hidden />
                    {' Hotline B2B: 1800 8899 '}
                  </a>{' '}
                </div>{' '}
              </div>{' '}
            </section>{' '}
          </div>{' '}
        </div>{' '}
      </div>
    </>
  )
}
