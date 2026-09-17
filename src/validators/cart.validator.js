import { z } from "zod";

export const addToCartSchema = z.object({
  body: z.object({
    productId: z
      .number()
      .int()
      .positive("Product ID must be valid"),

    quantity: z
      .number()
      .int()
      .positive("Quantity must be at least 1")
      .default(1),
  }),
});
export const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z
      .number()
      .int()
      .positive("Quantity must be at least 1"),
  }),
});