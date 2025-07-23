import { StatusCodes } from "http-status-codes";
import { prisma } from "../../../utils/prisma";
import ApiError from "../../error/ApiErrors";
import { stripe } from "../../../config/stripe";
import { createStripeCustomerAcc } from "../../helper/createStripeCustomerAcc";
import { console } from "inspector";
interface payloadType {
  amount: number;
  paymentMethodId: string;
  paymentMethod?: string;
  registrationId?: string;
}

const createIntentInStripeForRegistration = async (payload: payloadType, userId: string) => {
  const findUser = await prisma.user.findUnique({ where: { id: userId } });

  if (!findUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
  }

  // Create Stripe customer if not exists
  let updatedUser: any;
  if (!findUser.customerId) {
    updatedUser = await createStripeCustomerAcc(findUser); // ✅ Must return updated user with customerId
  }

  const customerId = findUser.customerId || updatedUser?.customerId;
  if (!customerId) {
    throw new ApiError(StatusCodes.EXPECTATION_FAILED, "Missing Stripe customer ID");
  }

  // Attach payment method
  await stripe.paymentMethods.attach(payload.paymentMethodId, {
    customer: customerId as string,
  });

  await stripe.customers.update(customerId as string, {
    invoice_settings: {
      default_payment_method: payload.paymentMethodId,
    },
  });
  // Create Stripe payment intent
  const payment = await stripe.paymentIntents.create({
    amount: Math.round(payload.amount * 100),
    currency: "usd", // ✅ FIXED: don't use paymentMethod as currency
    payment_method: payload.paymentMethodId,
    customer: customerId,
    confirm: true,
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: "never",
    },
  });

  if (payment.status !== "succeeded") {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Payment failed");
  }

  // Save payment
  const paymentData = await prisma.payment.create({
    data: {
      userId,
      amount: payload.amount,
      paymentMethod: payload.paymentMethod,
      registrationId: payload.registrationId as string,
      paymentId: payment.id,
    },
  });

  // update registration payment status
  await prisma.registration.update({
    where: {
      id: payload.registrationId as string,
    },
    data: {
      isPaid: true,
      paymentId: paymentData?.id,
    },
  });

  return payment;
};



/* const saveCardInStripe = async (payload: {
  paymentMethodId: string;
  cardholderName?: string;
  userId: string;
}) => {
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    throw new ApiError(404, "User not found!");
  }
  const { paymentMethodId, cardholderName } = payload;
  let customerId = user.customerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email as string,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: payload.userId },
      data: { customerId },
    });
  }

  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: "card",
  });

  const newCard: any = await stripe.paymentMethods.retrieve(paymentMethodId);

  const existingCard = paymentMethods.data.find(
    (card: any) => card.card.last4 === newCard.card.last4
  );

  if (existingCard) {
    throw new ApiError(409, "This card is already saved.");
  } else {
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
    await stripe.paymentMethods.update(paymentMethodId, {
      billing_details: {
        name: cardholderName,
      },
    });
    return {
      message: "Customer created and card saved successfully",
    };
  }
}; */

/* const getSaveCardsFromStripe = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(404, "User not found!");
  }
  try {
    const saveCard = await stripe.paymentMethods.list({
      customer: user?.customerId || "",
      type: "card",
    });

    const cardDetails = saveCard.data.map((card: Stripe.PaymentMethod) => {
      return {
        id: card.id,
        brand: card.card?.brand,
        last4: card.card?.last4,
        type: card.card?.checks?.cvc_check === "pass" ? "valid" : "invalid",
        exp_month: card.card?.exp_month,
        exp_year: card.card?.exp_year,
        billing_details: card.billing_details,
      };
    });

    return cardDetails;
  } catch {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
  }
}; */

/* const deleteCardFromStripe = async (userId: string, last4: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(404, "User not found!");
  }
  if (!user.customerId) {
    throw new ApiError(404, "Card is not saved");
  }

  const paymentMethods = await stripe.paymentMethods.list({
    customer: user.customerId,
    type: "card",
  });
  const card = paymentMethods.data.find(
    (card: any) => card.card.last4 === last4
  );
  if (!card) {
    throw new ApiError(404, "Card not found!");
  }
  await stripe.paymentMethods.detach(card.id);
}; */

