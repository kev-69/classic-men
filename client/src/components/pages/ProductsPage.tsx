import type { Product } from "../../lib/api";

type ProductsPageProps = {
  landingVideoUrl: string;
  query: string;
  visibleProducts: Product[];
  onQueryChange: (value: string) => void;
  onOpenProductView: (id: number) => void;
};

export function ProductsPage({
  landingVideoUrl,
  query,
  visibleProducts,
  onQueryChange,
  onOpenProductView
}: ProductsPageProps) {
  return (
    <main className="page products-page">
      <section className="products-video">
        <p className="eyebrow">How To Order</p>
        <div className="video-card">
          {landingVideoUrl ? (
            <video autoPlay loop playsInline muted controls>
              <source src={landingVideoUrl} type="video/mp4" />
            </video>
          ) : (
            <div className="video-placeholder">Landing video not set yet</div>
          )}
        </div>
      </section>
      
      <section className="section-head products-head">
        <div>
          <h2>Products</h2>
          <p>Search and filter by style, color, or item name.</p>
        </div>
        <input placeholder="Search products" value={query} onChange={(event) => onQueryChange(event.target.value)} />
      </section>

      <div className="product-grid">
        {visibleProducts.map((product) => (
          <article key={product.id} className="product-card">
            <img src={product.media[0]?.url || "https://placehold.co/640x420?text=Classic-Men"} alt={product.name} />
            <div>
              <h3>{product.name}</h3>
              <p>
                {product.currency} {product.price.toFixed(2)}
              </p>
              <small>{product.inStock ? "In stock" : "Out of stock"}</small>
            </div>
            <button onClick={() => onOpenProductView(product.id)}>Order on WhatsApp</button>
          </article>
        ))}
      </div>
    </main>
  );
}