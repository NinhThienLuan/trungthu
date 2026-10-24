import React from 'react';
import { Heart, X, ShoppingBag, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters.js';

export const WishlistModal = ({
  isOpen,
  wishlistProducts,
  currency,
  language,
  onClose,
  onRemoveFromWishlist,
  onAddToCart,
  onViewProduct,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay/85 backdrop-blur-md">
      <div 
        className="w-full max-w-lg bg-surface border border-gold/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border bg-surface-raised flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-danger fill-current" />
            <h3 className="font-serif font-bold text-base text-text">
              {language === 'vi' ? 'Hộp Quà Đã Lưu' : 'Saved Favorites'}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-surface-hover text-gold-light">
              {wishlistProducts.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-text-muted hover:text-text cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 space-y-3 flex-1 text-xs">
          {wishlistProducts.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Heart className="w-10 h-10 mx-auto text-slate" />
              <p className="font-serif text-text text-sm">Chưa có hộp quà nào trong danh sách</p>
              <p className="text-text-muted">Bấm vào biểu tượng trái tim trên các sản phẩm để lưu lại xem sau.</p>
            </div>
          ) : (
            wishlistProducts.map((product) => (
              <div
                key={product.id}
                className="p-3 rounded-xl bg-surface-raised border border-border flex items-center justify-between gap-3"
              >
                <div 
                  onClick={() => {
                    onViewProduct(product);
                    onClose();
                  }}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-14 h-14 rounded-lg object-cover shrink-0 border border-border-strong"
                  />
                  <div className="min-w-0">
                    <h4 className="font-serif font-bold text-sm text-text truncate hover:text-gold-bright">
                      {product.name}
                    </h4>
                    <div className="text-[11px] text-text-muted">{product.cakeCount} Bánh • {product.boxType}</div>
                    <div className="font-serif font-bold text-gold-gradient text-xs mt-0.5">
                      {formatCurrency(product.price, currency)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onAddToCart(product)}
                    className="px-3 py-1.5 rounded-lg bg-gold-gradient text-ink-on-gold font-bold text-xs flex items-center gap-1 cursor-pointer"
                    title="Thêm vào giỏ"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Mua</span>
                  </button>

                  <button
                    onClick={() => onRemoveFromWishlist(product)}
                    className="p-1.5 text-text-faint hover:text-danger-light cursor-pointer"
                    title="Xóa khỏi danh sách lưu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-surface-raised border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-surface-hover hover:bg-surface-selected text-gold-light text-xs font-semibold cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
