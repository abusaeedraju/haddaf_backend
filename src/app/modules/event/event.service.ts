import { prisma } from "../../../utils/prisma"
import { getImageUrls } from "../../helper/uploadFile"

const createEvent = async (payload: any, Photos: any) => {
    const getImages = Photos ? await getImageUrls(Photos) : []

    const event = await prisma.event.create({
        data: {
            ...payload,
            previousMemoryImage: getImages ?? undefined
        }
    })
    return event
}

const getAllEvents = async () => {
    const events = await prisma.event.findMany({})
    return events
}

const getEventById = async (id: string) => {
    const event = await prisma.event.findUnique({ where: { id } })
    return event
}

const updateEvent = async (id: string, payload: any) => {
    const event = await prisma.event.update({ where: { id }, data: {
        ...payload,
        previousMemoryImage: payload.previousMemoryImage ? await getImageUrls(payload.previousMemoryImage) :[]
    } })
    return event
}

const deleteEvent = async (id: string) => {
    const event = await prisma.event.delete({ where: { id } })
    return event
}

export const eventServices = {
    createEvent, getAllEvents, getEventById, updateEvent, deleteEvent
}
