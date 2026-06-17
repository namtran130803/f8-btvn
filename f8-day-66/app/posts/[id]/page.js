import Link from "next/link";
import { notFound } from "next/navigation";
import { posts } from "@/app/data/posts";

export function generateStaticParams() {
  return posts.map((post) => ({
    id: post.id,
  }));
}

export default async function PostDetailPage({ params }) {
  const { id } = await params;
  const post = posts.find((item) => item.id === id);

  if (!post) {
    notFound();
  }

  return (
    <article className="detail">
      <p className="post-meta">ID: {post.id}</p>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <Link className="button secondary" href="/posts">
        Quay lại danh sách
      </Link>
    </article>
  );
}
