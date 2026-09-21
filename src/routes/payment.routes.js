import { Router } from "express";

import { authenticate } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import { initiatePayment,createEsewaPayment,verifyEsewaPayment } from "../controllers/payment.controller.js";

import {
  initiatePaymentSchema,
  verifyEsewaPaymentSchema
} from "../validators/payment.validator.js";

const router = Router();

router.post(
  "/initiate",
  authenticate,
  validate(initiatePaymentSchema),
  initiatePayment
);
router.post(
  "/esewa/verify",
  validate(verifyEsewaPaymentSchema),
  verifyEsewaPayment
);
router.post(
  "/:paymentId/esewa",
  authenticate,
  createEsewaPayment
);

export default router;