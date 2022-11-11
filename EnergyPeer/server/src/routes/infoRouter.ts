import express from "express";
import DataStore from "../models/datastore";
import { Request, Response } from "express";

export const infoRouter = express.Router();

const store = DataStore.getInstance();

infoRouter.get("/", (_: Request, res: Response) => {
  const { URL, port, createdAt, type, publicKey } = store.peerConfig;
  res.json({
    config: { URL, port, createdAt, type, publicKey },
    peers: store.peers,
    graph: store.graph,
    info: {
      tokens: store.graph.peerBalance(publicKey),
      availableEnergy: store.availableEnergy,
      fiat: store.fiat,
    },
    prosumption: store.prosumption,
  });
});
