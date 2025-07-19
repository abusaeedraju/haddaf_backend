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


export const eventController = {
    createEventController,
    getAllEventsController,
    getUpcomingEventsController,
    getEventByIdController,
}