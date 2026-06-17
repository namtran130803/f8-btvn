import express from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct
} from "../lib/db.js";
import { redisClient } from "../lib/redis.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();
const CACHE_TTL_SECONDS = 60;

const cacheKeys = {
  all: "products:getAll",
  one: (id) => `products:getOne:${id}`
};

router.get("/", async (req, res, next) => {
  try {
    const cachedProducts = await redisClient.get(cacheKeys.all);

    if (cachedProducts) {
      console.log("GET /products from redis");
      return res.json({
        source: "redis",
        data: JSON.parse(cachedProducts)
      });
    }

    const products = await getProducts();

    await redisClient.set(cacheKeys.all, JSON.stringify(products), {
      EX: CACHE_TTL_SECONDS
    });

    console.log("GET /products from database");

    return res.json({
      source: "database",
      data: products
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const key = cacheKeys.one(req.params.id);
    const cachedProduct = await redisClient.get(key);

    if (cachedProduct) {
      console.log(`GET /products/${req.params.id} from redis`);
      return res.json({
        source: "redis",
        data: JSON.parse(cachedProduct)
      });
    }

    const product = await getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await redisClient.set(key, JSON.stringify(product), {
      EX: CACHE_TTL_SECONDS
    });

    console.log(`GET /products/${req.params.id} from database`);

    return res.json({
      source: "database",
      data: product
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const product = await createProduct(req.body);

    await redisClient.del(cacheKeys.all);

    return res.status(201).json({
      message: "Product created",
      data: product
    });
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const product = await updateProduct(req.params.id, req.body);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await redisClient.del(cacheKeys.all, cacheKeys.one(req.params.id));

    return res.json({
      message: "Product updated",
      data: product
    });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const product = await deleteProduct(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await redisClient.del(cacheKeys.all, cacheKeys.one(req.params.id));

    return res.json({
      message: "Product deleted",
      data: product
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
