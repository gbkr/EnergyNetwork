import axios from "axios";
import envConfig from "../envConfig";

export const EnergyMarket = {
  removeBuyer: async (marketPublicID: string) => {
    const marketURL = `${envConfig().MARKET_URL}/api/market/remove-buyer`;
    try {
      const resp = await axios.post<{ success: boolean }>(marketURL, {
        marketPublicID,
      });

      const { data } = resp;
      return data.success;
    } catch (error: any) {
      console.error("Unable to remove buyer from market: ", error?.message);
    }
    return false;
  },
};
