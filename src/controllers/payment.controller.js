import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { initiatePaymentService,createEsewaPaymentService } from "../services/payment.service.js";

export const initiatePayment = asyncHandler(
  async (req, res) => {
    const { orderId, provider } = req.body;

    const payment = await initiatePaymentService(
      req.user.id,
      orderId,
      provider
    );

    return res.status(201).json(
      new ApiResponse(
        201,
        "Payment initiated successfully",
        payment
      )
    );
  }
);
export const createEsewaPayment = asyncHandler(
  async (req, res) => {
    const result = await createEsewaPaymentService(
      req.user.id,
      req.params.paymentId
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "eSewa payment request created successfully",
        result
      )
    );
  }
);