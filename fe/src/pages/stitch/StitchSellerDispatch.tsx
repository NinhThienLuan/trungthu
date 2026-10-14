// Tự sinh từ bản thiết kế Stitch — giữ nguyên nội dung. Sửa logic ở trang bọc ngoài.
import { Icon } from '../../components/Icon'

export function StitchSellerDispatch() {
  return (
    <>
      <div className="flex flex-col w-full">
        {' '}
        <div className="relative w-full bg-primary-container text-on-primary px-margin py-space-xl overflow-hidden shadow-xl">
          {' '}
          <div className="absolute -right-24 -top-24 w-96 h-96 rounded-[0.75rem] bg-secondary/10 blur-3xl pointer-events-none"></div>{' '}
          <div className="absolute left-1/3 -bottom-20 w-80 h-80 rounded-[0.75rem] bg-tertiary-container/30 blur-2xl pointer-events-none"></div>{' '}
          <div className="relative z-10 max-w-[1320px] mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
            {' '}
            <div className="flex flex-col max-w-3xl">
              {' '}
              <div className="flex items-center gap-space-xs text-secondary-fixed mb-space-xs">
                {' '}
                <Icon name="hub" className="text-[18px]" aria-hidden />{' '}
                <span className="font-label-sm text-label-sm uppercase tracking-[0.22em] text-secondary-fixed">
                  Tổng Đài Tối Cao • Super Admin Logistics Hub
                </span>{' '}
              </div>{' '}
              <h1 className="font-headline-xl text-headline-xl text-champagne-light tracking-tight">
                {' Trung Tâm Điều Phối & San Tải Đơn Hàng Lớn B2B '}
              </h1>{' '}
              <p className="font-body-md text-body-md text-surface-container-high mt-space-sm leading-relaxed max-w-2xl font-light">
                {
                  ' Thuật toán phân bổ tự động và can thiệp thủ công các hợp đồng quà biếu từ 5.000 đến 50.000 hộp cho mạng lưới 42 xưởng nghệ nhân di sản. Tối ưu nhiệt lượng lò than củi, kiểm soát ẩm độ và bảo chứng nghiêm ngặt hạn trả mẻ trước thềm Trung Thu. '
                }
              </p>{' '}
            </div>{' '}
            <div className="flex flex-wrap items-center gap-space-sm">
              {' '}
              <div className="px-space-md py-space-xs rounded-[0.25rem] bg-ink-dark/60 backdrop-blur-md flex items-center gap-space-sm shadow-inner">
                {' '}
                <span className="w-2.5 h-2.5 rounded-[0.75rem] bg-secondary-fixed animate-pulse"></span>{' '}
                <div className="flex flex-col">
                  {' '}
                  <span className="font-label-sm text-label-sm text-secondary-fixed-dim uppercase tracking-wider">
                    Hệ Thống Lò Nghệ Nhân
                  </span>{' '}
                  <span className="font-body-sm text-body-sm text-champagne-light font-semibold">
                    42 Xưởng Trực Tuyến
                  </span>{' '}
                </div>{' '}
              </div>{' '}
              <button
                className="px-space-md py-3 rounded-[0.125rem] bg-secondary text-champagne-light hover:bg-gold-burnished hover:text-ink-dark transition-all duration-300 font-label-lg text-label-lg uppercase tracking-wider flex items-center gap-space-xs shadow-md"
                id="btn-rebalance"
              >
                {' '}
                <Icon name="auto_mode" className="text-[18px]" aria-hidden /> <span>Khởi Chạy San Tải Tự Động</span>{' '}
              </button>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
        <div className="w-full max-w-[1320px] mx-auto px-margin py-space-xl flex flex-col gap-space-xl">
          {' '}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-space-md -mt-12 relative z-20">
            {' '}
            <div className="bg-surface-container-lowest p-space-lg rounded-[0.5rem] shadow-md flex flex-col justify-between relative overflow-hidden group hover:shadow-xl transition-shadow duration-300">
              {' '}
              <div className="absolute top-0 left-0 w-1.5 h-full bg-secondary"></div>{' '}
              <div className="flex justify-between items-start">
                {' '}
                <div className="flex flex-col">
                  {' '}
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-[0.16em]">
                    Tổng Lượng Hợp Đồng B2B Đã Chốt
                  </span>{' '}
                  <div className="flex items-baseline gap-2 mt-2">
                    {' '}
                    <span className="font-headline-lg text-headline-lg text-primary tracking-tight font-semibold">
                      148.500
                    </span>{' '}
                    <span className="font-body-sm text-body-sm text-on-surface-variant uppercase">Hộp</span>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="w-10 h-10 rounded-[0.25rem] bg-surface-container-low flex items-center justify-center text-secondary">
                  {' '}
                  <Icon name="inventory_2" className="text-[24px]" aria-hidden />{' '}
                </div>{' '}
              </div>{' '}
              <div className="mt-space-md pt-space-xs flex items-center justify-between">
                {' '}
                <span className="font-body-sm text-body-sm text-on-surface-variant">Tổng giá trị luân chuyển</span>{' '}
                <span className="font-body-md text-body-md font-semibold text-secondary">126.8 Tỷ VNĐ</span>{' '}
              </div>{' '}
            </div>{' '}
            <div className="bg-surface-container-lowest p-space-lg rounded-[0.5rem] shadow-md flex flex-col justify-between relative overflow-hidden group hover:shadow-xl transition-shadow duration-300">
              {' '}
              <div className="absolute top-0 left-0 w-1.5 h-full bg-tertiary-container"></div>{' '}
              <div className="flex justify-between items-start">
                {' '}
                <div className="flex flex-col">
                  {' '}
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-[0.16em]">
                    Công Suất Mộc Toàn Sàn Khả Dụng
                  </span>{' '}
                  <div className="flex items-baseline gap-2 mt-2">
                    {' '}
                    <span className="font-headline-lg text-headline-lg text-primary tracking-tight font-semibold">
                      28.500
                    </span>{' '}
                    <span className="font-body-sm text-body-sm text-on-surface-variant uppercase">Hộp Còn Lại</span>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="w-10 h-10 rounded-[0.25rem] bg-surface-container-low flex items-center justify-center text-primary-container">
                  {' '}
                  <Icon name="soup_kitchen" className="text-[24px]" aria-hidden />{' '}
                </div>{' '}
              </div>{' '}
              <div className="mt-space-md pt-space-xs flex items-center justify-between">
                {' '}
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Hạn chót tiếp nhận mẻ tươi
                </span>{' '}
                <span className="font-body-sm text-body-sm font-semibold text-error px-2 py-0.5 rounded-[0.125rem] bg-error-container/50">
                  14/8 Âm Lịch
                </span>{' '}
              </div>{' '}
            </div>{' '}
            <div className="bg-primary-container text-champagne-light p-space-lg rounded-[0.5rem] shadow-lg flex flex-col justify-between relative overflow-hidden">
              {' '}
              <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-[0.75rem] bg-secondary/15 blur-xl"></div>{' '}
              <div className="flex justify-between items-start relative z-10">
                {' '}
                <div className="flex flex-col">
                  {' '}
                  <span className="font-label-sm text-label-sm text-secondary-fixed uppercase tracking-[0.16em]">
                    Chờ San Tải Quy Mô Lớn
                  </span>{' '}
                  <div className="flex items-baseline gap-2 mt-2">
                    {' '}
                    <span className="font-headline-lg text-headline-lg text-champagne-light tracking-tight font-semibold">
                      41.500
                    </span>{' '}
                    <span className="font-body-sm text-body-sm text-secondary-fixed-dim uppercase">
                      Hộp / 4 Tập Đoàn
                    </span>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="w-10 h-10 rounded-[0.25rem] bg-ink-dark/60 flex items-center justify-center text-secondary-fixed">
                  {' '}
                  <Icon name="pending_actions" className="text-[24px]" aria-hidden />{' '}
                </div>{' '}
              </div>{' '}
              <div className="mt-space-md pt-space-xs relative z-10 flex items-center gap-1.5 overflow-x-auto text-[11px] font-body-sm">
                {' '}
                <span className="px-2 py-0.5 rounded-[0.125rem] bg-ink-dark/80 text-secondary-fixed-dim">
                  Sun Group (15k)
                </span>{' '}
                <span className="px-2 py-0.5 rounded-[0.125rem] bg-ink-dark/80 text-secondary-fixed-dim">
                  FPT (12k)
                </span>{' '}
                <span className="px-2 py-0.5 rounded-[0.125rem] bg-ink-dark/80 text-secondary-fixed-dim">
                  MB Bank (8.5k)
                </span>{' '}
                <span className="px-2 py-0.5 rounded-[0.125rem] bg-ink-dark/80 text-secondary-fixed-dim">
                  Masan (6k)
                </span>{' '}
              </div>{' '}
            </div>{' '}
          </section>{' '}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            {' '}
            <div className="lg:col-span-5 bg-surface-container-lowest p-space-lg rounded-[0.5rem] shadow-md flex flex-col gap-space-md">
              {' '}
              <div className="flex items-center justify-between pb-space-xs">
                {' '}
                <div className="flex flex-col">
                  {' '}
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">
                    Ma Trận Công Suất Lò
                  </span>{' '}
                  <h3 className="font-headline-sm text-headline-sm text-primary">Tải Trọng 3 Cụm Miền</h3>{' '}
                </div>{' '}
                <Icon name="tune" className="text-outline text-[20px]" aria-hidden />{' '}
              </div>{' '}
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {' Theo dõi trực tiếp công suất mộc, nhiệt lượng lò than củi và độ trễ ra vỉ tại các xưởng hạt nhân. '}
              </p>{' '}
              <div className="flex flex-col gap-1.5 p-space-sm rounded-[0.25rem] bg-surface-container-low">
                {' '}
                <div className="flex justify-between items-center">
                  {' '}
                  <div className="flex items-center gap-space-xs">
                    {' '}
                    <span className="w-2 h-2 rounded-[0.75rem] bg-error animate-ping"></span>{' '}
                    <span className="font-body-md text-body-md font-semibold text-primary">
                      Cụm Miền Bắc (Hải Phòng & Hà Nội)
                    </span>{' '}
                  </div>{' '}
                  <span className="font-label-md text-label-md font-bold text-error">88% Tải (Cận Biên)</span>{' '}
                </div>{' '}
                <div className="w-full h-3 rounded-[0.75rem] bg-surface-container-high overflow-hidden">
                  {' '}
                  <div
                    className="h-full rounded-[0.75rem] bg-error transition-all duration-700"
                    style={{ width: '88%' }}
                  ></div>{' '}
                </div>{' '}
                <div className="flex justify-between text-[11px] text-on-surface-variant mt-0.5">
                  {' '}
                  <span>22 Lò nghệ nhân • Đã nhận: 74.800 hộp</span> <span>Trống: 10.200</span>{' '}
                </div>{' '}
              </div>{' '}
              <div className="flex flex-col gap-1.5 p-space-sm rounded-[0.25rem] bg-surface-container-low">
                {' '}
                <div className="flex justify-between items-center">
                  {' '}
                  <div className="flex items-center gap-space-xs">
                    {' '}
                    <span className="w-2 h-2 rounded-[0.75rem] bg-secondary"></span>{' '}
                    <span className="font-body-md text-body-md font-semibold text-primary">
                      Cụm Miền Trung (Huế & Hội An)
                    </span>{' '}
                  </div>{' '}
                  <span className="font-label-md text-label-md font-bold text-secondary">72% Tải (Lý Tưởng)</span>{' '}
                </div>{' '}
                <div className="w-full h-3 rounded-[0.75rem] bg-surface-container-high overflow-hidden">
                  {' '}
                  <div
                    className="h-full rounded-[0.75rem] bg-secondary transition-all duration-700"
                    style={{ width: '72%' }}
                  ></div>{' '}
                </div>{' '}
                <div className="flex justify-between text-[11px] text-on-surface-variant mt-0.5">
                  {' '}
                  <span>8 Lò nghệ nhân Cung Đình • Đã nhận: 32.400 hộp</span> <span>Trống: 12.600</span>{' '}
                </div>{' '}
              </div>{' '}
              <div className="flex flex-col gap-1.5 p-space-sm rounded-[0.25rem] bg-surface-container-low">
                {' '}
                <div className="flex justify-between items-center">
                  {' '}
                  <div className="flex items-center gap-space-xs">
                    {' '}
                    <span className="w-2 h-2 rounded-[0.75rem] bg-tertiary-container"></span>{' '}
                    <span className="font-body-md text-body-md font-semibold text-primary">
                      Cụm Miền Nam (Chợ Lớn Sài Gòn & Long An)
                    </span>{' '}
                  </div>{' '}
                  <span className="font-label-md text-label-md font-bold text-on-tertiary-container">
                    65% Tải (Dồi Dào)
                  </span>{' '}
                </div>{' '}
                <div className="w-full h-3 rounded-[0.75rem] bg-surface-container-high overflow-hidden">
                  {' '}
                  <div
                    className="h-full rounded-[0.75rem] bg-tertiary-container transition-all duration-700"
                    style={{ width: '65%' }}
                  ></div>{' '}
                </div>{' '}
                <div className="flex justify-between text-[11px] text-on-surface-variant mt-0.5">
                  {' '}
                  <span>12 Lò bánh Triều Châu • Đã nhận: 41.300 hộp</span> <span>Trống: 5.700</span>{' '}
                </div>{' '}
              </div>{' '}
              <div className="p-space-sm rounded-[0.25rem] bg-surface-container-highest flex items-center justify-between">
                {' '}
                <div className="flex items-center gap-space-sm">
                  {' '}
                  <Icon name="thermostat" className="text-secondary" aria-hidden />{' '}
                  <div className="flex flex-col">
                    {' '}
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary">
                      Nhiệt ẩm mẻ tươi sàn
                    </span>{' '}
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Chuỗi lạnh container: 18°C • Ổn định
                    </span>{' '}
                  </div>{' '}
                </div>{' '}
                <span className="font-label-md text-label-md uppercase px-2 py-1 bg-surface-container-lowest rounded-[0.125rem] text-secondary font-semibold">
                  Chuẩn OCOP 5★
                </span>{' '}
              </div>{' '}
            </div>{' '}
            <div className="lg:col-span-7 bg-surface-container-lowest p-space-lg rounded-[0.5rem] shadow-md flex flex-col gap-space-md">
              {' '}
              <div className="flex items-center justify-between pb-space-xs">
                {' '}
                <div className="flex flex-col">
                  {' '}
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">
                    Hàng Đợi Doanh Nghiệp Cần Phân Phối
                  </span>{' '}
                  <h3 className="font-headline-sm text-headline-sm text-primary">Hồ Sơ Hợp Đồng RFQ Lớn Đang Chờ Mẻ</h3>{' '}
                </div>{' '}
                <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-[0.125rem] bg-secondary-fixed text-on-secondary-fixed font-bold">
                  4 Đơn Trọng Yếu
                </span>{' '}
              </div>{' '}
              <div className="flex flex-col gap-space-sm">
                {' '}
                <div className="p-space-md rounded-[0.25rem] bg-cream-base shadow-sm hover:shadow transition-shadow">
                  {' '}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {' '}
                    <div className="flex items-center gap-space-sm">
                      {' '}
                      <div className="w-10 h-10 rounded-[0.25rem] bg-primary-container text-champagne-light flex items-center justify-center font-bold font-headline-sm">
                        {' SG '}
                      </div>{' '}
                      <div className="flex flex-col">
                        {' '}
                        <div className="flex items-center gap-2">
                          {' '}
                          <span className="font-body-lg text-body-lg font-semibold text-primary">
                            Tập Đoàn Sun Group
                          </span>{' '}
                          <span className="px-2 py-0.5 rounded-[0.125rem] bg-primary-container text-champagne-light font-label-sm text-label-sm uppercase">
                            Mã RFQ-9921
                          </span>{' '}
                        </div>{' '}
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Bộ Sưu Tập Sơn Mài "Bát Bửu Thăng Hoa" • 15.000 Hộp Hoàn Chỉnh
                        </span>{' '}
                      </div>{' '}
                    </div>{' '}
                    <div className="text-right">
                      {' '}
                      <span className="font-headline-sm text-headline-sm text-secondary font-semibold">
                        16.5 Tỷ
                      </span>{' '}
                      <span className="block font-label-sm text-label-sm text-error uppercase">Giao: 10/8 ÂL</span>{' '}
                    </div>{' '}
                  </div>{' '}
                  <div className="mt-space-sm flex items-center justify-between pt-space-xs text-body-sm">
                    {' '}
                    <span className="text-on-surface-variant flex items-center gap-1">
                      {' '}
                      <Icon name="check_circle" className="text-[16px] text-secondary" aria-hidden />
                      {' Đã duyệt maquette ép kim & giấy kiểm định an toàn OCOP '}
                    </span>{' '}
                    <span className="font-semibold text-secondary cursor-pointer hover:underline flex items-center gap-0.5">
                      {' Xem phương án tách tải '}
                      <Icon name="arrow_forward" className="text-[14px]" aria-hidden />{' '}
                    </span>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="p-space-md rounded-[0.25rem] bg-surface-container-low shadow-sm flex flex-wrap items-center justify-between gap-2">
                  {' '}
                  <div className="flex items-center gap-space-sm">
                    {' '}
                    <div className="w-10 h-10 rounded-[0.25rem] bg-surface-container-highest text-primary flex items-center justify-center font-bold font-headline-sm">
                      {' FP '}
                    </div>{' '}
                    <div className="flex flex-col">
                      {' '}
                      <div className="flex items-center gap-2">
                        {' '}
                        <span className="font-body-lg text-body-lg font-semibold text-primary">
                          FPT Corporation
                        </span>{' '}
                        <span className="px-2 py-0.5 rounded-[0.125rem] bg-surface-container-highest text-primary font-label-sm text-label-sm uppercase">
                          Mã RFQ-9918
                        </span>{' '}
                      </div>{' '}
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Hộp Gỗ Trắc Vọng Nguyệt • 12.000 Hộp • 4 Vị Dưỡng Nhan
                      </span>{' '}
                    </div>{' '}
                  </div>{' '}
                  <div className="text-right">
                    {' '}
                    <span className="font-headline-sm text-headline-sm text-primary font-semibold">11.8 Tỷ</span>{' '}
                    <span className="block font-label-sm text-label-sm text-on-surface-variant uppercase">
                      Giao: 12/8 ÂL
                    </span>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
                  {' '}
                  <div className="p-space-sm rounded-[0.25rem] bg-surface-container-low flex justify-between items-center">
                    {' '}
                    <div>
                      {' '}
                      <span className="font-body-md text-body-md font-semibold text-primary block">
                        MB Bank Hội Sở
                      </span>{' '}
                      <span className="font-body-sm text-body-sm text-on-surface-variant">8.500 Hộp • Lụa Tơ Tằm</span>{' '}
                    </div>{' '}
                    <span className="font-label-md text-label-md font-bold text-secondary">7.4 Tỷ</span>{' '}
                  </div>{' '}
                  <div className="p-space-sm rounded-[0.25rem] bg-surface-container-low flex justify-between items-center">
                    {' '}
                    <div>
                      {' '}
                      <span className="font-body-md text-body-md font-semibold text-primary block">
                        Masan High-Tech
                      </span>{' '}
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        6.000 Hộp • Kim Ngân Cổ Điển
                      </span>{' '}
                    </div>{' '}
                    <span className="font-label-md text-label-md font-bold text-secondary">5.1 Tỷ</span>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
          <section className="bg-surface-container-lowest p-space-lg rounded-[0.5rem] shadow-md flex flex-col gap-space-lg">
            {' '}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
              {' '}
              <div className="flex flex-col">
                {' '}
                <div className="flex items-center gap-space-xs">
                  {' '}
                  <span className="px-2.5 py-0.5 rounded-[0.125rem] bg-secondary text-champagne-light font-label-sm text-label-sm uppercase font-bold tracking-wider">
                    Đang Xử Lý Phân Tách
                  </span>{' '}
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Hợp Đồng Quy Mô: RFQ-9921 (Sun Group)
                  </span>{' '}
                </div>{' '}
                <h2 className="font-headline-md text-headline-md text-primary mt-1">
                  {' Kế Hoạch San Tải Thông Minh Mẻ Bánh Cho 15.000 Hộp Sơn Mài Bát Bửu '}
                </h2>{' '}
              </div>{' '}
              <div className="px-space-md py-space-xs rounded-[0.25rem] bg-error-container text-error flex items-center gap-space-xs">
                {' '}
                <Icon name="warning" className="text-[20px]" aria-hidden />{' '}
                <span className="font-body-sm text-body-sm font-semibold">
                  Cảnh báo: Đông Phương Cầu Đất đang ở ngưỡng 94% trần năng suất
                </span>{' '}
              </div>{' '}
            </div>{' '}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
              {' '}
              <div className="p-space-md rounded-[0.5rem] bg-surface-container-low flex flex-col justify-between group hover:bg-surface-container transition-colors relative overflow-hidden">
                {' '}
                <div className="flex flex-col gap-space-xs">
                  {' '}
                  <div className="flex justify-between items-start">
                    {' '}
                    <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-[0.125rem] bg-primary-container text-champagne-light uppercase">
                      Phân Tải #1 (46.6%)
                    </span>{' '}
                    <Icon name="bakery_dining" className="text-secondary text-[20px]" aria-hidden />{' '}
                  </div>{' '}
                  <h4 className="font-headline-sm text-headline-sm text-primary mt-2">Xưởng Đông Phương - Cầu Đất</h4>{' '}
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Hải Phòng • Lò củi cổ truyền 70 năm
                  </span>{' '}
                  <div className="mt-space-sm p-space-xs rounded-[0.125rem] bg-surface-container-lowest flex flex-col gap-1">
                    {' '}
                    <div className="flex justify-between text-body-sm">
                      {' '}
                      <span className="text-on-surface-variant">Phụ trách nhân bánh:</span>{' '}
                      <span className="font-semibold text-primary">Thập Cẩm Cổ Truyền Bát Bửu</span>{' '}
                    </div>{' '}
                    <div className="flex justify-between text-body-sm">
                      {' '}
                      <span className="text-on-surface-variant">Chỉ tiêu bàn giao:</span>{' '}
                      <span className="font-bold text-secondary">7.000 Hộp (28.000 Bánh)</span>{' '}
                    </div>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="mt-space-md flex flex-col gap-1.5">
                  {' '}
                  <div className="flex justify-between text-[11px] text-on-surface-variant">
                    {' '}
                    <span>Mức tải lò sau phân bổ</span>{' '}
                    <span className="font-bold text-error">94.2% (Chạm Ngưỡng)</span>{' '}
                  </div>{' '}
                  <div className="w-full h-2 rounded-[0.75rem] bg-surface-container-highest overflow-hidden">
                    {' '}
                    <div className="h-full bg-error rounded-[0.75rem]" style={{ width: '94.2%' }}></div>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
              <div className="p-space-md rounded-[0.5rem] bg-surface-container-low flex flex-col justify-between group hover:bg-surface-container transition-colors relative overflow-hidden">
                {' '}
                <div className="flex flex-col gap-space-xs">
                  {' '}
                  <div className="flex justify-between items-start">
                    {' '}
                    <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-[0.125rem] bg-secondary text-champagne-light uppercase">
                      Phân Tải #2 (33.4%)
                    </span>{' '}
                    <Icon name="local_fire_department" className="text-secondary text-[20px]" aria-hidden />{' '}
                  </div>{' '}
                  <h4 className="font-headline-sm text-headline-sm text-primary mt-2">
                    Lò Bánh Bảo Phương - Thụy Khuê
                  </h4>{' '}
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Hà Nội • Đặc sắc vỏ dẻo nhồi tay hoa bưởi
                  </span>{' '}
                  <div className="mt-space-sm p-space-xs rounded-[0.125rem] bg-surface-container-lowest flex flex-col gap-1">
                    {' '}
                    <div className="flex justify-between text-body-sm">
                      {' '}
                      <span className="text-on-surface-variant">Phụ trách nhân bánh:</span>{' '}
                      <span className="font-semibold text-primary">Hạt Sen Xát Tươi Hạt Dưa</span>{' '}
                    </div>{' '}
                    <div className="flex justify-between text-body-sm">
                      {' '}
                      <span className="text-on-surface-variant">Chỉ tiêu bàn giao:</span>{' '}
                      <span className="font-bold text-secondary">5.000 Hộp (20.000 Bánh)</span>{' '}
                    </div>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="mt-space-md flex flex-col gap-1.5">
                  {' '}
                  <div className="flex justify-between text-[11px] text-on-surface-variant">
                    {' '}
                    <span>Mức tải lò sau phân bổ</span> <span className="font-bold text-secondary">78.5% (Tối Ưu)</span>{' '}
                  </div>{' '}
                  <div className="w-full h-2 rounded-[0.75rem] bg-surface-container-highest overflow-hidden">
                    {' '}
                    <div className="h-full bg-secondary rounded-[0.75rem]" style={{ width: '78.5%' }}></div>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
              <div className="p-space-md rounded-[0.5rem] bg-surface-container-low flex flex-col justify-between group hover:bg-surface-container transition-colors relative overflow-hidden">
                {' '}
                <div className="flex flex-col gap-space-xs">
                  {' '}
                  <div className="flex justify-between items-start">
                    {' '}
                    <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-[0.125rem] bg-tertiary-container text-champagne-light uppercase">
                      Phân Tải #3 (20.0%)
                    </span>{' '}
                    <Icon name="military_tech" className="text-secondary text-[20px]" aria-hidden />{' '}
                  </div>{' '}
                  <h4 className="font-headline-sm text-headline-sm text-primary mt-2">Xưởng Ngự Thiện Cung Đình</h4>{' '}
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Cố Đô Huế • Bánh cung đình tiến vua
                  </span>{' '}
                  <div className="mt-space-sm p-space-xs rounded-[0.125rem] bg-surface-container-lowest flex flex-col gap-1">
                    {' '}
                    <div className="flex justify-between text-body-sm">
                      {' '}
                      <span className="text-on-surface-variant">Phụ trách nhân bánh:</span>{' '}
                      <span className="font-semibold text-primary">Bào Ngư Vi Cá Hoàng Triều</span>{' '}
                    </div>{' '}
                    <div className="flex justify-between text-body-sm">
                      {' '}
                      <span className="text-on-surface-variant">Chỉ tiêu bàn giao:</span>{' '}
                      <span className="font-bold text-secondary">3.000 Hộp (12.000 Bánh)</span>{' '}
                    </div>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="mt-space-md flex flex-col gap-1.5">
                  {' '}
                  <div className="flex justify-between text-[11px] text-on-surface-variant">
                    {' '}
                    <span>Mức tải lò sau phân bổ</span>{' '}
                    <span className="font-bold text-on-tertiary-container">61.0% (Rất Thoải Mái)</span>{' '}
                  </div>{' '}
                  <div className="w-full h-2 rounded-[0.75rem] bg-surface-container-highest overflow-hidden">
                    {' '}
                    <div className="h-full bg-tertiary-container rounded-[0.75rem]" style={{ width: '61%' }}></div>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
            <div className="p-space-md rounded-[0.25rem] bg-primary-container text-champagne-light flex flex-col sm:flex-row items-center justify-between gap-space-md shadow-lg">
              {' '}
              <div className="flex items-center gap-space-sm">
                {' '}
                <Icon name="precision_manufacturing" className="text-secondary-fixed text-[26px]" aria-hidden />{' '}
                <div className="flex flex-col">
                  {' '}
                  <span className="font-body-md text-body-md font-semibold text-champagne-light">
                    Tổng phân bổ: 15.000 / 15.000 hộp (100% khớp nối tiêu chuẩn)
                  </span>{' '}
                  <span className="font-body-sm text-body-sm text-surface-container-high">
                    Lộ trình giao lạnh liên tỉnh đã thiết lập qua kho trung chuyển KCN Phố Nối
                  </span>{' '}
                </div>{' '}
              </div>{' '}
              <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
                {' '}
                <button
                  className="px-space-md py-2.5 rounded-[0.125rem] bg-ink-dark/80 hover:bg-ink-dark text-error font-body-sm text-body-sm flex items-center gap-1 transition-colors"
                  id="btn-alert-oven"
                >
                  {' '}
                  <Icon name="emergency_home" className="text-[18px]" aria-hidden />
                  {' Kích Hoạt Chặn Trần Lò 95% '}
                </button>{' '}
                <button
                  className="px-space-lg py-2.5 rounded-[0.125rem] bg-secondary hover:bg-gold-burnished text-ink-dark font-label-lg text-label-lg uppercase tracking-wider font-bold transition-all shadow-md flex items-center gap-1.5"
                  id="btn-dispatch-order"
                >
                  {' '}
                  <Icon name="send_time_extension" className="text-[18px]" aria-hidden />
                  {' Gửi Lệnh Sản Xuất Tới 3 Xưởng '}
                </button>{' '}
              </div>{' '}
            </div>{' '}
          </section>{' '}
          <section className="bg-surface-container-lowest p-space-lg rounded-[0.5rem] shadow-md flex flex-col gap-space-md">
            {' '}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm pb-space-xs">
              {' '}
              <div className="flex flex-col">
                {' '}
                <div className="flex items-center gap-space-xs">
                  {' '}
                  <Icon name="verified_user" className="text-error text-[18px]" aria-hidden />{' '}
                  <span className="font-label-sm text-label-sm text-error uppercase tracking-widest font-bold">
                    Quản Trị Rủi Ro & Cam Kết SLA Khách Hàng B2B
                  </span>{' '}
                </div>{' '}
                <h3 className="font-headline-sm text-headline-sm text-primary mt-0.5">
                  {' Giám Sát Độ Tươi, Trễ Hạn Mẻ Ra Lò & Quỹ Bảo Hiểm Chậm Chuyến '}
                </h3>{' '}
              </div>{' '}
              <div className="flex items-center gap-space-xs text-body-sm text-on-surface-variant">
                {' '}
                <span className="w-2 h-2 rounded-[0.75rem] bg-secondary"></span>{' '}
                <span>
                  {'Quỹ Ký Quỹ Đền Bù Hiện Hữu: '}
                  <strong className="text-primary font-semibold">4.8 Tỷ Đồng</strong>
                </span>{' '}
              </div>{' '}
            </div>{' '}
            <div className="overflow-x-auto w-full">
              {' '}
              <table className="w-full text-left font-body-sm text-body-sm border-collapse">
                {' '}
                <thead>
                  {' '}
                  <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                    {' '}
                    <th className="py-3 px-space-md">Mã Đơn / Doanh Nghiệp</th>{' '}
                    <th className="py-3 px-space-md">Xưởng Phụ Trách Mộc</th>{' '}
                    <th className="py-3 px-space-md">Mốc Giao SLA Cam Kết</th>{' '}
                    <th className="py-3 px-space-md">Trạng Thái Độ Tươi & Khí Thở</th>{' '}
                    <th className="py-3 px-space-md">Chỉ Số Rủi Ro</th>{' '}
                    <th className="py-3 px-space-md text-right">Điều Khoản Phạt Chậm Hạn</th>{' '}
                  </tr>{' '}
                </thead>{' '}
                <tbody className="divide-y divide-surface-container">
                  {' '}
                  <tr className="hover:bg-cream-base transition-colors">
                    {' '}
                    <td className="py-space-md px-space-md">
                      {' '}
                      <div className="flex flex-col">
                        {' '}
                        <span className="font-semibold text-primary">Sun Group • Hợp Đồng Khung</span>{' '}
                        <span className="text-on-surface-variant text-[11px]">RFQ-9921 / 15.000 Hộp</span>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md">
                      {' '}
                      <span className="text-primary">Đông Phương HP & Bảo Phương HN</span>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md font-semibold text-primary">
                      {' 10/8 ÂL (Trước Rằm 5 ngày) '}
                    </td>{' '}
                    <td className="py-space-md px-space-md">
                      {' '}
                      <span className="inline-flex items-center gap-1 text-on-tertiary-container px-2 py-0.5 rounded-[0.125rem] bg-tertiary-fixed/30 font-medium">
                        {' '}
                        <span className="w-1.5 h-1.5 rounded-[0.75rem] bg-tertiary"></span>
                        {' Giao Lạnh 18°C Đạt Chuẩn '}
                      </span>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md">
                      {' '}
                      <div className="flex items-center gap-2">
                        {' '}
                        <span className="w-2.5 h-2.5 rounded-[0.75rem] bg-secondary"></span>{' '}
                        <span className="text-secondary font-medium">4% (An Toàn)</span>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md text-right">
                      {' '}
                      <span className="font-mono text-primary font-semibold">0.5%/Ngày trễ (Trần 5%)</span>{' '}
                    </td>{' '}
                  </tr>{' '}
                  <tr className="hover:bg-cream-base transition-colors bg-error-container/10">
                    {' '}
                    <td className="py-space-md px-space-md">
                      {' '}
                      <div className="flex flex-col">
                        {' '}
                        <span className="font-semibold text-primary">Tập Đoàn FPT • Chi Nhánh HN</span>{' '}
                        <span className="text-on-surface-variant text-[11px]">RFQ-9918 / 12.000 Hộp</span>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md">
                      {' '}
                      <span className="text-primary">Lò Bánh Triều Châu Quận 5</span>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md font-semibold text-error">
                      {' 12/8 ÂL (Khoảng đệm mỏng) '}
                    </td>{' '}
                    <td className="py-space-md px-space-md">
                      {' '}
                      <span className="inline-flex items-center gap-1 text-error px-2 py-0.5 rounded-[0.125rem] bg-error-container font-medium">
                        {' '}
                        <Icon name="warning" className="text-[14px]" aria-hidden />
                        {' Nút thắt đường bay lạnh TSN - NBA '}
                      </span>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md">
                      {' '}
                      <div className="flex items-center gap-2">
                        {' '}
                        <span className="w-2.5 h-2.5 rounded-[0.75rem] bg-error animate-pulse"></span>{' '}
                        <span className="text-error font-bold">18% (Cần Trợ Lực)</span>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md text-right">
                      {' '}
                      <span className="font-mono text-error font-semibold">1.0%/Ngày trễ (Trần 8%)</span>{' '}
                    </td>{' '}
                  </tr>{' '}
                  <tr className="hover:bg-cream-base transition-colors">
                    {' '}
                    <td className="py-space-md px-space-md">
                      {' '}
                      <div className="flex flex-col">
                        {' '}
                        <span className="font-semibold text-primary">Ngân Hàng Quân Đội MB</span>{' '}
                        <span className="text-on-surface-variant text-[11px]">RFQ-9912 / 8.500 Hộp</span>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md">
                      {' '}
                      <span className="text-primary">Xưởng Bánh Di Sản Huế Cung Đình</span>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md font-semibold text-primary">
                      {' 11/8 ÂL (Tiêu chuẩn VIP) '}
                    </td>{' '}
                    <td className="py-space-md px-space-md">
                      {' '}
                      <span className="inline-flex items-center gap-1 text-on-tertiary-container px-2 py-0.5 rounded-[0.125rem] bg-tertiary-fixed/30 font-medium">
                        {' '}
                        <span className="w-1.5 h-1.5 rounded-[0.75rem] bg-tertiary"></span>
                        {' Bánh Tươi 100% Niêm Phong '}
                      </span>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md">
                      {' '}
                      <div className="flex items-center gap-2">
                        {' '}
                        <span className="w-2.5 h-2.5 rounded-[0.75rem] bg-tertiary-container"></span>{' '}
                        <span className="text-on-tertiary-container font-medium">1.5% (Tối Ưu Tuyệt Đối)</span>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md text-right">
                      {' '}
                      <span className="font-mono text-primary font-semibold">Đổi mới hộp mạ vàng 100%</span>{' '}
                    </td>{' '}
                  </tr>{' '}
                </tbody>{' '}
              </table>{' '}
            </div>{' '}
            <div className="mt-space-xs pt-space-xs flex flex-wrap items-center justify-between text-body-sm text-on-surface-variant">
              {' '}
              <div className="flex items-center gap-2">
                {' '}
                <Icon name="gavel" className="text-[18px] text-secondary" aria-hidden />{' '}
                <span>Bảo hiểm rủi ro bởi BIDV Insurance Syndicate • Mã cam kết OCOP-ESCROW-2024</span>{' '}
              </div>{' '}
              <button className="text-secondary font-semibold hover:underline flex items-center gap-1">
                {' Tải Biên Bản Kiểm Tra Năng Lượng Lò Toàn Quốc (PDF) '}
                <Icon name="download" className="text-[16px]" aria-hidden />{' '}
              </button>{' '}
            </div>{' '}
          </section>{' '}
        </div>{' '}
      </div>{' '}
    </>
  )
}
