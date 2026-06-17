# Bài tập về nhà buổi 65

Dự án này hoàn thành các yêu cầu chính của bài tập Redis caching, JWT blacklist và Dockerfile multi-stage cho frontend.

## 1. Tích hợp Redis vào Docker Compose

- File: `docker-compose.yml`
- Service Redis: `app-redis`
- Image: `redis:7-alpine`
- Backend phụ thuộc Redis bằng `depends_on`
- Backend kết nối Redis qua biến môi trường:

```env
REDIS_URL=redis://app-redis:6379
```

- File cấu hình Redis: `backend/src/lib/redis.js`
- Thư viện Redis trong backend: `redis`

## 2. Cache API đọc danh sách

- API: `GET /products`
- File: `backend/src/routes/products.js`
- Cache key: `products:getAll`
- Luồng xử lý:
  - Đọc cache bằng `redisClient.get("products:getAll")`
  - Nếu cache hit thì `JSON.parse` và trả về ngay với `source: "redis"`
  - Nếu cache miss thì đọc từ data store
  - Sau khi đọc data store, ghi cache bằng `redisClient.set(..., { EX: 60 })`

## 3. Cache API đọc chi tiết

- API: `GET /products/:id`
- File: `backend/src/routes/products.js`
- Cache key theo từng ID: `products:getOne:<id>`
- Mỗi product có cache riêng, tránh việc đọc ID nào cũng trả về cùng một dữ liệu.
- Cache có TTL 60 giây bằng tham số `EX`.

## 4. Xóa cache khi dữ liệu thay đổi

- API tạo mới: `POST /products`
  - Xóa cache danh sách: `products:getAll`
- API cập nhật: `PUT /products/:id`
  - Xóa cache danh sách: `products:getAll`
  - Xóa cache chi tiết: `products:getOne:<id>`
- API xóa: `DELETE /products/:id`
  - Xóa cache danh sách: `products:getAll`
  - Xóa cache chi tiết: `products:getOne:<id>`

## 5. Redis JWT token blacklist

- Đăng nhập: `POST /auth/login`
- Đăng xuất: `POST /auth/logout`
- Middleware xác thực: `backend/src/middlewares/auth.js`
- Khi logout, token được lưu vào Redis theo key:

```txt
blacklist:<token>
```

- TTL của blacklist bằng thời gian sống còn lại của JWT:

```js
redisClient.set(`blacklist:${token}`, "1", { EX: ttl });
```

- Khi request vào route cần đăng nhập, middleware kiểm tra Redis. Nếu token nằm trong blacklist thì trả về `401`.

## 6. Dockerfile multi-stage deploy frontend với Nginx

- File: `frontend/Dockerfile`
- Stage 1: `node:22-alpine`
  - Chạy `npm ci`
  - Chạy `npm run build`
- Stage 2: `nginx:1.27-alpine`
  - Copy `dist` vào `/usr/share/nginx/html`
  - Expose port 80
  - Chạy Nginx
- File cấu hình Nginx: `frontend/nginx.conf`
- SPA fallback:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## Cách chạy

```bash
docker compose up --build
```

- Frontend: http://localhost:8080
- Backend: http://localhost:3000
- Redis: localhost:6379

## Tài khoản test

```txt
email: admin@example.com
password: 123456
```

## Test cache hit/cache miss

Cache danh sách:

```bash
curl http://localhost:3000/products
curl http://localhost:3000/products
```

Lần 1 sẽ có `source: "database"`, lần 2 sẽ có `source: "redis"`.

Cache chi tiết:

```bash
curl http://localhost:3000/products/1
curl http://localhost:3000/products/1
```

Response có field `source` là `database` hoặc `redis`. Backend cũng log ra nguồn dữ liệu để tiện kiểm tra.

## Test JWT blacklist với Redis

Đăng nhập bằng tài khoản demo:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"123456\"}"
```

Lấy `accessToken` trong response, gán vào biến môi trường:

```bash
TOKEN="<access-token>"
```

Gọi API cần token:

```bash
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

Logout để đưa token vào Redis blacklist:

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

Gọi lại `/auth/me` với token cũ sẽ bị từ chối:

```bash
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## Test cache invalidation

Đăng nhập lấy token, sau đó tạo product mới:

```bash
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"New Product\",\"price\":200000,\"description\":\"Cache invalidation demo\"}"
```

Sau khi tạo, cache danh sách `products:getAll` sẽ bị xóa. Lần `GET /products` tiếp theo sẽ lấy lại từ database.

Sửa product sẽ xóa cả cache danh sách và cache chi tiết của product đó:

```bash
curl -X PUT http://localhost:3000/products/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"price\":99000}"
```

Xóa product cũng xóa cả `products:getAll` và `products:getOne:<id>`:

```bash
curl -X DELETE http://localhost:3000/products/1 \
  -H "Authorization: Bearer $TOKEN"
```
