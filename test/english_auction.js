const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("", function () {
  let accounts;
  let auctionContract;
  let nftContract;
  let seller;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    seller = accounts[1];

    const NFT = await ethers.getContractFactory("MYERC721");
    nftContract = await NFT.deploy();
    await nftContract.deployed();
    await nftContract.mint(seller.address, 0);
    await nftContract.mint(seller.address, 1);

    const autoctionContract = await ethers.getContractFactory("EnglishAuction");
    auctionContract = await autoctionContract.connect(seller).deploy(nftContract.address, 1, ethers.utils.parseEther("2.0"));
    await auctionContract.deployed();

    await nftContract.connect(seller).approve(auctionContract.address, 1);
    await auctionContract.connect(seller).start();
  });

  describe("info", () => {
    it("nft address", async () => {
      expect(await auctionContract.nftAddr()).to.be.eq(nftContract.address);
    });
    it("nft id", async () => {
      expect(await auctionContract.nftId()).to.be.eq(1);
    });
    it("seller address", async () => {
      expect(await auctionContract.seller()).to.be.eq(accounts[1].address);
    });
    it("start bid", async () => {
      expect(await auctionContract.highestBid()).to.be.eq(
        ethers.utils.parseEther("2.0")
      );
    });
    it("after started auction test", async() => {
      expect(await auctionContract.started()).to.be.ok;
      expect(await nftContract.ownerOf(1)).to.be.eq(auctionContract.address);
      expect(await nftContract.ownerOf(1)).to.be.not.eq(seller.address);
    });

    it("auction", async() => {
      await auctionContract.connect(accounts[2]).bid({from: accounts[2].address, value: await ethers.utils.parseEther("3.0")})
      expect(await auctionContract.highestBid()).to.be.eq(await ethers.utils.parseEther("3.0"))
      expect(await auctionContract.highestBidder()).to.be.eq(accounts[2].address)
      expect(await ethers.provider.getBalance(auctionContract.address)).to.be.eq( await ethers.utils.parseEther("3.0"));

      await auctionContract.connect(accounts[4]).bid({from: accounts[4].address, value: await ethers.utils.parseEther("4.0")})
      expect(await ethers.provider.getBalance(auctionContract.address)).to.be.eq( await ethers.utils.parseEther("7.0"));

      await auctionContract.connect(accounts[3]).bid({from: accounts[3].address, value: await ethers.utils.parseEther("5.0")})
      expect(await ethers.provider.getBalance(auctionContract.address)).to.be.eq( await ethers.utils.parseEther("12.0"));

      await auctionContract.connect(accounts[5]).bid({from: accounts[5].address, value: await ethers.utils.parseEther("980.0")})
      expect(await ethers.provider.getBalance(auctionContract.address)).to.be.eq( await ethers.utils.parseEther("992.0"));
      expect(await auctionContract.highestBid()).to.be.eq(await ethers.utils.parseEther("980.0"))
      expect(await auctionContract.highestBidder()).to.be.eq(accounts[5].address)

      await auctionContract.connect(accounts[2]).bid({from: accounts[2].address, value: await ethers.utils.parseEther("981.0")})
      expect(await auctionContract.highestBid()).to.be.eq(await ethers.utils.parseEther("981.0"))
      expect(await auctionContract.highestBidder()).to.be.eq(accounts[2].address)
      expect(await ethers.provider.getBalance(auctionContract.address)).to.be.eq( await ethers.utils.parseEther("1973.0"));

      await auctionContract.connect(seller).end();
      expect(await nftContract.ownerOf(1)).to.be.eq(accounts[2].address);
      expect(await ethers.provider.getBalance(auctionContract.address)).to.be.eq( await ethers.utils.parseEther("992.0"));
      expect(await ethers.provider.getBalance(seller.address)).to.be.gt((await ethers.utils.parseEther("981.0")).sub(1)); // ガス代で余分に1引いている。


      const beforeWithdraw = await ethers.provider.getBalance(accounts[5].address);
      await auctionContract.connect(accounts[5]).withdraw()
      expect(await ethers.provider.getBalance(seller.address)).to.be.gt(beforeWithdraw);
    });
  });
});
