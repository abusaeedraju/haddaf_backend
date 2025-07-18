import { Router } from "express";
import auth from "../../middleware/auth";
import { Role } from "@prisma/client";
import { fileUploader } from "../../helper/uploadFile";
import { parseBodyMiddleware } from "../../middleware/parseBodyData";
import { eventController } from "./event.controller";

const router = Router()

router.post('/create', auth(Role.ADMIN), fileUploader.userUpload, parseBodyMiddleware, eventController.createEventController) 