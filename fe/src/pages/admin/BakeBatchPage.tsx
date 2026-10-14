// Tự sinh từ bản thiết kế Stitch — giữ nguyên nội dung. Sửa logic ở trang bọc ngoài.
import { Icon } from '../../components/Icon'

export function BakeBatchPage() {
  return (
    <>
      <div className="flex flex-col w-full">
        {' '}
        <div className="w-full px-space-lg py-space-md bg-surface-container-low shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          {' '}
          <div className="flex flex-col">
            {' '}
            <div className="flex items-center gap-space-xs text-outline font-label-sm text-label-sm uppercase tracking-widest">
              {' '}
              <span>Xưởng Bánh Tinh Hoa</span> <span>/</span>{' '}
              <span className="text-secondary font-semibold">Giám Sát Mẻ Ra Lò Tươi</span> <span>/</span>{' '}
              <span className="text-primary font-bold">Thời Khắc: Ngày 14 Tháng 8 Âm Lịch</span>{' '}
            </div>{' '}
            <div className="flex items-baseline gap-space-md mt-1">
              {' '}
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                Cập Nhật Mẻ Bánh Ra Lò & Tồn Kho Tươi
              </h1>{' '}
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[0.75rem] bg-tertiary-container text-tertiary-fixed font-label-sm text-label-sm uppercase tracking-wider">
                {' '}
                <span className="w-1.5 h-1.5 rounded-[0.75rem] bg-tertiary-fixed animate-ping"></span>
                {' Đang Kiểm Định Trực Tiếp '}
              </span>{' '}
            </div>{' '}
            <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl mt-0.5">
              {
                ' Kiểm soát hạn xuất xưởng theo giờ, đảm bảo cam kết Date tươi trong ngày cho sàn Nguyệt Viên Đài. Nhiệt độ lò than hoa chuẩn chỉ từng khay đồng. '
              }
            </p>{' '}
          </div>{' '}
          <div className="flex items-center gap-space-sm self-start md:self-auto bg-surface-container-lowest px-space-md py-space-sm rounded-[0.25rem] shadow-sm">
            {' '}
            <div className="w-10 h-10 rounded-[0.75rem] bg-primary-container flex items-center justify-center text-champagne-light">
              {' '}
              <Icon name="oven_gen" className="text-[20px]" aria-hidden />{' '}
            </div>{' '}
            <div className="flex flex-col">
              {' '}
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                Trạng Thái Lò Lửa
              </span>{' '}
              <span className="font-headline-sm text-headline-sm text-primary leading-tight">4/4 Lò Đỏ Lửa</span>{' '}
            </div>{' '}
            <div className="h-8 w-px bg-surface-variant mx-1"></div>{' '}
            <div className="flex flex-col text-right">
              {' '}
              <span className="font-label-sm text-label-sm text-outline uppercase">Nhiệt Trung Bình</span>{' '}
              <span className="font-body-md text-body-md font-bold text-secondary">195°C Chuẩn</span>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
        <div className="px-space-lg py-space-lg grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
          {' '}
          <div className="bg-surface-container-lowest rounded-[0.5rem] p-space-md shadow-md flex flex-col justify-between hover:shadow-xl transition-all duration-300 group">
            {' '}
            <div className="flex items-start justify-between">
              {' '}
              <div className="flex flex-col">
                {' '}
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">
                  Giai Đoạn 01 • Bình Minh
                </span>{' '}
                <span className="font-headline-sm text-headline-sm text-primary mt-1">Mẻ Sáng Hôm Nay</span>{' '}
              </div>{' '}
              <div className="w-10 h-10 rounded-[0.25rem] bg-surface-container-low flex items-center justify-center text-secondary group-hover:bg-primary-container group-hover:text-champagne-light transition-colors">
                {' '}
                <Icon name="wb_twilight" className="text-[22px]" aria-hidden />{' '}
              </div>{' '}
            </div>{' '}
            <div className="my-space-md flex items-baseline gap-space-xs">
              {' '}
              <span className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight">
                2.850
              </span>{' '}
              <span className="font-body-sm text-body-sm text-on-surface-variant">chiếc ra lò</span>{' '}
            </div>{' '}
            <div className="pt-space-sm bg-surface-container-low/70 -mx-space-md -mb-space-md px-space-md pb-space-sm rounded-b-[0.5rem] flex items-center justify-between">
              {' '}
              <div className="flex items-center gap-1.5 text-on-surface">
                {' '}
                <Icon name="verified" className="text-[16px] text-tertiary-fixed-dim" aria-hidden />{' '}
                <span className="font-label-md text-label-md text-on-surface-variant">Khung: 04:30 - 08:30</span>{' '}
              </div>{' '}
              <span className="font-label-sm text-label-sm text-tertiary-container bg-tertiary-fixed px-2 py-0.5 rounded-[0.125rem] uppercase font-semibold">
                Đạt VSATTP
              </span>{' '}
            </div>{' '}
          </div>{' '}
          <div className="bg-surface-container-lowest rounded-[0.5rem] p-space-md shadow-md flex flex-col justify-between hover:shadow-xl transition-all duration-300 group">
            {' '}
            <div className="flex items-start justify-between">
              {' '}
              <div className="flex flex-col">
                {' '}
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">
                  Kế Hoạch • Hoàng Hôn
                </span>{' '}
                <span className="font-headline-sm text-headline-sm text-primary mt-1">Lò Dự Kiến Chiều</span>{' '}
              </div>{' '}
              <div className="w-10 h-10 rounded-[0.25rem] bg-surface-container-low flex items-center justify-center text-secondary group-hover:bg-primary-container group-hover:text-champagne-light transition-colors">
                {' '}
                <Icon name="local_fire_department" className="text-[22px]" aria-hidden />{' '}
              </div>{' '}
            </div>{' '}
            <div className="my-space-md flex items-baseline justify-between">
              {' '}
              <div className="flex items-baseline gap-space-xs">
                {' '}
                <span className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight">
                  3.500
                </span>{' '}
                <span className="font-body-sm text-body-sm text-on-surface-variant">bánh mộc</span>{' '}
              </div>{' '}
              <div className="relative w-12 h-12 flex items-center justify-center">
                {' '}
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                  {' '}
                  <path
                    className="text-surface-variant"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                  ></path>{' '}
                  <path
                    className="text-secondary"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="88, 100"
                    strokeLinecap="round"
                    strokeWidth="3.5"
                  ></path>{' '}
                </svg>{' '}
                <span className="absolute font-label-sm text-label-sm font-bold text-primary">88%</span>{' '}
              </div>{' '}
            </div>{' '}
            <div className="pt-space-sm bg-surface-container-low/70 -mx-space-md -mb-space-md px-space-md pb-space-sm rounded-b-[0.5rem] flex items-center justify-between">
              {' '}
              <span className="font-label-md text-label-md text-on-surface-variant">Than củi nhãn Hưng Yên</span>{' '}
              <span className="font-label-sm text-label-sm text-secondary font-semibold">Tải Nướng Cao Điểm</span>{' '}
            </div>{' '}
          </div>{' '}
          <div className="bg-surface-container-lowest rounded-[0.5rem] p-space-md shadow-md flex flex-col justify-between hover:shadow-xl transition-all duration-300 group">
            {' '}
            <div className="flex items-start justify-between">
              {' '}
              <div className="flex flex-col">
                {' '}
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">
                  Đoàn Thể & Doanh Nghiệp
                </span>{' '}
                <span className="font-headline-sm text-headline-sm text-primary mt-1">Đã Đặt Trước B2B</span>{' '}
              </div>{' '}
              <div className="w-10 h-10 rounded-[0.25rem] bg-surface-container-low flex items-center justify-center text-secondary group-hover:bg-primary-container group-hover:text-champagne-light transition-colors">
                {' '}
                <Icon name="corporate_fare" className="text-[22px]" aria-hidden />{' '}
              </div>{' '}
            </div>{' '}
            <div className="my-space-md flex items-baseline gap-space-xs">
              {' '}
              <span className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight">
                4.200
              </span>{' '}
              <span className="font-body-sm text-body-sm text-on-surface-variant">hộp di sản</span>{' '}
            </div>{' '}
            <div className="pt-space-sm bg-surface-container-low/70 -mx-space-md -mb-space-md px-space-md pb-space-sm rounded-b-[0.5rem] flex items-center justify-between">
              {' '}
              <div className="flex items-center gap-1.5">
                {' '}
                <Icon name="lock" className="text-[16px] text-secondary" aria-hidden />{' '}
                <span className="font-label-md text-label-md text-on-surface-variant">Khóa 18 mộc doanh nghiệp</span>{' '}
              </div>{' '}
              <span className="font-label-sm text-label-sm text-primary-container bg-primary-fixed px-2 py-0.5 rounded-[0.125rem] font-semibold">
                Ưu Tiên Xe Lạnh
              </span>{' '}
            </div>{' '}
          </div>{' '}
          <div className="bg-surface-container-lowest rounded-[0.5rem] p-space-md shadow-md flex flex-col justify-between hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
            {' '}
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-error-container/30 rounded-[0.75rem] blur-xl pointer-events-none"></div>{' '}
            <div className="flex items-start justify-between">
              {' '}
              <div className="flex flex-col">
                {' '}
                <span className="font-label-sm text-label-sm text-error uppercase tracking-widest font-bold">
                  Cảnh Báo Sàn Trực Tuyến
                </span>{' '}
                <span className="font-headline-sm text-headline-sm text-primary mt-1">Tồn Kho Bán Lẻ</span>{' '}
              </div>{' '}
              <div className="w-10 h-10 rounded-[0.25rem] bg-error-container/50 flex items-center justify-center text-error">
                {' '}
                <Icon name="inventory_2" className="text-[22px]" aria-hidden />{' '}
              </div>{' '}
            </div>{' '}
            <div className="my-space-md flex items-baseline gap-space-xs">
              {' '}
              <span className="font-headline-xl text-headline-xl text-error font-bold tracking-tight">1.150</span>{' '}
              <span className="font-body-sm text-body-sm text-on-surface-variant">bánh tự do</span>{' '}
            </div>{' '}
            <div className="pt-space-sm bg-error-container/20 -mx-space-md -mb-space-md px-space-md pb-space-sm rounded-b-[0.5rem] flex items-center justify-between">
              {' '}
              <span className="font-label-sm text-label-sm text-error font-semibold flex items-center gap-1">
                {' '}
                <Icon name="warning" className="text-[14px]" aria-hidden />
                {' Sắp cháy hàng Lava Trứng Muối '}
              </span>{' '}
              <button className="text-error hover:underline font-label-sm text-label-sm font-bold uppercase">
                Bổ sung
              </button>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
        <div className="px-space-lg pb-space-xl flex flex-col lg:flex-row gap-space-lg">
          {' '}
          <div className="w-full lg:w-5/12 flex flex-col gap-space-lg">
            {' '}
            <div className="bg-surface-container-lowest rounded-[0.5rem] p-space-lg shadow-md flex flex-col justify-between">
              {' '}
              <div className="flex items-center justify-between pb-space-md">
                {' '}
                <div className="flex items-center gap-space-sm">
                  {' '}
                  <Icon name="soup_kitchen" className="text-secondary text-[24px]" aria-hidden />{' '}
                  <h2 className="font-headline-sm text-headline-sm text-primary">Khởi Tạo Mẻ Nướng Mới</h2>{' '}
                </div>{' '}
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest bg-secondary-fixed/50 px-2 py-0.5 rounded-[0.125rem]">
                  Quy Trình Mộc #094
                </span>{' '}
              </div>{' '}
              <form className="flex flex-col gap-space-md mt-space-sm" id="batchForm">
                {' '}
                <div className="flex flex-col gap-1">
                  {' '}
                  <label className="font-label-md text-label-md text-primary uppercase tracking-wider flex items-center justify-between">
                    {' '}
                    <span>Dòng Bánh Di Sản Ra Lò</span>{' '}
                    <span className="text-secondary text-[10px] normal-case">Nguyên bản nghệ nhân</span>{' '}
                  </label>{' '}
                  <div className="relative">
                    {' '}
                    <select className="w-full h-11 px-space-md rounded-[0.25rem] bg-surface text-primary font-body-md text-body-md appearance-none focus:outline-none focus:bg-surface-container-lowest transition-all cursor-pointer">
                      {' '}
                      <option value="bat-buu">Bánh Nướng Thập Cẩm Bát Bửu Cổ Truyền (Trứng Muối Đôi)</option>{' '}
                      <option value="lava-hoang-kim">Bánh Nướng Lava Trứng Muối Hoàng Kim Chảy</option>{' '}
                      <option value="bao-ngu-xo">Bánh Nướng Bào Ngư Vi Cá Sốt XO Thượng Hạng</option>{' '}
                      <option value="sen-trang-matcha">Bánh Dẻo Sen Trắng Bách Hoa Trà Xanh Uji Matcha</option>{' '}
                      <option value="dau-xanh-sau-rieng">Bánh Nướng Đậu Xanh Sầu Riêng Ri6 Hạt Dưa</option>{' '}
                    </select>{' '}
                    <Icon
                      name="unfold_more"
                      className="absolute right-3 top-3 pointer-events-none text-outline"
                      aria-hidden
                    />{' '}
                  </div>{' '}
                </div>{' '}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                  {' '}
                  <div className="flex flex-col gap-1">
                    {' '}
                    <label className="font-label-md text-label-md text-primary uppercase tracking-wider">
                      Khung Giờ Ra Lò Dự Kiến
                    </label>{' '}
                    <div className="relative">
                      {' '}
                      <input
                        className="w-full h-11 px-space-md rounded-[0.25rem] bg-surface text-primary font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest transition-all"
                        type="text"
                        defaultValue="Mẻ Chiều: 14:00 - 16:30"
                      />{' '}
                      <Icon name="alarm" className="absolute right-3 top-3 text-outline text-[18px]" aria-hidden />{' '}
                    </div>{' '}
                  </div>{' '}
                  <div className="flex flex-col gap-1">
                    {' '}
                    <label className="font-label-md text-label-md text-primary uppercase tracking-wider">
                      Số Lượng Bánh Mộc
                    </label>{' '}
                    <div className="relative flex items-center">
                      {' '}
                      <input
                        className="w-full h-11 px-space-md rounded-[0.25rem] bg-surface text-primary font-body-md text-body-md font-semibold focus:outline-none focus:bg-surface-container-lowest transition-all"
                        id="batchCountInput"
                        max={5000}
                        min={50}
                        step={50}
                        type="number"
                        defaultValue="850"
                      />{' '}
                      <span className="absolute right-3 font-label-sm text-label-sm text-outline uppercase">Chiếc</span>{' '}
                    </div>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                  {' '}
                  <div className="flex flex-col gap-1">
                    {' '}
                    <div className="flex justify-between items-center">
                      {' '}
                      <label className="font-label-md text-label-md text-primary uppercase tracking-wider">
                        Nhiệt Kiểm Chuẩn
                      </label>{' '}
                      <span className="font-label-md text-label-md font-bold text-secondary" id="tempDisplay">
                        195°C (Lửa Than)
                      </span>{' '}
                    </div>{' '}
                    <div className="h-11 px-space-sm rounded-[0.25rem] bg-surface flex items-center justify-center">
                      {' '}
                      <input
                        className="w-full accent-secondary cursor-pointer"
                        id="tempRange"
                        max={220}
                        min={175}
                        type="range"
                        defaultValue="195"
                      />{' '}
                    </div>{' '}
                  </div>{' '}
                  <div className="flex flex-col gap-1">
                    {' '}
                    <label className="font-label-md text-label-md text-primary uppercase tracking-wider">
                      Trưởng Ca Canh Lửa
                    </label>{' '}
                    <div className="relative">
                      {' '}
                      <select className="w-full h-11 px-space-md rounded-[0.25rem] bg-surface text-primary font-body-md text-body-md appearance-none focus:outline-none focus:bg-surface-container-lowest transition-all cursor-pointer">
                        {' '}
                        <option>Nghệ nhân Đặng Văn Đông (42 năm nghề)</option>{' '}
                        <option>Phó thợ cả Lương Thế Cường</option>{' '}
                        <option>Nghệ nhân Đỗ Thị Mai Liên (Kiểm tra da bánh)</option>{' '}
                      </select>{' '}
                      <Icon
                        name="badge"
                        className="absolute right-3 top-3 pointer-events-none text-outline"
                        aria-hidden
                      />{' '}
                    </div>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="p-space-sm rounded-[0.25rem] bg-surface-container-low flex flex-col gap-2">
                  {' '}
                  <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">
                    Tiêu Chuẩn Nướng Hoàng Gia OCOP 5★
                  </span>{' '}
                  <label className="flex items-center gap-space-sm cursor-pointer select-none">
                    {' '}
                    <input defaultChecked className="w-4 h-4 accent-primary rounded-[0.125rem]" type="checkbox" />{' '}
                    <span className="font-body-sm text-body-sm text-on-surface">
                      Đã quét 3 lớp mỡ gà thảo mộc & lòng đỏ trứng gà ta hạ thổ
                    </span>{' '}
                  </label>{' '}
                  <label className="flex items-center gap-space-sm cursor-pointer select-none">
                    {' '}
                    <input defaultChecked className="w-4 h-4 accent-primary rounded-[0.125rem]" type="checkbox" />{' '}
                    <span className="font-body-sm text-body-sm text-on-surface">
                      Ủ lạnh vỏ bánh đúng 120 phút trước khi vào khuôn đồng chạm
                    </span>{' '}
                  </label>{' '}
                </div>{' '}
                <div className="pt-space-xs flex flex-col gap-space-xs">
                  {' '}
                  <button
                    className="w-full h-12 bg-primary text-secondary-fixed font-headline-sm text-[16px] tracking-wide rounded-[0.25rem] flex items-center justify-center gap-space-sm hover:bg-ink-dark transition-all duration-300 shadow-md"
                    type="submit"
                  >
                    {' '}
                    <Icon name="outdoor_grill" className="text-[20px] text-secondary-fixed" aria-hidden />{' '}
                    <span>Xác Nhận Đưa Vào Lò & Cập Nhật Date Tươi Lên Sàn</span>{' '}
                  </button>{' '}
                  <span className="text-center font-label-sm text-label-sm text-outline">
                    Dữ liệu sẽ đồng bộ ngay lập tức tới bảng giá B2B và kênh đặt trước Nguyệt Viên Đài
                  </span>{' '}
                </div>{' '}
              </form>{' '}
              <div
                className="hidden mt-space-md p-space-md rounded-[0.25rem] bg-tertiary-container text-champagne-light flex items-start gap-space-sm transition-all duration-500"
                id="successNotice"
              >
                {' '}
                <Icon name="task_alt" className="text-secondary-fixed text-[22px]" aria-hidden />{' '}
                <div className="flex flex-col">
                  {' '}
                  <span className="font-headline-sm text-[15px] text-secondary-fixed font-bold">
                    Mẻ Chiều Đã Đưa Vào Lò Thành Công!
                  </span>{' '}
                  <span className="font-body-sm text-body-sm text-tertiary-fixed">
                    Hệ thống đã khóa date xuất xưởng hôm nay lúc 16:30 và cấp 850 mã QR truy xuất nguồn gốc mộc.
                  </span>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
            <div className="bg-surface-container-lowest rounded-[0.5rem] p-space-lg shadow-md flex flex-col gap-space-md">
              {' '}
              <div className="flex items-center justify-between pb-space-xs">
                {' '}
                <div className="flex items-center gap-space-sm">
                  {' '}
                  <Icon name="bolt" className="text-secondary text-[22px]" aria-hidden />{' '}
                  <h3 className="font-headline-sm text-[18px] text-primary">Tác Vụ Tức Thì & Pháp Quy</h3>{' '}
                </div>{' '}
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  Hành Chính Xưởng
                </span>{' '}
              </div>{' '}
              <div className="grid grid-cols-1 gap-space-sm">
                {' '}
                <a
                  className="flex items-center justify-between p-space-sm rounded-[0.25rem] bg-surface-container-low hover:bg-champagne-light/30 transition-colors group"
                  href="javascript:void(0)"
                >
                  {' '}
                  <div className="flex items-center gap-space-sm">
                    {' '}
                    <div className="w-8 h-8 rounded-[0.125rem] bg-primary text-secondary-fixed flex items-center justify-center">
                      {' '}
                      <Icon name="ac_unit" className="text-[18px]" aria-hidden />{' '}
                    </div>{' '}
                    <div className="flex flex-col">
                      {' '}
                      <span className="font-body-md text-body-md font-semibold text-primary group-hover:text-secondary transition-colors">
                        Tải Phiếu Bàn Giao Chuỗi Lạnh 18°C
                      </span>{' '}
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Dành cho đội xe phân phối liên tỉnh Hải Phòng - Hà Nội
                      </span>{' '}
                    </div>{' '}
                  </div>{' '}
                  <Icon
                    name="download"
                    className="text-outline group-hover:text-primary transition-colors text-[20px]"
                    aria-hidden
                  />{' '}
                </a>{' '}
                <a
                  className="flex items-center justify-between p-space-sm rounded-[0.25rem] bg-surface-container-low hover:bg-champagne-light/30 transition-colors group"
                  href="javascript:void(0)"
                >
                  {' '}
                  <div className="flex items-center gap-space-sm">
                    {' '}
                    <div className="w-8 h-8 rounded-[0.125rem] bg-surface-variant text-primary flex items-center justify-center">
                      {' '}
                      <Icon name="liquor" className="text-[18px]" aria-hidden />{' '}
                    </div>{' '}
                    <div className="flex flex-col">
                      {' '}
                      <span className="font-body-md text-body-md font-semibold text-primary group-hover:text-secondary transition-colors">
                        Báo Cáo Hao Hụt & Khảo Thử Nếm
                      </span>{' '}
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Lưu mẫu kiểm định ngẫu nhiên 3 bánh mỗi mẻ lò
                      </span>{' '}
                    </div>{' '}
                  </div>{' '}
                  <Icon
                    name="fact_check"
                    className="text-outline group-hover:text-primary transition-colors text-[20px]"
                    aria-hidden
                  />{' '}
                </a>{' '}
                <div className="p-space-sm rounded-[0.25rem] bg-error-container/20 flex items-start gap-space-sm">
                  {' '}
                  <Icon name="notification_important" className="text-error text-[20px] mt-0.5" aria-hidden />{' '}
                  <div className="flex flex-col">
                    {' '}
                    <span className="font-headline-sm text-[14px] text-error font-bold">
                      Cảnh Báo Kho Nguyên Liệu Tinh Tuyển:
                    </span>{' '}
                    <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      {' Lượng '}
                      <strong>Trứng Muối Ba Bể</strong>
                      {' và '}
                      <strong>Lạp Xưởng Mai Quế Lộ Thật</strong>
                      {' chỉ còn đủ cho 1.400 bánh mẻ tối. Cần duyệt nhập kho khẩn cấp trước 15:00. '}
                    </span>{' '}
                    <div className="mt-2 flex gap-space-sm">
                      {' '}
                      <button className="px-2.5 py-1 rounded-[0.125rem] bg-error text-on-error font-label-sm text-label-sm uppercase font-bold tracking-wider hover:opacity-90">
                        Duyệt Nhập Liệu
                      </button>{' '}
                      <button className="px-2.5 py-1 rounded-[0.125rem] bg-surface-container-highest text-primary font-label-sm text-label-sm uppercase font-semibold">
                        Bỏ qua
                      </button>{' '}
                    </div>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
          <div className="w-full lg:w-7/12 flex flex-col gap-space-md">
            {' '}
            <div className="bg-surface-container-lowest rounded-[0.5rem] shadow-md p-space-lg flex flex-col">
              {' '}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-md">
                {' '}
                <div>
                  {' '}
                  <div className="flex items-center gap-space-xs">
                    {' '}
                    <Icon name="menu_book" className="text-secondary text-[22px]" aria-hidden />{' '}
                    <h2 className="font-headline-sm text-headline-sm text-primary">Danh Mục Sản Phẩm Đang Mở Bán</h2>{' '}
                  </div>{' '}
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Cân đối phân bổ sản lượng giữa kênh bán lẻ trực tuyến và hợp đồng doanh nghiệp B2B
                  </p>{' '}
                </div>{' '}
                <div className="flex items-center gap-space-sm">
                  {' '}
                  <button className="px-3 py-1.5 rounded-[0.25rem] bg-primary text-secondary-fixed font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                    Tất Cả (5 Dòng)
                  </button>{' '}
                  <button className="px-3 py-1.5 rounded-[0.25rem] bg-surface-container-low text-on-surface-variant hover:bg-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                    Đang Nướng
                  </button>{' '}
                  <button className="px-3 py-1.5 rounded-[0.25rem] bg-surface-container-low text-on-surface-variant hover:bg-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                    B2B Khóa Mộc
                  </button>{' '}
                </div>{' '}
              </div>{' '}
              <div className="overflow-x-auto -mx-space-lg px-space-lg">
                {' '}
                <table className="w-full text-left">
                  {' '}
                  <thead>
                    {' '}
                    <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                      {' '}
                      <th className="py-3 px-space-md rounded-l-[0.25rem]">Bánh & Vị Thượng Phẩm</th>{' '}
                      <th className="py-3 px-space-md">Đơn Giá (Lẻ / Sỉ)</th>{' '}
                      <th className="py-3 px-space-md">Đã Ra Lò</th> <th className="py-3 px-space-md">Tồn Kho Tươi</th>{' '}
                      <th className="py-3 px-space-md">Trạng Thái Sàn</th>{' '}
                      <th className="py-3 px-space-md text-right rounded-r-[0.25rem]">Thao Tác</th>{' '}
                    </tr>{' '}
                  </thead>{' '}
                  <tbody className="divide-y-0">
                    {' '}
                    <tr className="hover:bg-surface-container-low/50 transition-colors group">
                      {' '}
                      <td className="py-space-md px-space-md">
                        {' '}
                        <div className="flex items-center gap-space-md">
                          {' '}
                          <img
                            className="w-14 h-14 object-cover rounded-[0.25rem] shadow-sm group-hover:scale-105 transition-transform duration-300"
                            data-alt="Traditional luxury Vietnamese artisanal mooncake with intricate golden brown woodblock stamp crest, sliced to reveal rich eight-treasure savory filling with cured salted egg yolk, set on a dark slate board with subtle gold leaf specks in moody atmospheric lighting."
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRQM0Xt_qeo63A0gYiCMz0VK3ujXnECSTCam3DPANZulKPWRJXD3_f3TfMAfxqGhHl86crBDPkaDPiZRusyAwwKoPJn_he3rAGqQwcWYYRvcU3nQr4_OArjApsVBOGaD2zfYVsDGzom1-rmrOH1W7PxZ6Rv8nJTpaFDf3PKI8OGmu2qFMQ1VmMhYIQ9xzNCA9yywD4KVjjGvLO8A45y7YlYs9ANqxfDnCxwZIqBWveikvTvySw_Y4p"
                          />{' '}
                          <div className="flex flex-col min-w-0">
                            {' '}
                            <div className="flex items-center gap-1.5">
                              {' '}
                              <span className="font-headline-sm text-[16px] text-primary font-bold truncate">
                                Thập Cẩm Bát Bửu Cổ Truyền
                              </span>{' '}
                              <span className="px-1.5 py-0.2 rounded-[0.125rem] bg-secondary-container text-on-secondary-container font-label-sm text-[9px] uppercase font-bold tracking-wider">
                                Best Seller
                              </span>{' '}
                            </div>{' '}
                            <span className="font-body-sm text-body-sm text-secondary font-medium">
                              Trứng Muối Đôi • Lạp Xưởng Mai Quế Lộ
                            </span>{' '}
                            <span className="font-label-sm text-label-sm text-outline mt-0.5">
                              Khối lượng: 250g • Khuôn tròn viên mãn
                            </span>{' '}
                          </div>{' '}
                        </div>{' '}
                      </td>{' '}
                      <td className="py-space-md px-space-md">
                        {' '}
                        <div className="flex flex-col">
                          {' '}
                          <span className="font-body-md text-body-md font-bold text-primary">195.000 đ</span>{' '}
                          <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
                            Sỉ B2B: 148.000 đ
                          </span>{' '}
                        </div>{' '}
                      </td>{' '}
                      <td className="py-space-md px-space-md">
                        {' '}
                        <div className="flex flex-col">
                          {' '}
                          <span className="font-body-md text-body-md font-bold text-primary">1.200 chiếc</span>{' '}
                          <span className="font-label-sm text-label-sm text-tertiary-container">Mẻ Sáng #01</span>{' '}
                        </div>{' '}
                      </td>{' '}
                      <td className="py-space-md px-space-md">
                        {' '}
                        <div className="flex items-center gap-2">
                          {' '}
                          <span className="font-headline-sm text-[17px] font-bold text-primary">480</span>{' '}
                          <span className="w-2 h-2 rounded-[0.75rem] bg-tertiary-fixed-dim"></span>{' '}
                        </div>{' '}
                        <span className="font-label-sm text-label-sm text-outline">Đã giao B2B: 720</span>{' '}
                      </td>{' '}
                      <td className="py-space-md px-space-md">
                        {' '}
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[0.75rem] bg-tertiary-fixed text-tertiary-container font-label-sm text-label-sm uppercase font-bold tracking-wide">
                          {' '}
                          <span className="w-1.5 h-1.5 rounded-[0.75rem] bg-tertiary-container"></span>
                          {' Sẵn Sàng Giao '}
                        </span>{' '}
                      </td>{' '}
                      <td className="py-space-md px-space-md text-right">
                        {' '}
                        <div className="flex items-center justify-end gap-1">
                          {' '}
                          <button
                            className="w-8 h-8 rounded-[0.125rem] bg-surface-container-low hover:bg-primary hover:text-champagne-light text-primary flex items-center justify-center transition-colors"
                            title="In nhãn nhiệt date hôm nay"
                          >
                            {' '}
                            <Icon name="print" className="text-[18px]" aria-hidden />{' '}
                          </button>{' '}
                          <button
                            className="w-8 h-8 rounded-[0.125rem] bg-surface-container-low hover:bg-primary hover:text-champagne-light text-primary flex items-center justify-center transition-colors"
                            title="Cập nhật số lượng kho"
                          >
                            {' '}
                            <Icon name="edit_note" className="text-[18px]" aria-hidden />{' '}
                          </button>{' '}
                          <button
                            className="w-8 h-8 rounded-[0.125rem] bg-surface-container-low hover:bg-secondary hover:text-on-secondary text-secondary flex items-center justify-center transition-colors"
                            title="Khóa đơn sỉ doanh nghiệp"
                          >
                            {' '}
                            <Icon name="lock" className="text-[18px]" aria-hidden />{' '}
                          </button>{' '}
                        </div>{' '}
                      </td>{' '}
                    </tr>{' '}
                    <tr className="hover:bg-surface-container-low/50 transition-colors group bg-error-container/5">
                      {' '}
                      <td className="py-space-md px-space-md">
                        {' '}
                        <div className="flex items-center gap-space-md">
                          {' '}
                          <img
                            className="w-14 h-14 object-cover rounded-[0.25rem] shadow-sm group-hover:scale-105 transition-transform duration-300"
                            data-alt="Cut open decadent golden lava mooncake with oozing silky custard salted egg lava center, luxurious warm studio lighting on ivory marble surface with edible gold leaf dusting, high end patisserie presentation."
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbzICkMA-f020_dIrVaj05vvRzgyUhFZBAYIIg6w1FvTGmuCkhox4Q2mgoyAQgLsQxdpmjRS_7PdF7s9u8nsDJSgbSdmwcHdDMMS4diAJKcq1YSzB-Wuw05wnprMM82KMvWqVgSdpOj_cplWGS5h5jWyKLynfFHZy7LA_o2_2r1PZepECPCl19DcRwFUfb8T4a-5xU0kPeAtkQj7yRO85rOLC-RMh5WQRvLqhC38LM1Z4dadCX_akG"
                          />{' '}
                          <div className="flex flex-col min-w-0">
                            {' '}
                            <div className="flex items-center gap-1.5">
                              {' '}
                              <span className="font-headline-sm text-[16px] text-primary font-bold truncate">
                                Lava Trứng Muối Hoàng Kim
                              </span>{' '}
                              <span className="px-1.5 py-0.2 rounded-[0.125rem] bg-error-container text-error font-label-sm text-[9px] uppercase font-bold tracking-wider">
                                Cháy Hàng Lẻ
                              </span>{' '}
                            </div>{' '}
                            <span className="font-body-sm text-body-sm text-secondary font-medium">
                              Trứng Muối Nham Thạch Chảy • Vỏ Cacao Pháp
                            </span>{' '}
                            <span className="font-label-sm text-label-sm text-outline mt-0.5">
                              Khối lượng: 160g • Khuôn hoa cúc nổi
                            </span>{' '}
                          </div>{' '}
                        </div>{' '}
                      </td>{' '}
                      <td className="py-space-md px-space-md">
                        {' '}
                        <div className="flex flex-col">
                          {' '}
                          <span className="font-body-md text-body-md font-bold text-primary">215.000 đ</span>{' '}
                          <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
                            Sỉ B2B: 165.000 đ
                          </span>{' '}
                        </div>{' '}
                      </td>{' '}
                      <td className="py-space-md px-space-md">
                        {' '}
                        <div className="flex flex-col">
                          {' '}
                          <span className="font-body-md text-body-md font-bold text-primary">650 chiếc</span>{' '}
                          <span className="font-label-sm text-label-sm text-outline">Mẻ Sáng #02</span>{' '}
                        </div>{' '}
                      </td>{' '}
                      <td className="py-space-md px-space-md">
                        {' '}
                        <div className="flex items-center gap-2">
                          {' '}
                          <span className="font-headline-sm text-[17px] font-bold text-error">42</span>{' '}
                          <Icon name="trending_down" className="text-error text-[16px]" aria-hidden />{' '}
                        </div>{' '}
                        <span className="font-label-sm text-label-sm text-error font-semibold">Chỉ còn 42 hộp lẻ</span>{' '}
                      </td>{' '}
                      <td className="py-space-md px-space-md">
                        {' '}
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[0.75rem] bg-error-container text-error font-label-sm text-label-sm uppercase font-bold tracking-wide">
                          {' '}
                          <span className="w-1.5 h-1.5 rounded-[0.75rem] bg-error"></span>
                          {' Tạm Ngưng Nhận Đơn Lẻ '}
                        </span>{' '}
                      </td>{' '}
                      <td className="py-space-md px-space-md text-right">
                        {' '}
                        <div className="flex items-center justify-end gap-1">
                          {' '}
                          <button
                            className="w-8 h-8 rounded-[0.125rem] bg-surface-container-low hover:bg-primary hover:text-champagne-light text-primary flex items-center justify-center transition-colors"
                            title="In nhãn nhiệt date hôm nay"
                          >
                            {' '}
                            <Icon name="print" className="text-[18px]" aria-hidden />{' '}
                          </button>{' '}
                          <button
                            className="w-8 h-8 rounded-[0.125rem] bg-surface-container-low hover:bg-primary hover:text-champagne-light text-primary flex items-center justify-center transition-colors"
                            title="Cập nhật số lượng kho"
                          >
                            {' '}
                            <Icon name="add_circle" className="text-[18px]" aria-hidden />{' '}
                          </button>{' '}
                          <button
                            className="w-8 h-8 rounded-[0.125rem] bg-surface-container-low hover:bg-secondary hover:text-on-secondary text-secondary flex items-center justify-center transition-colors"
                            title="Khóa đơn sỉ doanh nghiệp"
                          >
                            {' '}
                            <Icon name="lock" className="text-[18px]" aria-hidden />{' '}
                          </button>{' '}
                        </div>{' '}
                      </td>{' '}
                    </tr>{' '}
                    <tr className="hover:bg-surface-container-low/50 transition-colors group">
                      {' '}
                      <td className="py-space-md px-space-md">
                        {' '}
                        <div className="flex items-center gap-space-md">
                          {' '}
                          <img
                            className="w-14 h-14 object-cover rounded-[0.25rem] shadow-sm group-hover:scale-105 transition-transform duration-300"
                            data-alt="Imperial style luxury savory mooncake embossed with dragon and phoenix crest, surrounded by whole dried abalones, scallop threads, and rich XO glaze on deep navy silk background with warm incandescent backlight."
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKz64TSuxcvCi-BJ-xeo0oALLzvPYDL3EfdP9H30EkTXGSZevLHGeCRnT_okcUgaH_hM09NPlZaF0PtNzhSZDMkI1ShXktcWSk6W16FHDTxOfRu1INeH4X0pE56-MXkyKVvxMbNEnTHGoxECmuaROKndmlCc8HDhXJ3fQBlLb7Zp3OEJP3-SismILLgaVNfXNtT_Br7wfpE5jGm6nRXlpToXAWpn9y0dChUB1ElV-KLw-0UnfbbNYs"
                          />{' '}
                          <div className="flex flex-col min-w-0">
                            {' '}
                            <div className="flex items-center gap-1.5">
                              {' '}
                              <span className="font-headline-sm text-[16px] text-primary font-bold truncate">
                                Bào Ngư Sốt XO Thượng Hạng
                              </span>{' '}
                              <span className="px-1.5 py-0.2 rounded-[0.125rem] bg-primary text-secondary-fixed font-label-sm text-[9px] uppercase font-bold tracking-wider">
                                Thượng Phẩm
                              </span>{' '}
                            </div>{' '}
                            <span className="font-body-sm text-body-sm text-secondary font-medium">
                              Bào Ngư Nam Phi • Điệp Khô • Rượu Cổ Bình
                            </span>{' '}
                            <span className="font-label-sm text-label-sm text-outline mt-0.5">
                              Khối lượng: 280g • Mộc Hoàng Gia mạ vàng
                            </span>{' '}
                          </div>{' '}
                        </div>{' '}
                      </td>{' '}
                      <td className="py-space-md px-space-md">
                        {' '}
                        <div className="flex flex-col">
                          {' '}
                          <span className="font-body-md text-body-md font-bold text-primary">380.000 đ</span>{' '}
                          <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
                            Sỉ B2B: 295.000 đ
                          </span>{' '}
                        </div>{' '}
                      </td>{' '}
                      <td className="py-space-md px-space-md">
                        {' '}
                        <div className="flex flex-col">
                          {' '}
                          <span className="font-body-md text-body-md font-bold text-primary">500 chiếc</span>{' '}
                          <span className="font-label-sm text-label-sm text-secondary">Đang Canh Lửa</span>{' '}
                        </div>{' '}
                      </td>{' '}
                      <td className="py-space-md px-space-md">
                        {' '}
                        <div className="flex items-center gap-2">
                          {' '}
                          <span className="font-headline-sm text-[17px] font-bold text-primary">320</span>{' '}
                          <span className="w-2 h-2 rounded-[0.75rem] bg-secondary"></span>{' '}
                        </div>{' '}
                        <span className="font-label-sm text-label-sm text-outline">B2B cọc: 180 hộp</span>{' '}
                      </td>{' '}
                      <td className="py-space-md px-space-md">
                        {' '}
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[0.75rem] bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm uppercase font-bold tracking-wide">
                          {' '}
                          <span className="w-1.5 h-1.5 rounded-[0.75rem] bg-secondary animate-pulse"></span>
                          {' Đang Trong Lò Nướng '}
                        </span>{' '}
                      </td>{' '}
                      <td className="py-space-md px-space-md text-right">
                        {' '}
                        <div className="flex items-center justify-end gap-1">
                          {' '}
                          <button
                            className="w-8 h-8 rounded-[0.125rem] bg-surface-container-low hover:bg-primary hover:text-champagne-light text-primary flex items-center justify-center transition-colors"
                            title="In nhãn nhiệt date hôm nay"
                          >
                            {' '}
                            <Icon name="print" className="text-[18px]" aria-hidden />{' '}
                          </button>{' '}
                          <button
                            className="w-8 h-8 rounded-[0.125rem] bg-surface-container-low hover:bg-primary hover:text-champagne-light text-primary flex items-center justify-center transition-colors"
                            title="Cập nhật số lượng kho"
                          >
                            {' '}
                            <Icon name="edit_note" className="text-[18px]" aria-hidden />{' '}
                          </button>{' '}
                          <button
                            className="w-8 h-8 rounded-[0.125rem] bg-surface-container-low hover:bg-secondary hover:text-on-secondary text-secondary flex items-center justify-center transition-colors"
                            title="Khóa đơn sỉ doanh nghiệp"
                          >
                            {' '}
                            <Icon name="lock_open" className="text-[18px]" aria-hidden />{' '}
                          </button>{' '}
                        </div>{' '}
                      </td>{' '}
                    </tr>{' '}
                    <tr className="hover:bg-surface-container-low/50 transition-colors group">
                      {' '}
                      <td className="py-space-md px-space-md">
                        {' '}
                        <div className="flex items-center gap-space-md">
                          {' '}
                          <img
                            className="w-14 h-14 object-cover rounded-[0.25rem] shadow-sm group-hover:scale-105 transition-transform duration-300"
                            data-alt="Snow skin soft white Vietnamese mooncake dusted with green matcha powder, tender delicate translucent pastry with lotus seed flower motif, paired with vintage ceramic tea cup on clean warm ivory linen."
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPtNV1V0uKgozT0tCYG5-zA0553_aXj2thRsgcDCVJfr8XKzsoVxkcpKwJZxX43l6ynUbDZDZ57UpTWGOsK1WWdxGuXAh80pNbFOpJ5-NCWI3S8Uls-fV8SIfbTOxHLBOg2vv06zEZdH2ChOOhUQsCx6lLZQpUhpwnFqs_T2yyoJQGEJD3SdZ-IEr-DD2uPEOenz8TbgEqyXsPb-BOcgGBkObPTMOKhl8Pq1wqV4TL2T0U6R2tRBB1"
                          />{' '}
                          <div className="flex flex-col min-w-0">
                            {' '}
                            <div className="flex items-center gap-1.5">
                              {' '}
                              <span className="font-headline-sm text-[16px] text-primary font-bold truncate">
                                Bánh Dẻo Sen Trắng Bách Hoa
                              </span>{' '}
                              <span className="px-1.5 py-0.2 rounded-[0.125rem] bg-tertiary-fixed text-tertiary-container font-label-sm text-[9px] uppercase font-bold tracking-wider">
                                Thanh Tao
                              </span>{' '}
                            </div>{' '}
                            <span className="font-body-sm text-body-sm text-secondary font-medium">
                              Hạt Sen Tịnh Tâm • Trà Xanh Uji Matcha
                            </span>{' '}
                            <span className="font-label-sm text-label-sm text-outline mt-0.5">
                              Khối lượng: 200g • Hương bưởi diễn cổ truyền
                            </span>{' '}
                          </div>{' '}
                        </div>{' '}
                      </td>{' '}
                      <td className="py-space-md px-space-md">
                        {' '}
                        <div className="flex flex-col">
                          {' '}
                          <span className="font-body-md text-body-md font-bold text-primary">165.000 đ</span>{' '}
                          <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
                            Sỉ B2B: 125.000 đ
                          </span>{' '}
                        </div>{' '}
                      </td>{' '}
                      <td className="py-space-md px-space-md">
                        {' '}
                        <div className="flex flex-col">
                          {' '}
                          <span className="font-body-md text-body-md font-bold text-primary">500 chiếc</span>{' '}
                          <span className="font-label-sm text-label-sm text-tertiary-container">Đã Đóng Hộp</span>{' '}
                        </div>{' '}
                      </td>{' '}
                      <td className="py-space-md px-space-md">
                        {' '}
                        <div className="flex items-center gap-2">
                          {' '}
                          <span className="font-headline-sm text-[17px] font-bold text-primary">210</span>{' '}
                          <span className="w-2 h-2 rounded-[0.75rem] bg-tertiary-fixed-dim"></span>{' '}
                        </div>{' '}
                        <span className="font-label-sm text-label-sm text-outline">Date tươi: 7 ngày</span>{' '}
                      </td>{' '}
                      <td className="py-space-md px-space-md">
                        {' '}
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[0.75rem] bg-tertiary-fixed text-tertiary-container font-label-sm text-label-sm uppercase font-bold tracking-wide">
                          {' '}
                          <span className="w-1.5 h-1.5 rounded-[0.75rem] bg-tertiary-container"></span>
                          {' Sẵn Sàng Giao '}
                        </span>{' '}
                      </td>{' '}
                      <td className="py-space-md px-space-md text-right">
                        {' '}
                        <div className="flex items-center justify-end gap-1">
                          {' '}
                          <button
                            className="w-8 h-8 rounded-[0.125rem] bg-surface-container-low hover:bg-primary hover:text-champagne-light text-primary flex items-center justify-center transition-colors"
                            title="In nhãn nhiệt date hôm nay"
                          >
                            {' '}
                            <Icon name="print" className="text-[18px]" aria-hidden />{' '}
                          </button>{' '}
                          <button
                            className="w-8 h-8 rounded-[0.125rem] bg-surface-container-low hover:bg-primary hover:text-champagne-light text-primary flex items-center justify-center transition-colors"
                            title="Cập nhật số lượng kho"
                          >
                            {' '}
                            <Icon name="edit_note" className="text-[18px]" aria-hidden />{' '}
                          </button>{' '}
                          <button
                            className="w-8 h-8 rounded-[0.125rem] bg-surface-container-low hover:bg-secondary hover:text-on-secondary text-secondary flex items-center justify-center transition-colors"
                            title="Khóa đơn sỉ doanh nghiệp"
                          >
                            {' '}
                            <Icon name="lock" className="text-[18px]" aria-hidden />{' '}
                          </button>{' '}
                        </div>{' '}
                      </td>{' '}
                    </tr>{' '}
                    <tr className="hover:bg-surface-container-low/50 transition-colors group">
                      {' '}
                      <td className="py-space-md px-space-md">
                        {' '}
                        <div className="flex items-center gap-space-md">
                          {' '}
                          <img
                            className="w-14 h-14 object-cover rounded-[0.25rem] shadow-sm group-hover:scale-105 transition-transform duration-300"
                            data-alt="Cut view of luscious mung bean durian mooncake with golden buttery crust, rich natural yellow interior, surrounded by melon seeds and jasmine tea leaves, artistic high angle culinary photography."
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHrOLtwkQn9RQf99_uIr4ob9iam4o3e0-2gqEqqx5rmMK76fNLjz_NJQtXSOHhiDgPDb-bXCGeQa5ENdmoPcD9CuBKrZStM45C-foXE3IidxKzxOM71kCso9RqOS0LY8C8SglsU2nRjgPZmjYbm97At9Nq3bVhGVJtbBzWoZ9S9kV4tSv8QvHE-csLM1tN12s_eokK9alnVcfyb5BwtrW-qFKjVTp8D6YRqXHH89yw-j3pQEX3Ywdp"
                          />{' '}
                          <div className="flex flex-col min-w-0">
                            {' '}
                            <div className="flex items-center gap-1.5">
                              {' '}
                              <span className="font-headline-sm text-[16px] text-primary font-bold truncate">
                                Đậu Xanh Sầu Riêng Ri6
                              </span>{' '}
                              <span className="px-1.5 py-0.2 rounded-[0.125rem] bg-surface-variant text-on-surface-variant font-label-sm text-[9px] uppercase font-bold tracking-wider">
                                Hương Nam Bộ
                              </span>{' '}
                            </div>{' '}
                            <span className="font-body-sm text-body-sm text-secondary font-medium">
                              Sầu Riêng Tươi Tiền Giang • Hạt Dưa Rang Tay
                            </span>{' '}
                            <span className="font-label-sm text-label-sm text-outline mt-0.5">
                              Khối lượng: 210g • Da bóng mờ mỡ cừu
                            </span>{' '}
                          </div>{' '}
                        </div>{' '}
                      </td>{' '}
                      <td className="py-space-md px-space-md">
                        {' '}
                        <div className="flex flex-col">
                          {' '}
                          <span className="font-body-md text-body-md font-bold text-primary">175.000 đ</span>{' '}
                          <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
                            Sỉ B2B: 130.000 đ
                          </span>{' '}
                        </div>{' '}
                      </td>{' '}
                      <td className="py-space-md px-space-md">
                        {' '}
                        <div className="flex flex-col">
                          {' '}
                          <span className="font-body-md text-body-md font-bold text-primary">0 chiếc</span>{' '}
                          <span className="font-label-sm text-label-sm text-outline">Xếp Lò Mẻ Tối</span>{' '}
                        </div>{' '}
                      </td>{' '}
                      <td className="py-space-md px-space-md">
                        {' '}
                        <div className="flex items-center gap-2">
                          {' '}
                          <span className="font-headline-sm text-[17px] font-bold text-outline">98</span>{' '}
                          <span className="w-2 h-2 rounded-[0.75rem] bg-outline"></span>{' '}
                        </div>{' '}
                        <span className="font-label-sm text-label-sm text-outline">Tồn kho còn lại mẻ hôm qua</span>{' '}
                      </td>{' '}
                      <td className="py-space-md px-space-md">
                        {' '}
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[0.75rem] bg-surface-variant text-on-surface-variant font-label-sm text-label-sm uppercase font-bold tracking-wide">
                          {' '}
                          <span className="w-1.5 h-1.5 rounded-[0.75rem] bg-outline"></span>
                          {' Chờ Ca Đêm '}
                        </span>{' '}
                      </td>{' '}
                      <td className="py-space-md px-space-md text-right">
                        {' '}
                        <div className="flex items-center justify-end gap-1">
                          {' '}
                          <button
                            className="w-8 h-8 rounded-[0.125rem] bg-surface-container-low hover:bg-primary hover:text-champagne-light text-primary flex items-center justify-center transition-colors"
                            title="In nhãn nhiệt date hôm nay"
                          >
                            {' '}
                            <Icon name="print" className="text-[18px]" aria-hidden />{' '}
                          </button>{' '}
                          <button
                            className="w-8 h-8 rounded-[0.125rem] bg-surface-container-low hover:bg-primary hover:text-champagne-light text-primary flex items-center justify-center transition-colors"
                            title="Cập nhật số lượng kho"
                          >
                            {' '}
                            <Icon name="edit_note" className="text-[18px]" aria-hidden />{' '}
                          </button>{' '}
                          <button
                            className="w-8 h-8 rounded-[0.125rem] bg-surface-container-low hover:bg-secondary hover:text-on-secondary text-secondary flex items-center justify-center transition-colors"
                            title="Khóa đơn sỉ doanh nghiệp"
                          >
                            {' '}
                            <Icon name="lock" className="text-[18px]" aria-hidden />{' '}
                          </button>{' '}
                        </div>{' '}
                      </td>{' '}
                    </tr>{' '}
                  </tbody>{' '}
                </table>{' '}
              </div>{' '}
              <div className="mt-space-lg pt-space-md bg-surface-container-low/60 -mx-space-lg -mb-space-lg px-space-lg pb-space-lg rounded-b-[0.5rem] flex flex-col md:flex-row items-center justify-between gap-space-md">
                {' '}
                <div className="flex items-center gap-space-lg">
                  {' '}
                  <div className="flex flex-col">
                    {' '}
                    <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                      Tổng Tồn Khả Dụng Hiện Thực
                    </span>{' '}
                    <span className="font-headline-sm text-headline-sm text-primary">
                      1.150 Bánh Lẻ / 4.200 B2B Đặt Chỗ
                    </span>{' '}
                  </div>{' '}
                  <div className="hidden sm:block h-8 w-px bg-surface-variant"></div>{' '}
                  <div className="hidden sm:flex flex-col">
                    {' '}
                    <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                      Chu Kỳ Date Tươi Đóng Gói
                    </span>{' '}
                    <span className="font-body-sm text-body-sm font-semibold text-secondary">
                      Xuất xưởng trong vòng 3h sau khi ra lò
                    </span>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="flex items-center gap-space-sm w-full md:w-auto justify-end">
                  {' '}
                  <button className="px-space-md py-2.5 rounded-[0.25rem] bg-surface-container-lowest text-primary hover:bg-champagne-light font-label-md text-label-md uppercase tracking-wider font-bold flex items-center gap-1.5 shadow-sm transition-colors">
                    {' '}
                    <Icon name="print_connect" className="text-[18px]" aria-hidden />{' '}
                    <span>In Hàng Loạt Tem Date Tươi</span>{' '}
                  </button>{' '}
                  <button className="px-space-md py-2.5 rounded-[0.25rem] bg-primary text-secondary-fixed hover:bg-ink-dark font-label-md text-label-md uppercase tracking-wider font-bold flex items-center gap-1.5 shadow-sm transition-colors">
                    {' '}
                    <Icon name="sync" className="text-[18px] text-secondary-fixed" aria-hidden />{' '}
                    <span>Đồng Bộ Sàn Nguyệt Viên</span>{' '}
                  </button>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
      </div>
    </>
  )
}
