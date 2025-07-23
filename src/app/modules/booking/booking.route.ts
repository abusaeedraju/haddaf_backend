import express from "express";
import { bookingController } from "./booking.controller";
import validateRequest from "../../middleware/validateRequest";
import auth from "../../middleware/auth";
import { Role } from "@prisma/client";

const route = express.Router();

route.post(
    "/request/:groundId", auth(), bookingController.createBooking
);
route.put(
    "/accept/:bookingId", auth(Role.ADMIN), bookingController.acceptBooking
);
route.put(
    "/decline/:bookingId", auth(Role.ADMIN), bookingController.declineBooking
);
route.get(
    "/all-bookings", auth(Role.ADMIN), bookingController.getAllBookings
);
route.get(
    "/me", auth(), bookingController.getMyBooking
);

route.get("/upcoming", auth(), bookingController.upcomingBookings);
route.get("/details/:bookingId", auth(), bookingController.viewBookingDetails);

route.get("/get-friend-list", auth(Role.PLAYER), bookingController.getFriends);
route.put("/send-invitation", auth(Role.PLAYER), bookingController.sendInvitation);
route.put("/respond-to-invitation", auth(Role.PLAYER), bookingController.respondToInvitation);
route.post("/refund-request/:bookingId", auth(Role.PLAYER), bookingController.refundRequestController);
route.get("/refund-request/all", auth(Role.ADMIN), bookingController.getAllRefundRequestController);
route.put("/refund-request/accept/:refundId", auth(Role.ADMIN), bookingController.acceptRefundRequestController);
route.put("/refund-request/decline/:refundId", auth(Role.ADMIN), bookingController.declineRefundRequestController);
route.get("/refund-history", auth(Role.PLAYER), bookingController.getRefundHistoryController);

export const bookingRoutes = route  