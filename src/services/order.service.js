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

                subtotal,
                shippingFee,
                total,

                items: {
                    create: cart.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,

                        // Snapshot current product price
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
    status
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

    return prisma.order.update({
        where: {
            id,
        },

        data: {
            status,
        },
    });
};