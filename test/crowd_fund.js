const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("", function () {
  let accounts;
  let contract;
  let token;
  let creator;

  before(async () => {
    accounts = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MYERC20");
    token = await Token.deploy("CrowdFundToken", "CFT");
    await token.deployed();

    const Contract = await ethers.getContractFactory("CrowdFund");
    contract = await Contract.deploy(token.address);
    await contract.deployed();

    creator = accounts[1];
    await token.connect(accounts[0]).mint(ethers.utils.parseEther("100.0"));
    await token.connect(accounts[2]).mint(ethers.utils.parseEther("100.0"));
    await token.connect(accounts[3]).mint(ethers.utils.parseEther("100.0"));

    // console.log(await token.totalSupply())
    // console.log(await token.balanceOf(accounts[2].address))

    // await ethers.provider.send("evm_increaseTime", [3600])
  });

  describe("test", () => {
    it("test", async () => {
      const startAt = (await ethers.provider.getBlock()).timestamp + 10
      const endAt = startAt + 3600
      await contract.connect(creator).launch(ethers.utils.parseEther("20.0"), startAt, endAt);

      await ethers.provider.send("evm_increaseTime", [10]);
      await ethers.provider.send("evm_mine");

      await token.connect(accounts[2]).approve(contract.address, ethers.utils.parseEther("10.0"));
      await token.connect(accounts[3]).approve(contract.address, ethers.utils.parseEther("10.0"));
      await token.connect(accounts[0]).approve(contract.address, ethers.utils.parseEther("10.0"));

      await contract.connect(accounts[2]).pledge(1, ethers.utils.parseEther("5.0"))
      await contract.connect(accounts[3]).pledge(1, ethers.utils.parseEther("5.0"))
      await contract.connect(accounts[0]).pledge(1, ethers.utils.parseEther("5.0"))
      await contract.connect(accounts[2]).pledge(1, ethers.utils.parseEther("5.0"))

      // console.log(ethers.utils.formatUnits(await token.balanceOf(contract.address), "ether"))

      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");

      await contract.connect(creator).claim(1)
      expect(await ethers.provider.getBalance(creator.address)).to.be.gt(ethers.utils.parseEther("119.0"))
    });
  });
});
