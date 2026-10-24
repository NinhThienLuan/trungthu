import React from 'react';
import { CheckCircle2, X, Printer, Sparkles } from 'lucide-react';
import { formatCurrency } from '../utils/formatters.js';

export const OrderSuccessModal = ({
  orderData,
  currency,
  onClose,
}) => {
  if (!orderData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-overlay/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-surface border border-gold/60 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-surface-raised">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold-light" />
            <span className="font-serif font-bold text-sm text-text">Hóa Đơn Xác Nhận Đặt Hàng</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-text-muted hover:text-text cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-xs text-text-soft">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-success-surface border border-success text-success-bright flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-bold text-text">
              Đặt Hàng Thành Công!
            </h3>
            <p className="text-text-muted">
              Cảm ơn Quý Khách đã gửi trọn niềm tin nơi Nguyệt Viên Đài. Chuyên viên chăm sóc khách hàng sẽ liên hệ xác nhận trong 10 phút.
            </p>
            <div className="inline-block px-3 py-1 rounded-lg bg-surface-hover border border-gold/40 text-gold-gradient font-mono text-sm font-bold">
              Mã Đơn: {orderData.orderId}
            </div>
          </div>

          {/* Delivery & Customer details */}
          <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-2">
            <div className="flex justify-between">
              <span>Người nhận:</span>
              <strong className="text-text">{orderData.customerName}</strong>
            </div>
            <div className="flex justify-between">
              <span>Số điện thoại:</span>
              <span className="text-text font-mono">{orderData.customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span>Địa chỉ nhận hàng:</span>
              <span className="text-text text-right max-w-[260px] truncate">{orderData.shippingAddress}</span>
            </div>
            <div className="flex justify-between">
              <span>Ngày hẹn giao:</span>
              <span className="text-gold-light font-semibold">{orderData.deliveryDate}</span>
            </div>
            {orderData.isVATRequired && (
              <div className="pt-2 border-t border-border text-success-soft">
                * Đã ghi nhận yêu cầu xuất hóa đơn VAT điện tử cho: {orderData.vatInfo?.company || 'Doanh nghiệp'} (MST: {orderData.vatInfo?.taxId})
              </div>
            )}
          </div>

          {/* Order Items list */}
          <div className="space-y-2">
            <div className="font-semibold text-text">Danh Sách Sản Phẩm:</div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {orderData.items.map((item, i) => (
                <div key={i} className="flex justify-between py-1.5 border-b border-border">
                  <div>
                    <span className="text-text">{item.productName}</span>
                    <span className="text-text-faint ml-1.5">x{item.quantity}</span>
                  </div>
                  <span className="font-mono text-gold-gradient">
                    {formatCurrency(item.price * item.quantity, currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="pt-2 border-t border-border space-y-1 text-right">
            <div>Tạm tính: {formatCurrency(orderData.subtotal, currency)}</div>
            {orderData.discountVal > 0 && (
              <div className="text-success">Giảm giá voucher: -{formatCurrency(orderData.discountVal, currency)}</div>
            )}
            <div className="text-base font-serif font-bold text-gold-gradient pt-1">
              Tổng thanh toán: {formatCurrency(orderData.total, currency)}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-surface-raised flex items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-lg border border-border-strong text-text-soft hover:text-text text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In Phiếu Thu</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-gold-gradient text-ink-on-gold font-bold text-xs cursor-pointer shadow-md"
          >
            Hoàn Tất
          </button>
        </div>

      </div>
    </div>
  );
};