/* const splitPaymentFromStripe = async (
  payload: {
    amount: number;
    paymentMethodId: string;
    serviceId: string;
    providerId: string;
    paymentMethod?: string;
  },
  id: string
) => {
  console.log(id, payload, "id");

  const findMe = await prisma.user.findUnique({
    where: { id: id },
  });

  console.log(findMe, "findMe");

  if (!findMe) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
  }
  if (findMe?.customerId === null) {
    await createStripeCustomerAcc(findMe);
  }

  const findService = await prisma.service.findUnique({
    where: { id: payload.serviceId },
  });

  if (!findService) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Service not found!");
  }
  const pm = await stripe.paymentMethods.retrieve(payload.paymentMethodId);

  if (pm.customer !== findMe.customerId) {
    await stripe.paymentMethods.attach(payload.paymentMethodId, {
      customer: findMe.customerId as string,
    });
  }

  const finderUser = await prisma.user.findUnique({
    where: { id: findService.engineerId as string },
  });

  if (finderUser?.connectAccountId === null) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
  }
  const payment = await stripe.paymentIntents.create({
    amount: Math.round(payload.amount * 100),
    currency: payload?.paymentMethod || "usd",
    payment_method: payload.paymentMethodId,
    confirm: true,
    customer: findMe?.customerId as string, // ✅ Add this
    payment_method_types: ["card"], // 🔥 Important: to avoid auto-redirects or default behavior
    application_fee_amount: Math.round(payload.amount * 0.05 * 100), // $5 in cents
    transfer_data: {
      destination: finderUser?.connectAccountId as string,
    },
  });

  if (payment.status !== "succeeded") {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Payment failed!");
  }

  await prisma.payment.create({
    data: {
      userId: id,
      amount: payload.amount,
      paymentMethod: payload.paymentMethod,
      serviceId: payload.serviceId,
    },
  });

  const result = await prisma.service.update({
    where: {
      id: payload.serviceId,
    },
    data: {
      isPaid: true,
      paymentId: payment.id,
      bookingStatus: "COMPLETED",
    },
  });

  return result;

  // await prisma.booking.update({
  //     where: {
  //         id: payload.bookingId,
  //     },
  //     data: {
  //         isPaid: true,
  //     },
  // });
};
 */

/* const transferAmountFromStripe = async (payload: {
  amount: number;
  connectAccountId: string;
}) => {
  const transfer = await stripe.transfers.create({
    amount: Math.round(payload.amount * 0.92 * 100),
    currency: "usd",
    destination: payload.connectAccountId, // Connect account ID
    source_type: "card",
  });

  return transfer;
}; */

//  const refundPaymentFromStripe = async (registrationId: string, userId: string) => {
//   const findPayment = await prisma.payment.findUnique({
//     where: {
//       registrationId,
//       userId,
//     },
//   });
//   if (!findPayment) {
//     throw new ApiError(StatusCodes.NOT_FOUND, "Payment not found!");
//   }

//   const payment = await stripe.refunds.create({
//     payment_intent: findPayment?.paymentId || "",
//     amount: Math.round(findPayment.amount * 100), // Amount in cents
//   });
//   return payment;
// }; 

// const subscribeToPlanFromStripe = async (payload: any) => {

//   console.log("hello");

//   console.log("payload", payload)
//   const findUser = await prisma.user.findUnique({
//     where: {
//       id: payload.userId,
//     },
//   });
//   console.log("findUser", findUser)
//   if (!findUser) {
//     throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
//   }


//   if (!findUser?.customerId) {
//     await createStripeCustomerAcc(findUser);
//   }

//   await stripe.paymentMethods.attach(payload.paymentMethodId, {
//     customer: findUser?.customerId as string,
//   });

//   await stripe.customers.update(findUser.customerId as string, {
//     invoice_settings: {
//       default_payment_method: payload.paymentMethodId,
//     },
//   });

//   const findSubscription = await prisma.subscription.findUnique({
//     where: {
//       id: payload.subscriptionId,
//     },
//   });
//   if (!findSubscription) {
//     throw new ApiError(StatusCodes.NOT_FOUND, "Subscription not found!");
//   }


//   const purchasePlan = (await stripe.subscriptions.create({
//     customer: findUser.customerId as string,
//     items: [{ price: findSubscription.stripePriceId }],
//     trial_period_days: 30,
//   })) as any;

//   const subscriptionItem = purchasePlan.items.data[0];

//   console.log("subscriptionItem", subscriptionItem);

//   const updateUserPlan = await prisma.subscriptionUser.upsert({
//     where: {
//       userId: payload.userId,
//     },
//     update: {
//       subscriptionPlanId: payload?.subscriptionId, // or map to your internal plan name
//       subscriptionId: purchasePlan?.id,
//       subscriptionStatus: purchasePlan.status,
//       subscriptionStart: new Date(subscriptionItem.current_period_start * 1000),
//       subscriptionEnd: new Date(subscriptionItem.current_period_end * 1000),
//     },
//     create: {
//       userId: payload.userId,
//       subscriptionPlanId: payload?.subscriptionId, // or map to your internal plan name
//       subscriptionId: purchasePlan?.id,
//       subscriptionStatus: purchasePlan.status,
//       subscriptionStart: new Date(subscriptionItem.current_period_start * 1000),
//       subscriptionEnd: new Date(subscriptionItem.current_period_end * 1000),
//       trialEndsAt: new Date(purchasePlan.trial_end * 1000),
//     },
//   });

//   await prisma.user.update({
//     where: {
//       id: payload.userId,
//     },
//     data: {
//       subscription:
//         findSubscription.name.split(" ")[0] == "Basic" ? "BASIC" : "PREMIUM",
//     },
//   });

//   return updateUserPlan;

// };
export const paymentService = {
  createIntentInStripeForRegistration,
  //refundPaymentFromStripe,
  // createIntentInStripeForDonation,
  // getDonation,
  // saveCardInStripe,
  // getSaveCardsFromStripe,
  // deleteCardFromStripe,
  // splitPaymentFromStripe,
  // transferAmountFromStripe,
  // subscribeToPlanFromStripe,
};
