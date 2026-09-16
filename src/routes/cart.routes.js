import { Router } from "express";

import {
  addToCart,
  getCart
} from "../controllers/cart.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import {
  addToCartSchema,
} from "../validators/cart.validator.js";

const router = Router();
router.get( "/", authenticate,getCart);

router.post(
  "/items",
  authenticate,
  validate(addToCartSchema),
  addToCart
);

export default router;