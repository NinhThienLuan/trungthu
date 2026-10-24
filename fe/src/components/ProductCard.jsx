import React from 'react';
import { Heart, Eye, ShoppingBag, Star } from 'lucide-react';
import { formatCurrency } from '../utils/formatters.js';

export const ProductCard = ({
  product,
  currency,
  language,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
}) => {
  const getBadgeStyle = (badge) => {
    switch (badge) {
      case 'Hoàng Kim':
        return 'bg-gradient-to-r from-gold-deep to-gold-deep text-text border-gold-dark/40';
      case 'Best Seller':
        return 'bg-danger-dark text-paper border-danger-light/40';
      case 'Mới 2026':
        return 'bg-success-dark text-mint border-success/40';
      case 'Doanh Nghiệp Ưa Chuộng':
        return 'bg-info-dark text-info-soft border-info/40';
      case 'Giới Hạn 500 Hộp':
        return 'bg-violet-dark text-violet-soft border-violet/40';
      default:
        return 'bg-surface-selected text-gold-light border-gold/40';
    }
  };

  return (
    <div className="group relative flex flex-col rounded-2xl bg-surface border border-border hover:border-gold/60 transition-all duration-300 shadow-lg hover:shadow-[0_8px_30px_color-mix(in_srgb,var(--color-gold)_15%,transparent)] overflow-hidden">
      
      {/* Top Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-raised">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-overlay/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border shadow-md ${getBadgeStyle(product.badge)}`}>
            {product.badge}
          </span>
          {product.includesTea && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-success-surface/90 text-success-soft border border-success/30 backdrop-blur-sm">
              + Kèm Trà Quý
            </span>
          )}
        </div>

        {/* Top Right Wishlist & Quick view Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
              isWishlisted
                ? 'bg-danger text-paper shadow-md'
                : 'bg-surface/80 text-text-soft hover:text-paper hover:bg-danger/80'
            }`}
            title="Lưu vào danh sách yêu thích"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="p-2 rounded-full bg-surface/80 text-text-soft hover:text-gold-bright hover:bg-surface-selected backdrop-blur-md transition-all cursor-pointer opacity-0 group-hover:opacity-100"
            title="Xem chi tiết nhanh"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Spec Badge overlay */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-gold-bright bg-surface/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-border-strong">
          <span>{product.cakeCount} Bánh Thượng Hạng</span>
          <span className="text-text-muted">•</span>
          <span className="truncate max-w-[140px]">{product.boxType}</span>
        </div>
      </div>

      {/* Card Content Area */}
      <div className="flex flex-1 flex-col p-4 sm:p-5 justify-between space-y-3.5">
        
        <div>
          {/* Rating & Code */}
          <div className="flex items-center justify-between text-xs text-text-muted mb-1.5">
            <span className="font-mono text-[11px] text-text-faint">{product.code}</span>
            <div className="flex items-center gap-1 text-gold-light">
              <Star className="w-3.5 h-3.5 fill-current text-gold-light" />
              <span className="font-bold text-text">{product.rating}</span>
              <span className="text-text-faint">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 
            onClick={() => onQuickView(product)}
            className="font-serif text-lg sm:text-xl font-bold text-text group-hover:text-gold-bright transition-colors cursor-pointer line-clamp-1"
          >
            {language === 'vi' ? product.name : product.nameEn}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-text-muted line-clamp-2 mt-1 leading-relaxed">
            {language === 'vi' ? product.shortDesc : product.shortDescEn}
          </p>

          {/* Flavors preview badges */}
          <div className="mt-3 flex flex-wrap gap-1">
            {product.flavors.slice(0, 3).map((flavor, idx) => (
              <span
                key={idx}
                className="text-[10px] px-1.5 py-0.5 rounded bg-surface-raised text-text-soft border border-border truncate max-w-[130px]"
                title={flavor}
              >
                {flavor}
              </span>
            ))}
            {product.flavors.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-raised text-text-faint border border-border">
                +{product.flavors.length - 3} vị
              </span>
            )}
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
          <div>
            <div className="text-lg sm:text-xl font-serif font-bold text-gold-gradient">
              {formatCurrency(product.price, currency)}
            </div>
            {product.originalPrice && (
              <div className="text-[11px] text-text-faint line-through">
                {formatCurrency(product.originalPrice, currency)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onQuickView(product)}
              className="p-2 sm:px-3 sm:py-2 rounded-lg border border-border-strong hover:border-gold-deep text-xs text-text-soft hover:text-gold-bright transition-colors cursor-pointer flex items-center gap-1"
              title="Xem thông tin chi tiết"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{language === 'vi' ? 'Xem' : 'View'}</span>
            </button>

            <button
              onClick={() => onAddToCart(product)}
              className="p-2 sm:px-3 sm:py-2 rounded-lg bg-gold-gradient text-ink-on-gold hover:brightness-110 font-semibold text-xs transition-all cursor-pointer flex items-center gap-1 shadow-sm"
              title="Thêm vào giỏ hàng"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{language === 'vi' ? 'Chọn Mua' : 'Add'}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
