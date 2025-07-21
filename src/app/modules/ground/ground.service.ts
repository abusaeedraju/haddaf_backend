import { prisma } from './../../../utils/prisma';

const getGround = async () => {
    const isGround = await prisma.ground.findUnique({
        where: {
            name: "Haddaf Ground"
        }
    })
    if (isGround) {
        const bookedSlots = await prisma.booking.findMany({
            where: {
                groundId: isGround.id
            },
            select: {
                id: true,
                date: true,
                startTime: true,
            }
        })
        return {isGround,bookedSlots}
    }
    else {
        const ground = {
            name: "Haddaf Ground",
            description: "The biggest and the most famous national football tournament is The Hover football tournament Cup.",
            rent: 30,
            facilities: ["Parking Space", "Camera", "Waiting room","Changing rooms"],
            features: ["Hiring Partners", "Miniature Field", "Grass Pitch","Outdoor / Indoor","Natural Grass Pitch"],
            timeSlots: [
                "6:30 AM", "8:00 AM", "9:30 AM", "11:00 AM", "12:30 PM",
                "2:00 PM", "3:30 PM", "5:00 PM", "6:30 PM", "8:00 PM",
                "9:30 PM", "11:00 PM", "12:30 AM", "2:00 AM"]
        }

        const result = await prisma.ground.create({
            data: { ...ground }
        })

        return result
    }
}


export const groundServices = {
    getGround
}