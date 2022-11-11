import elliptic from "elliptic";

export interface PeerConfig {
  publicKey: string;
  URL: string;
  createdAt: string;
  type: PeerType;
  hash: string;
}

export type PeerType = "TokenRegulator" | "EnergyNode";

export interface MarketSellResponse {
  sellerPublicKey: string;
  buyerPublicKey: string;
  URL: string;
  hash: string;
  signature: elliptic.ec.Signature;
  publicID: string;
  createdAt: string;
}

export interface ReqStatus {
  success: boolean;
  error?: any;
}
