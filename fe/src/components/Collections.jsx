import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, Sparkles, Coffee, Box, Check, ArrowUpDown, ChevronDown } from 'lucide-react';
import { PRODUCT_BOXES, CAKE_FLAVORS } from '../services/catalogService.js';
import { ProductCard } from './ProductCard.jsx';
import { formatCurrency } from '../utils/formatters.js';

export const Collections = ({
  currency,
  language,
  wishlistIds,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
  onSelectSingleCake,
  onOpenRFQ,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCakeCount, setSelectedCakeCount] = useState('all');
  const [onlyWithTea, setOnlyWithTea] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewTab, setViewTab] = useState('boxes');

  const categories = [
    { id: 'all', labelVi: 'Tất Cả Tuyệt Phẩm', labelEn: 'All Collections' },
    { id: 'hoang-gia', labelVi: 'Hộp Sơn Mài Hoàng Gia', labelEn: 'Imperial Lacquer' },
    { id: 'doanh-nghiep', labelVi: 'Quà Tặng Doanh Nghiệp', labelEn: 'Corporate Prestige' },
    { id: 'thuong-hang', labelVi: 'Hộp Gấm & Gỗ Quý', labelEn: 'Silk & Sandalwood' },
    { id: 'tieu-chuan', labelVi: 'Thuần Chay Dưỡng Sinh', labelEn: 'Organic Vegan' },
  ];

  const filteredBoxes = useMemo(() => {
    return PRODUCT_BOXES.filter((box) => {
      // Category filter
      if (selectedCategory !== 'all' && box.category !== selectedCategory) {
        return false;
      }
      // Cake count filter
      if (selectedCakeCount !== 'all' && box.cakeCount !== selectedCakeCount) {
        return false;
      }
      // Tea filter
      if (onlyWithTea && !box.includesTea) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = box.name.toLowerCase().includes(query) || box.nameEn.toLowerCase().includes(query);
        const matchCode = box.code.toLowerCase().includes(query);
        const matchFlavors = box.flavors.some((f) => f.toLowerCase().includes(query));
        if (!matchName && !matchCode && !matchFlavors) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [selectedCategory, selectedCakeCount, onlyWithTea, searchQuery, sortBy]);

  return (
    <section id="collections" className="section-spacing bg-canvas-soft border-b border-border">
      <div className="page-container">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-hover border border-gold/30 text-xs text-gold-light font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-gold-light" />
            <span>{language === 'vi' ? 'MÙA TRĂNG BÁT BỬU' : 'COLLECTION 2026'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-text tracking-tight">
            {language === 'vi' ? 'Bộ Sưu Tập Bánh Trung Thu 2026' : 'Exclusive Mooncake Gift Sets'}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-text-muted leading-relaxed">
            {language === 'vi'
              ? 'Từng hộp quà được chăm chút công phu từ chất liệu sơn mài, lụa gấm tơ tằm đến 12 phong vị bánh cung đình hảo hạng, đượm nồng chân tình tri kỷ.'
              : 'Mastercrafted gift boxes blending royal lacquerware, silk embroidery, and fine tea with twelve gourmet recipes.'}
          </p>

          {/* Sub Switcher: Gift Boxes vs Single Artisanal Cakes */}
          <div className="mt-6 inline-flex p-1 rounded-xl bg-surface border border-border-strong">
            <button
              onClick={() => setViewTab('boxes')}
              className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                viewTab === 'boxes'
                  ? 'bg-gold-gradient text-ink-on-gold shadow-md'
                  : 'text-text-soft hover:text-gold-bright'
              }`}
            >
              <Box className="w-4 h-4" />
              <span>{language === 'vi' ? 'Hộp Quà Thượng Hạng (6 Mẫu)' : 'Curated Gift Sets'}</span>
            </button>
            <button
              onClick={() => setViewTab('single-cakes')}
              className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                viewTab === 'single-cakes'
                  ? 'bg-gold-gradient text-ink-on-gold shadow-md'
                  : 'text-text-soft hover:text-gold-bright'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{language === 'vi' ? '8 Vị Bánh Nghệ Nhân Tuyển Chọn' : 'Artisanal Single Flavors'}</span>
            </button>
          </div>
        </div>

        {/* View Mode: Boxes */}
        {viewTab === 'boxes' && (
          <div>
            {/* Filters & Controls Bar */}
            <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 mb-8 shadow-md">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                
                {/* Category Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`whitespace-nowrap px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-surface-selected text-gold-light border border-gold/60 shadow-sm'
                          : 'bg-surface-raised text-text-muted hover:text-text hover:bg-surface-hover border border-border'
                      }`}
                    >
                      {language === 'vi' ? cat.labelVi : cat.labelEn}
                    </button>
                  ))}
                </div>

                {/* Secondary Filters: Cake Count & Tea toggle & Sort */}
                <div className="flex flex-wrap items-center gap-2.5 justify-start lg:justify-end">
                  
                  {/* Search filter input */}
                  <div className="relative min-w-[160px] sm:min-w-[190px]">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={language === 'vi' ? 'Tìm tên hộp, vị...' : 'Search set or flavor...'}
                      className="w-full pl-3 pr-8 py-1.5 rounded-lg bg-surface-raised border border-border text-xs text-text placeholder-text-faint focus:outline-none focus:border-gold"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-text-faint hover:text-text"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Cake Count Filter */}
                  <div className="flex items-center bg-surface-raised border border-border rounded-lg p-0.5 text-xs">
                    <button
                      onClick={() => setSelectedCakeCount('all')}
                      className={`px-2.5 py-1.5 rounded cursor-pointer ${selectedCakeCount === 'all' ? 'bg-surface-selected text-gold-light font-semibold' : 'text-text-muted'}`}
                    >
                      Tất cả
                    </button>
                    <button
                      onClick={() => setSelectedCakeCount(4)}
                      className={`px-2.5 py-1.5 rounded cursor-pointer ${selectedCakeCount === 4 ? 'bg-surface-selected text-gold-light font-semibold' : 'text-text-muted'}`}
                    >
                      4 Bánh
                    </button>
                    <button
                      onClick={() => setSelectedCakeCount(6)}
                      className={`px-2.5 py-1.5 rounded cursor-pointer ${selectedCakeCount === 6 ? 'bg-surface-selected text-gold-light font-semibold' : 'text-text-muted'}`}
                    >
                      6 Bánh
                    </button>
                  </div>

                  {/* With Tea checkbox toggle */}
                  <button
                    onClick={() => setOnlyWithTea(!onlyWithTea)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors cursor-pointer ${
                      onlyWithTea
                        ? 'bg-success-surface text-success-soft border-success/50'
                        : 'bg-surface-raised text-text-muted border-border hover:text-gold'
                    }`}
                  >
                    <Coffee className="w-3.5 h-3.5" />
                    <span>{language === 'vi' ? 'Kèm Trà Quý' : 'With Tea'}</span>
                  </button>

                  {/* Sort By Dropdown */}
                  <div className="flex items-center gap-1 bg-surface-raised border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-soft">
                    <ArrowUpDown className="w-3 h-3 text-gold" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      aria-label={language === 'vi' ? 'Sắp xếp sản phẩm' : 'Sort products'}
                      className="bg-transparent border-none text-xs text-gold-light focus:outline-none cursor-pointer"
                    >
                      <option value="featured" className="bg-surface-raised text-gold-light">Nổi Bật</option>
                      <option value="price-asc" className="bg-surface-raised text-gold-light">Giá: Thấp Đến Cao</option>
                      <option value="price-desc" className="bg-surface-raised text-gold-light">Giá: Cao Đến Thấp</option>
                      <option value="rating" className="bg-surface-raised text-gold-light">Đánh Giá Cao Nhất</option>
                    </select>
                  </div>

                </div>

              </div>
            </div>

            {/* Product Cards Grid */}
            {filteredBoxes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredBoxes.map((box) => (
                  <ProductCard
                    key={box.id}
                    product={box}
                    currency={currency}
                    language={language}
                    isWishlisted={wishlistIds.includes(box.id)}
                    onToggleWishlist={onToggleWishlist}
                    onQuickView={onQuickView}
                    onAddToCart={onAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center rounded-2xl bg-surface border border-border">
                <Box className="w-12 h-12 mx-auto text-text-faint mb-3" />
                <h3 className="text-lg font-serif text-text">Không tìm thấy hộp quà phù hợp</h3>
                <p className="text-xs text-text-muted mt-1">Vui lòng điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedCakeCount('all');
                    setOnlyWithTea(false);
                    setSearchQuery('');
                  }}
                  className="mt-4 px-4 py-2 text-xs rounded-lg bg-gold-gradient text-ink-on-gold font-semibold cursor-pointer"
                >
                  Xóa Bộ Lọc
                </button>
              </div>
            )}
          </div>
        )}

        {/* View Mode: Single Artisanal Flavors Showcase */}
        {viewTab === 'single-cakes' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-surface-raised border border-border-strong text-xs text-text-soft flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-light shrink-0" />
                <span>
                  {language === 'vi'
                    ? 'Bạn có thể tự chọn từng vị bánh để phối vào hộp quà riêng hoặc mua thưởng thức cùng gia đình.'
                    : 'Select individual gourmet flavors to craft your bespoke gift box or enjoy at home.'}
                </span>
              </div>
              <button
                onClick={onOpenRFQ}
                className="px-3 py-1.5 rounded-lg bg-danger text-paper font-semibold shrink-0 cursor-pointer text-xs"
              >
                Đặt Đơn Doanh Nghiệp
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {CAKE_FLAVORS.map((cake) => (
                <div
                  key={cake.id}
                  className="rounded-2xl bg-surface border border-border hover:border-gold/60 p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_8px_25px_color-mix(in_srgb,var(--color-gold)_12%,transparent)] group"
                >
                  <div>
                    {/* Cake Photo */}
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 border border-border">
                      <img
                        src={cake.image}
                        alt={cake.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {cake.tag && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-danger-dark text-paper shadow">
                          {cake.tag}
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-overlay/80 backdrop-blur-sm text-[10px] text-gold-on-dark font-mono">
                        {cake.weight}
                      </div>
                    </div>

                    <div className="text-[11px] text-gold font-medium mb-1">
                      {cake.sugarLevel}
                    </div>

                    <h4 className="font-serif text-base font-bold text-text group-hover:text-gold-bright transition-colors line-clamp-2">
                      {language === 'vi' ? cake.name : cake.nameEn}
                    </h4>

                    <p className="text-xs text-text-muted line-clamp-3 mt-1.5 leading-relaxed">
                      {language === 'vi' ? cake.description : cake.descriptionEn}
                    </p>

                    {/* Ingredients preview */}
                    <div className="mt-3 pt-2.5 border-t border-border">
                      <div className="text-[10px] uppercase font-semibold text-text-faint tracking-wider mb-1">
                        Nguyên Liệu Chính:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {cake.ingredients.slice(0, 3).map((ing, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-raised text-text-soft border border-border">
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-border flex items-center justify-between">
                    <div>
                      <div className="text-base font-serif font-bold text-gold-gradient">
                        {formatCurrency(cake.singlePrice, currency)}
                      </div>
                      <div className="text-[10px] text-text-faint">Bánh lẻ 1 cái</div>
                    </div>
                    <button
                      onClick={() => onSelectSingleCake(cake)}
                      className="px-3 py-1.5 rounded-lg bg-gold-gradient text-ink-on-gold hover:brightness-110 font-semibold text-xs cursor-pointer shadow-sm"
                    >
                      {language === 'vi' ? 'Chọn Vị Này' : 'Select'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Corporate Banner Prompt inside Collections */}
        <div className="mt-16 rounded-2xl bg-gradient-to-r from-accent-dark via-accent to-accent-dark border border-gold/40 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs text-gold-on-dark font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chương Trình Đối Tác Doanh Nghiệp 2026</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-accent-ink">
              Đặt Quà Tặng Cho Tập Đoàn, Đối Tác & Khách Hàng VIP?
            </h3>
            <p className="text-xs sm:text-sm text-accent-ink/90 max-w-2xl">
              Nhận chiết khấu lên đến 28%, hỗ trợ in logo doanh nghiệp dập nổi kim loại mạ vàng, miễn phí thiệp chúc và giao hàng tận nơi tới nhiều chi nhánh.
            </p>
          </div>
          <button
            onClick={onOpenRFQ}
            className="px-6 py-3.5 rounded-xl bg-gold-gradient text-ink-on-gold font-bold text-sm hover:brightness-110 transition-all shrink-0 shadow-[0_4px_20px_color-mix(in_srgb,var(--color-gold)_25%,transparent)] cursor-pointer"
          >
            {language === 'vi' ? 'Nhận Báo Giá B2B Ngay' : 'Get Corporate Quote'}
          </button>
        </div>

      </div>
    </section>
  );
};
