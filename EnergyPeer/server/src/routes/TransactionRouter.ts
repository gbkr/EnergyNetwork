import express from "express";
import { Controllers } from "energylib";
import DataStore from "../models/datastore";
import { validateTransactionIfRequired } from "../middleware/transactions";
import { validateAndPayIfRFPForSelf } from "../middleware/rfp";
import {
  addEnergyTokenIfRequired,
  consumeEnergyTokenIfAvailable,
} from "../middleware/energyToken";

export const transactionRouter = express.Router();

const transactions = new Controllers.TransactionController(DataStore);

transactionRouter.post(
  "/new",
  validateAndPayIfRFPForSelf,
  validateTransactionIfRequired,
  addEnergyTokenIfRequired,
  consumeEnergyTokenIfAvailable,
  transactions.add
);
