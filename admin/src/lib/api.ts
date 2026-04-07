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

export type ContactMessage = {
  id: number;
  name: string;
  message: string;
  status: "new" | "read";
  createdAt: string;
};

export type AnalyticsResponse = {
  purchaseCount: number;
  pageViews: number;
  productViews: number;
  pageBreakdown: Array<{ page: string; views: number }>;
  productBreakdown: Array<{ productId: number; productName: string; views: number }>;
};

export type HomeContent = {
  landingVideoUrl: string;
  storyImageUrl: string;
  updatedAt: string | null;
};

type CloudinarySignature = {
  timestamp: number;
  folder: string;
  signature: string;
  cloudName: string;
  apiKey: string;
};

const parseJson = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(payload.message ?? "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export const adminApi = {
  async login(password: string) {
    const response = await fetch(`${API_BASE}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    return parseJson<{ token: string }>(response);
  },

  async getProducts(token: string) {
    const response = await fetch(`${API_BASE}/admin/products`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return parseJson<Product[]>(response);
  },

  async createProduct(token: string, payload: Omit<Product, "id" | "createdAt" | "updatedAt">) {
    const response = await fetch(`${API_BASE}/admin/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    return parseJson<Product>(response);
  },

  async updateProduct(token: string, id: number, payload: Omit<Product, "id" | "createdAt" | "updatedAt">) {
    const response = await fetch(`${API_BASE}/admin/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    return parseJson<Product>(response);
  },

  async deleteProduct(token: string, id: number) {
    const response = await fetch(`${API_BASE}/admin/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    return parseJson<void>(response);
  },

  async getMessages(token: string) {
    const response = await fetch(`${API_BASE}/admin/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return parseJson<ContactMessage[]>(response);
  },

  async markMessageStatus(token: string, id: number, status: "new" | "read") {
    const response = await fetch(`${API_BASE}/admin/messages/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    return parseJson<ContactMessage>(response);
  },

  async getAnalytics(token: string) {
    const response = await fetch(`${API_BASE}/admin/analytics`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return parseJson<AnalyticsResponse>(response);
  },

  async getHomeContent(token: string) {
    const response = await fetch(`${API_BASE}/admin/home-content`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return parseJson<HomeContent>(response);
  },

  async updateHomeContent(token: string, payload: { landingVideoUrl: string; storyImageUrl: string }) {
    const response = await fetch(`${API_BASE}/admin/home-content`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    return parseJson<HomeContent>(response);
  },

  async getCloudinarySignature(token: string) {
    const response = await fetch(`${API_BASE}/admin/cloudinary/signature`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });

    return parseJson<CloudinarySignature>(response);
  }
};

export const uploadToCloudinary = async (
  token: string,
  file: File
): Promise<{ type: "image" | "video"; url: string; publicId?: string }> => {
  const signature = await adminApi.getCloudinarySignature(token);
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signature.apiKey);
  formData.append("timestamp", String(signature.timestamp));
  formData.append("signature", signature.signature);
  formData.append("folder", signature.folder);

  const endpoint = `https://api.cloudinary.com/v1_1/${signature.cloudName}/auto/upload`;
  const response = await fetch(endpoint, {
    method: "POST",
    body: formData
  });

  const payload = (await response.json()) as {
    secure_url: string;
    resource_type: string;
    public_id?: string;
    error?: { message: string };
  };

  if (!response.ok || !payload.secure_url) {
    throw new Error(payload.error?.message ?? "Cloudinary upload failed");
  }

  return {
    type: payload.resource_type === "video" ? "video" : "image",
    url: payload.secure_url,
    publicId: payload.public_id
  };
};
