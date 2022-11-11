import { types } from "energylib";
import dayjs from "dayjs";
import { useState } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { Heading, Content } from "../styles";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { copyToClipboard } from "../utils";
import styled from "styled-components";

type DateType = string | number | Date;

declare module "dayjs" {
  interface Dayjs {
    fromNow(withoutSuffix?: boolean): string;
    from(compared: DateType, withoutSuffix?: boolean): string;
    toNow(withoutSuffix?: boolean): string;
    to(compared: DateType, withoutSuffix?: boolean): string;
  }
}

const PublicKeyCopy = styled.span`
  padding-left: 20px;
`;

const About = ({ config, info, peers, graph }: types.PeerInfo) => {
  const [uptimeFrom, setUptimeFrom] = useState("Calculating...");
  const [isCopied, setIsCopied] = useState(false);
  const relativeTime = require("dayjs/plugin/relativeTime");
  dayjs.extend(relativeTime);

  const calcUptime = () => setUptimeFrom(dayjs(config.createdAt).fromNow());
  setInterval(calcUptime, 1000);

  const handleCopyClick = () => {
    copyToClipboard(config.publicKey)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1500);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Heading>Public Key</Heading>
        </Grid>
        <Grid item xs={9}>
          <Content>
            {config.publicKey.substring(0, 8)}...&nbsp;
            <PublicKeyCopy onClick={handleCopyClick}>
              <ContentCopyIcon fontSize="small" />
            </PublicKeyCopy>
            <span>{isCopied ? "Copied to clipboard" : null}</span>
          </Content>
        </Grid>
        <Grid item xs={3}>
          <Heading>Created on</Heading>
        </Grid>
        <Grid item xs={9}>
          <Content>{dayjs(config.createdAt).format("D MMMM YYYY")}</Content>
        </Grid>

        <Grid item xs={3}>
          <Heading>Online since</Heading>
        </Grid>
        <Grid item xs={9}>
          <Content>{uptimeFrom}</Content>
        </Grid>

        <Grid item xs={3}>
          <Heading>Available energy</Heading>
        </Grid>
        <Grid item xs={9}>
          <Content>{info.availableEnergy}</Content>
        </Grid>

        <Grid item xs={3}>
          <Heading>Available tokens</Heading>
        </Grid>
        <Grid item xs={9}>
          <Content>{info.tokens}</Content>
        </Grid>

        <Grid item xs={3}>
          <Heading>Fiat Balance</Heading>
        </Grid>
        <Grid item xs={9}>
          <Content>{info.fiat}</Content>
        </Grid>

        <Grid item xs={3}>
          <Heading>Number of peers</Heading>
        </Grid>
        <Grid item xs={9}>
          <Content>{peers.length}</Content>
        </Grid>

        <Grid item xs={3}>
          <Heading>Graph size</Heading>
        </Grid>
        <Grid item xs={9}>
          <Content>{graph._graph.length}</Content>
        </Grid>
      </Grid>
    </Box>
  );
};

export default About;
