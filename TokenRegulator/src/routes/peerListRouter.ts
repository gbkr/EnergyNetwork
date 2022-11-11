import express from "express";
import { Controllers } from "energylib";
import DataStore from "../models/datastore";

export const peerListRouter = express.Router();

const peerList = new Controllers.PeerListController(DataStore);

peerListRouter.get("/", peerList.list);
peerListRouter.post("/", peerList.add);
peerListRouter.delete("/", peerList.remove);
