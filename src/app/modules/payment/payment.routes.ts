import { Router } from "express";
import auth from "../../middleware/auth";
import { paymentController } from "./payment.controller";

const route = Router()

route.post('/registration', auth(), paymentController.createPaymentForRegistrationController)    
// route.post('/save-card', auth(Role.USER), paymentController.saveCardController)
// route.get('/get-card', auth(Role.USER), paymentController.getSaveCardController)
// route.delete('/delete-card', auth(Role.USER), paymentController.deleteCardController)
//route.post("/subscribe", auth(Role.USER), paymentController.subscribeToPlanController)

export const paymentRoutes = route