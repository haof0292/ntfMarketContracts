// NFTMarketplaceFetch.test.ts
import { expect } from "chai"
import { ethers } from "hardhat"
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"

const _name='Mynft';
const _symbol='HX';
var tokenId = 1
describe("NFTMarketplace Fetch functions", function () {
  const auctionPrice = ethers.parseUnits('1', 'ether');
  async function delpoyMarketFixture() {
    const [account0, account1] = await ethers.getSigners();
    const address0 = await account0.getAddress();
    const address1 = await account1.getAddress();
    const nft = await ethers.deployContract("HxToken", [_name, _symbol]);
    const market = await ethers.deployContract("MyMarket");
    const listingFee = await market.getListingFee();
    for(let i=1;i<=6;i++){
      await nft.mintTo(address0, i);
      console.log("mint tokenId:" + i + " to account0:", address0)
    }
    // console.log("3. == mint 7-9 to account#1")
    for(let i=7;i<=9;i++){
      await nft.connect(account1).mintTo(address1,i);
      console.log("mint tokenId:" + i + " to account1:", address1)
    }
  
    // console.log("2. == list 1-6 to market")
    for(let i=1;i<=6;i++){
      await nft.approve(market.getAddress(),i);
      await market.createMarketItem(nft.getAddress(), i, auctionPrice, { value: listingFee });
      console.log("createMarketItem tokenId:" + i + " to market:")
    }    
    return {market, account0, account1, nft};
  }
  describe("complex  test", function (){
    it("Should fetchActiveItems correctly", async function() {
      const {market} = await loadFixture(delpoyMarketFixture);
      const items = await market.fetchActiveItems();
      expect(items.length).to.be.equal(6);
    })  


    it("Should fetchMyCreatedItems correctly", async function() {
      const {market} = await loadFixture(delpoyMarketFixture);
      const items = await market.fetchMyCreatedItems();
      expect(items.length).to.be.equal(6);

      //should delete correctly
      await market.deleteMarketItem(1);
      const newitems = await market.fetchMyCreatedItems();
      expect(newitems.length).to.be.equal(5);
    })

    it("Should fetchMyPurchasedItems correctly", async function() {
      const {market} = await loadFixture(delpoyMarketFixture);
      const items = await market.fetchMyPurchasedItems();
      expect(items.length).to.be.equal(0);
    })

    it("Should fetchActiveItems with correct return values", async function() {
      const {market, account0, account1, nft} = await loadFixture(delpoyMarketFixture);
      const address0 = await account0.getAddress();
      const items = await market.fetchActiveItems();
      const nft_addresss = await nft.getAddress();
      expect(items[0].id).to.be.equal(BigInt(1));
      expect(items[0].nftContract).to.be.equal(nft_addresss);
      expect(items[0].tokenId).to.be.equal(BigInt(1));
      expect(items[0].seller).to.be.equal(address0);
      expect(items[0].buyer).to.be.equal(ethers.ZeroAddress);
      expect(items[0].state).to.be.equal(0);//enum State.Created
    }) 

    it("Should fetchMyPurchasedItems with correct return values", async function() {
      const {market, account0, account1, nft} = await loadFixture(delpoyMarketFixture);
      const address0 = await account0.getAddress();
      const address1 = await account1.getAddress();
      const nft_address = await nft.getAddress();
      await market.connect(account1).createMarketSale(nft_address, 1, { value: auctionPrice})
      const items = await market.connect(account1).fetchMyPurchasedItems()

      expect(items[0].id).to.be.equal(BigInt(1));
      expect(items[0].nftContract).to.be.equal(nft_address);
      expect(items[0].tokenId).to.be.equal(BigInt(1));
      expect(items[0].seller).to.be.equal(address0);
      expect(items[0].buyer).to.be.equal(address1);//address#1
      expect(items[0].state).to.be.equal(1);//enum State.Release
  })    

    it("Should fetchMySoldItems with correct return values", async function() {
      const {market, account0, account1, nft} = await loadFixture(delpoyMarketFixture);
      const address0 = await account0.getAddress();
      const address1 = await account1.getAddress();
      const nft_address = await nft.getAddress();
      await market.connect(account1).createMarketSale(nft_address, 1, { value: auctionPrice})
      const items = await market.connect(account0).fetchMySoldItems()

      expect(items.length).to.be.equal(1);
      expect(items[0].id).to.be.equal(BigInt(1));
      expect(items[0].nftContract).to.be.equal(nft_address);
      expect(items[0].tokenId).to.be.equal(BigInt(1));
      expect(items[0].seller).to.be.equal(address0);
      expect(items[0].buyer).to.be.equal(address1);
  })  
})   

})
