import { Request, Response } from "express";
import { AnyNode, Store, StoreSingleton, PeerConfig } from "../types";

class TransactionController {
  _store: Store;

  constructor(dataStore: StoreSingleton) {
    this._store = dataStore.getInstance();
  }

  add = async (req: Request, res: Response) => {
    try {
      const data: AnyNode = req.body;
      const tokenRegulator = this._store.peers.find(
        (peer: PeerConfig) => peer.type === "TokenRegulator"
      );
      if (
        await this._store.graph.addTransactionLocal(
          data,
          tokenRegulator?.publicKey!
        )
      ) {
        res.status(200);
      } else {
        console.error("Failure adding incomming transaction to graph");
        res.status(500);
      }
    } catch (e) {
      console.error("Failure adding incomming transaction to graph");
      res.status(500);
    }
  };
}

export default TransactionController;
