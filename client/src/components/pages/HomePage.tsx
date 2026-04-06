import type { Product } from "../../lib/api";

type HomePageProps = {
  landingVideoUrl: string;
  storyPhotoUrl: string;
  featuredProducts: Product[];
  onViewProducts: () => void;
  onExploreAll: () => void;
  onOpenProductView: (id: number) => void;
};

export function HomePage({
  landingVideoUrl,
  storyPhotoUrl,
  featuredProducts,
  onViewProducts,
  onExploreAll,
  onOpenProductView
}: HomePageProps) {
  return (
    <main className="page home-page">
      <section className="hero">
        <div>
          <p className="eyebrow">Premium Menswear</p>
          <h1>Timeless Style for Modern Men</h1>
          <p>
            Discover signature attire crafted with premium fabrics and sharp silhouettes. Browse, choose your style,
            and place your order directly via WhatsApp.
          </p>
          <div className="hero-actions">
            <button onClick={onViewProducts}>View Products</button>
          </div>
        </div>
        <div className="video-card">
          {landingVideoUrl ? (
            <video autoPlay loop playsInline controls>
              <source src={landingVideoUrl} type="video/mp4" />
            </video>
          ) : (
            <div className="video-placeholder">Upload your how-to-order video in admin</div>
          )}
        </div>
      </section>

      <section className="home-highlights">
        <article>
          <h3>Curated Drops</h3>
          <p>Weekly additions tailored for modern gentlemen.</p>
        </article>
        <article>
          <h3>Reliable Delivery</h3>
          <p>Fast city dispatch with clear updates and support.</p>
        </article>
        <article>
          <h3>Premium Fabrics</h3>
          <p>Comfort-first materials and a clean sharp finish.</p>
        </article>
      </section>

      <section className="home-story">
        <div className="home-story-photo">
          <img src={storyPhotoUrl || "https://placehold.co/800x1000?text=Classic-Men"} alt="Classic-Men story" />
        </div>
        <div className="home-story-main">
          <p className="eyebrow">Why Classic-Men</p>
          <h2>Built for Men Who Dress with Intention</h2>
          <p>
            We focus on refined essentials that transition from weekday confidence to weekend occasions. Every piece is
            selected to combine comfort, fit, and understated style.
          </p>
        </div>
      </section>

      <section className="home-process">
        <p className="eyebrow">Simple Process</p>
        <h2>From Browsing to Delivery in 4 Steps</h2>
        <div className="home-process-grid">
          <article>
            <span>01</span>
            <h3>Browse</h3>
            <p>Explore collections and open product details.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Select</h3>
            <p>Pick your preferred color and size.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Order</h3>
            <p>Send the pre-filled WhatsApp order request.</p>
          </article>
          <article>
            <span>04</span>
            <h3>Receive</h3>
            <p>Get confirmation and delivery details quickly.</p>
          </article>
        </div>
      </section>

      <section className="featured">
        <div className="section-head">
          <h2>Featured Collection</h2>
          <button className="ghost" onClick={onExploreAll}>
            Explore all
          </button>
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
              <button onClick={() => onOpenProductView(product.id)}>View</button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
