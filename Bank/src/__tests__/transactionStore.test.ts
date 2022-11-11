import { types } from "energylib";
import TransactionStore from "../transactionStore";

let store: TransactionStore;

beforeEach(() => {
  store = TransactionStore.getInstance();
});

describe("TransactionStore", () => {
  it("should initialize with an empty list", () => {
    expect(store.list()).toEqual([]);
  });
  it("should list the objects added to it", () => {
    const item: types.BankAction = {
      transactionHash: "abc",
      amount: 10,
      createdAt: "today",
      type: "Deposit",
    };
    store.add(item);
    expect(store.list()).toEqual([item]);
  });
});
