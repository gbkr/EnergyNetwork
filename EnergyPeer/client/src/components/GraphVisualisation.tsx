import ForceGraph2D from "react-force-graph-2d";
import { types } from "energylib";
import { EnergyToken } from "energylib/src/types";
import React from "react";
import Paper from "@mui/material/Paper";
import { NodeDetail } from "../components";

const GraphVisualisation = React.memo(({ graph }: types.IGraph) => {
  const [selectedNode, setSelectedNode] = React.useState<types.AnyNode>();
  const handleNodeClick = (vizObj: any) => {
    const node = graph._graph.find((n) => n.hash === vizObj.id);
    setSelectedNode(node);
  };
  const genesis = graph._graph.filter(
    (node) => node.type === 0
  ) as types.Genesis[];
  const transactions = graph._graph.filter((node) =>
    [2, 3, 4].includes(node.type)
  ) as types.Transaction[];
  const verifications = graph._graph.filter(
    (node) => node.type === 1
  ) as types.Verification[];

  const g = genesis.map((gen) => ({ id: gen.hash, type: gen.type }));
  const t = transactions.map((trns) => ({
    id: trns.hash,
    type: trns.type,
    amount: trns.amount,
  }));
  const v = verifications.map((ver) => ({
    id: ver.hash, // required for the graph lib
    type: ver.type,
    creator: ver.creator,
    verifiesNode: ver.verifiesNode,
  }));
  const links: any = [];
  transactions.forEach((trns) => {
    trns.targets.forEach((target) => {
      links.push({ source: trns.hash, target: target.hash });
    });
    if (trns.paymentForRFP) {
      links.push({ source: trns.hash, target: trns.paymentForRFP.rfpHash });
    }
    if (trns.energyToken) {
      links.push({
        source: trns.hash,
        target: (trns as unknown as EnergyToken).RFPHash,
      });
    }
  });
  verifications.forEach((ver) =>
    links.push({ source: ver.hash, target: ver.verifiesNode })
  );
  const data = {
    nodes: [...g, ...t, ...v],
    links: [...links],
  };

  const getNodeColor = (node: any) => {
    switch (node.type) {
      case 2:
        const transactions = graph._graph.filter(
          (node) => node.type === 2 || node.type === 3
        ) as types.Transaction[];

        const verifications = graph._graph.filter(
          (node) => node.type === 1
        ) as types.Verification[];
        const hasEnoughTransactionConnections =
          transactions.filter((t) =>
            t.targets.some((target) => target.hash === node.id)
          ).length >= graph.MINIMUM_LINKED_TRANSACTIONS_FOR_TRANSACTION;
        const hasEnoughValidations =
          verifications.filter((v) => v.verifiesNode === node.id).length >=
          graph.MINIMUM_VALIDATIONS_FOR_TRANSACTION;

        if (hasEnoughTransactionConnections) {
          return "#1D428A";
        } else if (hasEnoughValidations) {
          return "#00CCFF";
        } else {
          return "#AFDBF5";
        }
      case 1:
        return "yellow";
      case 0:
        return "green";
      case 3:
        return "orange";
      case 4:
        return "purple";
    }
    return "red";
  };

  return (
    <>
      <Paper elevation={6}>
        <NodeDetail node={selectedNode} />
        <ForceGraph2D
          nodeColor={(node: any) => getNodeColor(node)}
          onDagError={() => console.error("cycle found")}
          dagMode="radialout"
          graphData={data}
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={1}
          linkCurvature={0}
          onNodeClick={handleNodeClick}
          width={1100}
          // prevent animation
          cooldownTime={0}
        />
      </Paper>
    </>
  );
});

export default GraphVisualisation;
