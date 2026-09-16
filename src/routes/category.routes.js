import { Router } from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory
} from "../controllers/category.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  createCategorySchema,
  updateCategorySchema
} from "../validators/category.validator.js";
const router = Router();

router.get("/", getAllCategories);

router.get("/:slug", getCategoryBySlug);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createCategorySchema),
  createCategory
);
router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateCategorySchema),
  updateCategory
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  deleteCategory
);

export default router;