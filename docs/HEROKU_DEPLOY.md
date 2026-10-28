# Deploy backend lên Heroku

Backend nằm trong `be/`. Repo có Maven aggregator `pom.xml`, `Procfile` và `system.properties` ở root để Heroku nhận diện Java khi deploy trực tiếp từ GitHub. Aggregator chỉ build module `be/`.

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

FE trên `https://trungthu-psi.vercel.app` dùng Vercel rewrite để proxy `/api/*` tới `https://be-trungthu-08d5dbfd847a.herokuapp.com/api/*`. Nếu Vercel Project Settings > Root Directory là `fe`, Vercel đọc `fe/vercel.json`; nếu là gốc repo, Vercel đọc `vercel.json` ở gốc. API client luôn gọi `/api` trên domain FE; xóa biến Vercel `VITE_API_BASE_URL` cũ nếu nó đang trỏ thẳng đến Heroku, rồi redeploy FE. Kiểm tra `https://trungthu-psi.vercel.app/api/products` trả JSON và Google Login gửi POST đến `https://trungthu-psi.vercel.app/api/auth/google`. Rewrite giữ API cùng origin với FE để cookie đăng nhập được gửi qua proxy. Không đặt `APP_COOKIE_DOMAIN` thành domain Heroku; để trống. Nếu dùng Google Login, đặt `VITE_GOOGLE_CLIENT_ID` trên Vercel và thêm `https://trungthu-psi.vercel.app` vào Google Authorized JavaScript origins.

Để dùng PostgreSQL trên Heroku, kiểm tra add-on Heroku Postgres đã gắn với BE và `DATABASE_URL` tồn tại trong Config Vars. Đặt `SPRING_PROFILES_ACTIVE=postgres,heroku` trong Config Vars trước khi redeploy BE. Java buildpack tự cung cấp `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` từ add-on. Không dùng `DATABASE_URL` (dạng `postgres://`) trực tiếp làm `spring.datasource.url` vì JDBC cần dạng `jdbc:postgresql://`. Có thể kiểm tra tại Heroku Dashboard > Resources/Settings và logs khởi động: datasource phải là PostgreSQL, không phải H2. Nếu chưa có add-on, tạo `heroku-postgresql:essential-0` (có phí). Nếu cần dữ liệu mẫu trên app demo khép kín, đặt `APP_DEMO_SEED=true` rồi redeploy; không dùng cho app công khai do mật khẩu demo cố định.

## Deploy qua Heroku GitHub Integration

Trong Heroku Dashboard > Deploy, chọn GitHub, kết nối repo này và chọn nhánh `master`. Sau khi commit và push thay đổi lên GitHub, chọn **Deploy Branch** hoặc bật Automatic Deploys. Heroku sẽ thấy `pom.xml` ở root, build JAR trong `be/target/` và chạy lệnh trong root `Procfile`.

## Deploy qua Heroku Git (cách khác)

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

Với GitHub Integration, Heroku đọc `system.properties` và `Procfile` ở root. Với `git subtree push`, Heroku đọc các file tương ứng trong `be/`. Lệnh `git subtree push` chỉ lấy dữ liệu đã commit. Không đặt profile `h2` trên Heroku. Hiện schema được Hibernate cập nhật bằng `ddl-auto=update`; trước khi phục vụ dữ liệu thật, nên thay bằng migration có phiên bản và kiểm tra luồng chuyển dữ liệu SQL Server sang PostgreSQL.
