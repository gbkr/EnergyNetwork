require("dotenv").config({ debug: process.env.DEBUG });
import express, { Request, Response, Application } from "express";
import * as routers from "./routes";
import DataStore from "./models/datastore";
import yargs from "yargs";
import envConfig from "./envConfig";
import { PeerConfig, onShutDown, Wallet } from "energylib";
import path from "path";
import Startup from "./startup";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api/info", routers.infoRouter);
app.use("/api/peers", routers.peerListRouter);
app.use("/api/tokens", routers.tokenTradeRouter);
app.use("/api/transactions", routers.transactionRouter);
app.use("/api/market", routers.marketRouter);
app.use("/api/graph", (_: Request, res: Response) => {
  const store = DataStore.getInstance();
  return res.status(200).json(store.graph);
});

app.use(express.static(path.join(__dirname, "..", "..", "client", "build")));

app.get("/", (_: Request, res: Response) => {
  res.sendFile(
    path.join(__dirname, "..", "..", "client", "build", "index.html")
  );
});

const argv = yargs(process.argv.slice(2))
  .options({ port: { type: "string" }, peer: { type: "string" } })
  .parseSync();

let port: string = envConfig().PORT;
if (argv.port) {
  port = argv.port;
}

const store = DataStore.getInstance();
const keyPair = Wallet.genKeyPair();
store.keyPair = keyPair;
store.peerConfig = new PeerConfig({
  port,
  keyPair,
  type: "EnergyNode",
});

// broadcast shutdown before exit
onShutDown(() => Startup.shutdown());

app.listen(port, () => {
  console.log(`\nServer is running at ${store.peerConfig.URL}\n`);
  // For simplicity, each new node pulls the peerList from the default node
  const firstNode = `${envConfig().APP_DOMAIN}:${envConfig().PORT}`;
  Startup.init(firstNode, store.peerConfig.URL);
});
