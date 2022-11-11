import express from "express";
import transactionController from "../controllers/transaction";

export const transactionRouter = express.Router();

transactionRouter.post("/", transactionController.add);
transactionRouter.get("/", transactionController.list);
