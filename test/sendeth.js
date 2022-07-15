const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SendEth", function () {
  it("Should return the new greeting once it's changed", async function () {
    const SendEth = await ethers.getContractFactory("SendEth");
    const se = await SendEth.deploy();
    await se.deployed();

    const EthReceiver = await ethers.getContractFactory("EthReceiver");
    const er = await EthReceiver.deploy();
    await er.deployed();

    const accounts = await ethers.getSigners();
    // console.log(`
    // #######################################
    // #####            Before           #####
    // #######################################
    // `)
    // console.log(`Address: ${accounts[0].address} Balance: ${await accounts[0].getBalance()}`)
    // console.log(`Address: ${accounts[1].address} Balance: ${await accounts[1].getBalance()}`)
    // console.log(`SendEth: ${se.address} Balance: ${await ethers.provider.getBalance(se.address)}`);
    // console.log(`EthReceiver: ${er.address} Balance: ${await ethers.provider.getBalance(er.address)}`);

    // console.log(`
    // #######################################
    // #####           Prepare           #####
    // #######################################
    // `)
    console.log(`send 0.2 ether for account[0] -> account[1]`);
    await accounts[0].sendTransaction({
      to: accounts[1].address,
      value: ethers.utils.parseUnits("0.2"),
    });

    console.log(`send 1.0 ether for account[0] -> sendEthContract`);
    await accounts[0].sendTransaction({
      to: se.address,
      value: ethers.utils.parseUnits("1"),
    });

    console.log(`send 0.5 ether for account[0] -> EthReceiverContract`);
    await accounts[0].sendTransaction({
      to: er.address,
      value: ethers.utils.parseUnits("0.5"),
    });

    // console.log(`
    // #######################################
    // #####            After            #####
    // #######################################
    // `)
    console.log(`Address: ${accounts[0].address} Balance: ${await accounts[0].getBalance()}`)
    console.log(`Address: ${accounts[1].address} Balance: ${await accounts[1].getBalance()}`)
    console.log(`SendEth: ${se.address} Balance: ${await ethers.provider.getBalance(se.address)}`);
    console.log(`EthReceiver: ${er.address} Balance: ${await ethers.provider.getBalance(er.address)}`);

    console.log("send 123 SendEth -> accouont[1]")
    await se.sendViaTransfer(accounts[1].address);

    console.log(`Address: ${accounts[0].address} Balance: ${await accounts[0].getBalance()}`)
    console.log(`Address: ${accounts[1].address} Balance: ${await accounts[1].getBalance()}`)
    console.log(`SendEth: ${se.address} Balance: ${await ethers.provider.getBalance(se.address)}`);
    console.log(`EthReceiver: ${er.address} Balance: ${await ethers.provider.getBalance(er.address)}`);

    console.log("send 123 SendEth -> EthReceiver")
    const tx = await se.sendViaTransfer(er.address);
    const receipt = await tx.wait()
    // console.log(receipt);
    // console.log(receipt.events[0]);

    // const events = receipt.events.map(x => x.event)
    // console.log(events);
    const event = receipt.events.find((x) => x.event === "Transfer");
    console.log(event);

    // console.log(receipt.events[0].topics[0]);
    // const topics = await receipt.events[0].topics();
    // console.log(topics);

    console.log(`Address: ${accounts[0].address} Balance: ${await accounts[0].getBalance()}`)
    console.log(`Address: ${accounts[1].address} Balance: ${await accounts[1].getBalance()}`)
    console.log(`SendEth: ${se.address} Balance: ${await ethers.provider.getBalance(se.address)}`);
    console.log(`EthReceiver: ${er.address} Balance: ${await ethers.provider.getBalance(er.address)}`);
  });
});
