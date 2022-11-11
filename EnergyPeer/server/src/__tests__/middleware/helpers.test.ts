import { shouldValidateTransaction } from "../../middleware/transactions";
import { Wallet, types } from "../../../../../EnergyLib";
import { NodeTypes, PeerConfig } from "energylib/src/types";
import { hashAndSign } from "energylib/src/wallet";

describe("shouldValidateTransaction", () => {
  it("returns true when only peer not part of transaction", () => {
    const unSignedTrnx = {
      recipient: "abc",
      amount: 10,
      targets: ["one", "two"],
      createdAt: "now",
      type: NodeTypes.Transaction,
      creator: "creatorPubKey",
    };

    const keyPair = Wallet.genKeyPair();

    const trnx: types.Transaction = hashAndSign({
      data: unSignedTrnx,
      keyPair,
    });

    const peer = {
      port: "0",
      publicKey: "totallyUnrelatedToTransaction",
      URL: "example.com",
      type: "EnergyNode",
    };

    const peers: PeerConfig = Wallet.hashAndSign({ data: peer, keyPair });
    const result = shouldValidateTransaction(trnx, [peers], peer.publicKey);
    expect(result).toBe(true);
  });

  it("returns false when part of transaction", () => {
    const unSignedTrnx = {
      recipient: "abc",
      amount: 10,
      targets: ["one", "two"],
      createdAt: "now",
      type: NodeTypes.Transaction,
      creator: "creatorPubKey",
    };

    const keyPair = Wallet.genKeyPair();

    const trnx: types.Transaction = hashAndSign({
      data: unSignedTrnx,
      keyPair,
    });

    const peer = {
      port: "0",
      publicKey: trnx.recipient,
      URL: "example.com",
      type: "EnergyNode",
    };

    const peers: PeerConfig = Wallet.hashAndSign({ data: peer, keyPair });
    const result = shouldValidateTransaction(trnx, [peers], peer.publicKey);
    expect(result).toBe(false);
  });

  it("returns false when not the chosen peer", () => {
    const unSignedTrnx = {
      recipient: "aaaa",
      amount: 10,
      targets: ["one", "two"],
      createdAt: "now",
      type: NodeTypes.Transaction,
      creator: "creatorPubKey",
    };

    const keyPair = Wallet.genKeyPair();

    const trnx: types.Transaction = hashAndSign({
      data: unSignedTrnx,
      keyPair,
    });

    const unsignedPeers = [
      {
        port: "0",
        publicKey: "cccc",
        URL: "example1.com",
        type: "EnergyNode",
      },
      {
        port: "0",
        publicKey: "aaaa",
        URL: "example2.com",
        type: "EnergyNode",
      },
      {
        port: "0",
        publicKey: "bbbb",
        URL: "example2.com",
        type: "EnergyNode",
      },
    ];

    const peers = unsignedPeers.map((data) =>
      Wallet.hashAndSign({ data, keyPair })
    );

    const result = shouldValidateTransaction(trnx, peers, peers[2].publicKey);
    expect(result).toBe(false);
  });

  it("returns true when the chosen peer", () => {
    const unSignedTrnx = {
      recipient: "aaaa",
      amount: 10,
      targets: ["one", "two"],
      createdAt: "now",
      type: NodeTypes.Transaction,
      creator: "creatorPubKey",
    };

    const keyPair = Wallet.genKeyPair();

    const trnx: types.Transaction = hashAndSign({
      data: unSignedTrnx,
      keyPair,
    });

    const unsignedPeers = [
      {
        port: "0",
        publicKey: "cccc",
        URL: "example1.com",
        type: "EnergyNode",
      },
      {
        port: "0",
        publicKey: "aaaa",
        URL: "example2.com",
        type: "EnergyNode",
      },
      {
        port: "0",
        publicKey: "bbbb",
        URL: "example2.com",
        type: "EnergyNode",
      },
    ];

    const peers = unsignedPeers.map((data) =>
      Wallet.hashAndSign({ data, keyPair })
    );

    const result = shouldValidateTransaction(trnx, peers, peers[0].publicKey);
    expect(result).toBe(true);
  });
});
