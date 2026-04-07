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
  purchaseCount: number;
  pageViews: number;
  productViews: number;
  pageBreakdown: Array<{ page: string; views: number }>;
  productBreakdown: Array<{ productId: number; productName: string; views: number }>;
};
