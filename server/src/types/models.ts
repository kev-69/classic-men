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
