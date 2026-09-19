import { PaymentStatus } from "@prisma/client";
import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const createOrderService = async (userId, shippingData) => {
    return prisma.$transaction(async (tx) => {
        // get users cart

        const cart = await tx.cart.findUnique({
            where: {
                userId,
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
        //  make sure  cart contains products

        if (!cart || cart.items.length === 0) {
            throw new ApiError(400, "Cart is empty");
        }
        // validate products and stock

        for (const item of cart.items) {
            if (!item.product.isActive) {
                throw new ApiError(
                    400,
                    `${item.product.name} is no longer available`
                );
            }
            if (item.quantity > item.product.stock) {
                throw new ApiError(
                    400,
                    `Only ${item.product.stock} item(s) of ${item.product.name} available`
                );
            }
        }
        // Calculate subtotal
        const subtotal = cart.items.reduce((total, item) => {
            return (
                total +
                Number(item.product.price) * item.quantity
            );
        }, 0);

        // we'll keep shipping free for now 

        const shippingFee = 0;

        const total = subtotal + shippingFee;

        // create orde + oder items
        const order = await tx.order.create({
            data: {
                userId,
                fullName: shippingData.fullName,
                phone: shippingData.phone,
                address: shippingData.address,
                city: shippingData.city,
                postalCode: shippingData.postalCode,

                paymentMethod: shippingData.paymentMethod,

                subtotal,
                shippingFee,
                total,

                items: {
                    create: cart.items.map((item) => ({
                        productId: item.productId,

                        productName: item.product.name,
                        productSlug: item.product.slug,
                        productImage: item.product.image,

                        quantity: item.quantity,
                        price: item.product.price,
                    })),
                },
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
        // Decrease stock
        for (const item of cart.items) {
            const result = await tx.product.updateMany({
                where: {
                    id: item.productId,
                    isActive: true,
                    stock: {
                        gte: item.quantity,
                    },
                },

                data: {
                    stock: {
                        decrement: item.quantity,
                    },
                },
            });

            if (result.count === 0) {
                throw new ApiError(
                    409,
                    `${item.product.name} does not have enough stock`
                );
            }
        }
        // clear cart
        await tx.cartItem.deleteMany({
            where: {
                cartId: cart.id,
            },
        });
        // return order
        return order;
    })
};
export const getMyOrdersService = async (userId) => {
    return prisma.order.findMany({
        where: {
            userId,
        },

        include: {
            items: {
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            image: true,
                        },
                    },
                },
            },
        },

        orderBy: {
            createdAt: "desc",
        },
    });
};
export const getOrderByIdService = async (
    userId,
    orderId
) => {
    const id = Number(orderId);

    if (Number.isNaN(id)) {
        throw new ApiError(400, "Invalid order ID");
    }

    const order = await prisma.order.findFirst({
        where: {
            id,
            userId,
        },

        include: {
            items: {
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            image: true,
                        },
                    },
                },
            },
        },
    });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    return order;
};
export const getAllOrdersService = async () => {
    return prisma.order.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },

            items: {
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            image: true,
                        },
                    },
                },
            },
        },

        orderBy: {
            createdAt: "desc",
        },
    });
};
export const updateOrderStatusService = async (
    orderId,
    newStatus
) => {
    const id = Number(orderId);

    if (Number.isNaN(id)) {
        throw new ApiError(400, "Invalid order ID");
    }

    const allowedTransitions = {
        PENDING: ["CONFIRMED", "CANCELLED"],
        CONFIRMED: ["PROCESSING", "CANCELLED"],
        PROCESSING: ["SHIPPED", "CANCELLED"],
        SHIPPED: ["DELIVERED"],
        DELIVERED: [],
        CANCELLED: [],
    };
    return prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
            where: {
                id,
            },

            include: {
                items: true,
            },
        });

        if (!order) {
            throw new ApiError(404, "Order not found");
        }

        const allowedNextStatuses =
            allowedTransitions[order.status] ?? [];

        if (!allowedNextStatuses.includes(newStatus)) {
            throw new ApiError(
                400,
                `Cannot change order status from ${order.status} to ${newStatus}`
            );
        }
        // restore inventory when cancelling

        if (newStatus === "CANCELLED") {
            for (const item of order.items) {
                await tx.product.update({
                    where: {
                        id: item.productId,
                    },

                    data: {
                        stock: {
                            increment: item.quantity,
                        },
                    },
                });
            }
        }

        return tx.order.update({
            where: {
                id,
            },

            data: {
                status: newStatus,
            },

            include: {
                items: true,
            },
        });
    });
};
export const cancelOrderService = async (userId, orderId) => {
    const id = Number(orderId);

    if (Number.isNaN(id)) {
        throw new ApiError(400, "Invalid order ID");
    }

    return prisma.$transaction(async (tx) => {
        const order = await tx.order.findFirst({
            where: {
                id,
                userId,
            },
            include: {
                items: true,
            },
        });
        if (!order) {
            throw new ApiError(404, "Order not  found");
        }

        if (order.status === "CANCELLED") {
            throw new ApiError(400, "Order is already cancelled");
        }

        if (
            order.status === "SHIPPED" || order.status === "DELIVERED"
        ) {
            throw new ApiError(
                400,
                "This order can no longer be cancelled"
            );
        }
        // restore stock

        for (const item of order.items) {
            await tx.product.update({
                where: {
                    id: item.productId,
                },
                data: {
                    stock: {
                        increment: item.quantity,
                    },
                },
            });
        }
        // change  order status
        const cancelledOrder = await tx.order.update({
            where: {
                id,
            },
            data: {
                status: "CANCELLED",

            },
            include: {
                items: true,
            },
        });
        return cancelledOrder;
    })
};
export const updatePaymentStatusService = async (
    orderId,
    paymentStatus
) => {

    const id = Number(orderId);

    if (Number.isNaN(id)) {
        throw new ApiError(400, "Invalid order ID");
    }
    const order = await prisma.order.findUnique({
        where: {
            id,
        },
    });
    if (!order) {
        throw new ApiError(404, "Order not found");
    }
    if (order.status === "CANCELLED") {
        throw new ApiError(
            400,
            "Cannot update payment status of a cancelled order"
        );
    }
    return prisma.order.update({
        where: {
            id,
        },

        data: {
            paymentStatus,
        },
    });
}