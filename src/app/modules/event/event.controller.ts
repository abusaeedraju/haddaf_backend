import { eventServices } from "./event.service"
import { StatusCodes } from "http-status-codes"
import { Request, Response } from "express"
import sendResponse from "../../middleware/sendResponse"
import catchAsync from "../../../shared/catchAsync"

const createEventController = catchAsync(async (req: Request, res: Response) => {
    const body = req.body as any
    const files = req.files as any
    const memoryImages = files?.["memoryImages"] || null;
    const groundImage = files?.["groundImage"]?.[0] || null;
    const result = await eventServices.createEvent(body, memoryImages, groundImage)
    sendResponse(res, { statusCode: StatusCodes.CREATED, message: "Event created successfully", data: result, success: true })
})

const getAllEventsController = catchAsync(async (req: Request, res: Response) => {
    const result = await eventServices.getAllEvents()
    sendResponse(res, { statusCode: StatusCodes.OK, message: "Events retrieved successfully", data: result, success: true })
})

const getUpcomingEventsController = catchAsync(async (req: Request, res: Response) => {
    const result = await eventServices.getUpcomingEvents()
    sendResponse(res, { statusCode: StatusCodes.OK, message: "Upcoming events retrieved successfully", data: result, success: true })
})

const getEventByIdController = catchAsync(async (req: Request, res: Response) => {
    const { eventId } = req.params
    const result = await eventServices.getEventById(eventId)
    sendResponse(res, { statusCode: StatusCodes.OK, message: "Event retrieved successfully", data: result, success: true })
})

const registerForEventController = catchAsync(async (req: Request, res: Response) => {
    const { eventId } = req.params
    const userId = req.user.id
    const body = req.body as any
    const result = await eventServices.registerForEvent(eventId, userId, body)
    sendResponse(res, { statusCode: StatusCodes.OK, message: "Please go to your email to verify your registration", data: result, success: true })
})

const verifyOtpController = catchAsync(async (req: Request, res: Response) => {
    const body = req.body as any
    const result = await eventServices.verifyOtp(body)
    sendResponse(res, { statusCode: StatusCodes.OK, message: "Please go to your email to verify your registration", data: result, success: true })
})

const addPlayerToEventController = catchAsync(async (req: Request, res: Response) => {
    const registrationId = req.params.registrationId
    const playerId = req.user.id
    const body = req.body as any
    const result = await eventServices.addPlayerToEvent(registrationId, playerId, body)
    sendResponse(res, { statusCode: StatusCodes.OK, message: "Player added to event successfully", data: result, success: true })
})

const cancelRequestController = catchAsync(async (req: Request, res: Response) => {
    const { id: userId } = req.user;
    const registrationId = req.params.registrationId;
    const payload = req.body as any;
    const result = await eventServices.cancelRequest(registrationId, userId, payload);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: "Cancel request sent successfully",
      data: result,
      success: true,
    });
}) 

const getAllCancelRequestController = catchAsync(async (req: Request, res: Response) => {
    const result = await eventServices.getAllCancelRequest()
    sendResponse(res, { statusCode: StatusCodes.OK, message: "Cancel requests retrieved successfully", data: result, success: true })
})

export const eventController = {
    createEventController,
    getAllEventsController,
    getUpcomingEventsController,
    getEventByIdController,
    registerForEventController,
    verifyOtpController,
    addPlayerToEventController,
    cancelRequestController,
    getAllCancelRequestController
}