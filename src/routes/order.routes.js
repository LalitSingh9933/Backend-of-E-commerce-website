import { Router } from "express";

import {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
    updatePaymentStatus

} from "../controllers/order.controller.js";
import {authorize} from "../middlewares/authorize.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import {
    createOrderSchema,
    updateOrderStatusSchema,
    updatePaymentStatusSchema,
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
router.patch(
  "/:id/cancel",
  authenticate,
  cancelOrder
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
router.patch(
  "/admin/:id/payment-status",
  authenticate,
  authorize("ADMIN"),
  validate(updatePaymentStatusSchema),
  updatePaymentStatus
);
export default router;