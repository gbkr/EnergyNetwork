import * as Wallet from "../wallet";
import PeerConfig from "../peerConfig";

describe("Wallet", () => {
  describe(`verifySignature`, () => {
    it(`returns true for a valid signature`, () => {
      const keyPair = Wallet.genKeyPair();
      const data = { some: "random data" };
      const signature = Wallet.sign({ keyPair, data });
      expect(Wallet.verifySignature({ keyPair, data, signature })).toBeTruthy();
    });
    it(`returns false for an invalid signature`, () => {
      const keyPair = Wallet.genKeyPair();
      const obj1 = { some: "random data" };
      const obj2 = { some: "other random data" };
      const signature = Wallet.sign({ keyPair, data: obj1 });
      expect(
        Wallet.verifySignature({ keyPair, data: obj2, signature })
      ).toBeFalsy();
    });
  });

  describe(`verifyPeerSignature`, () => {
    it("returns true for valid node info", () => {
      const peerConfig = new PeerConfig({
        port: "8000",
        keyPair: Wallet.genKeyPair(),
        type: "EnergyNode",
      });
      expect(Wallet.verifyPeerSignature(peerConfig.info())).toBeTruthy();
    });

    it("returns false for invalid node info", () => {
      const peerConfig = new PeerConfig({
        port: "8000",
        keyPair: Wallet.genKeyPair(),
        type: "EnergyNode",
      });
      const modifiedPeer = { ...peerConfig.info(), URL: "falseURL" };
      expect(Wallet.verifyPeerSignature(modifiedPeer)).toBeFalsy();
    });
  });
});
