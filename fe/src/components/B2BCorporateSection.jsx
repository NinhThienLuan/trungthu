import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Calculator, 
  Download, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Percent, 
  TrendingDown
} from 'lucide-react';
import { PRODUCT_BOXES, B2B_DISCOUNT_TIERS, CLIENT_TESTIMONIALS } from '../services/catalogService.js';
import { formatCurrency, getDiscountForQuantity } from '../utils/formatters.js';

export const B2BCorporateSection = ({
  currency,
  language,
  onOpenRFQ,
  onOpenQuotePreview,
}) => {
  // Calculator state
  const [selectedBoxId, setSelectedBoxId] = useState(PRODUCT_BOXES[2].id); // Default to 'box-thinh-vuong-doanh-nghiep'
  const [quantity, setQuantity] = useState(50);
  const [addLogoPlaque, setAddLogoPlaque] = useState(true);
  const [addCustomRibbon, setAddCustomRibbon] = useState(true);
  const [addDirectShipping, setAddDirectShipping] = useState(false);
  const [addExecutiveTasting, setAddExecutiveTasting] = useState(true);

  const selectedBox = useMemo(() => {
    return PRODUCT_BOXES.find((b) => b.id === selectedBoxId) || PRODUCT_BOXES[0];
  }, [selectedBoxId]);

  // Discount and totals calculation
  const discountPercent = useMemo(() => {
    return getDiscountForQuantity(quantity);
  }, [quantity]);

  const rawSubtotal = selectedBox.price * quantity;
  const discountAmount = Math.round((rawSubtotal * discountPercent) / 100);

  // Add-ons costing
  const logoPlaqueCost = addLogoPlaque ? (quantity >= 50 ? 0 : quantity * 25000) : 0;
  const ribbonCost = addCustomRibbon ? (quantity >= 30 ? 0 : quantity * 15000) : 0;
  const directShippingCost = addDirectShipping ? quantity * 30000 : 0;
  const totalAddons = logoPlaqueCost + ribbonCost + directShippingCost;

  const totalBudget = rawSubtotal - discountAmount + totalAddons;
  const unitNetPrice = Math.round(totalBudget / quantity);

  const handleDownloadQuote = () => {
    onOpenQuotePreview({
      box: selectedBox,
      quantity,
      discountPercent,
      rawSubtotal,
      discountAmount,
      totalBudget,
      unitNetPrice,
      addLogoPlaque,
      addCustomRibbon,
      addDirectShipping,
      addExecutiveTasting,
      totalAddons,
    });
  };

  const handleSendRFQ = () => {
    onOpenRFQ({
      boxId: selectedBox.id,
      quantity,
      budget: totalBudget,
    });
  };

  return (
    <section id="b2b-corporate" className="section-spacing-loose bg-canvas border-b border-border relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-gold/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-danger-dark/8 rounded-full blur-[140px] pointer-events-none" />

      <div className="page-container relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-hover border border-gold/40 text-xs text-gold-light font-semibold mb-3">
            <Building2 className="w-3.5 h-3.5 text-gold-light" />
            <span>{language === 'vi' ? 'DÀNH RIÊNG CHO DOANH NGHIỆP & TẬP ĐOÀN' : 'B2B CORPORATE SOLUTION'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-text tracking-tight">
            {language === 'vi' ? 'Quà Tặng Tri Ân Doanh Nghiệp 2026' : 'Corporate Diplomatic Gifting'}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-text-muted leading-relaxed">
            {language === 'vi'
              ? 'Giải pháp quà tặng trung thu trọn gói cho đối tác VIP và nhân viên. Chiết khấu bậc thang lên đến 28%, in khắc logo kim loại nổi và dịch vụ giao hàng đa điểm chuyên nghiệp.'
              : 'Complete turnkey Mid-Autumn gifting solutions with tiered volume discounts up to 28%, custom metallic logo etching, and nationwide dispatch.'}
          </p>
        </div>

        {/* 1. TIER DISCOUNT MATRIX */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg sm:text-xl font-serif font-bold text-text flex items-center gap-2">
              <Percent className="w-5 h-5 text-gold" />
              <span>Chính Sách Chiết Khấu Bậc Thang B2B 2026</span>
            </h3>
            <span className="text-xs text-gold hidden sm:inline font-medium">
              * Áp dụng trên toàn bộ các dòng hộp quà cao cấp
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {B2B_DISCOUNT_TIERS.map((tier, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-5 border flex flex-col justify-between transition-all duration-300 ${
                  quantity >= tier.minQty && (tier.maxQty === null || quantity <= tier.maxQty)
                    ? 'bg-gradient-to-b from-surface-hover to-surface-raised border-gold ring-1 ring-gold/60 shadow-[0_0_25px_color-mix(in_srgb,var(--color-gold)_20%,transparent)]'
                    : 'bg-surface border-border hover:border-border-accent'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-surface-hover text-gold-light">
                      {tier.maxQty === null ? `Từ ${tier.minQty}+ Hộp` : `${tier.minQty} - ${tier.maxQty} Hộp`}
                    </span>
                    {tier.discountPercent >= 25 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-danger-dark text-paper">
                        VIP KHỦNG
                      </span>
                    )}
                  </div>

                  <div className="text-3xl font-serif font-bold text-gold-gradient mb-1">
                    -{tier.discountPercent}%
                  </div>
                  <div className="text-xs text-text-muted mb-4">Chiết khấu trực tiếp</div>

                  <ul className="space-y-2 border-t border-border pt-4 text-xs text-text-soft">
                    {(language === 'vi' ? tier.benefits : tier.benefitsEn).map((benefit, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 pt-3 border-t border-border">
                  <button
                    onClick={() => {
                      setQuantity(tier.minQty);
                    }}
                    className="w-full py-2 rounded-lg bg-surface-raised hover:bg-surface-selected text-gold-light text-xs font-medium border border-border-strong transition-colors cursor-pointer"
                  >
                    Chọn mốc này ({tier.minQty} hộp)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. INTERACTIVE B2B BUDGET & ORDER CALCULATOR */}
        <div className="bg-surface border border-gold/40 rounded-3xl p-6 sm:p-10 shadow-2xl mb-16">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-border mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs text-gold font-semibold tracking-wider uppercase mb-1">
                <Calculator className="w-4 h-4" />
                <span>Bảng Tính Ngân Sách Dự Kiến Trực Tuyến</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-text">
                Tính Toán Dự Toán Quà Tặng Cho Doanh Nghiệp
              </h3>
            </div>
            <div className="text-xs text-text-muted bg-surface-raised border border-border-strong px-3.5 py-2 rounded-xl flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-success" />
              <span>Cam kết xuất hóa đơn VAT điện tử & Hợp đồng pháp nhân đầy đủ</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Calculator Inputs */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Step 1: Select Box Model */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gold mb-2">
                  1. Chọn Mẫu Hộp Quà Phù Hợp:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PRODUCT_BOXES.slice(0, 4).map((box) => (
                    <div
                      key={box.id}
                      onClick={() => setSelectedBoxId(box.id)}
                      className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                        selectedBoxId === box.id
                          ? 'bg-surface-hover border-gold ring-1 ring-gold'
                          : 'bg-surface-raised border-border hover:border-border-accent'
                      }`}
                    >
                      <img
                        src={box.images[0]}
                        alt={box.name}
                        className="w-14 h-14 rounded-lg object-cover shrink-0 border border-border-strong"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-text truncate">{box.name}</div>
                        <div className="text-[11px] text-text-muted">{box.cakeCount} Bánh • {box.boxType}</div>
                        <div className="text-xs font-serif font-bold text-gold-gradient mt-0.5">
                          {formatCurrency(box.price, currency)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2: Quantity Slider & Direct Input */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gold">
                    2. Số Lượng Hộp Dự Kiến:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={10}
                      max={2000}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(10, parseInt(e.target.value) || 10))}
                      className="w-20 px-2 py-1 rounded-lg bg-surface-raised border border-border-strong text-center font-bold text-sm text-gold-light focus:outline-none focus:border-gold"
                    />
                    <span className="text-xs text-text-muted">hộp</span>
                  </div>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min={10}
                  max={500}
                  step={5}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full accent-gold bg-surface-hover h-2 rounded-lg cursor-pointer"
                />

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[20, 50, 100, 200, 350, 500].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setQuantity(preset)}
                      className={`px-3 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${
                        quantity === preset
                          ? 'bg-gold text-ink-on-gold font-bold border-gold'
                          : 'bg-surface-raised text-text-soft border-border hover:border-border-accent'
                      }`}
                    >
                      {preset} hộp
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Corporate Add-on Services */}
              <div className="space-y-2.5 pt-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gold">
                  3. Dịch Vụ & Nhận Diện Doanh Nghiệp (Tùy Chọn):
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-surface-raised border border-border cursor-pointer hover:border-border-accent">
                  <input
                    type="checkbox"
                    checked={addLogoPlaque}
                    onChange={(e) => setAddLogoPlaque(e.target.checked)}
                    className="mt-0.5 accent-gold w-4 h-4 rounded"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-text flex items-center gap-1.5">
                      <span>Khắc Laser Logo Kim Loại Mạ Vàng Gắn Trên Nắp Hộp</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-success/20 text-success-bright font-bold">
                        {quantity >= 50 ? 'MIỄN PHÍ' : '25.000₫/hộp'}
                      </span>
                    </div>
                    <p className="text-text-muted mt-0.5">
                      Logo công ty sáng bóng bằng kim loại ánh vàng đính nổi trang trọng.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-surface-raised border border-border cursor-pointer hover:border-border-accent">
                  <input
                    type="checkbox"
                    checked={addCustomRibbon}
                    onChange={(e) => setAddCustomRibbon(e.target.checked)}
                    className="mt-0.5 accent-gold w-4 h-4 rounded"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-text flex items-center gap-1.5">
                      <span>Dải Lụa Ruy Băng Dệt Tên / Slogan Doanh Nghiệp</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-success/20 text-success-bright font-bold">
                        {quantity >= 30 ? 'MIỄN PHÍ' : '15.000₫/hộp'}
                      </span>
                    </div>
                    <p className="text-text-muted mt-0.5">
                      Thắt nơ thủ công tạo ấn tượng thẩm mỹ lịch lãm khi trao tặng.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-surface-raised border border-border cursor-pointer hover:border-border-accent">
                  <input
                    type="checkbox"
                    checked={addDirectShipping}
                    onChange={(e) => setAddDirectShipping(e.target.checked)}
                    className="mt-0.5 accent-gold w-4 h-4 rounded"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-text flex items-center gap-1.5">
                      <span>Giao Hàng Tận Tay Từng Đối Tác / Chi Nhánh Toàn Quốc</span>
                      <span className="text-text-soft font-bold">+30.000₫/hộp</span>
                    </div>
                    <p className="text-text-muted mt-0.5">
                      Đội ngũ vận chuyển giao hẹn giờ, gửi kèm tin nhắn xác nhận cho người nhận.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-surface-raised border border-border cursor-pointer hover:border-border-accent">
                  <input
                    type="checkbox"
                    checked={addExecutiveTasting}
                    onChange={(e) => setAddExecutiveTasting(e.target.checked)}
                    className="mt-0.5 accent-gold w-4 h-4 rounded"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-text flex items-center gap-1.5">
                      <span>Gửi Set Bánh Mẫu & Thưởng Trà Nếm Thử Miễn Phí</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-success/20 text-success-bright font-bold">
                        MIỄN PHÍ TẬN NƠI
                      </span>
                    </div>
                    <p className="text-text-muted mt-0.5">
                      Chuyên viên mang set nếm thử đến văn phòng doanh nghiệp trước khi ký hợp đồng.
                    </p>
                  </div>
                </label>
              </div>

            </div>

            {/* Right Column: Live Real-Time Quotation Breakdown & Action Card */}
            <div className="lg:col-span-5 bg-gradient-to-b from-surface-raised to-surface border border-gold/60 rounded-2xl p-6 shadow-xl space-y-6">
              
              <div className="border-b border-border-strong pb-4">
                <div className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                  Bảng Tổng Hợp Dự Toán Ngân Sách
                </div>
                <div className="text-lg font-serif font-bold text-text mt-1">
                  {selectedBox.name}
                </div>
                <div className="text-xs text-gold">
                  Số lượng: {quantity} hộp • Mức chiết khấu: -{discountPercent}%
                </div>
              </div>

              {/* Cost Rows */}
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between text-text-soft">
                  <span>Đơn giá niêm yết:</span>
                  <span className="font-mono">{formatCurrency(selectedBox.price, currency)} / hộp</span>
                </div>

                <div className="flex justify-between text-text-soft">
                  <span>Tổng tiền niêm yết ({quantity} hộp):</span>
                  <span className="font-mono">{formatCurrency(rawSubtotal, currency)}</span>
                </div>

                <div className="flex justify-between text-success font-semibold">
                  <span className="flex items-center gap-1">
                    <TrendingDown className="w-4 h-4" />
                    <span>Chiết khấu B2B (-{discountPercent}%):</span>
                  </span>
                  <span className="font-mono">-{formatCurrency(discountAmount, currency)}</span>
                </div>

                {totalAddons > 0 && (
                  <div className="flex justify-between text-text-soft">
                    <span>Phụ phí dịch vụ thêm:</span>
                    <span className="font-mono">+{formatCurrency(totalAddons, currency)}</span>
                  </div>
                )}

                {/* Big Final Total Budget */}
                <div className="pt-4 border-t border-border-strong space-y-1">
                  <div className="text-xs uppercase tracking-wider text-gold font-semibold">
                    TỔNG NGÂN SÁCH DỰ KIẾN (CHƯA VAT):
                  </div>
                  <div className="text-3xl sm:text-4xl font-serif font-bold text-gold-gradient">
                    {formatCurrency(totalBudget, currency)}
                  </div>
                  <div className="text-xs text-success-soft font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đơn giá sau chiết khấu: <strong>{formatCurrency(unitNetPrice, currency)}</strong> / hộp</span>
                  </div>
                </div>
              </div>

              {/* Call to Actions: Download PDF & Send RFQ */}
              <div className="pt-2 space-y-2.5">
                <button
                  onClick={handleSendRFQ}
                  className="w-full py-3.5 rounded-xl bg-gold-gradient text-ink-on-gold font-bold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  <span>Gửi Yêu Cầu Báo Giá Chính Thức (RFQ)</span>
                </button>

                <button
                  onClick={handleDownloadQuote}
                  className="w-full py-3 rounded-xl border border-gold/60 hover:border-gold bg-surface-raised hover:bg-surface-hover text-gold-light font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-gold" />
                  <span>Xem & Tải Báo Giá Dự Kiến (PDF / In Ấn)</span>
                </button>
              </div>

              {/* Advisory Helpline */}
              <div className="pt-3 border-t border-border text-center text-xs text-text-muted">
                <span>Cần tư vấn trực tiếp theo ngân sách riêng?</span>
                <a href="tel:19008866" className="text-gold-light font-bold ml-1 hover:underline">
                  Hotline VIP: 1900 8866
                </a>
              </div>

            </div>

          </div>
        </div>

        {/* 3. CORPORATE LOGISTICS & 4-STEP PROCEDURE */}
        <div className="mb-16">
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-text text-center mb-8">
            Quy Trình Phục Vụ Đơn Hàng Doanh Nghiệp Chuẩn 5 Sao
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-surface border border-border relative">
              <div className="w-9 h-9 rounded-full bg-gold text-ink-on-gold font-bold flex items-center justify-center mb-3">
                1
              </div>
              <h4 className="font-serif font-bold text-text text-base mb-1">
                Tư Vấn & Báo Giá
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Đội ngũ chuyên viên B2B phản hồi trong 15 phút, tư vấn giải pháp tối ưu chi phí theo ngân sách.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-border relative">
              <div className="w-9 h-9 rounded-full bg-gold text-ink-on-gold font-bold flex items-center justify-center mb-3">
                2
              </div>
              <h4 className="font-serif font-bold text-text text-base mb-1">
                Nếm Thử & Duyệt Mockup
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Gửi bánh mẫu tận nơi và lên bản thiết kế 3D in logo thương hiệu trên hộp quà thực tế.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-border relative">
              <div className="w-9 h-9 rounded-full bg-gold text-ink-on-gold font-bold flex items-center justify-center mb-3">
                3
              </div>
              <h4 className="font-serif font-bold text-text text-base mb-1">
                Ký Hợp Đồng & Xuất VAT
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Thủ tục pháp lý minh bạch, xuất hóa đơn VAT điện tử chuẩn hóa đầy đủ theo quy định.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-border relative">
              <div className="w-9 h-9 rounded-full bg-gold text-ink-on-gold font-bold flex items-center justify-center mb-3">
                4
              </div>
              <h4 className="font-serif font-bold text-text text-base mb-1">
                Giao Hàng Đúng Tiến Độ
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Cam kết giao hàng đúng ngày giờ hẹn, hỗ trợ chia đơn phát tặng tận tay tại các tỉnh thành.
              </p>
            </div>
          </div>
        </div>

        {/* 4. CLIENT TESTIMONIALS */}
        <div>
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-text">
              Được Tin Chọn Bởi Các Doanh Nghiệp Hàng Đầu
            </h3>
            <p className="text-xs text-text-muted mt-1">
              Đồng hành cùng hơn 500+ tập đoàn tài chính, công nghệ và bất động sản qua các mùa trăng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CLIENT_TESTIMONIALS.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-surface border border-border flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-gold-light mb-3">
                    {[...Array(item.rating)].map((_, i) => (
                      <span key={i} className="text-sm">★</span>
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-text-soft italic leading-relaxed mb-4">
                    "{item.comment}"
                  </p>
                </div>
                <div className="pt-3 border-t border-border">
                  <div className="font-serif font-bold text-sm text-text">{item.author}</div>
                  <div className="text-xs text-gold">{item.role}</div>
                  <div className="text-xs text-text-faint">{item.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
