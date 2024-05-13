// NFTMarketplace.test.ts
import { expect } from "chai"
import { ethers } from "hardhat"
import { TransactionResponse, TransactionReceipt } from "@ethersproject/providers"
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"

const _name='Mynft'
const _symbol='HX'

describe("NFTMarketplace", function () {
  const auctionPrice = ethers.parseUnits('1', 'ether')
  
  async function delpoyMarketFixture() {
    const [account0, account1, account2] = await ethers.getSigners();
    const nft = await ethers.deployContract("HxToken", [_name, _symbol]);
    const market = await ethers.deployContract("MyMarket");
    // const HxToken = await ethers.getContractFactory("HxToken");
    // const nft = await HxToken.deploy(_name,_symbol);

    // const Market = await ethers.getContractFactory("NFTMarketplace");
    // const market = await Market.deploy();
    const listingFee = await market.getListingFee();
    return {nft, market, listingFee, account0, account1, account2};
  }
  describe("basic function test:", function (){
    it("Should create market item successfully", async function() {
      const {nft, market, listingFee, account0} = await loadFixture(delpoyMarketFixture);
      const address0 = await account0.getAddress();
      await nft.mintTo(address0);  //tokenId=1
      await nft.approve(market.getAddress(), 1);
      await market.createMarketItem(nft.getAddress(), 1, auctionPrice, { value: listingFee });
      const items = await market.fetchMyCreatedItems();
      expect(items.length).to.be.equal(1)
    })
  
    it("Should create market item with EVENT", async function() {
      const {nft, market, listingFee, account0} = await loadFixture(delpoyMarketFixture);
      const address0 = await account0.getAddress();
      await nft.mintTo(address0)  //tokenId=1
      await nft.approve(market.getAddress(),1)
      await expect(market.createMarketItem(nft.getAddress(), 1, auctionPrice, { value: listingFee }))
        .to.emit(market, 'MarketItemCreated')
        .withArgs(
          1,
          nft.getAddress(),
          1,
          address0,
          ethers.ZeroAddress,
          auctionPrice, 
          0)
    })
  
    it("Should revert to create market item if nft is not approved", async function() {
      const {nft, market, listingFee, account0} = await loadFixture(delpoyMarketFixture);
      const address0 = await account0.getAddress();
      await nft.mintTo(address0)  //tokenId=1
      // await nft.approve(market.getAddress(),1)
      await expect(market.createMarketItem(nft.getAddress(), 1, auctionPrice, { value: listingFee }))
        .to.be.revertedWith('NFT must be approved to market')
    })
  
    it("Should create market item and buy (by address#1) successfully", async function() {
      const {nft, market, listingFee, account0, account1} = await loadFixture(delpoyMarketFixture);
      const address0 = await account0.getAddress();
      const address1 = await account1.getAddress();
      await nft.mintTo(address0)  //tokenId=1
      await nft.approve(market.getAddress(),1)
      await market.createMarketItem(nft.getAddress(), 1, auctionPrice, { value: listingFee })
  
      await expect(market.connect(account1).createMarketSale(nft.getAddress(), 1, { value: auctionPrice}))
        .to.emit(market, 'MarketItemSold')
        .withArgs(
          1,
          nft.getAddress(),
          1,
          address0,
          address1,
          auctionPrice, 
          1)
  
      expect(await nft.ownerOf(1)).to.be.equal(address1)
  
    })
  
    it("Should revert buy if seller remove approve", async function() {
      const {nft, market, listingFee, account0, account1} = await loadFixture(delpoyMarketFixture);
      const address0 = await account0.getAddress();
      await nft.mintTo(address0)  //tokenId=1
      await nft.approve(market.getAddress(),1)
      await market.createMarketItem(nft.getAddress(), 1, auctionPrice, { value: listingFee })
  
      await nft.approve(ethers.ZeroAddress,1)
  
      await expect(market.connect(account1).createMarketSale(nft.getAddress(), 1, { value: auctionPrice}))
        .to.be.reverted
    })
  
    it("Should revert buy if seller transfer the token out", async function() {
      const {nft, market, listingFee, account0, account1, account2} = await loadFixture(delpoyMarketFixture);
      const address0 = await account0.getAddress();
      const address2 = await account2.getAddress();
      await nft.mintTo(address0)  //tokenId=1
      await nft.approve(market.getAddress(), 1)
      await market.createMarketItem(nft.getAddress(), 1, auctionPrice, { value: listingFee })
  
      await nft.transferFrom(address0,address2,1)
  
      await expect(market.connect(account1).createMarketSale(nft.getAddress(), 1, { value: auctionPrice}))
        .to.be.reverted
    })
  
    it("Should revert to delete(de-list) with wrong params", async function() {
      const {nft, market, listingFee, account0, account1} = await loadFixture(delpoyMarketFixture);
      const address0 = await account0.getAddress();
      const address1 = await account1.getAddress();
      await nft.mintTo(address0)  //tokenId=1
      await nft.approve(market.getAddress(),1)
      await market.createMarketItem(nft.getAddress(), 1, auctionPrice, { value: listingFee })
  
      //not a correct id
      await expect(market.deleteMarketItem(2)).to.be.reverted
  
      //not owner
      await expect(market.connect(account1).deleteMarketItem(1)).to.be.reverted
  
      await nft.transferFrom(address0,address1,1)
      //not approved to market now
      await expect(market.deleteMarketItem(1)).to.be.reverted
    })
  
    it("Should create market item and delete(de-list) successfully", async function() {
      const {nft, market, listingFee, account0} = await loadFixture(delpoyMarketFixture);
      const address0 = await account0.getAddress();
      await nft.mintTo(address0)  //tokenId=1
      await nft.approve(market.getAddress(),1)
  
      await market.createMarketItem(nft.getAddress(), 1, auctionPrice, { value: listingFee })
      await market.deleteMarketItem(1)
  
      await nft.approve(ethers.ZeroAddress,1)
  
      // should revert if trying to delete again
      await expect(market.deleteMarketItem(1))
        .to.be.reverted
    })
  
    it("Should seller, buyer and market owner correct ETH value after sale", async function() {
      const {nft, market, listingFee, account0, account1, account2} = await loadFixture(delpoyMarketFixture);
      const address0 = await account0.getAddress();
      const address1 = await account1.getAddress();
      const address2 = await account2.getAddress();
      // let txresponse:TransactionResponse, txreceipt:TransactionReceipt;
      const marketownerBalance = await ethers.provider.getBalance(address0)
  
      await nft.connect(account1).mintTo(address1)  //tokenId=1
      await nft.connect(account1).approve(market.getAddress(),1)
  
      let sellerBalance = await ethers.provider.getBalance(address1)
      const txresponse = await market.connect(account1).createMarketItem(nft.getAddress(), 1, auctionPrice, { value: listingFee })
      const sellerAfter = await ethers.provider.getBalance(address1)
  
      const txreceipt = await txresponse.wait();
      const gas = txreceipt.gasUsed * txreceipt.gasPrice;
  
      // sellerAfter = sellerBalance - listingFee - gas
      expect(sellerAfter).to.equal(sellerBalance - listingFee - gas);
  
      const buyerBalance = await ethers.provider.getBalance(address2);
      const txresponse2 =  await market.connect(account2).createMarketSale(nft.getAddress(), 1, { value: auctionPrice});
      const buyerAfter = await ethers.provider.getBalance(address2);
  
      const txreceipt2 = await txresponse2.wait()
      const gas2 = txreceipt2.gasUsed * txreceipt2.gasPrice;
      expect(buyerAfter).to.equal(buyerBalance - auctionPrice - gas2 )
  
      const marketownerAfter = await ethers.provider.getBalance(address0)
      expect(marketownerAfter).to.equal(marketownerBalance + listingFee);
    })
  })
  
  
})
