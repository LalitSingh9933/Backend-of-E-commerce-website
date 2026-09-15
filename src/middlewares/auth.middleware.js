import jwt from "jsonwebtoken";

import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication required");
  }

  const token = authHeader.split(" ")[1];

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: Number(decoded.sub),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError(401, "User no longer exists");
  }

  req.user = user;

  next();
});