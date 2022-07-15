const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("Gas", function () {
  let loopContract;
  let accounts;

  beforeEach(async() => {
    accounts = await ethers.getSigners();

    const LoopContract = await ethers.getContractFactory("Gas");
    loopContract = await LoopContract.deploy();
    await loopContract.deployed();
  })

  // out of gas
  // expect(await contract.forever({gasLimit: 50000})).to.be.reverted;

  // out of gas
  // await contract.loop(100, {gasLimit: 25000})

  it("specific gasLimit01", async() => {
    const gasLimit = 100000;

    const tx = await loopContract.loop(100, {gasLimit: gasLimit})
    const receipt = await tx.wait()
    console.log(tx);
    console.log(receipt);
    console.log(receipt.gasUsed);

    expect(parseInt(receipt.gasUsed)).to.be.lessThanOrEqual(gasLimit);
    expect(await loopContract.i()).to.be.equal(100);
  })
  it("specific gasLimit02", async() => {
    const gasLimit = 100000;

    const tx = await loopContract.loop(99, {gasLimit: gasLimit})
    const receipt = await tx.wait()
    // console.log(tx);
    // console.log(receipt);
    console.log(receipt.gasUsed);

    expect(parseInt(receipt.gasUsed)).to.be.lessThanOrEqual(gasLimit);
    expect(await loopContract.i()).to.be.equal(99);
  })

  it("get num by loop", async() => {
    const result = await loopContract.getNum(10000);
    console.log(result);
    expect(result).to.be.equal(10000);
  })

  it("auto computed gasLimit", async () => {
    const expectLessThanGasLimit = 100000;

    const tx = await loopContract.loop(100);
    const receipt = await tx.wait();

    expect(parseInt(receipt.gasUsed)).to.be.lessThanOrEqual(expectLessThanGasLimit);
    expect(await loopContract.i()).to.be.equal(100);
  });

});
