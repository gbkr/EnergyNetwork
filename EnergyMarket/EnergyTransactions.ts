import { EnergyTransaction } from "./types";

const _energyTransactions: EnergyTransaction[] = [];

const EnergyTransactions = {
  releasedToGrid: (energy: EnergyTransaction) =>
    _energyTransactions.push(energy),
  list: () => _energyTransactions,
  get: (publicID: string) =>
    _energyTransactions.find(
      (transaction) => transaction.energyPublicID === publicID
    ),
  consume: (publicEnergyToken: string, privateEnergyToken: string) => {
    const record = _energyTransactions.find(
      (transaction) => transaction.energyPublicID === publicEnergyToken
    );
    if (record && record.privateEnergyToken === privateEnergyToken) {
      record.consumed = true;
    }
    return record;
  },
};

Object.freeze(EnergyTransactions);
export default EnergyTransactions;
