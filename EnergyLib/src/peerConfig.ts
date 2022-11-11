import { PeerType, PeerConfig as NodeInfo } from "./types";
import stringify from "json-stable-stringify";
import { SHA256, enc } from "crypto-js";
import elliptic from "elliptic";
import { sign } from "./wallet";

interface TPeerConfig {
  port: string;
  type: PeerType;
  keyPair: elliptic.ec.KeyPair;
}

class PeerConfig {
  createdAt: string;
  port: string;
  URL: string;
  publicKey: string;
  type: PeerType;
  hash: string = "";
  signature: elliptic.ec.Signature;

  constructor({ port, keyPair, type }: TPeerConfig) {
    this.createdAt = new Date().toISOString();
    this.publicKey = keyPair.getPublic().encode("hex", false);
    this.port = port;
    this.URL = `${process.env.APP_DOMAIN}:${port}`;
    this.type = type;
    this.hash = SHA256(stringify(this._infoNoSig())).toString(enc.Hex);
    this.signature = sign({ keyPair, data: this._infoNoSig() });
  }

  private _infoNoSig = () => ({
    createdAt: this.createdAt,
    port: this.port,
    URL: this.URL,
    publicKey: this.publicKey,
    type: this.type,
    hash: this.hash,
  });

  info = () => ({
    ...this._infoNoSig(),
    signature: this.signature,
  });
}

export default PeerConfig;
