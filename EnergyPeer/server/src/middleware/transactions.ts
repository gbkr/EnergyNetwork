import { NodeTypes, Transaction } from "energylib/src/types";
import { verifyTransactionSignature } from "energylib/src/wallet";
import { types } from "../../../../EnergyLib";
import DataStore from "../models/datastore";
import { findTokenRegulator } from "../utils";
import { getPeerUrls } from "energylib/src/peerList";
import { SHA256, enc } from "crypto-js";

export function validateTransactionIfRequired(req: any, _: any, next: any) {
  const store = DataStore.getInstance();

  if (req.body.type !== NodeTypes.Transaction) {
    next();
    return false;
  }
  const transaction = <Transaction>req.body;

  if (!verifyTransactionSignature(transaction)) {
    console.error(`Incoming transaction not valid: ${transaction}`);
    next();
    return false;
  }

  if (
    shouldValidateTransaction(
      transaction,
      store.peers,
      store.peerConfig.publicKey
    )
  ) {
    const peerUrls = getPeerUrls(store.peers, store.peerConfig.URL);
    store.graph.validateAndPropogateTransaction(
      transaction,
      findTokenRegulator()?.publicKey!,
      store.peerConfig.publicKey,
      store.keyPair!,
      peerUrls
    );
  }

  next();
}

// This function is used to speed up transaction verification by
// ensuring a propogated transaction is validated by at least one
// of the peers.
//
// It works by converting the transaction hash to a number and then
// calulating the modulus with the number of peers. This will yield
// a number between 0 and the number of peers - 1. If this number
// is the same as the index of the receiving peer in a sorted list of
// peers, then the peer is expected to validate the transaction.
// Peers cannot validate their own transaction, whether creator or
// receiver.

export const shouldValidateTransaction = (
  transaction: Transaction,
  peers: types.PeerConfig[],
  ownPubKey: string
): Boolean => {
  const unsuitablePeers = [transaction.creator, transaction.recipient];
  if (unsuitablePeers.includes(ownPubKey)) {
    return false;
  }

  const filteredPeers = peers.filter(
    (peer) =>
      peer.type === "EnergyNode" && !unsuitablePeers.includes(peer.publicKey)
  );

  const utf8Encode = new TextEncoder();

  const transactionHashToPeerListIndex =
    utf8Encode
      .encode(transaction.hash)
      .reduce((a: number, b: number) => a + b, 0) % filteredPeers.length;

  /*
  We want 4 peers to be selected, so we'll take 4 properties of the peer and sort them.
  we'll take these sorted lists and look at the hashToNumber index of each of them.
  if the current peer is in this position then we'll return true (the peer must validate the incoming transaction)

  So for each of the following properties, we'll sort and get an index for the current peer
  1) publicKey
  2) createdAt
  3) hash
  4) URL+PORT
  
  if any of the calculated indexes match that of the number generated from the incoming transaction hash, we'll return true 
  indicating that this peer must validate the transaction
  */

  const publicKeyPosition = filteredPeers
    .sort((a, b) => a.publicKey.localeCompare(b.publicKey))
    .map((peer) => peer.publicKey)
    .indexOf(ownPubKey);

  let validatingIndexes = [publicKeyPosition];

  const updateValidatingIndexes = (arr: number[], value: number) => {
    if (arr.includes(value)) {
      const max = arr.reduce((a, b) => {
        return Math.max(a, b);
      });
      arr.push((max + 1) % filteredPeers.length);
    } else {
      arr.push(value);
    }
    return arr;
  };

  const createdAtPosition = filteredPeers
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((peer) => peer.publicKey)
    .indexOf(ownPubKey);

  validatingIndexes = updateValidatingIndexes(
    validatingIndexes,
    createdAtPosition
  );

  const hashPosition = filteredPeers
    .sort((a, b) => a.hash.localeCompare(b.hash))
    .map((peer) => peer.publicKey)
    .indexOf(ownPubKey);

  validatingIndexes = updateValidatingIndexes(validatingIndexes, hashPosition);

  const URLPORTPosition = filteredPeers
    .sort((a, b) =>
      SHA256(`${a.URL}${a.port}`)
        .toString(enc.Hex)
        .localeCompare(SHA256(`${b.URL}${b.port}`).toString(enc.Hex))
    )
    .map((peer) => peer.publicKey)
    .indexOf(ownPubKey);

  validatingIndexes = updateValidatingIndexes(
    validatingIndexes,
    URLPORTPosition
  );

  if (validatingIndexes.includes(transactionHashToPeerListIndex)) {
    return true;
  }

  return false;
};
