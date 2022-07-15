const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("", function () {
  let accounts;
  let proxy;
  let delegate
  let v1
  let v2

  beforeEach(async () => {
    accounts = await ethers.getSigners();

    const V1 = await ethers.getContractFactory("V1");
    v1 = await V1.deploy();

    const V2 = await ethers.getContractFactory("V2");
    v2 = await V2.deploy();

    const Proxy = await ethers.getContractFactory("Proxy")
    proxy = await Proxy.deploy();

  });

  describe("01", () => {
    it("v1", async () => {
      await proxy.setImplementation(v1.address);
      delegate = await v1.attach(proxy.address);
      await delegate.inc();
      expect(await delegate.x()).to.be.eq(1)
    });
    it("upgrade", async () => {
      await proxy.setImplementation(v2.address)
      delegate = await v2.attach(proxy.address)
      await delegate.inc();
      await delegate.inc();
      await delegate.dec();
      expect(await delegate.x()).to.be.eq(1)
    });
    it("storage has proxy contract", async () => {
      await proxy.setImplementation(v1.address);
      delegate = await v1.attach(proxy.address);
      await delegate.inc();

      await proxy.setImplementation(v2.address)
      delegate = await v2.attach(proxy.address)
      await delegate.inc();
      await delegate.inc();
      await delegate.dec();
      expect(await delegate.x()).to.be.eq(2)
    });
  });
});
