import express from "express";
import { bookingController } from "./booking.controller";
import validateRequest from "../../middleware/validateRequest";
import auth from "../../middleware/auth";
import { Role } from "@prisma/client";

const route = express.Router();

route.post(
    "/request/:groundId",
    auth(),
    bookingController.createBooking
);
route.put(
    "/accept/:bookingId",
    auth(Role.ADMIN),
    bookingController.acceptBooking
);
route.put(
    "/decline/:bookingId",
    auth(Role.ADMIN),
    bookingController.declineBooking
);
route.get(
    "/all-bookings",
    auth(Role.ADMIN),
    bookingController.getAllBookings
);

route.get("/upcoming", auth(), bookingController.upcomingBookings);
route.get("/details/:bookingId", auth(), bookingController.viewBookingDetails);

route.get("/get-friend-list", auth(Role.PLAYER), bookingController.getFriends);
route.get("/search-friend", auth(Role.PLAYER), bookingController.searchFriends);

export const bookingRoutes = route