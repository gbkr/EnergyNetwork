import { types } from "energylib";
import axios from "axios";

export const notifySeller = ({
  seller,
  buyer,
  price,
}: {
  seller: types.Seller;
  buyer: types.Buyer;
  price: number;
}) => {
  console.log(
    `Updating seller ${seller.publicKey} with matched buyer details: ${buyer}`
  );
  const DEFAULT_ENERGY_AMOUNT = 10;
  try {
    axios.post(seller.URL, { ...buyer, price });
  } catch (error: any) {
    console.error(
      "Unable to update seller with buyer details: ",
      error?.message
    );
  }
};
