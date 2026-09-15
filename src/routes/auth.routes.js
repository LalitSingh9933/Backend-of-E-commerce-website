import {Router} from "express";
import { registerUser,loginUser, getCurrentUser } from "../controllers/auth.controller.js";
import validate from "../middlewares/validate.middleware.js";
import { registerSchema,loginSchema , } from "../validators/auth.validator.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import  {authenticate} from "../middlewares/auth.middleware.js"

const router = Router ();

router.post(
    "/register",
    validate(registerSchema),
    registerUser
);
router.post(
  "/login",
  validate(loginSchema),
  loginUser
);

router.get(
  "/me",
  authenticate,
  getCurrentUser
);
router.get(
  "/admin-test",
  authenticate,
  authorize("ADMIN"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome Admin",
    });
  }
);

export default router;