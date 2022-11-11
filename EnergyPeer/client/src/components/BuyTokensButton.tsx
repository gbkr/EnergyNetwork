import React from "react";
import Button from "@mui/material/Button";

import axios from "axios";

const BuyTokensButton = () => {
  function buyToken() {
    const url = `http://${window.location.hostname}:${window.location.port}/api/tokens/buy`;
    axios.get(url);
  }
  return (
    <Button variant="text" color="primary" onClick={buyToken}>
      Buy tokens
    </Button>
  );
};

export default BuyTokensButton;
