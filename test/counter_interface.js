const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WETH", function () {
  it("Should return the new greeting once it's changed", async function () {
    const [accounts] = await ethers.getSigners();
    const Counter = await ethers.getContractFactory("Counter");
    const counter = await Counter.deploy();
    await counter.deployed();

    const CallInterface = await ethers.getContractFactory("CallInterface");
    const contract = await CallInterface.deploy();
    await contract.deployed();

    console.log(await contract.count());
    await contract.examples(counter.address);
    console.log(await contract.count());

  });
});
