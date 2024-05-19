// src/prepare.ts
import { Signer,Contract, NonceManager } from "ethers"
import { artifacts, ethers } from "hardhat"
import { HxTokenAddress, MarketAddress,account1, account2, pk1, pk2 } from "./constants"

async function main() {
  const auctionPrice = ethers.parseUnits('1', 'ether')
  const rpc_url = "http://127.0.0.1:8545/"
  const provider = new ethers.JsonRpcProvider(rpc_url)
  const signer_rpc = await provider.getSigner()
  // const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  // const signer_account1 = new ethers.Wallet(pk1, provider);
  // const signer_account2 = new ethers.Wallet(pk2, provider);
  const signer_account1:Signer = new NonceManager(new ethers.Wallet(pk1, provider))
  const signer_account2:Signer = new NonceManager(new ethers.Wallet(pk2, provider))
  const marketArtifact = await artifacts.readArtifact("MyMarket");
  const market = new Contract(MarketAddress, marketArtifact.abi, signer_rpc);
  const nftArtifact = await artifacts.readArtifact("HxToken");
  const nft = new Contract(HxTokenAddress, nftArtifact.abi, signer_rpc);
  // let tcNum2 = await provider.getTransactionCount(account2)
  // let tcNum1 = await provider.getTransactionCount(account1)
  const listingFee = await market.getListingFee()
  console.log("listingFee:" + listingFee)
  console.log("1.mint tokenId:1-10 to account2:", account2)
  console.log("2. account 1 approve and list tokenId:1-10 to market")
  for(let i=1;i<=10;i++){
    await nft.mintTo(account2, i)
    console.log("mint tokenId: " + i + " to account2: ", account2)
    await nft.connect(signer_account2).approve(MarketAddress, i)
    console.log("approve  to Market, tokenId: ", i)
    await market.createMarketItem(HxTokenAddress, i, auctionPrice, { value: listingFee })
    console.log("market createMarketItem tokenId: ", i)
  }
  
  console.log("3. mint tokenId:11-20 to account1:" + account2)
  console.log("4. account1 approve and  list tokenId:11-20 to market")
  for(let i=11;i<=20;i++){
    await nft.mintTo(account1, i)
    console.log("mint tokenId: " + i + " to account1: ", account1)
    await nft.connect(signer_account1).approve(MarketAddress, i)
    console.log("approve  to Market, tokenId: ", i)
    await market.createMarketItem(HxTokenAddress, i, auctionPrice, { value: listingFee })
    console.log("market createMarketItem tokenId: ", i)
  }
  await market.connect(signer_account1).createMarketSale(HxTokenAddress, 8, { value: auctionPrice})
  console.log("createMarketSale tokenId:8 done") 
  await market.connect(signer_account1).createMarketSale(HxTokenAddress, 9, { value: auctionPrice})
  console.log("createMarketSale tokenId:9 done") 
  await market.connect(signer_account2).createMarketSale(HxTokenAddress, 11, { value: auctionPrice})
  console.log("createMarketSale tokenId:11 done") 
  for(let i=7;i<=12;i++){
    const owerof7 = await nft.ownerOf(i)
    console.log("tokenId " + i + " owner:", owerof7)
    const appr7 = await nft.getApproved(i)
    console.log("tokenId " + i + " getApproved:", appr7) 
  }
  
  console.log("6. account2 delete tokenId:6")
  await market.connect(signer_account2).deleteMarketItem(6)
  const token_info7 = await market.fetchActiveItems()
  console.log("token_info7:", token_info7.length)
  // for(let i=0; i<token_info7.length; i++){
  //   console.log(token_info7[i].tokenId, token_info7[i].seller, account1, token_info7[i].buyer)
  // }
  const purchase = await market.connect(signer_account1).fetchMyPurchasedItems()
  console.log("account1 purchase number:", purchase.length, account1, )

  const sold = await market.connect(signer_account1).fetchMySoldItems()
  console.log("account1 sold:", sold.length, account1 )
  
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
