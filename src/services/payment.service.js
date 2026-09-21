import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import crypto from "crypto"

import {
  generateEsewaSignature,
  verifyEsewaResponseSignature,
} from "../utils/esewa.js";

export const initiatePaymentService = async (
  userId,
  orderId,
  provider
) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.paymentMethod !== "ONLINE") {
    throw new ApiError(
      400,
      "Online payment cannot be initiated for a COD order"
    );
  }

  if (order.status === "CANCELLED") {
    throw new ApiError(
      400,
      "Payment cannot be initiated for a cancelled order"
    );
  }

  if (order.paymentStatus === "PAID") {
    throw new ApiError(
      400,
      "This order has already been paid"
    );
  }

  const existingPendingPayment = await prisma.payment.findFirst({
    where: {
      orderId: order.id,
      status: "PENDING",
    },
  });

  if (existingPendingPayment) {
    return existingPendingPayment;
  }

  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      provider,
      amount: order.total,
      status: "PENDING",
    },
  });

  return payment;
};
export const createEsewaPaymentService = async (
  userId,
  paymentId
) => {
  const id = Number(paymentId);

  if (Number.isNaN(id)) {
    throw new ApiError(400, "Invalid payment ID");
  }

  const payment = await prisma.payment.findFirst({
    where: {
      id,
      provider: "ESEWA",

      order: {
        userId,
      },
    },

    include: {
      order: true,
    },
  });

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  if (payment.status === "PAID") {
    throw new ApiError(400, "Payment is already completed");
  }

  if (payment.order.status === "CANCELLED") {
    throw new ApiError(
      400,
      "Cannot pay for a cancelled order"
    );
  }

  const transactionUuid =
    `PAY-${payment.id}-${crypto.randomUUID()}`
      .replace(/[^a-zA-Z0-9-]/g, "");

  const totalAmount = payment.amount.toString();

  const productCode = process.env.ESEWA_PRODUCT_CODE;

  const signature = generateEsewaSignature({
    totalAmount,
    transactionUuid,
    productCode,
  });

  return {
    paymentUrl: process.env.ESEWA_PAYMENT_URL,

    fields: {
      amount: totalAmount,

      tax_amount: "0",

      total_amount: totalAmount,

      transaction_uuid: transactionUuid,

      product_code: productCode,

      product_service_charge: "0",

      product_delivery_charge: "0",

      success_url: process.env.ESEWA_SUCCESS_URL,

      failure_url: process.env.ESEWA_FAILURE_URL,

      signed_field_names:
        "total_amount,transaction_uuid,product_code",

      signature,
    },
  };
};
export const createKhaltiPaymentService = async (
  userId,
  paymentId) => {
  const id = Number(paymentId);

  if (Number.isNaN(id)) {
    throw new ApiError(400, "Invalid payment ID");
  }

  // 1. Find our payment and its order
  const payment = await prisma.payment.findFirst({
    where: {
      id,
      provider: "KHALTI",
      order: {
        userId,
      },
    },
    include: {
      order: true,
    },
  });

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  if (payment.status === "PAID") {
    throw new ApiError(400, "Payment is already completed");
  }

  if (payment.order.status === "CANCELLED") {
    throw new ApiError(400, "Cannot pay for a cancelled order");
  }

  // 2. Khalti requires amount in paisa
  // NPR 529.97 -> 52997 paisa
  const amountInPaisa = Math.round(
    Number(payment.amount) * 100
  );

  // 3. Send payment initiation request to Khalti
  const response = await fetch(
    `${process.env.KHALTI_BASE_URL}/epayment/initiate/`,
    {
      method: "POST",

      headers: {
        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        return_url: process.env.KHALTI_RETURN_URL,
        website_url: process.env.KHALTI_WEBSITE_URL,

        amount: amountInPaisa,

        purchase_order_id: `ORDER-${payment.order.id}`,
        purchase_order_name: `Order #${payment.order.id}`,

        customer_info: {
          name: payment.order.fullName,
          phone: payment.order.phone,
        },
      }),
    }
  );

  const data = await response.json();

  // 4. Handle Khalti API error
  if (!response.ok) {
    console.error("Khalti initiation error:", data);

    throw new ApiError(
      response.status,
      data.detail || "Failed to initiate Khalti payment"
    );
  }
  
  await prisma.payment.update({
    where: {
      id: payment.id,
    },
    data: {
      pidx: data.pidx,
    },
  });

  // 5. Return Khalti response
  return {
    paymentId: payment.id,
    pidx: data.pidx,
    paymentUrl: data.payment_url,
    expiresAt: data.expires_at,
    expiresIn: data.expires_in,
  };
};
export const verifyEsewaPaymentService = async (encodedData) => {
  if (!encodedData) {
    throw new ApiError(400, "eSewa payment data is required");
  }

  // 1. Decode Base64 response from eSewa
  let data;

  try {
    const decodedData = Buffer.from(
      encodedData,
      "base64"
    ).toString("utf8");

    data = JSON.parse(decodedData);
  } catch (error) {
    throw new ApiError(400, "Invalid eSewa response data");
  }

  // 2. Check required fields
  if (
    !data.transaction_uuid ||
    !data.total_amount ||
    !data.product_code ||
    !data.status ||
    !data.signed_field_names ||
    !data.signature
  ) {
    throw new ApiError(
      400,
      "Incomplete eSewa payment response"
    );
  }

  // 3. Verify eSewa response signature
  const isSignatureValid =
    verifyEsewaResponseSignature(data);

  if (!isSignatureValid) {
    throw new ApiError(
      400,
      "Invalid eSewa response signature"
    );
  }

  // 4. Find the payment from OUR database
  const payment = await prisma.payment.findUnique({
    where: {
      transactionUuid: data.transaction_uuid,
    },
    include: {
      order: true,
    },
  });

  if (!payment || payment.provider !== "ESEWA") {
    throw new ApiError(
      404,
      "eSewa payment not found"
    );
  }

  // 5. If already paid, don't process it again
  if (payment.status === "PAID") {
    return {
      verified: true,
      status: "COMPLETE",
      payment,
    };
  }

  // 6. Verify product code
  if (
    data.product_code !==
    process.env.ESEWA_PRODUCT_CODE
  ) {
    throw new ApiError(
      400,
      "Invalid eSewa product code"
    );
  }

  // 7. Verify amount
  const expectedAmount = Number(payment.amount);

  const receivedAmount = Number(
    String(data.total_amount).replace(/,/g, "")
  );

  if (
    !Number.isFinite(receivedAmount) ||
    Math.abs(receivedAmount - expectedAmount) > 0.001
  ) {
    throw new ApiError(
      400,
      "eSewa payment amount does not match"
    );
  }

  // 8. eSewa response must say COMPLETE
  if (data.status !== "COMPLETE") {
    return {
      verified: false,
      status: data.status,
    };
  }

 // 9. Ask eSewa directly for the transaction status
const queryParams = new URLSearchParams({
  product_code: process.env.ESEWA_PRODUCT_CODE,
  total_amount: String(data.total_amount).replace(/,/g, ""),
  transaction_uuid: data.transaction_uuid,
});

const statusResponse = await fetch(
  `https://uat.esewa.com.np/api/epay/transaction/status/?${queryParams.toString()}`
);

if (!statusResponse.ok) {
  throw new ApiError(
    502,
    "Unable to verify transaction with eSewa"
  );
}

const statusData = await statusResponse.json();


// 10. eSewa itself must confirm COMPLETE
if (statusData.status !== "COMPLETE") {
  return {
    verified: false,
    status: statusData.status,
  };
}


// 11. Verify the amount returned by the status API
const statusAmount = Number(
  String(statusData.total_amount).replace(/,/g, "")
);

if (
  !Number.isFinite(statusAmount) ||
  Math.abs(statusAmount - expectedAmount) > 0.001
) {
  throw new ApiError(
    400,
    "Verified eSewa amount does not match"
  );
}


// 12. Update Payment + Order together
const updatedPayment = await prisma.$transaction(
  async (tx) => {
    const updated = await tx.payment.update({
      where: {
        id: payment.id,
      },

      data: {
        status: "PAID",

        transactionId:
          data.transaction_code ||
          statusData.ref_id ||
          null,
      },
    });

    await tx.order.update({
      where: {
        id: payment.orderId,
      },

      data: {
        paymentStatus: "PAID",
      },
    });

    return updated;
  }
);

// 13. Return verified payment
return {
  verified: true,
  status: "COMPLETE",
  payment: updatedPayment,
};
};