const { z } = require("zod");

const createProductSchema = z.object({
  name: z
    .string()
    .min(2, "Tên sản phẩm phải từ 2 đến 100 ký tự")
    .max(100, "Tên sản phẩm phải từ 2 đến 100 ký tự"),
  price: z.coerce.number().positive("Giá phải lớn hơn 0"),
  stock: z.coerce.number().int().min(0, "Stock không được âm").optional().default(0),
  description: z.string().max(500, "Mô tả tối đa 500 ký tự").optional().default(""),
});

const updateProductSchema = z
  .object({
    name: z
      .string()
      .min(2, "Tên sản phẩm phải từ 2 đến 100 ký tự")
      .max(100, "Tên sản phẩm phải từ 2 đến 100 ký tự")
      .optional(),
    price: z.coerce.number().positive("Giá phải lớn hơn 0").optional(),
    stock: z.coerce.number().int().min(0, "Stock không được âm").optional(),
    description: z.string().max(500, "Mô tả tối đa 500 ký tự").optional(),
    oldImageUrl: z.string().optional(),
  })
  .refine(
    (data) => {
      const { oldImageUrl, ...rest } = data;
      return Object.keys(rest).length > 0;
    },
    { message: "Phải có ít nhất một trường được cập nhật" }
  );

module.exports = { createProductSchema, updateProductSchema };
