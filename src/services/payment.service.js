import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const initiatePaymentService = async (
    userId,
    orderId,
    provider
) => {
    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            userId,
        },
    });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (order.paymentMethod !== "ONLINE") {
        throw new ApiError(
            400,
            "Online payment cannot be initiated for a COD order"
        );
    }

    if (order.status === "CANCELLED") {
        throw new ApiError(
            400,
            "Payment cannot be initiated for a cancelled order"
        );
    }

    if (order.paymentStatus === "PAID") {
        throw new ApiError(
            400,
            "This order has already been paid"
        );
    }

    const existingPendingPayment = await prisma.payment.findFirst({
        where: {
            orderId: order.id,
            status: "PENDING",
        },
    });

    if (existingPendingPayment) {
        return existingPendingPayment;
    }

    const payment = await prisma.payment.create({
        data: {
            orderId: order.id,
            provider,
            amount: order.total,
            status: "PENDING",
        },
    });

    return payment;
};