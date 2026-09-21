import crypto from "crypto";

export const generateEsewaSignature = ({
  totalAmount,
  transactionUuid,
  productCode,
}) => {
  const message =
    `total_amount=${totalAmount},` +
    `transaction_uuid=${transactionUuid},` +
    `product_code=${productCode}`;

  return crypto
    .createHmac("sha256", process.env.ESEWA_SECRET_KEY)
    .update(message)
    .digest("base64");
};
// Verify data returned by eSewa
export const verifyEsewaResponseSignature = (data) => {
  if (
    !data?.signed_field_names ||
    !data?.signature
  ) {
    return false;
  }

  if (typeof data.signed_field_names !== "string" || typeof data.signature !== "string") return false;
  const signedFields = data.signed_field_names.split(",");
  const required = ["transaction_code", "status", "total_amount", "transaction_uuid", "product_code", "signed_field_names"];
  if (signedFields.length !== required.length || new Set(signedFields).size !== required.length || required.some(field => !signedFields.includes(field) || data[field] == null)) return false;

  const message = signedFields
    .map((field) => `${field}=${data[field]}`)
    .join(",");

  const expectedSignature = crypto
    .createHmac("sha256", process.env.ESEWA_SECRET_KEY)
    .update(message)
    .digest("base64");

  const receivedBuffer = Buffer.from(
    data.signature,
    "base64"
  );

  const expectedBuffer = Buffer.from(
    expectedSignature,
    "base64"
  );

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    receivedBuffer,
    expectedBuffer
  );
};