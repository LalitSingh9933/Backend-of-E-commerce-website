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