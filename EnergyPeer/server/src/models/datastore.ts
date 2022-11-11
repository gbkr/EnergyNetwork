import { CacheStore, types } from "energylib";

class DataStore {
  private static instance: types.Store;

  public static getInstance(): types.Store {
    if (!DataStore.instance) {
      DataStore.instance = new CacheStore();
    }

    return DataStore.instance;
  }
}

export default DataStore;
