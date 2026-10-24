import React, { useState } from 'react';
import { Phone, Mail, ShieldCheck, Award, Sparkles, Send, Check } from 'lucide-react';

export const Footer = ({
  language,
  onNavigate,
  onOpenRFQ,
}) => {
  const [emailSub, setEmailSub] = useState('');
  const [subSuccess, setSubSuccess] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!emailSub) return;
    setSubSuccess(true);
    setTimeout(() => {
      setEmailSub('');
      setSubSuccess(false);
    }, 4000);
  };

  return (
    <footer className="site-footer bg-canvas text-text-soft border-t border-border text-xs">
      
      {/* Top Value Badges Bar */}
      <div className="border-b border-border py-6 px-4 bg-canvas-soft">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="flex flex-col items-center">
            <Award className="w-5 h-5 text-gold mb-1" />
            <span className="font-semibold text-text">Nghệ Nhân 30 Năm</span>
            <span className="text-[11px] text-text-faint">Công thức cung đình bí truyền</span>
          </div>
          <div className="flex flex-col items-center">
            <ShieldCheck className="w-5 h-5 text-gold mb-1" />
            <span className="font-semibold text-text">Chuẩn ISO 22000 & HACCP</span>
            <span className="text-[11px] text-text-faint">Phòng sạch vô trùng tuyệt đối</span>
          </div>
          <div className="flex flex-col items-center">
            <Sparkles className="w-5 h-5 text-gold mb-1" />
            <span className="font-semibold text-text">Sơn Mài Thếp Vàng 18K</span>
            <span className="text-[11px] text-text-faint">Hộp quà chế tác thủ công</span>
          </div>
          <div className="flex flex-col items-center">
            <Phone className="w-5 h-5 text-gold mb-1" />
            <span className="font-semibold text-text">Hotline VIP 1900 8866</span>
            <span className="text-[11px] text-text-faint">Phục vụ tư vấn 24/7</span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="page-container py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-gold bg-gradient-to-br from-surface-hover to-surface flex items-center justify-center p-1">
                <span className="text-[10px] font-serif font-bold text-gold-light">NVD</span>
              </div>
              <div>
                <div className="text-xl font-serif font-bold tracking-widest text-gold-gradient">
                  NGUYỆT VIÊN ĐÀI
                </div>
                <div className="text-[10px] tracking-widest uppercase text-text-faint">
                  Tinh Hoa Bánh Trung Thu
                </div>
              </div>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              Thương hiệu bánh trung thu hoàng gia thượng hạng Nguyệt Viên Đài. Trải qua hơn ba thập kỷ gìn giữ và nâng tầm nghệ thuật ẩm thực truyền thống, kiến tạo những phần quà tôn quý tri ân mối thâm giao.
            </p>

            <div className="space-y-1.5 text-xs text-text-muted">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gold" />
                <span>Tổng đài đặt hàng VIP: <strong className="text-text">1900 8866</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gold" />
                <span>Email doanh nghiệp: <strong className="text-text">b2b@nguyetviendai.vn</strong></span>
              </div>
            </div>
          </div>

          {/* Boutiques Address */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif font-bold text-sm text-text uppercase tracking-wider text-gold">
              Hệ Thống Boutique
            </h4>
            <div className="space-y-3 text-xs text-text-muted">
              <div>
                <strong className="text-text block">Hà Nội:</strong>
                <span>• 68 Tràng Tiền, Quận Hoàn Kiếm</span>
                <span className="block">• 12 Quảng An, Phường Quảng An, Tây Hồ</span>
              </div>
              <div>
                <strong className="text-text block">TP. Hồ Chí Minh:</strong>
                <span>• 135 Đồng Khởi, Bến Nghé, Quận 1</span>
                <span className="block">• 28 Xuân Thủy, Phường Thảo Điền, TP. Thủ Đức</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif font-bold text-sm text-text uppercase tracking-wider text-gold">
              Khám Phá
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('collections')} className="hover:text-text transition-colors cursor-pointer">
                  Bộ Sưu Tập 2026
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('custom-box')} className="hover:text-text transition-colors cursor-pointer">
                  Tự Phối Hộp Quà
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('b2b-corporate')} className="hover:text-text transition-colors cursor-pointer">
                  Quà Tặng Doanh Nghiệp (B2B)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('heritage')} className="hover:text-text transition-colors cursor-pointer">
                  Nghệ Thuật Bánh Hoàng Cung
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('boutiques')} className="hover:text-text transition-colors cursor-pointer">
                  Đặt Lịch Nếm Thử VIP
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter / Corporate Registration */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif font-bold text-sm text-text uppercase tracking-wider text-gold">
              Nhận Brochure & Báo Giá 2026
            </h4>
            <p className="text-xs text-text-muted">
              Đăng ký nhận catalogue bản in độc quyền và chính sách chiết khấu mới nhất mùa trăng 2026.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  required
                  value={emailSub}
                  onChange={(e) => setEmailSub(e.target.value)}
                  placeholder="Email của bạn..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-surface border border-border text-text placeholder-text-faint focus:outline-none focus:border-gold"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-3 rounded-lg bg-gold-gradient text-ink-on-gold font-semibold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {subSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Đã Gửi Thành Công!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Đăng Ký Nhận Báo Giá</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

        {/* Bottom copyright & legal */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-text-faint">
          <div>
            © 2026 CÔNG TY CỔ PHẦN ẨM THỰC HOÀNG GIA NGUYỆT VIÊN ĐÀI. Giữ toàn quyền bảo lưu.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-text cursor-pointer">Chính sách bảo mật</span>
            <span>•</span>
            <span className="hover:text-text cursor-pointer">Quy định đổi trả & hoàn tiền</span>
            <span>•</span>
            <span className="hover:text-text cursor-pointer">Giấy chứng nhận VSATTP số 4819/2026/ATTP</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
