import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { EnergyTransactionFromPost, EnergyTransaction } from "../types";
import EnergyTransactions from "../EnergyTransactions";
import envConfig from "../envConfig";

class UtilityController {
  release = (req: Request, res: Response) => {
    try {
      const energyDetail: EnergyTransactionFromPost = req.body;
      const energyTransaction: EnergyTransaction = {
        ...energyDetail,
        createdAt: new Date().toISOString(),
        energyPublicID: uuidv4(),
        privateEnergyToken: uuidv4(),
        consumed: false,
      };

      EnergyTransactions.releasedToGrid(energyTransaction);

      return res.status(200).json({
        energyPublicID: energyTransaction.energyPublicID,
        privateEnergyToken: energyTransaction.privateEnergyToken,
      });
    } catch (error: any) {
      return res.status(500).json({ error: error?.message });
    }
  };
  view = (req: Request, res: Response) => {
    const energyPublicID = req.params.energyPublicID;
    const data = EnergyTransactions.get(energyPublicID);
    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).json({});
    }
  };
  consume = (req: Request, res: Response) => {
    const { privateEnergyToken, publicEnergyToken } = req.body;
    console.log(
      `Request to consume privateEnergyToken: ${privateEnergyToken} with publicEnergyToken: ${publicEnergyToken}`
    );
    const energyRecord = EnergyTransactions.consume(
      publicEnergyToken,
      privateEnergyToken
    );
    if (energyRecord) {
      res.status(200).json({ amount: energyRecord.amount });
    } else {
      res.status(404).json({});
    }
  };

  buy = (req: Request, res: Response) => {
    try {
      const { nodeAddress } = req.body;
      const price = parseInt(envConfig().MAXIMUM_P2P_ENERGY_PRICE) + 1;
      const energyAmount = parseInt(envConfig().DEFAULT_ENERGY_AMOUNT);
      res.status(200).json({ price, energyAmount });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Unable to purchase energy" });
    }
  };

  sell = (req: Request, res: Response) => {
    try {
      const price = parseInt(envConfig().MINIMUM_P2P_ENERGY_PRICE) - 1;
      res.status(200).json({ price });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Unable to sell energy" });
    }
  };
}

export default UtilityController;
