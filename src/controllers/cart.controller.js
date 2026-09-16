import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  addToCartService,
  getCartService
} from "../services/cart.service.js";

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  const cartItem = await addToCartService(
    req.user.id,
    productId,
    quantity
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      "Product added to cart successfully",
      cartItem
    )
  );
});
export const getCart = asyncHandler(async (req, res) => {
  const cart = await getCartService(req.user.id);

  return res.status(200).json(
    new ApiResponse(
      200,
      "Cart fetched successfully",
      cart
    )
  );
});