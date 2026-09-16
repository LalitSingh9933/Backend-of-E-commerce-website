import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Product name must contain at least 2 characters"),

    description: z
      .string()
      .trim()
      .optional(),

    price: z
      .number()
      .positive("Price must be greater than 0"),

    stock: z
      .number()
      .int()
      .min(0, "Stock cannot be negative"),

    image: z
      .string()
      .url("Image must be a valid URL")
      .optional(),
    categoryId: z
      .number()
      .int()
      .positive("Category ID must be valid"),
  }),
});
export const updateProductSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Product name must contain at least 2 characters")
        .optional(),

      description: z
        .string()
        .trim()
        .optional(),

      price: z
        .number()
        .positive("Price must be greater than 0")
        .optional(),

      stock: z
        .number()
        .int()
        .min(0, "Stock cannot be negative")
        .optional(),

      image: z
        .string()
        .url("Image must be a valid URL")
        .optional(),

      isActive: z
        .boolean()
        .optional(),
      categoryId: z
        .number()
        .int()
        .positive("Category ID must be valid")
        .optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      {
        message: "At least one field is required",
      }
    ),
});