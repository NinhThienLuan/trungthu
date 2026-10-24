import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, Plus, Minus, Tag, ArrowRight, Check } from 'lucide-react';
import { formatCurrency, generateOrderNumber } from '../utils/formatters.js';

export const CartDrawer = ({
  isOpen,
  items,
  currency,
  language,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckoutSuccess,
}) => {
  if (!isOpen) return null;

  const [promoCode, setPromoCode] = useState('');
  const [promoDiscountPercent, setPromoDiscountPercent] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Delivery & VAT Form
  const [isVATRequired, setIsVATRequired] = useState(false);
  const [vatCompany, setVatCompany] = useState('');
  const [vatTaxId, setVatTaxId] = useState('');
  const [vatEmail, setVatEmail] = useState('');
  const [vatAddress, setVatAddress] = useState('');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('2026-09-15');
  const [shippingNote, setShippingNote] = useState('');

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountVal = Math.round((subtotal * promoDiscountPercent) / 100);
  const total = subtotal - discountVal;

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'TRANGTRON2026') {
      setPromoDiscountPercent(10);
      setPromoApplied(true);
      setPromoError('');
    } else if (code === 'DOANHNGHIEP2026') {
      setPromoDiscountPercent(15);
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Mã không hợp lệ. Thử: TRANGTRON2026 hoặc DOANHNGHIEP2026');
    }
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!customerName || !customerPhone || !shippingAddress) {
      alert('Vui lòng điền họ tên, số điện thoại và địa chỉ nhận hàng!');
      return;
    }

    const orderData = {
      orderId: generateOrderNumber('NVD'),
      items,
      subtotal,
      discountVal,
      total,
      customerName,
      customerPhone,
      shippingAddress,
      deliveryDate,
      shippingNote,
      isVATRequired,
      vatInfo: isVATRequired ? { company: vatCompany, taxId: vatTaxId, email: vatEmail, address: vatAddress } : null,
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };

    onCheckoutSuccess(orderData);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-overlay/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-surface border-l border-gold/40 h-full flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border bg-surface-raised flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gold" />
            <h3 className="font-serif font-bold text-base text-text">
              {language === 'vi' ? 'Giỏ Hàng Của Quý Khách' : 'Your Shopping Bag'}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-surface-hover text-gold-light font-mono">
              {items.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Cart Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ShoppingBag className="w-12 h-12 mx-auto text-text-faint" />
              <p className="text-sm font-serif text-text">Giỏ hàng của bạn đang trống</p>
              <p className="text-xs text-text-muted">Hãy chọn những hộp bánh trung thu thượng hạng cho người thân và đối tác.</p>
              <button
                onClick={onClose}
                className="mt-3 px-5 py-2 rounded-lg bg-gold-gradient text-ink-on-gold font-bold text-xs cursor-pointer"
              >
                Tiếp Tục Mua Sắm
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items List */}
              <div className="space-y-3.5">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-surface-raised border border-border flex gap-3 items-start justify-between"
                  >
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-16 h-16 rounded-lg object-cover shrink-0 border border-border-strong"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-text line-clamp-1">
                        {item.productName}
                      </h4>
                      {item.boxType && (
                        <div className="text-[10px] text-text-muted truncate">{item.boxType}</div>
                      )}
                      {item.selectedFlavors && (
                        <div className="text-[10px] text-text-soft line-clamp-1 mt-0.5">
                          {item.selectedFlavors.slice(0, 2).join(', ')}...
                        </div>
                      )}
                      {item.customCardMessage && (
                        <div className="text-[10px] text-success-soft italic truncate mt-0.5">
                          Lời chúc: {item.customCardMessage}
                        </div>
                      )}
                      <div className="text-xs font-serif font-bold text-gold-gradient mt-1">
                        {formatCurrency(item.price, currency)}
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between h-16">
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-text-faint hover:text-danger-light p-1 cursor-pointer"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center border border-border-strong rounded bg-surface text-xs">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="px-2 py-0.5 text-text-muted hover:text-text cursor-pointer"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="px-1.5 font-bold text-gold-light text-[11px]">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="px-2 py-0.5 text-text-muted hover:text-text cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Voucher Box */}
              <div className="p-3.5 rounded-xl bg-surface-raised border border-border space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gold-light">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Mã Giảm Giá / Ưu Đãi:</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Nhập mã (VD: TRANGTRON2026)"
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-surface border border-border text-text uppercase tracking-wider focus:outline-none focus:border-gold"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="px-3 py-1.5 rounded-lg bg-surface-hover hover:bg-surface-selected border border-border-accent text-gold-light text-xs font-semibold cursor-pointer"
                  >
                    Áp Dụng
                  </button>
                </div>
                {promoApplied && (
                  <div className="text-[11px] text-success-bright flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Đã áp dụng giảm {promoDiscountPercent}% cho đơn hàng!</span>
                  </div>
                )}
                {promoError && (
                  <div className="text-[11px] text-danger-light">{promoError}</div>
                )}
              </div>

              {/* Checkout Form */}
              <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-3.5 text-xs">
                <h4 className="font-serif font-bold text-sm text-text">
                  Thông Tin Giao Hàng & Xuất Hóa Đơn
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-text-soft font-medium mb-1">Người Nhận *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Họ tên người nhận"
                      className="w-full px-2.5 py-1.5 rounded bg-surface border border-border text-text focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-text-soft font-medium mb-1">Số Điện Thoại *</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="09xx xxx xxx"
                      className="w-full px-2.5 py-1.5 rounded bg-surface border border-border text-text focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-text-soft font-medium mb-1">Địa Chỉ Nhận Bánh *</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành..."
                    className="w-full px-2.5 py-1.5 rounded bg-surface border border-border text-text focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-text-soft font-medium mb-1">Ngày Hẹn Giao</label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-surface border border-border text-text focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-text-soft font-medium mb-1">Ghi Chú Giao</label>
                    <input
                      type="text"
                      value={shippingNote}
                      onChange={(e) => setShippingNote(e.target.value)}
                      placeholder="Giao giờ hành chính..."
                      className="w-full px-2.5 py-1.5 rounded bg-surface border border-border text-text focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                {/* VAT Toggle */}
                <div className="pt-2 border-t border-border">
                  <label className="flex items-center gap-2 cursor-pointer text-text-soft">
                    <input
                      type="checkbox"
                      checked={isVATRequired}
                      onChange={(e) => setIsVATRequired(e.target.checked)}
                      className="accent-gold"
                    />
                    <span className="font-semibold">Yêu Cầu Xuất Hóa Đơn VAT Điện Tử Cho Doanh Nghiệp</span>
                  </label>

                  {isVATRequired && (
                    <div className="mt-2.5 space-y-2 p-2.5 rounded bg-surface border border-border">
                      <input
                        type="text"
                        value={vatCompany}
                        onChange={(e) => setVatCompany(e.target.value)}
                        placeholder="Tên công ty xuất hóa đơn"
                        className="w-full px-2 py-1 rounded bg-surface-raised border border-border text-text"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={vatTaxId}
                          onChange={(e) => setVatTaxId(e.target.value)}
                          placeholder="Mã số thuế"
                          className="w-full px-2 py-1 rounded bg-surface-raised border border-border text-text"
                        />
                        <input
                          type="email"
                          value={vatEmail}
                          onChange={(e) => setVatEmail(e.target.value)}
                          placeholder="Email nhận e-invoice"
                          className="w-full px-2 py-1 rounded bg-surface-raised border border-border text-text"
                        />
                      </div>
                      <input
                        type="text"
                        value={vatAddress}
                        onChange={(e) => setVatAddress(e.target.value)}
                        placeholder="Địa chỉ công ty trên ĐKKD"
                        className="w-full px-2 py-1 rounded bg-surface-raised border border-border text-text"
                      />
                    </div>
                  )}
                </div>

              </div>
            </>
          )}
        </div>

        {/* Footer Checkout Bar */}
        {items.length > 0 && (
          <div className="p-5 border-t border-border bg-surface-raised space-y-3">
            <div className="space-y-1.5 text-xs text-text-soft">
              <div className="flex justify-between">
                <span>Tạm tính ({items.reduce((s, i) => s + i.quantity, 0)} hộp):</span>
                <span className="font-mono">{formatCurrency(subtotal, currency)}</span>
              </div>
              {discountVal > 0 && (
                <div className="flex justify-between text-success">
                  <span>Ưu đãi voucher ({promoDiscountPercent}%):</span>
                  <span className="font-mono">-{formatCurrency(discountVal, currency)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Phí giao hàng:</span>
                <span className="text-success-soft">Miễn phí mùa trăng 2026</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border text-sm">
                <span className="font-bold text-text">TỔNG THANH TOÁN:</span>
                <span className="font-serif font-bold text-xl text-gold-gradient">
                  {formatCurrency(total, currency)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3.5 rounded-xl bg-gold-gradient text-ink-on-gold font-bold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>Xác Nhận Đặt Hàng Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
