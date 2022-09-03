const { expect } = require("chai");
const { ethers } = require("hardhat");

const fEther = (amount) => {
  return ethers.utils.formatEther(amount, "ether")
}
const pEther = (amount) => {
  return ethers.utils.parseEther(amount);
}

describe("", function () {
  let accounts;
  let contract;
  let attack;

  beforeEach(async () => {

    accounts = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("");
    contract = await Contract.deploy();
    await contract.deployed();

    accounts = await ethers.getSigners();
    const Attack = await ethers.getContractFactory("");
    attack = await Attack.deploy();
    await attack.deployed();

  });

  describe("01", () => {
    it("test", async () => {
    });
  });

  describe("02", () => {
    it("test", async () => {
    });
  });

  describe("03", () => {
    it("test", async () => {
    });
  });
});
