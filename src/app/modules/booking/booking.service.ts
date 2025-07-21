import { StatusCodes } from "http-status-codes"
import { prisma } from "../../../utils/prisma"
import ApiError from "../../error/ApiErrors"
import { notificationServices } from "../notifications/notification.service"
import { inviteStatus } from "@prisma/client"

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

const getMyBooking = async (userId: string) => {
    const booking = prisma.booking.findMany({
        where: {
            userId
        }
    })
    return booking
}

export const upcomingBookings = async () => {
    const allBookings = await prisma.booking.findMany({
        select: {
            id: true,
            date: true,
            startTime: true,
            ground: {
                select: {
                    name: true,
                    rent: true,
                    image: true
                }
            },
        }
    });

    const now = new Date();

    const upcomingEvents = allBookings
        .map((booking) => {
            const dateTimeString = `${booking.date} ${booking.startTime}`; // e.g., "22 July 2025 3:30 PM"
            const parsedDate = new Date(dateTimeString);

            return {
                ...booking,
                fullDateTime: parsedDate, // attach parsed datetime for comparison/sorting
            };
        })
        .filter((booking) => booking.fullDateTime > now)
        .sort((a, b) => a.fullDateTime.getTime() - b.fullDateTime.getTime());

    return upcomingEvents;
};

const viewBookingDetails = async (bookingId: string) => {
    const booking = await prisma.booking.findUnique({
        where: {
            id: bookingId
        },
        select: {
            id: true,
            date: true,
            startTime: true,
            bookingCode: true,
            ground: {
                select: {
                    name: true,
                    rent: true,
                    image: true
                }
            }
        }
    })
    if (!booking) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found")
    } else {
        return booking
    }
}



const getFriends = async (phone: string) => {

    if (phone) {
        const result = await prisma.user.findFirst({
            where: {
                phone,
                role: "PLAYER"
            },
            select: {
                id: true,
                name: true,
                image: true,
                phone: true,
                role: true
            }
        })
        if (!result) {
            throw new ApiError(StatusCodes.NOT_FOUND, "User not found")
        }
        return result
    }

    const result = prisma.user.findMany({
        where: {
            role: "PLAYER"
        },
        select: {
            id: true,
            name: true,
            image: true,
            phone: true,
            role: true
        }
    })
    return result
}
const sendInvitation = async (playerId: string, userId: string, bookingId: string) => {
    const player = await prisma.user.findUnique({
      where: { id: playerId }
    });
  
    if (!player) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Player not found");
    }
  
    const booking: any = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true } // so you can access booking.user.name for notification
    });
  
    if (!booking || booking.userId !== userId) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found or unauthorized");
    }
  
    const newPlayer = {
      id: playerId,
      name: player.name,
      image: player.image,
      phone: player.phone,
      role: player.role,
      status: "PENDING"
    };
  
    let players: any[] = Array.isArray(booking.players)
      ? booking.players
      : typeof booking.players === "string"
      ? JSON.parse(booking.players)
      : [];
  
    const exists = players.some((p: any) => p.id === playerId);
    if (exists) {
      return booking.players; // already invited
    }
  
    players.push(newPlayer);
  
    await prisma.booking.update({
      where: { id: bookingId },
      data: { players }
    });
  
    await notificationServices.sendSingleNotification(userId, playerId, {
      title: "Match Invitation",
      body: `You have been invited to play with your friends ${booking.user.name}`,
      bookingId
    });
  
    return booking.players;
  };
  

  const respondToInvitation = async (
    userId: string,
    payload: { bookingId: string; status: "ACCEPTED" | "DECLINED" }
  ) => {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
  
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }
  
    const booking = await prisma.booking.findUnique({
      where: { id: payload.bookingId }
    });
  
    if (!booking) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
    }
  
    let players: any[] = Array.isArray(booking.players)
      ? booking.players
      : typeof booking.players === "string"
      ? JSON.parse(booking.players)
      : [];
  
    // Find if player exists
    const index = players.findIndex(p => p.id === userId);
    if (index === -1) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Player not found in this booking");
    }
  
    // If ACCEPTED → update status
    if (payload.status === "ACCEPTED") {
      players[index].status = "INVITED";
  
      await prisma.booking.update({
        where: { id: payload.bookingId },
        data: { players }
      });
  
      return players[index];
    }
  
    // If DECLINED → remove the player
    if (payload.status === "DECLINED") {
      const updatedPlayers = players.filter(p => p.id !== userId);
  
      await prisma.booking.update({
        where: { id: payload.bookingId },
        data: { players: updatedPlayers }
      });
  
      return {status: "DECLINED"}
    }
  
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid status value");
  };
  
  


export const bookingServices = {
    createBooking, acceptBooking, declineBooking, getAllBookings, getFriends, upcomingBookings, viewBookingDetails, sendInvitation, getMyBooking, respondToInvitation
}
