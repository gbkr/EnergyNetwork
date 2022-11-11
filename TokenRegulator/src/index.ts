require("dotenv").config({ debug: process.env.DEBUG });
import express, { Request, Response, Application } from "express";
import envConfig from "./envConfig";
import { peerListRouter, tradingRouter, transactionRouter } from "./routes";
import DataStore from "./models/datastore";
import { PeerConfig, onShutDown, Wallet } from "energylib";
import Startup from "./startup";
import cors from "cors";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use("/api/peers", peerListRouter);

app.use("/api/tokens", tradingRouter);
app.use("/api/graph", (_: Request, res: Response) => {
  const store = DataStore.getInstance();
  return res.status(200).json(store.graph);
});
app.use("/api/transactions", transactionRouter);

app.get("/", (_: Request, res: Response) => res.send("TokenRegulator"));

const store = DataStore.getInstance();
const keyPair = Wallet.genKeyPair();
const port = envConfig().PORT;
store.keyPair = keyPair;
store.peerConfig = new PeerConfig({ port, keyPair, type: "TokenRegulator" });

// broadcast shutdown before exit
onShutDown(() => Startup.shutdown());

app.listen(port, () => {
  const firstNode = `${envConfig().DEFAULT_STARTUP_PEER}`;
  Startup.init(firstNode, store.peerConfig.URL);
  console.log(
    `\nTokenRegulator is running at ${envConfig().APP_DOMAIN}:${port}\n`
  );
});
