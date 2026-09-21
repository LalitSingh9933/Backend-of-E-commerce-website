import { z } from "zod";

export const initiatePaymentSchema = z.object({
    body: z.object({
        orderId: z.number().int().positive("Valid order ID is required"),

        provider: z.enum([
            "ESEWA",
            "KHALTI",
        ]),
    }),
});
export const verifyEsewaPaymentSchema = z.object({
  body: z.object({
    data: z
      .string()
      .min(1, "eSewa payment data is required"),
  }),
});