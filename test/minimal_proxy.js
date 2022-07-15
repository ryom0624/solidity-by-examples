const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("", function () {
  let accounts;
  let target;
  let factory;

  beforeEach(async () => {
    accounts = await ethers.getSigners();

    const Counter = await ethers.getContractFactory("TestCounter");
    target = await Counter.deploy();
    await target.deployed();

    const Factory = await ethers.getContractFactory("TestCounterFactory");
    factory = await Factory.deploy(target.address);
    await factory.deployed();
  });

  describe("01", () => {
    it("test", async () => {
        await factory.createCounter(1);
        await factory.createCounter(10);
        await factory.createCounter(100);

        const contract1 = target.attach(await factory.indexOf(0));
        const contract10 = target.attach(await factory.indexOf(1));
        const contract100 = target.attach(await factory.indexOf(2));

        expect(await contract1.num()).to.be.equal(1);
        expect(await contract10.num()).to.be.equal(10);
        expect(await contract100.num()).to.be.equal(100);

        await contract1.inc();
        await contract1.inc();
        await contract10.inc();
        await contract10.inc();
        await contract100.inc();
        await contract100.inc();

        expect(await contract1.num()).to.be.equal(3);
        expect(await contract10.num()).to.be.equal(30);
        expect(await contract100.num()).to.be.equal(300);
    });
  });

//   describe("02", () => {
//     it("test", async () => {});
//   });

//   describe("03", () => {
//     it("test", async () => {});
//   });
});
