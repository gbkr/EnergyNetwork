import express from "express";
import { MarketController } from "../controllers";

export const marketRouter = express.Router();
const marketController = new MarketController();

marketRouter.post("/buy", marketController.buy);
marketRouter.post("/sell", marketController.sell);
