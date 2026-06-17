"use client";

import { useRouter } from "next/navigation";

export default function CreatePostForm() {
  const router = useRouter();

  function handleSubmit(event) {
    event.preventDefault();
    router.push("/posts");
  }

  return (
    <form className="form" action="/posts" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="title">Title</label>
        <input id="title" type="text" required />
      </div>
      <div className="field">
        <label htmlFor="content">Content</label>
        <textarea id="content" required />
      </div>
      <button className="button" type="submit">
        Tạo bài viết
      </button>
    </form>
  );
}
