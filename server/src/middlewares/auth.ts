import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

type AdminTokenPayload = {
  role: "admin";
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid authorization header" });
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const decoded = jwt.verify(token, env.ADMIN_JWT_SECRET) as AdminTokenPayload;
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
