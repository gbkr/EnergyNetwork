import { Request, response, Response } from "express";
import { types } from "energylib";
import elliptic from "elliptic";
import { SHA256, enc } from "crypto-js";
import stringify from "json-stable-stringify";
import MarketQueue from "../MarketQueue";
import { notifySeller } from "../services/notifySeller";

export const verifyParticipant = (participant: types.Buyer | types.Seller) => {
  const curve = new elliptic.ec("secp256k1");
  const keyFromPublic = curve.keyFromPublic(participant.publicKey, "hex");
  const { signature, ...data } = participant;
  return keyFromPublic.verify(
    SHA256(stringify(data)).toString(enc.Hex),
    signature as elliptic.ec.Signature
  );
};

class MarketController {
  buy = (req: Request, res: Response) => {
    const buyer: types.Buyer = req.body;

    try {
      const fiveMinutesAgo = new Date(new Date().getTime() - 5 * 60000);

      if (new Date(buyer.createdAt) < fiveMinutesAgo) {
        res.status(403).json({ error: "createdAt must be within 5 minutes" });
        return;
      }

      if (!verifyParticipant(buyer)) {
        res.status(403).json({ error: "cannot verify buyer" });
        return;
      }

      if (MarketQueue.buyerExists(buyer.publicKey)) {
        res.status(409).json({ error: "buyer already registered with market" });
        return;
      }

      const seller = MarketQueue.availableSeller();
      if (seller) {
        notifySeller({ seller, buyer, price: MarketQueue.price() });
        res
          .status(200)
          .json({ success: `Seller assigned: ${seller.publicKey}` });
        return true;
      } else {
        MarketQueue.addBuyer(buyer);
        res.status(200).json({ success: "Buyer added to queue" });
        return;
      }
    } catch (error: any) {
      console.error("Issue processing buyer at market: ", error?.message);
      res.status(500).json({ error: error?.message });
      return;
    }
  };

  sell = (req: Request, res: Response) => {
    const seller: types.Seller = req.body;

    try {
      const fiveMinutesAgo = new Date(new Date().getTime() - 5 * 60000);

      if (new Date(seller.createdAt) < fiveMinutesAgo) {
        res.status(403).json({ error: "createdAt must be within 5 minutes" });
        return;
      }

      if (!verifyParticipant(seller)) {
        res.status(403).json({ error: "cannot verify seller" });
        return;
      }

      if (MarketQueue.sellerExists(seller.publicKey)) {
        res
          .status(409)
          .json({ error: "seller already registered with market" });
        return;
      }

      const buyer = MarketQueue.availableBuyer();
      if (buyer) {
        notifySeller({ seller, buyer, price: MarketQueue.price() });

        res.status(200).json({ success: `Buyer found: ${buyer.publicKey}` });
        return;
      } else {
        MarketQueue.addSeller(seller);
        res.status(200).json({ success: "Seller added to queue" });
        return;
      }
    } catch (error: any) {
      console.error("Issue processing seller at market: ", error?.message);
      res.status(500).json({ error: error?.message });
      return;
    }
  };
}

export default MarketController;
