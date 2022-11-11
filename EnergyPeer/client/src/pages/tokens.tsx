import { BuyTokensButton } from "../components";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { types } from "energylib";
import { Heading, Content } from "../styles";

export const Tokens = ({ info }: types.PeerInfo) => {
  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <Grid item xs={3}>
          <Heading>Available tokens</Heading>
        </Grid>
        <Grid item xs={7}>
          <Content id="token-count">{info.tokens}</Content>
        </Grid>
      </Box>

      <BuyTokensButton />
    </>
  );
};

export default Tokens;
