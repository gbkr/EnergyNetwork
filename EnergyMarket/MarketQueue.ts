import { types } from "energylib";
import envConfig from "./envConfig";

interface MQue {
  buyers: types.Buyer[];
  sellers: types.Seller[];
}

let _marketQueue: MQue = {
  buyers: [],
  sellers: [],
};

const energyPrice = () => {
  // the price will be between min and max configured prices, depending on the number of buyers waiting to buy
  const numBuyers = MarketQueue.numberOfBuyers();
  const minEnergyPrice = parseInt(envConfig().MINIMUM_P2P_ENERGY_PRICE);
  const maxEnergyPrice = parseInt(envConfig().MAXIMUM_P2P_ENERGY_PRICE);
  if (numBuyers === 0) {
    return minEnergyPrice;
  } else {
    const priceRange = maxEnergyPrice - minEnergyPrice;
    const price = minEnergyPrice + (priceRange - priceRange / numBuyers);
    return Math.round(price * 100) / 100;
  }
};

const MarketQueue = {
  numberOfBuyers: () => _marketQueue.buyers.length,
  addBuyer: (buyer: types.Buyer) => _marketQueue.buyers.push(buyer),
  addSeller: (seller: types.Seller) => _marketQueue.sellers.push(seller),
  availableBuyer: () => {
    while (_marketQueue.buyers.length) {
      let buyer = _marketQueue.buyers.shift();
      let date = Date.now();
      let expiresAt = Date.parse(buyer!.expiresAt);
      if (date < expiresAt) {
        return buyer;
      }
    }
    return null;
  },
  availableSeller: () => {
    while (_marketQueue.sellers.length) {
      let seller = _marketQueue.sellers.shift();
      let date = Date.now();
      let expiresAt = Date.parse(seller!.expiresAt);
      if (date < expiresAt) {
        return seller;
      }
    }
    return null;
  },
  price: () => energyPrice(),
  buyerExists: (pubKey: string) =>
    _marketQueue.buyers.find(
      (buyer: types.Buyer) =>
        buyer.publicKey === pubKey && Date.now() < Date.parse(buyer.expiresAt)
    ),
  sellerExists: (pubKey: string) =>
    _marketQueue.sellers.find(
      (seller: types.Seller) => seller.publicKey === pubKey
    ),
};

Object.freeze(MarketQueue);
export default MarketQueue;
