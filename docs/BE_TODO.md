# Kế Hoạch Phân Chia Công Việc Backend (BE_TODO)

> **Cập nhật:** 2026-11-02  
> **Phân công thành viên:**  
> - **BE1 – Tiến:** Auth JWT, KYC Compliance, SaaS Subscription & Storage.  
> - **BE2 – Đạt:** Catalog Sản phẩm/Biến thể, Quản lý Tồn kho & Năng lực sản xuất lò nướng (`DailyCapacity`).  
> - **BE3 – Phát:** Checkout Transaction, Order Lifecycle, VietQR, Cron Job & RFQ B2B.  
> - **BE4 – Luân:** Data Layer Đơn hàng, View `v_bake_lines`, API Phiếu nướng bánh (`bake-sheet`), Chuẩn hóa `@PreAuthorize`.  
> *(Lưu ý: Tuyệt đối không commit lên Git khi chưa có yêu cầu).*

---

## 1. BE4 – LUÂN: ĐƠN HÀNG, VIEW NƯỚNG & API PHIẾU RA LÒ (TRỌNG TÂM TRIỂN KHAI)

### Nhiệm vụ 1: Viết API "Phiếu ra lò" (`GET /api/provider/bake-sheet`) — [ĐÃ HOÀN THÀNH]
* **Bối cảnh:** Luân đã trực tiếp tạo database view `v_bake_lines`, file khởi tạo `BakeViewInitializer` và viết test `BakeLinesViewTests`. Để đẩy nhanh tiến độ và không cần phụ thuộc Đạt, **Luân đã trực tiếp hoàn thành viết endpoint này** cho Frontend (Thạch) tích hợp tính năng in phiếu nướng.
* **Đã triển khai:**
  1. Thêm endpoint trực tiếp vào `OrderController.java`:
     ```java
     @GetMapping("/api/provider/bake-sheet")
     @PreAuthorize("hasRole('PROVIDER')")
     public ResponseEntity<ApiResponseDTO<List<BakeSheetResponse>>> getBakeSheet(
             @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date)
     ```
  2. Truy vấn trực tiếp từ view `v_bake_lines` theo `provider_id` của Seller hiện tại và `delivery_date = date.plusDays(1)` (ngày nướng = ngày giao - 1).
  3. Trả về DTO `BakeSheetResponse`: `variantId`, `productName`, `variantName`, `bakeQuantity`, `orderCodes` (danh sách các mã đơn hàng có bánh cần nướng).
  4. Viết integration test trong `OrderApiTests` bảo đảm trả đúng mã `200 OK` cho Provider, `403 Forbidden` cho Buyer/Admin, `401 Unauthorized` cho khách chưa đăng nhập, `400 Bad Request` cho date không hợp lệ, gom nhóm đúng biến thể và tổng số bánh: **30/30 PASS [OK]**.

### Nhiệm vụ 2: Duy trì chuẩn hóa `@PreAuthorize` của Order — [ĐÃ HOÀN THÀNH]
* Đã gộp `ProviderOrderController` vào duy nhất `OrderController.java`.
* Đã chuyển toàn bộ phân quyền sang `@PreAuthorize` ở Controller và Service Interface, loại bỏ hoàn toàn code kiểm tra role thủ công trong `OrderServiceImpl`.
* Đã kiểm thử `OrderApiTests`: **30/30 PASS [OK]**.

---

---

## 2. BE2 – ĐẠT: CATALOG, TỒN KHO & DỌN DẸP CODE OVER-ENGINEERING

### Nhiệm vụ 1: Xóa Dead Code `DummyPaymentController.java` — [P1 - DỌN DẸP]
* Các route `/api/dummy/checkout`, `/orders/{id}/pay`, `/cancel`, `/advance` đã hết giá trị sử dụng vì BE3 đã có Checkout thật và VietQR thật. **Xóa dứt điểm file này**.

### Nhiệm vụ 2: Đóng/Dời sang Phase 2 cụm Set quà động 2 tầng kho & Sổ kho over-engineering — [P2]
* **Set quà động:** Tạm thời đóng các route `/composition`, `/stock`, `/release`. MVP chỉ bán Bánh lẻ và Hộp quà cố định đóng sẵn với số tồn đơn giản `stock_quantity`.
* **Sổ kho kép & Thác nước:** Lược bỏ các API over-engineering không có trong SRS MVP: `/variants/{id}/stats`, `/order-stats`, `/audits`, `/adjustments`, `/terminate`, `/discontinue`.

### Nhiệm vụ 3: Duy trì kênh WebSocket `/ws/stock` — [P3]
* Giữ nguyên `StockWebSocketConfig`, `StockWebSocketHandler`, và `StockBroadcastListener` để sẵn sàng phát tín hiệu biến động tồn kho khi có sự kiện `StockChangedEvent`.

---

---

## 3. BE1 – TIẾN: AUTH, KYC COMPLIANCE & SAAS SUBSCRIPTION

