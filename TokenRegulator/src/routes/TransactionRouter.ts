import express from "express";
import { Controllers } from "energylib";
import DataStore from "../models/datastore";

export const transactionRouter = express.Router();

const transactions = new Controllers.TransactionController(DataStore);

transactionRouter.post("/new", transactions.add);
