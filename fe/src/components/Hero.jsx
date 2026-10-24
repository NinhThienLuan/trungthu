import React from 'react';
import { Sparkles, Award, ShieldCheck, HeartHandshake, ArrowRight, Gift, ChevronRight, Layers } from 'lucide-react';
import { formatCurrency } from '../utils/formatters.js';

export const Hero = ({
  language,
  currency,
  onExploreCollections,
  onGoToB2B,
  onGoToCustomBox,
  onSelectBox,
}) => {
  return (
    <section className="hero-backdrop relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-border">
      <video
        className="hero-background-video pointer-events-none"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/videos/mooncake-cutting-poster.jpg"
        aria-hidden="true"
      >
        <source src="/videos/mooncake-cutting.mp4" type="video/mp4" />
      </video>
      <div className="hero-video-tint pointer-events-none" aria-hidden="true" />
      {/* Subtle Background Oriental Glow & Decorative Patterns */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gold/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -top-24 right-10 w-96 h-96 bg-danger-dark/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="page-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Brand Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent-soft/80 backdrop-blur-sm text-xs text-accent">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span className="font-semibold tracking-wider uppercase">
                {language === 'vi' ? 'Mùa Trăng Đoàn Viên 2026' : 'Harvest Moon 2026 Haute Couture'}
              </span>
              <span className="w-1 h-1 rounded-full bg-gold" />
              <span className="text-text-soft">
                {language === 'vi' ? 'Phiên Bản Hoàng Kim' : 'Imperial Edition'}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-serif font-bold text-text tracking-tight leading-[1.15]">
              {language === 'vi' ? (
                <>
                  Tinh Hoa <span className="text-gold-gradient">Nguyệt Viên Đài</span> <br />
                  Trọn Vị Đoàn Viên Hoàng Gia
                </>
              ) : (
                <>
                  Imperial <span className="text-gold-gradient">Mooncake Elegance</span> <br />
                  The Pinnacle of Mid-Autumn Gifting
                </>
              )}
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-text-soft leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {language === 'vi'
                ? 'Hơn ba thập kỷ gìn giữ tinh hoa ẩm thực cung đình, hòa quyện cùng nghệ thuật sơn mài thủ công dát vàng 18K. Mỗi hộp bánh là tuyệt phẩm gửi trao lòng tri ân sâu sắc tới người thân và đối tác kinh doanh tôn quý.'
                : 'Over three decades honoring imperial culinary heritage, married with handcrafted 18K gold-inlay lacquer artistry. A distinguished gesture of gratitude for honored families and corporate alliances.'}
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={onExploreCollections}
                className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-gold-gradient text-ink-on-gold font-semibold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_color-mix(in_srgb,var(--color-gold)_30%,transparent)] cursor-pointer group"
              >
                <span>{language === 'vi' ? 'Khám Phá Bộ Sưu Tập 2026' : 'Explore 2026 Collections'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onGoToB2B}
                className="w-full sm:w-auto px-6 py-3.5 rounded-lg border border-accent/50 hover:border-accent bg-accent-soft/90 hover:bg-surface-hover text-accent font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Award className="w-4 h-4 text-gold" />
                <span>{language === 'vi' ? 'Báo Giá Doanh Nghiệp B2B' : 'Corporate B2B Quote'}</span>
                <span className="px-1.5 py-0.5 text-[10px] bg-danger-dark text-paper rounded font-bold ml-1">-28%</span>
              </button>

              <button
                onClick={onGoToCustomBox}
                className="w-full sm:w-auto px-5 py-3.5 rounded-lg border border-border-strong hover:border-gold-deep bg-surface text-text-soft hover:text-gold-bright text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>{language === 'vi' ? 'Tự Phối Hộp Quà' : 'Custom Box Builder'}</span>
              </button>
            </div>

            {/* Quick Metrics & Trust Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border">
              <div className="text-center lg:text-left">
                <div className="text-2xl font-serif font-bold text-gold-gradient">30+ Năm</div>
                <div className="text-xs text-text-muted">
                  {language === 'vi' ? 'Di sản ẩm thực' : 'Artisanal Heritage'}
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-serif font-bold text-gold-gradient">500+</div>
                <div className="text-xs text-text-muted">
                  {language === 'vi' ? 'Tập đoàn tin chọn' : 'Corporate Clients'}
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-serif font-bold text-gold-gradient">-30%</div>
                <div className="text-xs text-text-muted">
                  {language === 'vi' ? 'Độ ngọt thanh nhẹ' : 'Healthier Sweetness'}
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-serif font-bold text-gold-gradient">100%</div>
                <div className="text-xs text-text-muted">
                  {language === 'vi' ? 'Nguyên liệu organic' : 'Pure Ingredients'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Card with High-Res Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Golden Outer Decorative Frame */}
              <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-tr from-gold-dark via-gold-light to-border-accent opacity-40 blur-sm" />

              <div className="relative rounded-2xl bg-surface border border-gold/40 p-5 shadow-2xl overflow-hidden group">
                
                {/* Main Image Showcase */}
                <div className="relative h-72 sm:h-80 w-full rounded-xl overflow-hidden mb-4 border border-border-strong">
                  <img
                    src="/videos/mooncake-cutting-poster.jpg"
                    alt="Bánh trung thu nhân trứng muối được cắt trên bàn gỗ"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80" />
                  
                  {/* Floating Royal Badge */}
                  <div className="absolute top-3 left-3 bg-danger-dark text-paper text-xs font-semibold px-2.5 py-1 rounded shadow-lg border border-danger-light/40 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-gold-bright" />
                    <span>NGHỆ THUẬT BÁNH TRUNG THU 2026</span>
                  </div>

                  {/* Sliced Cake Detail Badge */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-gold-light bg-surface-raised/90 backdrop-blur-md px-3 py-2 rounded-lg border border-border-accent">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-success" />
                      <span className="font-medium">Nhân Bát Bửu Vi Cá Yến Sào & 2 Trứng Muối</span>
                    </div>
                    <span className="text-gold-bright font-bold">180g</span>
                  </div>
                </div>

                {/* Box Quick Details */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xl font-serif font-bold text-text">
                        Hộp Dạ Nguyệt Hoàng Kim
                      </h3>
                      <p className="text-xs text-text-muted">
                        6 Bánh Thượng Hạng + Hũ Trà Shan Tuyết Cổ Thụ 300 Năm
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-serif font-bold text-gold-gradient">
                        {formatCurrency(2450000, currency)}
                      </div>
                      <div className="text-[11px] text-text-faint line-through">
                        {formatCurrency(2850000, currency)}
                      </div>
                    </div>
                  </div>

                  {/* Flavor Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['Yến Sào Vi Cá', 'Lava Hoàng Kim', 'Nấm Truffle Đen', 'Cốm Sen Tràng An'].map((flavor, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded bg-surface-hover text-gold border border-border-strong"
                      >
                        {flavor}
                      </span>
                    ))}
                  </div>

                  {/* Action */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => onSelectBox('box-nguyet-da-hoang-kim')}
                      className="flex-1 py-2.5 rounded-lg bg-surface-hover hover:bg-surface-selected border border-gold/40 text-gold-light text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>{language === 'vi' ? 'Xem Chi Tiết Tuyệt Phẩm' : 'View Masterpiece Specs'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={onGoToB2B}
                      className="px-3 py-2.5 rounded-lg bg-danger hover:bg-danger-dark text-paper text-xs font-semibold transition-colors cursor-pointer"
                      title={language === 'vi' ? 'Nhận báo giá doanh nghiệp' : 'B2B RFQ'}
                    >
                      B2B Quote
                    </button>
                  </div>
                </div>

              </div>

              {/* Floating Mini Ribbon Card */}
              <div className="absolute -bottom-6 -left-6 hidden sm:flex items-center gap-3 bg-surface-raised border border-gold/50 rounded-xl p-3 shadow-xl backdrop-blur-md">
                <div className="w-10 h-10 rounded-full bg-surface-selected flex items-center justify-center text-gold-light">
                  <Gift className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <div className="font-semibold text-gold-light">Quà Tặng Thượng Hạng</div>
                  <div className="text-text-muted">Tặng kèm dao nĩa mạ vàng & túi gấm</div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Feature Badges Bar */}
        <div className="mt-14 pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5 p-3 rounded-xl bg-surface/60 border border-border">
            <div className="p-2 rounded-lg bg-surface-hover text-gold-light shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text">
                {language === 'vi' ? 'Ẩm Thực Cung Đình' : 'Imperial Heritage'}
              </h4>
              <p className="text-xs text-text-muted mt-0.5">
                {language === 'vi' ? 'Công thức bí truyền 30 năm gìn giữ trọn vị truyền thống.' : '30-year legacy honoring authentic royal recipes.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3 rounded-xl bg-surface/60 border border-border">
            <div className="p-2 rounded-lg bg-surface-hover text-gold-light shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text">
                {language === 'vi' ? 'Thanh Ngọt Tự Nhiên' : 'Wholesome Sugar Balance'}
              </h4>
              <p className="text-xs text-text-muted mt-0.5">
                {language === 'vi' ? 'Sử dụng đường Isomalt tự nhiên, giảm 30% độ ngọt, an toàn sức khỏe.' : 'Sweetened with natural Isomalt, 30% less sugar.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3 rounded-xl bg-surface/60 border border-border">
            <div className="p-2 rounded-lg bg-surface-hover text-gold-light shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text">
                {language === 'vi' ? 'Sơn Mài Thủ Công' : 'Handmade Lacquer Cases'}
              </h4>
              <p className="text-xs text-text-muted mt-0.5">
                {language === 'vi' ? '12 lớp sơn mài nghệ nhân Hạ Thái, dát vàng 18K sang trọng.' : '12-coat master lacquerware with 18K gilded details.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3 rounded-xl bg-surface/60 border border-border">
            <div className="p-2 rounded-lg bg-surface-hover text-gold-light shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text">
                {language === 'vi' ? 'Dịch Vụ B2B VIP' : 'VIP Corporate Logistics'}
              </h4>
              <p className="text-xs text-text-muted mt-0.5">
                {language === 'vi' ? 'Khắc logo kim loại, xuất VAT điện tử và giao hàng đa điểm toàn quốc.' : 'Metal logo plating, VAT invoice & national dispatch.'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
