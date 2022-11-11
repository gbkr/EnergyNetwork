import {
  Genesis,
  Verification,
  NodeTypes,
  Transaction,
  AnyNode,
  TransactionAndClusterVerification,
  RequestForPaymentArgs,
} from "./types";
import {
  sortedHash,
  verifyTransactionSignature,
  hashAndSign,
  verifyHashAndSignature,
} from "./wallet";
import { broadcastTransaction } from "./peerList";
import axios from "axios";
import elliptic from "elliptic";
import { SHA256, enc } from "crypto-js";
import { verifyTransactionDeposit } from "./services/Bank";
class Graph {
  _graph: Array<AnyNode>;
  public readonly MINIMUM_VALIDATIONS_FOR_TRANSACTION = 3;
  public readonly MINIMUM_LINKED_TRANSACTIONS_FOR_TRANSACTION = 2;

  constructor() {
    this._graph = [];
  }

  public transactions = (): Transaction[] =>
    this.nodes.filter(
      (node) => node.type === NodeTypes.Transaction
    ) as Transaction[];

  // find all verified transactions involving the supplied publicKey and calculate the current balance
  public peerBalance = (creatorPubKey: string): number => {
    let total = 0;

    const transactions = <Transaction[]>(
      this.nodes.filter((node: AnyNode) => node.type === NodeTypes.Transaction)
    );

    const verifications = <Verification[]>(
      this.nodes.filter((node: AnyNode) => node.type === NodeTypes.Verification)
    );

    transactions.forEach((trnx) => {
      const verificationsForTransaction = verifications.filter(
        (verification) =>
          verification.verifiesNode === trnx.hash &&
          this.verifyTransactionHash(verification)
      );
      if (
        verificationsForTransaction.length >=
        this.MINIMUM_VALIDATIONS_FOR_TRANSACTION
      ) {
        if (trnx.creator === creatorPubKey) {
          total = total - trnx.amount;
        } else if (trnx.recipient === creatorPubKey) {
          total = total + trnx.amount;
        }
      }
    });

    return total;
  };

  createValidationTransactionFor = (
    transaction: AnyNode,
    creatorPubKey: string,
    keyPair: elliptic.ec.KeyPair,
    tokenRegulatorPubKey: string,
    peerUrls: string[]
  ) => {
    try {
      const data = {
        type: NodeTypes.Verification,
        createdAt: new Date().toISOString(),
        verifiesNode: transaction.hash,
        creator: creatorPubKey,
      };

      const signedVerification = hashAndSign({ data, keyPair });
      this.addTransactionGlobal({
        transaction: signedVerification,
        peerUrls,
        tokenRegulatorPubKey,
      });
      return true;
    } catch (e: any) {
      console.error("Error creating transaction verification: ", e.message);
      return false;
    }
  };

  validateAndPropogateTransaction = async (
    transaction: AnyNode,
    tokenRegulatorPubKey: string,
    ownPubKey: string,
    keyPair: elliptic.ec.KeyPair,
    peerUrls: string[]
  ) => {
    if (!(await this.verifyTransaction(transaction, tokenRegulatorPubKey))) {
      console.error("Invalid incomming transaction");
      return false;
    }
    console.log("Valid incoming transaction");
    this.createValidationTransactionFor(
      transaction,
      ownPubKey,
      keyPair,
      tokenRegulatorPubKey,
      peerUrls
    );
  };

  verifyTransactionHash = (transaction: AnyNode): Boolean => {
    const originalHash = transaction.hash;
    const { signature, hash, ...data } = transaction;
    const calculatedHash = sortedHash(data);
    return calculatedHash === originalHash;
  };

  verifyTransaction = async (
    trnx: AnyNode,
    tokenRegulatorPubKey: string
  ): Promise<Boolean> => {
    if (!this.verifyTransactionHash(trnx)) {
      console.error("Invalid transaction hash. Cannot add to graph. ", trnx);
      return false;
    }

    if (!verifyTransactionSignature(trnx)) {
      console.error(
        "Invalid transaction signature. Cannot add to graph. ",
        trnx
      );
      return false;
    }

    if (trnx.type === NodeTypes.Genesis && this._graph.length === 0) {
      return trnx.creator === tokenRegulatorPubKey;
    }

    if (
      trnx.type === NodeTypes.Transaction ||
      trnx.type === NodeTypes.RequestForPayment ||
      trnx.type === NodeTypes.EnergyToken
    ) {
      if (trnx.targets.length < 2) {
        console.error("Transaction must have at least 2 targets");
        return false;
      } else {
        if (trnx.amount === 0) {
          return true;
        }

        if (trnx.creator === tokenRegulatorPubKey) {
          return await verifyTransactionDeposit({
            transactionHash: trnx.hash,
            amount: trnx.amount,
          });
        }

        if (trnx.type === NodeTypes.Transaction) {
          return this.peerBalance(trnx.creator) >= trnx.amount;
        } else {
          return true;
        }
      }
    }

    if (trnx.type === NodeTypes.Verification) {
      return verifyHashAndSignature(trnx);
    }

    console.error("Unknown transaction type. Not adding to graph.");

    return false;
  };

