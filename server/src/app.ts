import cors from "cors";
import express from "express";
import { allowedOrigins, env } from "./config/env";
import adminRoutes from "./routes/admin";
import publicRoutes from "./routes/public";

const app = express();

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  return res.status(200).json({
    status: "ok",
    service: "classic-men-api",
    env: env.NODE_ENV
  });
});

app.use("/api", publicRoutes);
app.use("/api/admin", adminRoutes);

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
});

export default app;
