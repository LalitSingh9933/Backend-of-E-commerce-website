import { Router } from "express";

import {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,

} from "../controllers/order.controller.js";
import {authorize} from "../middlewares/authorize.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import {
    createOrderSchema,
    updateOrderStatusSchema,
} from "../validators/order.validator.js";

const router = Router();

router.get(
    "/",
    authenticate,
    getMyOrders
);

router.get(
    "/:id",
    authenticate,
    getOrderById
);


router.post(
    "/",
    authenticate,
    validate(createOrderSchema),
    createOrder
);
//admin
router.get(
  "/admin/all",
  authenticate,
  authorize("ADMIN"),
  getAllOrders
);
router.patch(
  "/admin/:id/status",
  authenticate,
  authorize("ADMIN"),
  validate(updateOrderStatusSchema),
  updateOrderStatus
);
export default router;