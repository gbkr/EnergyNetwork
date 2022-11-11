import { Request, Response } from "express";
import { PeerConfig, Store, StoreSingleton } from "../types";
import { verifyPeerSignature } from "../wallet";

class PeerListController {
  _store: Store;

  constructor(dataStore: StoreSingleton) {
    this._store = dataStore.getInstance();
  }

  list = (_: Request, res: Response) => {
    try {
      res.status(200).json(this._store.peers);
    } catch (e: any) {
      console.error("Unable to fetch peerList");
      res.status(500).send(e.message);
    }
  };

  add = (req: Request, res: Response) => {
    try {
      const peer: PeerConfig = req.body;
      if (!this._store.peers.includes(peer) && verifyPeerSignature(peer)) {
        this._store.peers = [...this._store.peers, peer];
      }
    } catch (e: any) {
      console.error("Unable to add peer");
      res.status(500).send(e.message);
    }
    res.status(200).json(req.body);
  };

  remove = (req: Request, res: Response) => {
    try {
      const data: PeerConfig = req.body;
      const peers = this._store.peers;
      if (peers.map((peer) => peer.hash).includes(data.hash)) {
        const remainingPeers = peers.filter((peer) => peer.hash !== data.hash);
        this._store.peers = remainingPeers;
      }
      console.log(`Deregistered peer ${data.URL}`);
    } catch (e: any) {
      console.error("Unable to remove peer");
      res.status(500).send(e.message);
    }
    res.status(200).json(req.body);
  };
}

export default PeerListController;
