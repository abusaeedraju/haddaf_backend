import express from "express";
import { groundController } from "./ground.controller";

const router = express.Router();

router.get("/haddaf",groundController.createGroundController);

export const groundRoutes = router;