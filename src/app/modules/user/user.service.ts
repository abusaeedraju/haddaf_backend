import { Role, User } from "@prisma/client";
import ApiError from "../../error/ApiErrors";
import { StatusCodes } from "http-status-codes";
import { compare, hash } from "bcrypt"
import jwt, { JwtPayload } from "jsonwebtoken"
import { OTPFn } from "../../helper/OTPFn";
import OTPVerify from "../../helper/OTPVerify";
import { getImageUrl } from "../../helper/uploadFile";
import { prisma } from "../../../utils/prisma";
import { jwtHelpers } from "../../helper/jwtHelper";

const createUserIntoDB = async (payload: User, profileImage: any, certificateImage: any) => {

    const findUser = await prisma.user.findUnique({
        where: {
            email: payload.email
        }
    })
    if (findUser && findUser?.isVerified) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User already exists")
    }
    if (findUser && !findUser?.isVerified) {
        await OTPFn(payload.email)
        return
    }
    const profile = profileImage && await getImageUrl(profileImage)
    const certificate = certificateImage && await getImageUrl(certificateImage)
    const newPass = await hash(payload.password, 10)

    const result = await prisma.user.create({
        data: {
            ...payload,
            password: newPass,
            image: profile,
            certificate: certificate
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            dateOfBirth: true,
            yearsOfExperience: true,
            nid: true,
            image: true,
            certificate: true,
            status: true,
            createdAt: true,
            updatedAt: true
        }
    })
    OTPFn(payload.email)
    return result
}

const changePasswordIntoDB = async (id: string, payload: any) => {

    const findUser = await prisma.user.findUnique({
        where: {
            id
        }
    })
    if (!findUser) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User not found")
    }
    try {
        const isMatch = await compare(payload.oldPassword, findUser.password)
        if (!isMatch) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Old password is incorrect")
        }
        const newPass = await hash(payload.newPassword, 10)
        await prisma.user.update({
            where: {
                id
            },
            data: {
                password: newPass
            }
        })
        return

    } catch {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Old password is incorrect")
    }
}

const updateUserIntoDB = async (id: string, payload: any, profileImage: any, certificate: any) => {


    const userImage = profileImage && await getImageUrl(profileImage)
    const certificateImage = certificate && await getImageUrl(certificate)

    try {
        const result = await prisma.user.update({
            where: {
                id
            },
            data: {
                ...payload,
                image: userImage ?? undefined,
                certificate: certificateImage ?? undefined
            },

        })
        const { password, fcmToken, ...others } = result

        return others

    } catch (error) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User not found")
    }
}


const getMyProfile = async (id: string) => {

    const result = await prisma.user.findUnique({
        where: {
            id
        },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            certificate: true,
            phone: true,
            dateOfBirth: true,
            aboutMe: true,
            yearsOfExperience: true,
            nid: true,
            createdAt: true,
            updatedAt: true
        }
    })
    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User not found")
    }

    const totalBooking = await prisma.booking.count({
        where: {
            userId: id
        }
    })

    return { result, totalBooking }
}

const getAllUser = async (role: Role) => {
    const result = await prisma.user.findMany({
        where: {
            role: role
        },
        select: {
            id: true,
            name: true,
            phone: true,
            role: true
        }
    })

    const totalUser = await prisma.user.count()
    const totalPlayer = await prisma.user.count({
        where: {
            role: Role.PLAYER
        }
    })
    const totalTrainer = await prisma.user.count({
        where: {
            role: Role.TRAINER
        }
    })
    return { result, totalUser, totalPlayer, totalTrainer }
}

const getMyJoinedEvent = async (playerId: string) => {
    const result = await prisma.registration.findMany({
        where: {
            playerId
        },
        select: {
            id: true,

            eventDetails: {
                select: {
                    id: true,
                    eventName: true,
                    lastDayOfRegistration: true,
                }
            }
        }
    })
    return result
}

const eventSummary = async (id: string) => {
    const result = await prisma.registration.findUnique({
        where: {
            id
        },
        select: {
            id: true,
            registrationCode: true,
            teamName: true,
            status: true,
            teamMembers: true,
            eventDetails: {
                select: {
                    id: true,
                    eventName: true,
                    groundName: true,
                    tournamentStartDate: true,
                    tournamentStartTime: true,
                }
            }
        }
    })
    const teamMemberCount = Array.isArray(result?.teamMembers)
        ? result.teamMembers.length
        : 0;
    return { ...result, teamMemberCount }
}



export const userServices = { createUserIntoDB, updateUserIntoDB, changePasswordIntoDB, getMyProfile, getAllUser, getMyJoinedEvent, eventSummary }