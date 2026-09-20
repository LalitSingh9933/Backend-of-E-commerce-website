import { Router } from "express";

import { authenticate } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import { initiatePayment } from "../controllers/payment.controller.js";

import {
  initiatePaymentSchema,
} from "../validators/payment.validator.js";

const router = Router();

router.post(
  "/initiate",
  authenticate,
  validate(initiatePaymentSchema),
  initiatePayment
);

export default router;