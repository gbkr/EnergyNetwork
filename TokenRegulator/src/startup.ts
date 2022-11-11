import { PeerList, types, Wallet } from "energylib";
import { getPeerUrls } from "energylib/src/peerList";
import DataStore from "./models/datastore";
export default class Startup {
  static async init(targetNode: string, currentNode: string) {
    const store = DataStore.getInstance();
    let peers: types.PeerConfig[] = [];

    if (targetNode !== currentNode) {
      try {
        peers = await PeerList.fetchPeersFrom(targetNode);
      } catch (e: any) {
        console.error(
          `Error fetching peers. Please ensure ${targetNode} is available before starting TokenRegulator.`
        );
        process.exit(0);
      }
      await PeerList.broadcastSelf(peers, store.peerConfig);
    }
    store.peers = [...peers, store.peerConfig];

    if (store.graph.nodes.length) {
      return;
    }

    const type: types.NodeTypes.Genesis = types.NodeTypes.Genesis;
    const creator = store.peerConfig.publicKey;

    const data = { type, creator, createdAt: new Date().toISOString() };
    const keyPair = store.keyPair;

    if (!keyPair) {
      throw new Error("No keypair defined");
    }

    const genesisNode: types.AnyNode = Wallet.hashAndSign({ data, keyPair });

    const peerUrls = getPeerUrls(store.peers, store.peerConfig.URL);
    const tokenRegulatorPubKey = store.peerConfig.publicKey;
    await store.graph.addTransactionGlobal({
      transaction: genesisNode,
      peerUrls,
      tokenRegulatorPubKey,
    });
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
