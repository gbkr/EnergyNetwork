import elliptic from "elliptic";
import Graph from "./graph";

export type PeerType = "TokenRegulator" | "EnergyNode";

export interface StoreSingleton {
  getInstance: () => Store;
}

export interface TransactionAndClusterVerification {
  hash: string;
  clusterHash: string;
}

interface RFPDetail {
  energyPublicID: string;
  rfpHash: string;
}

export interface Transaction {
  recipient: string;
  creator: string;
  amount: number;
  price?: number;
  hash: string;
  signature: elliptic.ec.Signature;
  targets: TransactionAndClusterVerification[];
  createdAt: string;
  type: NodeTypes.Transaction;
  paymentForRFP?: RFPDetail;
  energyToken?: string;
}

export interface RequestForPayment {
  recipient: string;
  creator: string;
  amount: number;
  price: number;
  hash: string;
  signature: elliptic.ec.Signature;
  targets: TransactionAndClusterVerification[];
  createdAt: string;
  type: NodeTypes.RequestForPayment;
  energyPublicID: string;
  marketPublicID: string;
}

export interface EnergyToken {
  recipient: string;
  creator: string;
  amount: number;
  hash: string;
  signature: elliptic.ec.Signature;
  targets: TransactionAndClusterVerification[];
  createdAt: string;
  type: NodeTypes.EnergyToken;
  energyToken: string;
  RFPHash: string;
}

export enum NodeTypes {
  Genesis,
  Verification,
  Transaction,
  RequestForPayment,
  EnergyToken,
}

export type AnyNode =
  | Genesis
  | Verification
  | Transaction
  | RequestForPayment
  | EnergyToken;

export interface Genesis {
  type: NodeTypes.Genesis;
  createdAt: string;
  creator: string;
  hash: string;
  signature: elliptic.ec.Signature;
}

export interface Verification {
  type: NodeTypes.Verification;
  createdAt: string;
  hash: string;
  verifiesNode: string;
  creator: string;
  signature: elliptic.ec.Signature;
}

export interface PeerConfig {
  createdAt: string;
  port: string;
  URL: string;
  publicKey: string;
  hash: string;
  type: PeerType;
  signature: elliptic.ec.Signature | undefined;
}

export interface PaymentRequest {
  energyPublicID: string;
  marketPublicID: string;
  privateEnergyToken: string;
  buyerPublicKey: string;
  amount: number;
  price: number;
}

export interface Store {
  peers: PeerConfig[];
  peerConfig: PeerConfig;
  keyPair: elliptic.ec.KeyPair | undefined;
  graph: Graph;
  marketBuyIDs: string[];
  paymentRequests: PaymentRequest[];
  availableEnergy: number;
  fiat: number;
  prosumption: EnergyProsumption[];
  sellingOnMarket: boolean;
}

export interface IGraph {
  graph: Graph;
}

export interface BankAction {
  transactionHash: string;
  amount: number;
  createdAt: string;
  type: "Deposit" | "Withdraw";
}

interface MarketParticipant {
  publicKey: string;
  createdAt: string;
  expiresAt: string;
  hash: string;
  signature: elliptic.ec.Signature;
}
export interface Buyer extends MarketParticipant {
  buyerID: string;
  price: number;
}

export interface Seller extends MarketParticipant {
  URL: string;
}

export interface PeerInfo {
  config: PeerConfig;
  peers: PeerConfig[];
  graph: Graph;
  info: { tokens: string; availableEnergy: number; fiat: number };
  prosumption: EnergyProsumption[];
}

export interface RequestForPaymentArgs {
  sellerPublicKey: string;
  buyerPublicKey: string;
  tokenRegulatorPubKey: string;
  peerUrls: string[];
  amount: number;
  price: number;
  keyPair: elliptic.ec.KeyPair;
  energyPublicID: string;
  marketPublicID: string;
}
export interface EnergyProsumption {
  hour: number;
  consumption: number;
  production: number;
  net: number;
}
