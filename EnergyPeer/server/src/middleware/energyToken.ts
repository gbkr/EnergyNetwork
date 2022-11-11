import {
  AnyNode,
  EnergyToken,
  NodeTypes,
  PaymentRequest,
  RequestForPayment,
  Transaction,
} from "energylib/src/types";
import { Wallet } from "energylib";
import { Request, Response, NextFunction } from "express";
import DataStore from "../models/datastore";
import { findTokenRegulator, peerURLList } from "../utils";
import { encrypt, decrypt } from "eciesjs";
import { EnergyMeter } from "../services";

export async function consumeEnergyTokenIfAvailable(
  req: Request,
  _: Response,
  next: NextFunction
) {
  if (req?.body?.type !== NodeTypes.EnergyToken) {
    next();
    return false;
  }

  const store = DataStore.getInstance();
  const energyData = <EnergyToken>req.body;

  if (energyData.recipient === store.peerConfig.publicKey) {
    console.log(
      "Peer needs to decrypt and consume token: ",
      energyData.energyToken
    );

    const privateKey = store.keyPair?.getPrivate()!.toBuffer()!;

    const encryptedEnergyToken = Buffer.from(energyData.energyToken, "base64");

    const rfp = store.graph.nodes.find(
      (node: AnyNode) => node.hash === energyData.RFPHash
    ) as RequestForPayment;

    const decryptedEnergyToken = decrypt(
      privateKey,
      encryptedEnergyToken
    ).toString();

    const boughtEnergyAmount = await EnergyMeter.consume({
      privateEnergyToken: decryptedEnergyToken,
      publicEnergyToken: rfp.energyPublicID,
    });
    console.log("Energy consumed: ", boughtEnergyAmount);
  }

  next();
  return true;
}

export async function addEnergyTokenIfRequired(
  req: Request,
  _: Response,
  next: NextFunction
) {
  if (req?.body?.type !== NodeTypes.Transaction) {
    next();
    return false;
  }

  const store = DataStore.getInstance();

  const transaction = <Transaction>req.body;

  const energyTokenInfo = store.paymentRequests.find(
    (PR: PaymentRequest) =>
      PR.energyPublicID === transaction.paymentForRFP?.energyPublicID &&
      PR.buyerPublicKey === transaction.creator &&
      PR.price === transaction.amount
  );

  const shouldIssueEnergyToken = typeof energyTokenInfo !== "undefined";

  if (shouldIssueEnergyToken) {
    console.log(
      `RFP ${transaction.paymentForRFP?.energyPublicID} has been paid for and needs to be issue by ${store.peerConfig.publicKey}`
    );

    const encryptedEnergyToken = encrypt(
      transaction.creator,
      Buffer.from(energyTokenInfo.privateEnergyToken)
    );

    const data = {
      creator: store.peerConfig.publicKey,
      recipient: transaction.creator,
      type: NodeTypes.EnergyToken,
      targets: store.graph.verifiedTransactionPair(),
      createdAt: new Date().toISOString(),
      amount: energyTokenInfo.amount, //transaction.amount,
      energyToken: encryptedEnergyToken.toString("base64"),
      RFPHash: transaction?.paymentForRFP?.rfpHash,
    };

    const keyPair = store.keyPair!;
    const encryptedTokenTransaction: EnergyToken = Wallet.hashAndSign({
      data,
      keyPair,
    });
    await store.graph.addTransactionGlobal({
      transaction: encryptedTokenTransaction,
      peerUrls: peerURLList(),
      tokenRegulatorPubKey: findTokenRegulator()?.publicKey!,
    });
  }

  next();
  return true;
}
