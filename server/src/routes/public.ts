import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env";
import { pool } from "../db";

const router = Router();

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  message: z.string().min(5).max(2000)
});

const analyticsSchema = z.object({
  eventType: z.enum(["PAGE_VIEW", "PRODUCT_VIEW", "PURCHASE"]),
  productId: z.number().int().positive().optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

const mapProduct = (row: Record<string, unknown>) => ({
  id: Number(row.id),
  name: String(row.name),
  description: String(row.description),
  price: Number(row.price),
  currency: String(row.currency),
  featured: Boolean(row.featured),
  inStock: Boolean(row.in_stock),
  colors: (row.colors as string[]) ?? [],
  sizes: (row.sizes as string[]) ?? [],
  media: (row.media as Array<{ type: "image" | "video"; url: string; publicId?: string }>) ?? [],
  createdAt: new Date(String(row.created_at)).toISOString(),
  updatedAt: new Date(String(row.updated_at)).toISOString()
});

router.get("/products", async (req, res) => {
  const query = String(req.query.query ?? "").trim().toLowerCase();
  const featured = req.query.featured;
  const inStock = req.query.inStock;

  const conditions: string[] = [];
  const values: unknown[] = [];

  if (query) {
    values.push(`%${query}%`);
    conditions.push(`(LOWER(name) LIKE $${values.length} OR LOWER(description) LIKE $${values.length})`);
  }

  if (featured === "true" || featured === "false") {
    values.push(featured === "true");
    conditions.push(`featured = $${values.length}`);
  }

  if (inStock === "true" || inStock === "false") {
    values.push(inStock === "true");
    conditions.push(`in_stock = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await pool.query(
    `SELECT * FROM products ${whereClause} ORDER BY featured DESC, created_at DESC`,
    values
  );

  return res.json(result.rows.map(mapProduct));
});

router.get("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
  if (result.rowCount === 0) {
    return res.status(404).json({ message: "Product not found" });
  }

  await pool.query(
    "INSERT INTO analytics_events (event_type, product_id, metadata) VALUES ($1, $2, $3)",
    ["PRODUCT_VIEW", id, JSON.stringify({ source: "product-detail" })]
  );

  return res.json(mapProduct(result.rows[0]));
});

router.post("/contact", async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid contact payload", errors: parsed.error.flatten() });
  }

  const { name, message } = parsed.data;
  await pool.query("INSERT INTO contact_messages (name, message) VALUES ($1, $2)", [name, message]);

  return res.status(201).json({ message: "Message received" });
});

router.get("/config", async (_req, res) => {
  const homeContent = await pool.query(
    "SELECT landing_video_url, story_image_url FROM home_content WHERE id = 1 LIMIT 1"
  );
  const row = homeContent.rows[0] as { landing_video_url?: string; story_image_url?: string } | undefined;

  return res.json({
    whatsappNumber: env.WHATSAPP_NUMBER,
    metaPixelId: env.META_PIXEL_ID,
    landingVideoUrl: row?.landing_video_url ?? "",
    homeStoryPhotoUrl: row?.story_image_url ?? "",
    landingVideoPublicId: env.CLOUDINARY_VIDEO_PUBLIC_ID,
    cloudinaryCloudName: env.CLOUDINARY_CLOUD_NAME
  });
});

router.post("/analytics", async (req, res) => {
  const parsed = analyticsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid analytics payload", errors: parsed.error.flatten() });
  }

  const { eventType, productId, metadata } = parsed.data;
  await pool.query(
    "INSERT INTO analytics_events (event_type, product_id, metadata) VALUES ($1, $2, $3)",
    [eventType, productId ?? null, JSON.stringify(metadata ?? {})]
  );

  return res.status(201).json({ message: "Tracked" });
});

export default router;
