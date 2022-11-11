import elliptic from "elliptic";
import stringify from "json-stable-stringify";
import { SHA256, enc } from "crypto-js";
import { PeerConfig, AnyNode, Buyer } from "./types";

export const genKeyPair = () => {
  const curve = new elliptic.ec("secp256k1");
  return curve.genKeyPair();
};

export const sortedHash = (data: Object) =>
  SHA256(stringify(data)).toString(enc.Hex);

interface Sign {
  keyPair: elliptic.ec.KeyPair;
  data: any;
}

interface VerifySignature extends Sign {
  signature: elliptic.ec.Signature;
}

export const sign = ({ keyPair, data }: Sign) => keyPair.sign(sortedHash(data));
export const getPublicString = (keyPair: elliptic.ec.KeyPair) =>
  keyPair.getPublic().encode("hex", false);

export const verifySignature = ({
  keyPair,
  data,
  signature,
}: VerifySignature) => keyPair.verify(sortedHash(data), signature);

export const verifyPeerSignature = (peer: PeerConfig | Buyer) => {
  const curve = new elliptic.ec("secp256k1");
  const keyFromPublic = curve.keyFromPublic(peer.publicKey, "hex");
  const { signature, ...peerNoSig } = peer;
  return keyFromPublic.verify(
    sortedHash(peerNoSig),
    signature as elliptic.ec.Signature
  );
};

export const verifyTransactionSignature = (trnx: AnyNode): Boolean => {
  const { signature, ...data } = trnx;
  const keyFromPublic = new elliptic.ec("secp256k1").keyFromPublic(
    data.creator,
    "hex"
  );
  return keyFromPublic.verify(
    SHA256(stringify(data)).toString(enc.Hex),
    signature
  );
};

export const hashAndSign = ({ keyPair, data }: Sign) => {
  const hashedObj = { ...data, hash: sortedHash(data) };
  return {
    ...hashedObj,
    signature: sign({ keyPair, data: hashedObj }),
  };
};

export const verifyHashAndSignature = (trnx: AnyNode): Boolean => {
  const { signature, hash, ...data } = trnx;
  const calculatedHash = sortedHash(data);

  if (calculatedHash !== hash) {
    console.error("Incorrect transaction hash for: ", trnx);
    return false;
  }

  const sigValid = verifyTransactionSignature(trnx);
  if (!sigValid) {
    console.error("Invalid signature for ", trnx);
  }

  return sigValid;
};
