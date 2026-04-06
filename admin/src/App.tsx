import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import "./App.css";
import { adminApi, uploadToCloudinary } from "./lib/api";
import type { ContactMessage, Product, ProductMedia } from "./lib/api";

type ProductDraft = {
  name: string;
  description: string;
  price: string;
  currency: string;
  featured: boolean;
  inStock: boolean;
  colors: string;
  sizes: string;
  media: ProductMedia[];
};

const emptyDraft: ProductDraft = {
  name: "",
  description: "",
  price: "",
  currency: "GHS",
  featured: false,
  inStock: true,
  colors: "Black, Navy",
  sizes: "M, L, XL",
  media: []
};

const TOKEN_KEY = "classic-men-admin-token";

type Tab = "products" | "messages" | "analytics";

function App() {
  const [tab, setTab] = useState<Tab>("products");
  const [token, setToken] = useState<string>(() => localStorage.getItem(TOKEN_KEY) ?? "");
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [analytics, setAnalytics] = useState({ productCount: 0, pageViews: 0, productViews: 0 });
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [mediaUrl, setMediaUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Ready");

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => Number(a.status === "new") - Number(b.status === "new")).reverse(),
    [messages]
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    void hydrateDashboard(token);
  }, [token]);

  const hydrateDashboard = async (authToken: string) => {
    setIsLoading(true);
    setStatusMessage("Loading dashboard data...");

    try {
      const [productRows, messageRows, analyticsData] = await Promise.all([
        adminApi.getProducts(authToken),
        adminApi.getMessages(authToken),
        adminApi.getAnalytics(authToken)
      ]);

      setProducts(productRows);
      setMessages(messageRows);
      setAnalytics(analyticsData);
      setStatusMessage("Dashboard synced");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Failed to load dashboard");
      localStorage.removeItem(TOKEN_KEY);
      setToken("");
    } finally {
      setIsLoading(false);
    }
  };

  const onLogin = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setStatusMessage("Signing in...");

    try {
      const result = await adminApi.login(password);
      localStorage.setItem(TOKEN_KEY, result.token);
      setToken(result.token);
      setPassword("");
      setStatusMessage("Login successful");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const toPayload = (data: ProductDraft) => ({
    name: data.name.trim(),
    description: data.description.trim(),
    price: Number(data.price),
    currency: data.currency.trim() || "GHS",
    featured: data.featured,
    inStock: data.inStock,
    colors: data.colors
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    sizes: data.sizes
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    media: data.media
  });

  const onSubmitProduct = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) {
      return;
    }

    setIsLoading(true);
    setStatusMessage(editingId ? "Updating product..." : "Creating product...");

    try {
      const payload = toPayload(draft);
      if (editingId) {
        const updated = await adminApi.updateProduct(token, editingId, payload);
        setProducts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        setStatusMessage("Product updated");
      } else {
        const created = await adminApi.createProduct(token, payload);
        setProducts((prev) => [created, ...prev]);
        setStatusMessage("Product created");
      }

      setDraft(emptyDraft);
      setEditingId(null);
      const analyticsData = await adminApi.getAnalytics(token);
      setAnalytics(analyticsData);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not save product");
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setDraft({
      name: product.name,
      description: product.description,
      price: String(product.price),
      currency: product.currency,
      featured: product.featured,
      inStock: product.inStock,
      colors: product.colors.join(", "),
      sizes: product.sizes.join(", "),
      media: product.media
    });
  };

  const onDeleteProduct = async (id: number) => {
    if (!token || !window.confirm("Delete this product?")) {
      return;
    }

    setIsLoading(true);
    setStatusMessage("Deleting product...");

    try {
      await adminApi.deleteProduct(token, id);
      setProducts((prev) => prev.filter((item) => item.id !== id));
      setStatusMessage("Product deleted");
      const analyticsData = await adminApi.getAnalytics(token);
      setAnalytics(analyticsData);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setIsLoading(false);
    }
  };

  const addManualMedia = () => {
    if (!mediaUrl.trim()) {
      return;
    }

    const type = mediaUrl.match(/\.mp4|\.webm|\.mov/i) ? "video" : "image";
    setDraft((prev) => ({
      ...prev,
      media: [...prev.media, { type, url: mediaUrl.trim() }]
    }));
    setMediaUrl("");
  };

  const onUploadMedia = async (file: File | null) => {
    if (!token || !file) {
      return;
    }

    setIsLoading(true);
    setStatusMessage(`Uploading ${file.name}...`);

    try {
      const uploaded = await uploadToCloudinary(token, file);
      setDraft((prev) => ({
        ...prev,
        media: [...prev.media, uploaded]
      }));
      setStatusMessage("Media uploaded");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  const removeMedia = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      media: prev.media.filter((_item, mediaIndex) => mediaIndex !== index)
    }));
  };

  const updateMessageStatus = async (id: number, status: "new" | "read") => {
    if (!token) {
      return;
    }

    try {
      const updated = await adminApi.markMessageStatus(token, id, status);
      setMessages((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setStatusMessage("Message updated");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not update message");
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setStatusMessage("Signed out");
  };

  if (!token) {
    return (
      <main className="auth-shell">
        <form className="auth-card" onSubmit={onLogin}>
          <p className="eyebrow">Classic-Men</p>
          <h1>Admin Dashboard</h1>
          <p>Use your admin password to manage products and contact messages.</p>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter admin password"
              required
            />
          </label>
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Login"}
          </button>
          <small>{statusMessage}</small>
        </form>
      </main>
    );
  }

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Classic-Men</p>
          <h1>Admin Control Center</h1>
          <p>Manage products, uploads, messages, and brand analytics.</p>
        </div>
        <div className="header-actions">
          <button onClick={() => void hydrateDashboard(token)} disabled={isLoading}>
            Refresh
          </button>
          <button className="ghost" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <nav className="tab-nav">
        <button className={tab === "products" ? "active" : ""} onClick={() => setTab("products")}>
          Products
        </button>
        <button className={tab === "messages" ? "active" : ""} onClick={() => setTab("messages")}>
          Messages
        </button>
        <button className={tab === "analytics" ? "active" : ""} onClick={() => setTab("analytics")}>
          Analytics
        </button>
      </nav>

      <p className="status">{statusMessage}</p>

      {tab === "products" && (
        <section className="grid-two">
          <form className="panel" onSubmit={onSubmitProduct}>
            <h2>{editingId ? "Edit product" : "Create product"}</h2>
            <label>
              Name
              <input
                value={draft.name}
                onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </label>
            <label>
              Description
              <textarea
                value={draft.description}
                onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
                rows={5}
                required
              />
            </label>
            <div className="row">
              <label>
                Price
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={draft.price}
                  onChange={(event) => setDraft((prev) => ({ ...prev, price: event.target.value }))}
                  required
                />
              </label>
              <label>
                Currency
                <input
                  value={draft.currency}
                  onChange={(event) => setDraft((prev) => ({ ...prev, currency: event.target.value }))}
                />
              </label>
            </div>
            <label>
              Colors (comma separated)
              <input
                value={draft.colors}
                onChange={(event) => setDraft((prev) => ({ ...prev, colors: event.target.value }))}
              />
            </label>
            <label>
              Sizes (comma separated)
              <input
                value={draft.sizes}
                onChange={(event) => setDraft((prev) => ({ ...prev, sizes: event.target.value }))}
              />
            </label>
            <div className="row toggle-row">
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={draft.featured}
                  onChange={(event) => setDraft((prev) => ({ ...prev, featured: event.target.checked }))}
                />
                Featured
              </label>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={draft.inStock}
                  onChange={(event) => setDraft((prev) => ({ ...prev, inStock: event.target.checked }))}
                />
                In stock
              </label>
            </div>

            <div className="media-controls">
              <h3>Media</h3>
              <div className="row">
                <input
                  value={mediaUrl}
                  onChange={(event) => setMediaUrl(event.target.value)}
                  placeholder="Paste image/video URL"
                />
                <button type="button" onClick={addManualMedia}>
                  Add URL
                </button>
              </div>
              <label className="upload-field">
                Upload with Cloudinary
                <input type="file" accept="image/*,video/*" onChange={(event) => void onUploadMedia(event.target.files?.[0] ?? null)} />
              </label>
              <ul className="media-list">
                {draft.media.map((item, index) => (
                  <li key={`${item.url}-${index}`}>
                    <span>{item.type.toUpperCase()}</span>
                    <a href={item.url} target="_blank" rel="noreferrer">
                      Open
                    </a>
                    <button type="button" className="ghost" onClick={() => removeMedia(index)}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="row">
              <button type="submit" disabled={isLoading}>
                {editingId ? "Save Changes" : "Create Product"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="ghost"
                  onClick={() => {
                    setEditingId(null);
                    setDraft(emptyDraft);
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          <section className="panel">
            <h2>Product Inventory</h2>
            <ul className="list">
              {products.map((product) => (
                <li key={product.id}>
                  <div>
                    <p>{product.name}</p>
                    <small>
                      {product.currency} {product.price.toFixed(2)} • {product.inStock ? "In stock" : "Out of stock"}
                    </small>
                  </div>
                  <div className="actions">
                    <button type="button" className="ghost" onClick={() => startEdit(product)}>
                      Edit
                    </button>
                    <button type="button" className="danger" onClick={() => void onDeleteProduct(product.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </section>
      )}

      {tab === "messages" && (
        <section className="panel">
          <h2>Contact messages</h2>
          <ul className="list messages">
            {sortedMessages.map((message) => (
              <li key={message.id}>
                <div>
                  <p>
                    {message.name} • {new Date(message.createdAt).toLocaleString()}
                  </p>
                  <small>{message.message}</small>
                </div>
                <div className="actions">
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => void updateMessageStatus(message.id, message.status === "new" ? "read" : "new")}
                  >
                    Mark as {message.status === "new" ? "read" : "new"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === "analytics" && (
        <section className="analytics-grid">
          <article className="panel metric">
            <h2>Products</h2>
            <p>{analytics.productCount}</p>
          </article>
          <article className="panel metric">
            <h2>Page Views</h2>
            <p>{analytics.pageViews}</p>
          </article>
          <article className="panel metric">
            <h2>Product Views</h2>
            <p>{analytics.productViews}</p>
          </article>
        </section>
      )}
    </main>
  );
}

export default App;
