# Cấu hình thanh toán gói seller

1. Tạo kênh thanh toán payOS liên kết tài khoản nhận phí của sàn.
2. Đặt `PAYOS_CLIENT_ID`, `PAYOS_API_KEY` và `PAYOS_CHECKSUM_KEY` ở môi trường backend. Đặt `PAYOS_SUBSCRIPTION_RETURN_URL` thành URL đầy đủ của trang `/seller/subscription` trên frontend.
3. Khởi động backend và để Flyway áp dụng migration trên PostgreSQL. Trong cấu hình kênh payOS, đăng ký webhook HTTPS công khai tại `<backend-origin>/api/webhooks/payos/subscriptions`.
4. Kiểm tra luồng với kênh payOS đã kết nối. Khi seller quét mã, gói tự cập nhật sau webhook. Nút **Kiểm tra thanh toán** đối chiếu trực tiếp với payOS nếu webhook đến chậm.

Phiên payOS có thời hạn tối đa 30 phút. Với khoản sai số tiền hoặc nằm ngoài kỳ, admin dùng mã `PAYOS-…` trên màn hình quản trị để tra soát với payOS. Xử lý hoàn tiền nằm trong quy trình đối soát của sàn.

[Tài liệu payOS về API và webhook](https://payos.vn/docs/api/)
