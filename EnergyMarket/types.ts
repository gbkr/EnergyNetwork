export interface EnergyTransactionFromPost {
  amount: number;
  creatorPubKey: string;
}

export interface EnergyTransaction extends EnergyTransactionFromPost {
  createdAt: string;
  // Used as a key to publicly view the energy details. Used by the
  // buyer to confirm the offer is legit
  energyPublicID: string;
  // This is the token that is required for the buyer's
  // smart meter to allow the energy to be fed in from the grid
  privateEnergyToken: string;
  // has the energy been used yet
  consumed: boolean;
}
