import { Request, Response } from "express";
import { Wallet, types, PeerList } from "energylib";

import DataStore from "../models/datastore";
import axios from "axios";

const tradingController = {
  buy: (req: Request, res: Response) => {
    try {
      const body = req.body;

      if (Wallet.verifyPeerSignature(body)) {
        console.log("Request for token purchase verified");
      } else {
        res.status(403).json({ error: "Invalid transaction" });
        return;
      }

      const { publicKey: recipient } = body;
      const { amount } = body;

      const store = DataStore.getInstance();

      const data = {
        recipient,
        creator: store.peerConfig.publicKey,
        amount,
        targets: store.graph.verifiedTransactionPair(),
        createdAt: new Date().toISOString(),
        type: types.NodeTypes.Transaction,
      };

      const signedTrnx: types.Transaction = Wallet.hashAndSign({
        data,
        keyPair: store.keyPair!,
      });

      const bankData: types.BankAction = {
        transactionHash: signedTrnx.hash,
        amount: signedTrnx.amount,
        createdAt: signedTrnx.createdAt,
        type: "Deposit",
      };

      axios
        .post(`${process.env.BANK_URL}/api/transactions`, bankData)
        .then(async () => {
          const peerUrls = PeerList.getPeerUrls(
            store.peers,
            store.peerConfig.URL
          );
          const tokenRegulatorPubKey = store.peerConfig.publicKey;
          if (
            await store.graph.addTransactionGlobal({
              transaction: signedTrnx,
              peerUrls,
              tokenRegulatorPubKey,
            })
          ) {
            res.status(200).json({ transactionHash: signedTrnx.hash });
          } else {
            res
              .status(403)
              .send({ error: "Invalid transaction or some other issue" });
          }
        });
    } catch (e: any) {
      console.log("Unable to purchase tokens: ", e.message);
      res.status(500).json({ error: e.message });
    }
  },
};

export default tradingController;