  createAndPropogateRequestForPayment = ({
    sellerPublicKey,
    buyerPublicKey,
    amount,
    price,
    peerUrls,
    tokenRegulatorPubKey,
    keyPair,
    energyPublicID,
    marketPublicID,
  }: RequestForPaymentArgs) => {
    const rfpPartial = {
      amount,
      price,
      energyPublicID,
      marketPublicID,
      recipient: buyerPublicKey,
      creator: sellerPublicKey,
      type: NodeTypes.RequestForPayment,
      createdAt: new Date().toISOString(),
      targets: this.verifiedTransactionPair(),
    };

    const rfp = hashAndSign({ data: rfpPartial, keyPair });

    return this.addTransactionGlobal({
      transaction: rfp,
      peerUrls,
      tokenRegulatorPubKey,
    });
  };

  addTransactionLocal = async (trnx: AnyNode, tokenRegulatorPubKey: string) => {
    if (!(await this.verifyTransaction(trnx, tokenRegulatorPubKey))) {
      console.error(`Transaction has invalid signature: ${trnx.hash}`);
      return false;
    }

    const nodeHashes = this.nodes.map((node) => node.hash);
    if (nodeHashes.includes(trnx.hash)) {
      console.error(`Transaction already exists in graph: ${trnx.hash}`);
      return false;
    }

    this._graph.push(trnx);
    return true;
  };

  addTransactionGlobal = async ({
    transaction,
    peerUrls,
    tokenRegulatorPubKey,
  }: {
    transaction: AnyNode;
    peerUrls: string[];
    tokenRegulatorPubKey: string;
  }) => {
    if (await this.addTransactionLocal(transaction, tokenRegulatorPubKey)) {
      console.log("Broadcasting transaction: ", transaction.hash);
      broadcastTransaction({ transaction, peerUrls });
      return true;
    }
    return false;
  };

  static fetchGraphFrom = async (peer: string) =>
    await axios.get(`${peer}/api/graph`);

  get nodes() {
    return this._graph;
  }

  getClusterHash = (transaction: Transaction | Genesis): string => {
    if (transaction.type === NodeTypes.Genesis) {
      return transaction.hash;
    }
    const transactionHash = transaction.hash;
    const validations = this.nodes.filter(
      (node) =>
        node.type == NodeTypes.Verification &&
        node.verifiesNode === transactionHash
    ) as Verification[];
    const hashes = validations.map((validation) => validation.hash);
    hashes.push(transactionHash);
    return SHA256(hashes.sort().join()).toString(enc.Hex);
  };

  /*
  Returns if a transaction is ready to be linked to 

  1. it is fully validated by required number of Verifications 
  2. those verifications are by uniq peers who have valid signatures
  4. the transaction is signed correctly
  5. the transaction has the correct hash
  6. all linked transactions can be verified as per steps 1-5 and they have the correct clusterHash
  */

  transactionCanBeLinked = (transaction: Transaction): Boolean => {
    const validations = this.nodes.filter(
      (node) => node.type == NodeTypes.Verification
    ) as Verification[];

    const transactionValidations = validations.filter(
      (validation) => validation.verifiesNode === transaction.hash
    );

    // Ensure validations are done by unique peers
    if (
      [...new Set(transactionValidations.map((tv) => tv.creator))].length <
      this.MINIMUM_VALIDATIONS_FOR_TRANSACTION
    ) {
      return false;
    }

    // Check if all of the verifications are signed and hashed correctly
    const validVerifications = transactionValidations.map((tv) =>
      verifyHashAndSignature(tv)
    );
    if (!validVerifications.every((v) => v)) {
      return false;
    }

    return verifyHashAndSignature(transaction);
  };

  twoTransactions = (transactions: Transaction[], age: "new" | "old") => {
    transactions = transactions.filter((trnx) =>
      this.transactionCanBeLinked(trnx)
    );

    transactions.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    let transactionsForSelection;
    let result: Transaction[] = [];

    if (transactions.length > 10) {
      transactionsForSelection =
        age === "old" ? transactions.slice(-10) : transactions.slice(0, 9);
    } else {
      if (transactions.length < 2) {
        throw new Error(
          "At least 2 transactions are required in order to select 2 transactions"
        );
      }
      transactionsForSelection = transactions;
    }

    result.push(
      transactionsForSelection[
        Math.floor(Math.random() * transactionsForSelection.length)
      ]
    );

    // ensure the same transaction isn't chosen twice
    const remainingTransactions = transactionsForSelection.filter(
      (trns) => trns.hash !== result[0].hash
    );
    result.push(
      remainingTransactions[
        Math.floor(Math.random() * remainingTransactions.length)
      ]
    );
    return result;
  };

