import axios from "axios";
import envConfig from "../envConfig";
import DataStore from "../models/datastore";
interface UtilityResponse {
  energyPublicID: string;
  privateEnergyToken: string;
}

const defaultEnergyAmount = Number(envConfig().DEFAULT_ENERGY_AMOUNT);

export const EnergyMeter = {
  releaseToGrid: async ({
    creatorPublicKey,
    amount = defaultEnergyAmount,
  }: {
    creatorPublicKey: string;
    amount?: number;
  }) => {
    const store = DataStore.getInstance();
    try {
      const utilityUrl = `${envConfig().MARKET_URL}/api/utility/release-energy`;
      const resp = await axios.post<UtilityResponse>(utilityUrl, {
        amount,
        creatorPublicKey,
      });
      if (resp.status === 200) {
        const { energyPublicID, privateEnergyToken } = resp.data;

        store.availableEnergy = store.availableEnergy - defaultEnergyAmount;

        return { energyPublicID, privateEnergyToken, amount };
      } else {
        throw new Error("Unable to contact Utility to release energy");
      }
    } catch (e: any) {
      console.error("Unable to release energy: ", e?.message);
    }
  },

  consume: async ({
    privateEnergyToken,
    publicEnergyToken,
  }: {
    privateEnergyToken: string;
    publicEnergyToken: string;
  }) => {
    const url = `${envConfig().MARKET_URL}/api/utility/consume-energy`;
    try {
      const resp = await axios.post<{ amount: number }>(url, {
        privateEnergyToken,
        publicEnergyToken,
      });

      const { data } = resp;

      if (resp.status === 200) {
        const store = DataStore.getInstance();
        store.availableEnergy = store.availableEnergy + data.amount;
        return data.amount;
      } else {
        throw new Error("Unable to contact utility to consume energy");
      }
    } catch (e: any) {
      console.error("Unable to consume energy: ", e?.message);
    }
  },
};
