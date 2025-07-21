import catchAsync from "../../../shared/catchAsync";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../middleware/sendResponse";
import { bookingServices } from "./booking.service";
const createBooking = catchAsync(async (req: any, res: any) => {
    const groundId = req.params.groundId
    const userId = req.user.id
    const bodyData = req.body
    const result = await bookingServices.createBooking(groundId, userId, bodyData);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Booking created successfully",
        data: result,
    });
});
const acceptBooking = catchAsync(async (req: any, res: any) => {
    const bookingId = req.params.bookingId
    console.log(bookingId);
    const result = await bookingServices.acceptBooking(bookingId);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Booking confirmed!",
        data: result,
    });
});
const declineBooking = catchAsync(async (req: any, res: any) => {
    const bookingId = req.params.bookingId
    const result = await bookingServices.declineBooking(bookingId);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Booking declined successfully",
        data: result,
    });
})
const getAllBookings = catchAsync(async (req: any, res: any) => {
    const result = await bookingServices.getAllBookings();
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Bookings retrieved successfully",
        data: result,
    });
})

const getMyBooking = catchAsync(async (req: any, res: any) => {
    const result = await bookingServices.getMyBooking(req.user.id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "My bookings retrieved successfully",
        data: result,
    });
})
const upcomingBookings = catchAsync(async (req: any, res: any) => {
    const result = await bookingServices.upcomingBookings();
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Upcoming bookings retrieved successfully",
        data: result,
    });
})

const viewBookingDetails = catchAsync(async (req: any, res: any) => {
    const bookingId = req.params.bookingId
    const result = await bookingServices.viewBookingDetails(bookingId);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Booking details retrieved successfully",
        data: result,
    });
})

const getFriends = catchAsync(async (req: any, res: any) => {
    const result = await bookingServices.getFriends(req.query.phone);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Friends retrieved successfully",
        data: result,
    });
})
const sendInvitaion = catchAsync(async (req: any, res: any) => {
    const result = await bookingServices.sendInvitaion(req.query.playerId,req.user.id,req.query.bookingId);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Invitation sent successfully",
        data: result,
    });
})

export const bookingController = { createBooking, acceptBooking, declineBooking, getAllBookings,getFriends,upcomingBookings,viewBookingDetails,sendInvitaion,getMyBooking }