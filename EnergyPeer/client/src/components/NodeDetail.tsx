import { types } from "energylib";
import { Paper, Grid } from "@mui/material";
import { SmallHeading, SmallContent } from "../styles";
import dayjs from "dayjs";

import styled from "styled-components";

const NodeDetailBox = styled(Paper)``;

const NodeText = (node: types.AnyNode) => {
  switch (node.type) {
    case 0: {
      return (
        <Grid container spacing={0}>
          <Grid item xs={2}>
            <SmallHeading>Node type</SmallHeading>
          </Grid>
          <Grid item xs={4}>
            <SmallContent>Genesis</SmallContent>
          </Grid>
          <Grid item xs={2}>
            <SmallHeading>Creator public Key</SmallHeading>
          </Grid>
          <Grid item xs={4}>
            <SmallContent>{`${node.creator.substring(0, 20)}...`}</SmallContent>
          </Grid>

          <Grid item xs={2}>
            <SmallHeading>Creation date</SmallHeading>
          </Grid>
          <Grid item xs={4}>
            <SmallContent>
              {dayjs(node.createdAt).format("D MMMM YYYY, HH:mm")}
            </SmallContent>
          </Grid>
          <Grid item xs={2}>
            <SmallHeading>Hash</SmallHeading>
          </Grid>
          <Grid item xs={4}>
            <SmallContent>{`${node.hash.substring(0, 20)}...`}</SmallContent>
          </Grid>
        </Grid>
      );
    }
    case 1: {
      return (
        <Grid container spacing={0}>
          <Grid item xs={2}>
            <SmallHeading>Node type</SmallHeading>
          </Grid>
          <Grid item xs={4}>
            <SmallContent>Verification</SmallContent>
          </Grid>
          <Grid item xs={2}>
            <SmallHeading>Creator public Key</SmallHeading>
          </Grid>
          <Grid item xs={4}>
            <SmallContent>{`${node.creator.substring(0, 20)}...`}</SmallContent>
          </Grid>

          <Grid item xs={2}>
            <SmallHeading>Creation date</SmallHeading>
          </Grid>
          <Grid item xs={4}>
            <SmallContent>
              {dayjs(node.createdAt).format("D MMMM YYYY, HH:mm")}
            </SmallContent>
          </Grid>
          <Grid item xs={2}>
            <SmallHeading>Hash</SmallHeading>
          </Grid>
          <Grid item xs={4}>
            <SmallContent>{`${node.hash.substring(0, 20)}...`}</SmallContent>
          </Grid>

          <Grid item xs={2}>
            <SmallHeading>Verifies node</SmallHeading>
          </Grid>
          <Grid item xs={4}>
            <SmallContent>{`${node.verifiesNode.substring(
              0,
              20
            )}...`}</SmallContent>
          </Grid>
        </Grid>
      );
    }
    case 2: {
      return (
        <Grid container spacing={0}>
          <Grid item xs={2}>
            <SmallHeading>Node type</SmallHeading>
          </Grid>
          <Grid item xs={4}>
            <SmallContent>Transaction</SmallContent>
          </Grid>
          <Grid item xs={2}>
            <SmallHeading>Creator public Key</SmallHeading>
          </Grid>
          <Grid item xs={4}>
            <SmallContent>{`${node.creator.substring(0, 20)}...`}</SmallContent>
          </Grid>

          <Grid item xs={2}>
            <SmallHeading>Recipient public Key</SmallHeading>
          </Grid>
          <Grid item xs={4}>
            <SmallContent>{`${node.recipient.substring(
              0,
              20
            )}...`}</SmallContent>
          </Grid>

          <Grid item xs={2}>
            <SmallHeading>Creation date</SmallHeading>
          </Grid>
          <Grid item xs={4}>
            <SmallContent>
              {dayjs(node.createdAt).format("D MMMM YYYY, HH:mm")}
            </SmallContent>
          </Grid>

          <Grid item xs={2}>
            <SmallHeading>Amount</SmallHeading>
          </Grid>
          <Grid item xs={4}>
            <SmallContent>{node.amount}</SmallContent>
          </Grid>
          <Grid item xs={2}>
            <SmallHeading>Hash</SmallHeading>
          </Grid>
          <Grid item xs={4}>
            <SmallContent>{`${node.hash.substring(0, 20)}...`}</SmallContent>
          </Grid>
        </Grid>
      );
    }

    case 3: {
      return (
        <Grid container spacing={0}>
          <Grid item xs={2}>
            <SmallHeading>Node type</SmallHeading>
          </Grid>
          <Grid item xs={4}>
            <SmallContent>Request for payment</SmallContent>
          </Grid>
          <Grid item xs={2}>
            <SmallHeading>Creator public Key</SmallHeading>
          </Grid>
          <Grid item xs={4}>
            <SmallContent>{`${node.creator.substring(0, 20)}...`}</SmallContent>
          </Grid>

          <Grid item xs={2}>
            <SmallHeading>Recipient public Key</SmallHeading>
          </Grid>
          <Grid item xs={4}>
            <SmallContent>{`${node.recipient.substring(
              0,
              20
            )}...`}</SmallContent>
          </Grid>

          <Grid item xs={2}>
            <SmallHeading>Creation date</SmallHeading>
          </Grid>
          <Grid item xs={4}>
            <SmallContent>
              {dayjs(node.createdAt).format("D MMMM YYYY, HH:mm")}
            </SmallContent>
          </Grid>

          <Grid item xs={2}>
            <SmallHeading>Amount of energy</SmallHeading>
          </Grid>
          <Grid item xs={4}>
            <SmallContent>{node.amount}</SmallContent>
          </Grid>
          <Grid item xs={2}>
            <SmallHeading>Hash</SmallHeading>
          </Grid>
          <Grid item xs={4}>
            <SmallContent>{`${node.hash.substring(0, 20)}...`}</SmallContent>
          </Grid>

          <Grid item xs={2}>
            <SmallHeading>Price</SmallHeading>
          </Grid>
          <Grid item xs={4}>
            <SmallContent>{node.price}</SmallContent>
          </Grid>
        </Grid>
      );
    }

    case 4: {
      return (
        <Grid container spacing={0}>
          <Grid item xs={2}>
            <SmallHeading>Node type</SmallHeading>
          </Grid>
          <Grid item xs={4}>
            <SmallContent>Energy Code transfer</SmallContent>
          </Grid>
          <Grid item xs={2}>
            <SmallHeading>Creator public Key</SmallHeading>
          </Grid>
          <Grid item xs={4}>
            <SmallContent>{`${node.creator.substring(0, 20)}...`}</SmallContent>
          </Grid>

          <Grid item xs={2}>
            <SmallHeading>Recipient public Key</SmallHeading>
          </Grid>
          <Grid item xs={4}>
            <SmallContent>{`${node.recipient.substring(
              0,
              20
            )}...`}</SmallContent>
          </Grid>

          <Grid item xs={2}>
            <SmallHeading>Creation date</SmallHeading>
          </Grid>
          <Grid item xs={4}>
            <SmallContent>
              {dayjs(node.createdAt).format("D MMMM YYYY, HH:mm")}
            </SmallContent>
          </Grid>

          <Grid item xs={2}>
            <SmallHeading>Amount</SmallHeading>
          </Grid>
          <Grid item xs={4}>
            <SmallContent>{node.amount}</SmallContent>
          </Grid>
          <Grid item xs={2}>
            <SmallHeading>Hash</SmallHeading>
          </Grid>
          <Grid item xs={4}>
            <SmallContent>{`${node.hash.substring(0, 20)}...`}</SmallContent>
          </Grid>
        </Grid>
      );
    }

    default:
      return "Unknown node";
  }
};

const NodeDetail = ({ node }: { node: types.AnyNode | undefined }) => {
  return (
    <NodeDetailBox
      sx={{
        backgroundColor: "#aed581",
        color: "#000000de",
        padding: "10px",
      }}
      elevation={0}
    >
      {node ? NodeText(node) : "No node selected"}
    </NodeDetailBox>
  );
};
export default NodeDetail;
