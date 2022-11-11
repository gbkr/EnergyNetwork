import { Wallet } from "energylib";
import DataStore from "../models/datastore";
import axios from "axios";
import envConfig from "../envConfig";
import { v4 as uuidv4 } from "uuid";
import { findTokenRegulator } from "../utils";

const marketDates = () => {
  const msPerSecond = 1000;
  let date = new Date();
  let expiresAt = new Date(
    date.getTime() +
      parseInt(envConfig().MARKET_EXPIRE_REQUEST_SECONDS) * msPerSecond
  ).toISOString();

  return { expiresAt, createdAt: date.toISOString() };
};

export const sellEnergy = async () => {
  const store = DataStore.getInstance();
  const { createdAt, expiresAt } = marketDates();
  const data = {
    publicKey: store.peerConfig.publicKey,
    URL: `${store.peerConfig.URL}/api/market/buyerDetails`,
    createdAt,
    expiresAt,
  };

  const keyPair = store.keyPair!;
  const payload = Wallet.hashAndSign({ data, keyPair });
  try {
    await axios.post(`${envConfig().MARKET_URL}/api/market/sell`, payload, {
      validateStatus: (status) => status < 500,
    });
    store.sellingOnMarket = true;
    setTimeout(
      async (store) => {
        const exceededMarketWaitTime = store.sellingOnMarket;
        if (exceededMarketWaitTime) {
          sellEnergyToUtility();
        }
        return { success: true };
      },
      parseInt(envConfig().MARKET_EXPIRE_REQUEST_SECONDS) * 1000,
      store
    );
    return { success: true };
  } catch (error: any) {
    return { success: false, error };
  }
};

export const buyEnergy = async () => {
  const store = DataStore.getInstance();

  const buyerID = uuidv4();
  const { createdAt, expiresAt } = marketDates();

  const data = {
    buyerID,
    publicKey: store.peerConfig.publicKey,
    createdAt,
    expiresAt,
  };

  const keyPair = store.keyPair!;
  const payload = Wallet.hashAndSign({ data, keyPair });
  const marketBuyURL = `${envConfig().MARKET_URL}/api/market/buy`;

  try {
    await axios.post(marketBuyURL, payload);
    store.marketBuyIDs.push(buyerID);

    setTimeout(
      async (buyerId, store) => {
        const marketRequestNotSatisfied = store.marketBuyIDs.includes(buyerId);
        if (marketRequestNotSatisfied) {
          purchaseEnergyFromUtility();
        }
        return { success: true };
      },
      parseInt(envConfig().MARKET_EXPIRE_REQUEST_SECONDS) * 1000,
      buyerID,
      store
    );
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error };
  }
};

const purchaseEnergyFromUtility = async () => {
  try {
    const store = DataStore.getInstance();
    const url = `${envConfig().MARKET_URL}/api/utility/buy`;
    const node = store.peerConfig.publicKey;

    const {
      data: { energyAmount, price },
    } = await axios.post(url, { nodeAddress: node });
    store.fiat = store.fiat - price;
    store.availableEnergy = store.availableEnergy + energyAmount;
  } catch (error) {
    console.error(error);
  }
};

const sellEnergyToUtility = async () => {
  try {
    const store = DataStore.getInstance();
    const url = `${envConfig().MARKET_URL}/api/utility/sell`;
    const node = store.peerConfig.publicKey;

    const energyAmount = parseInt(envConfig().DEFAULT_ENERGY_AMOUNT);
    const {
      data: { price },
    } = await axios.post(url, { nodeAddress: node, energyAmount });
    store.fiat = store.fiat + price;
    store.availableEnergy = store.availableEnergy - energyAmount;
  } catch (error) {
    console.error(error);
  }
};

export const buyTokens = async () => {
  try {
    const numberOfTokensToPurchase = 50;

    const store = DataStore.getInstance();
    const data = {
      amount: numberOfTokensToPurchase,
      publicKey: store.peerConfig.publicKey,
      paymentDetails: { creditCardNumber: "xxxxxxxxxxxx" },
      validationHashes: [],
    };

    const signedBody = Wallet.hashAndSign({ data, keyPair: store.keyPair! });

    const tokenRegulator = findTokenRegulator();
    if (tokenRegulator) {
      try {
        const TRUrl = `${tokenRegulator.URL}/api/tokens/buy`;
        const { data } = await axios.post(TRUrl, signedBody);
        return { success: true, data };
      } catch (error) {
        return { success: false, error };
      }
    } else {
      return { success: false, error: { message: "No token regulator found" } };
    }
  } catch (error: any) {
    console.log("Unable to purchase tokens: ", error?.message);
    return { success: false, error };
  }
};
