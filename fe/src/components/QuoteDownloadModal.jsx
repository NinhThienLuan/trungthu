import React from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { formatCurrency } from '../utils/formatters.js';

export const QuoteDownloadModal = ({
  quoteData,
  currency,
  onClose,
  onProceedToRFQ,
}) => {
  if (!quoteData) return null;

  const quoteNo = `EST-NVD-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = new Date().toLocaleDateString('vi-VN');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-overlay/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-paper text-paper-ink rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b bg-canvas-soft text-text">
          <div className="flex items-center gap-2 text-xs">
            <FileText className="w-4 h-4 text-gold" />
            <span className="font-bold">BẢNG BÁO GIÁ DỰ TOÁN B2B (NGUYỆT VIÊN ĐÀI)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-2.5 py-1 rounded bg-info-dark hover:bg-info-dark text-paper text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In / Lưu PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-paper-muted hover:text-text cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Sheet Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 flex-1 text-xs leading-relaxed bg-paper-soft">
          
          {/* Header of Quotation */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b pb-4 gap-4">
            <div>
              <div className="text-xl font-serif font-bold text-gold-deep tracking-wider">
                NGUYỆT VIÊN ĐÀI
              </div>
              <div className="text-[10px] text-paper-muted uppercase tracking-widest">
                Tinh Hoa Bánh Trung Thu Hoàng Kim
              </div>
              <div className="text-[11px] text-paper-text-soft mt-1">
                Địa chỉ: 68 Tràng Tiền, Quận Hoàn Kiếm, Hà Nội
              </div>
              <div className="text-[11px] text-paper-text-soft">
                Hotline B2B: 1900 8866 | Email: b2b@nguyetviendai.vn
              </div>
            </div>
            <div className="text-right sm:text-right">
              <div className="text-xs font-mono font-bold text-paper-text">Mã Báo Giá: {quoteNo}</div>
              <div className="text-[11px] text-paper-muted">Ngày lập: {dateStr}</div>
              <div className="text-[11px] text-success-dark font-semibold mt-1">
                Hiệu lực báo giá: 15 ngày
              </div>
            </div>
          </div>

          {/* Quotation Title */}
          <div className="text-center py-1">
            <h2 className="text-lg font-bold text-paper-heading uppercase">
              BẢNG BÁO GIÁ QUÀ TẶNG TRUNG THU DOANH NGHIỆP 2026
            </h2>
            <p className="text-[11px] text-paper-text-soft italic">
              Kính gửi Quý Doanh Nghiệp & Đối Tác Chiến Lược
            </p>
          </div>

          {/* Summary Table */}
          <div className="border border-paper-border-soft rounded-lg overflow-hidden bg-paper">
            <table className="w-full text-left text-xs">
              <thead className="bg-paper-subtle border-b text-paper-text uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Hạng Mục</th>
                  <th className="p-2.5 text-center">Số Lượng</th>
                  <th className="p-2.5 text-right">Đơn Giá Niêm Yết</th>
                  <th className="p-2.5 text-right">Chiết Khấu</th>
                  <th className="p-2.5 text-right">Thành Tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="p-2.5">
                    <div className="font-bold text-paper-heading">{quoteData.box.name}</div>
                    <div className="text-[10px] text-paper-muted">
                      {quoteData.box.cakeCount} bánh thượng hạng • {quoteData.box.boxType}
                    </div>
                  </td>
                  <td className="p-2.5 text-center font-bold">{quoteData.quantity} hộp</td>
                  <td className="p-2.5 text-right font-mono">
                    {formatCurrency(quoteData.box.price, currency)}
                  </td>
                  <td className="p-2.5 text-right text-success-dark font-semibold">
                    -{quoteData.discountPercent}%
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-paper-heading">
                    {formatCurrency(quoteData.rawSubtotal - quoteData.discountAmount, currency)}
                  </td>
                </tr>

                {/* Add-ons */}
                {quoteData.addLogoPlaque && (
                  <tr>
                    <td className="p-2.5">
                      <div className="font-semibold text-paper-ink">
                        Khắc Laser Logo Kim Loại Mạ Vàng Gắn Trên Nắp Hộp
                      </div>
                    </td>
                    <td className="p-2.5 text-center">{quoteData.quantity} phần</td>
                    <td className="p-2.5 text-right">{quoteData.quantity >= 50 ? '0₫' : '25.000₫'}</td>
                    <td className="p-2.5 text-right text-success-dark">
                      {quoteData.quantity >= 50 ? 'Miễn phí 100%' : 'Tiêu chuẩn'}
                    </td>
                    <td className="p-2.5 text-right font-mono font-semibold">
                      {quoteData.quantity >= 50 ? '0 ₫' : formatCurrency(quoteData.quantity * 25000, currency)}
                    </td>
                  </tr>
                )}

                {quoteData.addCustomRibbon && (
                  <tr>
                    <td className="p-2.5">
                      <div className="font-semibold text-paper-ink">
                        Dải Lụa Ruy Băng In Tên / Logo Doanh Nghiệp
                      </div>
                    </td>
                    <td className="p-2.5 text-center">{quoteData.quantity} phần</td>
                    <td className="p-2.5 text-right">{quoteData.quantity >= 30 ? '0₫' : '15.000₫'}</td>
                    <td className="p-2.5 text-right text-success-dark">
                      {quoteData.quantity >= 30 ? 'Miễn phí 100%' : 'Tiêu chuẩn'}
                    </td>
                    <td className="p-2.5 text-right font-mono font-semibold">
                      {quoteData.quantity >= 30 ? '0 ₫' : formatCurrency(quoteData.quantity * 15000, currency)}
                    </td>
                  </tr>
                )}

                {quoteData.addDirectShipping && (
                  <tr>
                    <td className="p-2.5">
                      <div className="font-semibold text-paper-ink">
                        Dịch Vụ Đóng Gói Giao Hàng Đa Điểm Toàn Quốc
                      </div>
                    </td>
                    <td className="p-2.5 text-center">{quoteData.quantity} điểm</td>
                    <td className="p-2.5 text-right">30.000₫</td>
                    <td className="p-2.5 text-right text-paper-muted">-</td>
                    <td className="p-2.5 text-right font-mono font-semibold">
                      {formatCurrency(quoteData.quantity * 30000, currency)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="bg-amber-surface border border-amber-border rounded-lg p-3.5 space-y-1 text-xs">
            <div className="flex justify-between text-paper-text">
              <span>Tổng tiền ban đầu:</span>
              <span className="font-mono">{formatCurrency(quoteData.rawSubtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-success-dark font-bold">
              <span>Tổng chiết khấu bậc thang (-{quoteData.discountPercent}%):</span>
              <span className="font-mono">-{formatCurrency(quoteData.discountAmount, currency)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-paper-heading pt-2 border-t border-amber-border">
              <span>TỔNG NGÂN SÁCH ĐẦU TƯ (CHƯA VAT):</span>
              <span className="font-mono text-amber-ink">{formatCurrency(quoteData.totalBudget, currency)}</span>
            </div>
            <div className="text-[11px] text-paper-text-soft text-right">
              Đơn giá trung bình sau ưu đãi: <strong>{formatCurrency(quoteData.unitNetPrice, currency)}</strong> / hộp
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="text-[10px] text-paper-muted space-y-1 border-t pt-3">
            <div className="font-bold text-paper-text uppercase">Quyền Lợi Kèm Theo Báo Giá:</div>
            <div>• Tặng 01 set bánh và trà nếm thử tận nơi cho đại diện doanh nghiệp.</div>
            <div>• Miễn phí thiết kế bản mẫu khắc logo 3D trước khi tiến hành sản xuất hàng loạt.</div>
            <div>• Xuất hóa đơn VAT điện tử hợp lệ 100% trong vòng 24h làm việc.</div>
          </div>

          {/* Signature Representation */}
          <div className="pt-4 flex justify-between items-center text-xs">
            <div className="text-center">
              <div className="text-paper-muted">Đại Diện Doanh Nghiệp</div>
              <div className="h-12 flex items-center justify-center italic text-paper-faint">(Ký xác nhận)</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-paper-ink">BAN GIÁM ĐỐC NGUYỆT VIÊN ĐÀI</div>
              <div className="h-12 flex items-center justify-center font-serif text-gold-deep italic font-bold">
                [Đã Đóng Dấu Niêm Phong Hoàng Gia]
              </div>
            </div>
          </div>

        </div>

        {/* Bottom CTA */}
        <div className="p-4 bg-paper-subtle border-t flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-paper-border text-paper-text hover:bg-paper text-xs font-semibold cursor-pointer"
          >
            Đóng Xem Lại
          </button>
          <button
            onClick={() => {
              onClose();
              onProceedToRFQ();
            }}
            className="px-5 py-2 rounded-lg bg-gold-deep hover:bg-gold-deep text-paper font-bold text-xs cursor-pointer shadow-md"
          >
            Nộp Đơn Đặt Hàng Chính Thức (RFQ)
          </button>
        </div>

      </div>
    </div>
  );
};
