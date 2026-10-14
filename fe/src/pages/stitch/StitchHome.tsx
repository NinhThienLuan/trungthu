// Tự sinh từ bản thiết kế Stitch — giữ nguyên nội dung. Sửa logic ở trang bọc ngoài.
import { Icon } from '../../components/Icon'
import { HeroMotion } from '../../components/HeroMotion'

export function StitchHome() {
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {' '}
              <div className="group relative rounded-[0.125rem] bg-surface-container-lowest border border-border-gold-subtle shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden">
                {' '}
                <div className="relative h-60 w-full overflow-hidden bg-surface-container">
                  {' '}
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    data-alt="Close up photograph of a baked golden imperial molten salted egg lava mooncake split in half, runny golden yolk lava oozing out on an antique lacquered wood plate, atmospheric ambient warm golden candlelight"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhyHmtLQpkmb0X8Us__Kkf1VvlKQSI6Iq4HOb_21aC6-lWQRYagOZiBldLGVVIEfGNfMH47VzoPHMuY8ZeG2X-FfHm2Sf3brgd55s_cBw2kvcTGIDTY4RF4_YtvUT4qQQ0YtGkAm9rm4INmKWyNt4ut5NwxRZn_fBylkKBmXrVUdhGJQ0aHMkuW0-sK9wsbIrnGTjjrR7ynsLfhd9R5h3gl7iexLhlCOx2dB610GlVkcjQcplzZZf1"
                  />{' '}
                  <div className="absolute top-3 left-3 bg-primary/90 text-champagne-light border border-border-gold-subtle font-label-sm text-label-sm px-2.5 py-1 rounded-[0.125rem] uppercase tracking-wider backdrop-blur-sm">
                    Đệ Nhất Mỹ Vị
                  </div>{' '}
                </div>{' '}
                <div className="p-space-md flex flex-col gap-2">
                  {' '}
                  <h3 className="font-headline-sm text-headline-sm text-primary">Lava Trứng Muối Hoàng Kim</h3>{' '}
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                    Vỏ nướng xốp mịn bọc lấy nhân trứng muối thơm lừng, chảy tan êm mượt khi dùng cùng trà Ô Long danh
                    tiếng.
                  </p>{' '}
                  <div className="pt-2 flex items-center justify-between">
                    {' '}
                    <span className="font-label-md text-label-md text-secondary font-bold">
                      Từ 165.000đ / bánh
                    </span>{' '}
                    <a
                      className="w-8 h-8 rounded-[0.125rem] bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-champagne-light transition-colors border border-border-gold-subtle"
                      href="#"
                    >
                      {' '}
                      <Icon name="arrow_forward" className="text-[17px]" aria-hidden />{' '}
                    </a>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
              <div className="group relative rounded-[0.125rem] bg-surface-container-lowest border border-border-gold-subtle shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden">
                {' '}
                <div className="relative h-60 w-full overflow-hidden bg-surface-container">
                  {' '}
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    data-alt="Traditional Vietnamese mixed savory mooncake with roasted pork, candied melon, lotus seeds, sesame and lime leaves, garnished on an ornate royal ceramic plate with rustic wood background"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfIO7SFRrx7_6YPUhCPhmwxY5G6_2-bMqlou3538Vnq813Gn6g5lZh7A4_u0vcDZGkMulN5zjwqILIVb3VjrLA1-hgITosUR87ikj0p4nfk6lJzYppJ5A4xRa-Ytj10l8Z0j5ky9w9-cW0iGTLft-7TIlXtph9ksMtDI5YuQUzVpNfbQDDHfuRE9szqDpzSWGH8qJcOhrIal_rdJv1R1681iNFKm-nsMEoHCfi3u39p_Rx8wITup5d"
                  />{' '}
                  <div className="absolute top-3 left-3 bg-secondary text-surface-container-lowest font-label-sm text-label-sm px-2.5 py-1 rounded-[0.125rem] uppercase tracking-wider">
                    Gia Truyền
                  </div>{' '}
                </div>{' '}
                <div className="p-space-md flex flex-col gap-2">
                  {' '}
                  <h3 className="font-headline-sm text-headline-sm text-primary">Thập Cẩm Bát Bửu Cổ Truyền</h3>{' '}
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                    Đượm vị lạp xưởng Mai Quế Lộ, mứt bí giòn rụm, hạt sen Tây Hồ kết hợp lá chanh thái chỉ thơm bùi
                    thuần túy.
                  </p>{' '}
                  <div className="pt-2 flex items-center justify-between">
                    {' '}
                    <span className="font-label-md text-label-md text-secondary font-bold">
                      Từ 140.000đ / bánh
                    </span>{' '}
                    <a
                      className="w-8 h-8 rounded-[0.125rem] bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-champagne-light transition-colors border border-border-gold-subtle"
                      href="#"
                    >
                      {' '}
                      <Icon name="arrow_forward" className="text-[17px]" aria-hidden />{' '}
                    </a>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
              <div className="group relative rounded-[0.125rem] bg-surface-container-lowest border border-border-gold-subtle shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden">
                {' '}
                <div className="relative h-60 w-full overflow-hidden bg-surface-container">
                  {' '}
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    data-alt="Elegant translucent white snow skin mooncake infused with lotus seed and jasmine blossom water, dusted with fine rice flour, resting on an emerald green porcelain dish"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7JqrtN7bZXEbUTNh2Fczz5LSbgk8tNx9E9DLXZ6jyemMuaj2JppouJpMNJgRQTxnkHfqNkDUMM_G-5lQO03RHZix-Q_glHnOAbGJUkH46DaXJex6lgnhWi0KP580pY3H6Gw7nJ2dmPQDftTKDnwEdeWvPDSc7gNuB7oWoWhrY7m55nbxNpq8qEN0aO6HabDIO580idk1NQN4qz5-69vAyVzP7__aH4JXaYuhiyaexIPVJ6sAl6kUv"
                  />{' '}
                  <div className="absolute top-3 left-3 bg-tertiary-container text-champagne-light border border-border-gold-subtle font-label-sm text-label-sm px-2.5 py-1 rounded-[0.125rem] uppercase tracking-wider">
                    Thanh Nhã
                  </div>{' '}
                </div>{' '}
                <div className="p-space-md flex flex-col gap-2">
                  {' '}
                  <h3 className="font-headline-sm text-headline-sm text-primary">Dẻo Men Sen Bách Hoa</h3>{' '}
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                    Lớp nếp nương hoa bưởi tinh khôi ôm trọn hạt sen nhuyễn ngọt dịu, đánh thức phong vị đêm rằm tinh
                    tế.
                  </p>{' '}
                  <div className="pt-2 flex items-center justify-between">
                    {' '}
                    <span className="font-label-md text-label-md text-secondary font-bold">
                      Từ 130.000đ / bánh
                    </span>{' '}
                    <a
                      className="w-8 h-8 rounded-[0.125rem] bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-champagne-light transition-colors border border-border-gold-subtle"
                      href="#"
                    >
                      {' '}
                      <Icon name="arrow_forward" className="text-[17px]" aria-hidden />{' '}
                    </a>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
              <div className="group relative rounded-[0.125rem] bg-surface-container-lowest border border-border-gold-subtle shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden">
                {' '}
                <div className="relative h-60 w-full overflow-hidden bg-surface-container">
                  {' '}
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    data-alt="Luxury gourmet mooncake infused with bird nest and cordyceps, decorated with edible gold leaf foil on dark obsidian lacquer plate with warm ambient tea house light"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBRpRHlTy7SM4UHERDZBEN08d3YBF7LNtVsINd6g8U-G-8auXzDwzspPQl-2MbgUzat00ruCVHdDl8fTLYbMMadLsJWSQg0EHEM4eX585gevRPhtg0M8dXCUop9jVMM59GfQOhLBiwgtU1nNitaxiWSvAlPyozKmzL5r9vXPn2FBbAzwx8wW1gRiKmFLLUPfEDBk_4gMLMl4l0f228rqLdl5MxWEMRq170yewtuqPD44mawVzZcDNB"
                  />{' '}
                  <div className="absolute top-3 left-3 bg-primary text-secondary-fixed-dim border border-secondary-fixed-dim/40 font-label-sm text-label-sm px-2.5 py-1 rounded-[0.125rem] uppercase tracking-wider">
                    Ngự Dược VIP
                  </div>{' '}
                </div>{' '}
                <div className="p-space-md flex flex-col gap-2">
                  {' '}
                  <h3 className="font-headline-sm text-headline-sm text-primary">Yến Sào Ngự Dược & Đông Trùng</h3>{' '}
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                    Bổ dưỡng thượng phẩm kết hợp yến đảo Khánh Hòa tự nhiên, bảo chứng sức khỏe trường thọ cho đối tác
                    cao cấp.
                  </p>{' '}
                  <div className="pt-2 flex items-center justify-between">
                    {' '}
                    <span className="font-label-md text-label-md text-secondary font-bold">
                      Từ 280.000đ / bánh
                    </span>{' '}
                    <a
                      className="w-8 h-8 rounded-[0.125rem] bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-champagne-light transition-colors border border-border-gold-subtle"
                      href="#"
                    >
                      {' '}
                      <Icon name="arrow_forward" className="text-[17px]" aria-hidden />{' '}
                    </a>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
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
              <div className="flex flex-wrap items-center gap-2">
                {' '}
                <button className="px-4 py-2 rounded-[0.125rem] bg-primary text-champagne-light border border-border-gold-subtle font-label-md text-label-md shadow-sm">
                  Tất cả thương hiệu (42)
                </button>{' '}
                <button className="px-4 py-2 rounded-[0.125rem] bg-surface-container text-on-surface-variant border border-border-gold-subtle font-label-md text-label-md hover:bg-surface-container-high transition-colors">
                  Bắc Bộ Xưa (18)
                </button>{' '}
                <button className="px-4 py-2 rounded-[0.125rem] bg-surface-container text-on-surface-variant border border-border-gold-subtle font-label-md text-label-md hover:bg-surface-container-high transition-colors">
                  Nam Bộ Phồn Hoa (14)
                </button>{' '}
                <button className="px-4 py-2 rounded-[0.125rem] bg-surface-container text-on-surface-variant border border-border-gold-subtle font-label-md text-label-md hover:bg-surface-container-high transition-colors">
                  Cố Đô Huế (10)
                </button>{' '}
              </div>{' '}
            </div>{' '}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {' '}
              <div className="rounded-[0.125rem] bg-surface-container-lowest border border-border-gold-subtle p-space-md shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
                {' '}
                <div className="flex flex-col gap-space-sm">
                  {' '}
                  <div className="relative h-48 w-full rounded-[0.125rem] overflow-hidden bg-surface-container border border-border-gold-subtle/50">
                    {' '}
                    <img
                      className="w-full h-full object-cover"
                      data-alt="Traditional bakery storefront of Dong Phuong Hai Phòng with antique wooden mooncake molds, red paper gift boxes and freshly baked mooncakes"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKNmBGpW8yPG8EsHgfpR7aOfgTkk31ziAhqhztVjN9KKp0HBblaFVBbD7ngdTQ5vO4jMxXwAN1rwl7uu8ElIQDu6VITie3UbbK91RWONDjuJuS0f8AUev57QcDLTZgt0voJZgEyJXB-UGr6MHzdfAEdnc2GK0349lo6A70HWpsubghfg-TquAVAD2Aol5b0TSiCZfTmo830z1UWsjlctv71ssok23HYpiFwLZm96yqdbNihtuiASu8"
                    />{' '}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-[0.125rem] bg-primary/90 text-champagne-light border border-border-gold-subtle font-label-sm text-label-sm backdrop-blur-sm">
                      Date mới hôm nay
                    </div>{' '}
                  </div>{' '}
                  <div className="flex items-center justify-between pt-1">
                    {' '}
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                      Hải Phòng • Từ 1950
                    </span>{' '}
                    <div className="flex items-center text-secondary font-semibold">
                      {' '}
                      <Icon name="star" className="text-[15px]" aria-hidden />{' '}
                      <span className="font-label-md text-label-md ml-0.5">4.9 (1.2k)</span>{' '}
                    </div>{' '}
                  </div>{' '}
                  <h3 className="font-headline-sm text-headline-sm text-primary">Đông Phương Cầu Đất</h3>{' '}
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Lừng danh bánh nướng lá chanh thập cẩm xá xíu truyền thống đất Cảng, vỏ mỏng vàng ruộm.
                  </p>{' '}
                </div>{' '}
                <div className="pt-space-md flex flex-col gap-2 mt-2">
                  {' '}
                  <div className="flex items-baseline justify-between">
                    {' '}
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Bán lẻ từ:</span>{' '}
                    <span className="font-headline-sm text-headline-sm text-primary font-bold">120.000đ</span>{' '}
                  </div>{' '}
                  <div className="grid grid-cols-2 gap-2">
                    {' '}
                    <button className="py-2 px-3 rounded-[0.125rem] bg-surface-container text-primary border border-border-gold-subtle font-label-md text-label-md hover:bg-surface-container-high transition-colors">
                      Xem Menu
                    </button>{' '}
                    <button className="py-2 px-3 rounded-[0.125rem] bg-primary text-champagne-light font-label-md text-label-md hover:bg-primary-container transition-colors">
                      Báo Giá Sỉ
                    </button>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
              <div className="rounded-[0.125rem] bg-surface-container-lowest border border-border-gold-subtle p-space-md shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
                {' '}
                <div className="flex flex-col gap-space-sm">
                  {' '}
                  <div className="relative h-48 w-full rounded-[0.125rem] overflow-hidden bg-surface-container border border-border-gold-subtle/50">
                    {' '}
                    <img
                      className="w-full h-full object-cover"
                      data-alt="Traditional Hanoi mooncake bakery Bao Phuong Thuy Khue showcasing classic white dẻo mooncakes and baked mooncakes with hot lotus tea"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCK64I6hKVS2LPIHK-120AxQmOigJsvHn5pCPZ_E5DC-IDgERqppqV_VOTg8b0SCgAIqTDVznwePFej-CW7ERDLv5rT0E1WCHOTj1NBSl8zrGqwrdsOaJXY9yNZuIs-l6werg746IdxXAXYn3nV6d0QpVfrwR2Rjx7F_gIZKLRTJksyfxu6GYA7ZaQ1AlTtpWHnflwWUIQtDkul2-QUx62SNOWmvzTyFSa3dwJ8i6CYUGh_2I6SDaEH"
                    />{' '}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-[0.125rem] bg-primary/90 text-champagne-light border border-border-gold-subtle font-label-sm text-label-sm backdrop-blur-sm">
                      Date mới hôm nay
                    </div>{' '}
                  </div>{' '}
                  <div className="flex items-center justify-between pt-1">
                    {' '}
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                      Hà Nội • Từ 1954
                    </span>{' '}
                    <div className="flex items-center text-secondary font-semibold">
                      {' '}
                      <Icon name="star" className="text-[15px]" aria-hidden />{' '}
                      <span className="font-label-md text-label-md ml-0.5">5.0 (2.8k)</span>{' '}
                    </div>{' '}
                  </div>{' '}
                  <h3 className="font-headline-sm text-headline-sm text-primary">Bảo Phương Thụy Khuê</h3>{' '}
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Biểu tượng bánh trung thu thủ đô, hương hoa bưởi thanh khiết và vị mứt sen Tây Hồ khó quên.
                  </p>{' '}
                </div>{' '}
                <div className="pt-space-md flex flex-col gap-2 mt-2">
                  {' '}
                  <div className="flex items-baseline justify-between">
                    {' '}
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Bán lẻ từ:</span>{' '}
                    <span className="font-headline-sm text-headline-sm text-primary font-bold">115.000đ</span>{' '}
                  </div>{' '}
                  <div className="grid grid-cols-2 gap-2">
                    {' '}
                    <button className="py-2 px-3 rounded-[0.125rem] bg-surface-container text-primary border border-border-gold-subtle font-label-md text-label-md hover:bg-surface-container-high transition-colors">
                      Xem Menu
                    </button>{' '}
                    <button className="py-2 px-3 rounded-[0.125rem] bg-primary text-champagne-light font-label-md text-label-md hover:bg-primary-container transition-colors">
                      Báo Giá Sỉ
                    </button>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
              <div className="rounded-[0.125rem] bg-surface-container-lowest border border-border-gold-subtle p-space-md shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
                {' '}
                <div className="flex flex-col gap-space-sm">
                  {' '}
                  <div className="relative h-48 w-full rounded-[0.125rem] overflow-hidden bg-surface-container border border-border-gold-subtle/50">
                    {' '}
                    <img
                      className="w-full h-full object-cover"
                      data-alt="Nhu Lan Saigon famous mooncake assortment box showing rich vi cá sharks fin, roast chicken and double salted egg yolk mooncakes"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAI3SP894zQbHVNPNxMxuAJTpYeiO88yqIw44pgEeHYx0uufYTIrMOPnoYDBxACzhqQeiyQwXEcsiuG2rC3TAYxDsO9TecTiq9MRmHXHwL2l46mQtX3FkYzU4CVBDGfxVJx39IV2Bl6P8rk1Gc9CfgIWv7lkC-_YXpn_EjZhS9i6-br5rUXtr9a2GencmT5RARtFELsE0ajeyFN9jshtGC7IhNvAPFhO14cP8aQMBGkkHsejCYgMlVR"
                    />{' '}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-[0.125rem] bg-primary/90 text-champagne-light border border-border-gold-subtle font-label-sm text-label-sm backdrop-blur-sm">
                      Date mới hôm nay
                    </div>{' '}
                  </div>{' '}
                  <div className="flex items-center justify-between pt-1">
                    {' '}
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                      TP. Hồ Chí Minh • Từ 1968
                    </span>{' '}
                    <div className="flex items-center text-secondary font-semibold">
                      {' '}
                      <Icon name="star" className="text-[15px]" aria-hidden />{' '}
                      <span className="font-label-md text-label-md ml-0.5">4.8 (3.1k)</span>{' '}
                    </div>{' '}
                  </div>{' '}
                  <h3 className="font-headline-sm text-headline-sm text-primary">Bánh Như Lan Sài Gòn</h3>{' '}
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Thương hiệu nức tiếng phương Nam với dòng bánh Vi Cá, Gà Quay Jambon 2 trứng đậm đà.
                  </p>{' '}
                </div>{' '}
                <div className="pt-space-md flex flex-col gap-2 mt-2">
                  {' '}
                  <div className="flex items-baseline justify-between">
                    {' '}
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Bán lẻ từ:</span>{' '}
                    <span className="font-headline-sm text-headline-sm text-primary font-bold">135.000đ</span>{' '}
                  </div>{' '}
                  <div className="grid grid-cols-2 gap-2">
                    {' '}
                    <button className="py-2 px-3 rounded-[0.125rem] bg-surface-container text-primary border border-border-gold-subtle font-label-md text-label-md hover:bg-surface-container-high transition-colors">
                      Xem Menu
                    </button>{' '}
                    <button className="py-2 px-3 rounded-[0.125rem] bg-primary text-champagne-light font-label-md text-label-md hover:bg-primary-container transition-colors">
                      Báo Giá Sỉ
                    </button>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
              <div className="rounded-[0.125rem] bg-surface-container-lowest border border-border-gold-subtle p-space-md shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
                {' '}
                <div className="flex flex-col gap-space-sm">
                  {' '}
                  <div className="relative h-48 w-full rounded-[0.125rem] overflow-hidden bg-surface-container border border-border-gold-subtle/50">
                    {' '}
                    <img
                      className="w-full h-full object-cover"
                      data-alt="Traditional Ba Dan Hang Be Hanoi artisanal baked mooncakes with classic lattice wooden molds and handmade packaging details"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUMfg0chgIY-tl6hKzgZnYgdgWbXjctWSj66RulWvViP5e71YAe8_qzJnuWO2FhHfZQL25pX4RaeqHFeuDSu2hees2g69qS1wG7eyl-D0YXH13zAnD1h-vRfRgkdAfwLo2U_j5N5IvJlYrKJfZsDf_na-FbI4jDBEEY8EpFLu1BuYibl15nH7FLXnETkqVo1TFYRaFifi1Z3Mr6YUxKZHIK5m6VR0akeB2NxEtiJa_1g48tgYWlWUI"
                    />{' '}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-[0.125rem] bg-primary/90 text-champagne-light border border-border-gold-subtle font-label-sm text-label-sm backdrop-blur-sm">
                      Date mới hôm nay
                    </div>{' '}
                  </div>{' '}
                  <div className="flex items-center justify-between pt-1">
                    {' '}
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                      Phố Cổ Hà Nội • Gia Truyền
                    </span>{' '}
                    <div className="flex items-center text-secondary font-semibold">
                      {' '}
                      <Icon name="star" className="text-[15px]" aria-hidden />{' '}
                      <span className="font-label-md text-label-md ml-0.5">4.9 (950)</span>{' '}
                    </div>{' '}
                  </div>{' '}
                  <h3 className="font-headline-sm text-headline-sm text-primary">Bánh Cổ Truyền Bà Dần</h3>{' '}
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Bí quyết nướng bánh thủ công mộc mạc thơm dẻo, lưu giữ ký ức rằm Trung Thu Hà Thành xưa.
                  </p>{' '}
                </div>{' '}
                <div className="pt-space-md flex flex-col gap-2 mt-2">
                  {' '}
                  <div className="flex items-baseline justify-between">
                    {' '}
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Bán lẻ từ:</span>{' '}
                    <span className="font-headline-sm text-headline-sm text-primary font-bold">110.000đ</span>{' '}
                  </div>{' '}
                  <div className="grid grid-cols-2 gap-2">
                    {' '}
                    <button className="py-2 px-3 rounded-[0.125rem] bg-surface-container text-primary border border-border-gold-subtle font-label-md text-label-md hover:bg-surface-container-high transition-colors">
                      Xem Menu
                    </button>{' '}
                    <button className="py-2 px-3 rounded-[0.125rem] bg-primary text-champagne-light font-label-md text-label-md hover:bg-primary-container transition-colors">
                      Báo Giá Sỉ
                    </button>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
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
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {
                    ' Nguyệt Viên Đài cung cấp giải pháp quà tặng mùa trăng tối ưu cho doanh nghiệp: Hóa đơn VAT điện tử minh bạch, chiết khấu lũy tiến lên đến 35%, mẫu thử tận văn phòng và cam kết chuỗi lạnh đạt chuẩn. '
                  }
                </p>{' '}
              </div>{' '}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                {' '}
                <div className="p-space-md rounded-[0.125rem] bg-surface-container-lowest border border-border-gold-subtle shadow-sm flex flex-col gap-2">
                  {' '}
                  <div className="w-8 h-8 rounded-[0.125rem] bg-primary text-champagne-light font-label-lg text-label-lg flex items-center justify-center font-bold">
                    1
                  </div>{' '}
                  <h4 className="font-headline-sm text-headline-sm text-primary">Gửi Nhu Cầu & Ngân Sách</h4>{' '}
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Chọn số lượng hộp (từ 20 hộp tới 5.000+ hộp), định mức giá và phong cách thiết kế mong muốn.
                  </p>{' '}
                </div>{' '}
                <div className="p-space-md rounded-[0.125rem] bg-surface-container-lowest border border-border-gold-subtle shadow-sm flex flex-col gap-2">
                  {' '}
                  <div className="w-8 h-8 rounded-[0.125rem] bg-secondary text-surface-container-lowest font-label-lg text-label-lg flex items-center justify-center font-bold">
                    2
                  </div>{' '}
                  <h4 className="font-headline-sm text-headline-sm text-primary">Báo Giá Sỉ Trong 2 Giờ</h4>{' '}
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Chuyên viên VIP gửi bảng tổng hợp ma trận giá, chiết khấu kịch sàn và 3 phương án phối hộp mỹ mãn.
                  </p>{' '}
                </div>{' '}
                <div className="p-space-md rounded-[0.125rem] bg-surface-container-lowest border border-border-gold-subtle shadow-sm flex flex-col gap-2">
                  {' '}
                  <div className="w-8 h-8 rounded-[0.125rem] bg-primary-container text-champagne-light border border-border-gold-subtle font-label-lg text-label-lg flex items-center justify-center font-bold">
                    3
                  </div>{' '}
                  <h4 className="font-headline-sm text-headline-sm text-primary">Thử Mẫu & Khắc Thử Logo</h4>{' '}
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Giao hộp mẫu thực tế và mẫu thiệp in logo thương hiệu đến doanh nghiệp kiểm tra thẩm mỹ.
                  </p>{' '}
                </div>{' '}
                <div className="p-space-md rounded-[0.125rem] bg-surface-container-lowest border border-border-gold-subtle shadow-sm flex flex-col gap-2">
                  {' '}
                  <div className="w-8 h-8 rounded-[0.125rem] bg-primary text-secondary-fixed-dim font-label-lg text-label-lg flex items-center justify-center font-bold">
                    4
                  </div>{' '}
                  <h4 className="font-headline-sm text-headline-sm text-primary">Giao Chuỗi Lạnh Tận Nơi</h4>{' '}
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Phân bổ xe đông lạnh giao theo nhiều chi nhánh, kiểm đếm kỹ càng, đảm bảo date mới 100%.
                  </p>{' '}
                </div>{' '}
              </div>{' '}
              <div className="p-space-lg rounded-[0.125rem] bg-primary text-surface-container-lowest border border-border-gold-subtle shadow-md flex flex-col sm:flex-row items-center gap-space-md">
                {' '}
                <div className="w-16 h-16 rounded-[0.75rem] bg-secondary-fixed-dim/10 border border-secondary-fixed-dim/40 flex items-center justify-center shrink-0">
                  {' '}
                  <Icon name="severe_cold" className="text-[36px] text-secondary-fixed-dim" aria-hidden />{' '}
                </div>{' '}
                <div className="flex flex-col gap-1 text-center sm:text-left">
                  {' '}
                  <h4 className="font-headline-sm text-headline-sm text-secondary-fixed-dim">
                    Cam Kết Tiêu Chuẩn Chuỗi Lạnh Hoàng Gia
                  </h4>{' '}
                  <p className="font-body-sm text-body-sm text-champagne-light/90">
                    Nhiệt độ xe giao vận được giám sát sensor IoT 24/7 từ 18°C - 22°C. Đền bù 100% nếu bánh bị biến dạng
                    hoặc suy giảm phẩm cấp do nhiệt độ vận chuyển.
                  </p>{' '}
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
                    placeholder="VD: Tập đoàn Công Nghệ SunTech"
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
                      placeholder="Họ và tên"
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
                      placeholder="09xx xxx xxx"
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
                    placeholder="procurement@company.com"
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
                      <option value="20-50">20 - 50 hộp (Chiết khấu 15%)</option>{' '}
                      <option value="51-100">51 - 100 hộp (Chiết khấu 20%)</option>{' '}
                      <option value="101-300">101 - 300 hộp (Chiết khấu 25%)</option>{' '}
                      <option value="301-1000">301 - 1.000 hộp (Chiết khấu 30%)</option>{' '}
                      <option value="1000+">Trên 1.000 hộp (Chiết khấu 35%+)</option>{' '}
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
                    placeholder="VD: Khắc logo kim tuyến lên hộp gỗ, chia 3 đợt giao Hà Nội & TP.HCM..."
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
