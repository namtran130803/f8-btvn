# F8 Day 71 - Docker Monorepo

Ứng dụng gồm 3 service chạy bằng Docker Compose:

- `frontend`: HTML/CSS/JS tĩnh, serve bằng Nginx ở `http://localhost:8080`
- `backend`: Node.js + Express API ở `http://localhost:3000`
- `db`: MySQL 8, lưu dữ liệu bằng named volume `db_data`

## Cách chạy

```bash
git clone <your-repo-url>
docker-compose up --build
```

Sau khi chạy:

- Frontend: `http://localhost:8080`
- Backend health check: `http://localhost:3000/health`
- Items API: `http://localhost:3000/items`

## API

```http
GET /
GET /health
GET /items
POST /items
Content-Type: application/json

{
  "name": "test"
}
```

Backend kết nối MySQL bằng biến môi trường trong `docker-compose.yml`.
Host database là tên service `db`, không dùng `localhost`.
