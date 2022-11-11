import { Request, Response, NextFunction } from "express";
import { NodeTypes, RequestForPayment, Transaction } from "energylib/src/types";
import DataStore from "../models/datastore";
import envConfig from "../envConfig";
import axios from "axios";
import { Wallet } from "energylib";
import { findTokenRegulator, peerURLList } from "../utils";

interface ViewEnergy {
  amount: number;
  creatorPublicKey: string;
  createdAt: string;
  publicID: string;
  privateEnergyToken: string;
  consumed: false;
}

async function validateEnergyWithUtility(
  energyPublicID: string,
  rfpCreatorPubKey: string
) {
  const url = `${
    envConfig().MARKET_URL
  }/api/utility/view-energy/${energyPublicID}`;

  try {
    const resp = await axios.get<ViewEnergy>(url);

    if (resp.status === 404) {
      console.log("Energy not found on utility: ", energyPublicID);
      return false;
    }

    if (resp.status === 200) {
      return (
        resp.data.creatorPublicKey === rfpCreatorPubKey &&
        resp.data.consumed === false
      );
    }
  } catch (error) {
    console.error(
      `Failed to call utility view-energy endpoint with publicID ${energyPublicID}, ${JSON.stringify(
        error
      )}`
    );
    return false;
  }
}

export async function validateAndPayIfRFPForSelf(
  req: Request,
  _: Response,
  next: NextFunction
) {
  const store = DataStore.getInstance();

  if (req.body.type !== NodeTypes.RequestForPayment) {
    next();
    return false;
  }

  const requestForPayment = <RequestForPayment>req.body;

  if (requestForPayment.recipient !== store.peerConfig.publicKey) {
    next();
    return false;
  }

  const rfpHasPayment = store.graph
    .transactions()
    .some((node) => node?.paymentForRFP?.rfpHash === requestForPayment.hash);
  if (rfpHasPayment) {
    console.log(
      "RFP for self has existing payment, ignoring... RFP HASH: ",
      requestForPayment.hash
    );
    next();
    return false;
  }

  if (!store.marketBuyIDs.includes(requestForPayment.marketPublicID)) {
    console.error(
      "The peer did not request the energy with marketPublicID: ",
      requestForPayment.marketPublicID
    );
    next();
    return false;
  }

  if (!Wallet.verifyTransactionSignature(requestForPayment)) {
    console.error(
      `Incoming RFP does not have a valid signature: ${requestForPayment}`
    );
    next();
    return false;
  }

  const isValidEnergy = validateEnergyWithUtility(
    requestForPayment.energyPublicID,
    requestForPayment.creator
  );

  if (await !isValidEnergy) {
    console.error(
      `RFP does not link to valid energy for sale: ${requestForPayment}`
    );
    next();
    return false;
  }

  const peerTokens = store.graph.peerBalance(store.peerConfig.publicKey);
  if (peerTokens < requestForPayment.price) {
    console.error(
      `Peer does not have sufficient funds to pay for RFP. Current funds:${peerTokens}, RFP: ${requestForPayment}`
    );
    next();
    return false;
  }

  // Remove the stored marketID as energy request has been satistifed
  store.marketBuyIDs = store.marketBuyIDs.filter(
    (id) => id !== requestForPayment.marketPublicID
  );

  const data = {
    recipient: requestForPayment.creator,
    creator: requestForPayment.recipient,
    amount: requestForPayment.price,
    targets: store.graph.verifiedTransactionPair(),
    type: NodeTypes.Transaction,
    createdAt: new Date().toISOString(),
    paymentForRFP: {
      rfpHash: requestForPayment.hash,
      energyPublicID: requestForPayment.energyPublicID,
    },
  };

  const keyPair = store.keyPair!;
  const transaction: Transaction = Wallet.hashAndSign({ data, keyPair });
  await store.graph.addTransactionGlobal({
    transaction,
    peerUrls: peerURLList(),
    tokenRegulatorPubKey: findTokenRegulator()?.publicKey!,
  });
  next();
  return true;
}
