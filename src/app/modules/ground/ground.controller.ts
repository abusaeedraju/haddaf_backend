
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../middleware/sendResponse";
import { prisma } from "../../../utils/prisma";

const createGroundController = catchAsync(async (req: any, res: any) => {
   const isGround = await prisma.ground.findUnique({
      where: {
         name: "Ground 1"
      }
   })
   if (isGround) {
      sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Ground is here...", data: isGround })
   }
   else {
      const ground = {
         name: "Ground 1",
         description: "Ground 1 description",
         rent: 30,
         facilities: ["Basketball", "Tennis", "Badminton"],
         features: ["Swimming Pool", "Gym", "Playground"],
         timeSlots: [
            "6:30 AM", "8:00 AM", "9:30 AM", "11:00 AM", "12:30 PM",
            "2:00 PM", "3:30 PM", "5:00 PM", "6:30 PM", "8:00 PM",
            "9:30 PM", "11:00 PM", "12:30 AM", "2:00 AM"]
      }

      const result = await prisma.ground.create({
         data: { ...ground }
      })
      const timeSlots = [
         "6:30 AM", "8:00 AM", "9:30 AM", "11:00 AM", "12:30 PM",
         "2:00 PM", "3:30 PM", "5:00 PM", "6:30 PM", "8:00 PM",
         "9:30 PM", "11:00 PM", "12:30 AM", "2:00 AM", "3:30 AM"
      ]

      sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Ground is here...", data: result })
   }
})

export const groundController = { createGroundController }