import { PeerList, types } from "energylib";
import Graph from "energylib/src/graph";
import runSimulation from "./lib/simulation";
import envConfig from "./envConfig";
import DataStore from "./models/datastore";
import { findTokenRegulator } from "./utils";

export default class Startup {
  static async init(targetNode: string, currentNode: string) {
    const store = DataStore.getInstance();
    let peers: types.PeerConfig[] = [];
    let trnx: types.Transaction[] = [];
    if (targetNode !== currentNode) {
      peers = await PeerList.fetchPeersFrom(targetNode);

      if (!store.graph.nodes.length) {
        const { data } = await Graph.fetchGraphFrom(targetNode);
        trnx = data._graph;
      }

      await PeerList.broadcastSelf(peers, store.peerConfig);
    }
    store.peers = [...peers, store.peerConfig];

    let tokenRegulatorPubKey: string | undefined;

    function pollTokenRegulator() {
      tokenRegulatorPubKey = findTokenRegulator()?.publicKey!;

      if (tokenRegulatorPubKey) {
        trnx.forEach((transaction: types.Transaction) =>
          store.graph.addTransactionLocal(transaction, tokenRegulatorPubKey!)
        );

        if (envConfig().RUN_SIMULATION === "true") {
          runSimulation();
        }
      } else {
        setTimeout(pollTokenRegulator, 1000);
      }
    }

    pollTokenRegulator();
  }

  static async shutdown() {
    const { peers, peerConfig } = DataStore.getInstance();

    if (peers.length > 1) {
      await PeerList.broadcastShutdown(peers, peerConfig);
    }
    // program terminated by control-c
    process.exit(130);
  }
}
