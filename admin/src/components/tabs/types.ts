import type { ProductMedia } from "../../lib/api";

export type ProductDraft = {
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

export type AnalyticsSummary = {
  productCount: number;
  pageViews: number;
  productViews: number;
};
