// Tự sinh từ bản thiết kế Stitch — giữ nguyên nội dung. Sửa logic ở trang bọc ngoài.
export function StitchHomeClassic() {
  return (
    <>
      <section
        className="relative min-h-[640px] lg:min-h-[760px] flex items-center overflow-hidden bg-ink-dark"
        data-purpose="hero-banner"
      >
        {' '}
        <div className="absolute inset-0 z-0">
          {' '}
          <img
            alt="Tuyển tập Bánh Trung Thu Hoàng Gia Nguyệt Viên Đài"
            className="w-full h-full object-cover object-center scale-105 transform duration-1000 opacity-90"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCt3HKGoSRGtJPlmN327iiA7Zx-9VuEgZL9ilxNn9ZZk7gb53fO9mm3P2N4LEwJ3ZKxZCH6vHOQ1DN1ieLRPWbNRZai7C-k2kCo0G5CirAMxfmrR8kRFTLX_XDfef6_7iKf1Rk9gqsFuOSLxOsM_9u9yEcU_CnbJMAApn29NdbSazA69B-eCJoF4HNyTUnn2CWNZdGD47ZeLX1drT1ZwkHAq6TSbVaHEKxcMl_3P7JvXC8uxDLpSVcE2a2Nyef-FM3irw"
          />{' '}
          <div className="absolute inset-0 bg-gradient-to-r from-ink-dark via-primary-container/85 to-transparent"></div>{' '}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-dark via-transparent to-primary-container/70"></div>{' '}
        </div>{' '}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 w-full">
          {' '}
          <div className="max-w-2xl">
            {' '}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-sm border border-gold/50 badge-blur-mordan mb-6">
              {' '}
              <span className="w-2 h-2 rounded-[0.75rem] bg-gold animate-ping"></span>{' '}
              <span className="text-xs uppercase tracking-[0.2em] text-champagne-light font-semibold">
                Tuyển Tập Nguyệt Đoàn Hoàng Gia
              </span>{' '}
            </div>{' '}
            <h1 className="font-imperial-title text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white mb-6 leading-tight drop-shadow-md">
              {' Tinh Hoa Trăng Rằm '}
              <br /> <span className="gold-gradient-text italic font-normal">Vị Bánh Hoàng Gia</span>{' '}
            </h1>{' '}
            <p className="text-base sm:text-lg text-champagne-light/90 leading-relaxed font-light mb-8 max-w-xl">
              {' Nền tảng quy tụ 42 danh xưởng nghệ nhân lưu truyền trăm năm. Thưởng thức dòng nhân '}
              <span className="text-secondary-fixed-dim font-medium">Lava Trứng Muối Hoàng Kim Tam Cấp</span>
              {' sánh mịn, hòa quyện vỏ bánh nướng mềm thơm lừng ngự trà. '}
            </p>{' '}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {' '}
              <a
                className="px-8 py-4 text-center rounded-sm font-semibold text-primary-container sheen-gold-btn tracking-widest uppercase text-xs sm:text-sm shadow-lg"
                href="#featured-collections"
              >
                {' Khám Phá Bộ Sưu Tập '}
              </a>{' '}
              <a
                className="px-8 py-4 text-center rounded-sm font-semibold text-champagne-light border border-gold/60 hover:bg-gold/15 hover:text-white backdrop-blur-sm transition tracking-widest uppercase text-xs sm:text-sm"
                href="#b2b-calculator"
              >
                {' Đặt Hàng Doanh Nghiệp B2B '}
              </a>{' '}
            </div>{' '}
            <div className="mt-12 pt-6 flex items-center gap-8 text-xs text-slate-300">
              {' '}
              <div>
                {' '}
                <p className="font-imperial-title text-2xl font-bold text-secondary-fixed-dim">100%</p>{' '}
                <p className="text-[11px] text-champagne-light/70 tracking-wide mt-0.5">Trứng Muối Thật Tươi Mới</p>{' '}
              </div>{' '}
              <div className="w-px h-8 bg-gold/30"></div>{' '}
              <div>
                {' '}
                <p className="font-imperial-title text-2xl font-bold text-secondary-fixed-dim">42+</p>{' '}
                <p className="text-[11px] text-champagne-light/70 tracking-wide mt-0.5">Nghệ Nhân Làng Cổ Truyền</p>{' '}
              </div>{' '}
              <div className="w-px h-8 bg-gold/30"></div>{' '}
              <div>
                {' '}
                <p className="font-imperial-title text-2xl font-bold text-secondary-fixed-dim">24h</p>{' '}
                <p className="text-[11px] text-champagne-light/70 tracking-wide mt-0.5">Giao Tươi Chuẩn Lạnh Toàn Quốc</p>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
      </section>{' '}
      <section className="py-14 bg-surface-container-low relative z-20" data-purpose="features">
        {' '}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {' '}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {' '}
            <div className="flex items-start gap-4 p-6 rounded-[0.125rem] bg-white border border-primary-container/10 shadow-sm hover:border-gold-burnished/60 transition">
              {' '}
              <div className="w-12 h-12 rounded-sm bg-primary-container flex items-center justify-center shrink-0 shadow-sm border border-gold/30">
                {' '}
                <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.6"
                  ></path>
                </svg>{' '}
              </div>{' '}
              <div>
                {' '}
                <h2 className="font-imperial-title text-base font-bold text-primary-container mb-1.5">
                  Date Tươi Ra Lò Trong Ngày
                </h2>{' '}
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tuyệt đối không lưu kho cũ. Bánh chỉ bắt đầu được nhào nặn và nướng sau khi chốt đơn xác nhận.
                </p>{' '}
              </div>{' '}
            </div>{' '}
            <div className="flex items-start gap-4 p-6 rounded-[0.125rem] bg-white border border-primary-container/10 shadow-sm hover:border-gold-burnished/60 transition">
              {' '}
              <div className="w-12 h-12 rounded-sm bg-primary-container flex items-center justify-center shrink-0 shadow-sm border border-gold/30">
                {' '}
                <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.6"
                  ></path>
                </svg>{' '}
              </div>{' '}
              <div>
                {' '}
                <h2 className="font-imperial-title text-base font-bold text-primary-container mb-1.5">
                  Chuỗi Bảo Quản Lạnh 100%
                </h2>{' '}
                <p className="text-xs text-slate-600 leading-relaxed">
                  Công nghệ kiểm soát nhiệt độ kép giúp dòng chảy Lava và vỏ bánh giữ trọn độ ẩm, thanh ngọt nguyên bản.
                </p>{' '}
              </div>{' '}
            </div>{' '}
            <div
              className="flex items-start gap-4 p-6 rounded-[0.125rem] bg-white border border-primary-container/10 shadow-sm hover:border-gold-burnished/60 transition"
              id="artisan-network"
            >
              {' '}
              <div className="w-12 h-12 rounded-sm bg-primary-container flex items-center justify-center shrink-0 shadow-sm border border-gold/30">
                {' '}
                <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.6"
                  ></path>
                </svg>{' '}
              </div>{' '}
              <div>
                {' '}
                <h2 className="font-imperial-title text-base font-bold text-primary-container mb-1.5">
                  42 Xưởng Nghệ Nhân Di Sản
                </h2>{' '}
                <p className="text-xs text-slate-600 leading-relaxed">
                  Được kiểm định độc quyền từ các bậc thầy làm bánh truyền thống từ Hà Nội, Huế đến Chợ Lớn Sài Gòn.
                </p>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
      </section>{' '}
      <section
        className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        data-purpose="product-showcase"
        id="featured-collections"
      >
        {' '}
        <div className="text-center max-w-2xl mx-auto mb-14">
          {' '}
          <span className="text-xs font-semibold tracking-[0.25em] text-gold-burnished uppercase">
            Tuyển Vị Thượng Phẩm
          </span>{' '}
          <h2 className="font-imperial-title text-3xl sm:text-4xl font-bold mt-2 text-primary-container">
            Bốn Bộ Sưu Tập Ngự Thiện
          </h2>{' '}
        </div>{' '}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {' '}
          <article
            className="bg-white rounded-[0.125rem] border border-primary-container/10 p-5 flex flex-col justify-between group hover:border-gold-burnished transition duration-300 shadow-sm hover:shadow-xl hover:shadow-primary-container/5"
            data-purpose="product-card"
          >
            {' '}
            <div>
              {' '}
              <div className="relative overflow-hidden rounded-[0.125rem] aspect-square bg-cream-base mb-4 flex items-center justify-center border border-primary-container/10">
                {' '}
                <span className="absolute top-2.5 left-2.5 z-10 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-primary-container text-champagne-light rounded-[0.125rem] shadow-sm border border-gold/40">
                  Cháy Hàng #1
                </span>{' '}
                <div className="w-full h-full bg-surface-container-low/70 flex flex-col items-center justify-center text-center p-4">
                  {' '}
                  <div className="w-16 h-16 rounded-[0.75rem] bg-secondary-container/30 flex items-center justify-center text-secondary mb-2 group-hover:scale-110 transition duration-300">
                    {' '}
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      ></path>
                    </svg>{' '}
                  </div>{' '}
                  <span className="font-imperial-title text-base text-primary-container font-semibold">Lava Hoàng Kim</span>{' '}
                  <span className="text-[11px] text-slate-500 mt-1">Dòng Chảy Trứng Muối Thật</span>{' '}
                </div>{' '}
              </div>{' '}
              <span className="text-[10px] tracking-widest text-gold-burnished font-semibold uppercase">
                Xưởng Nghệ Nhân Chợ Lớn
              </span>{' '}
              <h3 className="font-imperial-title text-lg font-bold text-primary-container mt-1 group-hover:text-secondary transition">
                Lava Trứng Muối Hoàng Kim Chảy
              </h3>{' '}
              <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">
                Nhân custard kem sữa béo dịu, lõi lòng đỏ muối chưng cất 60 ngày tan chảy mềm mại ngập tràn giác quan.
              </p>{' '}
            </div>{' '}
            <div className="mt-6 pt-4 flex items-center justify-between">
              {' '}
              <div>
                {' '}
                <span className="text-xs text-slate-400 line-through">650.000₫</span>{' '}
                <p className="text-lg font-bold text-primary-container">520.000₫</p>{' '}
              </div>{' '}
              <button
                aria-label="Thêm vào giỏ"
                className="p-2.5 rounded-[0.125rem] bg-primary-container text-champagne-light hover:bg-gold-burnished hover:text-white transition duration-200 shadow"
              >
                {' '}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>{' '}
              </button>{' '}
            </div>{' '}
          </article>{' '}
          <article
            className="bg-white rounded-[0.125rem] border border-primary-container/10 p-5 flex flex-col justify-between group hover:border-gold-burnished transition duration-300 shadow-sm hover:shadow-xl hover:shadow-primary-container/5"
            data-purpose="product-card"
          >
            {' '}
            <div>
              {' '}
              <div className="relative overflow-hidden rounded-[0.125rem] aspect-square bg-cream-base mb-4 flex items-center justify-center border border-primary-container/10">
                {' '}
                <span className="absolute top-2.5 left-2.5 z-10 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-primary-container text-gold rounded-[0.125rem] shadow-sm border border-gold/40">
                  Cao Lương Mỹ Vị
                </span>{' '}
                <div className="w-full h-full bg-surface-container-low/70 flex flex-col items-center justify-center text-center p-4">
                  {' '}
                  <div className="w-16 h-16 rounded-[0.75rem] bg-primary-container/10 flex items-center justify-center text-primary-container mb-2 group-hover:scale-110 transition duration-300">
                    {' '}
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      ></path>
                    </svg>{' '}
                  </div>{' '}
                  <span className="font-imperial-title text-base text-primary-container font-semibold">Bào Ngư Cung Đình</span>{' '}
                  <span className="text-[11px] text-slate-500 mt-1">Sốt XO Hồng Kông 8 Vị</span>{' '}
                </div>{' '}
              </div>{' '}
              <span className="text-[10px] tracking-widest text-gold-burnished font-semibold uppercase">Ngự Y Phủ Huế</span>{' '}
              <h3 className="font-imperial-title text-lg font-bold text-primary-container mt-1 group-hover:text-secondary transition">
                Bào Ngư Vi Cá Sốt XO Đặc Biệt
              </h3>{' '}
              <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">
                Thịt bào ngư thượng hạng xắt hạt lựu, sợi vi cá chưng cùng sốt XO cay nồng thượng vị, đẳng cấp quà biếu.
              </p>{' '}
            </div>{' '}
            <div className="mt-6 pt-4 flex items-center justify-between">
              {' '}
              <div>
                {' '}
                <span className="text-xs text-slate-500">Hộp Đơn Sang Trọng</span>{' '}
                <p className="text-lg font-bold text-primary-container">890.000₫</p>{' '}
              </div>{' '}
              <button
                aria-label="Thêm vào giỏ"
                className="p-2.5 rounded-[0.125rem] bg-primary-container text-champagne-light hover:bg-gold-burnished hover:text-white transition duration-200 shadow"
              >
                {' '}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>{' '}
              </button>{' '}
            </div>{' '}
          </article>{' '}
          <article
            className="bg-white rounded-[0.125rem] border border-primary-container/10 p-5 flex flex-col justify-between group hover:border-gold-burnished transition duration-300 shadow-sm hover:shadow-xl hover:shadow-primary-container/5"
            data-purpose="product-card"
          >
            {' '}
            <div>
              {' '}
              <div className="relative overflow-hidden rounded-[0.125rem] aspect-square bg-cream-base mb-4 flex items-center justify-center border border-primary-container/10">
                {' '}
                <span className="absolute top-2.5 left-2.5 z-10 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-secondary text-champagne-light rounded-[0.125rem] shadow-sm">
                  Di Sản 70 Năm
                </span>{' '}
                <div className="w-full h-full bg-surface-container-low/70 flex flex-col items-center justify-center text-center p-4">
                  {' '}
                  <div className="w-16 h-16 rounded-[0.75rem] bg-secondary-container/30 flex items-center justify-center text-secondary mb-2 group-hover:scale-110 transition duration-300">
                    {' '}
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      ></path>
                    </svg>{' '}
                  </div>{' '}
                  <span className="font-imperial-title text-base text-primary-container font-semibold">Thập Cẩm Hải Phòng</span>{' '}
                  <span className="text-[11px] text-slate-500 mt-1">Lá Chanh, Mỡ Gáy & Lạp Xưởng</span>{' '}
                </div>{' '}
              </div>{' '}
              <span className="text-[10px] tracking-widest text-gold-burnished font-semibold uppercase">
                Làng Nghề Đất Cảng
              </span>{' '}
              <h3 className="font-imperial-title text-lg font-bold text-primary-container mt-1 group-hover:text-secondary transition">
                Thập Cẩm Cổ Truyền Hải Phòng
              </h3>{' '}
              <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">
                Giữ trọn vị xưa với mứt sen, lạp xưởng mai quế lộ, mè rang thơm bùi cùng hương thơm thoang thoảng của lá
                chanh tươi.
              </p>{' '}
            </div>{' '}
            <div className="mt-6 pt-4 flex items-center justify-between">
              {' '}
              <div>
                {' '}
                <span className="text-xs text-slate-400 line-through">420.000₫</span>{' '}
                <p className="text-lg font-bold text-primary-container">360.000₫</p>{' '}
              </div>{' '}
              <button
                aria-label="Thêm vào giỏ"
                className="p-2.5 rounded-[0.125rem] bg-primary-container text-champagne-light hover:bg-gold-burnished hover:text-white transition duration-200 shadow"
              >
                {' '}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>{' '}
              </button>{' '}
            </div>{' '}
          </article>{' '}
          <article
            className="bg-white rounded-[0.125rem] border border-primary-container/10 p-5 flex flex-col justify-between group hover:border-gold-burnished transition duration-300 shadow-sm hover:shadow-xl hover:shadow-primary-container/5"
            data-purpose="product-card"
          >
            {' '}
            <div>
              {' '}
              <div className="relative overflow-hidden rounded-[0.125rem] aspect-square bg-cream-base mb-4 flex items-center justify-center border border-primary-container/10">
                {' '}
                <span className="absolute top-2.5 left-2.5 z-10 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-tertiary-container text-tertiary-fixed rounded-[0.125rem] shadow-sm">
                  Thanh Tao Thuần Khiết
                </span>{' '}
                <div className="w-full h-full bg-surface-container-low/70 flex flex-col items-center justify-center text-center p-4">
                  {' '}
                  <div className="w-16 h-16 rounded-[0.75rem] bg-tertiary-container/15 flex items-center justify-center text-tertiary-container mb-2 group-hover:scale-110 transition duration-300">
                    {' '}
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      ></path>
                    </svg>{' '}
                  </div>{' '}
                  <span className="font-imperial-title text-base text-primary-container font-semibold">Trà Xanh Bách Hoa</span>{' '}
                  <span className="text-[11px] text-slate-500 mt-1">Matcha Uji & Hoa Mộc Tê</span>{' '}
                </div>{' '}
              </div>{' '}
              <span className="text-[10px] tracking-widest text-gold-burnished font-semibold uppercase">
                Thái Nguyên Trà Các
              </span>{' '}
              <h3 className="font-imperial-title text-lg font-bold text-primary-container mt-1 group-hover:text-secondary transition">
                Trà Xanh Bách Hoa Ngũ Vị
              </h3>{' '}
              <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">
                Sắc xanh ngọc bích từ cốt trà thượng phẩm, điểm xuyết hoa nhài và cúc kim cương dịu ngọt, ít đường tốt
                sức khỏe.
              </p>{' '}
            </div>{' '}
            <div className="mt-6 pt-4 flex items-center justify-between">
              {' '}
              <div>
                {' '}
                <span className="text-xs text-slate-400 line-through">450.000₫</span>{' '}
                <p className="text-lg font-bold text-primary-container">390.000₫</p>{' '}
              </div>{' '}
              <button
                aria-label="Thêm vào giỏ"
                className="p-2.5 rounded-[0.125rem] bg-primary-container text-champagne-light hover:bg-gold-burnished hover:text-white transition duration-200 shadow"
              >
                {' '}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>{' '}
              </button>{' '}
            </div>{' '}
          </article>{' '}
        </div>{' '}
      </section>{' '}
      <section
        className="py-16 bg-surface-container-low"
        data-purpose="corporate-b2b-quote"
        id="b2b-calculator"
      >
        {' '}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {' '}
          <div className="bg-white border border-primary-container/10 rounded-[0.125rem] p-6 sm:p-10 lg:p-12 shadow-md relative overflow-hidden">
            {' '}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-gold-burnished/10 rounded-[0.75rem] blur-3xl pointer-events-none"></div>{' '}
            <div className="absolute -left-20 -top-20 w-80 h-80 bg-primary-container/5 rounded-[0.75rem] blur-3xl pointer-events-none"></div>{' '}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {' '}
              <div className="lg:col-span-6 space-y-6">
                {' '}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-primary-container text-champagne-light text-xs font-semibold uppercase tracking-wider border border-gold/30">
                  Dịch Vụ Tặng Quà Doanh Nghiệp
                </div>{' '}
                <h2 className="font-imperial-title text-3xl sm:text-4xl font-bold text-primary-container leading-tight">
                  {'Giải Pháp Quà Tặng Đẳng Cấp '}
                  <br />
                  <span className="text-gold-burnished">In Khắc Logo Kim Nhũ Miễn Phí</span>
                </h2>{' '}
                <p className="text-slate-600 text-sm leading-relaxed">
                  Nguyệt Viên Đài hỗ trợ tối đa các tập đoàn, ngân hàng và doanh nghiệp FDI: Hóa đơn đỏ VAT tức thì,
                  thiết kế thiệp chúc riêng, vận chuyển bảo ôn tận tay từng chi nhánh toàn quốc.
                </p>{' '}
                <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                  {' '}
                  <li className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-[0.75rem] bg-surface-container-low text-gold-burnished border border-gold-burnished/40 flex items-center justify-center font-bold">
                      ✓
                    </span>
                    {' Chiết khấu lũy tiến trực tiếp đến 38%'}
                  </li>{' '}
                  <li className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-[0.75rem] bg-surface-container-low text-gold-burnished border border-gold-burnished/40 flex items-center justify-center font-bold">
                      ✓
                    </span>
                    {' Gửi mẫu bánh & hộp thử miễn phí tận bàn làm việc'}
                  </li>{' '}
                  <li className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-[0.75rem] bg-surface-container-low text-gold-burnished border border-gold-burnished/40 flex items-center justify-center font-bold">
                      ✓
                    </span>
                    {' Bảo hiểm vỡ hỏng & cam kết date mới 100%'}
                  </li>{' '}
                </ul>{' '}
              </div>{' '}
              <div
                className="lg:col-span-6 bg-cream-base border border-primary-container/10 rounded-[0.125rem] p-6 sm:p-8"
                data-purpose="quick-calculator-box"
              >
                {' '}
                <h3 className="font-imperial-title text-xl font-bold text-primary-container mb-2">
                  Bảng Tính Dự Toán Nhanh B2B
                </h3>{' '}
                <p className="text-xs text-slate-600 mb-6">Ước tính mức chiết khấu và chi phí quà tặng trong 5 giây.</p>{' '}
                <form className="space-y-4">
                  {' '}
                  <div>
                    {' '}
                    <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="package-tier">
                      Dòng Hộp Quà Tặng
                    </label>{' '}
                    <select
                      className="w-full bg-white text-sm text-slate-800 border border-primary-container/15 rounded-[0.125rem] py-2.5 px-3 focus:ring-1 focus:ring-gold-burnished focus:outline-none shadow-sm"
                      id="package-tier"
                    >
                      {' '}
                      <option value="680000">Hộp Hoàng Gia Tứ Quý (4 bánh Lava + Trà) - 680.000₫</option>{' '}
                      <option value="1280000">Hộp Nguyệt Dạ Cung Đình (4 bánh VIP Bào Ngư + Yến) - 1.280.000₫</option>{' '}
                      <option value="420000">Hộp Truyền Thống Sum Vầy (4 bánh Thập Cẩm) - 420.000₫</option>{' '}
                    </select>{' '}
                  </div>{' '}
                  <div>
                    {' '}
                    <div className="flex justify-between items-center mb-1">
                      {' '}
                      <label className="text-xs font-medium text-slate-700" htmlFor="gift-quantity">
                        {'Số Lượng Hộp: '}
                        <span className="text-primary-container font-bold" id="quantity-display">
                          100 hộp
                        </span>
                      </label>{' '}
                      <span
                        className="text-[11px] font-bold text-champagne-light bg-primary-container border border-gold/40 px-2 py-0.5 rounded-[0.125rem] shadow-sm"
                        id="discount-badge"
                      >
                        Giảm 25%
                      </span>{' '}
                    </div>{' '}
                    <input
                      className="w-full accent-gold-burnished cursor-pointer"
                      id="gift-quantity"
                      max={1000}
                      min={20}
                      step={10}
                      type="range"
                      defaultValue="100"
                    />{' '}
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      {' '}
                      <span>20 hộp</span> <span>250 hộp</span> <span>500 hộp</span> <span>1.000+ hộp</span>{' '}
                    </div>{' '}
                  </div>{' '}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {' '}
                    <input
                      className="bg-white text-xs text-slate-800 border border-primary-container/15 rounded-[0.125rem] py-2 px-3 focus:outline-none focus:border-gold-burnished shadow-sm"
                      placeholder="Số điện thoại / Zalo"
                      required
                      type="text"
                    />{' '}
                    <input
                      className="bg-white text-xs text-slate-800 border border-primary-container/15 rounded-[0.125rem] py-2 px-3 focus:outline-none focus:border-gold-burnished shadow-sm"
                      placeholder="Tên công ty / Doanh nghiệp"
                      type="text"
                    />{' '}
                  </div>{' '}
                  <div className="p-3.5 rounded-[0.125rem] bg-white border border-dashed border-gold-burnished/40 flex items-center justify-between shadow-sm">
                    {' '}
                    <div>
                      {' '}
                      <span className="text-[11px] text-slate-500 block">Dự toán tạm tính (Sau chiết khấu):</span>{' '}
                      <span className="text-lg font-bold text-primary-container" id="estimated-price">
                        51.000.000₫
                      </span>{' '}
                    </div>{' '}
                    <span className="text-[11px] text-emerald-800 font-semibold">
                      {'Tiết kiệm: '}
                      <span id="savings-price">17.000.000₫</span>
                    </span>{' '}
                  </div>{' '}
                  <button
                    className="w-full py-3.5 sheen-gold-btn text-primary-container font-bold uppercase tracking-widest text-xs rounded-[0.125rem] transition shadow-md hover:brightness-105"
                    type="submit"
                  >
                    Nhận Báo Giá Đóng Dấu & Hộp Mẫu Thử
                  </button>{' '}
                </form>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
      </section>
    </>
  )
}
