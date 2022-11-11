import { types } from "energylib";
import { BuyEnergyButton, SellEnergyButton, Simulation } from "../components";

const Energy = ({ prosumption }: types.PeerInfo) => {
  return (
    <>
      <BuyEnergyButton /> <SellEnergyButton />
      {prosumption.length ? <Simulation prosumption={prosumption} /> : null}
    </>
  );
};

export default Energy;
