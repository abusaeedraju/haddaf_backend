import { prisma } from "../../../utils/prisma"
import { getImageUrls, getImageUrl } from "../../helper/uploadFile"

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
export const eventServices = {
    createEvent, getAllEvents, getEventById, getUpcomingEvents
}
