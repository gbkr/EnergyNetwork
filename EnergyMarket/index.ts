require("dotenv").config({ debug: process.env.DEBUG });
import express, { Application } from "express";
import envConfig from "./envConfig";
import { marketRouter, utilityRouter } from "./routes";

const app: Application = express();

app.use(express.json());
app.use("/api/market", marketRouter);
app.use("/api/utility", utilityRouter);

const port = envConfig().PORT;
const appDomain = envConfig().APP_DOMAIN;

app.listen(port, () => {
  console.log(`EnergyMarket is running at ${appDomain}:${port}`);
});
