import type { Product } from "../../lib/api";

type ProductsPageProps = {
  query: string;
  visibleProducts: Product[];
  onQueryChange: (value: string) => void;
  onOpenProductView: (id: number) => void;
};

export function ProductsPage({ query, visibleProducts, onQueryChange, onOpenProductView }: ProductsPageProps) {
  return (
    <main className="page products-page">
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
            <button onClick={() => onOpenProductView(product.id)}>View</button>
          </article>
        ))}
      </div>
    </main>
  );
}