### Nhiệm vụ 1: Lược bỏ 9 Route trùng lặp & Dư thừa — [P2]
Tiến cần rà soát các Controller của mình và xóa bỏ các route thừa sau để làm gọn Swagger:
1. `AuthController`: Xóa `POST /api/auth/provider` (đã có `/login` và `/google`).
2. `ProviderComplianceController`: Xóa `GET /api/provider/compliance/status` (thừa vì `/auth/me` đã trả cờ `isComplianceApproved`).
3. `AdminComplianceController`:
   * Xóa `GET /api/admin/compliance/pending` (trùng với `.../status/PENDING`).
   * Xóa `PUT /api/admin/compliance/{docId}/review` (trùng với 2 API rõ ràng `approve` và `reject`).
4. `AdminSubscriptionController`:
   * Xóa `GET /api/admin/subscriptions/pending` (trùng với `.../status/PENDING_PAYMENT`).
   * Xóa `PUT /api/admin/subscriptions/{id}/cancel` (Admin không tự hủy gói thay Seller trên UI).
   * Chuyển `PUT /api/admin/subscriptions/{id}/expire` sang Phase 2 (quét hết hạn tự động).
5. `ProviderSubscriptionController`:
   * Xóa `GET /api/provider/subscriptions/active` và `.../status` (FE tự lọc từ danh sách gói).

### Nhiệm vụ 2: Chuẩn hóa Phân quyền `@PreAuthorize` — [P2]
* Áp dụng quy chuẩn theo file [`docs/TODO.md`](file:///d:/GitHub/trungthu/docs/TODO.md):
  * Dùng `@PreAuthorize("hasRole('PROVIDER')")` cho các API nộp hồ sơ KYC, xem gói SaaS.
  * Dùng `@PreAuthorize("hasRole('PLATFORM_ADMIN')")` cho các API duyệt hồ sơ, kích hoạt gói.
  * Trong Service (`ComplianceServiceImpl`, `SubscriptionServiceImpl`): Bỏ các đoạn code kiểm tra `role` thủ công, chỉ giữ hàm lấy User hiện tại và kiểm tra `status == ACTIVE`.

---

---

## 4. BE3 – PHÁT: CHECKOUT TRANSACTION, LIFECYCLE & RFQ B2B

### Nhiệm vụ 1: Tối ưu phản hồi lỗi Xung đột tài nguyên (409 Conflict) — [P3]
* Luồng Checkout (`POST /api/checkout`) và Vòng đời đơn hàng hiện tại đã đạt 100% scope.
* **Yêu cầu cải thiện:** Khi reserve tồn kho thất bại hoặc hết công suất lò nướng (`DailyCapacity`), trả về mã `409 CONFLICT` kèm JSON chi tiết:
  ```json
  {
    "status": 409,
    "message": "Sản phẩm Bánh Thập Cẩm Đậu Xanh chỉ còn 5 cái, không đủ số lượng yêu cầu.",
    "data": { "variantId": "...", "availableStock": 5 }
  }
  ```
  Giúp Frontend của Tuấn (FE1) hiển thị thông báo rõ ràng cho khách hàng.

### Nhiệm vụ 2: Kiểm tra Cron Job hủy đơn quá hạn cọc (Hold Timer) — [P3]
* Đảm bảo Scheduled Task quét các đơn `PENDING_DEPOSIT` quá 15 phút (hoặc sau khi gia hạn hold) chạy nền mỗi phút một lần, tự động chuyển đơn sang `CANCELLED` và gọi `InventoryService.releaseStock()` hoàn kho đúng 1 lần duy nhất.

---

## BẢNG THEO DÕI TIẾN ĐỘ BACKEND

| Thành viên | Hạng mục công việc | Mức độ ưu tiên | Trạng thái |
| :--- | :--- | :---: | :---: |
| **BE4 (Luân)** | Viết API Phiếu ra lò `GET /api/provider/bake-sheet` | **P1 (Khẩn cấp)** | **Hoàn thành [OK]** |
| **BE4 (Luân)** | Chuẩn hóa `@PreAuthorize` module Order | **P1** | **Hoàn thành [OK]** |
| **BE2 (Đạt)** | Xóa `DummyPaymentController.java` | **P1 (Dọn dẹp)** | Chưa bắt đầu |
| **BE2 (Đạt)** | Tạm ẩn/đóng API Set quà động & Sổ kho over-engineering | **P2** | Chưa bắt đầu |
| **BE1 (Tiến)** | Xóa 9 route trùng lặp ở Auth, KYC, SaaS | **P2** | Chưa bắt đầu |
| **BE1 (Tiến)** | Chuẩn hóa `@PreAuthorize` tại Controller & Service | **P2** | Chưa bắt đầu |
| **BE3 (Phát)** | Chuẩn hóa body lỗi 409 khi hết kho/slot cho FE | **P3** | Chưa bắt đầu |
| **BE3 (Phát)** | Giám sát Cron Job quét hold timer đơn hàng | **P3** | Đang hoạt động |
