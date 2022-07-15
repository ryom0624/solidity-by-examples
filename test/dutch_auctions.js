const { expect } = require("chai");
const { ethers } = require("hardhat");


const sleep = waitTime => new Promise( resolve => setTimeout(resolve, waitTime) );

describe("", function () {
  let accounts;
  let contract;
  let seller;
  before(async () => {
    accounts = await ethers.getSigners();
    seller = accounts[1]

    const NFT = await ethers.getContractFactory("MYERC721");
    nftContract = await NFT.deploy();
    await nftContract.deployed();
    await nftContract.mint(seller.address, 0);
    await nftContract.mint(seller.address, 1);

    const Contract = await ethers.getContractFactory("DutchAuction");

    const startPrice = ethers.utils.parseEther("100.0")
    const discountRate = ethers.utils.parseEther("0.0001");
    contract = await Contract.connect(seller).deploy(
      startPrice,
      discountRate,
      nftContract.address,
      1
    );
    await contract.deployed();
  });

  describe("01", () => {
    it("test", async () => {
      console.log(await contract.ts());
      console.log(await contract.getPrice());
      await network.provider.send("evm_increaseTime", [3600]);
      await network.provider.send("evm_mine");
      console.log(await contract.ts());
      console.log(await contract.getPrice());

      await nftContract.connect(seller).approve(contract.address, 1)
      await contract.connect(accounts[2]).buy({value: ethers.utils.parseEther("99.65")})
      expect(await nftContract.ownerOf(1)).to.be.eq(accounts[2].address)
    });
  });
});
