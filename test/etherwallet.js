const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SendEth", function () {
  it("Should return the new greeting once it's changed", async function () {
    const EtherWallet = await ethers.getContractFactory("EtherWallet");
    const ew = await EtherWallet.deploy();
    await ew.deployed();
    const accounts = await ethers.getSigners();


    await accounts[0].sendTransaction({to: ew.address, value: ethers.utils.parseUnits("1.4")});
    const balance0 = await ew.getBalance();
    console.log(balance0);

    console.log(await accounts[0].getBalance());
    await ew.withdraw(ethers.utils.parseUnits("1.1"));
    const balance1 = await ew.getBalance();
    console.log(balance1);

    console.log(await accounts[0].getBalance());

  });
});
