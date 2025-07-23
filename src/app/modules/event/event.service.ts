import { StatusCodes } from "http-status-codes"
import { prisma } from "../../../utils/prisma"
import { getImageUrls, getImageUrl } from "../../helper/uploadFile"
import ApiError from "../../error/ApiErrors"
import { OTPFn } from "../../helper/OTPFn"
import OTPVerify from "../../helper/OTPVerify"

const createEvent = async (payload: any, Photos: any, groundImage: any) => {
    const getImages = Photos ? await getImageUrls(Photos) : []
    const getGroundImage = groundImage ? await getImageUrl(groundImage) : []
    const event = await prisma.event.create({
        data: {
            ...payload,
            previousMemoryImage: getImages ?? undefined,
            groundImage: getGroundImage ?? undefined,
        }
    })
    return event
}

const getAllEvents = async () => {
    const events = await prisma.event.findMany({})
    return events
}

const getUpcomingEvents = async () => {
    const events = await prisma.event.findMany({
        select: {
            id: true,
            eventName: true,
            tournamentStartDate: true,
            createdAt: true,
            updatedAt: true,
        }
    });

    const today = new Date();

    // 2. Filter for upcoming events only (future dates)
    const upcomingEvents = events.filter(event => {
        const startDate = new Date(event.tournamentStartDate);
        return startDate >= today;
    });

    // 3. Sort upcoming events by start date (ascending)
    upcomingEvents.sort((a, b) => {
        return new Date(a.tournamentStartDate).getTime() - new Date(b.tournamentStartDate).getTime();
    });
    return upcomingEvents
}

const getEventById = async (id: string) => {
    const event = await prisma.event.findUnique({ where: { id } })
    return event
}


const registerForEvent = async (eventId: string, playerId: string, payload: any) => {
    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Event not found")
    }
    const registrationCode = Math.floor(100000 + Math.random() * 900000);
    const registration = await prisma.registration.create({
        data: {
            ...payload,
            eventId,
            playerId,
            registrationCode,
        }
    })

    OTPFn(payload.email)
}

const verifyOtp = async (payload: { email: any; otp: number }) => {
    const { message } = await OTPVerify(payload);

    if (message) {
        const updateInfo = await prisma.registration.update({
            where: {
                email: payload.email
            },
            data: {
                isVerified: true,
            },
            select: {
                id: true,
                email: true,
                teamName: true,
                teamLeaderName: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return updateInfo;
    }
};

const addPlayerToEvent = async (registrationId: string, playerId: string, payload: any) => {
    const result = await prisma.registration.findUnique({ where: { id: registrationId } })
    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Registration not found")
    }
    const player = await prisma.user.findUnique({ where: { id: playerId } })
    if (!player) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Player not found")
    }
    const registration = await prisma.registration.update({
        where: {
            id: registrationId
        },
        data: {
            teamMembers: payload.teamMembers
        }
    })
    return registration
}
const cancelRequest = async (registrationId: string, userId: string, payload: any) => {
    const registration = await prisma.registration.findUnique({
        where: {
            id: registrationId,
            playerId: userId,
        },
    });
    if (!registration) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Registration not found!");
    }

    const cancelRequest = await prisma.cancelRequest.create({
        data: {
            registrationId,
            userId,
            reason: payload.reason,
        },
    });
    return cancelRequest;
};

const getAllCancelRequest = async () => {
    const cancelRequest = await prisma.cancelRequest.findMany({
        select: {
            id: true,
            userId: true,
            reason: true,
            createdAt: true,
            registrationDetails: {
                select: {
                    id: true,
                    teamName: true,
                    phone: true,
                    registrationCode: true,
                },
            },
        },
    });
    return cancelRequest;
};

const getAllRegistration = async () => {
    const registration = await prisma.registration.findMany({
        select: {
            id: true,
            teamName: true,
            phone: true,
            registrationCode: true,
            createdAt: true,
            status: true,
            eventDetails: {
                select: {
                    id: true,
                    eventName: true,
                    tournamentStartDate: true,
                    tournamentStartTime: true,
                    groundName: true,
                },
            },
            teamLeaderName: true,
            email: true,
            teamMembers: true,
        },
    });
    const teamMemberCount = registration?.map((registration) => {
        const teamMemberCount = Array.isArray(registration?.teamMembers)
        ? registration.teamMembers.length
        : 0;
        return { ...registration, teamMemberCount };
    });
    return teamMemberCount;
};

export const eventServices = {
    createEvent, getAllEvents, getEventById, getUpcomingEvents, registerForEvent, verifyOtp, addPlayerToEvent, cancelRequest, getAllCancelRequest, getAllRegistration
}

