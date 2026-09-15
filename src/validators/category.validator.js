import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Category name must contain at least 2 characters"),

    description: z
      .string()
      .trim()
      .optional(),
  }),
});
export const updateCategorySchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Category name must contain at least 2 characters")
        .optional(),

      description: z
        .string()
        .trim()
        .optional(),

      isActive: z
        .boolean()
        .optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      {
        message: "At least one field is required",
      }
    ),
});
