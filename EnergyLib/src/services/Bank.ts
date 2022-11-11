import axios from "axios";

import axiosRetry from "axios-retry";
import { BankAction } from "../types";

axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay });

export const verifyTransactionDeposit = async ({
  transactionHash,
  amount,
}: {
  transactionHash: string;
  amount: number;
}) => {
  const bankUrl = `${process.env.BANK_URL}/api/transactions`;
  if (!bankUrl) {
    throw new Error("Bank URL must be configured");
  }

  const { data } = await axios.get<BankAction[]>(bankUrl);
  const transactionData = data.filter(
    (transaction: BankAction) =>
      transaction.transactionHash === transactionHash && amount === amount
  );

  // ensure the deposit hasn't been withdrawn
  return transactionData.length === 1 && transactionData[0]?.type === "Deposit";
};
