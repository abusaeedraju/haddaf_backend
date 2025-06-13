import { Router } from "express";
import validateRequest from "../../middleware/validateRequest";
import { authValidation } from "./auth.validation";
import { authController } from "./auth.controller";

const route = Router();

route.post(
  "/login",
  validateRequest(authValidation.loginUser),
  authController.logInUserController
);//checked
route.post(
  "/verify-otp",
  validateRequest(authValidation.verifyOtp),
  authController.verifyOtp
);//checked
route.post(
  "/forget-password",
  validateRequest(authValidation.forgotPassword),
  authController.forgetPasswordController
);//checked

route.post("/forget-otp-verify", authController.forgetOtpVerifyController);//checked

route.post(
  "/resend-otp",
  validateRequest(authValidation.verifyOtp),
  authController.resendOtpController
);//checked

route.post("/reset-password", authController.resetPasswordController);//checked

export const authRoutes = route;
