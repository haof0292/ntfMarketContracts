import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MarketModule = buildModule("MarketModule", (m) => {
  const market = m.contract("MyMarket");
  return { market };
});
export default MarketModule;