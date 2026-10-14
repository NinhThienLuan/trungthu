// Tự sinh từ bản thiết kế Stitch — giữ nguyên nội dung. Sửa logic ở trang bọc ngoài.
import { Icon } from '../../components/Icon'

export function StitchAdminKyc() {
  return (
    <>
      <div className="flex flex-col w-full">
        {' '}
        <div className="relative overflow-hidden bg-primary-container px-space-lg py-space-xl text-champagne-light shadow-xl">
          {' '}
          <div className="absolute -right-24 -top-24 w-96 h-96 rounded-[0.75rem] bg-secondary-fixed/5 blur-3xl pointer-events-none"></div>{' '}
          <div className="absolute left-1/3 -bottom-20 w-72 h-72 rounded-[0.75rem] bg-secondary/10 blur-2xl pointer-events-none"></div>{' '}
          <div className="relative max-w-[1320px] mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
            {' '}
            <div className="flex flex-col max-w-3xl">
              {' '}
              <div className="flex items-center gap-space-sm mb-space-xs">
                {' '}
                <span className="inline-flex items-center justify-center px-space-sm py-0.5 rounded-[0.75rem] bg-secondary/20 text-secondary-fixed font-label-sm text-label-sm tracking-[0.2em] uppercase">
                  {' Hội Đồng Giám Sát Độc Lập '}
                </span>{' '}
                <span className="w-1.5 h-1.5 rounded-[0.75rem] bg-secondary-fixed"></span>{' '}
                <span className="font-label-sm text-label-sm text-champagne-light/70 tracking-widest uppercase">
                  {' Chuỗi Lạnh & Vi Sinh OCOP 5★ '}
                </span>{' '}
              </div>{' '}
              <h1 className="font-headline-lg text-headline-lg text-surface-container-lowest font-medium tracking-tight">
                {' Trung Tâm Quản Trị Chất Lượng & Thẩm Định Vi Sinh Thực Phẩm '}
              </h1>{' '}
              <p className="font-body-md text-body-md text-champagne-light/80 mt-space-xs font-light max-w-2xl leading-relaxed">
                {
                  ' Giám sát độc lập tiêu chuẩn HACCP, ISO 22000 và bảo chứng mẻ tươi cho 42 xưởng nghệ nhân di sản trên toàn quốc. Đảm bảo độ thuần khiết, an toàn sinh học và phong vị trác tuyệt trước khi niêm phong triện Nguyệt Viên. '
                }
              </p>{' '}
            </div>{' '}
            <div className="flex flex-wrap items-center gap-space-sm self-start lg:self-end">
              {' '}
              <button
                className="px-space-md py-2.5 rounded-[0.25rem] bg-error text-on-error font-body-sm text-body-sm font-semibold hover:bg-error/90 transition-all flex items-center gap-space-xs shadow-md"
                id="btn-emergency-freeze"
              >
                {' '}
                <Icon name="gavel" className="text-[18px]" aria-hidden /> <span>Lệnh Đình Chỉ Khẩn</span>{' '}
              </button>{' '}
              <button
                className="px-space-md py-2.5 rounded-[0.25rem] bg-ink-dark/80 text-secondary-fixed font-body-sm text-body-sm font-semibold hover:bg-ink-dark transition-all flex items-center gap-space-xs shadow-md"
                id="btn-export-dossier"
              >
                {' '}
                <Icon name="download_for_offline" className="text-[18px]" aria-hidden />{' '}
                <span>Xuất Báo Cáo Bộ Y Tế</span>{' '}
              </button>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
        <div className="max-w-[1320px] w-full mx-auto px-space-lg py-space-xl flex flex-col gap-space-xl">
          {' '}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
            {' '}
            <div className="relative bg-surface-container-lowest p-space-lg rounded-[0.5rem] shadow-[0_4px_24px_rgba(9,36,65,0.05)] hover:shadow-[0_8px_32px_rgba(214,167,92,0.12)] transition-all flex flex-col justify-between overflow-hidden">
              {' '}
              <div className="flex items-start justify-between">
                {' '}
                <div className="flex flex-col">
                  {' '}
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-[0.18em]">
                    Tiêu Chuẩn Lò Nướng
                  </span>{' '}
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Tỷ lệ mẻ đạt chuẩn ATTP
                  </span>{' '}
                </div>{' '}
                <div className="w-10 h-10 rounded-[0.75rem] bg-tertiary-container/30 flex items-center justify-center text-tertiary-fixed">
                  {' '}
                  <Icon name="verified_user" className="text-[22px]" aria-hidden />{' '}
                </div>{' '}
              </div>{' '}
              <div className="mt-space-lg flex items-baseline justify-between">
                {' '}
                <div className="flex items-baseline gap-space-xs">
                  {' '}
                  <span className="font-headline-xl text-headline-xl text-primary font-semibold">99.8</span>{' '}
                  <span className="font-headline-sm text-headline-sm text-primary/70">%</span>{' '}
                </div>{' '}
                <span className="font-label-md text-label-md text-tertiary-fixed font-medium bg-tertiary-container px-2 py-0.5 rounded-[0.125rem]">
                  124 / 125 MẺ
                </span>{' '}
              </div>{' '}
              <div className="w-full bg-surface-container h-1.5 rounded-[0.75rem] mt-space-sm overflow-hidden">
                {' '}
                <div className="bg-secondary h-full rounded-[0.75rem]" style={{ width: '99.8%' }}></div>{' '}
              </div>{' '}
              <span className="font-body-sm text-body-sm text-on-surface-variant/80 mt-space-xs block text-[11px]">
                {' 1 mẻ Đông Phương hiệu chỉnh nhiệt tâm bánh +2°C '}
              </span>{' '}
            </div>{' '}
            <div className="relative bg-surface-container-lowest p-space-lg rounded-[0.5rem] shadow-[0_4px_24px_rgba(9,36,65,0.05)] hover:shadow-[0_8px_32px_rgba(214,167,92,0.12)] transition-all flex flex-col justify-between overflow-hidden">
              {' '}
              <div className="flex items-start justify-between">
                {' '}
                <div className="flex flex-col">
                  {' '}
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-[0.18em]">
                    Chu Kỳ Kiểm Kê
                  </span>{' '}
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Tái thẩm định định kỳ
                  </span>{' '}
                </div>{' '}
                <div className="w-10 h-10 rounded-[0.75rem] bg-secondary-container/30 flex items-center justify-center text-secondary">
                  {' '}
                  <Icon name="history_toggle_off" className="text-[22px]" aria-hidden />{' '}
                </div>{' '}
              </div>{' '}
              <div className="mt-space-lg flex items-baseline justify-between">
                {' '}
                <div className="flex items-baseline gap-space-xs">
                  {' '}
                  <span className="font-headline-xl text-headline-xl text-primary font-semibold">03</span>{' '}
                  <span className="font-body-md text-body-md text-on-surface-variant">Lò di sản</span>{' '}
                </div>{' '}
                <span className="font-label-md text-label-md text-secondary font-medium bg-secondary-container/40 px-2 py-0.5 rounded-[0.125rem]">
                  HẠN 7 NGÀY
                </span>{' '}
              </div>{' '}
              <div className="w-full bg-surface-container h-1.5 rounded-[0.75rem] mt-space-sm overflow-hidden">
                {' '}
                <div className="bg-secondary-fixed-dim h-full rounded-[0.75rem]" style={{ width: '45%' }}></div>{' '}
              </div>{' '}
              <span className="font-body-sm text-body-sm text-on-surface-variant/80 mt-space-xs block text-[11px]">
                {' Hồ sơ lò than thủ công & đối lưu sấy hạt sen '}
              </span>{' '}
            </div>{' '}
            <div className="relative bg-surface-container-lowest p-space-lg rounded-[0.5rem] shadow-[0_4px_24px_rgba(9,36,65,0.05)] hover:shadow-[0_8px_32px_rgba(214,167,92,0.12)] transition-all flex flex-col justify-between overflow-hidden">
              {' '}
              <div className="flex items-start justify-between">
                {' '}
                <div className="flex flex-col">
                  {' '}
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-[0.18em]">
                    Cảm Biến Sinh Học
                  </span>{' '}
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Vi sinh / độ ẩm vượt ngưỡng
                  </span>{' '}
                </div>{' '}
                <div className="w-10 h-10 rounded-[0.75rem] bg-surface-container flex items-center justify-center text-on-surface-variant">
                  {' '}
                  <Icon name="biotech" className="text-[22px]" aria-hidden />{' '}
                </div>{' '}
              </div>{' '}
              <div className="mt-space-lg flex items-baseline justify-between">
                {' '}
                <div className="flex items-baseline gap-space-xs">
                  {' '}
                  <span className="font-headline-xl text-headline-xl text-primary font-semibold">00</span>{' '}
                  <span className="font-body-md text-body-md text-on-surface-variant">Cảnh báo</span>{' '}
                </div>{' '}
                <span className="font-label-md text-label-md text-tertiary-fixed font-medium bg-tertiary-container px-2 py-0.5 rounded-[0.125rem]">
                  AN TOÀN TUYỆT ĐỐI
                </span>{' '}
              </div>{' '}
              <div className="w-full bg-surface-container h-1.5 rounded-[0.75rem] mt-space-sm overflow-hidden">
                {' '}
                <div className="bg-primary h-full rounded-[0.75rem]" style={{ width: '100%' }}></div>{' '}
              </div>{' '}
              <span className="font-body-sm text-body-sm text-on-surface-variant/80 mt-space-xs block text-[11px]">
                {' Độ ẩm tâm bánh chuẩn 18.2% - 21.5% Aw '}
              </span>{' '}
            </div>{' '}
            <div className="relative bg-surface-container-lowest p-space-lg rounded-[0.5rem] shadow-[0_4px_24px_rgba(9,36,65,0.05)] hover:shadow-[0_8px_32px_rgba(214,167,92,0.12)] transition-all flex flex-col justify-between overflow-hidden">
              {' '}
              <div className="flex items-start justify-between">
                {' '}
                <div className="flex flex-col">
                  {' '}
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-[0.18em]">
                    Kho Lưu Trữ Đối Chứng
                  </span>{' '}
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Mẫu lưu kho kiểm định 18°C
                  </span>{' '}
                </div>{' '}
                <div className="w-10 h-10 rounded-[0.75rem] bg-primary-container/10 flex items-center justify-center text-primary-container">
                  {' '}
                  <Icon name="ac_unit" className="text-[22px]" aria-hidden />{' '}
                </div>{' '}
              </div>{' '}
              <div className="mt-space-lg flex items-baseline justify-between">
                {' '}
                <div className="flex items-baseline gap-space-xs">
                  {' '}
                  <span className="font-headline-xl text-headline-xl text-primary font-semibold">372</span>{' '}
                  <span className="font-body-md text-body-md text-on-surface-variant">Hộp lưu mẫu</span>{' '}
                </div>{' '}
                <span className="font-label-md text-label-md text-primary font-medium bg-primary-fixed px-2 py-0.5 rounded-[0.125rem]">
                  KHO LẠNH KHÚC
                </span>{' '}
              </div>{' '}
              <div className="w-full bg-surface-container h-1.5 rounded-[0.75rem] mt-space-sm overflow-hidden">
                {' '}
                <div className="bg-secondary-fixed h-full rounded-[0.75rem]" style={{ width: '82%' }}></div>{' '}
              </div>{' '}
              <span className="font-body-sm text-body-sm text-on-surface-variant/80 mt-space-xs block text-[11px]">
                {' Bảo quản chân không kèm chip NFC theo dõi nhiệt độ '}
              </span>{' '}
            </div>{' '}
          </div>{' '}
          <div className="bg-surface-container-lowest rounded-[0.5rem] shadow-[0_4px_28px_rgba(9,36,65,0.06)] overflow-hidden">
            {' '}
            <div className="p-space-lg bg-surface-container-low flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
              {' '}
              <div className="flex flex-col">
                {' '}
                <div className="flex items-center gap-space-xs">
                  {' '}
                  <Icon name="fact_check" className="text-secondary text-[22px]" aria-hidden />{' '}
                  <h2 className="font-headline-sm text-headline-sm text-primary font-semibold">
                    {' Bảng Thẩm Tra Hồ Sơ & Kiểm Định Mẻ Tươi Các Lò Di Sản '}
                  </h2>{' '}
                </div>{' '}
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  {' Cập nhật tức thời theo kết quả thử nghiệm Lab Vi sinh & Đánh giá cảm quan Hội Đồng Nghệ Nhân. '}
                </p>{' '}
              </div>{' '}
              <div className="flex flex-wrap items-center gap-space-sm">
                {' '}
                <div className="relative">
                  {' '}
                  <input
                    className="w-64 pl-9 pr-3 py-2 rounded-[0.25rem] bg-surface-container-lowest text-on-surface font-body-sm text-body-sm outline-none focus:bg-surface-container transition-all"
                    id="search-baker"
                    placeholder="Tìm tên lò, số hiệu hồ sơ..."
                    type="text"
                  />{' '}
                  <Icon name="search" className="absolute left-2.5 top-2.5 text-outline text-[18px]" aria-hidden />{' '}
                </div>{' '}
                <div className="flex items-center bg-surface-container-lowest rounded-[0.25rem] p-1">
                  {' '}
                  <button className="px-3 py-1.5 rounded-[0.125rem] text-body-sm font-medium bg-primary text-on-primary">
                    Tất Cả (42)
                  </button>{' '}
                  <button className="px-3 py-1.5 rounded-[0.125rem] text-body-sm font-medium text-on-surface-variant hover:text-primary">
                    Đã Cấp Triện (37)
                  </button>{' '}
                  <button className="px-3 py-1.5 rounded-[0.125rem] text-body-sm font-medium text-on-surface-variant hover:text-primary">
                    Thanh Tra (3)
                  </button>{' '}
                  <button className="px-3 py-1.5 rounded-[0.125rem] text-body-sm font-medium text-on-surface-variant hover:text-primary">
                    Bổ Sung (2)
                  </button>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
            <div className="overflow-x-auto">
              {' '}
              <table className="w-full text-left border-collapse">
                {' '}
                <thead>
                  {' '}
                  <tr className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase tracking-[0.14em]">
                    {' '}
                    <th className="py-space-md px-space-lg">Lò Di Sản & Cội Nguồn</th>{' '}
                    <th className="py-space-md px-space-md">Cục ATTP & Vi Sinh Lab</th>{' '}
                    <th className="py-space-md px-space-md">Cảm Quan Hội Đồng Nghệ Nhân</th>{' '}
                    <th className="py-space-md px-space-md">Trạng Thái Thẩm Định</th>{' '}
                    <th className="py-space-md px-space-lg text-right">Thao Tác Quản Trị</th>{' '}
                  </tr>{' '}
                </thead>{' '}
                <tbody className="divide-y divide-surface-container text-on-surface font-body-md text-body-md">
                  {' '}
                  <tr className="hover:bg-surface-container-low/60 transition-colors">
                    {' '}
                    <td className="py-space-md px-space-lg">
                      {' '}
                      <div className="flex items-center gap-space-md">
                        {' '}
                        <div className="w-12 h-12 rounded-[0.25rem] bg-surface-container flex-shrink-0 overflow-hidden relative shadow-sm">
                          {' '}
                          <img
                            className="w-full h-full object-cover"
                            data-alt="Close up artisanal Vietnamese mooncake with golden browned pastry skin debossed with traditional floral motif on silk ivory background"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuARPtaZEkFOAzld9TatRaPXY6zexfK9x9kJd9YNbUMjZ8bVJk0F79Z2sCn2tnOsbY2tUi5NJiNa4-d309i06AySIrae6YiI7lkeqIyp8qBvrOhySHXRYTKL9BELZQFu7dgPKcB4LC7fmfmA_Nwc-QnjcklHUa_lXBO_5Dh2IlRucBkIN35uqK8R1LD8AgrxkQh-fll_pmdF54-bLy8As2b1wfy3wQpGiqOqFnFoCo3x19ZmcrYDuJ2G"
                          />{' '}
                        </div>{' '}
                        <div className="flex flex-col min-w-0">
                          {' '}
                          <div className="flex items-center gap-1.5">
                            {' '}
                            <span className="font-headline-sm text-[16px] text-primary font-semibold">
                              Đông Phương
                            </span>{' '}
                            <Icon name="stars" className="text-secondary text-[16px]" aria-hidden />{' '}
                          </div>{' '}
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            Cầu Đất • Hải Phòng (70 Năm Di Sản)
                          </span>{' '}
                          <span className="font-label-sm text-label-sm text-secondary font-medium tracking-wider mt-0.5">
                            MÃ: DP-HP-2024-001
                          </span>{' '}
                        </div>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md">
                      {' '}
                      <div className="flex flex-col gap-1">
                        {' '}
                        <div className="flex items-center gap-1.5">
                          {' '}
                          <span className="w-2 h-2 rounded-[0.75rem] bg-tertiary-fixed"></span>{' '}
                          <span className="font-body-sm text-body-sm font-semibold text-primary">
                            Giấy Phép ATTP: 4821/2024/ATTP-HP
                          </span>{' '}
                        </div>{' '}
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {' '}
                          <span className="px-2 py-0.5 rounded-[0.125rem] bg-tertiary-container/20 text-tertiary-fixed text-[11px] font-medium font-body-sm">
                            E.coli: Âm tính
                          </span>{' '}
                          <span className="px-2 py-0.5 rounded-[0.125rem] bg-tertiary-container/20 text-tertiary-fixed text-[11px] font-medium font-body-sm">
                            {'Nấm men: <10 CFU/g'}
                          </span>{' '}
                          <span className="px-2 py-0.5 rounded-[0.125rem] bg-surface-container text-on-surface-variant text-[11px] font-medium font-body-sm">
                            Brix đường: 64°
                          </span>{' '}
                        </div>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md">
                      {' '}
                      <div className="flex flex-col gap-1 max-w-xs">
                        {' '}
                        <div className="flex items-center gap-1 text-secondary">
                          {' '}
                          <Icon name="star" className="text-[16px]" filled aria-hidden />{' '}
                          <Icon name="star" className="text-[16px]" filled aria-hidden />{' '}
                          <Icon name="star" className="text-[16px]" filled aria-hidden />{' '}
                          <Icon name="star" className="text-[16px]" filled aria-hidden />{' '}
                          <Icon name="star" className="text-[16px]" filled aria-hidden />{' '}
                          <span className="font-label-sm text-label-sm text-primary font-bold ml-1">9.9/10</span>{' '}
                        </div>{' '}
                        <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                          {
                            ' Vỏ mỏng óng ả, thoang thoảng hoa bưởi tự nhiên Đan Phượng. Thập cẩm xá xíu dậy mùi lá chanh tươi, không lợ gắt. '
                          }
                        </p>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md">
                      {' '}
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-[0.75rem] bg-primary-container text-secondary-fixed font-label-sm text-label-sm uppercase tracking-wider">
                        {' '}
                        <Icon name="workspace_premium" className="text-[14px]" aria-hidden />
                        {' Đã Cấp Triện Hoàng Gia '}
                      </span>{' '}
                      <span className="block font-body-sm text-body-sm text-outline mt-1 text-[11px]">
                        Cấp ngày: 18/08/2024
                      </span>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-lg text-right">
                      {' '}
                      <div className="flex items-center justify-end gap-1.5">
                        {' '}
                        <button
                          className="p-2 rounded-[0.25rem] bg-surface-container hover:bg-secondary-container/40 text-primary transition-colors"
                          title="Xem Chi Tiết Hồ Sơ Dấu Đỏ"
                        >
                          {' '}
                          <Icon name="policy" className="text-[18px]" aria-hidden />{' '}
                        </button>{' '}
                        <button
                          className="p-2 rounded-[0.25rem] bg-surface-container hover:bg-primary hover:text-champagne-light text-primary transition-colors"
                          title="Tái Ký Mã QR Bảo Chứng"
                        >
                          {' '}
                          <Icon name="qr_code_2" className="text-[18px]" aria-hidden />{' '}
                        </button>{' '}
                        <button
                          className="p-2 rounded-[0.25rem] bg-surface-container hover:bg-error hover:text-on-error text-outline transition-colors"
                          title="Đình Chỉ Niêm Yết"
                        >
                          {' '}
                          <Icon name="block" className="text-[18px]" aria-hidden />{' '}
                        </button>{' '}
                      </div>{' '}
                    </td>{' '}
                  </tr>{' '}
                  <tr className="hover:bg-surface-container-low/60 transition-colors">
                    {' '}
                    <td className="py-space-md px-space-lg">
                      {' '}
                      <div className="flex items-center gap-space-md">
                        {' '}
                        <div className="w-12 h-12 rounded-[0.25rem] bg-surface-container flex-shrink-0 overflow-hidden relative shadow-sm">
                          {' '}
                          <img
                            className="w-full h-full object-cover"
                            data-alt="Traditional baked mooncake with lotus seed and melon seed filling, freshly cut on ceramic plate"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2cvCwct4unlNVg2GBb3dxGnGtO-vamhKs5ilHDytb8E_PxTXyw9Gp_81lmZp76jTwbbplz7DC8MdxZmOOO08JTyw5TcXRzHQOp20Fcduve8Vt4Z1wUFNJDoVq8Wn4_pw01HJYx7du_HTGwPeDH2HpqKjtUhpftjEraQt_AGaiPsKXadun_27DS5aXcA1VmeFnm9qMjoF_Mh4tjHANnZ3rjzLo5WYF56vc_1fbGU6ZnzAJ-CELQFYm"
                          />{' '}
                        </div>{' '}
                        <div className="flex flex-col min-w-0">
                          {' '}
                          <div className="flex items-center gap-1.5">
                            {' '}
                            <span className="font-headline-sm text-[16px] text-primary font-semibold">
                              Bảo Phương
                            </span>{' '}
                            <Icon name="verified" className="text-secondary text-[16px]" aria-hidden />{' '}
                          </div>{' '}
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            Thụy Khuê • Tây Hồ • Hà Nội (1954)
                          </span>{' '}
                          <span className="font-label-sm text-label-sm text-secondary font-medium tracking-wider mt-0.5">
                            MÃ: BP-TK-2024-004
                          </span>{' '}
                        </div>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md">
                      {' '}
                      <div className="flex flex-col gap-1">
                        {' '}
                        <div className="flex items-center gap-1.5">
                          {' '}
                          <span className="w-2 h-2 rounded-[0.75rem] bg-secondary-fixed-dim"></span>{' '}
                          <span className="font-body-sm text-body-sm font-semibold text-primary">
                            Giấy Phép ATTP: 3109/2024/ATTP-HN
                          </span>{' '}
                        </div>{' '}
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {' '}
                          <span className="px-2 py-0.5 rounded-[0.125rem] bg-tertiary-container/20 text-tertiary-fixed text-[11px] font-medium font-body-sm">
                            E.coli: Âm tính
                          </span>{' '}
                          <span className="px-2 py-0.5 rounded-[0.125rem] bg-tertiary-container/20 text-tertiary-fixed text-[11px] font-medium font-body-sm">
                            Khuẩn kỵ khí: Đạt
                          </span>{' '}
                          <span className="px-2 py-0.5 rounded-[0.125rem] bg-secondary-container/30 text-secondary text-[11px] font-medium font-body-sm">
                            Độ ẩm bao bì: 20.8%
                          </span>{' '}
                        </div>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md">
                      {' '}
                      <div className="flex flex-col gap-1 max-w-xs">
                        {' '}
                        <div className="flex items-center gap-1 text-secondary">
                          {' '}
                          <Icon name="star" className="text-[16px]" filled aria-hidden />{' '}
                          <Icon name="star" className="text-[16px]" filled aria-hidden />{' '}
                          <Icon name="star" className="text-[16px]" filled aria-hidden />{' '}
                          <Icon name="star" className="text-[16px]" filled aria-hidden />{' '}
                          <Icon name="star_half" className="text-[16px]" aria-hidden />{' '}
                          <span className="font-label-sm text-label-sm text-primary font-bold ml-1">9.6/10</span>{' '}
                        </div>{' '}
                        <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                          {
                            ' Bánh dẻo thơm nồng hoa bưởi, bột nếp cái hoa vàng quánh mịn. Bánh nướng vỏ giòn xốp cổ truyền đúng cốt Tràng An. '
                          }
                        </p>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md">
                      {' '}
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-[0.75rem] bg-secondary-container/40 text-on-secondary-container font-label-sm text-label-sm uppercase tracking-wider">
                        {' '}
                        <Icon name="local_police" className="text-[14px]" aria-hidden />
                        {' Đang Thanh Tra Đột Xuất '}
                      </span>{' '}
                      <span className="block font-body-sm text-body-sm text-outline mt-1 text-[11px]">
                        Lấy mẫu bột nếp đợt 2
                      </span>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-lg text-right">
                      {' '}
                      <div className="flex items-center justify-end gap-1.5">
                        {' '}
                        <button
                          className="p-2 rounded-[0.25rem] bg-surface-container hover:bg-secondary-container/40 text-primary transition-colors"
                          title="Xem Chi Tiết Hồ Sơ Dấu Đỏ"
                        >
                          {' '}
                          <Icon name="policy" className="text-[18px]" aria-hidden />{' '}
                        </button>{' '}
                        <button
                          className="p-2 rounded-[0.25rem] bg-surface-container hover:bg-primary hover:text-champagne-light text-primary transition-colors"
                          title="Tái Ký Mã QR Bảo Chứng"
                        >
                          {' '}
                          <Icon name="qr_code_2" className="text-[18px]" aria-hidden />{' '}
                        </button>{' '}
                        <button
                          className="p-2 rounded-[0.25rem] bg-surface-container hover:bg-error hover:text-on-error text-outline transition-colors"
                          title="Đình Chỉ Niêm Yết"
                        >
                          {' '}
                          <Icon name="block" className="text-[18px]" aria-hidden />{' '}
                        </button>{' '}
                      </div>{' '}
                    </td>{' '}
                  </tr>{' '}
                  <tr className="hover:bg-surface-container-low/60 transition-colors">
                    {' '}
                    <td className="py-space-md px-space-lg">
                      {' '}
                      <div className="flex items-center gap-space-md">
                        {' '}
                        <div className="w-12 h-12 rounded-[0.25rem] bg-surface-container flex-shrink-0 overflow-hidden relative shadow-sm">
                          {' '}
                          <img
                            className="w-full h-full object-cover"
                            data-alt="Deluxe Vietnamese mooncake box packaging open displaying double salted egg yolk mooncakes with intricate glossy pattern"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBL94vPuYwFluEpBqAXVX0dYNpzuP3SBHB8Vxej4bK7k0dJ8VSv5OypLZlYLO5DdAI-l2OQ9BYw9z1KyanKrXOFl6GzO4kenl6hmxmxhVTwdQ5_JYXCvx1Q-2DlY_pEEBlxo9ycmkjCOJTg0CSFhlstWRr_xGCGdylxpqtzEqEtBvRTd20TDydDGCgNN52Wvdmwl2urAxtgGodHeUf-hKNM3d7-5qQkLK7vAHyytq74IZ6j-tw-ZNs2"
                          />{' '}
                        </div>{' '}
                        <div className="flex flex-col min-w-0">
                          {' '}
                          <div className="flex items-center gap-1.5">
                            {' '}
                            <span className="font-headline-sm text-[16px] text-primary font-semibold">
                              Như Lan
                            </span>{' '}
                            <Icon name="stars" className="text-secondary text-[16px]" aria-hidden />{' '}
                          </div>{' '}
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            Hàm Nghi • Quận 1 • TP. HCM (1968)
                          </span>{' '}
                          <span className="font-label-sm text-label-sm text-secondary font-medium tracking-wider mt-0.5">
                            MÃ: NL-SG-2024-002
                          </span>{' '}
                        </div>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md">
                      {' '}
                      <div className="flex flex-col gap-1">
                        {' '}
                        <div className="flex items-center gap-1.5">
                          {' '}
                          <span className="w-2 h-2 rounded-[0.75rem] bg-tertiary-fixed"></span>{' '}
                          <span className="font-body-sm text-body-sm font-semibold text-primary">
                            Giấy Phép ATTP: 1084/2024/ATTP-HCM
                          </span>{' '}
                        </div>{' '}
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {' '}
                          <span className="px-2 py-0.5 rounded-[0.125rem] bg-tertiary-container/20 text-tertiary-fixed text-[11px] font-medium font-body-sm">
                            Salmonella: Âm tính
                          </span>{' '}
                          <span className="px-2 py-0.5 rounded-[0.125rem] bg-tertiary-container/20 text-tertiary-fixed text-[11px] font-medium font-body-sm">
                            Nấm mốc: 0 CFU
                          </span>{' '}
                          <span className="px-2 py-0.5 rounded-[0.125rem] bg-surface-container text-on-surface-variant text-[11px] font-medium font-body-sm">
                            Muối trứng: 2.1%
                          </span>{' '}
                        </div>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md">
                      {' '}
                      <div className="flex flex-col gap-1 max-w-xs">
                        {' '}
                        <div className="flex items-center gap-1 text-secondary">
                          {' '}
                          <Icon name="star" className="text-[16px]" filled aria-hidden />{' '}
                          <Icon name="star" className="text-[16px]" filled aria-hidden />{' '}
                          <Icon name="star" className="text-[16px]" filled aria-hidden />{' '}
                          <Icon name="star" className="text-[16px]" filled aria-hidden />{' '}
                          <Icon name="star" className="text-[16px]" filled aria-hidden />{' '}
                          <span className="font-label-sm text-label-sm text-primary font-bold ml-1">9.8/10</span>{' '}
                        </div>{' '}
                        <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                          {
                            ' Nhân yến sào vi cá & hạt sen tán mịn. Trứng muối ngâm rượu mai quế lộ đỏ au, độ sánh dẻo hoàn mỹ. '
                          }
                        </p>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md">
                      {' '}
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-[0.75rem] bg-primary-container text-secondary-fixed font-label-sm text-label-sm uppercase tracking-wider">
                        {' '}
                        <Icon name="workspace_premium" className="text-[14px]" aria-hidden />
                        {' Đã Cấp Triện Hoàng Gia '}
                      </span>{' '}
                      <span className="block font-body-sm text-body-sm text-outline mt-1 text-[11px]">
                        Cấp ngày: 15/08/2024
                      </span>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-lg text-right">
                      {' '}
                      <div className="flex items-center justify-end gap-1.5">
                        {' '}
                        <button
                          className="p-2 rounded-[0.25rem] bg-surface-container hover:bg-secondary-container/40 text-primary transition-colors"
                          title="Xem Chi Tiết Hồ Sơ Dấu Đỏ"
                        >
                          {' '}
                          <Icon name="policy" className="text-[18px]" aria-hidden />{' '}
                        </button>{' '}
                        <button
                          className="p-2 rounded-[0.25rem] bg-surface-container hover:bg-primary hover:text-champagne-light text-primary transition-colors"
                          title="Tái Ký Mã QR Bảo Chứng"
                        >
                          {' '}
                          <Icon name="qr_code_2" className="text-[18px]" aria-hidden />{' '}
                        </button>{' '}
                        <button
                          className="p-2 rounded-[0.25rem] bg-surface-container hover:bg-error hover:text-on-error text-outline transition-colors"
                          title="Đình Chỉ Niêm Yết"
                        >
                          {' '}
                          <Icon name="block" className="text-[18px]" aria-hidden />{' '}
                        </button>{' '}
                      </div>{' '}
                    </td>{' '}
                  </tr>{' '}
                  <tr className="hover:bg-surface-container-low/60 transition-colors">
                    {' '}
                    <td className="py-space-md px-space-lg">
                      {' '}
                      <div className="flex items-center gap-space-md">
                        {' '}
                        <div className="w-12 h-12 rounded-[0.25rem] bg-surface-container flex-shrink-0 overflow-hidden relative shadow-sm">
                          {' '}
                          <img
                            className="w-full h-full object-cover"
                            data-alt="Traditional wood mould carving for Vietnamese mooncake next to pure white lotus bean paste filling"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzZyxrA3803A83RbHtIn_hN5uzBJqywuQFnsNkwFQHBnIn_-jUCuJvdq2s0T6UmSbRwDfijhW4f2qTTpzef4x_-BNM1GgZQ2GRoB-rgDDKcZ0r-9nRU9aiUGop6mpgghNqNwAytWQR31GkFob8ykYnu_E5GZ41iSxZ9rS9x5VaMsgQ7Q8PG3cxmFIvwHBsgUEahZS61bD82jF2Q3hNePrKlF4zyJ0fuaufi-ta-B-96rgt9b4ffrb3"
                          />{' '}
                        </div>{' '}
                        <div className="flex flex-col min-w-0">
                          {' '}
                          <div className="flex items-center gap-1.5">
                            {' '}
                            <span className="font-headline-sm text-[16px] text-primary font-semibold">Bà Dần</span>{' '}
                            <Icon name="verified" className="text-secondary text-[16px]" aria-hidden />{' '}
                          </div>{' '}
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            Hàng Bè • Hoàn Kiếm • Hà Nội
                          </span>{' '}
                          <span className="font-label-sm text-label-sm text-secondary font-medium tracking-wider mt-0.5">
                            MÃ: BD-HN-2024-009
                          </span>{' '}
                        </div>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md">
                      {' '}
                      <div className="flex flex-col gap-1">
                        {' '}
                        <div className="flex items-center gap-1.5">
                          {' '}
                          <span className="w-2 h-2 rounded-[0.75rem] bg-outline"></span>{' '}
                          <span className="font-body-sm text-body-sm font-semibold text-primary">
                            Giấy Phép ATTP: 8872/2023/ATTP-HN
                          </span>{' '}
                        </div>{' '}
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {' '}
                          <span className="px-2 py-0.5 rounded-[0.125rem] bg-surface-container text-on-surface-variant text-[11px] font-medium font-body-sm">
                            Chờ mẫu bột lọc
                          </span>{' '}
                          <span className="px-2 py-0.5 rounded-[0.125rem] bg-surface-container text-on-surface-variant text-[11px] font-medium font-body-sm">
                            Độ ẩm lò: Cần đo lại
                          </span>{' '}
                        </div>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md">
                      {' '}
                      <div className="flex flex-col gap-1 max-w-xs">
                        {' '}
                        <div className="flex items-center gap-1 text-secondary">
                          {' '}
                          <Icon name="star" className="text-[16px]" filled aria-hidden />{' '}
                          <Icon name="star" className="text-[16px]" filled aria-hidden />{' '}
                          <Icon name="star" className="text-[16px]" filled aria-hidden />{' '}
                          <Icon name="star" className="text-[16px]" filled aria-hidden />{' '}
                          <Icon name="star_border" className="text-[16px]" aria-hidden />{' '}
                          <span className="font-label-sm text-label-sm text-primary font-bold ml-1">9.1/10</span>{' '}
                        </div>{' '}
                        <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                          {
                            ' Bánh chả và nướng dẻo gia truyền nướng lò củi than đước. Vị ngọt mộc mạc không phụ gia tạo màu. '
                          }
                        </p>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md">
                      {' '}
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-[0.75rem] bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                        {' '}
                        <Icon name="pending_actions" className="text-[14px]" aria-hidden />
                        {' Chờ Bổ Sung Hồ Sơ Lò Than '}
                      </span>{' '}
                      <span className="block font-body-sm text-body-sm text-outline mt-1 text-[11px]">
                        Hạn chót: 25/08/2024
                      </span>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-lg text-right">
                      {' '}
                      <div className="flex items-center justify-end gap-1.5">
                        {' '}
                        <button
                          className="p-2 rounded-[0.25rem] bg-surface-container hover:bg-secondary-container/40 text-primary transition-colors"
                          title="Xem Chi Tiết Hồ Sơ Dấu Đỏ"
                        >
                          {' '}
                          <Icon name="policy" className="text-[18px]" aria-hidden />{' '}
                        </button>{' '}
                        <button
                          className="p-2 rounded-[0.25rem] bg-surface-container opacity-50 cursor-not-allowed text-outline"
                          title="Chưa Thể Cấp Mã QR"
                        >
                          {' '}
                          <Icon name="qr_code_2" className="text-[18px]" aria-hidden />{' '}
                        </button>{' '}
                        <button
                          className="p-2 rounded-[0.25rem] bg-surface-container hover:bg-error hover:text-on-error text-outline transition-colors"
                          title="Đình Chỉ Niêm Yết"
                        >
                          {' '}
                          <Icon name="block" className="text-[18px]" aria-hidden />{' '}
                        </button>{' '}
                      </div>{' '}
                    </td>{' '}
                  </tr>{' '}
                  <tr className="hover:bg-surface-container-low/60 transition-colors">
                    {' '}
                    <td className="py-space-md px-space-lg">
                      {' '}
                      <div className="flex items-center gap-space-md">
                        {' '}
                        <div className="w-12 h-12 rounded-[0.25rem] bg-surface-container flex-shrink-0 overflow-hidden relative shadow-sm">
                          {' '}
                          <img
                            className="w-full h-full object-cover"
                            data-alt="Traditional Hoi An pastry artisan shaping delicate mooncake dough by hand on wooden board under warm lantern light"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcZCGMw9KKmQleCVGuJjAm7VCOip7aK6chDhCpFasU6O5CtP2Kpa5If3aKg19zvADjq_Qtvpu-WrP7EK6veXafotVrfNY1EM3Y_AqlcSZNbFk8QxFx4KwBSCX6hJbwjcBg2OLsfvkm685HD4SQvvTdQwgBGJMrYMdGaZW9IfX6VnM-wJit7AWtxApgcGjRf8GY4wyn_ocRMDeeAy0If_UTZJ6oF3y1jFPc6sDWz89BPjz2wVjLRyB9"
                          />{' '}
                        </div>{' '}
                        <div className="flex flex-col min-w-0">
                          {' '}
                          <div className="flex items-center gap-1.5">
                            {' '}
                            <span className="font-headline-sm text-[16px] text-primary font-semibold">
                              Vĩnh Hưng
                            </span>{' '}
                            <Icon name="stars" className="text-secondary text-[16px]" aria-hidden />{' '}
                          </div>{' '}
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            Trần Phú • Phố Cổ Hội An (1938)
                          </span>{' '}
                          <span className="font-label-sm text-label-sm text-secondary font-medium tracking-wider mt-0.5">
                            MÃ: VH-HA-2024-015
                          </span>{' '}
                        </div>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md">
                      {' '}
                      <div className="flex flex-col gap-1">
                        {' '}
                        <div className="flex items-center gap-1.5">
                          {' '}
                          <span className="w-2 h-2 rounded-[0.75rem] bg-tertiary-fixed"></span>{' '}
                          <span className="font-body-sm text-body-sm font-semibold text-primary">
                            Giấy Phép ATTP: 5521/2024/ATTP-QNA
                          </span>{' '}
                        </div>{' '}
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {' '}
                          <span className="px-2 py-0.5 rounded-[0.125rem] bg-tertiary-container/20 text-tertiary-fixed text-[11px] font-medium font-body-sm">
                            Vi nấm: 0%
                          </span>{' '}
                          <span className="px-2 py-0.5 rounded-[0.125rem] bg-tertiary-container/20 text-tertiary-fixed text-[11px] font-medium font-body-sm">
                            Độc tố Aflatoxin: Âm
                          </span>{' '}
                          <span className="px-2 py-0.5 rounded-[0.125rem] bg-surface-container text-on-surface-variant text-[11px] font-medium font-body-sm">
                            Dầu mè ép lạnh: Chuẩn
                          </span>{' '}
                        </div>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md">
                      {' '}
                      <div className="flex flex-col gap-1 max-w-xs">
                        {' '}
                        <div className="flex items-center gap-1 text-secondary">
                          {' '}
                          <Icon name="star" className="text-[16px]" filled aria-hidden />{' '}
                          <Icon name="star" className="text-[16px]" filled aria-hidden />{' '}
                          <Icon name="star" className="text-[16px]" filled aria-hidden />{' '}
                          <Icon name="star" className="text-[16px]" filled aria-hidden />{' '}
                          <Icon name="star" className="text-[16px]" filled aria-hidden />{' '}
                          <span className="font-label-sm text-label-sm text-primary font-bold ml-1">9.7/10</span>{' '}
                        </div>{' '}
                        <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                          {
                            ' Nhân đậu xanh mè đen hạt điều bùi béo tự nhiên xứ Quảng. Kết cấu vỏ bánh nướng vàng ruộm, độ ẩm tuyệt hảo. '
                          }
                        </p>{' '}
                      </div>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-md">
                      {' '}
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-[0.75rem] bg-primary-container text-secondary-fixed font-label-sm text-label-sm uppercase tracking-wider">
                        {' '}
                        <Icon name="workspace_premium" className="text-[14px]" aria-hidden />
                        {' Đã Cấp Triện Hoàng Gia '}
                      </span>{' '}
                      <span className="block font-body-sm text-body-sm text-outline mt-1 text-[11px]">
                        Cấp ngày: 12/08/2024
                      </span>{' '}
                    </td>{' '}
                    <td className="py-space-md px-space-lg text-right">
                      {' '}
                      <div className="flex items-center justify-end gap-1.5">
                        {' '}
                        <button
                          className="p-2 rounded-[0.25rem] bg-surface-container hover:bg-secondary-container/40 text-primary transition-colors"
                          title="Xem Chi Tiết Hồ Sơ Dấu Đỏ"
                        >
                          {' '}
                          <Icon name="policy" className="text-[18px]" aria-hidden />{' '}
                        </button>{' '}
                        <button
                          className="p-2 rounded-[0.25rem] bg-surface-container hover:bg-primary hover:text-champagne-light text-primary transition-colors"
                          title="Tái Ký Mã QR Bảo Chứng"
                        >
                          {' '}
                          <Icon name="qr_code_2" className="text-[18px]" aria-hidden />{' '}
                        </button>{' '}
                        <button
                          className="p-2 rounded-[0.25rem] bg-surface-container hover:bg-error hover:text-on-error text-outline transition-colors"
                          title="Đình Chỉ Niêm Yết"
                        >
                          {' '}
                          <Icon name="block" className="text-[18px]" aria-hidden />{' '}
                        </button>{' '}
                      </div>{' '}
                    </td>{' '}
                  </tr>{' '}
                </tbody>{' '}
              </table>{' '}
            </div>{' '}
            <div className="p-space-md bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm text-body-sm text-on-surface-variant">
              {' '}
              <div className="flex items-center gap-space-sm">
                {' '}
                <span>Hiển thị 5 / 42 Lò Di Sản đã đăng ký bảo chứng</span>{' '}
                <span className="w-1 h-1 rounded-[0.75rem] bg-outline"></span>{' '}
                <span className="text-secondary font-medium">100% Hồ sơ có đính kèm chữ ký số SHA-256</span>{' '}
              </div>{' '}
              <div className="flex items-center gap-1">
                {' '}
                <button className="w-8 h-8 rounded-[0.125rem] bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors">
                  {' '}
                  <Icon name="chevron_left" className="text-[18px]" aria-hidden />{' '}
                </button>{' '}
                <span className="px-3 py-1 bg-primary text-champagne-light rounded-[0.125rem] font-medium text-[12px]">
                  1
                </span>{' '}
                <button className="w-8 h-8 rounded-[0.125rem] bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors text-[12px]">
                  2
                </button>{' '}
                <button className="w-8 h-8 rounded-[0.125rem] bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors text-[12px]">
                  3
                </button>{' '}
                <button className="w-8 h-8 rounded-[0.125rem] bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors">
                  {' '}
                  <Icon name="chevron_right" className="text-[18px]" aria-hidden />{' '}
                </button>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
            {' '}
            <div className="lg:col-span-7 flex flex-col gap-space-md">
              {' '}
              <div className="bg-surface-container-lowest p-space-lg rounded-[0.5rem] shadow-[0_4px_28px_rgba(9,36,65,0.06)]">
                {' '}
                <div className="flex items-center justify-between pb-space-md">
                  {' '}
                  <div className="flex items-center gap-space-sm">
                    {' '}
                    <div className="w-10 h-10 rounded-[0.25rem] bg-secondary/10 flex items-center justify-center text-secondary">
                      {' '}
                      <Icon name="car_tag" className="text-[22px]" aria-hidden />{' '}
                    </div>{' '}
                    <div className="flex flex-col">
                      {' '}
                      <h3 className="font-headline-sm text-headline-sm text-primary font-semibold">
                        {' Lịch Trình Khảo Sát Thực Địa & Lấy Mẫu Đột Xuất '}
                      </h3>{' '}
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {' Phối hợp chuyên gia Viện Dinh Dưỡng Quốc Gia & Cục Giám Định Vi Sinh '}
                      </span>{' '}
                    </div>{' '}
                  </div>{' '}
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[0.125rem] bg-tertiary-container text-tertiary-fixed font-label-sm text-label-sm uppercase">
                    {' '}
                    <span className="w-2 h-2 rounded-[0.75rem] bg-tertiary-fixed animate-pulse"></span>
                    {' Đang Diễn Ra '}
                  </span>{' '}
                </div>{' '}
                <div className="flex flex-col gap-space-md mt-space-sm">
                  {' '}
                  <div className="p-space-md rounded-[0.25rem] bg-surface-container-low flex flex-col gap-space-xs">
                    {' '}
                    <div className="flex items-start justify-between">
                      {' '}
                      <div className="flex items-center gap-space-sm">
                        {' '}
                        <span className="px-2 py-0.5 rounded-[0.125rem] bg-primary text-secondary-fixed font-label-sm text-label-sm">
                          ĐOÀN 01
                        </span>{' '}
                        <h4 className="font-body-lg text-body-lg text-primary font-semibold">
                          Cụm Xưởng Cầu Đất & Thủy Nguyên (Hải Phòng)
                        </h4>{' '}
                      </div>{' '}
                      <span className="font-body-sm text-body-sm text-secondary font-medium">Hôm nay, 08:30</span>{' '}
                    </div>{' '}
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {
                        ' Lấy 24 mẫu phôi bột mì nguyên cám thượng hạng, kiểm tra lò ủ mỡ phần Sa-sùng theo công thức cổ truyền và quy trình sấy hạt sen tháp nhiệt đóng kín. '
                      }
                    </p>{' '}
                    <div className="flex items-center justify-between pt-space-xs text-[12px] text-on-surface-variant">
                      {' '}
                      <div className="flex items-center gap-2">
                        {' '}
                        <Icon
                          name="assignment_turned_in"
                          className="text-[16px] text-tertiary-fixed"
                          aria-hidden
                        />{' '}
                        <span>Trưởng đoàn: TS. Nguyễn Hoàng Minh (Viện CNTP)</span>{' '}
                      </div>{' '}
                      <span className="font-label-sm text-label-sm text-primary font-semibold">
                        TRẠNG THÁI: ĐÃ NIÊM PHONG KHO LẠNH
                      </span>{' '}
                    </div>{' '}
                  </div>{' '}
                  <div className="p-space-md rounded-[0.25rem] bg-surface-container-low flex flex-col gap-space-xs">
                    {' '}
                    <div className="flex items-start justify-between">
                      {' '}
                      <div className="flex items-center gap-space-sm">
                        {' '}
                        <span className="px-2 py-0.5 rounded-[0.125rem] bg-primary text-secondary-fixed font-label-sm text-label-sm">
                          ĐOÀN 02
                        </span>{' '}
                        <h4 className="font-body-lg text-body-lg text-primary font-semibold">
                          Trang Trại Trứng Vịt Đồng Thảo Mộc (Thanh Oai, Hà Nội)
                        </h4>{' '}
                      </div>{' '}
                      <span className="font-body-sm text-body-sm text-secondary font-medium">Hôm nay, 14:00</span>{' '}
                    </div>{' '}
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {
                        ' Kiểm định nguồn cung ứng 15,000 quả trứng vịt muối thảo mộc dành cho cụm làm bánh Phố Cổ & Thụy Khuê. Đo nồng độ muối & kiểm tra hàm lượng kháng sinh tồn dư. '
                      }
                    </p>{' '}
                    <div className="flex items-center justify-between pt-space-xs text-[12px] text-on-surface-variant">
                      {' '}
                      <div className="flex items-center gap-2">
                        {' '}
                        <Icon name="pending" className="text-[16px] text-secondary" aria-hidden />{' '}
                        <span>Trưởng đoàn: ThS. Vũ Thị Ngọc Lan (Cục ATTP)</span>{' '}
                      </div>{' '}
                      <span className="font-label-sm text-label-sm text-secondary font-semibold">
                        TRẠNG THÁI: ĐANG VẬN CHUYỂN MẪU LAB
                      </span>{' '}
                    </div>{' '}
                  </div>{' '}
                  <div className="p-space-md rounded-[0.25rem] bg-surface-container-low flex flex-col gap-space-xs">
                    {' '}
                    <div className="flex items-start justify-between">
                      {' '}
                      <div className="flex items-center gap-space-sm">
                        {' '}
                        <span className="px-2 py-0.5 rounded-[0.125rem] bg-surface-container-highest text-on-surface font-label-sm text-label-sm">
                          ĐOÀN 03
                        </span>{' '}
                        <h4 className="font-body-lg text-body-lg text-primary font-semibold">
                          Hợp Tác Xã Ép Dầu Lạc Sạch & Mè Đen Đất Quảng
                        </h4>{' '}
                      </div>{' '}
                      <span className="font-body-sm text-body-sm text-outline font-medium">Ngày mai, 09:00</span>{' '}
                    </div>{' '}
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {
                        ' Kiểm tra dây chuyền ép dầu cơ học lạnh không tinh luyện hóa chất cung cấp cho xưởng Vĩnh Hưng Hội An. Đánh giá chỉ số ôi khét peroxide. '
                      }
                    </p>{' '}
                    <div className="flex items-center justify-between pt-space-xs text-[12px] text-on-surface-variant">
                      {' '}
                      <div className="flex items-center gap-2">
                        {' '}
                        <Icon name="schedule" className="text-[16px] text-outline" aria-hidden />{' '}
                        <span>Trưởng đoàn: KS. Đặng Quốc Tuấn</span>{' '}
                      </div>{' '}
                      <span className="font-label-sm text-label-sm text-outline font-semibold">
                        TRẠNG THÁI: CHUẨN BỊ XUẤT PHÁT
                      </span>{' '}
                    </div>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
            <div className="lg:col-span-5 flex flex-col gap-space-md">
              {' '}
              <div className="bg-surface-container-lowest p-space-lg rounded-[0.5rem] shadow-[0_4px_28px_rgba(9,36,65,0.06)] relative overflow-hidden">
                {' '}
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-fixed/10 rounded-[0.75rem] blur-2xl pointer-events-none"></div>{' '}
                <div className="flex items-center gap-space-sm pb-space-sm">
                  {' '}
                  <div className="w-10 h-10 rounded-[0.25rem] bg-primary-container flex items-center justify-center text-secondary-fixed">
                    {' '}
                    <Icon name="approval" className="text-[20px]" aria-hidden />{' '}
                  </div>{' '}
                  <div>
                    {' '}
                    <h3 className="font-headline-sm text-headline-sm text-primary font-semibold">
                      {' Phê Duyệt Nhanh & Triện Số '}
                    </h3>{' '}
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Ban Quản Trị Sàn Nguyệt Viên
                    </span>{' '}
                  </div>{' '}
                </div>{' '}
                <form className="flex flex-col gap-space-md mt-space-sm" id="form-quality-approval">
                  {' '}
                  <div className="flex flex-col gap-1">
                    {' '}
                    <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                      Chọn Lò Cần Phê Duyệt / Gia Hạn
                    </label>{' '}
                    <select className="w-full px-space-md py-2.5 rounded-[0.25rem] bg-surface-container-low text-primary font-body-md text-body-md outline-none">
                      {' '}
                      <option value="dp">Đông Phương Cầu Đất - Mẻ Nướng #DP-2024-884</option>{' '}
                      <option value="bp">Bảo Phương Thụy Khuê - Mẻ Thử Nghiệm Bột #BP-091</option>{' '}
                      <option value="nl">Như Lan Sài Gòn - Lô Yến Sào Vi Cá #NL-552</option>{' '}
                      <option value="vh">Vĩnh Hưng Hội An - Mẻ Mè Đen Đậu Xanh #VH-112</option>{' '}
                    </select>{' '}
                  </div>{' '}
                  <div className="grid grid-cols-2 gap-space-sm">
                    {' '}
                    <div className="flex flex-col gap-1">
                      {' '}
                      <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                        Chỉ Số Vi Sinh
                      </label>{' '}
                      <input
                        className="w-full px-space-sm py-2 rounded-[0.25rem] bg-surface-container font-body-sm text-body-sm text-tertiary-fixed font-semibold"
                        readOnly
                        type="text"
                        defaultValue="0.00 CFU/g (ÂM TÍNH)"
                      />{' '}
                    </div>{' '}
                    <div className="flex flex-col gap-1">
                      {' '}
                      <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                        Độ Ẩm Aw Vỏ Bánh
                      </label>{' '}
                      <input
                        className="w-full px-space-sm py-2 rounded-[0.25rem] bg-surface-container font-body-sm text-body-sm text-primary font-semibold"
                        readOnly
                        type="text"
                        defaultValue="19.4% (TỐI ƯU)"
                      />{' '}
                    </div>{' '}
                  </div>{' '}
                  <div className="flex flex-col gap-1">
                    {' '}
                    <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                      Biên Bản Nhận Xét Của Hội Đồng
                    </label>{' '}
                    <textarea
                      className="w-full p-space-sm rounded-[0.25rem] bg-surface-container-low text-on-surface font-body-sm text-body-sm outline-none resize-none"
                      rows={3}
                      defaultValue="Vỏ bánh màu nâu mật ong đều đặn, mùi hoa bưởi thoang thoảng tinh tế. Mỡ gáy trong veo ráo dầu đạt độ dòn sần sật đặc trưng."
                    />{' '}
                  </div>{' '}
                  <div className="flex flex-col gap-1">
                    {' '}
                    <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                      Loại Bảo Chứng Phê Duyệt
                    </label>{' '}
                    <div className="grid grid-cols-2 gap-space-xs">
                      {' '}
                      <label className="flex items-center gap-2 p-2.5 rounded-[0.25rem] bg-surface-container-low cursor-pointer hover:bg-surface-container">
                        {' '}
                        <input
                          defaultChecked
                          className="text-secondary focus:ring-0"
                          name="seal_type"
                          type="radio"
                        />{' '}
                        <span className="font-body-sm text-body-sm text-primary font-medium">
                          Triện Hoàng Gia OCOP 5★
                        </span>{' '}
                      </label>{' '}
                      <label className="flex items-center gap-2 p-2.5 rounded-[0.25rem] bg-surface-container-low cursor-pointer hover:bg-surface-container">
                        {' '}
                        <input className="text-secondary focus:ring-0" name="seal_type" type="radio" />{' '}
                        <span className="font-body-sm text-body-sm text-primary font-medium">Tem Mẻ Tươi 24H Lạnh</span>{' '}
                      </label>{' '}
                    </div>{' '}
                  </div>{' '}
                  <div className="p-space-sm rounded-[0.25rem] bg-primary-container text-champagne-light flex items-center justify-between">
                    {' '}
                    <div className="flex items-center gap-space-xs">
                      {' '}
                      <Icon name="key" className="text-secondary-fixed text-[20px]" aria-hidden />{' '}
                      <div className="flex flex-col">
                        {' '}
                        <span className="font-label-sm text-label-sm text-secondary-fixed uppercase">
                          Chữ Ký Số Ban Quản Trị
                        </span>{' '}
                        <span className="font-body-sm text-body-sm text-champagne-light font-mono text-[11px]">
                          ADMIN-KEY: 9f8a...4b12 [Hợp Lệ]
                        </span>{' '}
                      </div>{' '}
                    </div>{' '}
                    <Icon name="verified" className="text-secondary-fixed text-[18px]" aria-hidden />{' '}
                  </div>{' '}
                  <button
                    className="w-full py-3 rounded-[0.25rem] bg-primary text-secondary-fixed hover:bg-ink-dark transition-all font-body-md text-body-md font-semibold flex items-center justify-center gap-space-xs shadow-md mt-space-xs"
                    id="btn-submit-seal"
                    type="submit"
                  >
                    {' '}
                    <Icon name="verified" className="text-[18px]" aria-hidden />{' '}
                    <span>Ký Duyệt & Cấp Mã QR Truy Xuất Nguồn Gốc</span>{' '}
                  </button>{' '}
                </form>{' '}
              </div>{' '}
              <div className="bg-primary-container p-space-md rounded-[0.5rem] text-champagne-light shadow-md flex items-center justify-between">
                {' '}
                <div className="flex items-center gap-space-sm">
                  {' '}
                  <div className="w-10 h-10 rounded-[0.75rem] bg-secondary/20 flex items-center justify-center text-secondary-fixed">
                    {' '}
                    <Icon name="thermostat" className="text-[20px]" aria-hidden />{' '}
                  </div>{' '}
                  <div className="flex flex-col">
                    {' '}
                    <span className="font-label-sm text-label-sm text-secondary-fixed uppercase tracking-wider">
                      Tủ Nuôi Cấy Vi Sinh Trung Tâm
                    </span>{' '}
                    <span className="font-headline-sm text-headline-sm text-surface-container-lowest">
                      37.2°C • Độ ẩm 85%
                    </span>{' '}
                  </div>{' '}
                </div>{' '}
                <span className="px-2 py-1 rounded-[0.125rem] bg-tertiary-container text-tertiary-fixed font-label-sm text-label-sm uppercase">
                  Bình Thường
                </span>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none" id="toast-container"></div>{' '}
      </div>
    </>
  )
}
