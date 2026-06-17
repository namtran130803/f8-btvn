# F8 Day 66 - Blog Mini với Next.js

Bài tập xây dựng ứng dụng blog mini bằng Next.js App Router.

## Yêu cầu đã làm

- Tạo route `/` cho trang chủ.
- Tạo route `/posts` hiển thị danh sách bài viết bằng dữ liệu giả.
- Dùng `Link` để chuyển từ danh sách bài viết sang trang chi tiết.
- Tạo dynamic route `/posts/[id]` để hiển thị chi tiết bài viết theo `id`.
- Tạo route `/create` với form gồm `Title` và `Content`.
- Dùng `useRouter` để chuyển hướng về `/posts` khi submit form.

## Cấu trúc route

```text
/
/posts
/posts/1
/posts/2
/create
```

## Cài đặt

```bash
npm install
```

## Chạy project

```bash
npm run dev
```

Mở trình duyệt tại:

```text
http://localhost:3000
```

Nếu port `3000` đang bận, có thể chạy:

```bash
npm run dev -- -p 3001
```

## Kiểm tra

```bash
npm run lint
npm run build
```

Kết quả build đã xác nhận các route chính hoạt động:

```text
/
/create
/posts
/posts/[id]
```
