import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const addToCartService = async (
    userId,
    productId,
    quantity
) => {
    //check product

    const product = await prisma.product.findUnique({
        where: {

            id: productId,
        },
    });

    if (!product || !product.isActive) {
        throw new ApiError(404, "Product not found");
    }
    // check stock

    if (quantity > product.stock) {
        throw new ApiError(
            400, `Only ${product.stock} items(s) available`
        );
    }
    //find user's cart or create one
    const cart = await prisma.cart.upsert({
        where: {
            userId,
        },
        update: {},
        create: {
            userId,
        },

    });
    //check whether product is already in cart
    const existingItem = await prisma.cartItem.findUnique({
        where: {
            cartId_productId: {
                cartId: cart.id,
                productId,
            },
        },
    });

    let cartItem;

    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > product.stock) {
            throw new ApiError(
                400,
                `Only ${product.stock} item(s) available`
            );
        }
        cartItem = await prisma.cartItem.update({
            where: {
                id: existingItem.id,
            },
            data: {
                quantity: newQuantity,
            },
            include: {
                product: true,
            }
        });
    } else {
        cartItem = await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId,
                quantity,
            },
            include: {
                product: true,
            },
        });
    }
    return cartItem;
};

export const getCartService = async (userId) => {
    const cart = await prisma.cart.findUnique({
        where: {
            userId,
        },
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            category: true,
                        },
                    },
                },
                orderBy: {

                    createdAt: "desc",
                },
            },
        },
    });
    //user has never added anythings to cart
    if (!cart) {
        return {
            items: [],
            totalItems: 0,
            subtotal: 0,
        };
    }
    const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);

    const subtotal = cart.items.reduce((total, item) => {
        return total + Number(item.product.price) * item.quantity;
    },
        0
    );
    return {
        id: cart.id,
        userId: cart.userId,
        items: cart.items,
        totalItems,
        subtotal: Number(subtotal.toFixed(2)),
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt
    }
}