import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import "./App.css";
import { adminApi, uploadToCloudinary } from "./lib/api";
import type { ContactMessage, Product } from "./lib/api";
import { AuthView } from "./components/AuthView";
import { DashboardHeader } from "./components/DashboardHeader";
import { TabNavigation } from "./components/TabNavigation";
import type { Tab } from "./components/TabNavigation";
import { AnalyticsTab } from "./components/tabs/AnalyticsTab";
import { MessagesTab } from "./components/tabs/MessagesTab";
import { ProductsTab } from "./components/tabs/ProductsTab";
import type { AnalyticsSummary, ProductDraft } from "./components/tabs/types";

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

function App() {
  const [tab, setTab] = useState<Tab>("products");
  const [token, setToken] = useState<string>(() => localStorage.getItem(TOKEN_KEY) ?? "");
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    productCount: 0,
    pageViews: 0,
    productViews: 0,
    pageBreakdown: [],
    productBreakdown: []
  });
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
      <AuthView
        password={password}
        setPassword={setPassword}
        isLoading={isLoading}
        statusMessage={statusMessage}
        onLogin={onLogin}
      />
    );
  }

  return (
    <main className="dashboard-shell">
      <DashboardHeader isLoading={isLoading} onRefresh={() => void hydrateDashboard(token)} onLogout={logout} />

      <TabNavigation tab={tab} onTabChange={setTab} />

      <p className="status">{statusMessage}</p>

      {tab === "products" && (
        <ProductsTab
          isLoading={isLoading}
          editingId={editingId}
          draft={draft}
          mediaUrl={mediaUrl}
          products={products}
          setDraft={setDraft}
          setMediaUrl={setMediaUrl}
          onSubmitProduct={onSubmitProduct}
          onAddManualMedia={addManualMedia}
          onUploadMedia={onUploadMedia}
          onRemoveMedia={removeMedia}
          onStartEdit={startEdit}
          onDeleteProduct={(id) => void onDeleteProduct(id)}
          onCancelEdit={() => {
            setEditingId(null);
            setDraft(emptyDraft);
          }}
        />
      )}

      {tab === "messages" && (
        <MessagesTab
          sortedMessages={sortedMessages}
          onUpdateMessageStatus={(id, status) => void updateMessageStatus(id, status)}
        />
      )}

      {tab === "analytics" && <AnalyticsTab analytics={analytics} />}
    </main>
  );
}

export default App;
