import React, { useState } from 'react';
import { X, Building2, Send, CheckCircle2, Sparkles } from 'lucide-react';
import { PRODUCT_BOXES } from '../services/catalogService.js';

export const RFQModal = ({
  isOpen,
  prefilled,
  onClose,
  onSubmitSuccess,
}) => {
  if (!isOpen) return null;

  const [companyName, setCompanyName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedBoxId, setSelectedBoxId] = useState(prefilled?.boxId || PRODUCT_BOXES[2].id);
  const [quantity, setQuantity] = useState(prefilled?.quantity || 50);
  const [budgetPerBox, setBudgetPerBox] = useState('800.000₫ - 1.500.000₫');
  const [deliveryDate, setDeliveryDate] = useState('2026-09-18');
  const [customLogo, setCustomLogo] = useState(true);
  const [sampleTasting, setSampleTasting] = useState(true);
  const [multiLocationDelivery, setMultiLocationDelivery] = useState(false);
  const [notes, setNotes] = useState('');
  const [submittedData, setSubmittedData] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!companyName || !contactPerson || !phone || !email) {
      alert('Vui lòng điền đầy đủ các thông tin liên hệ bắt buộc!');
      return;
    }

    const newRFQ = {
      id: `RFQ-NVD-${Math.floor(100000 + Math.random() * 900000)}`,
      companyName,
      taxCode,
      contactPerson,
      phone,
      email,
      estimatedQuantity: quantity,
      budgetPerBox,
      deliveryDate,
      customLogo,
      sampleTasting,
      multiLocationDelivery,
      notes,
      createdAt: new Date().toLocaleDateString('vi-VN'),
      status: 'PENDING',
    };

    setSubmittedData(newRFQ);
    onSubmitSuccess(newRFQ);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-overlay/85 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-surface border border-gold/60 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-raised">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gold" />
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-text">
                Yêu Cầu Báo Giá Doanh Nghiệp (RFQ 2026)
              </h3>
              <p className="text-[11px] text-text-muted">Phản hồi bảng báo giá chính thức trong 15 phút</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body or Success State */}
        <div className="overflow-y-auto p-6 sm:p-7 flex-1">
          {submittedData ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-success-surface border border-success text-success-bright flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-serif font-bold text-text">
                Đã Tiếp Nhận Yêu Cầu Báo Giá Thành Công!
              </h4>
              <p className="text-xs sm:text-sm text-text-soft max-w-lg mx-auto leading-relaxed">
                Mã yêu cầu của Quý Doanh Nghiệp: <strong className="text-gold-gradient font-mono text-base">{submittedData.id}</strong>.
                Chuyên viên quản lý khách hàng B2B của Nguyệt Viên Đài sẽ liên hệ trực tiếp qua điện thoại / email trong vòng 15 phút.
              </p>

              <div className="p-4 rounded-xl bg-surface-raised border border-border-strong text-left text-xs space-y-2 max-w-md mx-auto text-text-soft">
                <div className="flex justify-between">
                  <span>Doanh nghiệp:</span>
                  <strong className="text-text">{submittedData.companyName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Người đại diện:</span>
                  <span className="text-text">{submittedData.contactPerson} ({submittedData.phone})</span>
                </div>
                <div className="flex justify-between">
                  <span>Số lượng dự kiến:</span>
                  <span className="text-gold-light font-bold">{submittedData.estimatedQuantity} hộp</span>
                </div>
                {submittedData.sampleTasting && (
                  <div className="flex items-center gap-1.5 text-success-soft font-medium pt-1 border-t border-border">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Đã đăng ký gửi mẫu bánh thử miễn phí tận văn phòng</span>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-lg bg-gold-gradient text-ink-on-gold font-bold text-xs cursor-pointer shadow-md"
                >
                  Hoàn Tất & Đóng
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Company Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gold-light mb-1">
                    Tên Doanh Nghiệp / Tập Đoàn *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="VD: Tập đoàn Công Nghệ ABC"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-surface-raised border border-border text-text placeholder-text-faint focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gold-light mb-1">
                    Mã Số Thuế (MST)
                  </label>
                  <input
                    type="text"
                    value={taxCode}
                    onChange={(e) => setTaxCode(e.target.value)}
                    placeholder="Để hỗ trợ xuất hóa đơn VAT điện tử"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-surface-raised border border-border text-text placeholder-text-faint focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Contact Person */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gold-light mb-1">
                    Người Liên Hệ *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Họ và tên"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-surface-raised border border-border text-text placeholder-text-faint focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gold-light mb-1">
                    Số Điện Thoại / Zalo *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912 xxx xxx"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-surface-raised border border-border text-text placeholder-text-faint focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gold-light mb-1">
                    Email Nhận Báo Giá *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="partner@company.com"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-surface-raised border border-border text-text placeholder-text-faint focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Order Specifics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-gold-light mb-1">
                    Mẫu Hộp Quan Tâm
                  </label>
                  <select
                    value={selectedBoxId}
                    onChange={(e) => setSelectedBoxId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-surface-raised border border-border text-text focus:outline-none focus:border-gold"
                  >
                    {PRODUCT_BOXES.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.cakeCount} bánh)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gold-light mb-1">
                    Số Lượng Dự Kiến (Hộp)
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-surface-raised border border-border text-text focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gold-light mb-1">
                    Ngày Giao Hàng Dự Kiến
                  </label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-surface-raised border border-border text-text focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Checkbox Options */}
              <div className="p-3.5 rounded-xl bg-surface-raised border border-border space-y-2">
                <div className="text-xs font-semibold text-gold mb-1">Yêu Cầu Hỗ Trợ Kèm Theo:</div>
                <label className="flex items-center gap-2.5 text-xs text-text-soft cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sampleTasting}
                    onChange={(e) => setSampleTasting(e.target.checked)}
                    className="accent-gold"
                  />
                  <span>Gửi set mẫu thử bánh & trà đến địa chỉ văn phòng công ty (Miễn phí)</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-text-soft cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customLogo}
                    onChange={(e) => setCustomLogo(e.target.checked)}
                    className="accent-gold"
                  />
                  <span>Yêu cầu gắn logo kim loại mạ vàng hoặc in logo dải lụa ruy băng</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-text-soft cursor-pointer">
                  <input
                    type="checkbox"
                    checked={multiLocationDelivery}
                    onChange={(e) => setMultiLocationDelivery(e.target.checked)}
                    className="accent-gold"
                  />
                  <span>Cần hỗ trợ giao hàng chia nhiều địa điểm / chi nhánh toàn quốc</span>
                </label>
              </div>

              {/* Extra Notes */}
              <div>
                <label className="block text-xs font-semibold text-gold-light mb-1">
                  Ghi Chú Hoặc Yêu Cầu Riêng:
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ví dụ: Cần bổ sung thiệp thư pháp viết tay, yêu cầu thời hạn thanh toán sau khi giao hàng..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-surface-raised border border-border text-text placeholder-text-faint focus:outline-none focus:border-gold"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gold-gradient text-ink-on-gold font-bold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  <span>Gửi Yêu Cầu Báo Giá (Bảo Mật & Miễn Phí)</span>
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
