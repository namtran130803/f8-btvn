import Link from "next/link";

export default function HomePage() {
  return (
    <section className="hero">
      <span className="eyebrow">Bài tập buổi 66</span>
      <h1>Blog mini với Next.js App Router</h1>
      <p className="lead">
        Ứng dụng gồm trang chủ, danh sách bài viết, chi tiết bài viết theo
        dynamic route và form tạo bài viết dùng useRouter.
      </p>
      <div className="actions">
        <Link className="button" href="/posts">
          Xem bài viết
        </Link>
        <Link className="button secondary" href="/create">
          Tạo bài viết
        </Link>
      </div>
    </section>
  );
}
