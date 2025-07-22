import { Router } from "express";
import validateRequest from "../../middleware/validateRequest";
import { userController } from "./user.controller";
import { UserValidation } from "./user.validation";
import auth from "../../middleware/auth";
import { Role } from "@prisma/client";
import { fileUploader } from "../../helper/uploadFile";
import { parseBodyMiddleware } from "../../middleware/parseBodyData";

const route = Router()

route.post('/create',fileUploader.userUpload, parseBodyMiddleware, userController.createUserController)

route.put('/change-password', auth(), validateRequest(UserValidation.changePasswordValidation), userController.changePasswordController)

route.put("/me",auth(), fileUploader.userUpload, parseBodyMiddleware, userController.updateUserController)
route.get("/me",auth() ,userController.getMyProfileController)

route.get("/all",auth(Role.ADMIN) ,userController.getAllUserController)
route.get("/my-joined-event",auth() ,userController.getMyJoinedEventController)

export const userRoutes = route 