import { Router } from "express";
import authRouter from "./auth.routes.js";
import productRoutes from "./product.routes.js"
import categoryRoutes from "./category.routes.js";
import cartRoutes from "./cart.routes.js"

const  router = Router();

router.use("/auth", authRouter);
// router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
// router.use("/orders", orderRoutes);
router.use("/cart", cartRoutes);

export default router;