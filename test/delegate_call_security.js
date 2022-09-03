const { expect } = require("chai");
const { ethers } = require("hardhat");

const fEther = (amount) => {
  return ethers.utils.formatEther(amount, "ether")
}
const pEther = (amount) => {
  return ethers.utils.parseEther(amount);
}

describe("DelegateCallSecurity", function () {
  let accounts;
  let lib
  let contract;
  let attack;
  let owner;
  let attacker;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    owner = accounts[1];
    attacker = accounts[2];

    const Lib = await ethers.getContractFactory("Lib");
    lib = await Lib.connect(owner).deploy();
    await lib.deployed();

    const Contract = await ethers.getContractFactory("HackMe");
    contract = await Contract.connect(owner).deploy(lib.address);
    await contract.deployed();

    accounts = await ethers.getSigners();
    const Attack = await ethers.getContractFactory("DelegateCallAttacker");
    attack = await Attack.deploy(contract.address);
    await attack.deployed();

    // expect(await lib.owner()).to.be.equal(owner.address)
    expect(await contract.owner()).to.be.equal(owner.address)

  });

  describe("info", ()=> {
    it("", async ()=> {
      console.log("owner:             ", owner.address);
      console.log("attacker:          ", attacker.address);
      console.log("HackMe contract:   ", contract.address);
      console.log("attacker contract: ", attack.address);
    })
  })

  describe("accounts[3] call pwn at Lib contract", () => {
    it("", async () => {
      await lib.connect(accounts[3]).pwn();
      expect(await lib.owner()).to.be.equal(accounts[3].address);
    });
  });

  describe("DelegateCallAttacker is owner of HackMe contract after attack()", () => {
    it("test", async () => {
      expect(await contract.owner()).to.be.equal(owner.address);
      await attack.connect(attacker).attack();
      expect(await contract.owner()).to.be.equal(attack.address);
    });
  });
});
