import { eventServices } from "./event.service"
import { StatusCodes } from "http-status-codes"
import { Request, Response } from "express"
import sendResponse from "../../middleware/sendResponse"

const createEventController = async (req: Request, res: Response) => {
    const body = req.body as any
    const files = req.files as any
    const memoryImages = files?.["memoryImages"] || null;
    const groundImage = files?.["groundImage"]?.[0] || null;
    const result = await eventServices.createEvent(body, memoryImages, groundImage)
    sendResponse(res, { statusCode: StatusCodes.CREATED, message: "Event created successfully", data: result, success: true })
}

const getAllEventsController = async (req: Request, res: Response) => {
    const result = await eventServices.getAllEvents()
    sendResponse(res, { statusCode: StatusCodes.OK, message: "Events retrieved successfully", data: result, success: true })
}

const getUpcomingEventsController = async (req: Request, res: Response) => {
    const result = await eventServices.getUpcomingEvents()
    sendResponse(res, { statusCode: StatusCodes.OK, message: "Upcoming events retrieved successfully", data: result, success: true })
}

const getEventByIdController = async (req: Request, res: Response) => {
    const { eventId } = req.params
    const result = await eventServices.getEventById(eventId)
    sendResponse(res, { statusCode: StatusCodes.OK, message: "Event retrieved successfully", data: result, success: true })
}

const registerForEventController = async (req: Request, res: Response) => {
    const { eventId } = req.params
    const userId = req.user.id
    const body = req.body as any
    const result = await eventServices.registerForEvent(eventId, userId, body)
    sendResponse(res, { statusCode: StatusCodes.OK, message: "Please go to your email to verify your registration", data: result, success: true })
}

const verifyOtpController = async (req: Request, res: Response) => {
    const body = req.body as any
    const result = await eventServices.verifyOtp(body)
    sendResponse(res, { statusCode: StatusCodes.OK, message: "Please go to your email to verify your registration", data: result, success: true })
}

const addPlayerToEventController = async (req: Request, res: Response) => {
    const registrationId = req.params.registrationId
    const playerId = req.user.id
    const body = req.body as any
    const result = await eventServices.addPlayerToEvent(registrationId, playerId, body)
    sendResponse(res, { statusCode: StatusCodes.OK, message: "Player added to event successfully", data: result, success: true })
}

export const eventController = {
    createEventController,
    getAllEventsController,
    getUpcomingEventsController,
    getEventByIdController,
    registerForEventController,
    verifyOtpController,
    addPlayerToEventController
}