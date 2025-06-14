
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../middleware/sendResponse";
import { prisma } from "../../../utils/prisma";
import { groundServices } from "./ground.service";

const createGroundController = catchAsync(async (req: any, res: any) => {

   const result = await groundServices.getGround()
   console.log(result)
   sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Ground is here...", data: result })

})

export const groundController = { createGroundController }