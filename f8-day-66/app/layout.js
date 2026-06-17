import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "F8 Day 66 Blog",
  description: "Mini blog built with Next.js App Router",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <header className="site-header">
          <nav className="nav">
            <Link className="brand" href="/">
              F8 Blog Mini
            </Link>
            <div className="nav-links">
              <Link href="/">Trang chủ</Link>
              <Link href="/posts">Bài viết</Link>
              <Link href="/create">Tạo bài viết</Link>
            </div>
          </nav>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
