# Bài tập về nhà Day 70 - Node.js Multer + Cloudinary + Zod

API quản lý sản phẩm với upload ảnh lên Cloudinary, sử dụng Multer để parse multipart/form-data và Zod để validate dữ liệu.

## Công nghệ sử dụng

- **Express** — Web framework
- **Multer** + **multer-storage-cloudinary** — Upload file lên Cloudinary
- **Cloudinary** — Lưu trữ ảnh đám mây
- **Zod** — Validation & coerce dữ liệu từ form-data
- **Mongoose** + **MongoDB** — Lưu trữ sản phẩm
- **Docker Compose** — Chạy MongoDB

## Cấu trúc thư mục

```
api/
├── middlewares/
│   ├── uploadCloud.js        # Multer + Cloudinary config
│   ├── validate.js           # Zod validation middleware
│   └── handleMulterError.js  # Xử lý lỗi Multer
├── validations/
│   └── product.schema.js     # Zod schemas cho sản phẩm
├── routes/
│   └── product.route.js      # CRUD sản phẩm
├── models/
│   └── Product.js            # Mongoose Product model
└── server.js                 # Entry point
```

## Cài đặt

### 1. Clone project và cài dependencies

```bash
npm install
```

### 2. Cấu hình biến môi trường

Sửa file `.env` với thông tin Cloudinary của bạn:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/f8-day70
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Khởi động MongoDB

```bash
docker compose up -d
```

### 4. Chạy server

```bash
npm run dev
```

Server chạy tại `http://localhost:3000`.

## API Endpoints

### POST /products — Tạo sản phẩm kèm ảnh

Request: `multipart/form-data`

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| image | file | Có | Ảnh sản phẩm (JPEG/PNG/WebP, tối đa 3MB) |
| name | string | Có | 2-100 ký tự |
| price | number | Có | > 0 |
| stock | number | Không | >= 0, mặc định 0 |
| description | string | Không | Tối đa 500 ký tự |

Response `201`:
```json
{
  "message": "Tạo sản phẩm thành công",
  "data": {
    "name": "Áo thun basic",
    "price": 150000,
    "stock": 50,
    "description": "Áo thun cotton 100%",
    "imageUrl": "https://res.cloudinary.com/..."
  }
}
```

### POST /products/gallery — Upload nhiều ảnh

Request: `multipart/form-data` với field `images` (tối đa 5 file)

Response `200`:
```json
{
  "message": "Upload thành công 3 ảnh",
  "urls": ["https://...", "https://...", "https://..."]
}
```

### PATCH /products/:id — Cập nhật sản phẩm

Request: `multipart/form-data`. Ảnh là tuỳ chọn. Nếu không gửi ảnh mới, truyền `oldImageUrl` để giữ nguyên URL cũ.

Response `200`:
```json
{
  "message": "Cập nhật thành công",
  "data": {
    "id": "...",
    "name": "Áo thun premium",
    "price": 200000,
    "stock": 45,
    "imageUrl": "https://res.cloudinary.com/..."
  }
}
```

### DELETE /products/image?publicId=... — Xoá ảnh trên Cloudinary

Response `200`:
```json
{ "message": "Xoá ảnh thành công" }
```

## Middleware pipeline

Thứ tự middleware bắt buộc:

```
Multer (uploadCloud) -> Zod (validate) -> Handler
```

Multer phải đứng trước Zod vì `req.body` chỉ có dữ liệu sau khi Multer parse multipart/form-data.

## Tính năng nâng cao (đã implement)

- **File filter**: Chỉ chấp nhận `image/jpeg`, `image/png`, `image/webp`
- **Giới hạn kích thước**: Tối đa 3MB mỗi ảnh
- **Xử lý lỗi Multer**: Mọi lỗi (quá size, sai field name, quá số file) đều được xử lý qua `handleMulterError` và trả về JSON rõ ràng
