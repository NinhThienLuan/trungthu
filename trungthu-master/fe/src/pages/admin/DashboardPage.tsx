// Tự sinh từ bản thiết kế Stitch — giữ nguyên nội dung. Sửa logic ở trang bọc ngoài.
import { Icon } from '../../components/Icon'

export function DashboardPage() {
  return (
    <>
      <div className="flex flex-col w-full">
        {' '}
        <div className="w-full max-w-[1360px] mx-auto px-space-md sm:px-space-lg xl:px-space-xl py-space-lg flex flex-col gap-space-xl">
          {' '}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg pb-space-lg bg-surface-container-low/60 p-space-lg rounded-[0.5rem] shadow-sm relative overflow-hidden">
            {' '}
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-[0.75rem] bg-secondary-fixed/15 blur-3xl pointer-events-none"></div>{' '}
            <div className="flex flex-col gap-space-xs relative z-10 max-w-3xl min-w-0">
              {' '}
              <div className="flex items-center gap-space-xs flex-wrap">
                {' '}
                <span className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-[0.125rem] bg-primary-container text-champagne-light font-label-sm text-label-sm tracking-[0.2em] uppercase">
                  {' '}
                  <span className="w-1.5 h-1.5 rounded-[0.75rem] bg-secondary-fixed animate-pulse"></span>
                  {' Ban Điều Hành Tổng Quản • Hệ Thống Tài Chính & Ký Quỹ Escrow '}
                </span>{' '}
                <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-[0.125rem] bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">
                  {' '}
                  <Icon name="verified_user" className="text-[14px] text-secondary" aria-hidden />
                  {' Quy Chuẩn Bảo An OCOP Di Sản '}
                </span>{' '}
              </div>{' '}
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-semibold mt-1">
                {' Quản Trị Tài Chính, Đối Soát Doanh Thu & Quỹ Ký Quỹ Di Sản '}
              </h1>{' '}
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {
                  ' Điều phối dòng tiền bao tiêu mùa vụ 126.8 tỷ VNĐ, tối ưu hóa công thức hoa hồng theo hạng danh vị lò nghệ nhân, thực thi giải ngân tự động qua hợp đồng thông minh đa lớp dựa trên nghiệm thu IoT chuỗi lạnh và chứng thư vi sinh. '
                }
              </p>{' '}
            </div>{' '}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-space-sm relative z-10 shrink-0">
              {' '}
              <button className="flex items-center justify-center gap-space-xs px-space-md py-2.5 rounded-[0.25rem] bg-surface-container-lowest text-primary font-label-md text-label-md hover:bg-champagne-light/30 transition-all shadow-sm">
                {' '}
                <Icon name="file_download" className="text-[18px] text-secondary" aria-hidden />{' '}
                <span>Xuất Báo Cáo Tài Chính (Excel/PDF)</span>{' '}
              </button>{' '}
              <button className="flex items-center justify-center gap-space-xs px-space-md py-2.5 rounded-[0.25rem] bg-primary-container text-champagne-light font-label-md text-label-md hover:bg-ink-dark transition-all shadow-md">
                {' '}
                <Icon name="tune" className="text-[18px] text-secondary-fixed" aria-hidden />{' '}
                <span>Thiết Lập Kỳ Đối Soát Mới</span>{' '}
              </button>{' '}
            </div>{' '}
          </div>{' '}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
            {' '}
            <div className="bg-surface-container-lowest p-space-lg rounded-[0.5rem] shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
              {' '}
              <div className="flex items-center justify-between">
                {' '}
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                  Tổng Doanh Thu Bao Tiêu (GMV)
                </span>{' '}
                <div className="w-8 h-8 rounded-[0.25rem] bg-surface-container flex items-center justify-center text-primary">
                  {' '}
                  <Icon name="payments" className="text-[18px]" aria-hidden />{' '}
                </div>{' '}
              </div>{' '}
              <div className="my-space-md flex flex-col">
                {' '}
                <div className="flex items-baseline gap-space-xs">
                  {' '}
                  <span className="font-headline-lg text-headline-lg text-primary font-bold">126.8</span>{' '}
                  <span className="font-headline-sm text-headline-sm text-secondary font-medium">Tỷ VNĐ</span>{' '}
                </div>{' '}
                <div className="flex items-center gap-1.5 mt-1 text-tertiary font-body-sm text-body-sm font-medium">
                  {' '}
                  <Icon name="trending_up" className="text-[16px]" aria-hidden /> <span>+42% so với kỳ trăng 2024</span>{' '}
                </div>{' '}
              </div>{' '}
              <div className="pt-space-sm bg-surface-container-low/50 -mx-space-lg -mb-space-lg px-space-lg pb-space-sm flex items-center justify-between">
                {' '}
                <span className="font-body-sm text-body-sm text-on-surface-variant">Phân khúc B2B bao tiêu</span>{' '}
                <span className="font-label-sm text-label-sm font-bold text-primary">85.0% Tỷ trọng</span>{' '}
              </div>{' '}
            </div>{' '}
            <div className="bg-surface-container-lowest p-space-lg rounded-[0.5rem] shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
              {' '}
              <div className="flex items-center justify-between">
                {' '}
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                  Doanh Thu Hoa Hồng Sàn
                </span>{' '}
                <div className="w-8 h-8 rounded-[0.25rem] bg-secondary-container/40 flex items-center justify-center text-secondary">
                  {' '}
                  <Icon name="account_balance" className="text-[18px]" aria-hidden />{' '}
                </div>{' '}
              </div>{' '}
              <div className="my-space-md flex flex-col">
                {' '}
                <div className="flex items-baseline gap-space-xs">
                  {' '}
                  <span className="font-headline-lg text-headline-lg text-primary font-bold">11.41</span>{' '}
                  <span className="font-headline-sm text-headline-sm text-secondary font-medium">Tỷ VNĐ</span>{' '}
                </div>{' '}
                <div className="flex items-center gap-1.5 mt-1 text-on-surface-variant font-body-sm text-body-sm">
                  {' '}
                  <Icon name="pie_chart" className="text-[16px] text-secondary" aria-hidden />{' '}
                  <span>Take-rate thực thu trung bình 9.0%</span>{' '}
                </div>{' '}
              </div>{' '}
              <div className="pt-space-sm bg-surface-container-low/50 -mx-space-lg -mb-space-lg px-space-lg pb-space-sm flex items-center justify-between">
                {' '}
                <span className="font-body-sm text-body-sm text-on-surface-variant">Biên độ dao động hạng</span>{' '}
                <span className="font-label-sm text-label-sm font-bold text-primary">6.5% – 10.5%</span>{' '}
              </div>{' '}
            </div>{' '}
            <div className="bg-surface-container-lowest p-space-lg rounded-[0.5rem] shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
              {' '}
              <div className="flex items-center justify-between">
                {' '}
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                  Quỹ Ký Quỹ Escrow SLA
                </span>{' '}
                <div className="w-8 h-8 rounded-[0.25rem] bg-tertiary-fixed/40 flex items-center justify-center text-tertiary">
                  {' '}
                  <Icon name="lock_open" className="text-[18px]" aria-hidden />{' '}
                </div>{' '}
              </div>{' '}
              <div className="my-space-md flex flex-col">
                {' '}
                <div className="flex items-baseline gap-space-xs">
                  {' '}
                  <span className="font-headline-lg text-headline-lg text-primary font-bold">18.5</span>{' '}
                  <span className="font-headline-sm text-headline-sm text-secondary font-medium">Tỷ VNĐ</span>{' '}
                </div>{' '}
                <div className="flex items-center gap-1.5 mt-1 text-tertiary font-body-sm text-body-sm font-medium">
                  {' '}
                  <Icon name="check_circle" className="text-[16px]" aria-hidden />{' '}
                  <span>Bảo chứng 100% rủi ro giao chậm</span>{' '}
                </div>{' '}
              </div>{' '}
              <div className="pt-space-sm bg-surface-container-low/50 -mx-space-lg -mb-space-lg px-space-lg pb-space-sm flex items-center justify-between">
                {' '}
                <span className="font-body-sm text-body-sm text-on-surface-variant">Tỷ lệ giữ lại đơn sỉ</span>{' '}
                <span className="font-label-sm text-label-sm font-bold text-tertiary">5% – 15% / Đơn</span>{' '}
              </div>{' '}
            </div>{' '}
            <div className="bg-primary-container text-champagne-light p-space-lg rounded-[0.5rem] shadow-md flex flex-col justify-between relative overflow-hidden group">
              {' '}
              <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-[0.75rem] bg-secondary-fixed/10 pointer-events-none"></div>{' '}
              <div className="flex items-center justify-between">
                {' '}
                <span className="font-label-sm text-label-sm text-secondary-fixed-dim uppercase tracking-widest">
                  Chờ Giải Ngân Cho Lò
                </span>{' '}
                <div className="w-8 h-8 rounded-[0.25rem] bg-ink-dark/60 flex items-center justify-center text-secondary-fixed">
                  {' '}
                  <Icon name="schedule_send" className="text-[18px]" aria-hidden />{' '}
                </div>{' '}
              </div>{' '}
              <div className="my-space-md flex flex-col">
                {' '}
                <div className="flex items-baseline gap-space-xs">
                  {' '}
                  <span className="font-headline-lg text-headline-lg text-champagne-light font-bold">42.6</span>{' '}
                  <span className="font-headline-sm text-headline-sm text-secondary-fixed font-medium">Tỷ VNĐ</span>{' '}
                </div>{' '}
                <div className="flex items-center gap-1.5 mt-1 text-secondary-fixed-dim font-body-sm text-body-sm">
                  {' '}
                  <Icon name="local_shipping" className="text-[16px]" aria-hidden />{' '}
                  <span>Kích hoạt sau ký nghiệm thu B2B</span>{' '}
                </div>{' '}
              </div>{' '}
              <div className="pt-space-sm bg-ink-dark/40 -mx-space-lg -mb-space-lg px-space-lg pb-space-sm flex items-center justify-between">
                {' '}
                <span className="font-body-sm text-body-sm text-inverse-on-surface/70">
                  Số mẻ bánh đã hoàn tất
                </span>{' '}
                <span className="font-label-sm text-label-sm font-bold text-secondary-fixed">28 / 42 Lò Sẵn Sàng</span>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
          <div className="flex flex-col gap-space-md">
            {' '}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
              {' '}
              <div className="flex flex-col">
                {' '}
                <div className="flex items-center gap-2">
                  {' '}
                  <span className="w-2.5 h-2.5 rounded-[0.75rem] bg-secondary"></span>{' '}
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">
                    Quy Chuẩn Điều Hành 2025
                  </span>{' '}
                </div>{' '}
                <h2 className="font-headline-md text-headline-md text-primary font-semibold tracking-tight">
                  {' Chính Sách Chiết Khấu Sàn Theo Cấp Bậc Lò Nghệ Nhân (Tiered Commission Engine) '}
                </h2>{' '}
              </div>{' '}
              <div className="flex items-center gap-space-sm">
                {' '}
                <button className="px-space-md py-2 rounded-[0.25rem] bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors flex items-center gap-1.5 shadow-sm">
                  {' '}
                  <Icon name="tune" className="text-[16px]" aria-hidden /> <span>Chỉnh Sửa Tỷ Lệ</span>{' '}
                </button>{' '}
                <button className="px-space-md py-2 rounded-[0.25rem] bg-surface-container-lowest text-secondary font-label-md text-label-md hover:bg-champagne-light/20 transition-colors flex items-center gap-1.5 shadow-sm">
                  {' '}
                  <Icon name="rule" className="text-[16px]" aria-hidden /> <span>Thêm Quy Tắc Tự Vận Chuyển</span>{' '}
                </button>{' '}
                <button className="px-space-md py-2 rounded-[0.25rem] bg-primary-container text-champagne-light font-label-md text-label-md hover:bg-ink-dark transition-all flex items-center gap-1.5 shadow-sm">
                  {' '}
                  <Icon name="save" className="text-[16px] text-secondary-fixed" aria-hidden />{' '}
                  <span>Lưu Thay Đổi</span>{' '}
                </button>{' '}
              </div>{' '}
            </div>{' '}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
              {' '}
              <div className="bg-surface-container-lowest p-space-lg rounded-[0.5rem] shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
                {' '}
                <div className="flex flex-col gap-space-sm">
                  {' '}
                  <div className="flex items-center justify-between">
                    {' '}
                    <span className="px-space-sm py-1 rounded-[0.125rem] bg-secondary-fixed/30 text-on-secondary-fixed font-label-sm text-label-sm uppercase tracking-wider flex items-center gap-1">
                      {' '}
                      <Icon name="diamond" className="text-[14px] text-secondary" aria-hidden />
                      {' Bậc 1 • Hạng Kim Cương (OCOP 5★) '}
                    </span>{' '}
                    <span className="font-label-sm text-label-sm text-tertiary font-bold bg-tertiary-fixed/30 px-space-xs py-0.5 rounded-[0.125rem]">
                      99.8% Chuẩn Mẻ
                    </span>{' '}
                  </div>{' '}
                  <h3 className="font-headline-sm text-headline-sm text-primary font-semibold">
                    {' Lò Di Sản Trăm Năm & Trưởng Mẻ '}
                  </h3>{' '}
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {
                      ' Áp dụng cho các lò quy mô công nghiệp di sản tự bảo chứng vùng nguyên liệu (Ví dụ: Đông Phương Cầu Đất, Bảo Phương Thụy Khuê). '
                    }
                  </p>{' '}
                  <div className="my-space-sm p-space-md bg-surface-container-low rounded-[0.25rem] flex flex-col gap-space-xs">
                    {' '}
                    <div className="flex justify-between items-center">
                      {' '}
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Hoa hồng sàn ưu đãi:
                      </span>{' '}
                      <span className="font-headline-sm text-headline-sm text-primary font-bold">6.5%</span>{' '}
                    </div>{' '}
                    <div className="flex justify-between items-center">
                      {' '}
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Hạn mức tạm ứng phôi nguyên liệu:
                      </span>{' '}
                      <span className="font-body-md text-body-md text-on-surface font-semibold">50% Giá Trị Mẻ</span>{' '}
                    </div>{' '}
                    <div className="flex justify-between items-center">
                      {' '}
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Tỷ lệ ký quỹ giữ lại (Escrow):
                      </span>{' '}
                      <span className="font-body-md text-body-md text-on-surface font-semibold">5% GMV</span>{' '}
                    </div>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="flex items-center justify-between pt-space-sm text-on-surface-variant font-body-sm text-body-sm">
                  {' '}
                  <span className="flex items-center gap-1">
                    <Icon name="check" className="text-[16px] text-tertiary" aria-hidden />
                    {' Miễn trừ kiểm định vi sinh bổ sung'}
                  </span>{' '}
                  <span className="font-label-sm text-label-sm uppercase text-secondary font-bold">
                    Đang áp dụng (8 Lò)
                  </span>{' '}
                </div>{' '}
              </div>{' '}
              <div className="bg-surface-container-lowest p-space-lg rounded-[0.5rem] shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
                {' '}
                <div className="flex flex-col gap-space-sm">
                  {' '}
                  <div className="flex items-center justify-between">
                    {' '}
                    <span className="px-space-sm py-1 rounded-[0.125rem] bg-secondary-container text-on-secondary-container font-label-sm text-label-sm uppercase tracking-wider flex items-center gap-1">
                      {' '}
                      <Icon name="military_tech" className="text-[14px]" aria-hidden />
                      {' Bậc 2 • Hạng Vàng Tinh Tuyển '}
                    </span>{' '}
                    <span className="font-label-sm text-label-sm text-secondary font-bold bg-secondary-fixed/40 px-space-xs py-0.5 rounded-[0.125rem]">
                      98.5% Chuẩn Mẻ
                    </span>{' '}
                  </div>{' '}
                  <h3 className="font-headline-sm text-headline-sm text-primary font-semibold">
                    {' Lò Cung Đình & Nghệ Nhân Gia Truyền '}
                  </h3>{' '}
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {
                      ' Các gia tộc làm bánh công thức khép kín, sử dụng nguyên liệu thượng hạng tươi (Ví dụ: Ngự Thiện Cố Đô Huế, Như Lan Chợ Cũ). '
                    }
                  </p>{' '}
                  <div className="my-space-sm p-space-md bg-surface-container-low rounded-[0.25rem] flex flex-col gap-space-xs">
                    {' '}
                    <div className="flex justify-between items-center">
                      {' '}
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Hoa hồng sàn tiêu chuẩn:
                      </span>{' '}
                      <span className="font-headline-sm text-headline-sm text-primary font-bold">8.0%</span>{' '}
                    </div>{' '}
                    <div className="flex justify-between items-center">
                      {' '}
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Hạn mức tạm ứng phôi nguyên liệu:
                      </span>{' '}
                      <span className="font-body-md text-body-md text-on-surface font-semibold">40% Giá Trị Mẻ</span>{' '}
                    </div>{' '}
                    <div className="flex justify-between items-center">
                      {' '}
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Tỷ lệ ký quỹ giữ lại (Escrow):
                      </span>{' '}
                      <span className="font-body-md text-body-md text-on-surface font-semibold">8% GMV</span>{' '}
                    </div>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="flex items-center justify-between pt-space-sm text-on-surface-variant font-body-sm text-body-sm">
                  {' '}
                  <span className="flex items-center gap-1">
                    <Icon name="biotech" className="text-[16px] text-secondary" aria-hidden />
                    {' Kiểm vi sinh ngẫu nhiên 3 mẻ/tuần'}
                  </span>{' '}
                  <span className="font-label-sm text-label-sm uppercase text-secondary font-bold">
                    Đang áp dụng (19 Lò)
                  </span>{' '}
                </div>{' '}
              </div>{' '}
              <div className="bg-surface-container-lowest p-space-lg rounded-[0.5rem] shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
                {' '}
                <div className="flex flex-col gap-space-sm">
                  {' '}
                  <div className="flex items-center justify-between">
                    {' '}
                    <span className="px-space-sm py-1 rounded-[0.125rem] bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider flex items-center gap-1">
                      {' '}
                      <Icon name="workspace_premium" className="text-[14px]" aria-hidden />
                      {' Bậc 3 • Hạng Bạc Tuyển Chọn '}
                    </span>{' '}
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-bold bg-surface-container-high px-space-xs py-0.5 rounded-[0.125rem]">
                      95.0% Chuẩn Mẻ
                    </span>{' '}
                  </div>{' '}
                  <h3 className="font-headline-sm text-headline-sm text-primary font-semibold">
                    {' Hợp Tác Xã & Xưởng Di Sản Mới '}
                  </h3>{' '}
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {
                      ' Các xưởng làng nghề địa phương đang số hóa quy trình và được bảo trợ chuỗi lạnh sàn (Ví dụ: Bánh Dẻo Bà Dần, Vĩnh Hưng Hội An). '
                    }
                  </p>{' '}
                  <div className="my-space-sm p-space-md bg-surface-container-low rounded-[0.25rem] flex flex-col gap-space-xs">
                    {' '}
                    <div className="flex justify-between items-center">
                      {' '}
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Hoa hồng sàn giám sát:
                      </span>{' '}
                      <span className="font-headline-sm text-headline-sm text-primary font-bold">10.5%</span>{' '}
                    </div>{' '}
                    <div className="flex justify-between items-center">
                      {' '}
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Hạn mức tạm ứng phôi nguyên liệu:
                      </span>{' '}
                      <span className="font-body-md text-body-md text-on-surface font-semibold">30% Giá Trị Mẻ</span>{' '}
                    </div>{' '}
                    <div className="flex justify-between items-center">
                      {' '}
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Tỷ lệ ký quỹ giữ lại (Escrow):
                      </span>{' '}
                      <span className="font-body-md text-body-md text-on-surface font-semibold">15% GMV</span>{' '}
                    </div>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="flex items-center justify-between pt-space-sm text-on-surface-variant font-body-sm text-body-sm">
                  {' '}
                  <span className="flex items-center gap-1 text-error">
                    <Icon name="sensors" className="text-[16px]" aria-hidden />
                    {' Bắt buộc IoT cảm biến thùng xe lạnh'}
                  </span>{' '}
                  <span className="font-label-sm text-label-sm uppercase text-secondary font-bold">
                    Đang áp dụng (15 Lò)
                  </span>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
          <div className="flex flex-col gap-space-md bg-surface-container-lowest p-space-lg rounded-[0.5rem] shadow-sm">
            {' '}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
              {' '}
              <div className="flex flex-col">
                {' '}
                <div className="flex items-center gap-2">
                  {' '}
                  <Icon name="account_balance_wallet" className="text-secondary text-[20px]" aria-hidden />{' '}
                  <h2 className="font-headline-md text-headline-md text-primary font-semibold">
                    {' Đối Soát Doanh Thu & Danh Sách Lệnh Giải Ngân Đợt 1 (Mùa Trăng 2025) '}
                  </h2>{' '}
                </div>{' '}
                <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  {
                    ' Quy chuẩn quyết toán bù trừ: GMV Đơn Sỉ - Hoa Hồng Sàn - Chi Phí Dịch Vụ Xe Lạnh IoT - Quỹ Escrow Giữ Lại = Thực Nhận. '
                  }
                </span>{' '}
              </div>{' '}
              <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-[0.25rem] overflow-x-auto">
                {' '}
                <button className="px-space-md py-1.5 rounded-[0.25rem] bg-surface-container-lowest text-primary font-label-md text-label-md shadow-sm whitespace-nowrap">
                  {' Tất Cả Lò (42) '}
                </button>{' '}
                <button className="px-space-md py-1.5 rounded-[0.25rem] text-on-surface-variant hover:text-primary font-label-md text-label-md whitespace-nowrap transition-colors">
                  {' Đã Ký Bàn Giao (28) '}
                </button>{' '}
                <button className="px-space-md py-1.5 rounded-[0.25rem] text-on-surface-variant hover:text-primary font-label-md text-label-md whitespace-nowrap transition-colors">
                  {' Chờ Đối Soát VAT (10) '}
                </button>{' '}
                <button className="px-space-md py-1.5 rounded-[0.25rem] text-error hover:bg-error-container/40 font-label-md text-label-md whitespace-nowrap transition-colors flex items-center gap-1">
                  {' '}
                  <span className="w-1.5 h-1.5 rounded-[0.75rem] bg-error"></span>
                  {' Cảnh Báo Giữ Tiền (4) '}
                </button>{' '}
              </div>{' '}
            </div>{' '}
            <div className="w-full overflow-x-auto">
              {' '}
              <table className="w-full text-left font-body-sm text-body-sm">
                {' '}
                <thead>
                  {' '}
                  <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                    {' '}
                    <th className="py-space-sm px-space-md rounded-l-[0.25rem]">Lò Bánh & Mã Quyết Toán</th>{' '}
                    <th className="py-space-sm px-space-md text-right">Doanh Thu Mẻ</th>{' '}
                    <th className="py-space-sm px-space-md text-right">Hoa Hồng Sàn</th>{' '}
                    <th className="py-space-sm px-space-md text-right">Phí Xe Lạnh IoT</th>{' '}
                    <th className="py-space-sm px-space-md text-right">Ký Quỹ Escrow</th>{' '}
                    <th className="py-space-sm px-space-md text-right">Thực Nhận Đợt 1</th>{' '}
                    <th className="py-space-sm px-space-md text-center">Trạng Thái Thẩm Định</th>{' '}
                    <th className="py-space-sm px-space-md text-right rounded-r-[0.25rem]">Lệnh Thực Thi</th>{' '}
                  </tr>{' '}
                </thead>{' '}
                <tbody className="divide-y divide-surface-container">
                  {' '}
                  <tr className="hover:bg-surface-container-low/60 transition-colors">
                    {' '}
                    <td className="py-space-md px-space-md">
                      {' '}
                      <div className="flex items-center gap-space-sm">
                        {' '}
                        <div className="w-10 h-10 rounded-[0.25rem] bg-surface-container flex items-center justify-center text-primary font-bold font-headline-sm">
                          {' ĐP '}
                        </div>{' '}
                        <div className="flex flex-col min-w-0">
                          {' '}
                          <span className="font-body-md text-body-md font-semibold text-primary">
                            Đông Phương Hải Phòng
                          </span>{' '}
                          <div className="flex items-center gap-1.5">
                            {' '}
                            <span className="font-label-sm text-label-sm text-secondary uppercase font-bold">
                              Hạng Kim Cương
                            </span>{' '}
                            <span className="text-outline-variant text-[10px]">•</span>{' '}
                            <span className="font-label-sm text-label-sm text-on-surface-variant">Mã: DP-2024-001</span>{' '}
                          </div>{' '}
                        </div>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md text-right font-headline-sm text-[16px] text-primary font-semibold">
                      {' 34.20 Tỷ '}
                    </td>{' '}
                    <td className="py-space-md px-space-md text-right text-on-surface-variant">
                      {' '}
                      <div className="flex flex-col items-end">
                        {' '}
                        <span className="font-medium text-primary">-2.22 Tỷ</span>{' '}
                        <span className="text-[11px] text-secondary font-semibold">(6.5% Ưu đãi)</span>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md text-right text-on-surface-variant">{' -180 Triệu '}</td>{' '}
                    <td className="py-space-md px-space-md text-right text-on-surface-variant">
                      {' '}
                      <div className="flex flex-col items-end">
                        {' '}
                        <span className="font-medium text-tertiary">-1.71 Tỷ</span>{' '}
                        <span className="text-[11px] text-on-surface-variant">(Giữ 5.0%)</span>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md text-right">
                      {' '}
                      <span className="font-headline-sm text-headline-sm text-secondary font-bold">30.09 Tỷ</span>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md text-center">
                      {' '}
                      <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-[0.125rem] bg-tertiary-fixed/30 text-tertiary font-label-sm text-label-sm font-bold uppercase">
                        {' '}
                        <span className="w-1.5 h-1.5 rounded-[0.75rem] bg-tertiary"></span>
                        {' Sẵn Sàng Giải Ngân '}
                      </span>{' '}
                      <div className="text-[11px] text-on-surface-variant mt-0.5">Biên bản bàn giao số #BB-9021</div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md text-right">
                      {' '}
                      <button className="px-space-md py-1.5 rounded-[0.25rem] bg-primary-container text-champagne-light font-label-md text-label-md hover:bg-ink-dark transition-colors shadow-sm inline-flex items-center gap-1">
                        {' '}
                        <Icon name="draw" className="text-[16px] text-secondary-fixed" aria-hidden />{' '}
                        <span>Ký Lệnh Chuyển Khoản</span>{' '}
                      </button>{' '}
                    </td>{' '}
                  </tr>{' '}
                  <tr className="hover:bg-surface-container-low/60 transition-colors">
                    {' '}
                    <td className="py-space-md px-space-md">
                      {' '}
                      <div className="flex items-center gap-space-sm">
                        {' '}
                        <div className="w-10 h-10 rounded-[0.25rem] bg-surface-container flex items-center justify-center text-primary font-bold font-headline-sm">
                          {' BP '}
                        </div>{' '}
                        <div className="flex flex-col min-w-0">
                          {' '}
                          <span className="font-body-md text-body-md font-semibold text-primary">
                            Bảo Phương Thụy Khuê
                          </span>{' '}
                          <div className="flex items-center gap-1.5">
                            {' '}
                            <span className="font-label-sm text-label-sm text-secondary uppercase font-bold">
                              Hạng Kim Cương
                            </span>{' '}
                            <span className="text-outline-variant text-[10px]">•</span>{' '}
                            <span className="font-label-sm text-label-sm text-on-surface-variant">Mã: BP-2024-004</span>{' '}
                          </div>{' '}
                        </div>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md text-right font-headline-sm text-[16px] text-primary font-semibold">
                      {' 22.80 Tỷ '}
                    </td>{' '}
                    <td className="py-space-md px-space-md text-right text-on-surface-variant">
                      {' '}
                      <div className="flex flex-col items-end">
                        {' '}
                        <span className="font-medium text-primary">-1.48 Tỷ</span>{' '}
                        <span className="text-[11px] text-secondary font-semibold">(6.5% Ưu đãi)</span>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md text-right text-on-surface-variant">{' -120 Triệu '}</td>{' '}
                    <td className="py-space-md px-space-md text-right text-on-surface-variant">
                      {' '}
                      <div className="flex flex-col items-end">
                        {' '}
                        <span className="font-medium text-tertiary">-1.14 Tỷ</span>{' '}
                        <span className="text-[11px] text-on-surface-variant">(Giữ 5.0%)</span>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md text-right">
                      {' '}
                      <span className="font-headline-sm text-headline-sm text-primary font-bold">20.06 Tỷ</span>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md text-center">
                      {' '}
                      <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-[0.125rem] bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-bold uppercase">
                        {' '}
                        <Icon name="check" className="text-[14px] text-tertiary" aria-hidden />
                        {' Đã Giải Ngân (Lệnh #PO-8812) '}
                      </span>{' '}
                      <div className="text-[11px] text-on-surface-variant mt-0.5">Vietcombank CoreBanking • 09:15</div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md text-right">
                      {' '}
                      <button className="px-space-md py-1.5 rounded-[0.25rem] bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors shadow-sm inline-flex items-center gap-1">
                        {' '}
                        <Icon name="receipt_long" className="text-[16px] text-secondary" aria-hidden />{' '}
                        <span>Xem Ủy Nhiệm Chi</span>{' '}
                      </button>{' '}
                    </td>{' '}
                  </tr>{' '}
                  <tr className="hover:bg-surface-container-low/60 transition-colors">
                    {' '}
                    <td className="py-space-md px-space-md">
                      {' '}
                      <div className="flex items-center gap-space-sm">
                        {' '}
                        <div className="w-10 h-10 rounded-[0.25rem] bg-surface-container flex items-center justify-center text-primary font-bold font-headline-sm">
                          {' NL '}
                        </div>{' '}
                        <div className="flex flex-col min-w-0">
                          {' '}
                          <span className="font-body-md text-body-md font-semibold text-primary">
                            Như Lan Chợ Cũ Sài Gòn
                          </span>{' '}
                          <div className="flex items-center gap-1.5">
                            {' '}
                            <span className="font-label-sm text-label-sm text-secondary-container bg-primary-container px-1 rounded-[0.125rem] uppercase font-bold">
                              Hạng Vàng
                            </span>{' '}
                            <span className="text-outline-variant text-[10px]">•</span>{' '}
                            <span className="font-label-sm text-label-sm text-on-surface-variant">Mã: NL-2024-002</span>{' '}
                          </div>{' '}
                        </div>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md text-right font-headline-sm text-[16px] text-primary font-semibold">
                      {' 18.50 Tỷ '}
                    </td>{' '}
                    <td className="py-space-md px-space-md text-right text-on-surface-variant">
                      {' '}
                      <div className="flex flex-col items-end">
                        {' '}
                        <span className="font-medium text-primary">-1.48 Tỷ</span>{' '}
                        <span className="text-[11px] text-secondary font-semibold">(8.0% Chuẩn)</span>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md text-right text-on-surface-variant">{' -95 Triệu '}</td>{' '}
                    <td className="py-space-md px-space-md text-right text-on-surface-variant">
                      {' '}
                      <div className="flex flex-col items-end">
                        {' '}
                        <span className="font-medium text-tertiary">-925 Triệu</span>{' '}
                        <span className="text-[11px] text-on-surface-variant">(Giữ 8.0%)</span>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md text-right">
                      {' '}
                      <span className="font-headline-sm text-headline-sm text-primary font-bold">15.99 Tỷ</span>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md text-center">
                      {' '}
                      <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-[0.125rem] bg-secondary-fixed/40 text-on-secondary-fixed font-label-sm text-label-sm font-bold uppercase">
                        {' '}
                        <Icon name="pending_actions" className="text-[14px]" aria-hidden />
                        {' Chờ Ký Giao Hàng (Sun Group) '}
                      </span>{' '}
                      <div className="text-[11px] text-on-surface-variant mt-0.5">
                        Xe đang dỡ hàng tại Sun Marina Hạ Long
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md text-right">
                      {' '}
                      <button className="px-space-md py-1.5 rounded-[0.25rem] bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors shadow-sm inline-flex items-center gap-1">
                        {' '}
                        <Icon name="visibility" className="text-[16px]" aria-hidden /> <span>Chi Tiết Đơn Hàng</span>{' '}
                      </button>{' '}
                    </td>{' '}
                  </tr>{' '}
                  <tr className="hover:bg-surface-container-low/60 transition-colors bg-error-container/10">
                    {' '}
                    <td className="py-space-md px-space-md">
                      {' '}
                      <div className="flex items-center gap-space-sm">
                        {' '}
                        <div className="w-10 h-10 rounded-[0.25rem] bg-error-container/40 flex items-center justify-center text-error font-bold font-headline-sm">
                          {' VH '}
                        </div>{' '}
                        <div className="flex flex-col min-w-0">
                          {' '}
                          <span className="font-body-md text-body-md font-semibold text-primary">
                            Vĩnh Hưng Hội An
                          </span>{' '}
                          <div className="flex items-center gap-1.5">
                            {' '}
                            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold">
                              Hạng Bạc
                            </span>{' '}
                            <span className="text-outline-variant text-[10px]">•</span>{' '}
                            <span className="font-label-sm text-label-sm text-on-surface-variant">Mã: VH-2024-015</span>{' '}
                          </div>{' '}
                        </div>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md text-right font-headline-sm text-[16px] text-primary font-semibold">
                      {' 8.40 Tỷ '}
                    </td>{' '}
                    <td className="py-space-md px-space-md text-right text-on-surface-variant">
                      {' '}
                      <div className="flex flex-col items-end">
                        {' '}
                        <span className="font-medium text-primary">-882 Triệu</span>{' '}
                        <span className="text-[11px] text-secondary font-semibold">(10.5% Sàn)</span>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md text-right text-on-surface-variant">{' -65 Triệu '}</td>{' '}
                    <td className="py-space-md px-space-md text-right text-on-surface-variant">
                      {' '}
                      <div className="flex flex-col items-end">
                        {' '}
                        <span className="font-medium text-error">-1.26 Tỷ</span>{' '}
                        <span className="text-[11px] text-error font-semibold">(Giữ 15% + Khoá SLA)</span>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md text-right">
                      {' '}
                      <span className="font-headline-sm text-headline-sm text-error font-bold">5.79 Tỷ</span>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md text-center">
                      {' '}
                      <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-[0.125rem] bg-error-container text-on-error-container font-label-sm text-label-sm font-bold uppercase">
                        {' '}
                        <Icon name="warning" className="text-[14px]" aria-hidden />
                        {' Tạm Giữ Đối Chứng Rủi Ro '}
                      </span>{' '}
                      <div className="text-[11px] text-error mt-0.5">Lệch nhiệt xe 43C-319.45 (+24°C quá 40p)</div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md text-right">
                      {' '}
                      <button className="px-space-md py-1.5 rounded-[0.25rem] bg-error text-on-error font-label-md text-label-md hover:bg-error/90 transition-colors shadow-sm inline-flex items-center gap-1">
                        {' '}
                        <Icon name="gavel" className="text-[16px]" aria-hidden /> <span>Biên Bản Xử Lý</span>{' '}
                      </button>{' '}
                    </td>{' '}
                  </tr>{' '}
                </tbody>{' '}
              </table>{' '}
            </div>{' '}
            <div className="pt-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
              {' '}
              <div className="flex items-center gap-space-sm text-on-surface-variant font-body-sm text-body-sm">
                {' '}
                <span>Hiển thị 4 trên 42 xưởng bánh đối tác</span> <span className="text-outline-variant">•</span>{' '}
                <span className="text-primary font-medium">Tổng giải ngân khả dụng đợt này: 50.15 Tỷ VNĐ</span>{' '}
              </div>{' '}
              <div className="flex items-center gap-space-sm">
                {' '}
                <button className="px-space-md py-2 rounded-[0.25rem] bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors">
                  {' Xem Tất Cả 42 Lò '}
                </button>{' '}
                <button className="px-space-md py-2 rounded-[0.25rem] bg-primary-container text-champagne-light font-label-md text-label-md hover:bg-ink-dark transition-all flex items-center gap-1.5 shadow-sm">
                  {' '}
                  <Icon name="token" className="text-[18px] text-secondary-fixed" aria-hidden />{' '}
                  <span>Ký Duyệt Toàn Bộ Lô Đủ Điều Kiện (28 Lò)</span>{' '}
                </button>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
            {' '}
            <div className="lg:col-span-7 bg-surface-container-lowest p-space-lg rounded-[0.5rem] shadow-sm flex flex-col justify-between">
              {' '}
              <div className="flex flex-col gap-space-sm">
                {' '}
                <div className="flex items-center justify-between">
                  {' '}
                  <div className="flex items-center gap-2">
                    {' '}
                    <Icon name="shield" className="text-secondary text-[22px]" aria-hidden />{' '}
                    <h3 className="font-headline-md text-headline-md text-primary font-semibold">
                      {' Quỹ Ký Quỹ Bảo Lãnh Chất Lượng (Escrow Reserve Ledger) '}
                    </h3>{' '}
                  </div>{' '}
                  <span className="px-space-xs py-0.5 rounded-[0.125rem] bg-tertiary-fixed/30 text-tertiary font-label-sm text-label-sm uppercase font-bold">
                    {' Bảo Hiểm Chuỗi Cung Ứng '}
                  </span>{' '}
                </div>{' '}
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {
                    ' Cơ chế bảo vệ khách hàng doanh nghiệp đặt bánh số lượng lớn. Tiền ký quỹ của lò nghệ nhân được khóa trong tài khoản ký quỹ độc lập và giải phóng dần theo lộ trình chuẩn. '
                  }
                </p>{' '}
                <div className="my-space-md p-space-md bg-surface-container-low rounded-[0.5rem] flex flex-col gap-space-md">
                  {' '}
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
                    {' Tiến Trình Giải Phóng Ký Quỹ Lũy Tiến Tự Động '}
                  </span>{' '}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                    {' '}
                    <div className="bg-surface-container-lowest p-space-md rounded-[0.25rem] flex flex-col gap-1 shadow-sm">
                      {' '}
                      <div className="flex items-center justify-between">
                        {' '}
                        <span className="font-label-sm text-label-sm font-bold text-secondary">
                          Giai Đoạn 1 • 50% Ký Quỹ
                        </span>{' '}
                        <Icon name="verified" className="text-tertiary text-[18px]" aria-hidden />{' '}
                      </div>{' '}
                      <span className="font-headline-sm text-headline-sm text-primary font-semibold">
                        T+3 Sau Khi Giao
                      </span>{' '}
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {
                          ' Giải ngân ngay 50% tiền giữ lại khi doanh nghiệp hoàn tất quét mã QR nghiệm thu độ tươi và không có khiếu nại vỡ hộp. '
                        }
                      </p>{' '}
                      <div className="w-full bg-surface-container h-1.5 rounded-[0.75rem] overflow-hidden mt-1">
                        {' '}
                        <div className="bg-secondary h-full w-full"></div>{' '}
                      </div>{' '}
                    </div>{' '}
                    <div className="bg-surface-container-lowest p-space-md rounded-[0.25rem] flex flex-col gap-1 shadow-sm">
                      {' '}
                      <div className="flex items-center justify-between">
                        {' '}
                        <span className="font-label-sm text-label-sm font-bold text-on-surface-variant">
                          Giai Đoạn 2 • 50% Còn Lại
                        </span>{' '}
                        <Icon name="event_available" className="text-outline-variant text-[18px]" aria-hidden />{' '}
                      </div>{' '}
                      <span className="font-headline-sm text-headline-sm text-primary font-semibold">
                        Hậu Rằm Tháng 8 (T+15)
                      </span>{' '}
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {
                          ' Giải ngân toàn bộ số dư Escrow còn lại khi hết thời hạn bảo chứng chất lượng và kiểm toán quyết toán mùa trăng. '
                        }
                      </p>{' '}
                      <div className="w-full bg-surface-container h-1.5 rounded-[0.75rem] overflow-hidden mt-1">
                        {' '}
                        <div className="bg-secondary-fixed-dim h-full w-1/3"></div>{' '}
                      </div>{' '}
                    </div>{' '}
                  </div>{' '}
                  <div className="flex items-center justify-between bg-surface-container p-space-sm rounded-[0.25rem] text-body-sm text-on-surface">
                    {' '}
                    <span className="flex items-center gap-1.5">
                      {' '}
                      <Icon name="lock" className="text-[16px] text-tertiary" aria-hidden />
                      {' Số dư ký quỹ đang được phong tỏa bảo hiểm: '}
                    </span>{' '}
                    <span className="font-headline-sm text-[16px] font-bold text-primary">18,540,000,000 VNĐ</span>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
              <div className="pt-space-sm flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
                {' '}
                <span className="flex items-center gap-1">
                  {' '}
                  <Icon name="info" className="text-[16px] text-secondary" aria-hidden />
                  {' Tự động trích bồi hoàn 100% nếu phát hiện nhiễm khuẩn tụ cầu hoặc vượt ẩm mốc. '}
                </span>{' '}
                <a className="font-label-sm text-label-sm text-secondary hover:underline uppercase font-bold" href="#">
                  Quy chế ký quỹ →
                </a>{' '}
              </div>{' '}
            </div>{' '}
            <div className="lg:col-span-5 bg-surface-container-lowest p-space-lg rounded-[0.5rem] shadow-sm flex flex-col justify-between">
              {' '}
              <div className="flex flex-col gap-space-sm">
                {' '}
                <div className="flex items-center justify-between">
                  {' '}
                  <div className="flex items-center gap-2">
                    {' '}
                    <Icon name="receipt" className="text-secondary text-[22px]" aria-hidden />{' '}
                    <h3 className="font-headline-md text-headline-md text-primary font-semibold">
                      {' Hóa Đơn Điện Tử B2B '}
                    </h3>{' '}
                  </div>{' '}
                  <span className="px-space-xs py-0.5 rounded-[0.125rem] bg-tertiary-fixed/30 text-tertiary font-label-sm text-label-sm uppercase font-bold">
                    {' 100% Khớp Mã MST '}
                  </span>{' '}
                </div>{' '}
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {
                    ' Tự động khởi tạo và ký số hóa đơn điện tử giá trị gia tăng (VAT 8%) theo từng đơn hàng doanh nghiệp qua hệ thống VNPT-Invoice & Viettel Sinvoice. '
                  }
                </p>{' '}
                <div className="flex flex-col gap-space-xs my-space-sm">
                  {' '}
                  <div className="p-space-md bg-surface-container-low rounded-[0.25rem] flex items-center justify-between">
                    {' '}
                    <div className="flex items-center gap-space-sm">
                      {' '}
                      <div className="w-8 h-8 rounded-[0.25rem] bg-surface-container flex items-center justify-center text-primary">
                        {' '}
                        <Icon name="verified" className="text-[18px]" aria-hidden />{' '}
                      </div>{' '}
                      <div className="flex flex-col">
                        {' '}
                        <span className="font-body-md text-body-md font-semibold text-primary">
                          124 Hóa Đơn Sỉ Đã Ký
                        </span>{' '}
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Tổng tiền thuế VAT: 9.39 Tỷ VNĐ
                        </span>{' '}
                      </div>{' '}
                    </div>{' '}
                    <span className="font-label-sm text-label-sm font-bold text-tertiary">HOÀN TẤT</span>{' '}
                  </div>{' '}
                  <div className="p-space-md bg-surface-container-low rounded-[0.25rem] flex items-center justify-between">
                    {' '}
                    <div className="flex items-center gap-space-sm">
                      {' '}
                      <div className="w-8 h-8 rounded-[0.25rem] bg-surface-container flex items-center justify-center text-secondary">
                        {' '}
                        <Icon name="cloud_sync" className="text-[18px]" aria-hidden />{' '}
                      </div>{' '}
                      <div className="flex flex-col">
                        {' '}
                        <span className="font-body-md text-body-md font-semibold text-primary">
                          Cổng ERP Kế Toán (SAP / MISA)
                        </span>{' '}
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Đồng bộ tự động 15 phút / lần
                        </span>{' '}
                      </div>{' '}
                    </div>{' '}
                    <span className="font-label-sm text-label-sm font-bold text-secondary">TRỰC TUYẾN</span>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
              <div className="flex flex-col gap-space-xs pt-space-md">
                {' '}
                <button className="w-full py-2.5 rounded-[0.25rem] bg-surface-container-high text-primary font-label-md text-label-md hover:bg-surface-variant transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                  {' '}
                  <Icon name="sync" className="text-[18px] text-secondary" aria-hidden />{' '}
                  <span>Đồng Bộ Hóa Đơn Ngay Lập Tức Với SAP ERP</span>{' '}
                </button>{' '}
                <div className="text-center font-body-sm text-body-sm text-on-surface-variant mt-1">
                  {' Lần đồng bộ kế toán gần nhất: 10 phút trước • Chứng thư số Viettel CA hợp lệ '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
      </div>
    </>
  )
}
