// Tự sinh từ bản thiết kế Stitch — giữ nguyên nội dung. Sửa logic ở trang bọc ngoài.
import { Icon } from '../../components/Icon'

export function StitchSellerOrders() {
  return (
    <>
      <div className="flex flex-col w-full px-space-lg py-space-xl max-w-[1360px] mx-auto gap-space-xl">
        {' '}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="flex flex-col max-w-3xl">
            <div className="flex items-center gap-space-xs text-secondary mb-space-xs">
              <Icon name="verified" className="text-[16px]" aria-hidden />
              <span className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-secondary">
                Hệ Thống Phân Phối Chuẩn Lò Nghệ Nhân
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-primary leading-tight">
              Quản Lý Đơn Hàng & Trạng Thái Giao Hàng
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
              Theo dõi vòng đời xử lý đơn hàng, điều phối đơn vị giao nhận hỏa tốc và kiểm soát trạng thái giao hàng
              B2B/B2C toàn quốc theo thời gian thực.
            </p>
          </div>
          <div className="flex items-center gap-space-sm">
            <button className="px-space-md py-2.5 rounded-[0.25rem] bg-surface-container-highest hover:bg-surface-dim text-primary font-body-md text-body-md font-medium transition-all shadow-sm flex items-center gap-2">
              <Icon name="print" className="text-[18px]" aria-hidden />
              <span>In Tem Vận Đơn Hàng Loạt</span>
            </button>
            <button className="px-space-md py-2.5 rounded-[0.25rem] bg-primary hover:bg-ink-dark text-champagne-light font-body-md text-body-md font-semibold transition-all shadow-md flex items-center gap-2">
              <Icon name="add_shopping_cart" className="text-[18px] text-secondary-fixed" aria-hidden />
              <span>Tạo Đơn Giao Mới</span>
            </button>
          </div>
        </div>{' '}
        <div className="relative rounded-[0.5rem] bg-primary text-on-primary p-space-lg shadow-xl overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-[0.75rem] bg-secondary-fixed/10 blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 left-1/4 w-80 h-80 rounded-[0.75rem] bg-tertiary-fixed/10 blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col gap-space-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pb-space-sm">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-[0.25rem] bg-primary-container flex items-center justify-center text-secondary-fixed shadow-inner">
                  <Icon name="analytics" className="text-[24px]" aria-hidden />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-headline-sm text-headline-sm text-champagne-light">
                      Tổng Quan Tiến Độ & Trạng Thái Đơn Hàng
                    </h2>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[0.75rem] bg-tertiary-container text-tertiary-fixed font-label-sm text-label-sm uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-[0.75rem] bg-tertiary-fixed animate-ping"></span>Đang Đồng Bộ
                      Trực Tiếp
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-inverse-on-surface/70 mt-0.5">
                    Kiểm soát tỷ lệ giao hàng đúng hẹn, phân luồng vận đơn và đối soát thanh toán
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-space-sm bg-ink-dark/70 px-space-md py-2 rounded-[0.25rem] self-start lg:self-auto">
                <Icon name="verified_user" className="text-secondary-fixed text-[20px]" aria-hidden />
                <span className="font-body-sm text-body-sm text-champagne-light">
                  100% kiện hàng được đối soát mã vận đơn và cam kết bảo hiểm chất lượng mẻ bánh.
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
              <div className="p-space-md rounded-[0.25rem] bg-primary-container/80 hover:bg-primary-container transition-all flex flex-col justify-between gap-2 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase text-secondary-fixed tracking-wider">
                    Tổng Đơn Hàng
                  </span>
                  <Icon name="receipt_long" className="text-secondary-fixed text-[20px]" aria-hidden />
                </div>
                <div className="font-headline-xl text-[34px] font-bold text-champagne-light leading-none">142</div>
                <div className="flex items-center justify-between text-body-sm text-[12px] text-inverse-on-surface/80 pt-1">
                  <span>Mẻ rằm tháng 8</span>
                  <span className="text-secondary-fixed font-semibold">100%</span>
                </div>
              </div>
              <div className="p-space-md rounded-[0.25rem] bg-primary-container/80 hover:bg-primary-container transition-all flex flex-col justify-between gap-2 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase text-secondary-fixed tracking-wider">
                    Đang Xử Lý
                  </span>
                  <span className="px-2 py-0.5 rounded-[0.125rem] bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold">
                    Chờ xuất kho
                  </span>
                </div>
                <div className="font-headline-xl text-[34px] font-bold text-secondary-container leading-none">28</div>
                <div className="flex items-center justify-between text-body-sm text-[12px] text-inverse-on-surface/80 pt-1">
                  <span>Đóng gói & in logo</span>
                  <span className="text-secondary-fixed-dim font-semibold">19.7%</span>
                </div>
              </div>
              <div className="p-space-md rounded-[0.25rem] bg-primary-container/80 hover:bg-primary-container transition-all flex flex-col justify-between gap-2 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase text-primary-fixed tracking-wider">
                    Đang Vận Chuyển
                  </span>
                  <span className="px-2 py-0.5 rounded-[0.125rem] bg-primary/40 text-primary-fixed font-label-sm text-label-sm font-bold">
                    Trên đường
                  </span>
                </div>
                <div className="font-headline-xl text-[34px] font-bold text-primary-fixed leading-none">45</div>
                <div className="flex items-center justify-between text-body-sm text-[12px] text-inverse-on-surface/80 pt-1">
                  <span>Điều phối 4 đơn vị</span>
                  <span className="text-primary-fixed-dim font-semibold">31.7%</span>
                </div>
              </div>
              <div className="p-space-md rounded-[0.25rem] bg-primary-container/80 hover:bg-primary-container transition-all flex flex-col justify-between gap-2 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase text-tertiary-fixed tracking-wider">
                    Đã Giao Thành Công
                  </span>
                  <span className="px-2 py-0.5 rounded-[0.125rem] bg-tertiary-container text-tertiary-fixed font-label-sm text-label-sm font-bold">
                    Hoàn tất
                  </span>
                </div>
                <div className="font-headline-xl text-[34px] font-bold text-tertiary-fixed leading-none">65</div>
                <div className="flex items-center justify-between text-body-sm text-[12px] text-inverse-on-surface/80 pt-1">
                  <span>Khách đã ký nhận</span>
                  <span className="text-tertiary-fixed font-semibold">45.8%</span>
                </div>
              </div>
              <div className="p-space-md rounded-[0.25rem] bg-primary-container/80 hover:bg-primary-container transition-all flex flex-col justify-between gap-2 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase text-outline-variant tracking-wider">
                    Đã Hủy / Trả Hàng
                  </span>
                  <span className="px-2 py-0.5 rounded-[0.125rem] bg-error-container text-on-error-container font-label-sm text-label-sm font-bold">
                    Hoàn tiền
                  </span>
                </div>
                <div className="font-headline-xl text-[34px] font-bold text-outline-variant leading-none">4</div>
                <div className="flex items-center justify-between text-body-sm text-[12px] text-inverse-on-surface/80 pt-1">
                  <span>Đổi hẹn / hủy B2B</span>
                  <span className="text-outline-variant font-semibold">2.8%</span>
                </div>
              </div>
            </div>
          </div>
        </div>{' '}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-md border-b-0">
          {' '}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button className="px-space-md py-2.5 rounded-[0.25rem] bg-primary text-secondary-fixed font-body-md text-body-md font-semibold whitespace-nowrap shadow-sm">
              Tất Cả Đơn (142)
            </button>
            <button className="px-space-md py-2.5 rounded-[0.25rem] bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-body-md text-body-md font-medium whitespace-nowrap transition-colors">
              Đang Xử Lý (28)
            </button>
            <button className="px-space-md py-2.5 rounded-[0.25rem] bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-body-md text-body-md font-medium whitespace-nowrap transition-colors">
              Đang Giao Hàng (45)
            </button>
            <button className="px-space-md py-2.5 rounded-[0.25rem] bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-body-md text-body-md font-medium whitespace-nowrap transition-colors">
              Đã Giao Thành Công (65)
            </button>
            <button className="px-space-md py-2.5 rounded-[0.25rem] bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-body-md text-body-md font-medium whitespace-nowrap transition-colors">
              Đã Hủy (4)
            </button>
          </div>{' '}
          <div className="flex items-center gap-2">
            {' '}
            <div className="relative flex items-center">
              {' '}
              <Icon name="search" className="absolute left-3 text-outline text-[18px]" aria-hidden />{' '}
              <input
                className="pl-9 pr-space-md py-2 rounded-[0.25rem] bg-surface-container-lowest text-on-surface font-body-sm text-body-sm shadow-sm placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-secondary w-64"
                placeholder="Tìm mã đơn, khách B2B, số xe..."
                type="text"
              />{' '}
            </div>{' '}
            <button className="w-10 h-10 rounded-[0.25rem] bg-surface-container-lowest text-on-surface-variant hover:text-primary shadow-sm flex items-center justify-center transition-colors">
              {' '}
              <Icon name="file_download" className="text-[20px]" aria-hidden />{' '}
            </button>{' '}
          </div>{' '}
        </div>{' '}
        <div className="rounded-[0.5rem] bg-surface-container-lowest shadow-md overflow-hidden flex flex-col">
          {' '}
          <div className="overflow-x-auto">
            {' '}
            <table className="w-full text-left border-collapse">
              {' '}
              <thead>
                {' '}
                <tr className="bg-surface-container text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
                  <th className="py-space-md px-space-md">Mã Đơn & Khách Hàng</th>
                  <th className="py-space-md px-space-md">Chi Tiết Hộp & Quy Cách</th>
                  <th className="py-space-md px-space-md">Giá Trị & Thanh Toán</th>
                  <th className="py-space-md px-space-md">Trạng Thái Vận Chuyển</th>
                  <th className="py-space-md px-space-md">Đơn Vị Giao Nhận & Mã Vận Đơn</th>
                  <th className="py-space-md px-space-md text-right">Thao Tác Bảo Chứng</th>
                </tr>{' '}
              </thead>{' '}
              <tbody className="divide-y-0 font-body-md text-body-md">
                <tr className="hover:bg-surface-container-low/70 transition-colors group cursor-pointer">
                  <td className="py-space-md px-space-md">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-10 h-10 rounded-[0.25rem] bg-primary-container text-secondary-fixed flex items-center justify-center font-headline-sm text-headline-sm">
                        F
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-headline-sm text-[15px] font-semibold text-primary">#ORD-9921</span>
                          <span className="px-2 py-0.5 rounded-[0.125rem] bg-primary/10 text-primary font-label-sm text-label-sm uppercase font-bold">
                            Hợp Đồng B2B
                          </span>
                        </div>
                        <span className="font-medium text-on-surface">Tập đoàn FPT - Khối Nhân Sự</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Người nhận: Ms. Thu Thảo (0918.232.xxx)
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="flex flex-col">
                      <span className="font-medium text-primary">300 Hộp Gỗ Sơn Mài Điêu Khắc</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        6 Bánh Di Sản 200g + 1 Hũ Trà Sen Cung Đình
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-secondary font-medium mt-1">
                        <Icon name="verified" className="text-[13px]" aria-hidden />
                        Khắc chìm kim loại Logo FPT & Lời chúc
                      </span>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-[16px] font-bold text-primary">495.000.000 đ</span>
                      <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary-fixed-dim uppercase bg-primary-container px-2 py-0.5 rounded-[0.125rem] mt-1 self-start">
                        Đã Đặt Cọc 50% (HĐ B2B)
                      </span>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[0.75rem] bg-primary/10 text-primary font-label-sm text-label-sm font-bold self-start">
                        <span className="w-1.5 h-1.5 rounded-[0.75rem] bg-primary animate-pulse"></span>Đang Vận Chuyển
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant text-[11px]">
                        Cập nhật: 10:45 Hôm nay • Dự kiến đến 14:00
                      </span>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <Icon name="local_shipping" className="text-[16px] text-secondary" aria-hidden />
                        <span className="font-medium text-on-surface">Xe Tải Doanh Nghiệp (Đông Phương)</span>
                      </div>
                      <div className="flex items-center gap-1 font-label-sm text-label-sm text-primary font-semibold mt-0.5">
                        <span className="text-on-surface-variant font-normal">Mã vận đơn:</span>
                        <span className="font-mono">#DP-HN-9921</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="w-9 h-9 rounded-[0.25rem] bg-surface-container hover:bg-surface-dim text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors"
                        title="In Phiếu Giao Có QR Code"
                      >
                        <Icon name="qr_code_2" className="text-[18px]" aria-hidden />
                      </button>
                      <button
                        className="w-9 h-9 rounded-[0.25rem] bg-surface-container hover:bg-surface-dim text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors"
                        title="In Tem Vận Đơn"
                      >
                        <Icon name="label" className="text-[18px]" aria-hidden />
                      </button>
                      <button
                        className="px-3 py-1.5 rounded-[0.25rem] bg-primary hover:bg-ink-dark text-champagne-light font-body-sm text-body-sm font-medium transition-colors flex items-center gap-1"
                        title="Xem Chi Tiết Lô Giao"
                      >
                        <span>Chi tiết</span>
                        <Icon name="chevron_right" className="text-[16px]" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container-low/70 transition-colors group cursor-pointer">
                  <td className="py-space-md px-space-md">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-10 h-10 rounded-[0.25rem] bg-secondary-fixed/20 text-secondary flex items-center justify-center font-headline-sm text-headline-sm">
                        Y
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-headline-sm text-[15px] font-semibold text-primary">#ORD-9922</span>
                          <span className="px-2 py-0.5 rounded-[0.125rem] bg-secondary-container text-on-secondary-container font-label-sm text-label-sm uppercase font-bold">
                            Khách VIP
                          </span>
                        </div>
                        <span className="font-medium text-on-surface">Bác sĩ Trần Hải Yến</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Biệt thự Vinhome Riverside, Long Biên
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="flex flex-col">
                      <span className="font-medium text-primary">04 Hộp Bát Tiên Quá Hải Sơn Mài Thếp Vàng</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Nhân Yến Sào Vi Cá & Bào Ngư Sốt Rượu Vang
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-secondary font-medium mt-1">
                        <Icon name="card_giftcard" className="text-[13px]" aria-hidden />
                        Kèm thiệp lụa viết tay calligraphy
                      </span>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-[16px] font-bold text-primary">19.200.000 đ</span>
                      <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-tertiary-fixed font-semibold uppercase bg-tertiary-container px-2 py-0.5 rounded-[0.125rem] mt-1 self-start">
                        Đã Thanh Toán 100%
                      </span>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[0.75rem] bg-tertiary-container text-tertiary-fixed font-label-sm text-label-sm font-bold self-start">
                        <span className="w-1.5 h-1.5 rounded-[0.75rem] bg-tertiary-fixed"></span>Đã Giao Thành Công
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant text-[11px]">
                        Cập nhật: 11:25 Hôm nay • Đã ký nhận
                      </span>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <Icon name="two_wheeler" className="text-[16px] text-secondary" aria-hidden />
                        <span className="font-medium text-on-surface">GrabExpress Hỏa Tốc VIP</span>
                      </div>
                      <div className="flex items-center gap-1 font-label-sm text-label-sm text-primary font-semibold mt-0.5">
                        <span className="text-on-surface-variant font-normal">Mã vận đơn:</span>
                        <span className="font-mono">#GE-884920</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="w-9 h-9 rounded-[0.25rem] bg-surface-container hover:bg-surface-dim text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors"
                        title="In Phiếu Giao Có QR Code"
                      >
                        <Icon name="qr_code_2" className="text-[18px]" aria-hidden />
                      </button>
                      <button
                        className="w-9 h-9 rounded-[0.25rem] bg-surface-container hover:bg-surface-dim text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors"
                        title="In Tem Vận Đơn"
                      >
                        <Icon name="label" className="text-[18px]" aria-hidden />
                      </button>
                      <button
                        className="px-3 py-1.5 rounded-[0.25rem] bg-primary hover:bg-ink-dark text-champagne-light font-body-sm text-body-sm font-medium transition-colors flex items-center gap-1"
                        title="Xem Chi Tiết Lô Giao"
                      >
                        <span>Chi tiết</span>
                        <Icon name="chevron_right" className="text-[16px]" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container-low/70 transition-colors group cursor-pointer">
                  <td className="py-space-md px-space-md">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-10 h-10 rounded-[0.25rem] bg-primary-container text-secondary-fixed flex items-center justify-center font-headline-sm text-headline-sm">
                        A
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-headline-sm text-[15px] font-semibold text-primary">#ORD-9924</span>
                          <span className="px-2 py-0.5 rounded-[0.125rem] bg-primary/10 text-primary font-label-sm text-label-sm uppercase font-bold">
                            Hợp Đồng B2B
                          </span>
                        </div>
                        <span className="font-medium text-on-surface">Ngân Hàng ACB - Chi Nhánh Cầu Giấy</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Người nhận: PGĐ Nguyễn Kiều My
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="flex flex-col">
                      <span className="font-medium text-primary">120 Hộp Nguyệt Viên Hoàng Kim (Bản Da Cao Cấp)</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Thập cẩm lạp xưởng đùi gà quay + Đậu xanh hạt sen dừa
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-secondary font-medium mt-1">
                        <Icon name="workspace_premium" className="text-[13px]" aria-hidden />
                        Ép kim vàng dập nổi biểu trưng ACB Private Banking
                      </span>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-[16px] font-bold text-primary">168.000.000 đ</span>
                      <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-tertiary-fixed font-semibold uppercase bg-tertiary-container px-2 py-0.5 rounded-[0.125rem] mt-1 self-start">
                        Đã Thanh Toán 100%
                      </span>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[0.75rem] bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold self-start">
                        <span className="w-1.5 h-1.5 rounded-[0.75rem] bg-secondary"></span>Đang Xử Lý (Chờ Xuất Kho)
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant text-[11px]">
                        Cập nhật: 09:30 Hôm nay • Đang hoàn thiện nẹp
                      </span>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <Icon name="local_shipping" className="text-[16px] text-secondary" aria-hidden />
                        <span className="font-medium text-on-surface">Viettel Post Hỏa Tốc</span>
                      </div>
                      <div className="flex items-center gap-1 font-label-sm text-label-sm text-primary font-semibold mt-0.5">
                        <span className="text-on-surface-variant font-normal">Mã vận đơn:</span>
                        <span className="font-mono">#VTP-982141</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="w-9 h-9 rounded-[0.25rem] bg-surface-container hover:bg-surface-dim text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors"
                        title="In Phiếu Giao Có QR Code"
                      >
                        <Icon name="qr_code_2" className="text-[18px]" aria-hidden />
                      </button>
                      <button
                        className="w-9 h-9 rounded-[0.25rem] bg-surface-container hover:bg-surface-dim text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors"
                        title="In Tem Vận Đơn"
                      >
                        <Icon name="label" className="text-[18px]" aria-hidden />
                      </button>
                      <button
                        className="px-3 py-1.5 rounded-[0.25rem] bg-primary hover:bg-ink-dark text-champagne-light font-body-sm text-body-sm font-medium transition-colors flex items-center gap-1"
                        title="Xem Chi Tiết Lô Giao"
                      >
                        <span>Chi tiết</span>
                        <Icon name="chevron_right" className="text-[16px]" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container-low/70 transition-colors group cursor-pointer">
                  <td className="py-space-md px-space-md">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-10 h-10 rounded-[0.25rem] bg-primary-container text-secondary-fixed flex items-center justify-center font-headline-sm text-headline-sm">
                        V
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-headline-sm text-[15px] font-semibold text-primary">#ORD-9925</span>
                          <span className="px-2 py-0.5 rounded-[0.125rem] bg-primary/10 text-primary font-label-sm text-label-sm uppercase font-bold">
                            Hỏa Tốc Hàng Không
                          </span>
                        </div>
                        <span className="font-medium text-on-surface">VinaCapital Private Client Group</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Tòa nhà Sun Wah Tower, Quận 1, TP.HCM
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="flex flex-col">
                      <span className="font-medium text-primary">85 Hộp Bát Tràng Độc Bản Sơn Son Thiếp Vàng</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Nhân Hoàng Triều Thập Cẩm Bát Bửu Đặc Biệt
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-secondary font-medium mt-1">
                        <Icon name="flight_takeoff" className="text-[13px]" aria-hidden />
                        Thùng nẹp xốp IATA chuyên dụng
                      </span>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-[16px] font-bold text-primary">153.000.000 đ</span>
                      <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-tertiary-fixed font-semibold uppercase bg-tertiary-container px-2 py-0.5 rounded-[0.125rem] mt-1 self-start">
                        Đã Thanh Toán 100%
                      </span>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[0.75rem] bg-primary/10 text-primary font-label-sm text-label-sm font-bold self-start">
                        <span className="w-1.5 h-1.5 rounded-[0.75rem] bg-primary animate-pulse"></span>Đang Vận Chuyển
                        (Hàng Không)
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant text-[11px]">
                        Cập nhật: 10:10 Hôm nay • Đã lên chuyến VN219
                      </span>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <Icon name="flight" className="text-[16px] text-secondary" aria-hidden />
                        <span className="font-medium text-on-surface">Giao Hàng Nhanh (Hàng Không VN219)</span>
                      </div>
                      <div className="flex items-center gap-1 font-label-sm text-label-sm text-primary font-semibold mt-0.5">
                        <span className="text-on-surface-variant font-normal">Mã vận đơn:</span>
                        <span className="font-mono">#GHN-AIR-99124</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="w-9 h-9 rounded-[0.25rem] bg-surface-container hover:bg-surface-dim text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors"
                        title="In Phiếu Giao Có QR Code"
                      >
                        <Icon name="qr_code_2" className="text-[18px]" aria-hidden />
                      </button>
                      <button
                        className="w-9 h-9 rounded-[0.25rem] bg-surface-container hover:bg-surface-dim text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors"
                        title="In Tem Vận Đơn"
                      >
                        <Icon name="label" className="text-[18px]" aria-hidden />
                      </button>
                      <button
                        className="px-3 py-1.5 rounded-[0.25rem] bg-primary hover:bg-ink-dark text-champagne-light font-body-sm text-body-sm font-medium transition-colors flex items-center gap-1"
                        title="Xem Chi Tiết Lô Giao"
                      >
                        <span>Chi tiết</span>
                        <Icon name="chevron_right" className="text-[16px]" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>{' '}
            </table>{' '}
          </div>{' '}
          <div className="flex flex-col sm:flex-row items-center justify-between p-space-md bg-surface-container-low text-on-surface-variant font-body-sm text-body-sm">
            {' '}
            <div className="flex items-center gap-2">
              {' '}
              <span>Hiển thị 4 trong tổng số 142 đơn mẻ rằm tháng 8</span>{' '}
              <span className="text-outline-variant">•</span>{' '}
              <span className="text-secondary font-medium">Bảo hiểm 100% chất lượng bánh vẹn nguyên</span>{' '}
            </div>{' '}
            <div className="flex items-center gap-1 mt-2 sm:mt-0">
              {' '}
              <button
                className="px-3 py-1.5 rounded-[0.125rem] bg-surface-container-highest text-on-surface font-medium hover:bg-surface-dim transition-colors disabled:opacity-50"
                disabled
              >
                Trang trước
              </button>{' '}
              <button className="w-8 h-8 rounded-[0.125rem] bg-primary text-champagne-light font-medium flex items-center justify-center">
                1
              </button>{' '}
              <button className="w-8 h-8 rounded-[0.125rem] hover:bg-surface-container text-on-surface font-medium flex items-center justify-center transition-colors">
                2
              </button>{' '}
              <button className="w-8 h-8 rounded-[0.125rem] hover:bg-surface-container text-on-surface font-medium flex items-center justify-center transition-colors">
                3
              </button>{' '}
              <span className="px-1 text-outline">...</span>{' '}
              <button className="w-8 h-8 rounded-[0.125rem] hover:bg-surface-container text-on-surface font-medium flex items-center justify-center transition-colors">
                12
              </button>{' '}
              <button className="px-3 py-1.5 rounded-[0.125rem] bg-surface-container-highest text-on-surface font-medium hover:bg-surface-dim transition-colors">
                Trang tiếp
              </button>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
        <div
          className="fixed inset-0 bg-ink-dark/60 backdrop-blur-xs z-50 transition-opacity duration-300 opacity-0 pointer-events-none"
          id="drawerOverlay"
        ></div>{' '}
        <aside
          className="fixed top-0 right-0 h-full w-full max-w-2xl bg-surface-container-lowest shadow-2xl z-50 flex flex-col justify-between transform translate-x-full transition-transform duration-300 ease-out overflow-y-auto"
          id="deliveryDrawer"
        >
          {' '}
          <div className="p-space-lg bg-primary-container text-on-primary flex items-start justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-[0.125rem] bg-secondary text-champagne-light font-label-sm text-label-sm uppercase tracking-wider font-bold">
                  Hồ Sơ Giao Nhận Hỏa Tốc
                </span>
                <span className="font-headline-sm text-[18px] text-champagne-light font-semibold" id="drawerOrderId">
                  #ORD-9921
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md text-champagne-light mt-1" id="drawerCustomerName">
                Tập Đoàn FPT - Khối Nhân Sự
              </h3>
              <p className="font-body-sm text-body-sm text-inverse-on-surface/80">
                Lô B2B 300 Hộp Sơn Mài Cao Cấp • Niêm phong an toàn chống va đập
              </p>
            </div>
            <button className="w-9 h-9 rounded-[0.25rem] bg-ink-dark/40 hover:bg-ink-dark text-champagne-light flex items-center justify-center transition-colors">
              <Icon name="close" className="text-[20px]" aria-hidden />
            </button>
          </div>{' '}
          <div className="p-space-lg flex flex-col gap-space-lg">
            {' '}
            <div className="rounded-[0.25rem] bg-surface-container p-space-md flex flex-col sm:flex-row items-center gap-space-md">
              {' '}
              <div className="w-24 h-24 rounded-[0.25rem] bg-primary overflow-hidden flex-shrink-0 relative">
                {' '}
                <img
                  className="w-full h-full object-cover"
                  data-alt="Exquisite Vietnamese lacquer mooncake box with embossed gold leaf lotus motifs, accompanied by traditional artisanal baked mooncakes with golden crust and porcelain tea cups on dark wood surface"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_Lt-Z8XRs-g1YGaoo15xQX-9IviaSgnC3cb29zrWAG84mV3tNg7FgVeRK2I3bRVjR6MH0ZvmgpO79k330ZpDmOauuz3qXh4Hfz7o7WDlSM6P5mIyfutkqijNCeHxAjdvzME6r82ZNG4WTTmBF5Bt1aeiLLCPFTOC9vd4IDc_OdxVXq75BwTNui_hiiWDr7qfIYsCHdVDQO5VMYGxDDlJJSzBPqFlXB4RW593v11cDGS1gdyujj4V_"
                />{' '}
              </div>{' '}
              <div className="flex flex-col flex-1">
                {' '}
                <span className="font-label-sm text-label-sm uppercase text-secondary font-bold">
                  Quy Cách Hộp Quà Doanh Nghiệp
                </span>{' '}
                <h4 className="font-headline-sm text-headline-sm text-primary">Bộ Nguyệt Viên Sơn Mài Hoàng Gia</h4>{' '}
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Bao gồm 6 bánh nướng truyền thống 200g (Thập cẩm jambon vi cá, Hạt sen trà xanh, Cốm non trứng
                  muối...) & 1 Hũ Trà Sen Thượng Hạng.
                </p>{' '}
              </div>{' '}
            </div>{' '}
            <div className="rounded-[0.25rem] bg-tertiary-container/30 p-space-md flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="inventory_2" className="text-secondary text-[22px]" aria-hidden />
                  <span className="font-body-md text-body-md font-semibold text-primary">
                    Quy Chuẩn Đóng Gói An Toàn Kiện Hàng
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-[0.125rem] bg-tertiary-container text-tertiary-fixed font-label-sm text-label-sm font-bold">
                  ĐÃ KIỂM ĐỊNH XUẤT KHO
                </span>
              </div>
              <div className="grid grid-cols-3 gap-space-sm pt-space-xs text-center">
                <div className="p-space-xs rounded-[0.125rem] bg-surface-container-lowest shadow-xs">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Quy cách thùng</span>
                  <span className="font-headline-sm text-[14px] text-primary block mt-0.5 font-bold">Carton 5 lớp</span>
                </div>
                <div className="p-space-xs rounded-[0.125rem] bg-surface-container-lowest shadow-xs">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Niêm phong chì</span>
                  <span className="font-headline-sm text-[14px] text-secondary block mt-0.5 font-bold">
                    Mã #SEAL-988
                  </span>
                </div>
                <div className="p-space-xs rounded-[0.125rem] bg-surface-container-lowest shadow-xs">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Chống sốc</span>
                  <span className="font-headline-sm text-[14px] text-primary block mt-0.5 font-bold">
                    Xốp bóng khí 3 lớp
                  </span>
                </div>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant text-[11px] italic">
                *Kiện hàng bảo hiểm 100% giá trị bồi thường nếu có va chạm hoặc móp méo hộp quà di sản.
              </span>
            </div>{' '}
            <div className="flex flex-col gap-2">
              {' '}
              <div className="flex items-center justify-between">
                {' '}
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                  Lộ Trình Xe Giao Hàng Hỏa Tốc (GPS Trực Tuyến)
                </span>{' '}
                <span className="text-secondary font-body-sm text-body-sm font-medium">Xe 15C-882.19</span>{' '}
              </div>{' '}
              <div
                className="w-full h-48 rounded-[0.5rem] bg-cover bg-center relative overflow-hidden shadow-inner flex items-end p-space-sm"
                data-location="Cau Dat, Hai Phong, Vietnam to Duy Tan, Cau Giay, Hanoi, Vietnam"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBPZpjlzw_FUqAliR6vF5nzi0LF250BUGxJyS01vqCwNeilvrDo0aQW3R1pbs1BmC8h8XvLqmVHrX8FBk6j4NRn2f60jFftpHOQI1i8rL0Gd7AkD-B19yguisgiYet9_HfDBRHWwG4JldqpraITLUqmaRg1AzI56O0uwFFAJYgY9u92fF3imrMyqnMerOGJJ4D_8yjUCpXaUdkYD6-_SgPTy2X7x-1WK7HJIjjQ9oDrZaNPUoKMFu5F')",
                }}
              >
                {' '}
                <div className="bg-primary-container/90 backdrop-blur-xs p-2.5 rounded-[0.25rem] text-on-primary flex items-center gap-space-sm w-full">
                  {' '}
                  <Icon
                    name="navigation"
                    className="text-secondary-fixed text-[20px] animate-bounce"
                    aria-hidden
                  />{' '}
                  <div className="flex flex-col">
                    {' '}
                    <span className="font-body-sm text-body-sm font-semibold text-champagne-light">
                      Đang di chuyển trên Cao tốc Hà Nội - Hải Phòng (Km 64)
                    </span>{' '}
                    <span className="font-label-sm text-label-sm text-inverse-on-surface/80">
                      Tốc độ: 78 km/h • Thời gian ước tính tới điểm giao: 54 phút
                    </span>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
            <div className="flex flex-col gap-space-sm">
              {' '}
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                Tiến Trình Chế Tác & Vận Hành
              </span>{' '}
              <div className="relative pl-6 flex flex-col gap-space-md">
                {' '}
                <div className="absolute top-2 left-2 bottom-2 w-0.5 bg-surface-container-highest"></div>{' '}
                <div className="relative flex flex-col">
                  {' '}
                  <span className="absolute -left-6 top-1 w-4 h-4 rounded-[0.75rem] bg-primary flex items-center justify-center text-white">
                    {' '}
                    <Icon name="done" className="text-[10px]" aria-hidden />{' '}
                  </span>{' '}
                  <span className="font-body-sm text-body-sm font-bold text-primary">
                    05:30 Sáng • Mẻ Bánh Ra Lò & Kiểm Tra Vi Sinh OCOP
                  </span>{' '}
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Nghệ nhân thẩm định cốt bánh mềm ẩm, tỷ lệ trứng muối đạt chuẩn tâm điểm.
                  </span>{' '}
                </div>{' '}
                <div className="relative flex flex-col">
                  {' '}
                  <span className="absolute -left-6 top-1 w-4 h-4 rounded-[0.75rem] bg-primary flex items-center justify-center text-white">
                    {' '}
                    <Icon name="done" className="text-[10px]" aria-hidden />{' '}
                  </span>{' '}
                  <span className="font-body-sm text-body-sm font-bold text-primary">
                    08:00 Sáng • Đóng Thùng Sơn Mài & Niêm Phong Chống Giả
                  </span>{' '}
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Gắn tem chip NFC xác thực xuất xứ Lò Đông Phương Hải Phòng.
                  </span>{' '}
                </div>{' '}
                <div className="relative flex flex-col">
                  <span className="absolute -left-6 top-1 w-4 h-4 rounded-[0.75rem] bg-secondary flex items-center justify-center text-white animate-pulse">
                    <Icon name="local_shipping" className="text-[10px]" aria-hidden />
                  </span>
                  <span className="font-body-sm text-body-sm font-bold text-secondary">
                    09:15 Sáng • Bàn Giao Đơn Vị Vận Chuyển Hỏa Tốc
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Kiện hàng đã xuất kho, niêm phong mộc lò và kích hoạt định vị hành trình.
                  </span>
                </div>{' '}
                <div className="relative flex flex-col opacity-60">
                  <span className="absolute -left-6 top-1 w-4 h-4 rounded-[0.75rem] bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                    <Icon name="schedule" className="text-[10px]" aria-hidden />
                  </span>
                  <span className="font-body-sm text-body-sm font-semibold text-on-surface">
                    Dự kiến 11:30 Trưa • Bàn Giao Kèm Biên Bản Nghiệm Thu & Ký Nhận
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Đại diện Ban Giám Đốc FPT kiểm đếm và ký nhận đối soát mã vận đơn.
                  </span>
                </div>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
          <div className="p-space-lg bg-surface-container flex items-center justify-between gap-space-sm">
            {' '}
            <button className="px-space-md py-2.5 rounded-[0.25rem] bg-surface-container-lowest hover:bg-surface-dim text-primary font-body-md text-body-md font-medium shadow-sm transition-colors flex items-center gap-2">
              {' '}
              <Icon name="print" className="text-[18px]" aria-hidden /> <span>In Toàn Bộ Hồ Sơ</span>{' '}
            </button>{' '}
            <div className="flex items-center gap-2">
              {' '}
              <button className="px-space-md py-2.5 rounded-[0.25rem] bg-surface-container-lowest hover:bg-surface-dim text-error font-body-md text-body-md font-medium shadow-sm transition-colors flex items-center gap-1.5">
                {' '}
                <Icon name="report_problem" className="text-[18px]" aria-hidden /> <span>Báo Sự Cố Xe</span>{' '}
              </button>{' '}
              <button className="px-space-lg py-2.5 rounded-[0.25rem] bg-primary hover:bg-ink-dark text-champagne-light font-body-md text-body-md font-semibold shadow-md transition-colors">
                {' Đóng Cửa Sổ '}
              </button>{' '}
            </div>{' '}
          </div>{' '}
        </aside>{' '}
      </div>{' '}
    </>
  )
}
