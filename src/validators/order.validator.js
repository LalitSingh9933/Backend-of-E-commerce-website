import { z } from "zod";

export const createOrderSchema = z.object({
    body: z.object({
        fullName: z
            .string()
            .trim()
            .min(2, "Full name is required"),

        phone: z
            .string()
            .trim()
            .min(7, "Valid phone number is required")
            .max(20),

        address: z
            .string()
            .trim()
            .min(5, "Address is required"),

        city: z
            .string()
            .trim()
            .min(2, "City is required"),

        postalCode: z
            .string()
            .trim()
            .optional(),
    }),
});