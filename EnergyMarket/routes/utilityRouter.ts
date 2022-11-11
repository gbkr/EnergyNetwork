import express from "express";
import { UtilityController } from "../controllers";

export const utilityRouter = express.Router();
const utilityController = new UtilityController();

utilityRouter.post("/release-energy", utilityController.release);
utilityRouter.get("/view-energy/:energyPublicID", utilityController.view);
utilityRouter.post("/consume-energy", utilityController.consume);
utilityRouter.post("/buy", utilityController.buy);
utilityRouter.post("/sell", utilityController.sell);
