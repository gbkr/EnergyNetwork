import { Request, Response } from "express";
import { findTokenRegulator } from "../utils";
import { Wallet } from "energylib";
import DataStore from "../models/datastore";
import axios from "axios";

const tokenTradeController = {
  buy: (_: Request, res: Response) => {
    try {
      const numberOfTokensToPurchase = 50;

      const store = DataStore.getInstance();
      const data = {
        amount: numberOfTokensToPurchase,
        publicKey: store.peerConfig.publicKey,
        paymentDetails: { creditCardNumber: "xxxxxxxxxxxx" },
        validationHashes: [],
      };

      const signedBody = Wallet.hashAndSign({ data, keyPair: store.keyPair! });

      const tokenRegulator = findTokenRegulator();
      if (tokenRegulator) {
        const TRUrl = `${tokenRegulator.URL}/api/tokens/buy`;
        axios
          .post(TRUrl, signedBody)
          .then((resp) => {
            store.fiat = store.fiat - numberOfTokensToPurchase;
            res.status(200).json({
              message: `A request to purchase ${numberOfTokensToPurchase} tokens has been made.`,
              ...resp.data,
            });
          })
          .catch((e: any) => {
            res.status(500).send({ error: e.message });
          });
      } else {
        res.status(500).json({ error: "No token regulator found" });
      }
    } catch (e: any) {
      console.log("Unable to purchase tokens: ", e.message);
      res.status(500).json({ error: e.message });
    }
  },
};

export default tokenTradeController;
