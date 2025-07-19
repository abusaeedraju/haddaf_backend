import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { userServices } from "./user.service";
import sendResponse from "../../middleware/sendResponse";
import { StatusCodes } from "http-status-codes";


const createUserController = catchAsync(async (req: Request, res: Response) => {
    const files = req.files as any
    const profileImage = files?.profileImage?.[0]
    const certificateImage = files?.certificateImage?.[0]
    const body = req.body
    const result = await userServices.createUserIntoDB(body, profileImage, certificateImage)
    sendResponse(res, { statusCode: StatusCodes.CREATED, message: "Please check your email for verification", data: result, success: true })
})

const changePasswordController = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.user
    const body = req.body as any
    const result = await userServices.changePasswordIntoDB(id, body)
    sendResponse(res, { statusCode: StatusCodes.OK, message: "Password updated successfully", data: result, success: true })
})

const updateUserController = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.user
    const body = req?.body as any
    const image = req?.files as any
    const profileImage = image?.profileImage?.[0] || null
    const certificate = image?.certificateImage?.[0] || null
    const result = await userServices.updateUserIntoDB(id, body, profileImage,certificate)
    sendResponse(res, { statusCode: StatusCodes.OK, message: "User updated successfully", data: result, success: true })
})

const getMyProfileController = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.user
    const result = await userServices.getMyProfile(id)
    sendResponse(res, { statusCode: StatusCodes.OK, message: "User profile retrieved successfully", data: result, success: true })
})

export const userController = { createUserController, updateUserController, changePasswordController, getMyProfileController }