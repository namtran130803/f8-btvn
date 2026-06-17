import jwt from "jsonwebtoken";
import { redisClient } from "../lib/redis.js";

const jwtSecret = process.env.JWT_SECRET || "change-me-in-production";

export function getBearerToken(req) {
  const authorization = req.headers.authorization || "";

  if (!authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length);
}

export async function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req);

    if (!token) {
      return res.status(401).json({ message: "Missing access token" });
    }

    const isBlacklisted = await redisClient.get(`blacklist:${token}`);

    if (isBlacklisted) {
      return res.status(401).json({ message: "Token has been logged out" });
    }

    req.user = jwt.verify(token, jwtSecret);
    req.token = token;

    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
