import Graph from "../graph";
import mockdate from "mockdate";
import elliptic from "elliptic";
import { genKeyPair } from "../wallet";
import { NodeTypes } from "../types";

let graph: Graph;
let keyPair: elliptic.ec.KeyPair;

describe("Graph", () => {
  beforeEach(() => {
    mockdate.set("2021-08-24");
    graph = new Graph();
    mockdate.reset();
    keyPair = genKeyPair();
  });

  describe("Initialization", () => {
    it("is initialized with a single node", () => {
      expect(graph.nodes).toHaveLength(1);
    });

    it("is initialized with a Genesis node", () => {
      expect(graph.nodes[0]).toEqual({
        createdAt: "2021-08-24T00:00:00.000Z",
        hash: "b63d00f81e0ff751cea84baa83fe00be3c6477c6056747121687fa4255aec000",
        type: NodeTypes.Genesis,
      });
    });
  });
});
