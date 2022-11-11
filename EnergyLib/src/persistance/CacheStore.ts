import { PeerConfig, Store, PaymentRequest, EnergyProsumption } from "../types";
import elliptic from "elliptic";
import Graph from "../graph";

class CacheStore implements Store {
  _peers: PeerConfig[] = [];
  _peerConfig: PeerConfig = {
    createdAt: "",
    port: "",
    URL: "",
    publicKey: "",
    hash: "",
    type: "EnergyNode",
    signature: undefined,
  };
  _keyPair: elliptic.ec.KeyPair | undefined;
  _marketBuyIDs: string[] = [];
  _paymentRequests: PaymentRequest[] = [];
  _graph: Graph = new Graph();
  _availableEnergy = 100;
  _prosumption: EnergyProsumption[] = [];
  _fiat = 0;
  _sellingOnMarket = false;

  get availableEnergy() {
    return this._availableEnergy;
  }

  set availableEnergy(energy: number) {
    this._availableEnergy = energy;
  }

  get peers() {
    return this._peers;
  }

  set peers(peerList: PeerConfig[]) {
    this._peers = peerList;
  }

  get peerConfig() {
    return this._peerConfig;
  }

  set peerConfig(config: PeerConfig) {
    this._peerConfig = config;
  }

  get marketBuyIDs() {
    return this._marketBuyIDs;
  }

  get paymentRequests() {
    return this._paymentRequests;
  }

  get keyPair() {
    if (this._keyPair) {
      return this._keyPair;
    } else {
      throw new Error("No key pair defined");
    }
  }

  set marketBuyIDs(ids: string[]) {
    this._marketBuyIDs = ids;
  }

  set paymentRequests(paymentRequests: PaymentRequest[]) {
    this._paymentRequests = paymentRequests;
  }

  set keyPair(kp: elliptic.ec.KeyPair) {
    this._keyPair = kp;
  }

  get graph() {
    return this._graph;
  }

  get prosumption() {
    return this._prosumption;
  }

  set prosumption(energyProsumption: EnergyProsumption[]) {
    this._prosumption = energyProsumption;
  }

  get fiat() {
    return this._fiat;
  }

  set fiat(value: number) {
    this._fiat = value;
  }

  get sellingOnMarket() {
    return this._sellingOnMarket;
  }

  set sellingOnMarket(value: boolean) {
    this._sellingOnMarket = value;
  }
}

export default CacheStore;
