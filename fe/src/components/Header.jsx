import React, { useState } from 'react';
import { ShoppingBag, Search, Heart, Menu, X, Phone, Building2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters.js';

export const Header = ({
  cartCount,
  cartTotal,
  wishlistCount,
  language,
  currency,
  onOpenCart,
  onOpenWishlist,
  onOpenSearch,
  onOpenRFQ,
  onToggleLanguage,
  onToggleCurrency,
  activeSection,
  onNavigate
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'hero', labelVi: 'Trang Chủ', labelEn: 'Home' },
    { id: 'collections', labelVi: 'Bộ Sưu Tập 2026', labelEn: 'Collections' },
    { id: 'custom-box', labelVi: 'Tự Phối Hộp Quà', labelEn: 'Custom Box' },
    { id: 'b2b-corporate', labelVi: 'Quà Tặng Doanh Nghiệp', labelEn: 'Corporate Gifting', badge: 'Chiết khấu 28%' },
    { id: 'heritage', labelVi: 'Nghệ Thuật Bánh', labelEn: 'Artisan Heritage' },
    { id: 'boutiques', labelVi: 'Hệ Thống Boutique', labelEn: 'Boutiques & Tasting' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur-md border-b border-accent-border/50">
      {/* Top Announcement Bar */}
      <div className="announcement-bar bg-gradient-to-r from-accent-dark via-accent to-accent-dark text-xs py-1.5 px-4 text-accent-ink border-b border-accent-border/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gold/20 text-gold-light border border-gold/30">
              MÙA TRĂNG 2026
            </span>
            <span>
              {language === 'vi' 
                ? '🌕 Chiết khấu doanh nghiệp B2B tới 28% • Miễn phí in logo kim loại từ 50 hộp' 
                : '🌕 B2B Corporate discount up to 28% • Complimentary logo engraving from 50 boxes'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-text-soft">
            <a href="tel:19008866" className="flex items-center gap-1 hover:text-gold-bright transition-colors">
              <Phone className="w-3 h-3 text-gold" />
              <span>Hotline VIP: 1900 8866 (08:00 - 22:00)</span>
            </a>
            <span className="hidden md:inline text-gold-deep">|</span>
            <button 
              onClick={onOpenRFQ}
              className="hidden md:flex items-center gap-1 text-gold-bright hover:underline font-medium cursor-pointer"
            >
              <Building2 className="w-3 h-3 text-gold" />
              <span>{language === 'vi' ? 'Tư Vấn Doanh Nghiệp' : 'Corporate Advisory'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="navbar-container">
        <div className="flex items-center justify-between gap-3 h-20">
          
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => onNavigate('hero')}
            className="flex shrink-0 items-center gap-2 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-full border border-gold bg-gradient-to-br from-surface-hover to-surface flex items-center justify-center p-1 shadow-[0_0_15px_color-mix(in_srgb,var(--color-gold)_20%,transparent)] group-hover:shadow-[0_0_20px_color-mix(in_srgb,var(--color-gold)_40%,transparent)] transition-all">
              <div className="w-full h-full rounded-full border border-gold/40 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-serif text-gold-light tracking-widest leading-none font-bold">NGUYỆT</span>
                <span className="text-[9px] text-gold tracking-wider leading-none mt-0.5 font-serif">VIÊN ĐÀI</span>
              </div>
            </div>
            <div className="max-[374px]:hidden">
              <div className="whitespace-nowrap text-sm sm:text-lg 2xl:text-xl font-serif font-bold tracking-normal sm:tracking-wider text-gold-gradient group-hover:opacity-90 transition-opacity">
                NGUYỆT VIÊN ĐÀI
              </div>
              <div className="hidden sm:block whitespace-nowrap text-[9px] tracking-[0.2em] uppercase text-text-muted font-medium">
                {language === 'vi' ? 'Tinh Hoa Bánh Trung Thu' : 'Imperial Mooncake Haute Couture'}
              </div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden min-[1440px]:flex min-w-0 flex-1 items-center justify-center gap-0.5" aria-label={language === 'vi' ? 'Điều hướng chính' : 'Main navigation'}>
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`relative shrink-0 whitespace-nowrap px-2 py-2 text-[13px] font-medium rounded-md transition-all cursor-pointer ${
                  activeSection === link.id
                    ? 'text-accent bg-accent-soft'
                    : 'text-text-soft hover:text-accent hover:bg-accent-soft'
                }`}
              >
                <span>{language === 'vi' ? link.labelVi : link.labelEn}</span>
                {link.badge && (
                  <span className="ml-1 px-1 py-0.5 text-[9px] font-semibold rounded bg-danger text-paper shadow-sm">
                    {link.badge}
                  </span>
                )}
                {activeSection === link.id && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gold rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Controls: Search, Currency/Language, Wishlist, Cart, B2B CTA */}
          <div className="flex shrink-0 items-center gap-1.5">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-1.5 sm:p-2 text-text-soft hover:text-gold-bright hover:bg-surface-raised rounded-full transition-colors cursor-pointer"
              title={language === 'vi' ? 'Tìm kiếm' : 'Search'}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Currency Selector */}
            <div className="hidden 2xl:flex items-center text-xs bg-surface-raised border border-border-strong rounded-md p-0.5 text-text-soft">
              <button
                onClick={() => onToggleCurrency('VND')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${currency === 'VND' ? 'bg-surface-selected text-gold-light font-semibold' : 'hover:text-text'}`}
              >
                ₫ VND
              </button>
              <button
                onClick={() => onToggleCurrency('USD')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${currency === 'USD' ? 'bg-surface-selected text-gold-light font-semibold' : 'hover:text-text'}`}
              >
                $ USD
              </button>
            </div>

            {/* Language Selector */}
            <button
              onClick={() => onToggleLanguage(language === 'vi' ? 'en' : 'vi')}
              className="hidden sm:inline-flex items-center px-2 py-1 text-xs border border-border-strong rounded bg-surface-raised text-text-soft hover:text-gold-bright hover:border-gold-deep transition-colors cursor-pointer"
            >
              {language === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}
            </button>

            {/* Wishlist */}
            <button
              onClick={onOpenWishlist}
              className="relative hidden sm:block p-2 text-text-soft hover:text-gold-bright hover:bg-surface-raised rounded-full transition-colors cursor-pointer"
              title={language === 'vi' ? 'Danh sách yêu thích' : 'Wishlist'}
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-danger text-paper text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg bg-gradient-to-r from-accent-dark to-accent border border-accent hover:border-gold text-accent-ink transition-all cursor-pointer shadow-sm hover:shadow-[0_0_12px_color-mix(in_srgb,var(--color-accent)_30%,transparent)]"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-accent-ink" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-paper text-[11px] font-bold flex items-center justify-center shadow-md">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden md:inline whitespace-nowrap text-xs font-semibold">
                {cartTotal > 0 ? formatCurrency(cartTotal, currency) : (language === 'vi' ? 'Giỏ Hàng' : 'Cart')}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-[1440px]:hidden p-1.5 sm:p-2 text-text-soft hover:text-gold-bright hover:bg-surface-raised rounded-lg transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? (language === 'vi' ? 'Đóng menu' : 'Close menu') : (language === 'vi' ? 'Mở menu' : 'Open menu')}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="min-[1440px]:hidden bg-surface border-b border-border-strong px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-border">
            <button
              onClick={() => onToggleLanguage(language === 'vi' ? 'en' : 'vi')}
              className="py-1.5 text-center text-xs border border-border-strong rounded bg-surface-raised text-text-soft"
            >
              Ngôn ngữ: {language === 'vi' ? 'Tiếng Việt' : 'English'}
            </button>
            <div className="flex border border-border-strong rounded bg-surface-raised text-xs">
              <button
                onClick={() => onToggleCurrency('VND')}
                className={`flex-1 py-1.5 text-center ${currency === 'VND' ? 'bg-surface-selected text-gold-light font-semibold' : 'text-text-soft'}`}
              >
                VND
              </button>
              <button
                onClick={() => onToggleCurrency('USD')}
                className={`flex-1 py-1.5 text-center ${currency === 'USD' ? 'bg-surface-selected text-gold-light font-semibold' : 'text-text-soft'}`}
              >
                USD
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => {
                onOpenWishlist();
                setMobileMenuOpen(false);
              }}
              className="sm:hidden w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-left text-text-soft hover:bg-surface-raised"
            >
              <Heart className="w-4 h-4" />
              <span>{language === 'vi' ? 'Danh sách yêu thích' : 'Wishlist'}</span>
            </button>
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-left ${
                  activeSection === link.id
                    ? 'bg-surface-selected text-gold-light font-semibold'
                    : 'text-text-soft hover:bg-surface-raised'
                }`}
              >
                <span>{language === 'vi' ? link.labelVi : link.labelEn}</span>
                {link.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-danger text-paper">
                    {link.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                onOpenRFQ();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 rounded-lg bg-gold-gradient text-ink-on-gold font-semibold text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>{language === 'vi' ? 'Báo Giá Doanh Nghiệp B2B' : 'Request Corporate Quote'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
