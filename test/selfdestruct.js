const { expect } = require("chai");
const { ethers } = require("hardhat");

const fEther = (amount) => {
  return ethers.utils.formatEther(amount, "ether")
}
const pEther = (amount) => {
  return ethers.utils.parseEther(amount);
}

describe("EtherGame", function () {
  let accounts;
  let contract;
  let attack;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("EtherGame");
    contract = await Contract.deploy();
    await contract.deployed();

    console.log(contract.address)

    accounts = await ethers.getSigners();
    const Attack = await ethers.getContractFactory("EtherGameAttacker");
    attack = await Attack.deploy(contract.address);
    await attack.deployed();

    await contract.connect(accounts[1]).deposit({value: pEther("1.0")})
    await contract.connect(accounts[2]).deposit({value: pEther("1.0")})
  });

  describe("01", () => {
    it("test", async () => {
      await attack.connect(accounts[10]).attack({value: pEther("5.0")})

      expect(await ethers.provider.getBalance(contract.address)).to.be.equal(pEther("7"));
      expect(await contract.winner()).to.be.equal(
        "0x0000000000000000000000000000000000000000"
        );

      await expect(
        contract.connect(accounts[1]).deposit({ value: pEther("1.0") })
      ).to.be.revertedWith("Game is over");
    });

  });

});

describe("safeEtherGame", () => {
  it("safeEtherGame", async() => {
    const accounts = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("SafeEthergame");
    const contract = await Contract.deploy();
    await contract.deployed();

    const Attack = await ethers.getContractFactory("EtherGameAttacker");
    const attack = await Attack.deploy(contract.address);
    await attack.deployed();

    await contract.connect(accounts[1]).deposit({ value: pEther("1.0") });
    await contract.connect(accounts[2]).deposit({ value: pEther("1.0") });

    await attack.connect(accounts[10]).attack({ value: pEther("5.0") });

    expect(await contract.connect(accounts[3]).deposit({ value: pEther("1.0") })).to.be.ok;
    expect(await contract.connect(accounts[1]).deposit({ value: pEther("1.0") })).to.be.ok;
    expect(await contract.connect(accounts[2]).deposit({ value: pEther("1.0") })).to.be.ok;
    expect(await contract.connect(accounts[3]).deposit({ value: pEther("1.0") })).to.be.ok;
    expect(await contract.connect(accounts[7]).deposit({ value: pEther("1.0") })).to.be.ok;

    expect(await contract.winner()).to.be.equal(accounts[7].address);
    expect(await contract.connect(accounts[7]).claimReward()).to.be.ok;



  })
})
