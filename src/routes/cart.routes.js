import { Router } from "express";

import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,

} from "../controllers/cart.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import {
  addToCartSchema,
  updateCartItemSchema
} from "../validators/cart.validator.js";

const router = Router();
router.get( "/", authenticate,getCart);

router.post(
  "/items",
  authenticate,
  validate(addToCartSchema),
  addToCart
);
router.patch(
  "/items/:id",
  authenticate,
  validate(updateCartItemSchema),
  updateCartItem
);
// delete single prduct from cart
router.delete(
  "/items/:id",
  authenticate,
  removeCartItem
);
//clear all product from cart
router.delete(
  "/",
  authenticate,
  clearCart
);


export default router;