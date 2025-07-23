import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { paymentService } from "./payment.service";
import sendResponse from "../../middleware/sendResponse";
import { StatusCodes } from "http-status-codes";

const createPaymentForRegistrationController = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body as any;
    const { id: userId } = req.user;

    const result = await paymentService.createIntentInStripeForRegistration(payload, userId);
    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: "Payment created successfully",
      data: result,
      success: true,
    });
  }
);

// const subscribeToPlanController = catchAsync(
//   async (req: Request, res: Response) => {
//     const { id: userId } = req.user;
//     const payload = req.body as {
//       paymentMethodId: string;
//       subscriptionId: string;
//     };
//     const body = {...payload, userId}
//     const result = await paymentService.subscribeToPlanFromStripe(body);
//     sendResponse(res, {
//       statusCode: StatusCodes.OK,
//       message: "Plan subscribed successfully",
//       data: result,
//       success: true,
//     });
//   }
// );

// const refundPaymentController = catchAsync(
//   async (req: Request, res: Response) => {
//     const { id: userId } = req.user;
//     const registrationId = req.params.registrationId;
//     const result = await paymentService.refundPaymentFromStripe(registrationId, userId);
//     sendResponse(res, {
//       statusCode: StatusCodes.OK,
//       message: "Payment refunded successfully",
//       data: result,
//       success: true,
//     });
//   }
// );


export const paymentController = {
  createPaymentForRegistrationController,
  //refundPaymentController
  // createDonationController,
  // getDonationController,
  // saveCardController,
  // getSaveCardController,
  // deleteCardController,
  // subscribeToPlanController,
};
