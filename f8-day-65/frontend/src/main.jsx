import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

function App() {
  const [products, setProducts] = useState([]);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProducts() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiUrl}/products`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load products");
      }

      setProducts(result.data);
      setSource(result.source);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <main className="shell">
      <section className="toolbar">
        <div>
          <p className="eyebrow">FS NodeJS K15</p>
          <h1>Redis caching demo</h1>
        </div>
        <button type="button" onClick={loadProducts}>
          Reload
        </button>
      </section>

      <section className="status">
        {loading ? "Loading products..." : `Data source: ${source || "unknown"}`}
      </section>

      {error ? <p className="error">{error}</p> : null}

      <section className="grid">
        {products.map((product) => (
          <article className="product" key={product.id}>
            <div>
              <h2>{product.name}</h2>
              <p>{product.description}</p>
            </div>
            <strong>{product.price.toLocaleString("vi-VN")} VND</strong>
          </article>
        ))}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
