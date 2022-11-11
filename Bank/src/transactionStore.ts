import { types } from "energylib";
class TransactionStore {
  private static instance: TransactionStore;

  _transactions: types.BankAction[] = [];

  private constructor() {}

  public static getInstance(): TransactionStore {
    if (!TransactionStore.instance) {
      TransactionStore.instance = new TransactionStore();
    }

    return TransactionStore.instance;
  }

  list() {
    return this._transactions;
  }

  add(trnx: types.BankAction) {
    this._transactions.push(trnx);
  }
}

export default TransactionStore;
