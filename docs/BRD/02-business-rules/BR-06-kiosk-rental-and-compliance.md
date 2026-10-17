# 📜 Business Rule: BR-06 - Đăng Ký Gói Dịch Vụ SaaS Provider & Quản Lý Hồ Sơ Pháp Lý (Provider SaaS Subscription & Compliance - Streamlined MVP)

> Cập nhật 2026-10-16: SaaS được tinh gọn thành nạp phí/kích hoạt quyền bán theo bảng phân việc. [BE1](../04-agent-and-dev-guidelines/backend-ownership-and-order-contract.md) sở hữu nghiệp vụ và ProviderPolicy; BE4 phối hợp schema giao dịch dùng chung.

## 1. Goal (Mục tiêu)
Quy định chi tiết mô hình kinh doanh **Pure Provider SaaS Model**: các gói dịch vụ SaaS đăng ký cho Provider/Nhà sản xuất, thời hạn hiển thị, phân quyền niêm yết SKU, và quy trình kiểm duyệt bắt buộc đối với Hồ sơ Pháp lý Cửa hàng (Giấy chứng nhận ATTP, Giấy phép ĐKKD, Định danh KYC) theo phạm vi tinh gọn cho nhóm 6 người trong 4 tuần.

---

## 2. Core Rules (Quy tắc nghiệp vụ cốt lõi)

### 2.1. Nạp phí kích hoạt quyền bán SaaS
- Provider chuyển khoản phí tới tài khoản sàn; đây là nạp phí dịch vụ, không phải ví có số dư/nạp/rút.
- BE1 cấu hình mức phí, thời hạn, giới hạn SKU trong quyền bán. MVP không bắt buộc xây hai hạng STANDARD/VIP hay quyền quảng cáo.
- Ghi Subscription PENDING_PAYMENT và giao dịch SUBSCRIPTION_FEE/PENDING, nội dung SUB-[SellerId]. Admin đối soát thực nhận rồi chuyển giao dịch SUCCESS và Subscription ACTIVE trong cùng transaction, có phân quyền và chống xác nhận lặp.
- Không dùng webhook. BE1 quyết định đủ điều kiện bán qua ProviderPolicy (KYC, quyền bán ACTIVE, trạng thái tài khoản/công tắc nhận đơn); BE3 kiểm tra lại khi Checkout.
- BE4 quản lý mapping/repository PaymentTransaction dùng chung; xác nhận kích hoạt SaaS thuộc BE1, không đưa vào Order lifecycle BE3.

### 2.2. Quy tắc Kiểm Duyệt Hồ Sơ Pháp Lý & An Toàn Thực Phẩm (Compliance & Food Safety Verification)
- **Danh Mục Tài Liệu Bắt Buộc (`store_compliance_docs`)**:
  - Provider tải lên hồ sơ pháp lý qua 1 form upload chung (chấp nhận `.pdf`, `.png`, `.jpg` $\le 10\text{MB}$) bao gồm Giấy chứng nhận ATTP và Giấy phép ĐKKD/CCCD.
- **Luồng Duyệt Hồ Sơ Của Admin**:
  - Khi Provider nộp file, trạng thái tài liệu là `PENDING`.
  - Platform Admin rà soát và chuyển sang `APPROVED` hoặc `REJECTED` (kèm `rejection_reason`).
  - Khi tài liệu được `APPROVED`, hệ thống cập nhật `users.is_compliance_approved = true`.

### 2.3. Quy tắc Tạm Ngừng & Khóa Quyền Mở Bán (Auto-Suspension & Safeguard Rules)
- **Chặn Mở Bán Khi Thiếu Compliance (MVP Scope)**:
  - Provider chưa được duyệt `is_compliance_approved = true` hoặc chưa có gói SaaS `ACTIVE` **bị chặn tuyệt đối quyền xuất bản sản phẩm ra ngoài sàn và không nhận được B2B RFQ**.
- **Tự Động Tạm Ngừng Khi Hết Hạn (Phase 2 Scope)**:
  - Tiến trình nền tự động rà soát hàng ngày: nếu Giấy ATTP hoặc Gói SaaS chạm mốc hết hạn (`expiry_date < CURRENT_DATE` hoặc `end_date < CURRENT_DATE`), hệ thống chuyển trạng thái sang `SUSPENDED` (Dời sang Phase 2).

---

## 3. Data Flow (Luồng dữ liệu)

```
[Provider Đăng Ký Tài Khoản]
    │
    ├─► 1. Tải lên Hồ sơ Pháp lý (Form upload KYC chung) ──► Admin duyệt (is_compliance_approved = true)
    │
    ├─► 2. Nạp phí kích hoạt quyền bán theo cấu hình BE1
    │
    ▼
[Chuyển Khoản Phí SaaS Cho Admin Sàn]
    │
    ├─► Provider chuyển khoản với cú pháp SUB-[SellerId]
    ├─► Platform Admin đối soát sao kê và bấm "Xác Nhận Kích Hoạt Gói"
    │
    ▼
[Kích Hoạt Gói SaaS (Status = ACTIVE)]
    │
    ├─► Niêm yết danh mục Product & ProductVariant
    ├─► Bật tính năng nhận đơn B2C & Tiếp nhận B2B RFQ
    │
    ▼
[Vận Hành Gian Hàng]
    └─► Điều khiển nhận đơn qua công tắc thủ công: users.is_season_active (true/false)
```

---

## 4. Non-goals (Phạm vi không thực hiện trong BR này)
- Không miễn phí gói dịch vụ SaaS cho bất kỳ thương hiệu nào (100% Provider phải đăng ký gói hợp lệ).
- Không tự động gia hạn gói SaaS (Provider chủ động bấm gia hạn và thanh toán).
- Không xây phân hạng quảng cáo STANDARD/VIP/EXCLUSIVE_POPUP hoặc ví số dư trong MVP.
