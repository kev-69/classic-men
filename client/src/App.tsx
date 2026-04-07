import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import "./App.css";
import { clientApi } from "./lib/api";
import type { AppConfig, Product } from "./lib/api";
import { initMetaPixel, trackPixelEvent } from "./lib/pixel";
import { SiteFooter } from "./components/layout/SiteFooter";
import { ProductModal } from "./components/modals/ProductModal";
import { ContactPage } from "./components/pages/ContactPage";
import { HomePage } from "./components/pages/HomePage";
import { ProductsPage } from "./components/pages/ProductsPage";

type Page = "home" | "products" | "contact";

const defaultConfig: AppConfig = {
  whatsappNumber: "233000000000",
  metaPixelId: "",
  landingVideoUrl: "",
  homeStoryPhotoUrl: "",
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
  const [, setStatusMessage] = useState("");
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
    )} and size ${selectedSize}. I would like to make my order today.`;

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

  const trackPurchase = () => {
    if (!selectedProduct) {
      return;
    }

    void clientApi.track("PURCHASE", selectedProduct.id, {
      productName: selectedProduct.name,
      source: "order-now"
    });
  };

  const landingVideoUrl =
    config.landingVideoUrl ||
    (config.cloudinaryCloudName && config.landingVideoPublicId
      ? `https://res.cloudinary.com/${config.cloudinaryCloudName}/video/upload/${config.landingVideoPublicId}.mp4`
      : "");

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
        <HomePage
          landingVideoUrl={landingVideoUrl}
          storyPhotoUrl={config.homeStoryPhotoUrl}
          featuredProducts={featuredProducts}
          onViewProducts={() => setPage("products")}
          onExploreAll={() => setPage("products")}
          onOpenProductView={(id) => void openProductView(id)}
        />
      )}

      {page === "products" && (
        <ProductsPage
          landingVideoUrl={landingVideoUrl}
          query={query}
          visibleProducts={visibleProducts}
          onQueryChange={setQuery}
          onOpenProductView={(id) => void openProductView(id)}
        />
      )}

      {page === "contact" && (
        <ContactPage
          contactName={contactName}
          contactMessage={contactMessage}
          whatsappNumber={config.whatsappNumber}
          onContactNameChange={setContactName}
          onContactMessageChange={setContactMessage}
          onSubmitContact={submitContact}
        />
      )}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          selectedColor={selectedColor}
          selectedSize={selectedSize}
          whatsappHref={buildWhatsAppOrderLink()}
          onOrderNow={trackPurchase}
          onClose={() => setSelectedProduct(null)}
          onSelectColor={setSelectedColor}
          onSelectSize={setSelectedSize}
        />
      )}

      <SiteFooter/>
    </div>
  );
}

export default App;
