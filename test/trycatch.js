const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("TryCatch", function () {
  let accounts;
  let contract;
  beforeEach(async() => {
    accounts = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("Bar");
    contract = await Contract.deploy();
    await contract.deployed();

  })

  describe("01", () => {
    it("test", async() => {
      // const tx = await contract.tryCatchExternalCall(1)
      // const receipt = await tx.wait()
      // console.log(receipt.logs[0])
      await expect(await contract.tryCatchExternalCall(1)).to.emit(contract, "Log").withArgs("my func was called");
    })
  })

  describe("02", () => {
    it("test", async() => {
      await expect(await contract.tryCatchExternalCall(0)).to.emit(contract, "Log").withArgs("external call failed");
    })
  })

  describe("03", () => {
    it("zero address invalid", async() => {
      await expect(contract.tryCatchNewContract("0x0000000000000000000000000000000000000000")).to.emit(contract, "Log",).withArgs("invalid address");
    })
    it("valid address", async() => {
      await expect(contract.tryCatchNewContract("0x0000000000000000000000000000000000000002")).to.emit(contract, "Log").withArgs("Foo created");
    })
  })
});
