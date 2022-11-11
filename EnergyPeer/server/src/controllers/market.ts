import { Request, Response } from "express";
import DataStore from "../models/datastore";
import { EnergyMeter } from "../services";
import { ReqStatus } from "../types";
import { findTokenRegulator, peerURLList } from "../utils";
import { types } from "energylib";
import { buyEnergy, sellEnergy } from "../models/transactions";

export const marketController = {
  buyerDetails: (req: Request, res: Response) => {
    const store = DataStore.getInstance();
    const buyer = <types.Buyer>req.body;
    console.log("Seller updated with buyer details: ", buyer);
    store.sellingOnMarket = false;
    EnergyMeter.releaseToGrid({
      creatorPublicKey: store.peerConfig.publicKey,
    }).then((energyTokens) => {
      store.paymentRequests = [
        ...store.paymentRequests,
        {
          ...energyTokens!,
          buyerPublicKey: buyer.publicKey,
          marketPublicID: buyer.buyerID,
          price: buyer.price,
        },
      ];

      store.graph.createAndPropogateRequestForPayment({
        sellerPublicKey: store.peerConfig.publicKey!,
        buyerPublicKey: buyer.publicKey,
        amount: energyTokens?.amount!,
        peerUrls: peerURLList(),
        tokenRegulatorPubKey: findTokenRegulator()?.publicKey!,
        keyPair: store.keyPair!,
        energyPublicID: energyTokens?.energyPublicID!,
        marketPublicID: buyer.buyerID,
        price: buyer.price,
      });
    });
    res.status(200);
  },
  buy: async (_: Request, res: Response) => {
    const result: ReqStatus = await buyEnergy();
    if (result.success) {
      res.status(200).json({ success: "Buyer added to market" });
    } else {
      res.status(500).json({
        error: `Unable to POST buyer to market: ${result.error?.message}`,
      });
    }
  },

  sell: async (_: Request, res: Response) => {
    const result: ReqStatus = await sellEnergy();
    if (result.success) {
      res.status(200).json({ success: "Seller added to market" });
      return;
    } else {
      res.status(500).json({
        error: `unable to post seller details to market: ${result?.error.message}`,
      });
    }
  },
};
