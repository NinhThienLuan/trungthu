import React, { useState } from 'react';
import { MapPin, Phone, Clock, Calendar, Users, CheckCircle2, Sparkles } from 'lucide-react';
import { BOUTIQUE_LOCATIONS } from '../services/catalogService.js';

export const TastingSalonSection = ({ language }) => {
  const [selectedLocation, setSelectedLocation] = useState(BOUTIQUE_LOCATIONS[0].id);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('2026-09-12');
  const [timeSlot, setTimeSlot] = useState('14:30');
  const [attendees, setAttendees] = useState(2);
  const [isCorporate, setIsCorporate] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(null);

  const handleBooking = (e) => {
    e.preventDefault();
    if (!customerName || !phone) {
      alert('Vui lòng điền họ tên và số điện thoại liên hệ!');
      return;
    }

    const loc = BOUTIQUE_LOCATIONS.find((l) => l.id === selectedLocation)?.name || 'Boutique Hoàn Kiếm';

    const booking = {
      id: `TB-NVD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      phone,
      email,
      location: loc,
      date,
      timeSlot,
      attendees,
      isCorporate,
      companyName: isCorporate ? companyName : undefined,
    };

    setBookingConfirmed(booking);
  };

  return (
    <section id="boutiques" className="section-spacing-loose bg-canvas-soft border-b border-border">
      <div className="page-container">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-hover border border-gold/40 text-xs text-gold-light font-semibold mb-3">
            <MapPin className="w-3.5 h-3.5 text-gold-light" />
            <span>{language === 'vi' ? 'HỆ THỐNG SALON THƯỞNG BÁNH' : 'BOUTIQUE SHOWROOMS'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-text tracking-tight">
            {language === 'vi' ? 'Trải Nghiệm Thưởng Trà & Thử Bánh' : 'Boutiques & Tea Tasting Salons'}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-text-muted leading-relaxed">
            {language === 'vi'
              ? 'Kính mời Quý Khách ghé thăm các boutique sang trọng tại Hà Nội và TP.HCM để trực tiếp chiêm ngưỡng các bộ hộp sơn mài và thưởng thức bánh trung thu cùng trà cổ thụ thượng hạng.'
              : 'Visit our flagship heritage boutiques in Hanoi & Saigon to witness exquisite lacquer cases and savor complimentary tea pairings.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: 4 Boutiques Locations */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-serif font-bold text-lg text-text mb-2 flex items-center gap-2">
              <span>Danh Sách Boutique Trưng Bày Chính Thức</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BOUTIQUE_LOCATIONS.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc.id)}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                    selectedLocation === loc.id
                      ? 'bg-surface-hover border-gold ring-1 ring-gold'
                      : 'bg-surface border-border hover:border-border-accent'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-surface-hover text-gold-light">
                        {loc.city}
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-sm text-text mb-1">
                      {loc.name}
                    </h4>
                    <p className="text-xs text-text-muted flex items-start gap-1.5 leading-relaxed">
                      <MapPin className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                      <span>{loc.address}</span>
                    </p>
                    <p className="text-xs text-text-muted flex items-center gap-1.5 mt-2">
                      <Phone className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span className="font-mono text-text">{loc.phone}</span>
                    </p>
                    <p className="text-[11px] text-text-faint flex items-center gap-1.5 mt-1">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{loc.hours}</span>
                    </p>
                  </div>

                  {/* Features */}
                  <div className="mt-3 pt-2.5 border-t border-border flex flex-wrap gap-1">
                    {loc.features.map((f, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-raised text-text-soft border border-border">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Book Tasting Appointment Form */}
          <div className="lg:col-span-5 bg-surface border border-gold/50 rounded-2xl p-6 shadow-xl">
            {bookingConfirmed ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-success-surface border border-success text-success-bright flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-serif font-bold text-text">
                  Đặt Lịch Trải Nghiệm Thành Công!
                </h4>
                <p className="text-xs text-text-soft">
                  Mã xác nhận hẹn: <strong className="text-gold-gradient font-mono">{bookingConfirmed.id}</strong>.
                  Chúng tôi đã giữ bàn thưởng trà riêng tư cho Quý Khách.
                </p>

                <div className="p-3.5 rounded-xl bg-surface-raised border border-border-strong text-left text-xs space-y-2 text-text-muted">
                  <div><strong>Khách hàng:</strong> {bookingConfirmed.customerName} ({bookingConfirmed.phone})</div>
                  <div><strong>Địa điểm:</strong> {bookingConfirmed.location}</div>
                  <div><strong>Thời gian:</strong> {bookingConfirmed.date} vào lúc {bookingConfirmed.timeSlot}</div>
                  <div><strong>Số lượng:</strong> {bookingConfirmed.attendees} người</div>
                </div>

                <button
                  onClick={() => setBookingConfirmed(null)}
                  className="w-full py-2.5 rounded-lg bg-gold-gradient text-ink-on-gold font-bold text-xs cursor-pointer"
                >
                  Đặt Thêm Lịch Hẹn Khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-gold font-semibold uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Đặt Lịch Thưởng Trà & Thử Bánh Miễn Phí</span>
                  </div>
                  <h4 className="font-serif font-bold text-lg text-text">
                    Phòng Trà Nguyệt Viên VIP
                  </h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    Dành cho khách hàng cá nhân và đại diện doanh nghiệp chọn mẫu hộp
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-gold-light font-semibold mb-1">Họ Và Tên *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border text-text focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gold-light font-semibold mb-1">Số Điện Thoại *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="09xx xxx xxx"
                        className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border text-text focus:outline-none focus:border-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-gold-light font-semibold mb-1">Số Người</label>
                      <select
                        value={attendees}
                        onChange={(e) => setAttendees(parseInt(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border text-text focus:outline-none focus:border-gold"
                      >
                        <option value={1}>1 người</option>
                        <option value={2}>2 người</option>
                        <option value={4}>3 - 4 người</option>
                        <option value={6}>5 - 6 người</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gold-light font-semibold mb-1">Ngày Hẹn</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border text-text focus:outline-none focus:border-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-gold-light font-semibold mb-1">Khung Giờ</label>
                      <select
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border text-text focus:outline-none focus:border-gold"
                      >
                        <option value="09:30">09:30 Sáng</option>
                        <option value="11:00">11:00 Trưa</option>
                        <option value="14:30">14:30 Chiều</option>
                        <option value="16:00">16:00 Chiều</option>
                        <option value="18:30">18:30 Tối</option>
                      </select>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 pt-1 text-text-soft cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCorporate}
                      onChange={(e) => setIsCorporate(e.target.checked)}
                      className="accent-gold"
                    />
                    <span>Tôi là đại diện Doanh nghiệp cần thử mẫu cho đơn hàng tập đoàn</span>
                  </label>

                  {isCorporate && (
                    <div>
                      <label className="block text-gold-light font-semibold mb-1">Tên Công Ty</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="VD: Công ty TNHH ABC"
                        className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border text-text focus:outline-none focus:border-gold"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gold-gradient text-ink-on-gold font-bold text-xs hover:brightness-110 cursor-pointer shadow-md"
                  >
                    Xác Nhận Đặt Lịch Hẹn Nếm Thử
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
