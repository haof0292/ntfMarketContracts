
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import hre from "hardhat";
import { expect } from "chai"

const base64 = require( "base-64")
const _name='Mynft'
const _symbol='HX'

describe("HxToken", function () {
  async function deployHxFixture() {
    const [account0, account1] = await hre.ethers.getSigners();
    const hx = await hre.ethers.deployContract("HxToken", [_name, _symbol]);
    return {hx, account0, account1};
  }
  
  describe("nomal funtion test", function (){
    it("Should has the correct name and symbol ", async function () {
      const {hx, account0, account1} = await  loadFixture(deployHxFixture);
      expect(await hx.name()).to.equal(_name)
      expect(await hx.symbol()).to.equal(_symbol)
    })
  
    it("Should tokenId start from 1 and auto increment", async function () {
      const {hx, account0, account1} = await  loadFixture(deployHxFixture);
      const address1=await account1.getAddress()
      await hx.mintTo(address1)
      expect(await hx.ownerOf(1)).to.equal(address1)
  
      await hx.mintTo(address1)
      expect(await hx.ownerOf(2)).to.equal(address1)
      expect(await hx.balanceOf(address1)).to.equal(2)
    })
  
    it("Should mint a token with event", async function () {
      const {hx, account0, account1} = await  loadFixture(deployHxFixture);
      const address1=await account1.getAddress()
      await expect(hx.mintTo(address1))
        .to.emit(hx, 'Transfer')
        .withArgs(hre.ethers.ZeroAddress,address1, 1)
    })
  
    it("Should mint a token with desired tokenURI (log result for inspection)", async function () {
      const {hx, account0, account1} = await  loadFixture(deployHxFixture);
      const address1=await account1.getAddress()
      await hx.mintTo(address1)
  
      const tokenUri = await hx.tokenURI(1)
      console.log("tokenURI:")
      console.log(tokenUri)
  
      const tokenId = 1
      const data = base64.decode(tokenUri.slice(29))
      const itemInfo = JSON.parse(data)
      expect(itemInfo.name).to.be.equal('Hx #'+String(tokenId))
      expect(itemInfo.description).to.be.equal('Hx NFT with on-chain SVG image.')
  
      const svg = base64.decode(itemInfo.image.slice(26))
      const idInSVG = svg.slice(256,-13)
      expect(idInSVG).to.be.equal(String(tokenId))
      console.log("SVG image:")
      console.log(svg)
    })  
  
    it("Should mint 10 token with desired tokenURI", async function () {
      const {hx, account0, account1} = await  loadFixture(deployHxFixture);
      const address1=await account1.getAddress()
   
      for(let i=1;i<=10;i++){
        await hx.mintTo(address1)
        const tokenUri = await hx.tokenURI(i)
  
        const data = base64.decode(tokenUri.slice(29))
        const itemInfo = JSON.parse(data)
        expect(itemInfo.name).to.be.equal('Hx #'+String(i))
        expect(itemInfo.description).to.be.equal('Hx NFT with on-chain SVG image.')
  
        const svg = base64.decode(itemInfo.image.slice(26))
        const idInSVG = svg.slice(256,-13)
        expect(idInSVG).to.be.equal(String(i))
      }
  
      expect(await hx.balanceOf(address1)).to.equal(10)
    })  
  })

  
})
