import { Request, Response } from "express";
import { hashAndSign } from "energylib/src/wallet";
import DataStore from "../models/datastore";
import axios from "axios";
import envConfig from "../envConfig";

export const buyController = {
  add: (_: Request, res: Response) => {
    const store = DataStore.getInstance();

    const data = {
      buyerPublicKey: store.peerConfig.publicKey,
      URL: `${store.peerConfig.URL}:${store.peerConfig.port}`,
    };
    const keyPair = store.keyPair!;
    const payload = hashAndSign({ data, keyPair });
    try {
      axios
        .post(`${envConfig().MARKET_URL}/api/market/buy`, payload, {
          validateStatus: (status) => status < 500,
        })
        .then((resp) => {
          if (resp.status >= 200 && resp.status < 300) {
            const { publicID } = resp.data;
            store.marketBuyIDs = [publicID];
            res.status(200).json({ message: "buyer details posted to market" });
          } else if (resp.status === 409) {
            res
              .status(resp.status)
              .json({ message: "buyer already listed at market" });
          }
        });
    } catch (e: any) {
      console.error("unable to post buyer details to market: ", e.message);
      res.status(500).json({ error: "unable to post buyer details to market" });
    }
  },
};
