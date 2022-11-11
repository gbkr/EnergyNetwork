import { types } from "energylib";
import DataStore from "../models/datastore";
import { buyEnergy, sellEnergy, buyTokens } from "../models/transactions";
import envConfig from "../envConfig";

const runSimulation = () => {
  const store = DataStore.getInstance();
  let hour = 0;
  let usage: types.EnergyProsumption[] = [];

  const interval = setInterval(async () => {
    // temp code: some net consumers, some net producers

    let consRate;
    let prodRate;

    if (Math.random() > 0.5) {
      consRate = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
      prodRate = Math.floor(Math.random() * 6);
    } else {
      prodRate = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
      consRate = Math.floor(Math.random() * 6);
    }

    let consumption = Math.floor(Math.random() * consRate);
    let production = Math.floor(Math.random() * prodRate);
    let net = production - consumption;

    let lastHourUsage = {
      hour,
      net,
      consumption,
      production,
    };

    usage = [...usage, lastHourUsage];
    store.prosumption = [lastHourUsage];
    hour = hour + 1; // % 24;
    store.availableEnergy = store.availableEnergy + net;

    if (store.availableEnergy > parseInt(envConfig().STORAGE_SELL_LIMIT)) {
      sellEnergy();
    } else if (
      store.availableEnergy < parseInt(envConfig().STORAGE_BUY_LIMIT)
    ) {
      const balance = store.graph.peerBalance(store.peerConfig.publicKey);
      // TODO: something about this magic number
      if (balance < 20) {
        const result = await buyTokens();
        if (!result.success) {
          console.error(result);
        }
      }
      buyEnergy();
    }
  }, 1000);

  return interval;
};

export default runSimulation;
