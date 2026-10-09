# 📜 Business Rule: BR-04 - Dashboard Quản Lý Lịch Sản Xuất & Lịch Âm/Dương (Admin Production & Lunar/Solar Calendar Management)

## 1. Goal (Mục tiêu)
Cung cấp cho **Chủ cửa hàng / Quản lý trang (Admin & Store Manager)** công cụ quản lý toàn bộ đơn hàng và lịch ra lò bánh tươi được thể hiện trực quan theo cả **Ngày Âm Lịch** và **Ngày Dương Lịch**, tự động tổng hợp số lượng từng vị bánh cần sản xuất mỗi ngày và thiết lập hạn ngạch nhận đơn của xưởng.

---

## 2. Core Rules (Quy tắc nghiệp vụ cốt lõi)

### 2.1. Quyền Quản Lý & Vận Hành (Seller Access Control)
- **Bên Bán (Seller / Biz Manager)**:
  - Trực tiếp quản lý Dashboard Lịch Sản Xuất Song Lịch Âm/Dương, xem toàn bộ chi tiết đơn hàng (người mua, vị bánh chọn, ghi chú customize in hộp & lịch giao hàng tươi).
  - Cập nhật trạng thái đơn hàng (`PENDING_DEPOSIT` -> `DEPOSITED` -> `BAKING_QUEUED` -> `DELIVERING` -> `COMPLETED`).
  - Đặt Hạn ngạch nướng bánh theo ngày (Capacity Cap) và xuất/in **Phiếu Ra Lò Bánh Tươi (Daily Production Sheet)** cho xưởng sản xuất của mình.
- **Chủ Trang Web Trung Gian (Platform Admin)**:
  - Đã có quyền quản lý cao nhất để giám sát toàn bộ hoạt động giao dịch và tài khoản Bên Bán trên nền tảng.

### 2.2. Hiển Thị Lịch Song Song Dương / Âm Lịch (Solar-First Calendar & Lunar View)
- **Quy tắc Kỹ thuật (Solar-First Core)**: Toàn bộ hệ thống Backend, CSDL, API, Hạn ngạch xưởng (`Capacity Cap`) và Ngày giao bánh hoạt động **100% theo Ngày Dương Lịch chuẩn (`YYYY-MM-DD`)**.
- **Hiển Thị Lịch Âm Tham Khảo (View-only Helper)**:
  - Lịch Âm không tham gia vào logic tính toán hay ràng buộc dữ liệu.
  - Giao diện Admin và DatePicker phía Khách hàng chỉ hiển thị kèm nhãn xâu ký tự tham khảo: `[Ngày Dương Lịch] (Tham khảo: [Ngày Âm Lịch])` - Ví dụ: `25/09/2026 (Tham khảo: 15/08 Âm Lịch)`.
  - Triệt tiêu 100% độ phức tạp của năm Nhuận Âm Lịch hay xung đột hạn ngạch theo Âm Lịch.

### 2.3. Tự Động Gom Đơn & Xuất Kế Hoạch Sản Xuất (Order Aggregation & Daily Production Sheet)
- Khi chọn một ngày bất kỳ trên Lịch Admin (VD: Ngày 12/08 Âm lịch):
  - Hệ thống tự động gom tất cả đơn B2C có ngày nhận = 12/08 Âm lịch và các đợt giao B2B trong ngày 12/08 Âm lịch.
  - Tổng hợp ra **Bản Kế Hoạch Ra Lò (Daily Bake Matrix)**:
    $$\text{Tổng Bánh Nướng Thập Cẩm} = \sum (\text{Bánh lẻ}) + \sum (\text{Bánh trong Hộp quà B2C}) + \sum (\text{Đợt giao B2B})$$
  - Xuất file In (`Print Production Ticket`) cho thợ làm bánh.

### 2.4. Quản Lý Hạn Ngạch Sản Xuất Tối Đa (Daily Production Capacity Cap)
- Chủ cửa hàng có thể cài đặt **Số lượng bánh tối đa xưởng có thể nướng trong 1 ngày** (Capacity Cap - Ví dụ: Tối đa 500 bánh/ngày).
- Nếu tổng số bánh từ các đơn hàng đăng ký vào ngày đó đạt đến $100\%$ Hạn ngạch:
  - Ngày đó trên lịch B2C/B2B phía khách hàng sẽ tự động chuyển sang trạng thái **"FULL - Ngừng nhận đơn ra lò ngày này"** (Kích hoạt khóa ngày).

### 2.5. Phạm Vi Giao Hàng & Phí Vận Chuyển (Shipping Fee Rule Update)
- **Out of Scope (Không thực hiện)**: Không xây dựng ứng dụng Shipper, không định vị GPS lộ trình giao hàng thời gian thực.
- **In Scope (Thực hiện)**:
  - Cấu hình bảng phí vận chuyển cố định hoặc theo Quận/Huyện/Tỉnh Thành khi Khách hàng Checkout.
  - Hiển thị Phí vận chuyển là một dòng phí riêng biệt trên hóa đơn đơn hàng.

### 2.6. Công Tắc Bật / Tạm Ngừng Mùa Vụ Thủ Công (Seller Manual Seasonal Toggle)
- **Quy tắc không khóa tự động từ hệ thống**: Hệ thống **KHÔNG tự động khóa gian hàng** khi hết ngày mùa vụ. Việc đóng/mở gian hàng hoàn toàn do Bên Bán tự quyết định dựa trên tiến độ thực tế của xưởng.
- **Công tắc điều khiển trong Admin của Bên Bán**:
  - Bên Bán được cung cấp nút công tắc `[ Bật / Tạm Ngừng Nhận Đơn Mùa Vụ ]` (`is_active` / `season_status`).
  - Khi Bên Bán gạt sang trạng thái `Tạm Ngừng`: Nút đặt hàng trên giao diện Người Mua chuyển sang trạng thái `[ Tạm Ngừng Nhận Đơn Mùa Vụ ]` và hiển thị Form đăng ký nhận thông báo cho mùa sau.

---

## 3. Data Flow (Luồng dữ liệu Admin Calendar)

```
[Đơn B2C / Đợt Giao B2B]
    │
    ▼ Lưu Lịch Nhận (Expected Date in Solar & Lunar)
[Hệ Thống Gom Đơn - Aggregator]
    │
    ├─► Quy đổi Ngày Dương ◄► Ngày Âm (Lib: LunarCalendar)
    ├─► Cộng dồn Số lượng theo từng Vị Bánh
    │
    ▼
[Admin Dashboard - Lịch Song Lịch] ◄─── Access Granted ─── [Chủ Cửa Hàng / Quản Lý Trang]
    │
    ├─► Xem Lịch Tháng Âm Lịch (VD: Tháng 8 Âm)
    ├─► Chi tiết Đơn hàng & Nội dung Customize
    ├─► Xuất Phiếu Nướng Bánh cho Xưởng
    └─► Điều chỉnh Hạn ngạch (Capacity Cap)
```

---

## 4. Non-goals (Phạm vi không thực hiện trong BR này)
- Không kết nối API trực tiếp với thiết bị lò nướng thông minh (IoT).
- Không tự động thay đổi lịch nghỉ của nhân viên xưởng.
