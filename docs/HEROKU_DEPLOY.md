# Deploy backend lên Heroku

Backend nằm trong `be/`, nên Heroku Git phải nhận riêng nội dung thư mục này.

## Chạy BE và PostgreSQL local

Từ gốc repo:

```powershell
Copy-Item .env.example .env
docker compose up --build -d
docker compose logs -f be
```

BE nghe ở `http://localhost:8080` (đổi bằng `BE_PORT` trong `.env`); PostgreSQL nghe ở `localhost:5433` (user/database `trungthu`, mật khẩu trong `.env`). Khi đổi `POSTGRES_PASSWORD` sau lần khởi tạo đầu, xóa volume hoặc đổi mật khẩu trong DB trước; Compose không tự đổi mật khẩu của volume đã có. Dừng bằng `docker compose down`. Lệnh `docker compose down -v` xóa cả dữ liệu DB local.

Compose bật demo seed để thử UI. Những tài khoản demo này dùng mật khẩu cố định, chỉ dành cho local.

## Chuẩn bị Heroku

1. Tạo Heroku app và gắn `heroku-postgresql:essential-0` (có phí).
2. Cấu hình `SPRING_PROFILES_ACTIVE=postgres,heroku`. Java buildpack sẽ cấp `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME` và `SPRING_DATASOURCE_PASSWORD` từ add-on Postgres.
3. Cấu hình các biến dưới đây trong Heroku Dashboard > Settings > Config Vars. Không commit giá trị thật.

| Biến | Giá trị cần đặt |
| --- | --- |
| `JWT_SECRET` | Base64 của khóa ngẫu nhiên ít nhất 32 byte. Thay khóa cũ đã từng lưu trong Git. |
| `APP_CORS_ALLOWED_ORIGINS` | Origin FE chính xác, ví dụ `https://shop.example.com`, không có dấu `/` cuối. |
| `APP_STORAGE_BASE_URL` | URL dự kiến cho upload local, ví dụ `https://TEN_APP.herokuapp.com/uploads`. Chức năng tải file cần được hoàn thiện riêng. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | OAuth client của môi trường production. |
| `MAIL_USERNAME`, `MAIL_PASSWORD` | Tài khoản và app password SMTP. |

Profile `heroku` tắt toàn bộ demo seed (bao gồm tài khoản admin với mật khẩu cố định) và bật cookie `Secure; SameSite=None`. Nếu đây là app demo khép kín, có thể đặt `APP_DEMO_SEED=true` để có dữ liệu mẫu; các tài khoản mẫu dùng mật khẩu cố định, nên không bật trên app công khai. Cần tạo admin production bằng quy trình riêng nếu không dùng seed.

Upload hiện lưu trên filesystem của dyno. File sẽ mất sau khi dyno restart/redeploy và hiện chưa có endpoint phục vụ `/uploads/**`. Bản demo có thể kiểm thử thao tác upload, nhưng không dựa vào liên kết file trả về để xem lâu dài.

FE có thể đặt `VITE_API_BASE_URL=https://TEN_APP.herokuapp.com/api` lúc build nếu chạy khác origin. Cách ổn định hơn cho cookie là proxy `/api` từ cùng domain FE sang BE. Khi dùng khác origin, đặt đúng CORS origin và kiểm tra chính sách cookie của trình duyệt. Cấu hình domain FE trong Google OAuth Authorized JavaScript origins.

## Deploy

Sau khi commit các thay đổi cần deploy, từ gốc repo:

```powershell
heroku login
heroku create TEN_APP
heroku addons:create heroku-postgresql:essential-0 -a TEN_APP
heroku config:set SPRING_PROFILES_ACTIVE=postgres,heroku -a TEN_APP
heroku git:remote -a TEN_APP
git subtree push --prefix be heroku main
heroku logs --tail -a TEN_APP
```

Heroku tự chọn Java 21 từ `be/system.properties` và chạy Spring Boot trên cổng `$PORT`. Lệnh `git subtree push` chỉ lấy dữ liệu đã commit. Không đặt profile `h2` trên Heroku. Hiện schema được Hibernate cập nhật bằng `ddl-auto=update`; trước khi phục vụ dữ liệu thật, nên thay bằng migration có phiên bản và kiểm tra luồng chuyển dữ liệu SQL Server sang PostgreSQL.
