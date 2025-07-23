import { Router } from "express";
import auth from "../../middleware/auth";
import { Role } from "@prisma/client";
import { fileUploader } from "../../helper/uploadFile";
import { parseBodyMiddleware } from "../../middleware/parseBodyData";
import { eventController } from "./event.controller";

const router = Router()

router.post('/create', auth(Role.ADMIN), fileUploader.userUpload, parseBodyMiddleware, eventController.createEventController) 
router.get('/all', auth(Role.ADMIN), eventController.getAllEventsController)
router.get('/upcoming', auth(), eventController.getUpcomingEventsController)
router.get('/details/:eventId', auth(), eventController.getEventByIdController)
router.post('/register/:eventId', auth(), eventController.registerForEventController)
router.post('/verify-otp', auth(), eventController.verifyOtpController)
router.post('/add-player/:registrationId', auth(), eventController.addPlayerToEventController)
router.post('/cancel-request/:registrationId', auth(), eventController.cancelRequestController)
router.get('/cancel-request/all', auth(Role.ADMIN), eventController.getAllCancelRequestController)
router.get('/registration/all', auth(Role.ADMIN), eventController.getAllRegistrationController)

export const eventRoutes = router