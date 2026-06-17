import express from "express";
import jwt from "jsonwebtoken";
import { redisClient } from "../lib/redis.js";
import { getBearerToken, requireAuth } from "../middlewares/auth.js";

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET || "change-me-in-production";
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "1h";

const demoUser = {
  id: 1,
  email: "admin@example.com",
  password: "123456",
  name: "Admin"
};

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email !== demoUser.email || password !== demoUser.password) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign(
    { sub: demoUser.id, email: demoUser.email, name: demoUser.name },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );

  return res.json({
    accessToken: token,
    tokenType: "Bearer",
    expiresIn: jwtExpiresIn
  });
});

router.post("/logout", requireAuth, async (req, res) => {
  const token = getBearerToken(req);
  const decoded = jwt.decode(token);
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const ttl = Math.max(decoded.exp - nowInSeconds, 0);

  if (ttl > 0) {
    await redisClient.set(`blacklist:${token}`, "1", { EX: ttl });
  }

  return res.json({
    message: "Logged out successfully",
    blacklistTtl: ttl
  });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
