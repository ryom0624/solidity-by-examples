const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Payable", function () {
  it("test", async function () {
    const accounts = await ethers.getSigners();
    const Payable = await ethers.getContractFactory("Payable");
    const contract = await Payable.deploy();
    await contract.deployed();
    let amount;


    amount = ethers.utils.parseUnits("50")

    // コントラクトに receive キーワードがあればrevertされない。
    // await accounts[0].sendTransaction({to: contract.address, value: amount});
    await expect(accounts[0].sendTransaction({to: contract.address, value: amount})).to.be.reverted;
    // console.log(await ethers.provider.getBalance(contract.address));

    // account[0] -> contract
    await contract.deposit({value: amount});
    expect(await ethers.provider.getBalance(contract.address)).to.be.equal(amount);

    // notPayableはリバートされる
    await expect(contract.notPayable({value: amount})).to.be.reverted;

    // contract -> owner(accounts[0])
    await contract.withdraw();
    expect(await ethers.provider.getBalance(contract.address)).to.be.equal(0);


    // transfer関数実行のために再度contractにEtherを預ける。
    await contract.deposit({ value: amount });

    // ownerがSignerとしてcontract -> accounts[1]に送金
    // accounts[1]は元からEtherを持っているので残高を取得
    const currentBalance = await ethers.provider.getBalance(accounts[1].address);
    amount = ethers.utils.parseUnits("8");
    await contract.transfer(accounts[1].address, amount);
    expect(await ethers.provider.getBalance(contract.address)).to.be.equal(ethers.utils.parseUnits("42"));
    expect(await ethers.provider.getBalance(accounts[1].address)).to.be.equal(currentBalance.add(amount));

    // ownerでないアカウントがtransferで自分に送金をしようとすると失敗
    await expect(contract.connect(accounts[1].address).transfer(accounts[1].address, amount)).to.be.reverted;

  });
});
