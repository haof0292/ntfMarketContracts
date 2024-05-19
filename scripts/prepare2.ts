
import { HxTokenAddress, MarketAddress,account1,account2 } from "./constants"
import { Contract, ContractRunner, NonceManager, ethers} from "ethers";

const abiJSON = require("./abi/MyMarket.json")
const abi_market = abiJSON.abi
const abiJSON2 = require("./abi/HxToken.json")
const abi_nft = abiJSON2.abi

async function main() {
  const auctionPrice = ethers.parseUnits('1', 'ether')
  const rpc_url = "http://127.0.0.1:8545/"
  const provider = new ethers.JsonRpcProvider(rpc_url)
  const signer_rpc = await provider.getSigner()

  const market:Contract = new Contract(MarketAddress, abi_market, signer_rpc)
  const nft:Contract = new Contract(HxTokenAddress, abi_nft, signer_rpc)
  await nft.mintTo(account1, 14)
  await nft.mintTo(account1, 15)
  for(let i=14;i<=15;i++){
    const owerof7 = await nft.ownerOf(13)
    console.log("tokenId " + i + " owner:", owerof7)
  }
  
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
