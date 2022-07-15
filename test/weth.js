const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WETH", function () {
  it("Should return the new greeting once it's changed", async function () {
    const [account0] = await ethers.getSigners();
    const WETH = await ethers.getContractFactory("WETH");
    const weth = await WETH.deploy();
    await weth.deployed();

    console.log("before")
    console.log(`ETH: ${await account0.getBalance()}`);
    console.log(`WETH: ${await weth.balanceOf(account0.address)}`);

    console.log("send eth and get WETH with sendTransfer method");
    await account0.sendTransaction({to: weth.address, value: ethers.utils.parseUnits("30.0")})
    console.log(`ETH: ${await account0.getBalance()}`);
    console.log(`WETH: ${await weth.balanceOf(account0.address)}`);

    console.log("send eth and get WETH with deposit method");
    await weth.connect(account0).deposit({value: ethers.utils.parseUnits("25")})
    console.log(`ETH: ${await account0.getBalance()}`);
    console.log(`WETH: ${await weth.balanceOf(account0.address)}`);

    console.log("withdraw ETH with withdraw method");
    await weth.connect(account0).withdraw(ethers.utils.parseUnits("17"));
    console.log(`ETH: ${await account0.getBalance()}`);
    console.log(`WETH: ${await weth.balanceOf(account0.address)}`);

  });
});
