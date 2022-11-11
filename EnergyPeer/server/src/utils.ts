import DataStore from "./models/datastore";
import { getPeerUrls } from "energylib/src/peerList";

export const peerURLList = () => {
  const store = DataStore.getInstance();
  return getPeerUrls(store.peers, store.peerConfig.URL);
};

export const findTokenRegulator = () => {
  const store = DataStore.getInstance();
  return store.peers.find((peer) => peer.type === "TokenRegulator");
};

export const isValidURL = (url: string) => {
  try {
    new URL(url);
  } catch {
    return false;
  }
  return true;
};
