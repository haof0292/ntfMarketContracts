import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const _name='Mynft'
const _symbol='HX'

const HxModule = buildModule("HxModule", (m) => {
  const name = m.getParameter("name", _name);
  const symbol = m.getParameter("symbol", _symbol);
  const token = m.contract("HxToken", [name, symbol]);
  return { token };
});
export default HxModule;
