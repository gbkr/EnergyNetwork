import express from "express";
import { marketController } from "../controllers";

export const marketRouter = express.Router();
marketRouter.post("/sell", marketController.sell);
marketRouter.post("/buy", marketController.buy);
marketRouter.post("/buyerDetails", marketController.buyerDetails);
