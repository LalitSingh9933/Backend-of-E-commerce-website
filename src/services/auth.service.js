import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js"
import ApiError from "../utils/ApiError.js";
import { generateAccessToken } from "../utils/jwt.js";

export const registerUserService = async ({
    name,
    email,
    password,
}) => {

    const existingUser = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (existingUser) {
        throw new ApiError(409, "Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });
    return user;
};
export const loginUserService = async ({
  email,
  password,
}) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email or password");
  }

  const accessToken = generateAccessToken(user);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
    accessToken,
  };
};