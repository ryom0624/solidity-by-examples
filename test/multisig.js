const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SendEth", function () {
  it("Should return the new greeting once it's changed", async function () {
    const accounts = await ethers.getSigners();

    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    const addresses = [
      accounts[0].address,
      accounts[1].address,
      accounts[2].address,
      accounts[3].address,
      accounts[4].address,
    ];
    console.log(addresses);
    const wallet = await MultiSigWallet.deploy(addresses, 2);
    await wallet.deployed();
    console.log("deployed");

    await accounts[0].sendTransaction({to: wallet.address,value: ethers.utils.parseUnits("10")});

    console.log("get required length");
    console.log(await wallet.required());
    console.log("get owners");
    // console.log(await wallet.isExistOwner());
    // console.log(await wallet.ownersCount())
    console.log(await wallet.getOwners());

    // console.log(await wallet.owners(0));
    // console.log(await wallet.owners(1));
    // console.log(await wallet.owners(2));
    // console.log(await wallet.owners(3));
    // console.log(await wallet.owners(4));
    // console.log(await wallet.isOwner(accounts[0].address));

    console.log("submit");
    await wallet.submit(
      accounts[5].address,
      ethers.utils.parseUnits("0.25"),
      ethers.utils.formatBytes32String("hoge")
    );

    console.log("get transactions");
    const txId = await wallet.lastTransactionId();
    console.log(txId);

    console.log("get transaction");
    console.log(await wallet.transactions(txId));

    // console.log("execute");
    // await wallet.execute(txId);
    // Error: VM Exception while processing transaction: reverted with reason string 'approvals < required'

    console.log("approve");
    await wallet.connect(accounts[0]).approve(txId);
    await wallet.connect(accounts[1]).approve(txId);

    console.log("execute");
    await wallet.execute(txId);

    console.log(await accounts[5].getBalance());
  });
});
