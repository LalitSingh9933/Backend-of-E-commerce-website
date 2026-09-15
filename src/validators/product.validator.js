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
  }),
});