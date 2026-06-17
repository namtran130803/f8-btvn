import Link from "next/link";
import { posts } from "@/app/data/posts";

export default function PostsPage() {
  return (
    <section>
      <h2>Danh sách bài viết</h2>
      <ul className="post-list">
        {posts.map((post) => (
          <li key={post.id}>
            <Link className="post-card" href={`/posts/${post.id}`}>
              <p className="post-meta">ID: {post.id}</p>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
