// Tự sinh từ bản thiết kế Stitch — giữ nguyên nội dung. Sửa logic ở trang bọc ngoài.
import { Icon } from '../../components/Icon'

export function ProfilePage() {
  return (
    <>
      <div className="flex flex-col w-full">
        {' '}
        <div className="relative w-full overflow-hidden">
          {' '}
          <div className="absolute -top-32 right-12 w-96 h-96 rounded-[0.75rem] bg-secondary-container/20 blur-3xl pointer-events-none"></div>{' '}
          <div className="absolute top-96 -left-20 w-[28rem] h-[28rem] rounded-[0.75rem] bg-primary-container/5 blur-3xl pointer-events-none"></div>{' '}
          <div className="max-w-[1320px] mx-auto px-space-lg py-space-xl">
            {' '}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg mb-space-xl">
              {' '}
              <div className="max-w-3xl">
                {' '}
                <div className="flex items-center gap-space-sm mb-space-sm">
                  {' '}
                  <span className="inline-flex items-center gap-1.5 px-space-md py-1 rounded-[0.75rem] bg-primary-container text-secondary-fixed text-label-sm font-label-sm uppercase tracking-widest shadow-sm">
                    {' '}
                    <span className="w-1.5 h-1.5 rounded-[0.75rem] bg-secondary-fixed animate-ping"></span>
                    {' Kỳ Thẩm Định Thu Viên 2025 '}
                  </span>{' '}
                  <span className="text-secondary font-label-sm text-label-sm uppercase tracking-wider">
                    Hội Đồng Giám Tuyển Nguyệt Viên Đài
                  </span>{' '}
                </div>{' '}
                <h1 className="font-headline-xl text-headline-xl text-ink-dark tracking-tight leading-tight">
                  {' Hồ Sơ Đăng Ký Gian Hàng Nghệ Nhân & Thẩm Định Di Sản '}
                </h1>{' '}
                <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-sm leading-relaxed">
                  {
                    ' Quy trình thẩm định chất lượng 4 bước từ Hội Đồng Sàn Nguyệt Viên Đài dành cho các nghệ nhân làm bánh truyền thống trên 20 năm kinh nghiệm, gìn giữ tinh túy mỹ vị mùa trăng. '
                  }
                </p>{' '}
              </div>{' '}
              <div className="shrink-0 p-space-md rounded-[0.5rem] bg-surface-container-lowest shadow-md flex items-center gap-space-md">
                {' '}
                <div className="w-14 h-14 rounded-[0.25rem] bg-primary-container flex items-center justify-center text-secondary-fixed shadow-sm">
                  {' '}
                  <Icon name="verified" className="text-[32px]" aria-hidden />{' '}
                </div>{' '}
                <div className="flex flex-col">
                  {' '}
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">
                    Tiêu Chí Khắt Khe
                  </span>{' '}
                  <span className="font-headline-sm text-headline-sm text-ink-dark font-medium">
                    Top 5% Xưởng Di Sản
                  </span>{' '}
                  <span className="font-body-sm text-body-sm text-outline">Kiểm định độc lập & giám định tại lò</span>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
            <div className="mb-space-xl bg-surface-container-lowest p-space-lg rounded-[0.5rem] shadow-sm">
              {' '}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md relative">
                {' '}
                <div className="flex flex-col gap-2 relative z-10">
                  {' '}
                  <div className="flex items-center gap-3">
                    {' '}
                    <div className="w-9 h-9 rounded-[0.25rem] bg-primary-container text-secondary-fixed flex items-center justify-center font-label-md text-label-md font-bold shadow-md">
                      {' 01 '}
                    </div>{' '}
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                      Bước Hiện Tại
                    </span>{' '}
                  </div>{' '}
                  <div className="h-1.5 w-full bg-secondary-fixed rounded-[0.75rem] overflow-hidden mt-1">
                    {' '}
                    <div className="h-full bg-gold-burnished w-3/4 animate-pulse"></div>{' '}
                  </div>{' '}
                  <div>
                    {' '}
                    <p className="font-body-md text-body-md font-bold text-ink-dark">
                      Thông Tin Nghệ Nhân & Di Sản
                    </p>{' '}
                    <p className="font-body-sm text-body-sm text-secondary">Đang hoàn thiện trực tuyến</p>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="flex flex-col gap-2 relative z-10 opacity-70">
                  {' '}
                  <div className="flex items-center gap-3">
                    {' '}
                    <div className="w-9 h-9 rounded-[0.25rem] bg-surface-container text-on-surface-variant flex items-center justify-center font-label-md text-label-md font-semibold">
                      {' 02 '}
                    </div>{' '}
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                      Bước Kế Tiếp
                    </span>{' '}
                  </div>{' '}
                  <div className="h-1.5 w-full bg-surface-container-highest rounded-[0.75rem] mt-1"></div>{' '}
                  <div>
                    {' '}
                    <p className="font-body-md text-body-md font-semibold text-on-surface">
                      Chứng Nhận ATTP & ISO 22000
                    </p>{' '}
                    <p className="font-body-sm text-body-sm text-outline">Hồ sơ pháp lý dấu đỏ</p>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="flex flex-col gap-2 relative z-10 opacity-70">
                  {' '}
                  <div className="flex items-center gap-3">
                    {' '}
                    <div className="w-9 h-9 rounded-[0.25rem] bg-surface-container text-on-surface-variant flex items-center justify-center font-label-md text-label-md font-semibold">
                      {' 03 '}
                    </div>{' '}
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                      Khảo Sát Thực Tế
                    </span>{' '}
                  </div>{' '}
                  <div className="h-1.5 w-full bg-surface-container-highest rounded-[0.75rem] mt-1"></div>{' '}
                  <div>
                    {' '}
                    <p className="font-body-md text-body-md font-semibold text-on-surface">
                      Năng Lực Lò Nướng & Mùa Vụ
                    </p>{' '}
                    <p className="font-body-sm text-body-sm text-outline">Công suất cung ứng đỉnh điểm</p>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="flex flex-col gap-2 relative z-10 opacity-70">
                  {' '}
                  <div className="flex items-center gap-3">
                    {' '}
                    <div className="w-9 h-9 rounded-[0.25rem] bg-surface-container text-on-surface-variant flex items-center justify-center font-label-md text-label-md font-semibold">
                      {' 04 '}
                    </div>{' '}
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                      Phê Duyệt Cuối
                    </span>{' '}
                  </div>{' '}
                  <div className="h-1.5 w-full bg-surface-container-highest rounded-[0.75rem] mt-1"></div>{' '}
                  <div>
                    {' '}
                    <p className="font-body-md text-body-md font-semibold text-on-surface">
                      Hội Đồng Thử Nếm Hương Vị
                    </p>{' '}
                    <p className="font-body-sm text-body-sm text-outline">Chấm điểm cảm quan & cấp bảo chứng</p>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
            <div className="grid grid-cols-12 gap-space-lg">
              {' '}
              <div className="col-span-12 lg:col-span-8 flex flex-col gap-space-lg">
                {' '}
                <section className="bg-surface-container-lowest p-space-xl rounded-[0.5rem] shadow-md">
                  {' '}
                  <div className="flex items-center justify-between pb-space-md mb-space-lg border-b border-gold-subtle/30">
                    {' '}
                    <div className="flex items-center gap-space-sm">
                      {' '}
                      <span className="w-8 h-8 rounded-[0.125rem] bg-secondary-fixed/50 text-secondary flex items-center justify-center font-bold text-label-lg font-label-lg">
                        I
                      </span>{' '}
                      <div>
                        {' '}
                        <h2 className="font-headline-sm text-headline-sm text-ink-dark">
                          Thông Tin Pháp Lý & Di Sản
                        </h2>{' '}
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Xác lập tư cách pháp nhân và cội nguồn gia truyền
                        </p>{' '}
                      </div>{' '}
                    </div>{' '}
                    <span className="font-label-sm text-label-sm text-secondary-fixed-variant bg-surface-container-high px-space-sm py-1 rounded-[0.125rem]">
                      Bắt buộc
                    </span>{' '}
                  </div>{' '}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                    {' '}
                    <div className="col-span-2">
                      {' '}
                      <label className="block font-label-md text-label-md uppercase text-on-surface mb-1.5 tracking-wider">
                        {' Tên Thương Hiệu Nghệ Nhân '}
                        <span className="text-error">*</span>{' '}
                      </label>{' '}
                      <div className="relative">
                        {' '}
                        <Icon
                          name="store"
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]"
                          aria-hidden
                        />{' '}
                        <input
                          className="w-full bg-surface-container-low text-ink-dark font-body-md text-body-md pl-11 pr-4 py-3 rounded-[0.25rem] focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-secondary-fixed transition-all shadow-inner"
                          placeholder="VD: Lò Bánh Cổ Truyền Đông Phương, Bảo Phương, Như Lan..."
                          type="text"
                          defaultValue="Lò Bánh Cổ Truyền Đông Phương - Cầu Đất"
                        />{' '}
                      </div>{' '}
                    </div>{' '}
                    <div>
                      {' '}
                      <label className="block font-label-md text-label-md uppercase text-on-surface mb-1.5 tracking-wider">
                        {' Gia Truyền Từ Năm '}
                        <span className="text-error">*</span>{' '}
                      </label>{' '}
                      <div className="relative">
                        {' '}
                        <Icon
                          name="history_edu"
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]"
                          aria-hidden
                        />{' '}
                        <input
                          className="w-full bg-surface-container-low text-ink-dark font-body-md text-body-md pl-11 pr-4 py-3 rounded-[0.25rem] focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-secondary-fixed transition-all shadow-inner"
                          placeholder="VD: 1950"
                          type="number"
                          defaultValue="1950"
                        />{' '}
                      </div>{' '}
                    </div>{' '}
                    <div>
                      {' '}
                      <label className="block font-label-md text-label-md uppercase text-on-surface mb-1.5 tracking-wider">
                        {' Hình Thức Đăng Ký Kinh Doanh '}
                        <span className="text-error">*</span>{' '}
                      </label>{' '}
                      <div className="relative">
                        {' '}
                        <Icon
                          name="assignment"
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]"
                          aria-hidden
                        />{' '}
                        <select className="w-full bg-surface-container-low text-ink-dark font-body-md text-body-md pl-11 pr-4 py-3 rounded-[0.25rem] focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-secondary-fixed transition-all shadow-inner appearance-none cursor-pointer">
                          {' '}
                          <option>Hộ Kinh Doanh Cá Thể Gia Truyền</option>{' '}
                          <option>Công Ty TNHH Sản Xuất Thực Phẩm</option>{' '}
                          <option>Hợp Tác Xã Làng Nghề Bánh Cổ Truyền</option>{' '}
                        </select>{' '}
                        <Icon
                          name="arrow_drop_down"
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none"
                          aria-hidden
                        />{' '}
                      </div>{' '}
                    </div>{' '}
                    <div className="col-span-2">
                      {' '}
                      <label className="block font-label-md text-label-md uppercase text-on-surface mb-1.5 tracking-wider">
                        {' Địa Chỉ Xưởng Sản Xuất Gốc & Trụ Sở Lò '}
                        <span className="text-error">*</span>{' '}
                      </label>{' '}
                      <div className="relative">
                        {' '}
                        <Icon
                          name="location_on"
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]"
                          aria-hidden
                        />{' '}
                        <input
                          className="w-full bg-surface-container-low text-ink-dark font-body-md text-body-md pl-11 pr-4 py-3 rounded-[0.25rem] focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-secondary-fixed transition-all shadow-inner"
                          placeholder="Số nhà, phố cổ, làng nghề, thành phố..."
                          type="text"
                          defaultValue="172 Cầu Đất, Quận Ngô Quyền, Hải Phòng"
                        />{' '}
                      </div>{' '}
                    </div>{' '}
                    <div className="col-span-2">
                      {' '}
                      <div className="flex items-center justify-between mb-1.5">
                        {' '}
                        <label className="font-label-md text-label-md uppercase text-on-surface tracking-wider">
                          {' Câu Chuyện Thương Hiệu & Bí Quyết Truyền Đời '}
                        </label>{' '}
                        <span className="font-label-sm text-label-sm text-outline">
                          Văn phong di sản (Tối đa 1000 từ)
                        </span>{' '}
                      </div>{' '}
                      <textarea
                        className="w-full bg-surface-container-low text-ink-dark font-body-md text-body-md p-4 rounded-[0.25rem] focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-secondary-fixed transition-all shadow-inner"
                        placeholder="Mô tả cội nguồn khởi nghiệp, phương thức làm nhân mộc, cách sao trứng muối hoặc nghệ thuật lên men vỏ bánh cổ truyền..."
                        rows={4}
                        defaultValue="Trải qua hơn bảy thập kỷ giữ lửa tại phố Cầu Đất, tiệm bánh vẫn bảo lưu phương thức xào nhân sen nhuyễn cùng mỡ khẩu ướp đường cát trắng 14 ngày đêm. Lớp bột dẻo thơm hương hoa bưởi tinh khiết được cất nước thủ công theo từng mùa hoa tháng Ba..."
                      />{' '}
                    </div>{' '}
                  </div>{' '}
                </section>{' '}
                <section className="bg-surface-container-lowest p-space-xl rounded-[0.5rem] shadow-md">
                  {' '}
                  <div className="flex items-center justify-between pb-space-md mb-space-lg border-b border-gold-subtle/30">
                    {' '}
                    <div className="flex items-center gap-space-sm">
                      {' '}
                      <span className="w-8 h-8 rounded-[0.125rem] bg-secondary-fixed/50 text-secondary flex items-center justify-center font-bold text-label-lg font-label-lg">
                        II
                      </span>{' '}
                      <div>
                        {' '}
                        <h2 className="font-headline-sm text-headline-sm text-ink-dark">
                          Hồ Sơ Kiểm Định & An Toàn Thực Phẩm (ATTP)
                        </h2>{' '}
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Đảm bảo chỉ số vi sinh nghiêm ngặt và đạt chuẩn phân phối chuỗi lạnh
                        </p>{' '}
                      </div>{' '}
                    </div>{' '}
                    <span className="font-label-sm text-label-sm text-secondary-fixed-variant bg-surface-container-high px-space-sm py-1 rounded-[0.125rem]">
                      Thẩm tra kép
                    </span>{' '}
                  </div>{' '}
                  <div className="flex flex-col gap-space-md">
                    {' '}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                      {' '}
                      <div>
                        {' '}
                        <label className="block font-label-md text-label-md uppercase text-on-surface mb-1.5 tracking-wider">
                          {' Số Giấy Chứng Nhận Cơ Sở Đủ Điều Kiện ATTP '}
                          <span className="text-error">*</span>{' '}
                        </label>{' '}
                        <input
                          className="w-full bg-surface-container-low text-ink-dark font-body-md text-body-md px-4 py-3 rounded-[0.25rem] focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-secondary-fixed transition-all shadow-inner"
                          type="text"
                          defaultValue="384/2023/ATTP-HP"
                        />{' '}
                      </div>{' '}
                      <div>
                        {' '}
                        <label className="block font-label-md text-label-md uppercase text-on-surface mb-1.5 tracking-wider">
                          {' Cơ Quan Thẩm Định Cấp Phép '}
                        </label>{' '}
                        <input
                          className="w-full bg-surface-container-low text-ink-dark font-body-md text-body-md px-4 py-3 rounded-[0.25rem] focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-secondary-fixed transition-all shadow-inner"
                          type="text"
                          defaultValue="Chi cục An toàn vệ sinh thực phẩm Hải Phòng"
                        />{' '}
                      </div>{' '}
                    </div>{' '}
                    <div>
                      {' '}
                      <label className="block font-label-md text-label-md uppercase text-on-surface mb-1.5 tracking-wider">
                        {' Bản Scan Đính Kèm (PDF Dấu Đỏ & Báo Cáo Vi Sinh Viện ATVSTP Quốc Gia) '}
                        <span className="text-error">*</span>{' '}
                      </label>{' '}
                      <div className="p-space-lg rounded-[0.5rem] bg-surface-container-low text-center flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container transition-all">
                        {' '}
                        <div className="w-12 h-12 rounded-[0.75rem] bg-surface-container-lowest flex items-center justify-center text-secondary shadow-sm mb-2">
                          {' '}
                          <Icon name="cloud_upload" className="text-[26px]" aria-hidden />{' '}
                        </div>{' '}
                        <p className="font-body-md text-body-md text-ink-dark font-semibold">
                          Kéo và thả tệp PDF chứng nhận dấu đỏ vào đây
                        </p>{' '}
                        <p className="font-body-sm text-body-sm text-outline mt-1">
                          Hỗ trợ PDF, PNG định dạng scan cao cấp dưới 25MB
                        </p>{' '}
                        <div className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-[0.75rem] bg-surface-container-highest text-secondary text-label-sm font-label-sm">
                          {' '}
                          <Icon name="picture_as_pdf" className="text-[16px]" aria-hidden />{' '}
                          <span>Chung-nhan-ATTP-DongPhuong-2024.pdf (4.8 MB) - Đã ký số</span>{' '}
                        </div>{' '}
                      </div>{' '}
                    </div>{' '}
                    <div className="p-space-md rounded-[0.25rem] bg-surface-container flex items-start gap-space-sm mt-space-xs">
                      {' '}
                      <input
                        defaultChecked
                        className="mt-1 w-4 h-4 text-primary accent-gold-burnished rounded-[0.125rem] cursor-pointer"
                        id="pledge"
                        type="checkbox"
                      />{' '}
                      <label className="font-body-sm text-body-sm text-ink-dark cursor-pointer" htmlFor="pledge">
                        {' '}
                        <strong className="font-semibold text-secondary">Cam kết vàng của Đài Nghệ Nhân:</strong>
                        {
                          ' Cơ sở tuyệt đối không sử dụng chất bảo quản công nghiệp hoặc phẩm màu độc hại trong bất kỳ công đoạn sên nhân, ủ bột hay nướng bánh truyền thống nào. '
                        }
                      </label>{' '}
                    </div>{' '}
                  </div>{' '}
                </section>{' '}
                <section className="bg-surface-container-lowest p-space-xl rounded-[0.5rem] shadow-md">
                  {' '}
                  <div className="flex items-center justify-between pb-space-md mb-space-lg border-b border-gold-subtle/30">
                    {' '}
                    <div className="flex items-center gap-space-sm">
                      {' '}
                      <span className="w-8 h-8 rounded-[0.125rem] bg-secondary-fixed/50 text-secondary flex items-center justify-center font-bold text-label-lg font-label-lg">
                        III
                      </span>{' '}
                      <div>
                        {' '}
                        <h2 className="font-headline-sm text-headline-sm text-ink-dark">
                          Đăng Ký Dải Sản Phẩm & Năng Lực Lò
                        </h2>{' '}
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Ước tính sản lượng đáp ứng mùa cao điểm và bộ sưu tập độc quyền
                        </p>{' '}
                      </div>{' '}
                    </div>{' '}
                    <span className="font-label-sm text-label-sm text-secondary-fixed-variant bg-surface-container-high px-space-sm py-1 rounded-[0.125rem]">
                      Khảo sát lò
                    </span>{' '}
                  </div>{' '}
                  <div className="flex flex-col gap-space-md">
                    {' '}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                      {' '}
                      <div>
                        {' '}
                        <label className="block font-label-md text-label-md uppercase text-on-surface mb-1.5 tracking-wider">
                          {' Công Suất Nướng Tối Đa Trong Ngày Rằm '}
                          <span className="text-error">*</span>{' '}
                        </label>{' '}
                        <div className="relative">
                          {' '}
                          <input
                            className="w-full bg-surface-container-low text-ink-dark font-body-md text-body-md pl-4 pr-24 py-3 rounded-[0.25rem] focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-secondary-fixed transition-all shadow-inner"
                            type="number"
                            defaultValue="2500"
                          />{' '}
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-label-sm text-label-sm uppercase text-outline">
                            Hộp / Ngày
                          </span>{' '}
                        </div>{' '}
                      </div>{' '}
                      <div>
                        {' '}
                        <label className="block font-label-md text-label-md uppercase text-on-surface mb-1.5 tracking-wider">
                          {' Số Lượng Thợ Nghệ Nhân Bậc Cao Tại Xưởng '}
                        </label>{' '}
                        <input
                          className="w-full bg-surface-container-low text-ink-dark font-body-md text-body-md px-4 py-3 rounded-[0.25rem] focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-secondary-fixed transition-all shadow-inner"
                          type="number"
                          defaultValue="18"
                        />{' '}
                      </div>{' '}
                    </div>{' '}
                    <div>
                      {' '}
                      <label className="block font-label-md text-label-md uppercase text-on-surface mb-2 tracking-wider">
                        {' Dòng Bánh Chủ Đạo Đăng Ký Mở Bán Trực Tiếp '}
                      </label>{' '}
                      <div className="flex flex-wrap gap-2.5">
                        {' '}
                        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[0.25rem] bg-primary text-secondary-fixed font-label-sm text-label-sm tracking-wide shadow-sm">
                          {' '}
                          <Icon name="check_circle" className="text-[16px]" aria-hidden />{' '}
                          <span>Thập Cẩm Bát Bửu Thượng Hạng</span>{' '}
                        </div>{' '}
                        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[0.25rem] bg-primary text-secondary-fixed font-label-sm text-label-sm tracking-wide shadow-sm">
                          {' '}
                          <Icon name="check_circle" className="text-[16px]" aria-hidden />{' '}
                          <span>Lava Trứng Muối Hoàng Kim</span>{' '}
                        </div>{' '}
                        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[0.25rem] bg-primary text-secondary-fixed font-label-sm text-label-sm tracking-wide shadow-sm">
                          {' '}
                          <Icon name="check_circle" className="text-[16px]" aria-hidden />{' '}
                          <span>Bánh Dẻo Hương Hoa Bưởi Cổ Truyền</span>{' '}
                        </div>{' '}
                        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[0.25rem] bg-surface-container-low text-on-surface-variant hover:bg-surface-container font-label-sm text-label-sm tracking-wide cursor-pointer">
                          {' '}
                          <Icon name="add" className="text-[16px]" aria-hidden /> <span>Yến Sào Bạch Cúc</span>{' '}
                        </div>{' '}
                        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[0.25rem] bg-surface-container-low text-on-surface-variant hover:bg-surface-container font-label-sm text-label-sm tracking-wide cursor-pointer">
                          {' '}
                          <Icon name="add" className="text-[16px]" aria-hidden />{' '}
                          <span>Hạt Sen Long Nhãn Hưng Yên</span>{' '}
                        </div>{' '}
                      </div>{' '}
                    </div>{' '}
                    <div>
                      {' '}
                      <div className="flex items-center justify-between mb-2">
                        {' '}
                        <label className="font-label-md text-label-md uppercase text-on-surface tracking-wider">
                          {' Ảnh Thực Tế Xưởng Nướng & Khu Vực Đóng Gói Vô Trùng '}
                        </label>{' '}
                        <span className="font-label-sm text-label-sm text-secondary font-semibold">
                          Đã tải 2 / 4 ảnh chuẩn mực
                        </span>{' '}
                      </div>{' '}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                        {' '}
                        <div className="group relative rounded-[0.25rem] overflow-hidden h-32 bg-surface-container shadow-sm">
                          {' '}
                          <img
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            data-alt="Warm artisanal mooncake workshop showing vintage brass baking trays, clean white porcelain surfaces, traditional wooden molds, warm ambient dawn sunlight in an authentic Vietnamese heritage confectionery."
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfyweh0DJBoc9-MS6v5tzsdz_GGTrh74IezT60AJp35l_db63EcpP8eA0ZpS8mFTNWODROEbcYSk1x5koskRdEyGTK-UFpBArKDzAglmxpieV-_Ig5MOVn0n-S_CVU7yXe2W3mTesTI1vFx7uccGwTuzHjBpJUTEG5HDJtVIH4FtAHzTTt0LlPtb0R3ulg0H3qkIWstlmwma64diUxBgGyi9l4eParr6pqhEC2TTnpG5zq7SEScggO"
                          />{' '}
                          <div className="absolute inset-0 bg-ink-dark/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {' '}
                            <Icon name="visibility" className="text-champagne-light" aria-hidden />{' '}
                          </div>{' '}
                          <span className="absolute bottom-1.5 left-2 px-2 py-0.5 rounded-[0.125rem] bg-ink-dark/80 text-champagne-light text-label-sm font-label-sm">
                            Khu Lò Nướng
                          </span>{' '}
                        </div>{' '}
                        <div className="group relative rounded-[0.25rem] overflow-hidden h-32 bg-surface-container shadow-sm">
                          {' '}
                          <img
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            data-alt="Sterile modern pastry packaging room with stainless steel worktables, master bakers in crisp linen coats wearing hygienic masks inspecting golden mooncakes fresh from cooling."
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAt060w-GNFLsrc4QchKZRAKIx622cAhor54DIik9aFdsQnkynjZD_iXY28kPCsZ6w3Q1UnIQpwyXd1DKURv36hkQVfkI7AAai4pieuo1DAEBu0S4c0BRQt-7yLkW4xGuo9cQNMaVN-e5M5NfuYZ96XLybjXiaVLV9KMYT5DBhSYx3GwEEOn9uXbF0kjVtsULJYjYboXm-4wkVUraAuQKr0jqwVDMMOgr9Wpqw-NLZ6v3FQ-q3SYS0M"
                          />{' '}
                          <div className="absolute inset-0 bg-ink-dark/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {' '}
                            <Icon name="visibility" className="text-champagne-light" aria-hidden />{' '}
                          </div>{' '}
                          <span className="absolute bottom-1.5 left-2 px-2 py-0.5 rounded-[0.125rem] bg-ink-dark/80 text-champagne-light text-label-sm font-label-sm">
                            Phòng Vô Trùng
                          </span>{' '}
                        </div>{' '}
                        <div className="rounded-[0.25rem] bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col items-center justify-center p-4 cursor-pointer text-center h-32">
                          {' '}
                          <Icon name="add_a_photo" className="text-secondary text-[24px]" aria-hidden />{' '}
                          <span className="font-label-sm text-label-sm text-on-surface uppercase mt-1 font-semibold">
                            Thêm Góc Chụp
                          </span>{' '}
                          <span className="font-body-sm text-body-sm text-outline text-[11px]">
                            Kho nguyên liệu mộc
                          </span>{' '}
                        </div>{' '}
                      </div>{' '}
                    </div>{' '}
                  </div>{' '}
                </section>{' '}
                <div className="bg-primary-container p-space-lg rounded-[0.5rem] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-space-md">
                  {' '}
                  <div className="flex items-center gap-space-sm text-champagne-light">
                    {' '}
                    <Icon name="hourglass_top" className="text-secondary-fixed text-[28px]" aria-hidden />{' '}
                    <div>
                      {' '}
                      <p className="font-body-md text-body-md font-medium text-champagne-light">
                        Thời gian thẩm định thực địa dự kiến
                      </p>{' '}
                      <p className="font-body-sm text-body-sm text-secondary-fixed-dim">
                        Trong vòng 48 giờ làm việc sau khi nộp đủ tệp kiểm định
                      </p>{' '}
                    </div>{' '}
                  </div>{' '}
                  <button className="w-full sm:w-auto px-space-lg py-3.5 rounded-[0.25rem] bg-gold-burnished hover:bg-secondary text-ink-dark hover:text-champagne-light font-label-lg text-label-lg uppercase tracking-wider font-bold transition-all shadow-lg hover:shadow-secondary-container/40 flex items-center justify-center gap-2 whitespace-nowrap">
                    {' '}
                    <span>Nộp Hồ Sơ & Đặt Lịch Thẩm Định Tại Lò</span>{' '}
                    <Icon name="arrow_forward" className="text-[18px]" aria-hidden />{' '}
                  </button>{' '}
                </div>{' '}
              </div>{' '}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-space-lg">
                {' '}
                <div className="bg-gradient-to-b from-primary to-primary-container text-on-primary p-space-lg rounded-[0.5rem] shadow-xl relative overflow-hidden">
                  {' '}
                  <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-[0.75rem] bg-secondary-fixed/10 blur-2xl pointer-events-none"></div>{' '}
                  <div className="flex items-center gap-2 text-secondary-fixed mb-space-sm">
                    {' '}
                    <Icon name="stars" className="text-[20px]" aria-hidden />{' '}
                    <span className="font-label-sm text-label-sm uppercase tracking-widest">Đặc Quyền Hội Viên</span>{' '}
                  </div>{' '}
                  <h3 className="font-headline-sm text-headline-sm text-champagne-light mb-space-xs">
                    {' Quyền Lợi Khi Gia Nhập Nguyệt Viên Đài '}
                  </h3>{' '}
                  <p className="font-body-sm text-body-sm text-inverse-on-surface/80 mb-space-md">
                    {' Hệ sinh thái chuẩn hóa giá trị dành riêng cho tinh hoa nghệ nhân Việt. '}
                  </p>{' '}
                  <div className="flex flex-col gap-space-md">
                    {' '}
                    <div className="p-space-sm rounded-[0.25rem] bg-ink-dark/50 flex items-start gap-space-sm">
                      {' '}
                      <div className="w-8 h-8 rounded-[0.125rem] bg-primary flex items-center justify-center text-secondary-fixed shrink-0">
                        {' '}
                        <Icon name="ac_unit" className="text-[18px]" aria-hidden />{' '}
                      </div>{' '}
                      <div>
                        {' '}
                        <h4 className="font-body-md text-body-md font-semibold text-champagne-light">
                          Hạ Tầng Chuỗi Lạnh 100%
                        </h4>{' '}
                        <p className="font-body-sm text-body-sm text-inverse-on-surface/70 mt-0.5">
                          {
                            ' Giao nhận nhiệt độ ổn định 18°C khắp toàn quốc. Tuyệt đối không ẩm mốc, giữ trọn độ giòn và ngậy của bánh mộc. '
                          }
                        </p>{' '}
                      </div>{' '}
                    </div>{' '}
                    <div className="p-space-sm rounded-[0.25rem] bg-ink-dark/50 flex items-start gap-space-sm">
                      {' '}
                      <div className="w-8 h-8 rounded-[0.125rem] bg-primary flex items-center justify-center text-secondary-fixed shrink-0">
                        {' '}
                        <Icon name="domain" className="text-[18px]" aria-hidden />{' '}
                      </div>{' '}
                      <div>
                        {' '}
                        <h4 className="font-body-md text-body-md font-semibold text-champagne-light">
                          500+ Tập Đoàn B2B Ngân Sách Lớn
                        </h4>{' '}
                        <p className="font-body-sm text-body-sm text-inverse-on-surface/70 mt-0.5">
                          {
                            ' Được ưu tiên tham gia các gói đấu thầu quà tặng trung thu doanh nghiệp triệu đô với cam kết thanh toán bảo chứng. '
                          }
                        </p>{' '}
                      </div>{' '}
                    </div>{' '}
                    <div className="p-space-sm rounded-[0.25rem] bg-ink-dark/50 flex items-start gap-space-sm">
                      {' '}
                      <div className="w-8 h-8 rounded-[0.125rem] bg-primary flex items-center justify-center text-secondary-fixed shrink-0">
                        {' '}
                        <Icon name="palette" className="text-[18px]" aria-hidden />{' '}
                      </div>{' '}
                      <div>
                        {' '}
                        <h4 className="font-body-md text-body-md font-semibold text-champagne-light">
                          Thiết Kế Bao Bì Sơn Mài
                        </h4>{' '}
                        <p className="font-body-sm text-body-sm text-inverse-on-surface/70 mt-0.5">
                          {
                            ' Hỗ trợ dập nổi nhũ vàng gia huy, hộp sơn mài mỹ nghệ phiên bản giới hạn không tính phí tạo mẫu. '
                          }
                        </p>{' '}
                      </div>{' '}
                    </div>{' '}
                  </div>{' '}
                  <div className="mt-space-lg pt-space-md border-t border-gold-subtle/20 flex items-center justify-between text-secondary-fixed-dim">
                    {' '}
                    <span className="font-body-sm text-body-sm">Đường dây nóng Hội đồng Thẩm định:</span>{' '}
                    <span className="font-label-md text-label-md font-bold text-champagne-light">1800 6889</span>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="bg-surface-container-lowest p-space-lg rounded-[0.5rem] shadow-md">
                  {' '}
                  <h4 className="font-headline-sm text-headline-sm text-ink-dark mb-1">
                    Quy Trình Kiểm Tra Thực Địa
                  </h4>{' '}
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                    Ban thanh tra độc lập bao gồm:
                  </p>{' '}
                  <ul className="flex flex-col gap-2.5">
                    {' '}
                    <li className="flex items-center gap-2.5 font-body-sm text-body-sm text-on-surface">
                      {' '}
                      <Icon name="license" className="text-secondary text-[18px]" aria-hidden />{' '}
                      <span>Chuyên gia Vệ sinh An toàn Thực phẩm Bộ Y Tế</span>{' '}
                    </li>{' '}
                    <li className="flex items-center gap-2.5 font-body-sm text-body-sm text-on-surface">
                      {' '}
                      <Icon name="cooking" className="text-secondary text-[18px]" aria-hidden />{' '}
                      <span>Nghệ nhân Ẩm thực Cung đình Huế</span>{' '}
                    </li>{' '}
                    <li className="flex items-center gap-2.5 font-body-sm text-body-sm text-on-surface">
                      {' '}
                      <Icon name="thermostat" className="text-secondary text-[18px]" aria-hidden />{' '}
                      <span>Kỹ sư Quản lý Chuỗi Lạnh Logistics B2B</span>{' '}
                    </li>{' '}
                  </ul>{' '}
                  <div className="mt-space-md p-space-sm rounded-[0.25rem] bg-surface-container-high text-on-surface-variant font-body-sm text-body-sm">
                    {' '}
                    <p className="italic text-[11px] leading-relaxed">
                      {
                        ' "Mỗi mẻ bánh được gắn chip NFC truy xuất nguồn gốc mẻ ra lò, nhiệt độ đóng gói và niên hạn của nghệ nhân trực tiếp sên nhân." '
                      }
                    </p>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="relative rounded-[0.5rem] overflow-hidden shadow-md group h-56">
                  {' '}
                  <img
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    data-alt="Macro close-up of hands of an elderly master pastry baker carefully dusting flour over an intricately carved wooden dragon mooncake mold, golden amber side lighting, fine confectionery dust suspended in the air."
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXl-YbypCvxkafu4aRYUhic-Px-Dmg7J4SAhYA7dyEvTlOmIMRLutq6Ouaa9L-SyOCCIUCjmEUAwb5-_CRVVJFaxgnMcoV1INz5hf9a-LVU7Ln0DUkCKiXAuCR_qsEMoXM_BF-tF8-tqYaBCBJYky8mp4RsfXPSwa57vfcTDwW7nsUGOFMAfMjYq9iuJKMiJ_rvWyP-W1W_ZEllwnR-6xaMkHg2Fdy5hGLbYJVo7F7MtoDQqEF5QT8"
                  />{' '}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-dark via-ink-dark/40 to-transparent flex flex-col justify-end p-space-md text-champagne-light">
                    {' '}
                    <span className="font-label-sm text-label-sm text-secondary-fixed uppercase tracking-widest">
                      Bảo Chứng Tinh Hoa
                    </span>{' '}
                    <p className="font-headline-sm text-[16px] text-champagne-light leading-snug mt-0.5">
                      Nâng Tầm Bánh Truyền Thống Thành Tác Phẩm Nghệ Thuật
                    </p>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
      </div>
    </>
  )
}
