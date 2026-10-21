// Tự sinh từ bản thiết kế Stitch — giữ nguyên nội dung. Sửa logic ở trang bọc ngoài.
import { Icon } from '../../components/Icon'

export function B2bCheckoutPage() {
  return (
    <>
      <div className="flex flex-col w-full">
        {' '}
        <div className="w-full bg-cream-base py-space-lg">
          {' '}
          <div className="max-w-[1320px] mx-auto px-margin-mobile lg:px-margin">
            {' '}
            <div className="flex flex-wrap items-center justify-between gap-space-md mb-space-lg">
              {' '}
              <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
                {' '}
                <a className="hover:text-primary transition-colors" data-path="trang-chu" href="#">
                  Trang Chủ
                </a>{' '}
                <Icon name="chevron_right" className="text-[14px]" aria-hidden />{' '}
                <span className="text-secondary font-bold">Giỏ Hàng & Đặt Hàng B2B Ngoại Giao</span>{' '}
              </div>{' '}
              <div className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-[0.75rem] bg-surface-container-low shadow-sm">
                {' '}
                <span className="w-2 h-2 rounded-[0.75rem] bg-gold-burnished animate-pulse"></span>{' '}
                <span className="font-label-sm text-label-sm text-secondary tracking-widest uppercase">
                  Hồ Sơ Doanh Nghiệp VIP • Hạng Hoàng Kim (-25%)
                </span>{' '}
              </div>{' '}
            </div>{' '}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md pb-space-lg">
              {' '}
              <div>
                {' '}
                <span className="font-label-sm text-label-sm text-gold-burnished tracking-widest uppercase block mb-1">
                  Cổng Thanh Toán & Phân Phối Đa Tuyến
                </span>{' '}
                <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                  Thủ Tục Đặt Tiệc & Ký Hợp Đồng Doanh Nghiệp
                </h1>{' '}
              </div>{' '}
              <div className="flex items-center gap-space-md text-on-surface-variant font-body-sm text-body-sm">
                {' '}
                <div className="flex items-center gap-space-xs">
                  {' '}
                  <Icon name="verified_user" className="text-secondary-fixed-dim text-[18px]" aria-hidden />{' '}
                  <span>Bảo lãnh chất lượng Hoàng Triều</span>{' '}
                </div>{' '}
                <span className="text-surface-variant">•</span>{' '}
                <div className="flex items-center gap-space-xs">
                  {' '}
                  <Icon name="ac_unit" className="text-secondary-fixed-dim text-[18px]" aria-hidden />{' '}
                  <span>Vận chuyển bảo ôn 100%</span>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
              {' '}
              <div className="lg:col-span-8 flex flex-col gap-space-xl">
                {' '}
                <div className="bg-surface-container-lowest rounded-[0.25rem] p-space-lg shadow-sm">
                  {' '}
                  <div className="flex items-center justify-between pb-space-md">
                    {' '}
                    <div className="flex items-center gap-space-sm">
                      {' '}
                      <Icon name="inventory_2" className="text-primary text-[24px]" aria-hidden />{' '}
                      <h2 className="font-headline-sm text-headline-sm text-primary">
                        Danh Mục Tuyển Phẩm Trong Đơn (300 Hộp)
                      </h2>{' '}
                    </div>{' '}
                    <span className="font-label-sm text-label-sm text-secondary bg-surface-container-low px-2 py-1 rounded-[0.125rem]">
                      B2B BATCH #NGV-2024-88
                    </span>{' '}
                  </div>{' '}
                  <div className="">
                    {' '}
                    <div className="py-space-md flex flex-col gap-space-sm">
                      {' '}
                      <div className="flex flex-col sm:flex-row gap-space-md items-start sm:items-center justify-between">
                        {' '}
                        <div className="flex gap-space-md items-center">
                          {' '}
                          <div className="w-20 h-20 rounded-[0.125rem] bg-surface-container shrink-0 overflow-hidden shadow-sm">
                            {' '}
                            <img
                              className="w-full h-full object-cover"
                              data-alt="Exquisite royal golden lacquer Vietnamese mooncake gift box with gold leaf calligraphy, handcrafted lotus pastries and silk tassel ribbon, luxury studio lighting"
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAiAckbu7LRH0FiC_cFfH0vkvmOON3wY5I8MRzKxzaOQggcwMflTSWAygbHXnImTXHk8eCj0d81a69gM3x1hAvl79bIyzEnOd2mfBC5UMdmXvze69ko1xJ3javEfaYdemSQVa59CzfBTfQ3IQxERNnD248VDQZetXjT0DuF8EIwG04fYFWFKo7sc3vW8_cyr_QNNnLdsYkaD41PrIFT8_TH9TdOYb2Q-9ax7utJqcQrVybgU7CLHge"
                            />{' '}
                          </div>{' '}
                          <div className="space-y-1">
                            {' '}
                            <div className="flex items-center gap-space-xs">
                              {' '}
                              <span className="font-label-sm text-[9px] uppercase px-1.5 py-0.5 bg-secondary text-on-secondary rounded-[0.125rem]">
                                Bán Chạy Nhất
                              </span>{' '}
                              <span className="font-label-sm text-[9px] text-on-tertiary-container tracking-wider uppercase">
                                Đông Trùng Hạ Thảo & Yến Sào
                              </span>{' '}
                            </div>{' '}
                            <h3 className="font-headline-sm text-headline-sm text-primary">
                              Hộp Nguyệt Viên Hoàng Kim
                            </h3>{' '}
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                              Quy cách: Hộp sơn mài thủ công 6 bánh x 180g • Rượu hoa cúc ngự chế
                            </p>{' '}
                            <div className="flex flex-wrap gap-space-xs pt-1">
                              {' '}
                              <span className="font-label-sm text-label-sm px-2 py-0.5 bg-surface-container rounded-[0.125rem] text-primary flex items-center gap-1">
                                {' '}
                                <Icon name="done" className="text-[13px] text-gold-burnished" aria-hidden />
                                {' Khắc nhũ kim: VinGroup '}
                              </span>{' '}
                              <span className="font-label-sm text-label-sm px-2 py-0.5 bg-surface-container rounded-[0.125rem] text-primary flex items-center gap-1">
                                {' '}
                                <Icon name="done" className="text-[13px] text-gold-burnished" aria-hidden />
                                {' Thiệp pháp thư thủ công '}
                              </span>{' '}
                            </div>{' '}
                          </div>{' '}
                        </div>{' '}
                        <div className="sm:text-right flex sm:flex-col justify-between items-end w-full sm:w-auto mt-2 sm:mt-0">
                          {' '}
                          <div className="flex items-center gap-space-xs">
                            {' '}
                            <span className="font-body-sm text-body-sm line-through text-outline">1.850.000₫</span>{' '}
                            <span className="font-label-lg text-label-lg text-primary">1.387.500₫</span>{' '}
                          </div>{' '}
                          <div className="font-body-sm text-body-sm text-secondary font-semibold">
                            Số lượng: 250 hộp
                          </div>{' '}
                          <div className="font-headline-sm text-headline-sm text-primary sm:pt-1">346.875.000₫</div>{' '}
                        </div>{' '}
                      </div>{' '}
                      <div className="mt-space-sm bg-surface-container-low p-space-sm rounded-[0.125rem] border border-gold-subtle/30 text-body-sm">
                        {' '}
                        <div className="flex items-center justify-between pb-1 mb-1.5">
                          {' '}
                          <span className="font-label-sm text-[11px] uppercase tracking-wider text-secondary font-semibold flex items-center gap-1">
                            {' '}
                            <Icon name="bakery_dining" className="text-[15px]" aria-hidden />
                            {' Danh Sách 06 Vị Bánh & Ngự Chế Bên Trong '}
                          </span>{' '}
                          <span className="font-label-sm text-[10px] text-outline uppercase">
                            Định lượng chuẩn 180g / bánh
                          </span>{' '}
                        </div>{' '}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-space-md gap-y-1">
                          {' '}
                          <div className="flex justify-between items-center py-0.5">
                            {' '}
                            <span className="text-primary flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-[0.75rem] bg-gold-burnished"></span>Bào Ngư Sốt X.O
                              Thượng Hạng (180g)
                            </span>{' '}
                            <span className="font-medium text-on-surface-variant">285.000₫</span>{' '}
                          </div>{' '}
                          <div className="flex justify-between items-center py-0.5">
                            {' '}
                            <span className="text-primary flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-[0.75rem] bg-gold-burnished"></span>Lava Trứng Muối
                              Hoàng Kim (180g)
                            </span>{' '}
                            <span className="font-medium text-on-surface-variant">215.000₫</span>{' '}
                          </div>{' '}
                          <div className="flex justify-between items-center py-0.5">
                            {' '}
                            <span className="text-primary flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-[0.75rem] bg-gold-burnished"></span>Yến Sào Hạt Sen
                              Tây Hồ (180g)
                            </span>{' '}
                            <span className="font-medium text-on-surface-variant">265.000₫</span>{' '}
                          </div>{' '}
                          <div className="flex justify-between items-center py-0.5">
                            {' '}
                            <span className="text-primary flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-[0.75rem] bg-gold-burnished"></span>Thập Cẩm Gà Quay
                              Vi Cá (180g)
                            </span>{' '}
                            <span className="font-medium text-on-surface-variant">225.000₫</span>{' '}
                          </div>{' '}
                          <div className="flex justify-between items-center py-0.5">
                            {' '}
                            <span className="text-primary flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-[0.75rem] bg-gold-burnished"></span>Hạt Sen Long Nhãn
                              Hưng Yên (180g)
                            </span>{' '}
                            <span className="font-medium text-on-surface-variant">165.000₫</span>{' '}
                          </div>{' '}
                          <div className="flex justify-between items-center py-0.5">
                            {' '}
                            <span className="text-primary flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-[0.75rem] bg-gold-burnished"></span>Đậu Xanh Trà Xanh
                              Uji Matcha (180g)
                            </span>{' '}
                            <span className="font-medium text-on-surface-variant">155.000₫</span>{' '}
                          </div>{' '}
                        </div>{' '}
                        <div className="mt-1.5 pt-1 flex items-center justify-between text-[12px] text-tertiary font-medium">
                          {' '}
                          <span className="flex items-center gap-1">
                            {' '}
                            <Icon name="wine_bar" className="text-[15px] text-gold-burnished" aria-hidden />
                            {' Rượu Hoa Cúc Ngự Chế Sơn Quy '}
                          </span>{' '}
                          <span className="font-label-sm text-[10px] text-gold-burnished uppercase font-bold bg-cream-base px-2 py-0.5 rounded-[0.125rem]">
                            Tặng kèm thượng phẩm
                          </span>{' '}
                        </div>{' '}
                      </div>{' '}
                    </div>{' '}
                    <div className="py-space-md flex flex-col gap-space-sm">
                      {' '}
                      <div className="flex flex-col sm:flex-row gap-space-md items-start sm:items-center justify-between">
                        {' '}
                        <div className="flex gap-space-md items-center">
                          {' '}
                          <div className="w-20 h-20 rounded-[0.125rem] bg-surface-container shrink-0 overflow-hidden shadow-sm">
                            {' '}
                            <img
                              className="w-full h-full object-cover"
                              data-alt="Traditional luxury Vietnamese mooncake box in emerald velvet with gold filigree details, containing assorted mixed-nut and roasted chicken pastries"
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaOH8z12g2iVUmmBhnsPNFIBcn6Oo4wQ3qD914QVS_-r1KPFjvYSbuXKO1gG3DfykIwLnZUWSG68Quhp4OJFfQlBmEKJ8J7-L7zDOeWZk3v5CLLWnmA-_zwNK5Chgvzr3PMAvQi4muMbg7X11CBA6tqCvuyJFrO80mFwo88oo2Zi_hdcH8nX3QVYKEfc3ZpVCjtvfjPLug1rLqmGGjrY84L7j8c-QPEa6x_Ps_VImR38U0AXdM4zMw"
                            />{' '}
                          </div>{' '}
                          <div className="space-y-1">
                            {' '}
                            <div className="flex items-center gap-space-xs">
                              {' '}
                              <span className="font-label-sm text-[9px] uppercase px-1.5 py-0.5 bg-tertiary-container text-secondary-fixed rounded-[0.125rem]">
                                Di Sản Cung Đình
                              </span>{' '}
                            </div>{' '}
                            <h3 className="font-headline-sm text-headline-sm text-primary">
                              Hộp Thập Cẩm Bát Bửu Cổ Truyền
                            </h3>{' '}
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                              Quy cách: Hộp bọc gấm hoa 4 bánh x 210g xốt X.O tôm khô hảo hạng
                            </p>{' '}
                            <div className="flex flex-wrap gap-space-xs pt-1">
                              {' '}
                              <span className="font-label-sm text-label-sm px-2 py-0.5 bg-surface-container rounded-[0.125rem] text-primary flex items-center gap-1">
                                {' '}
                                <Icon name="done" className="text-[13px] text-gold-burnished" aria-hidden />
                                {' Ruy băng đỏ điều in logo '}
                              </span>{' '}
                            </div>{' '}
                          </div>{' '}
                        </div>{' '}
                        <div className="sm:text-right flex sm:flex-col justify-between items-end w-full sm:w-auto mt-2 sm:mt-0">
                          {' '}
                          <div className="flex items-center gap-space-xs">
                            {' '}
                            <span className="font-body-sm text-body-sm line-through text-outline">1.200.000₫</span>{' '}
                            <span className="font-label-lg text-label-lg text-primary">900.000₫</span>{' '}
                          </div>{' '}
                          <div className="font-body-sm text-body-sm text-secondary font-semibold">Số lượng: 50 hộp</div>{' '}
                          <div className="font-headline-sm text-headline-sm text-primary sm:pt-1">45.000.000₫</div>{' '}
                        </div>{' '}
                      </div>{' '}
                      <div className="mt-space-sm bg-surface-container-low p-space-sm rounded-[0.125rem] border border-gold-subtle/30 text-body-sm">
                        {' '}
                        <div className="flex items-center justify-between pb-1 mb-1.5">
                          {' '}
                          <span className="font-label-sm text-[11px] uppercase tracking-wider text-secondary font-semibold flex items-center gap-1">
                            {' '}
                            <Icon name="bakery_dining" className="text-[15px]" aria-hidden />
                            {' Danh Sách 04 Vị Bánh Tuyển Chọn Bên Trong '}
                          </span>{' '}
                          <span className="font-label-sm text-[10px] text-outline uppercase">
                            Định lượng chuẩn 210g / bánh
                          </span>{' '}
                        </div>{' '}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-space-md gap-y-1">
                          {' '}
                          <div className="flex justify-between items-center py-0.5">
                            {' '}
                            <span className="text-primary flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-[0.75rem] bg-gold-burnished"></span>Thập Cẩm Bát Bửu
                              Thịt Nướng Củi Than (210g)
                            </span>{' '}
                            <span className="font-medium text-on-surface-variant">245.000₫</span>{' '}
                          </div>{' '}
                          <div className="flex justify-between items-center py-0.5">
                            {' '}
                            <span className="text-primary flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-[0.75rem] bg-gold-burnished"></span>Thập Cẩm X.O Sò
                              Điệp Hải Sản (210g)
                            </span>{' '}
                            <span className="font-medium text-on-surface-variant">255.000₫</span>{' '}
                          </div>{' '}
                          <div className="flex justify-between items-center py-0.5">
                            {' '}
                            <span className="text-primary flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-[0.75rem] bg-gold-burnished"></span>Hạt Sen Hạnh Nhân
                              Trứng Muối Kép (210g)
                            </span>{' '}
                            <span className="font-medium text-on-surface-variant">210.000₫</span>{' '}
                          </div>{' '}
                          <div className="flex justify-between items-center py-0.5">
                            {' '}
                            <span className="text-primary flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-[0.75rem] bg-gold-burnished"></span>Mè Đen Hạt Dưa
                              Dầu Phộng Nguyên Chất (210g)
                            </span>{' '}
                            <span className="font-medium text-on-surface-variant">190.000₫</span>{' '}
                          </div>{' '}
                        </div>{' '}
                      </div>{' '}
                    </div>{' '}
                  </div>{' '}
                  <div className="mt-space-md p-space-md bg-surface-container-low rounded-[0.125rem] flex items-start gap-space-sm">
                    {' '}
                    <Icon name="brush" className="text-secondary text-[20px] shrink-0 mt-0.5" aria-hidden />{' '}
                    <div className="font-body-sm text-body-sm text-on-surface leading-relaxed">
                      {' '}
                      <span className="font-bold text-primary">Dịch Vụ Tạo Tác Độc Quyền Theo Yêu Cầu:</span>
                      {
                        ' Khắc laser mạ vàng biểu trưng doanh nghiệp trên nắp hộp sơn mài & viết thiệp thư pháp tay trên giấy dó truyền thống được tài trợ 100% cho đơn hàng đạt ngưỡng B2B Hoàng Triều. '
                      }
                    </div>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="bg-surface-container-lowest rounded-[0.25rem] p-space-lg shadow-sm">
                  {' '}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-md">
                    {' '}
                    <div>
                      {' '}
                      <div className="flex items-center gap-space-sm">
                        {' '}
                        <Icon name="local_shipping" className="text-primary text-[24px]" aria-hidden />{' '}
                        <h2 className="font-headline-sm text-headline-sm text-primary">
                          Vận Chuyển Đa Chi Nhánh B2B Lạnh (Cold-Chain)
                        </h2>{' '}
                      </div>{' '}
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        Hệ thống xe bảo ôn chuyên dụng 18°C - 22°C giữ trọn độ tươi giòn và kết cấu mỹ vị hoàng gia.
                      </p>{' '}
                    </div>{' '}
                    <button
                      className="inline-flex items-center justify-center gap-space-xs bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-label-md uppercase tracking-wider px-space-md py-2.5 rounded-[0.125rem] transition-all shadow-sm"
                      type="button"
                    >
                      {' '}
                      <Icon name="upload_file" className="text-[18px] text-secondary" aria-hidden />{' '}
                      <span>Tải Lên File Excel (.xlsx)</span>{' '}
                    </button>{' '}
                  </div>{' '}
                  <div className="space-y-space-md pt-space-xs">
                    {' '}
                    <div className="bg-cream-base p-space-md rounded-[0.25rem] shadow-sm">
                      {' '}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm pb-space-sm">
                        {' '}
                        <div className="flex items-center gap-space-xs">
                          {' '}
                          <span className="w-6 h-6 rounded-[0.75rem] bg-primary text-champagne-light flex items-center justify-center font-label-sm text-[11px] font-bold">
                            1
                          </span>{' '}
                          <h3 className="font-label-lg text-label-lg text-primary uppercase">
                            Trụ Sở Tập Đoàn • Hà Nội
                          </h3>{' '}
                          <span className="font-label-sm text-[10px] px-2 py-0.5 rounded-[0.125rem] bg-tertiary-container text-secondary-fixed uppercase">
                            Trọng Điểm Ngoại Giao
                          </span>{' '}
                        </div>{' '}
                        <div className="flex items-center gap-space-xs text-secondary font-label-md text-label-md">
                          {' '}
                          <Icon name="event" className="text-[18px]" aria-hidden />{' '}
                          <span>Hẹn giao: 12/8 Âm Lịch (Giờ Thìn 08:30)</span>{' '}
                        </div>{' '}
                      </div>{' '}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md pt-space-xs">
                        {' '}
                        <div>
                          {' '}
                          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase block mb-1">
                            Địa Chỉ Nhận Hàng
                          </label>{' '}
                          <div className="font-body-sm text-body-sm text-primary font-medium">
                            Tòa nhà Symphony, Chu Huy Mân, KĐT Phúc Lợi, Long Biên, Hà Nội
                          </div>{' '}
                          <div className="font-body-sm text-body-sm text-outline">
                            Đầu mối: Ban Lễ Tân Tầng 1 • 024.3974.9999
                          </div>{' '}
                        </div>{' '}
                        <div>
                          {' '}
                          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase block mb-1">
                            Phân Bổ Sản Phẩm
                          </label>{' '}
                          <div className="font-body-sm text-body-sm text-primary">
                            {' '}
                            <span className="font-bold text-secondary">150 Hộp</span>
                            {' (120 Hộp Hoàng Kim + 30 Hộp Bát Bửu) '}
                          </div>{' '}
                          <div className="font-body-sm text-body-sm text-outline">
                            Kèm 150 Túi gấm & thư ngỏ Chủ Tịch
                          </div>{' '}
                        </div>{' '}
                        <div>
                          {' '}
                          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase block mb-1">
                            Quy Cách Xe Vận Tải
                          </label>{' '}
                          <div className="flex items-center gap-space-xs text-body-sm text-tertiary">
                            {' '}
                            <Icon name="ac_unit" className="text-[16px] text-tertiary" aria-hidden />{' '}
                            <span>Xe chuyên dụng 1.5 tấn (19°C)</span>{' '}
                          </div>{' '}
                          <div className="font-label-sm text-label-sm text-gold-burnished mt-1">
                            Cước vận chuyển: ĐÃ MIỄN PHÍ
                          </div>{' '}
                        </div>{' '}
                      </div>{' '}
                    </div>{' '}
                    <div className="bg-cream-base p-space-md rounded-[0.25rem] shadow-sm">
                      {' '}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm pb-space-sm">
                        {' '}
                        <div className="flex items-center gap-space-xs">
                          {' '}
                          <span className="w-6 h-6 rounded-[0.75rem] bg-primary text-champagne-light flex items-center justify-center font-label-sm text-[11px] font-bold">
                            2
                          </span>{' '}
                          <h3 className="font-label-lg text-label-lg text-primary uppercase">
                            Chi Nhánh Miền Nam • TP. Hồ Chí Minh
                          </h3>{' '}
                          <span className="font-label-sm text-[10px] px-2 py-0.5 rounded-[0.125rem] bg-surface-container text-on-surface uppercase">
                            Văn Phòng Khu Vực
                          </span>{' '}
                        </div>{' '}
                        <div className="flex items-center gap-space-xs text-secondary font-label-md text-label-md">
                          {' '}
                          <Icon name="event" className="text-[18px]" aria-hidden />{' '}
                          <span>Hẹn giao: 13/8 Âm Lịch (Trong giờ hành chính)</span>{' '}
                        </div>{' '}
                      </div>{' '}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md pt-space-xs">
                        {' '}
                        <div>
                          {' '}
                          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase block mb-1">
                            Địa Chỉ Nhận Hàng
                          </label>{' '}
                          <div className="font-body-sm text-body-sm text-primary font-medium">
                            Landmark 81, 720A Điện Biên Phủ, P.22, Q. Bình Thạnh, TP.HCM
                          </div>{' '}
                          <div className="font-body-sm text-body-sm text-outline">
                            Đầu mối: Phòng Nhân Sự Vận Hành • 028.3822.8899
                          </div>{' '}
                        </div>{' '}
                        <div>
                          {' '}
                          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase block mb-1">
                            Phân Bổ Sản Phẩm
                          </label>{' '}
                          <div className="font-body-sm text-body-sm text-primary">
                            {' '}
                            <span className="font-bold text-secondary">100 Hộp</span>
                            {' (100 Hộp Nguyệt Viên Hoàng Kim) '}
                          </div>{' '}
                          <div className="font-body-sm text-body-sm text-outline">
                            Đóng pallet nhiệt gỗ thông chống sốc
                          </div>{' '}
                        </div>{' '}
                        <div>
                          {' '}
                          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase block mb-1">
                            Quy Cách Xe Vận Tải
                          </label>{' '}
                          <div className="flex items-center gap-space-xs text-body-sm text-tertiary">
                            {' '}
                            <Icon name="ac_unit" className="text-[16px] text-tertiary" aria-hidden />{' '}
                            <span>Hàng không bảo ôn & xe trung chuyển</span>{' '}
                          </div>{' '}
                          <div className="font-label-sm text-label-sm text-gold-burnished mt-1">
                            Cước vận chuyển: ĐÃ MIỄN PHÍ
                          </div>{' '}
                        </div>{' '}
                      </div>{' '}
                    </div>{' '}
                    <div className="bg-cream-base p-space-md rounded-[0.25rem] shadow-sm">
                      {' '}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm pb-space-sm">
                        {' '}
                        <div className="flex items-center gap-space-xs">
                          {' '}
                          <span className="w-6 h-6 rounded-[0.75rem] bg-primary text-champagne-light flex items-center justify-center font-label-sm text-[11px] font-bold">
                            3
                          </span>{' '}
                          <h3 className="font-label-lg text-label-lg text-primary uppercase">
                            Văn Phòng Đại Diện • Đà Nẵng
                          </h3>{' '}
                          <span className="font-label-sm text-[10px] px-2 py-0.5 rounded-[0.125rem] bg-surface-container text-on-surface uppercase">
                            Khu Vực Miền Trung
                          </span>{' '}
                        </div>{' '}
                        <div className="flex items-center gap-space-xs text-secondary font-label-md text-label-md">
                          {' '}
                          <Icon name="event" className="text-[18px]" aria-hidden /> <span>Hẹn giao: 14/8 Âm Lịch</span>{' '}
                        </div>{' '}
                      </div>{' '}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md pt-space-xs">
                        {' '}
                        <div>
                          {' '}
                          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase block mb-1">
                            Địa Chỉ Nhận Hàng
                          </label>{' '}
                          <div className="font-body-sm text-body-sm text-primary font-medium">
                            Tầng 12, Indochina Riverside, 74 Bạch Đằng, Hải Châu, Đà Nẵng
                          </div>{' '}
                          <div className="font-body-sm text-body-sm text-outline">
                            Đầu mối: Ban Giám Đốc Chi Nhánh • 0236.3664.888
                          </div>{' '}
                        </div>{' '}
                        <div>
                          {' '}
                          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase block mb-1">
                            Phân Bổ Sản Phẩm
                          </label>{' '}
                          <div className="font-body-sm text-body-sm text-primary">
                            {' '}
                            <span className="font-bold text-secondary">50 Hộp</span>
                            {' (30 Hộp Hoàng Kim + 20 Hộp Bát Bửu) '}
                          </div>{' '}
                          <div className="font-body-sm text-body-sm text-outline">Hộp quà đính kèm hoa sen lụa</div>{' '}
                        </div>{' '}
                        <div>
                          {' '}
                          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase block mb-1">
                            Quy Cách Xe Vận Tải
                          </label>{' '}
                          <div className="flex items-center gap-space-xs text-body-sm text-tertiary">
                            {' '}
                            <Icon name="ac_unit" className="text-[16px] text-tertiary" aria-hidden />{' '}
                            <span>Chuyển phát bảo ôn hỏa tốc 24h</span>{' '}
                          </div>{' '}
                          <div className="font-label-sm text-label-sm text-gold-burnished mt-1">
                            Cước vận chuyển: ĐÃ MIỄN PHÍ
                          </div>{' '}
                        </div>{' '}
                      </div>{' '}
                    </div>{' '}
                  </div>{' '}
                  <div className="mt-space-md flex flex-col sm:flex-row items-center justify-between gap-space-sm pt-space-sm">
                    {' '}
                    <div className="font-body-sm text-body-sm text-outline flex items-center gap-1">
                      {' '}
                      <Icon name="info" className="text-[16px] text-secondary" aria-hidden />
                      {' Tổng số lượng phân bổ: '}
                      <span className="font-bold text-primary">300 / 300 Hộp</span>
                      {' (Khớp hoàn toàn) '}
                    </div>{' '}
                    <button
                      className="inline-flex items-center gap-1 font-label-md text-label-md text-secondary hover:text-primary transition-colors uppercase"
                      type="button"
                    >
                      {' '}
                      <Icon name="add_circle" className="text-[18px]" aria-hidden /> <span>Thêm Điểm Giao Mới</span>{' '}
                    </button>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="bg-surface-container-lowest rounded-[0.25rem] p-space-lg shadow-sm">
                  {' '}
                  <div className="flex items-center justify-between pb-space-md">
                    {' '}
                    <div className="flex items-center gap-space-sm">
                      {' '}
                      <Icon name="receipt_long" className="text-primary text-[24px]" aria-hidden />{' '}
                      <h2 className="font-headline-sm text-headline-sm text-primary">
                        Xuất Hóa Đơn Điện Tử VAT Doanh Nghiệp
                      </h2>{' '}
                    </div>{' '}
                    <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-tertiary-fixed-dim bg-tertiary px-2 py-1 rounded-[0.125rem]">
                      {' '}
                      <Icon name="bolt" className="text-[13px]" aria-hidden />{' '}
                      <span>Tự động phát hành trong 15 phút</span>{' '}
                    </span>{' '}
                  </div>{' '}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                    {' '}
                    <div>
                      {' '}
                      <label className="font-label-md text-label-md text-primary uppercase block mb-1">
                        Mã Số Thuế (MST) *
                      </label>{' '}
                      <div className="relative">
                        {' '}
                        <input
                          className="w-full bg-cream-base px-space-md py-2.5 rounded-[0.125rem] font-body-md text-body-md text-primary focus:outline-none focus:bg-surface-container-lowest shadow-sm"
                          type="text"
                          defaultValue="0101245486"
                        />{' '}
                        <Icon
                          name="check_circle"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary text-[18px]"
                          aria-hidden
                        />{' '}
                      </div>{' '}
                      <span className="font-label-sm text-[10px] text-on-surface-variant mt-1 block">
                        Xác thực hợp lệ từ Cổng Thông Tin Thuế Quốc Gia
                      </span>{' '}
                    </div>{' '}
                    <div>
                      {' '}
                      <label className="font-label-md text-label-md text-primary uppercase block mb-1">
                        Tên Pháp Nhân Công Ty / Tập Đoàn *
                      </label>{' '}
                      <input
                        className="w-full bg-cream-base px-space-md py-2.5 rounded-[0.125rem] font-body-md text-body-md text-primary focus:outline-none focus:bg-surface-container-lowest shadow-sm"
                        type="text"
                        defaultValue="TẬP ĐOÀN VINGROUP - CÔNG TY CP"
                      />{' '}
                    </div>{' '}
                    <div className="sm:col-span-2">
                      {' '}
                      <label className="font-label-md text-label-md text-primary uppercase block mb-1">
                        Địa Chỉ Đăng Ký Kinh Doanh Ghi Trên Hóa Đơn *
                      </label>{' '}
                      <input
                        className="w-full bg-cream-base px-space-md py-2.5 rounded-[0.125rem] font-body-md text-body-md text-primary focus:outline-none focus:bg-surface-container-lowest shadow-sm"
                        type="text"
                        defaultValue="Số 7, Đường Bằng Lăng 1, KĐT Sinh Thái Vinhomes Riverside, P. Việt Hưng, Q. Long Biên, TP. Hà Nội"
                      />{' '}
                    </div>{' '}
                    <div>
                      {' '}
                      <label className="font-label-md text-label-md text-primary uppercase block mb-1">
                        Email Nhận Hóa Đơn Điện Tử (XML & PDF) *
                      </label>{' '}
                      <input
                        className="w-full bg-cream-base px-space-md py-2.5 rounded-[0.125rem] font-body-md text-body-md text-primary focus:outline-none focus:bg-surface-container-lowest shadow-sm"
                        type="email"
                        defaultValue="ketoan-thue@vingroup.net"
                      />{' '}
                    </div>{' '}
                    <div>
                      {' '}
                      <label className="font-label-md text-label-md text-primary uppercase block mb-1">
                        Ghi Chú Nghiệp Vụ / Mã Số Dự Án (PO / PR)
                      </label>{' '}
                      <input
                        className="w-full bg-cream-base px-space-md py-2.5 rounded-[0.125rem] font-body-md text-body-md text-primary placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest shadow-sm"
                        placeholder="VD: PO-VIN-2024-MIDAUTUMN-09"
                        type="text"
                      />{' '}
                    </div>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
              <div className="lg:col-span-4 flex flex-col gap-space-lg">
                {' '}
                <div className="bg-surface-container-lowest rounded-[0.25rem] p-space-lg shadow-md sticky top-24">
                  {' '}
                  <div className="flex items-center justify-between pb-space-md">
                    {' '}
                    <h3 className="font-headline-sm text-headline-sm text-primary">Tóm Tắt Báo Giá Hợp Đồng</h3>{' '}
                    <Icon name="workspace_premium" className="text-gold-burnished text-[20px]" aria-hidden />{' '}
                  </div>{' '}
                  <div className="space-y-space-sm font-body-md text-body-md text-on-surface-variant pb-space-md">
                    {' '}
                    <div className="flex justify-between items-center">
                      {' '}
                      <span>Tổng giá niêm yết (300 hộp)</span>{' '}
                      <span className="text-primary font-medium">522.500.000₫</span>{' '}
                    </div>{' '}
                    <div className="flex justify-between items-center text-secondary">
                      {' '}
                      <div className="flex items-center gap-1">
                        {' '}
                        <span>Chiết khấu Doanh Nghiệp VIP (-25%)</span>{' '}
                        <Icon name="info" className="text-[16px]" aria-hidden />{' '}
                      </div>{' '}
                      <span className="font-bold">-130.625.000₫</span>{' '}
                    </div>{' '}
                    <div className="flex justify-between items-center">
                      {' '}
                      <span>Phí in khắc kim nhũ & thư pháp</span>{' '}
                      <span className="text-tertiary font-bold uppercase text-[12px]">Tài trợ 100%</span>{' '}
                    </div>{' '}
                    <div className="flex justify-between items-center">
                      {' '}
                      <span>Vận chuyển bảo ôn đa miền (Cold-chain)</span>{' '}
                      <span className="text-tertiary font-bold uppercase text-[12px]">0₫ (Miễn Phí)</span>{' '}
                    </div>{' '}
                    <div className="flex justify-between items-center">
                      {' '}
                      <span>Thuế giá trị gia tăng (VAT 8%)</span>{' '}
                      <span className="text-primary font-medium">31.350.000₫</span>{' '}
                    </div>{' '}
                    <div className="pt-space-md mt-space-sm bg-cream-base -mx-space-lg px-space-lg py-space-md rounded-[0.125rem]">
                      {' '}
                      <div className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
                        Tổng Giá Trị Thanh Toán Hợp Đồng
                      </div>{' '}
                      <div className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold mt-1">
                        423.225.000₫
                      </div>{' '}
                      <div className="font-body-sm text-body-sm text-outline">
                        Đã bao gồm VAT, bao bì gấm & bảo hiểm hàng hóa
                      </div>{' '}
                    </div>{' '}
                  </div>{' '}
                  <div className="space-y-space-sm pt-space-sm">
                    {' '}
                    <span className="font-label-md text-label-md text-primary uppercase block">
                      Phương Thức Thanh Toán Hợp Đồng B2B
                    </span>{' '}
                    <label className="flex items-start gap-space-sm p-space-sm rounded-[0.125rem] cursor-pointer bg-surface-container-low hover:bg-surface-container transition-all">
                      {' '}
                      <input
                        defaultChecked
                        className="mt-1 accent-gold-burnished"
                        name="payment_mode"
                        type="radio"
                      />{' '}
                      <div className="flex-1">
                        {' '}
                        <div className="flex justify-between items-center">
                          {' '}
                          <span className="font-label-md text-label-md text-primary uppercase font-bold">
                            Đặt Cọc Sản Xuất 30%
                          </span>{' '}
                          <span className="font-label-lg text-label-lg text-secondary font-bold">126.967.500₫</span>{' '}
                        </div>{' '}
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Ký hợp đồng, lên đơn đóng mẫu và hoàn tất 70% còn lại trước ngày giao đợt 1.
                        </p>{' '}
                      </div>{' '}
                    </label>{' '}
                    <label className="flex items-start gap-space-sm p-space-sm rounded-[0.125rem] cursor-pointer bg-surface-container-low hover:bg-surface-container transition-all">
                      {' '}
                      <input className="mt-1 accent-gold-burnished" name="payment_mode" type="radio" />{' '}
                      <div className="flex-1">
                        {' '}
                        <div className="flex justify-between items-center">
                          {' '}
                          <span className="font-label-md text-label-md text-primary uppercase font-bold">
                            Thanh Toán 100% / Bảo Lãnh LC
                          </span>{' '}
                          <span className="font-label-sm text-label-sm text-gold-burnished uppercase font-bold">
                            + Quà Thượng Hạng
                          </span>{' '}
                        </div>{' '}
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Tặng ngay 02 Hộp Nguyệt Viên Hoàng Kim dành riêng cho Phòng Quan Hệ Ngoại Giao.
                        </p>{' '}
                      </div>{' '}
                    </label>{' '}
                  </div>{' '}
                  <div className="p-space-sm rounded-[0.125rem] bg-surface-container flex items-center gap-space-sm my-space-md">
                    {' '}
                    <Icon name="description" className="text-primary text-[20px]" aria-hidden />{' '}
                    <div className="font-body-sm text-body-sm text-on-surface-variant leading-tight">
                      {
                        ' Hợp đồng kinh tế và cam kết an toàn thực phẩm OCOP 5 sao sẽ phát hành tự động qua chữ ký số VNPT/Viettel CA. '
                      }
                    </div>{' '}
                  </div>{' '}
                  <button
                    className="w-full py-3.5 px-space-md rounded-[0.125rem] bg-primary text-champagne-light hover:bg-ink-dark transition-all flex items-center justify-center gap-space-xs shadow-md group"
                    type="button"
                  >
                    {' '}
                    <Icon
                      name="draw"
                      className="text-[20px] text-secondary-fixed group-hover:scale-110 transition-transform"
                      aria-hidden
                    />{' '}
                    <span className="font-label-lg text-label-lg uppercase tracking-wider text-secondary-fixed">
                      Xác Nhận & Ký Hợp Đồng Điện Tử
                    </span>{' '}
                  </button>{' '}
                  <div className="text-center pt-space-md">
                    {' '}
                    <span className="font-body-sm text-body-sm text-outline block">
                      Cần chỉnh sửa điều khoản pháp lý hoặc công nợ?
                    </span>{' '}
                    <a
                      className="font-label-md text-label-md text-secondary hover:text-primary uppercase tracking-wider font-bold inline-flex items-center gap-1 mt-1"
                      href="tel:18008899"
                    >
                      {' '}
                      <Icon name="support_agent" className="text-[16px]" aria-hidden />{' '}
                      <span>Kết Nối Chuyên Viên Quản Lý Đại Thượng Doanh Nghiệp (1800 8899)</span>{' '}
                    </a>{' '}
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
