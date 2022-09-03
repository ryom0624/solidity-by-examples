const { expect } = require("chai");
const { ethers } = require("hardhat");

const fEther = (amount) => {
  return ethers.utils.formatEther(amount, "ether")
}
const pEther = (amount) => {
  return ethers.utils.parseEther(amount);
}

describe("DelegateCallSecurity2", function () {
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

    const Lib = await ethers.getContractFactory("Lib2");
    lib = await Lib.connect(owner).deploy();
    await lib.deployed();

    const Contract = await ethers.getContractFactory("HackMe2");
    contract = await Contract.connect(owner).deploy(lib.address);
    await contract.deployed();

    accounts = await ethers.getSigners();
    const Attack = await ethers.getContractFactory("DelegateCallAttacker2");
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

  describe("Lib2", () => {
    it("", async () => {
      await lib.doSomething(3);
      expect(await lib.someNumber()).to.be.equal(3);
    });
  });
  describe("HackMe2", () => {
    it("", async () => {
      expect(await contract.doSomething(4)).to.be.ok;
      // expect(await contract.someNumber()).to.be.equal(4);
    });
  });
  describe("DelegateCallAttacker22", () => {
    it("", async () => {
      await attack.attack()
      expect(await contract.owner()).to.be.equal(attack.address);
    });
  });

});
