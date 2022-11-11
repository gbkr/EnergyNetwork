import React from "react";
import axios from "axios";
import Button from "@mui/material/Button";

const BuyEnergyButton = () => {
  function sellEnergy() {
    const url = `http://${window.location.hostname}:${window.location.port}/api/market/sell`;
    axios.post(url).then((resp) => {
      console.log("Response from sell energy: ", resp.status);
    });
  }

  return (
    <Button variant="text" color="primary" onClick={sellEnergy}>
      Sell Energy
    </Button>
  );
};

export default BuyEnergyButton;
