import { StatusCodes } from "http-status-codes"
import { prisma } from "../../../utils/prisma"
import ApiError from "../../error/ApiErrors"

const createBooking = async (groundId: string, userId: string, payload: any) => {

    const isBooked = await prisma.booking.findFirst({
        where: {
            startTime: payload.startTime,
            date: payload.date
        }
    })
    if (!isBooked) {
        const bookingCode = Math.floor(100000 + Math.random() * 900000);
        const booking = await prisma.booking.create({
            data: {
                groundId,
                userId,
                bookingCode,
                ...payload
            }
        })
        return booking
    } else {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Ground is already booked this time, please choose another time")
    }
}
const acceptBooking = async (bookingId: string) => {
    console.log(bookingId);
    const isBooking = await prisma.booking.findUnique({
        where: {
            id: bookingId
        }
    })
    if (!isBooking) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found")
    } else if (isBooking.status === "DECLINED") {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Booking is already declined")
    } else if (isBooking.status !== "PENDING") {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Booking is already accepted")
    }
    else {
        const booking = prisma.booking.update({
            where: {
                id: bookingId
            },
            data: {
                status: "BOOKED"
            }
        })
        return booking
    }

}
const declineBooking = async (bookingId: string) => {

    const booking = prisma.booking.update({
        where: {
            id: bookingId
        },
        data: {
            status: "DECLINED"
        }
    })
    return booking
}

const getAllBookings = async () => {

    const booking = prisma.booking.findMany({})
    if (!booking) {
        throw new ApiError(StatusCodes.NOT_FOUND, "No bookings found")
    } else {
        return booking
    }
}
const getFriends = async () => {

    const result = prisma.user.findMany({
        where: {
            role: "PLAYER"
        },
        select: {
            id: true,
            name: true,
            image: true,
            phone: true,
        }
    })
    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, "No friends found")
    } else {
        return result
    }
}
const searchFriends = async (phone: string) => {

    const result = await prisma.user.findFirst({
        where: {
            phone
        }
    })
    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, "No friends found")
    } else {
        const { password, fcmToken, ...others } = result
        return others
    }
}
export const bookingServices = {
    createBooking, acceptBooking, declineBooking, getAllBookings, getFriends, searchFriends
}