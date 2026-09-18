import { Router } from "express";
import {
  createProcut, getAllProducts, getproductBySlug, updateProduct, deleteProduct,
  getAllAdminProducts,
  reactivateProduct,
} from "../controllers/product.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { createProductSchema, updateProductSchema } from '../validators/product.validator.js';

const router = Router();

router.get("/", getAllProducts);

router.get("/:slug", getproductBySlug);

// ADMIN
router.get(
  "/admin/all",
  authenticate,
  authorize("ADMIN"),
  getAllAdminProducts
);
router.patch(
  "/admin/:id/reactivate",
  authenticate,
  authorize("ADMIN"),
  reactivateProduct
);
router.post("/",
  authenticate,
  authorize("ADMIN"),
  validate(createProductSchema),
  createProcut
);
router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateProductSchema),
  updateProduct
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  deleteProduct
);

export default router;