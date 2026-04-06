import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import "./App.css";
import { clientApi } from "./lib/api";
import type { AppConfig, Product } from "./lib/api";
import { initMetaPixel, trackPixelEvent } from "./lib/pixel";

type Page = "home" | "products" | "contact";

const defaultConfig: AppConfig = {
  whatsappNumber: "233000000000",
  metaPixelId: "",
  landingVideoPublicId: "",
  cloudinaryCloudName: ""
};

function App() {
  const [page, setPage] = useState<Page>("home");
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("Welcome to Classic-Men");
  const [config, setConfig] = useState<AppConfig>(defaultConfig);

  useEffect(() => {
    void bootstrap();
  }, []);

  useEffect(() => {
    void clientApi.track("PAGE_VIEW", undefined, { page });
    trackPixelEvent("PageView", { page_name: page });
  }, [page]);

  const bootstrap = async () => {
    try {
      const [productRows, remoteConfig] = await Promise.all([clientApi.getProducts(), clientApi.getConfig()]);
      setProducts(productRows);
      setConfig(remoteConfig);

      if (remoteConfig.metaPixelId) {
        initMetaPixel(remoteConfig.metaPixelId);
        trackPixelEvent("PageView", { page_name: "home" });
      }
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Failed to load products");
    }
  };

  const featuredProducts = useMemo(() => products.filter((product) => product.featured).slice(0, 4), [products]);

  const visibleProducts = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) {
      return products;
    }

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(keyword) ||
        product.description.toLowerCase().includes(keyword) ||
        product.colors.some((color) => color.toLowerCase().includes(keyword))
    );
  }, [products, query]);

  const openProductView = async (id: number) => {
    try {
      const product = await clientApi.getProduct(id);
      setSelectedProduct(product);
      setSelectedColor(product.colors[0] ?? "Default");
      setSelectedSize(product.sizes[0] ?? "One Size");

      void clientApi.track("PRODUCT_VIEW", id, { productName: product.name });
      trackPixelEvent("ViewContent", {
        content_name: product.name,
        content_ids: [product.id],
        value: product.price,
        currency: product.currency
      });
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not open product");
    }
  };

  const buildWhatsAppOrderLink = () => {
    if (!selectedProduct) {
      return "#";
    }

    const preFilled = `Hey, I like this ${selectedColor} attire with price ${selectedProduct.currency} ${selectedProduct.price.toFixed(
      2
    )} and size ${selectedSize}. I would like to purchase. Is it still available and how is delivery?`;

    return `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(preFilled)}`;
  };

  const submitContact = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const response = await clientApi.sendContactMessage({
        name: contactName,
        message: contactMessage
      });
      setStatusMessage(response.message);
      setContactName("");
      setContactMessage("");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Failed to send message");
    }
  };

  const landingVideoUrl =
    config.cloudinaryCloudName && config.landingVideoPublicId
      ? `https://res.cloudinary.com/${config.cloudinaryCloudName}/video/upload/${config.landingVideoPublicId}.mp4`
      : "";

  return (
    <div className="site-shell">
      <header className="topbar">
        <p className="brand-mark">Classic-Men</p>
        <nav>
          <button className={page === "home" ? "active" : ""} onClick={() => setPage("home")}>
            Home
          </button>
          <button className={page === "products" ? "active" : ""} onClick={() => setPage("products")}>
            Products
          </button>
          <button className={page === "contact" ? "active" : ""} onClick={() => setPage("contact")}>
            Contact
          </button>
        </nav>
      </header>

      {page === "home" && (
        <main className="page home-page">
          <section className="hero">
            <div>
              <p className="eyebrow">Premium Menswear</p>
              <h1>Timeless Style for Modern Men</h1>
              <p>
                Discover signature attire crafted with premium fabrics and sharp silhouettes. Browse, choose your
                style, and place your order directly via WhatsApp.
              </p>
              <div className="hero-actions">
                <button onClick={() => setPage("products")}>View Products</button>
                <button className="ghost" onClick={() => setPage("contact")}>
                  Contact
                </button>
              </div>
            </div>
            <div className="video-card">
              {landingVideoUrl ? (
                <video autoPlay muted loop playsInline controls>
                  <source src={landingVideoUrl} type="video/mp4" />
                </video>
              ) : (
                <div className="video-placeholder">Upload your how-to-order video in admin</div>
              )}
            </div>
          </section>

          <section className="featured">
            <div className="section-head">
              <h2>Featured Collection</h2>
              <button className="ghost" onClick={() => setPage("products")}>Explore all</button>
            </div>
            <div className="product-grid">
              {featuredProducts.map((product) => (
                <article key={product.id} className="product-card">
                  <img src={product.media[0]?.url || "https://placehold.co/640x420?text=Classic-Men"} alt={product.name} />
                  <div>
                    <h3>{product.name}</h3>
                    <p>
                      {product.currency} {product.price.toFixed(2)}
                    </p>
                  </div>
                  <button onClick={() => void openProductView(product.id)}>View</button>
                </article>
              ))}
            </div>
          </section>
        </main>
      )}

      {page === "products" && (
        <main className="page products-page">
          <section className="section-head products-head">
            <div>
              <h2>Products</h2>
              <p>Search and filter by style, color, or item name.</p>
            </div>
            <input
              placeholder="Search products"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
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
                <button onClick={() => void openProductView(product.id)}>View</button>
              </article>
            ))}
          </div>
        </main>
      )}

      {page === "contact" && (
        <main className="page contact-page">
          <section className="contact-card">
            <h2>Contact Classic-Men</h2>
            <p>Need help with sizes, stock, or delivery? Send us a quick message.</p>
            <form onSubmit={submitContact}>
              <label>
                Name
                <input value={contactName} onChange={(event) => setContactName(event.target.value)} required />
              </label>
              <label>
                Message
                <textarea
                  rows={6}
                  value={contactMessage}
                  onChange={(event) => setContactMessage(event.target.value)}
                  required
                />
              </label>
              <button type="submit">Send Message</button>
            </form>
          </section>
        </main>
      )}

      {selectedProduct && (
        <div className="modal-backdrop" onClick={() => setSelectedProduct(null)}>
          <section className="modal" onClick={(event) => event.stopPropagation()}>
            <button className="close" onClick={() => setSelectedProduct(null)}>
              Close
            </button>
            <div className="modal-layout">
              <div className="modal-media">
                {selectedProduct.media.map((item) =>
                  item.type === "video" ? (
                    <video key={item.url} controls>
                      <source src={item.url} />
                    </video>
                  ) : (
                    <img key={item.url} src={item.url} alt={selectedProduct.name} />
                  )
                )}
              </div>
              <div className="modal-content">
                <h3>{selectedProduct.name}</h3>
                <p>{selectedProduct.description}</p>
                <p className="price-tag">
                  {selectedProduct.currency} {selectedProduct.price.toFixed(2)}
                </p>

                <label>
                  Color
                  <select value={selectedColor} onChange={(event) => setSelectedColor(event.target.value)}>
                    {selectedProduct.colors.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Size
                  <select value={selectedSize} onChange={(event) => setSelectedSize(event.target.value)}>
                    {selectedProduct.sizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>

                <a className="whatsapp" href={buildWhatsAppOrderLink()} target="_blank" rel="noreferrer">
                  Order via WhatsApp
                </a>
              </div>
            </div>
          </section>
        </div>
      )}

      <footer>
        <small>{statusMessage}</small>
      </footer>
    </div>
  );
}

export default App;
