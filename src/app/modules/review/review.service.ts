import { PrismaClient } from "@prisma/client";
import ApiError from "../../error/ApiErrors";
import { StatusCodes } from "http-status-codes";
const prisma = new PrismaClient();

const createReview = async (id: string, payload: any) => {
    const isExistReview = await prisma.review.findFirst({ where: { userId: id, groundId: payload.groundId } })
    if (isExistReview) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Your review already exists")
    }
    const result = await prisma.review.create({ data: { ...payload, userId: id } })
    return result

};

const getReviews = async () => {
    const result = await prisma.review.findMany()
    const averageRating = await prisma.review.aggregate({
        _avg: {
            rating: true
        }
    })
    return {result,averageRating}
};

export const reviewService = {
    createReview,getReviews
};  