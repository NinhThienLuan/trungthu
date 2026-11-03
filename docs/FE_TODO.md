# Kế Hoạch Phân Chia Công Việc Frontend (FE_TODO)

> **Cập nhật:** 2026-11-02  
> **Phân công thành viên:**  
> - **Thạch (FE2 - Trọng tâm):** Kênh Người Bán (Seller Portal) & Quản Trị Sàn (Admin Platform).  
> - **Tuấn (FE1):** Giao diện Khách Hàng (Buyer Storefront), Giỏ hàng, Checkout & Auth.  
> *(Lưu ý: Tạm thời chưa tích hợp WebSocket, tập trung hoàn thiện giao diện REST API cốt lõi cho MVP).*

---

## PHẦN 1. CÔNG VIỆC CỦA THẠCH (FE2 - TRỌNG TÂM)

### Nhiệm vụ 1: Xây dựng màn hình "Phiếu ra lò" (In phiếu nướng bánh) — [ƯU TIÊN 1]
* **Cập nhật 2026-11-03:** Đã triển khai FE trên nhánh `feat/fe2-bake-sheet`, cập nhật theo `origin/master` tại `d7b4c02`: tab phiếu nướng, ngày nướng mặc định hôm nay, chọn ngày bất kỳ/hôm nay/ngày mai, tổng hợp số bánh và mã đơn từ API, in trắng đen. DTO: `variantId`, `productName`, `variantName`, `bakeQuantity`, `orderCodes`; `date` là ngày nướng, ngày giao là ngày tiếp theo. Build/lint đạt; 46 test `OrderApiTests` + `BakeLinesViewTests` đạt. Đã kiểm tra FE gọi API thật trên backend H2 riêng qua Vite proxy, đăng nhập bằng cookie: dữ liệu bảng/tổng/mã đơn khớp response, ngày rỗng và giao diện in đạt. Dữ liệu kiểm tra do demo seeder tạo, chưa kiểm tra trên database triển khai.
* **Bối cảnh:** Backend đã có view `v_bake_lines` và endpoint `GET /api/provider/bake-sheet?date=YYYY-MM-DD` do BE4 phụ trách, nhận ngày nướng.
* **Các bước triển khai:**
  1. **Service (`fe/src/services/sellerService.ts`):**  
     Bổ sung hàm gọi API:
     ```ts
     getBakeSheet: (date: string) =>
       unwrap(http.get<ApiResponse<BakeLineItem[]>>('/provider/bake-sheet', { params: { date } }))
     ```
  2. **Giao diện (`fe/src/pages/admin/OrdersPage.tsx`):**
     * Thêm nút hoặc Tab: **"Phiếu nướng hôm nay"** cạnh danh sách đơn hàng.
     * Cung cấp bộ chọn ngày (`DatePicker`, mặc định chọn ngày hiện tại hoặc ngày mai).
     * Bảng tổng hợp: Tên sản phẩm, Tên biến thể bánh, Tổng số cái cần nướng (`bake_quantity`), Danh sách các mã đơn hàng tương ứng.
  3. **Tính năng In ấn chuẩn xưởng:**
     * Thêm nút **"In phiếu nướng"** kích hoạt `window.print()`.
     * Cấu hình CSS `@media print` để khi in sẽ tự động ẩn Navbar, Sidebar và các nút bấm, chỉ in trang trắng đen rõ nét phục vụ dán tại lò nướng.

---

### Nhiệm vụ 2: Dọn dẹp trang "Menu & kho" ([`BakeBatchPage.tsx`](file:///d:/GitHub/trungthu/fe/src/pages/admin/BakeBatchPage.tsx)) khớp Scope MVP — [ƯU TIÊN 2]
* **Bối cảnh:** Trang này đang chứa các form gọi vào API Set quà động và Sổ kho over-engineering (`/composition`, `/stock`, `/release`, `/terminate`). Backend chuẩn bị dọn dẹp các API này sang Phase 2; nếu không ẩn đi, FE sẽ bị lỗi mạng `404`.
* **Các bước triển khai:**
  1. Tạm ẩn/disable các form và nút bấm sau:
     * Nút "Đóng set theo công thức" (`packSets`).
     * Nút "Trả set về kho" (`releaseSets`).
     * Form công thức phối set động (`saveSetRecipe`).
     * Nút "Báo hết hàng" (`markOutOfStock` / `/terminate`).
  2. Tập trung tối ưu và kiểm tra các luồng cốt lõi của MVP:
     * Tạo mới & chỉnh sửa bánh lẻ (`LOOSE_CAKE`) và hộp quà có sẵn (`GIFT_SET`).
     * Thêm / sửa biến thể bánh (Trọng lượng, Giá bán, Mã SKU).
     * Form **Nhập kho bánh** (`importStock`): Validate số lượng nhập phải là số nguyên dương và có trường ghi chú lý do.
     * Thao tác Mở bán (`ACTIVE`) hoặc Lưu trữ (`ARCHIVED`).

