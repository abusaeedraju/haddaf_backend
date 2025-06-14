import { Router } from "express";
import { reviewController } from "./review.controller";
import auth from "../../middleware/auth";
import { Role } from "@prisma/client";
const route = Router()

route.post("/create",auth(Role.PLAYER,Role.TRAINER),reviewController.createReviewController)
route.get("/get-reviews",reviewController.getReviewsController)

export const reviewRoutes = route