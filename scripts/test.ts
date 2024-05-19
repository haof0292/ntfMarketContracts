import hre, {artifacts, config } from "hardhat";
import { HxTokenAddress, MarketAddress, account1, account2, pk1, pk2 } from "./constants"
import { Contract, HDNodeWallet, Mnemonic, Signer, ethers } from "ethers";
import { HardhatNetworkAccountsConfig, HardhatNetworkHDAccountsConfig } from "hardhat/types/config";

async function main() {
    const rpc_url = "http://127.0.0.1:8545/"
    const provider = new ethers.JsonRpcProvider(rpc_url)
    const signer = await provider.getSigner()
    console.log("signer:", signer);
    const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const marketArtifact = await artifacts.readArtifact("MyMarket");
    const myContract = new ethers.Contract(MarketAddress, marketArtifact.abi, signer);
    // const market:MyMarket = await ethers.getContractAt("MyMarket", MarketAddress, signer_rpc)
    // const nft:HxToken = await ethers.getContractAt("HxToken", HxTokenAddress, signer_rpc)
    // const myContract = await hre.ethers.getContractAt("MyMarket", contractAddress, signer);
    // await nft.approve(MarketAddress, i, {from:account1})
    // const accounts:HardhatNetworkAccountsConfig  = config.networks.hardhat.accounts;
    // console.log('Accounts from config:', accounts);
    // const index = 0; // first wallet, increment for next wallets
    // console.log('mnemonic:', accounts.mnemonic);
    // const mnemonicInstance = Mnemonic.fromPhrase(accounts.mnemonic);

    // for(let i=0;i<=10;i++){
    //     const path1 = accounts.path + `/${i}`
    //     console.log('path1:', path1);
    //     const wallet1 = HDNodeWallet.fromMnemonic(mnemonicInstance, path1);
    //     const privateKey1 = wallet1.privateKey
    //     console.log('addresss ' + i + " :", wallet1.address);
    //     console.log('privateKey1:', privateKey1);
    //     console.log("-----------------------------------------------");
    // }

        // NOTE manually override the nonce value to solve for intermittent failures
        // that otherwise occur with concurrent deployment transactions.
        // This is intended to **only** work if the deployment account is **not** submitting
        // any other transactions to the network at the same time.
        // let owner:Signer,account1:Signer,account2:Signer
    // const [owner_inner, account1_inner,account2_inner] = await ethers.getSigners()
    // const address1_inner = await account1_inner.getAddress()
    // console.log("address1_inner:" + address1_inner)
    // console.log("account1:" + account1)
    // const address0 = await owner.getAddress()
    // const address1 = await account1.getAddress()
    // const address2 = await account2.getAddress()
    // NOTE collect deployment promises without `await`-ing them,
   
   

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });