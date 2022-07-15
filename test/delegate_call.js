const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("DelegateCall", function () {
  it("test", async function () {
    const accounts = await ethers.getSigners();

    const ContractB = await ethers.getContractFactory("B");
    const contractB = await ContractB.deploy();
    await contractB.deployed();

    const ContractA = await ethers.getContractFactory("A");
    const contractA = await ContractA.deploy();
    await contractA.deployed();

    await contractB.setVars(55, {value: ethers.utils.parseUnits("2.5")});
    expect(await contractB.num()).to.be.equal(55)
    expect(await contractB.sender()).to.be.equal(accounts[0].address);
    expect(await contractB.value()).to.be.equal(ethers.utils.parseUnits("2.5"));

    await contractA.connect(accounts[1]).setVars(contractB.address, 81, {value: ethers.utils.parseUnits("5.5")});
    expect(await contractA.num()).to.be.equal(81);
    expect(await contractA.sender()).to.be.equal(accounts[1].address);
    expect(await contractA.value()).to.be.equal(ethers.utils.parseUnits("5.5"));

    // contractBのストレージには影響しない
    expect(await contractB.num()).to.be.equal(55);
    expect(await contractB.sender()).to.be.equal(accounts[0].address);
    expect(await contractB.value()).to.be.equal(ethers.utils.parseUnits("2.5"));
  });
});
