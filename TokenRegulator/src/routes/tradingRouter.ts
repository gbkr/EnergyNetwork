import express from "express";
import tradingController from "../controllers/trading";

export const tradingRouter = express.Router();

tradingRouter.post("/buy", tradingController.buy);
