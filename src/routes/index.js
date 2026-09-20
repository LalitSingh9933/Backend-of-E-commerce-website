import { Router } from "express";
import authRouter from "./auth.routes.js";
import productRoutes from "./product.routes.js"
import categoryRoutes from "./category.routes.js";
import cartRoutes from "./cart.routes.js"
import orderRoutes from "./order.routes.js";
import paymentRoutes from "./payment.routes.js";

const  router = Router();

router.use("/auth", authRouter);
// router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/orders", orderRoutes);
router.use("/cart", cartRoutes);
router.use("/payments", paymentRoutes);

export default router;