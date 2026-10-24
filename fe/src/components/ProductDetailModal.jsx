import React, { useState } from 'react';
import { X, Star, ShoppingBag, Heart, Coffee, Gift, ChevronRight } from 'lucide-react';
import { CAKE_FLAVORS } from '../services/catalogService.js';
import { formatCurrency } from '../utils/formatters.js';

export const ProductDetailModal = ({
  product,
  currency,
  language,
  isWishlisted,
  onClose,
  onAddToCart,
  onToggleWishlist,
  onOpenRFQ,
}) => {
  if (!product) return null;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [ribbonMessage, setRibbonMessage] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  const handleAdd = () => {
    onAddToCart(product, quantity, ribbonMessage);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-overlay/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-surface border border-gold/50 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-surface-raised">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-text-muted">{product.code}</span>
            <span className="text-gold-deep">•</span>
            <span className="text-xs font-semibold text-gold-light">{product.badge}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-7">
            
            {/* Left: Gallery Column */}
            <div className="md:col-span-5 space-y-3">
              <div className="relative aspect-[4/3] sm:aspect-square w-full rounded-xl overflow-hidden border border-border-strong bg-surface-raised">
                <img
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden border shrink-0 cursor-pointer ${
                        selectedImageIndex === idx ? 'border-gold ring-1 ring-gold' : 'border-border opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Specifications Box */}
              <div className="p-3.5 rounded-xl bg-surface-raised border border-border text-xs space-y-2 text-text-muted">
                <div className="flex justify-between">
                  <span>Quy cách:</span>
                  <span className="text-text font-medium">{product.cakeCount} Bánh Thượng Hạng</span>
                </div>
                <div className="flex justify-between">
                  <span>Trọng lượng:</span>
                  <span className="text-text font-medium">{product.weightTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kích thước hộp:</span>
                  <span className="text-text font-medium">{product.dimensions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hạn sử dụng:</span>
                  <span className="text-text font-medium">45 ngày từ ngày sản xuất</span>
                </div>
                <div className="flex justify-between">
                  <span>Bảo quản:</span>
                  <span className="text-text font-medium">Nhiệt độ phòng (22-26°C)</span>
                </div>
              </div>
            </div>

            {/* Right: Info & Purchase Details */}
            <div className="md:col-span-7 space-y-4">
              
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-gold-light">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current text-gold-light" />
                      ))}
                    </div>
                    <span className="font-bold text-text">{product.rating}</span>
                    <span className="text-text-faint">({product.reviewCount} đánh giá từ khách hàng & đối tác)</span>
                  </div>

                  <button
                    onClick={() => onToggleWishlist(product)}
                    className="p-1.5 text-text-muted hover:text-danger transition-colors cursor-pointer"
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-danger text-danger' : ''}`} />
                  </button>
                </div>

                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-text mt-1">
                  {language === 'vi' ? product.name : product.nameEn}
                </h2>
                <div className="text-xs text-gold font-medium tracking-wide">
                  {product.boxType}
                </div>
              </div>

              {/* Price Banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-surface-raised to-surface-hover border border-border-accent flex items-center justify-between">
                <div>
                  <div className="text-xs text-text-muted">Giá Bán Lẻ Đề Xuất</div>
                  <div className="text-2xl font-serif font-bold text-gold-gradient">
                    {formatCurrency(product.price, currency)}
                  </div>
                </div>
                {product.originalPrice && (
                  <div className="text-right">
                    <span className="text-xs text-text-faint line-through block">
                      {formatCurrency(product.originalPrice, currency)}
                    </span>
                    <span className="text-xs font-bold text-success">
                      Tiết kiệm {formatCurrency(product.originalPrice - product.price, currency)}
                    </span>
                  </div>
                )}
              </div>

              {/* Short Tab Switcher */}
              <div className="flex border-b border-border text-xs">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-2 px-3 font-semibold transition-colors cursor-pointer ${
                    activeTab === 'details' ? 'border-b-2 border-gold text-gold-light' : 'text-text-muted hover:text-text'
                  }`}
                >
                  Mô Tả & Ý Nghĩa
                </button>
                <button
                  onClick={() => setActiveTab('flavors')}
                  className={`py-2 px-3 font-semibold transition-colors cursor-pointer ${
                    activeTab === 'flavors' ? 'border-b-2 border-gold text-gold-light' : 'text-text-muted hover:text-text'
                  }`}
                >
                  Chi Tiết {product.cakeCount} Vị Bánh
                </button>
                <button
                  onClick={() => setActiveTab('packaging')}
                  className={`py-2 px-3 font-semibold transition-colors cursor-pointer ${
                    activeTab === 'packaging' ? 'border-b-2 border-gold text-gold-light' : 'text-text-muted hover:text-text'
                  }`}
                >
                  Phụ Kiện Kèm Theo
                </button>
              </div>

              {/* Tab 1: Full Details */}
              {activeTab === 'details' && (
                <div className="space-y-3 text-xs sm:text-sm text-text-soft leading-relaxed">
                  <p>{language === 'vi' ? product.fullDesc : product.fullDescEn}</p>
                  
                  {product.includesTea && product.teaName && (
                    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-success-surface border border-success/30 text-success-soft text-xs">
                      <Coffee className="w-4 h-4 shrink-0 mt-0.5 text-success-bright" />
                      <div>
                        <strong className="text-text">Kèm Hũ Trà Thượng Phẩm:</strong> {product.teaName}. Trà giúp cân bằng độ béo ngậy, khơi dậy trọn vẹn phong vị thanh tao khi thưởng bánh.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Flavors Breakdown */}
              {activeTab === 'flavors' && (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {product.flavors.map((flavorName, i) => {
                    const match = CAKE_FLAVORS.find((f) => f.name.toLowerCase() === flavorName.toLowerCase());
                    return (
                      <div key={i} className="p-2.5 rounded-lg bg-surface-raised border border-border text-xs">
                        <div className="flex items-center justify-between text-gold-light font-semibold">
                          <span>{i + 1}. {flavorName}</span>
                          <span className="text-[10px] text-text-soft">{match?.weight || '180g'}</span>
                        </div>
                        {match && (
                          <div className="mt-1 text-[11px] text-text-muted space-y-1">
                            <div>{match.description}</div>
                            <div className="text-[10px] text-text-faint">
                              Nguyên liệu: {match.ingredients.join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab 3: Packaging & Accessories */}
              {activeTab === 'packaging' && (
                <div className="space-y-2">
                  {product.accessories.map((acc, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-text-soft">
                      <Gift className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span>{acc}</span>
                    </div>
                  ))}
                  <div className="pt-2 text-xs text-text-muted">
                    Tất cả các hộp bánh đều được lót giấy hoa văn cung đình, đóng dấu niêm phong chống hàng giả và đóng thùng tiêu chuẩn chống va đập khi vận chuyển.
                  </div>
                </div>
              )}

              {/* Custom Ribbon Message Input */}
              <div className="pt-2 border-t border-border">
                <label className="block text-xs font-semibold text-gold-light mb-1">
                  Khắc Chữ / Lời Chúc Lên Dải Lụa Ruy Băng (Miễn Phí):
                </label>
                <input
                  type="text"
                  value={ribbonMessage}
                  onChange={(e) => setRibbonMessage(e.target.value)}
                  placeholder="Ví dụ: Kính chúc Gia Đình An Khang Thịnh Vượng hoặc Tên Doanh Nghiệp..."
                  maxLength={60}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-surface-raised border border-border-strong text-text placeholder-text-faint focus:outline-none focus:border-gold"
                />
              </div>

              {/* Quantity Adjuster & Add to Cart */}
              <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center justify-between border border-border-strong rounded-lg bg-surface-raised p-1 w-full sm:w-36">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded text-sm font-bold text-text hover:bg-surface-hover transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-bold text-sm text-gold-light">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded text-sm font-bold text-text hover:bg-surface-hover transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  className="flex-1 py-3 px-5 rounded-lg bg-gold-gradient text-ink-on-gold font-bold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    Thêm Vào Giỏ ({formatCurrency(product.price * quantity, currency)})
                  </span>
                </button>
              </div>

              {/* B2B Callout in modal */}
              <div className="p-3 rounded-lg bg-surface-raised border border-border flex items-center justify-between text-xs">
                <span className="text-text-soft">
                  Đặt số lượng từ 10 hộp cho công ty? Chiết khấu đến 28%.
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onOpenRFQ();
                  }}
                  className="text-gold-light hover:underline font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>Báo Giá B2B</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
