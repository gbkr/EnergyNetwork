import express from "express";
import { tokenTradeController } from "../controllers";

export const tokenTradeRouter = express.Router();

tokenTradeRouter.get("/buy", tokenTradeController.buy);
