const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("", function () {
  let accounts;
  let contract;
  let attack;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("TimeLock");
    contract = await Contract.deploy();
    await contract.deployed();

    const Attack = await ethers.getContractFactory("TimeLockAttacker");
    attack = await Attack.deploy(contract.address);
    await attack.deployed();

    await contract
      .connect(accounts[1])
      .deposit({ value: ethers.utils.parseEther("2.0") });
    await contract
      .connect(accounts[2])
      .deposit({ value: ethers.utils.parseEther("4.0") });
    await contract
      .connect(accounts[3])
      .deposit({ value: ethers.utils.parseEther("5.0") });

    await expect(
      contract
      .connect(accounts[2])
      .withdraw()).to.be.revertedWith("Lock time not expired");
  });

  describe("01", () => {
    it("test", async () => {
      await expect(attack.attack({value: ethers.utils.parseEther("2.0")})).to.be.not.reverted;
    });
  });
});