---

### Nhiệm vụ 3: Hoàn thiện luồng KYC & Gói Bán Hàng SaaS — [ƯU TIÊN 3]
* **Giao diện Seller ([`ProfilePage.tsx`](file:///d:/GitHub/trungthu/fe/src/pages/admin/ProfilePage.tsx) & [`SubscriptionPage.tsx`](file:///d:/GitHub/trungthu/fe/src/pages/admin/SubscriptionPage.tsx)):**
  1. Hiển thị rõ lý do từ chối duyệt: Nếu chứng từ nào bị `REJECTED`, hiển thị `rejectionReason` từ Backend để Seller biết nguyên nhân và bấm nút tải lại file mới.
  2. Bổ sung **Banner cảnh báo quyền bán** ở đầu trang Seller:
     * Nếu chưa nộp đủ 3 loại giấy tờ (ATTP, GPKD, CCCD) hoặc đang chờ duyệt: Hiển thị cảnh báo *"Gian hàng đang chờ duyệt hồ sơ KYC"*.
     * Nếu chưa đăng ký gói SaaS: Hiển thị liên kết nhắc Seller chọn gói bán hàng để kích hoạt quyền mở bán.
* **Giao diện Admin ([`QualityReviewPage.tsx`](file:///d:/GitHub/trungthu/fe/src/pages/admin/QualityReviewPage.tsx) & [`SubscriptionsAdminPage.tsx`](file:///d:/GitHub/trungthu/fe/src/pages/admin/SubscriptionsAdminPage.tsx)):**
  1. Màn hình duyệt KYC: Thêm Modal phóng to xem ảnh tài liệu trực tiếp trên giao diện thay vì mở sang tab trình duyệt mới.
  2. Bắt buộc nhập lý do khi Admin bấm **"Từ chối hồ sơ"** (`reject`).
  3. Màn hình đối soát gói SaaS: Hiển thị mã giao dịch chuyển khoản và nút **"Kích hoạt gói"** cho xưởng.

---

### Nhiệm vụ 4: Chuẩn hóa Iconography (Xóa Raw Emoji) — [ƯU TIÊN 4]
* **Vị trí vi phạm:** File [`fe/src/components/layouts/Header.tsx`](file:///d:/GitHub/trungthu/fe/src/components/layouts/Header.tsx#L176-L181).
* **Nội dung xử lý:**
  * Xóa bỏ hoàn toàn các ký tự raw emoji trong nhãn vai trò tài khoản.
  * Thay thế bằng các icon SVG chuẩn từ bộ icon của dự án (hoặc thư viện `lucide-react` như `ShieldCheck`, `Store`, `User`).

---

---

## PHẦN 2. CÔNG VIỆC CỦA TUẤN (FE1)

### Nhiệm vụ 1: Xử lý giới hạn đặt hàng & Bắt lỗi tồn kho Checkout
* Trong [`fe/src/services/productService.ts`](file:///d:/GitHub/trungthu/fe/src/services/productService.ts#L46): Bỏ việc gán cứng `STOCK_WHEN_PURCHASABLE = 99`. Giới hạn số lượng tối đa trên ô chọn số lượng (`QuantityStepper`) ở mức hợp lý (ví dụ: tối đa 20 bánh/loại cho đơn lẻ).
* Khi gọi `POST /api/checkout` nếu Backend trả về mã lỗi `409 Conflict` (do hết tồn kho hoặc quá công suất lò nướng): Hiển thị Modal/Toast thân thiện thông báo rõ sản phẩm/biến thể nào bị thiếu hàng.

### Nhiệm vụ 2: Bổ sung Guest Guard cho các trang Auth
* Trong [`fe/src/routes/index.tsx`](file:///d:/GitHub/trungthu/fe/src/routes/index.tsx):
  * Tạo hoặc áp dụng Guard cho các trang `/login`, `/register`, `/forgot-password`.
  * Nếu người dùng đã đăng nhập (`user !== null`), tự động chuyển hướng họ về trang chủ `/` (hoặc `/seller` nếu mang vai trò `PROVIDER`), không cho phép xem lại form đăng nhập.

### Nhiệm vụ 3: Tự động Redirect khi Session / Token hết hạn
* Trong [`fe/src/apis/http.ts`](file:///d:/GitHub/trungthu/fe/src/apis/http.ts):
  * Tại Axios Interceptor: Nếu gọi làm mới token `/api/auth/refresh` thất bại (HTTP 401), tự động gọi hàm `useAuthStore.getState().logout()` và chuyển hướng người dùng về trang `/login?next=...` kèm thông báo *"Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại"*.

### Nhiệm vụ 4: Dọn dẹp Mock Data cũ
* Loại bỏ các đoạn code mock không sử dụng trong [`fe/src/apis/mock.ts`](file:///d:/GitHub/trungthu/fe/src/apis/mock.ts), [`mockData.ts`](file:///d:/GitHub/trungthu/fe/src/apis/mockData.ts) và `orderService.ts` để tối ưu dung lượng gói bundle khi build.

---

## PHẦN 3. TÀI LIỆU THAM KHẢO: 4 HIỆU ỨNG ANIMATION NÊN ĐƯA SANG TRANG CHỦ (/)

Dưới đây là 4 hiệu ứng animation được đúc kết từ concept thiết kế, đề xuất đưa vào trang chủ (`/`) để nâng cao trải nghiệm thị giác và sự chuyên nghiệp của nền tảng:

### 1. Thanh tiến trình cuộn trang với hiệu ứng lò xo (Spring Scroll Progress)
* **Hiện diện ở concept:** Đường line 3px chạy ở đỉnh màn hình, di chuyển theo độ cuộn của người đọc.
* **Kỹ thuật:** Kết hợp `useScroll()` và `useSpring(scrollYProgress, { stiffness: 90, damping: 30 })` giúp thanh cuộn lướt êm, không bị giật khấc.
* **Ứng dụng cho trang /:** Đặt ngay dưới Navbar chính hoặc ở mép trên cùng trình duyệt với màu xanh di sản (`heritage-green`), tạo cảm giác trang web hiện đại và chỉn chu.

### 2. Hiệu ứng trồi mượt khi cuộn tới (Reveal / Fade-in-up)
* **Hiện diện ở concept:** Component `Reveal` bọc ngoài các tiêu đề và thẻ nội dung.
  * Chỉ kích hoạt 1 lần khi cuộn tới (`viewport: { once: true, amount: 0.18 }`).
  * Sử dụng đường cong gia tốc cao cấp: `ease: [0.22, 1, 0.36, 1]`.
* **Ứng dụng cho trang /:**
  * Áp dụng cho các thẻ trong `HeritageMethodologySection` (4 bước học di sản) xuất hiện so le (`delay: index * 0.15s`).
  * Áp dụng cho các gói bảng giá trong `LandingPlansSection` (Free, Pro, Master).

### 3. Stagger Entrance cho phần Hero Banner
* **Hiện diện ở concept:** Khi vừa vào trang, badge xuất hiện trước -> tiêu đề trồi lên (`y: 42 -> 0`) -> mô tả -> 2 nút CTA -> ảnh bìa zoom nhẹ từ `0.96` lên `1`.
* **Ứng dụng cho trang /:** `LandingHeroBanner.tsx` hiện đang hiển thị ngay lập tức không có hiệu ứng. Đưa stagger này vào sẽ tăng ấn tượng ban đầu (first impression) cho người dùng mới.

### 4. Image Micro-interactions & Card Lift
* **Hiện diện ở concept:** Khi hover vào các card câu chuyện, ảnh bên trong phóng to nhẹ nhàng (`scale: 1.055`) kèm hiệu ứng đẩy nhẹ nút mũi tên và đổ bóng màu thương hiệu.
* **Ứng dụng cho trang /:** Áp dụng cho các card bài viết trong `CoverflowArticlesSection` hoặc các điểm di sản trên bản đồ.

---

## BẢNG THEO DÕI TIẾN ĐỘ THỰC HIỆN

| Thành viên | Hạng mục công việc | Mức độ ưu tiên | Trạng thái |
| :--- | :--- | :---: | :---: |
| **Thạch (FE2)** | Xây dựng màn hình & In phiếu nướng bánh (`bake-sheet`) | **Cao nhất (P1)** | Hoàn thành; đã kiểm thử tích hợp API thật trên H2 |
| **Thạch (FE2)** | Dọn dẹp các nút Set quà ngoài scope trong `BakeBatchPage` | **Cao (P2)** | Chưa bắt đầu |
| **Thạch (FE2)** | Hoàn thiện luồng KYC & Gói SaaS (Banner, Modal duyệt) | **Trung bình (P3)** | Chưa bắt đầu |
| **Thạch (FE2)** | Xóa raw emoji trong `Header.tsx` | **Trung bình (P4)** | Chưa bắt đầu |
| **Tuấn (FE1)** | Xử lý lỗi tồn kho Checkout (bỏ hardcode 99) | **Cao (P1)** | Chưa bắt đầu |
| **Tuấn (FE1)** | Thêm Guest Guard cho trang Auth (`/login`, `/register`) | **Trung bình (P2)** | Chưa bắt đầu |
| **Tuấn (FE1)** | Xử lý Session Timeout chuyển hướng tại `http.ts` | **Trung bình (P3)** | Chưa bắt đầu |
| **Tuấn (FE1)** | Dọn dẹp các hàm Mock cũ trong `apis/` | **Thấp (P4)** | Chưa bắt đầu |
| **Tuấn (FE1)** | Tích hợp 4 hiệu ứng Animation trang chủ (Phần 3) | **Mở rộng (P4)** | Tham khảo |
