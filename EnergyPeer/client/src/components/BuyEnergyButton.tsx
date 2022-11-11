import React from "react";
import axios from "axios";
import Button from "@mui/material/Button";

const BuyEnergyButton = () => {
  function addToBuyerList() {
    const url = `http://${window.location.hostname}:${window.location.port}/api/market/buy`;
    axios.post(url).then((resp) => {
      console.log("Response from buy energy: ", resp.status);
    });
  }

  return (
    <Button variant="text" color="primary" onClick={addToBuyerList}>
      Buy Energy
    </Button>
  );
};

export default BuyEnergyButton;
