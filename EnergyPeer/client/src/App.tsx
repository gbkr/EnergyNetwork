import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { Peers, About, GraphVisualisation } from "./components";

import { Tokens, Energy } from "./pages";
import { Container } from "@mui/material";
import { useQuery } from "react-query";
import axios from "axios";
import { types } from "energylib";

import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";

import { TabContext, TabList, TabPanel } from "@mui/lab";
import Typography from "@mui/material/Typography";

function App() {
  const [value, setValue] = React.useState("1");

  const handleChange = (_: any, newValue: any) => {
    setValue(newValue);
  };
  const { status, data, error } = useQuery<types.PeerInfo>(
    "info",
    async () => {
      const res = await axios.get("/api/info");
      return res.data;
    },
    {
      refetchInterval: 1000,
    }
  );

  if (status === "loading" || typeof data === "undefined")
    return <h3>Loading...</h3>;
  if (status === "error") return <span>Error: {error} </span>;

  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg">
        <Typography
          variant="h5"
          gutterBottom
          component="div"
          pt="30px"
          pb="20px"
        >
          {`${data.config.type} ${data.config.publicKey.substring(0, 6)}`}
        </Typography>
        <Box sx={{ width: "100%", typography: "body1" }}>
          <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <TabList
                onChange={handleChange}
                aria-label="lab API tabs example"
              >
                <Tab label="About" value="1" />
                <Tab label="Energy" value="2" />
                <Tab label="Tokens" value="3" id="tab-tokens" />
                <Tab label="Peers" value="4" />
                <Tab label="Graph" value="5" />
              </TabList>
            </Box>
            <TabPanel value="1">
              <About {...data} />
            </TabPanel>
            <TabPanel value="2">
              <Energy {...data} />
            </TabPanel>
            <TabPanel value="3">
              <Tokens {...data} />
            </TabPanel>
            <TabPanel value="4">
              <Peers {...data} />
            </TabPanel>
            <TabPanel value="5">
              <GraphVisualisation graph={data.graph} />
            </TabPanel>
          </TabContext>
        </Box>
      </Container>
    </>
  );
}

export default App;
