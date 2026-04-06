const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";

export type ProductMedia = {
  type: "image" | "video";
  url: string;
  publicId?: string;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  featured: boolean;
  inStock: boolean;
  colors: string[];
  sizes: string[];
  media: ProductMedia[];
  createdAt: string;
  updatedAt: string;
};

export type AppConfig = {
  whatsappNumber: string;
  metaPixelId: string;
  landingVideoPublicId: string;
  cloudinaryCloudName: string;
};

const parseJson = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(payload.message ?? "Request failed");
  }

  return (await response.json()) as T;
};

export const clientApi = {
  async getProducts(query = "") {
    const searchParams = new URLSearchParams();
    if (query.trim()) {
      searchParams.set("query", query.trim());
    }

    const response = await fetch(`${API_BASE}/products?${searchParams.toString()}`);
    return parseJson<Product[]>(response);
  },

  async getProduct(id: number) {
    const response = await fetch(`${API_BASE}/products/${id}`);
    return parseJson<Product>(response);
  },

  async getConfig() {
    const response = await fetch(`${API_BASE}/config`);
    return parseJson<AppConfig>(response);
  },

  async sendContactMessage(payload: { name: string; message: string }) {
    const response = await fetch(`${API_BASE}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    return parseJson<{ message: string }>(response);
  },

  async track(eventType: "PAGE_VIEW" | "PRODUCT_VIEW", productId?: number, metadata?: Record<string, unknown>) {
    await fetch(`${API_BASE}/analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType, productId, metadata })
    }).catch(() => undefined);
  }
};
