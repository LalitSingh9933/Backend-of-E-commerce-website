import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { createOrderService,
    getMyOrdersService,
    getOrderByIdService
 } from "../services/order.service.js";

export const createOrder = asyncHandler(async (req, res) => {
    const order = await createOrderService(
        req.user.id,
        req.body
    );

    return res.status(201).json(
        new ApiResponse(
            201,
            "Order created successfully",
            order
        )
    );
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await getMyOrdersService(req.user.id);

  return res.status(200).json(
    new ApiResponse(
      200,
      "Orders fetched successfully",
      orders
    )
  );
});
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await getOrderByIdService(
    req.user.id,
    req.params.id
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      "Order fetched successfully",
      order
    )
  );
});