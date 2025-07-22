import { PrismaClient, Role } from "@prisma/client";
import { compare, hash } from "bcrypt";
import { jwtHelpers } from "../../helper/jwtHelper";
import { JwtPayload, Secret } from "jsonwebtoken";
import ApiError from "../../error/ApiErrors";
import { OTPFn } from "../../helper/OTPFn";
import OTPVerify from "../../helper/OTPVerify";
import { StatusCodes } from "http-status-codes";

const prisma = new PrismaClient();
const logInFromDB = async (payload: {
  email: string;
  password: string;
  fcmToken?: string;
}) => {
  const findUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });
  if (!findUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }
  const comparePassword = await compare(payload.password, findUser.password);
  if (!comparePassword) {
    throw new ApiError(
      StatusCodes.NON_AUTHORITATIVE_INFORMATION,
      "Invalid password"
    );
  }

  if (findUser.status === "PENDING") {
    OTPFn(findUser.email);
    throw new ApiError(
      401,
      "Please check your email address to verify your account"
    );
  }

  if (payload.fcmToken) {
    await prisma.user.update({
      where: {
        email: payload.email,
      },
      data: {
        fcmToken: payload.fcmToken,
      },
    });
  }
  const userInfo = {
    email: findUser.email,
    name: findUser.name,
    id: findUser.id,
    image: findUser.image,
    role: findUser.role,
    status: findUser.status,
    fcmToken: findUser.fcmToken,
  };
  const token = jwtHelpers.generateToken(userInfo, { expiresIn: "24 hr" });
  return { accessToken: token, ...userInfo };
};

const verifyOtp = async (payload: { email: string; otp: number }) => {
  const { message, accessToken } = await OTPVerify(payload);

  if (message) {
    const updateUserInfo = await prisma.user.update({
      where: {
        email: payload.email 
      },
      data: {
        status: "ACTIVE",
        isVerified: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return {accessToken, updateUserInfo};
  }
};

const forgetPassword = async (payload: { email: string }) => {
  const findUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });
  if (!findUser) {
    throw new Error("User not found");
  }

  OTPFn(findUser.email);
  return;
};

const resetOtpVerify = async (payload: { email: string; otp: number }) => {
  const {accessToken } = await OTPVerify(payload);

  return accessToken;

};

const resendOtp = async (payload: { email: string }) => {
  const findUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });
  if (!findUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }
  OTPFn(findUser.email);
};


const resetPassword = async (payload: { token: string; password: string; confirm_password: string }) => {
  if(payload.password !== payload.confirm_password){
    throw new ApiError(StatusCodes.BAD_REQUEST, "Password and confirm password does not match")
  }
const {email} = jwtHelpers.tokenDecoder(payload.token) as JwtPayload;

  const findUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (!findUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }
  const hashedPassword = await hash(payload.password, 10);
  const result = await prisma.user.update({
    where: {
      email: email,
    },
    data: {
      password: hashedPassword,
    },
  });
  return result;
};

export const authService = {
  logInFromDB,
  forgetPassword,
  verifyOtp,
  resendOtp,
  resetOtpVerify,
  resetPassword
};
