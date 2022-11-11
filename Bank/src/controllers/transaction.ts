import { Request, Response } from "express";
import TransactionStore from "../transactionStore";

const transactionController = {
  list: (_: Request, res: Response) => {
    const store = TransactionStore.getInstance();
    return res.status(200).json(store.list());
  },
  add: (req: Request, res: Response) => {
    const body = req.body;
    const store = TransactionStore.getInstance();
    store.add(body);
    return res.status(200).json(body);
  },
};

export default transactionController;
