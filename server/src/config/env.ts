import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  ADMIN_ORIGIN: z.string().default("http://localhost:5174"),
  ADMIN_PASSWORD: z.string().min(6, "ADMIN_PASSWORD is required"),
  ADMIN_JWT_SECRET: z.string().min(12, "ADMIN_JWT_SECRET is required"),
  WHATSAPP_NUMBER: z.string().default("233000000000"),
  META_PIXEL_ID: z.string().default(""),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
  CLOUDINARY_UPLOAD_FOLDER: z.string().default("classic-men"),
  CLOUDINARY_VIDEO_PUBLIC_ID: z.string().default("")
});

export const env = envSchema.parse(process.env);

export const allowedOrigins = [env.CLIENT_ORIGIN, env.ADMIN_ORIGIN];