  twoTransactionsOneRequired = (
    requiredTransaction: Transaction,
    allLinkableTransactions: Transaction[],
    genesisNode: Genesis
  ): Transaction[] => {
    const transactionsForSelection = allLinkableTransactions.filter(
      (trns) =>
        trns.hash !== requiredTransaction.hash &&
        this.transactionCanBeLinked(trns)
    );
    transactionsForSelection.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    let selectedTransaction;
    if (transactionsForSelection.length) {
      selectedTransaction =
        transactionsForSelection[
          Math.floor(Math.random() * transactionsForSelection.length)
        ];
    } else {
      selectedTransaction = genesisNode;
    }

    return [selectedTransaction as Transaction, requiredTransaction];
  };

  hashAndClusterHashFor = (
    transactions: Transaction[]
  ): TransactionAndClusterVerification[] =>
    transactions.map((trns) => ({
      hash: trns.hash,
      clusterHash: this.getClusterHash(trns),
    }));

  verifiedTransactionPair = (): TransactionAndClusterVerification[] => {
    const transactions = this.nodes.filter(
      (node) => node.type === NodeTypes.Transaction
    ) as Transaction[];

    const validations = this.nodes.filter(
      (node) => node.type == NodeTypes.Verification
    ) as Verification[];

    const allLinkableTransactions = transactions.filter(
      (transaction) =>
        validations.filter(
          (validation) => validation.verifiesNode === transaction.hash
        ).length >= this.MINIMUM_VALIDATIONS_FOR_TRANSACTION
    );

    const transactionsNeedingLinking = allLinkableTransactions.filter(
      (linkableTransaction) =>
        transactions.filter((transaction) =>
          transaction.targets.some(
            (target) => target.hash === linkableTransaction.hash
          )
        ).length < this.MINIMUM_LINKED_TRANSACTIONS_FOR_TRANSACTION
    );

    if (
      transactionsNeedingLinking.length >=
      this.MINIMUM_LINKED_TRANSACTIONS_FOR_TRANSACTION
    ) {
      const trnxs = this.twoTransactions(transactionsNeedingLinking, "old");
      return this.hashAndClusterHashFor(trnxs);
    }

    const genesisNode = this.nodes.find(
      (node) => node.type === NodeTypes.Genesis
    ) as Genesis;

    if (
      transactionsNeedingLinking.length === 1 &&
      allLinkableTransactions.length > 0
    ) {
      const transactions = this.twoTransactionsOneRequired(
        transactionsNeedingLinking[0],
        allLinkableTransactions,
        genesisNode
      );
      return this.hashAndClusterHashFor(transactions);
    }

    if (
      transactionsNeedingLinking.length === 1 &&
      allLinkableTransactions.length === 0
    ) {
      const genesisObj = {
        hash: genesisNode.hash,
        clusterHash: genesisNode.hash,
      };

      // ensure that the non-genesis transaction returned is valid for linking
      const secondTransactionObj = this.transactionCanBeLinked(
        transactionsNeedingLinking[0]
      )
        ? {
            hash: transactionsNeedingLinking[0].hash,
            clusterHash: this.getClusterHash(transactionsNeedingLinking[0]),
          }
        : genesisObj;

      return [genesisObj, secondTransactionObj];
    }

    if (transactionsNeedingLinking.length === 0) {
      if (allLinkableTransactions.length >= 2) {
        const trnxs = this.twoTransactions(allLinkableTransactions, "new");
        return this.hashAndClusterHashFor(trnxs);
      }

      if (allLinkableTransactions.length === 1) {
        // ensure that the non-genesis transaction returned is valid for linking
        const genesisObj = {
          hash: genesisNode.hash,
          clusterHash: genesisNode.hash,
        };
        const secondTransactionObj = this.transactionCanBeLinked(
          allLinkableTransactions[0]
        )
          ? {
              hash: allLinkableTransactions[0].hash,
              clusterHash: this.getClusterHash(allLinkableTransactions[0]),
            }
          : genesisObj;

        return [genesisObj, secondTransactionObj];
      }
    }

    const hash = genesisNode.hash;
    return [
      { hash, clusterHash: hash },
      { hash, clusterHash: hash },
    ];
  };
}

export default Graph;
