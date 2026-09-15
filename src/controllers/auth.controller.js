import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { registerUserService,loginUserService } from "../services/auth.service.js";

export const registerUser = asyncHandler(
    async(req,res)=>{
        const user = await registerUserService(req.body);

        return res.status(201).json(
            new ApiResponse(
                201,
                "User registered successfully",
                user
            )
        )
    }
);
export const loginUser = asyncHandler(
  async (req, res) => {
    const result = await loginUserService(req.body);

    return res.status(200).json(
      new ApiResponse(
        200,
        "Login successful",
        result
      )
    );
  }
);
export const getCurrentUser = asyncHandler(
  async (req, res) => {
    return res.status(200).json(
      new ApiResponse(
        200,
        "Current user fetched successfully",
        req.user
      )
    );
  }
);