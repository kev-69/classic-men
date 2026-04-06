import { Router } from "express";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";
import { env } from "../config/env";
import { pool } from "../db";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
});

const loginSchema = z.object({
  password: z.string().min(1)
});

const mediaSchema = z.object({
  type: z.enum(["image", "video"]),
  url: z.string().url(),
  publicId: z.string().optional()
});

const productSchema = z.object({
  name: z.string().min(2).max(140),
  description: z.string().min(8).max(5000),
  price: z.number().positive(),
  currency: z.string().default("GHS"),
  featured: z.boolean().default(false),
  inStock: z.boolean().default(true),
  colors: z.array(z.string().min(1)).default([]),
  sizes: z.array(z.string().min(1)).default([]),
  media: z.array(mediaSchema).default([])
});

const messageStatusSchema = z.object({
  status: z.enum(["new", "read"])
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

router.post("/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid login payload" });
  }

  if (parsed.data.password !== env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Incorrect password" });
  }

  const token = jwt.sign({ role: "admin" }, env.ADMIN_JWT_SECRET, { expiresIn: "12h" });
  return res.json({ token });
});

router.use(requireAdmin);

router.get("/products", async (_req, res) => {
  const result = await pool.query("SELECT * FROM products ORDER BY created_at DESC");
  return res.json(result.rows.map(mapProduct));
});

router.post("/products", async (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid product payload", errors: parsed.error.flatten() });
  }

  const { name, description, price, currency, featured, inStock, colors, sizes, media } = parsed.data;
  const result = await pool.query(
    `INSERT INTO products (name, description, price, currency, featured, in_stock, colors, sizes, media)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [name, description, price, currency, featured, inStock, colors, sizes, JSON.stringify(media)]
  );

  return res.status(201).json(mapProduct(result.rows[0]));
});

router.put("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid product payload", errors: parsed.error.flatten() });
  }

  const { name, description, price, currency, featured, inStock, colors, sizes, media } = parsed.data;
  const result = await pool.query(
    `UPDATE products
     SET name = $1,
         description = $2,
         price = $3,
         currency = $4,
         featured = $5,
         in_stock = $6,
         colors = $7,
         sizes = $8,
         media = $9,
         updated_at = NOW()
     WHERE id = $10
     RETURNING *`,
    [name, description, price, currency, featured, inStock, colors, sizes, JSON.stringify(media), id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json(mapProduct(result.rows[0]));
});

router.delete("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const result = await pool.query("DELETE FROM products WHERE id = $1", [id]);
  if (result.rowCount === 0) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.status(204).send();
});

router.get("/messages", async (_req, res) => {
  const result = await pool.query("SELECT * FROM contact_messages ORDER BY created_at DESC");
  return res.json(
    result.rows.map((row) => ({
      id: Number(row.id),
      name: String(row.name),
      message: String(row.message),
      status: String(row.status),
      createdAt: new Date(String(row.created_at)).toISOString()
    }))
  );
});

router.patch("/messages/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: "Invalid message id" });
  }

  const parsed = messageStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid status payload" });
  }

  const result = await pool.query(
    "UPDATE contact_messages SET status = $1 WHERE id = $2 RETURNING *",
    [parsed.data.status, id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ message: "Message not found" });
  }

  const row = result.rows[0];
  return res.json({
    id: Number(row.id),
    name: String(row.name),
    message: String(row.message),
    status: String(row.status),
    createdAt: new Date(String(row.created_at)).toISOString()
  });
});

router.get("/analytics", async (_req, res) => {
  const [counts, pageViews, productViews] = await Promise.all([
    pool.query("SELECT COUNT(*)::int AS total FROM products"),
    pool.query("SELECT COUNT(*)::int AS total FROM analytics_events WHERE event_type = 'PAGE_VIEW'"),
    pool.query("SELECT COUNT(*)::int AS total FROM analytics_events WHERE event_type = 'PRODUCT_VIEW'")
  ]);

  return res.json({
    productCount: counts.rows[0]?.total ?? 0,
    pageViews: pageViews.rows[0]?.total ?? 0,
    productViews: productViews.rows[0]?.total ?? 0
  });
});

router.post("/cloudinary/signature", (_req, res) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = env.CLOUDINARY_UPLOAD_FOLDER;
  const paramsToSign = {
    folder,
    timestamp
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, env.CLOUDINARY_API_SECRET);

  return res.json({
    timestamp,
    folder,
    signature,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY
  });
});

export default router;
