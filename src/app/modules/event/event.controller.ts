import { eventServices } from "./event.service"
import { StatusCodes } from "http-status-codes"
import { Request, Response } from "express"
import sendResponse from "../../middleware/sendResponse"

const createEventController = async (req: Request, res: Response) => {
    const body = req.body
    const files = req.files as any
    const result = await eventServices.createEvent(body, files)
    sendResponse(res, { statusCode: StatusCodes.CREATED, message: "Event created successfully", data: result, success: true })
}

export const eventController = {
    createEventController
}