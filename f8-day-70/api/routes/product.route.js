const express = require("express");
const cloudinary = require("cloudinary").v2;
const { z } = require("zod");
const uploadCloud = require("../middlewares/uploadCloud");
const validate = require("../middlewares/validate");
const {
  createProductSchema,
  updateProductSchema,
} = require("../validations/product.schema");
const Product = require("../models/Product");

const router = express.Router();

const deleteImageSchema = z.object({
  publicId: z.string().min(1, "publicId không được rỗng"),
});

router.post("/", uploadCloud.single("image"), validate(createProductSchema), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng upload ảnh sản phẩm" });
    }

    const { name, price, stock, description } = req.body;
    const product = await Product.create({
      name,
      price,
      stock,
      description,
      imageUrl: req.file.path,
    });

    res.status(201).json({
      message: "Tạo sản phẩm thành công",
      data: {
        name: product.name,
        price: product.price,
        stock: product.stock,
        description: product.description,
        imageUrl: product.imageUrl,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/gallery", uploadCloud.array("images", 5), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Vui lòng chọn ít nhất 1 ảnh" });
    }

    const urls = req.files.map((file) => file.path);

    res.status(200).json({
      message: `Upload thành công ${urls.length} ảnh`,
      urls,
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", uploadCloud.single("image"), validate(updateProductSchema), async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    const { name, price, stock, description, oldImageUrl } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;
    if (description !== undefined) updateData.description = description;

    if (req.file) {
      updateData.imageUrl = req.file.path;
    } else if (oldImageUrl) {
      updateData.imageUrl = oldImageUrl;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.status(200).json({
      message: "Cập nhật thành công",
      data: {
        id: updatedProduct._id,
        name: updatedProduct.name,
        price: updatedProduct.price,
        stock: updatedProduct.stock,
        imageUrl: updatedProduct.imageUrl,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/image", validate(deleteImageSchema, "query"), async (req, res, next) => {
  try {
    const { publicId } = req.query;
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "not found") {
      return res.status(400).json({ message: "Không tìm thấy ảnh hoặc publicId không hợp lệ" });
    }

    res.status(200).json({ message: "Xoá ảnh thành công" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
