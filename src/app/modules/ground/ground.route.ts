import express from "express";
import { prisma } from "../../../utils/prisma";
import { groundController } from "./ground.controller";

const router = express.Router();

router.get("/haddaf",groundController.createGroundController);

export const groundRoutes = router;