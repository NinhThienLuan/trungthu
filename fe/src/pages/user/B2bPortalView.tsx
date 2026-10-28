// Tự sinh từ bản thiết kế Stitch — giữ nguyên nội dung. Sửa logic ở trang bọc ngoài.
import { Icon } from '../../components/Icon'
import { MIN_LEAD_DAYS } from '../../constants'
import { addDays, toIsoDate } from '../../lib/format'

export function B2bPortalView() {
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
                  Đại Nguyện Giao Thảo • Mùa Trăng Ất Tỵ 2025
                </span>{' '}
              </div>{' '}
              <h1 className="font-headline-xl text-headline-xl lg:text-[52px] lg:leading-[62px] text-champagne-light tracking-tight">
                {' Giải Pháp Quà Tặng Doanh Nghiệp & Ngoại Giao Mùa Trăng 2025 '}
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
                  ' Điều chỉnh quy mô số lượng và tùy chọn dòng bánh hoàng gia để nhận ngay mức giá chiết khấu dự kiến kèm quyền lợi đi kèm. '
                }
              </p>{' '}
            </div>{' '}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
              {' '}
              <div className="lg:col-span-7 bg-surface-container-lowest p-space-lg lg:p-space-xl rounded-[0.125rem] shadow-md space-y-space-lg">
                {' '}
                <div className="space-y-space-sm">
                  {' '}
                  <div className="flex items-center justify-between">
                    {' '}
                    <label className="font-label-lg text-label-lg text-primary" htmlFor="quantity-slider">
                      {' 1. Số lượng hộp quà dự kiến: '}
                    </label>{' '}
                    <div className="flex items-center gap-2">
                      {' '}
                      <input
                        className="w-24 text-right px-2 py-1 bg-surface-container-low text-primary font-headline-sm text-headline-sm rounded-[0.125rem] focus:outline-none focus:ring-1 focus:ring-secondary"
                        id="quantity-number"
                        max={5000}
                        min={50}
                        step={10}
                        type="number"
                        defaultValue="350"
                      />{' '}
                      <span className="font-label-md text-label-md text-on-surface-variant">hộp</span>{' '}
                    </div>{' '}
                  </div>{' '}
                  <input
                    className="w-full h-2 bg-surface-container-high rounded-[0.25rem] appearance-none cursor-pointer accent-secondary"
                    id="quantity-slider"
                    max={5000}
                    min={50}
                    step={25}
                    type="range"
                    defaultValue="350"
                  />{' '}
                  <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
                    {' '}
                    <span>50 hộp (-15%)</span> <span>200 hộp (-22%)</span> <span>500 hộp (-30%)</span>{' '}
                    <span>1.000+ hộp (-38%)</span>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="space-y-space-sm">
                  {' '}
                  <label className="font-label-lg text-label-lg text-primary block">
                    2. Chọn dòng bảo hộp mục tiêu:
                  </label>{' '}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm" id="product-selector-group">
                    {' '}
                    <label className="relative p-space-md bg-surface-container-low rounded-[0.125rem] cursor-pointer transition-all hover:bg-champagne-light/30 flex flex-col justify-between">
                      {' '}
                      <input
                        defaultChecked
                        className="sr-only product-radio"
                        name="box-tier"
                        type="radio"
                        value="850000"
                        readOnly
                      />{' '}
                      <div className="space-y-1">
                        {' '}
                        <span className="font-label-sm text-[10px] text-secondary uppercase tracking-widest block">
                          4 Bánh Cao Cấp
                        </span>{' '}
                        <h4 className="font-headline-sm text-[16px] text-primary">Ngự Viên Hoàng Kim</h4>{' '}
                        <p className="font-body-sm text-[12px] text-on-surface-variant">
                          Nhân sen nhuyễn, xá xíu sò điệp, lạp xưởng ngũ hạt.
                        </p>{' '}
                      </div>{' '}
                      <div className="mt-space-md pt-space-xs flex items-baseline justify-between">
                        {' '}
                        <span className="font-label-md text-label-md text-primary font-bold">850.000 đ</span>{' '}
                        <Icon name="check_circle" className="text-secondary text-[18px] check-icon" aria-hidden />{' '}
                      </div>{' '}
                    </label>{' '}
                    <label className="relative p-space-md bg-surface-container-low rounded-[0.125rem] cursor-pointer transition-all hover:bg-champagne-light/30 flex flex-col justify-between">
                      {' '}
                      <input
                        className="sr-only product-radio"
                        name="box-tier"
                        type="radio"
                        value="1350000"
                        readOnly
                      />{' '}
                      <div className="space-y-1">
                        {' '}
                        <span className="font-label-sm text-[10px] text-secondary uppercase tracking-widest block">
                          6 Bánh & Trà Cung Đình
                        </span>{' '}
                        <h4 className="font-headline-sm text-[16px] text-primary">Bát Bửu Cung Đình</h4>{' '}
                        <p className="font-body-sm text-[12px] text-on-surface-variant">
                          Bào ngư sốt cay, vi cá, đông trùng hạ thảo kèm trà Shan Tuyết.
                        </p>{' '}
                      </div>{' '}
                      <div className="mt-space-md pt-space-xs flex items-baseline justify-between">
                        {' '}
                        <span className="font-label-md text-label-md text-primary font-bold">1.350.000 đ</span>{' '}
                        <Icon
                          name="radio_button_unchecked"
                          className="text-secondary text-[18px] check-icon opacity-30"
                          aria-hidden
                        />{' '}
                      </div>{' '}
                    </label>{' '}
                    <label className="relative p-space-md bg-surface-container-low rounded-[0.125rem] cursor-pointer transition-all hover:bg-champagne-light/30 flex flex-col justify-between">
                      {' '}
                      <input
                        className="sr-only product-radio"
                        name="box-tier"
                        type="radio"
                        value="2150000"
                        readOnly
                      />{' '}
                      <div className="space-y-1">
                        {' '}
                        <span className="font-label-sm text-[10px] text-secondary uppercase tracking-widest block">
                          Gỗ Khảm Trai Bespoke
                        </span>{' '}
                        <h4 className="font-headline-sm text-[16px] text-primary">Tự Phối Mix & Match</h4>{' '}
                        <p className="font-body-sm text-[12px] text-on-surface-variant">
                          Hộp gỗ sơn mài, tuyển chọn 8 bánh yến sào thượng hạng.
                        </p>{' '}
                      </div>{' '}
                      <div className="mt-space-md pt-space-xs flex items-baseline justify-between">
                        {' '}
                        <span className="font-label-md text-label-md text-primary font-bold">2.150.000 đ</span>{' '}
                        <Icon
                          name="radio_button_unchecked"
                          className="text-secondary text-[18px] check-icon opacity-30"
                          aria-hidden
                        />{' '}
                      </div>{' '}
                    </label>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="space-y-space-sm">
                  {' '}
                  <label className="font-label-lg text-label-lg text-primary block">
                    3. Dịch vụ gia tăng nhận diện:
                  </label>{' '}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                    {' '}
                    <label className="flex items-center gap-space-xs p-space-sm bg-surface-container-low rounded-[0.125rem] cursor-pointer hover:bg-surface-container">
                      {' '}
                      <input
                        className="rounded-[0.125rem] accent-secondary w-4 h-4"
                        id="addon-laser"
                        type="checkbox"
                      />{' '}
                      <span className="font-body-sm text-body-sm text-on-surface">Khắc kim nhũ logo</span>{' '}
                    </label>{' '}
                    <label className="flex items-center gap-space-xs p-space-sm bg-surface-container-low rounded-[0.125rem] cursor-pointer hover:bg-surface-container">
                      {' '}
                      <input
                        className="rounded-[0.125rem] accent-secondary w-4 h-4"
                        id="addon-multidrop"
                        type="checkbox"
                      />{' '}
                      <span className="font-body-sm text-body-sm text-on-surface">Tách nhiều chi nhánh</span>{' '}
                    </label>{' '}
                    <label className="flex items-center gap-space-xs p-space-sm bg-surface-container-low rounded-[0.125rem] cursor-pointer hover:bg-surface-container">
                      {' '}
                      <input
                        className="rounded-[0.125rem] accent-secondary w-4 h-4"
                        id="addon-luxurybag"
                        type="checkbox"
                      />{' '}
                      <span className="font-body-sm text-body-sm text-on-surface">Túi quà ngoại giao</span>{' '}
                    </label>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
              <div className="lg:col-span-5 bg-primary-container text-surface p-space-lg lg:p-space-xl rounded-[0.125rem] shadow-xl space-y-space-lg relative overflow-hidden">
                {' '}
                <div className="absolute right-0 top-0 w-48 h-48 bg-secondary-container/10 rounded-[0.75rem] blur-2xl pointer-events-none"></div>{' '}
                <div className="space-y-1">
                  {' '}
                  <span className="font-label-sm text-label-sm text-secondary-fixed uppercase tracking-widest block">
                    Bảng Tổng Hợp Dự Toán B2B
                  </span>{' '}
                  <h3 className="font-headline-md text-headline-md text-champagne-light">Bản Tính Khái Toán Nhanh</h3>{' '}
                </div>{' '}
                <div className="space-y-space-sm pt-space-xs font-body-md text-body-md">
                  {' '}
                  <div className="flex justify-between items-center py-2 text-on-primary-container">
                    {' '}
                    <span>Đơn giá niêm yết:</span>{' '}
                    <span className="font-label-md text-label-md text-champagne-light" id="display-unit-price">
                      850.000 đ
                    </span>{' '}
                  </div>{' '}
                  <div className="flex justify-between items-center py-2 text-on-primary-container">
                    {' '}
                    <span>Mức chiết khấu áp dụng:</span>{' '}
                    <span
                      className="font-label-md text-label-md text-secondary-fixed font-bold"
                      id="display-discount-percent"
                    >
                      -22%
                    </span>{' '}
                  </div>{' '}
                  <div className="flex justify-between items-center py-2 text-on-primary-container">
                    {' '}
                    <span>Tổng giá niêm yết:</span>{' '}
                    <span className="font-body-md text-body-md text-surface" id="display-subtotal">
                      297.500.000 đ
                    </span>{' '}
                  </div>{' '}
                  <div className="flex justify-between items-center py-2 text-on-primary-container">
                    {' '}
                    <span>Ngân sách tiết kiệm được:</span>{' '}
                    <span className="font-label-md text-label-md text-secondary-fixed font-bold" id="display-saved">
                      -65.450.000 đ
                    </span>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="bg-primary/70 p-space-md rounded-[0.125rem] space-y-1">
                  {' '}
                  <span className="font-label-sm text-label-sm text-on-primary-container uppercase tracking-wider block">
                    Tổng Ngân Sách Thanh Toán Dự Kiến:
                  </span>{' '}
                  <div className="flex items-baseline justify-between">
                    {' '}
                    <span
                      className="font-headline-lg text-headline-lg text-champagne-light font-bold"
                      id="display-final-total"
                    >
                      232.050.000 đ
                    </span>{' '}
                  </div>{' '}
                  <p className="font-body-sm text-[11px] text-on-primary-container pt-1">
                    {' Đơn giá trung bình: '}
                    <span className="text-secondary-fixed font-semibold" id="display-avg-unit">
                      663.000 đ / hộp
                    </span>
                    {' (Đã bao gồm VAT & Vận chuyển) '}
                  </p>{' '}
                </div>{' '}
                <div className="pt-space-xs space-y-space-sm">
                  {' '}
                  <a
                    className="w-full inline-flex items-center justify-center gap-space-xs py-3.5 bg-secondary text-on-secondary rounded-[0.125rem] font-label-md text-label-md tracking-wider uppercase hover:bg-secondary-fixed hover:text-on-secondary-fixed transition-colors shadow-md"
                    href="#rfq-section"
                  >
                    {' '}
                    <Icon name="send" className="text-[18px]" aria-hidden />{' '}
                    <span>Xuất Báo Giá Kèm File Dự Toán Này</span>{' '}
                  </a>{' '}
                  <p className="font-body-sm text-[11px] text-center text-on-primary-container">
                    {' Báo giá chính thức đóng dấu đỏ sẽ được gửi qua Email/Zalo trong 2h. '}
                  </p>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
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
                {' '}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                  {' '}
                  <div className="space-y-1">
                    {' '}
                    <label className="font-label-md text-label-md text-primary uppercase block">
                      Tên Doanh Nghiệp / Tập Đoàn *
                    </label>{' '}
                    <input
                      className="w-full px-space-md py-2.5 bg-surface-container-low text-primary rounded-[0.125rem] font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-secondary aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-error"
                      name="companyName"
                      required
                      type="text"
                    />{' '}
                  </div>{' '}
                  <div className="space-y-1">
                    {' '}
                    <label className="font-label-md text-label-md text-primary uppercase block">
                      Mã Số Thuế (Xuất VAT) *
                    </label>{' '}
                    <input
                      className="w-full px-space-md py-2.5 bg-surface-container-low text-primary rounded-[0.125rem] font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-secondary aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-error"
                      name="taxCode"
                      inputMode="numeric"
                      maxLength={14}
                      placeholder="0123456789 hoặc 0123456789-001"
                      required
                      type="text"
                    />{' '}
                  </div>{' '}
                </div>{' '}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                  {' '}
                  <div className="space-y-1">
                    {' '}
                    <label className="font-label-md text-label-md text-primary uppercase block">
                      Người Phụ Trách Thu Mua *
                    </label>{' '}
                    <input
                      className="w-full px-space-md py-2.5 bg-surface-container-low text-primary rounded-[0.125rem] font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-secondary aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-error"
                      name="contactName"
                      required
                      type="text"
                    />{' '}
                  </div>{' '}
                  <div className="space-y-1">
                    {' '}
                    <label className="font-label-md text-label-md text-primary uppercase block">
                      Chức Vụ / Phòng Ban
                    </label>{' '}
                    <input
                      className="w-full px-space-md py-2.5 bg-surface-container-low text-primary rounded-[0.125rem] font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-secondary aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-error"
                      name="contactPosition"
                      required
                      type="text"
                    />{' '}
                  </div>{' '}
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
                      min={toIsoDate(addDays(new Date(), MIN_LEAD_DAYS))}
                      required
                      type="date"
                    />{' '}
                  </div>{' '}
                  <div className="space-y-1">
                    {' '}
                    <label className="font-label-md text-label-md text-primary uppercase block">
                      Số lượng hộp cần báo giá *
                    </label>{' '}
                    <input className="w-full px-space-md py-2.5 bg-surface-container-low text-primary rounded-[0.125rem] font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-secondary aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-error"
                      name="requestedQuantity" type="number" min="20" defaultValue="20" required />{' '}
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
        <section className="bg-surface py-space-xl lg:py-24 px-margin-mobile lg:px-margin overflow-hidden">
          {' '}
          <div className="max-w-[1320px] mx-auto space-y-space-xl">
            {' '}
            <div className="text-center max-w-3xl mx-auto space-y-space-xs">
              {' '}
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest block">
                Bảo Chứng Tín Nhiệm
              </span>{' '}
              <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                Đối Tác Chiến Lược & Đánh Giá Cấp Cao
              </h2>{' '}
              <p className="font-body-md text-body-md text-on-surface-variant">
                {
                  ' Niềm tự hào đồng hành cùng các định chế tài chính, tập đoàn công nghệ và ngoại giao đoàn hàng đầu Việt Nam qua từng mùa trăng viên mãn. '
                }
              </p>{' '}
            </div>{' '}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-space-md items-center justify-center opacity-85">
              {' '}
              <div className="p-space-md bg-surface-container-low rounded-[0.125rem] text-center hover:bg-champagne-light/30 transition-all flex items-center justify-center h-20">
                {' '}
                <span className="font-headline-sm text-[18px] text-primary font-bold tracking-wider">
                  VIETCOMBANK
                </span>{' '}
              </div>{' '}
              <div className="p-space-md bg-surface-container-low rounded-[0.125rem] text-center hover:bg-champagne-light/30 transition-all flex items-center justify-center h-20">
                {' '}
                <span className="font-headline-sm text-[18px] text-primary font-bold tracking-wider">
                  VINGROUP
                </span>{' '}
              </div>{' '}
              <div className="p-space-md bg-surface-container-low rounded-[0.125rem] text-center hover:bg-champagne-light/30 transition-all flex items-center justify-center h-20">
                {' '}
                <span className="font-headline-sm text-[18px] text-primary font-bold tracking-wider">
                  TECHCOMBANK
                </span>{' '}
              </div>{' '}
              <div className="p-space-md bg-surface-container-low rounded-[0.125rem] text-center hover:bg-champagne-light/30 transition-all flex items-center justify-center h-20">
                {' '}
                <span className="font-headline-sm text-[18px] text-primary font-bold tracking-wider">VIETTEL</span>{' '}
              </div>{' '}
              <div className="p-space-md bg-surface-container-low rounded-[0.125rem] text-center hover:bg-champagne-light/30 transition-all flex items-center justify-center h-20">
                {' '}
                <span className="font-headline-sm text-[18px] text-primary font-bold tracking-wider">
                  FPT GROUP
                </span>{' '}
              </div>{' '}
              <div className="p-space-md bg-surface-container-low rounded-[0.125rem] text-center hover:bg-champagne-light/30 transition-all flex items-center justify-center h-20">
                {' '}
                <span className="font-headline-sm text-[18px] text-primary font-bold tracking-wider">
                  SUN GROUP
                </span>{' '}
              </div>{' '}
            </div>{' '}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
              {' '}
              <div className="bg-surface-container-lowest p-space-lg rounded-[0.125rem] shadow-sm flex flex-col justify-between space-y-space-md">
                {' '}
                <div className="space-y-space-sm">
                  {' '}
                  <div className="flex items-center text-secondary">
                    {' '}
                    <Icon name="star" className="text-[18px]" aria-hidden />{' '}
                    <Icon name="star" className="text-[18px]" aria-hidden />{' '}
                    <Icon name="star" className="text-[18px]" aria-hidden />{' '}
                    <Icon name="star" className="text-[18px]" aria-hidden />{' '}
                    <Icon name="star" className="text-[18px]" aria-hidden />{' '}
                  </div>{' '}
                  <p className="font-body-md text-body-md text-on-surface-variant italic leading-relaxed">
                    {
                      ' “Khối Khách hàng Ưu tiên của chúng tôi yêu cầu độ chỉn chu khắt khe nhất về nhận diện thương hiệu. Nguyệt Viên Đài đã xử lý hoàn hảo việc ép kim logo trên lụa gấm và giao đồng bộ 3.200 hộp đến 63 chi nhánh trong vòng đúng 36 giờ bằng chuỗi lạnh chuẩn xác.” '
                    }
                  </p>{' '}
                </div>{' '}
                <div className="pt-space-sm flex items-center gap-space-sm">
                  {' '}
                  <div className="w-10 h-10 rounded-[0.75rem] bg-champagne-light flex items-center justify-center text-primary font-bold">
                    {' VC '}
                  </div>{' '}
                  <div>
                    {' '}
                    <p className="font-label-md text-label-md text-primary font-bold">Bà Nguyễn Mai Phương</p>{' '}
                    <p className="font-body-sm text-[11px] text-on-surface-variant">
                      Giám Đốc Khối Dịch Vụ Khách Hàng VIP - Khối Ngân Hàng TMCP
                    </p>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
              <div className="bg-surface-container-lowest p-space-lg rounded-[0.125rem] shadow-sm flex flex-col justify-between space-y-space-md">
                {' '}
                <div className="space-y-space-sm">
                  {' '}
                  <div className="flex items-center text-secondary">
                    {' '}
                    <Icon name="star" className="text-[18px]" aria-hidden />{' '}
                    <Icon name="star" className="text-[18px]" aria-hidden />{' '}
                    <Icon name="star" className="text-[18px]" aria-hidden />{' '}
                    <Icon name="star" className="text-[18px]" aria-hidden />{' '}
                    <Icon name="star" className="text-[18px]" aria-hidden />{' '}
                  </div>{' '}
                  <p className="font-body-md text-body-md text-on-surface-variant italic leading-relaxed">
                    {
                      ' “Hương vị nhân mộc truyền thống không bị ngấy gắt, công thức yến sào đông trùng được các đối tác Nhật Bản và Hàn Quốc của chúng tôi đánh giá rất cao. Hồ sơ kiểm nghiệm ISO 22000 và quy trình xuất hóa đơn VAT trong ngày giúp ban mua sắm quyết toán thanh toán rất nhanh.” '
                    }
                  </p>{' '}
                </div>{' '}
                <div className="pt-space-sm flex items-center gap-space-sm">
                  {' '}
                  <div className="w-10 h-10 rounded-[0.75rem] bg-champagne-light flex items-center justify-center text-primary font-bold">
                    {' TT '}
                  </div>{' '}
                  <div>
                    {' '}
                    <p className="font-label-md text-label-md text-primary font-bold">Ông Trần Quốc Tuấn</p>{' '}
                    <p className="font-body-sm text-[11px] text-on-surface-variant">
                      Trưởng Ban Mua Sắm & Hậu Cần Tập Đoàn Viễn Thông
                    </p>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
              <div className="bg-surface-container-lowest p-space-lg rounded-[0.125rem] shadow-sm flex flex-col justify-between space-y-space-md">
                {' '}
                <div className="space-y-space-sm">
                  {' '}
                  <div className="flex items-center text-secondary">
                    {' '}
                    <Icon name="star" className="text-[18px]" aria-hidden />{' '}
                    <Icon name="star" className="text-[18px]" aria-hidden />{' '}
                    <Icon name="star" className="text-[18px]" aria-hidden />{' '}
                    <Icon name="star" className="text-[18px]" aria-hidden />{' '}
                    <Icon name="star" className="text-[18px]" aria-hidden />{' '}
                  </div>{' '}
                  <p className="font-body-md text-body-md text-on-surface-variant italic leading-relaxed">
                    {
                      ' “Chính sách bảo hiểm rủi ro trong 2 giờ và việc cử nhân sự trực tiếp phối hợp cùng phòng Hành chính giúp chúng tôi hoàn toàn an tâm. Đây là năm thứ tư liên tiếp chúng tôi tín nhiệm Nguyệt Viên Đài làm đối tác đại tiệc Trung thu.” '
                    }
                  </p>{' '}
                </div>{' '}
                <div className="pt-space-sm flex items-center gap-space-sm">
                  {' '}
                  <div className="w-10 h-10 rounded-[0.75rem] bg-champagne-light flex items-center justify-center text-primary font-bold">
                    {' LH '}
                  </div>{' '}
                  <div>
                    {' '}
                    <p className="font-label-md text-label-md text-primary font-bold">Bà Lê Thu Hương</p>{' '}
                    <p className="font-body-sm text-[11px] text-on-surface-variant">
                      Phó Giám Đốc Nhân Sự - Tập Đoàn Công Nghệ Quốc Tế
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
