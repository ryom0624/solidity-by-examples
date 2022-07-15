const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("Call", function () {
  it("test", async function () {
    const accounts = await ethers.getSigners();
    const Receiver = await ethers.getContractFactory("Receiver");
    const ReceiverContract = await Receiver.deploy();
    await ReceiverContract.deployed();

    const Caller = await ethers.getContractFactory("Caller");
    const contract = await Caller.deploy();
    await contract.deployed();

    //  event Response(bool success, bytes data); 引数がbyteなのでencodeして渡す必要がある。
    const encodedEventResponseArgInt = await ethers.utils.defaultAbiCoder.encode(["uint"], [7]);
    console.log(encodedEventResponseArgInt)
    await expect(contract.testCallFoo(ReceiverContract.address, {value: ethers.utils.parseUnits("10")}))
      .to.emit(contract, "Response").withArgs(true, encodedEventResponseArgInt);

    const amount = await ethers.utils.parseUnits("11");
    //  event Received(address caller, uint amount, string message); はencodeの必要なし。
    // const encodedEventReceivedArgString = await ethers.utils.defaultAbiCoder.encode(["string"], ["call hoge"]);
    // console.log(encodedEventReceivedArgString);
    await expect(contract.testCallFoo(ReceiverContract.address, { value: amount }))
      .to.emit(ReceiverContract, "Received").withArgs(contract.address, amount, "call foo");


    // /* transaction debugging */

    // const encoded0 = await ethers.utils.defaultAbiCoder.encode(["uint"], [1234]);
    // console.log(encoded0)
    // console.log(await ethers.utils.defaultAbiCoder.decode(["uint"], encoded0));

    // const encoded1 = await ethers.utils.defaultAbiCoder.encode(["string", "uint"], ["Hello world", 122]);
    // console.log(encoded1)
    // console.log(await ethers.utils.defaultAbiCoder.decode(["string", "uint"], encoded1));

    // const tx = await contract.testCallFoo(ReceiverContract.address, {
    //   value: ethers.utils.parseUnits("10"),
    // });
    // const receipt = await tx.wait();

    // console.log(receipt);
    // receipt.logs.forEach((log, i) => {
    //   console.log(i, ":", log.data);
    // })
    // console.log(receipt);
    // console.log(receipt.events[4].data);
    // console.log(typeof receipt.events[4].data);
    // console.log(await ethers.utils.defaultAbiCoder.decode(["bool", "uint"], receipt.events[4].data));
    // // [ true, BigNumber { value: "64" } ]

    // function hex2a(hexx) {
    //   var hex = hexx.toString(); //force conversion
    //   var str = "";
    //   for (var i = 0; i < hex.length; i += 2)
    //     str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    //   return str;
    // }
    // // console.log(hex2a(await ethers.utils.defaultAbiCoder.decode(["bytes"], receipt.events[1].data)));
    // // console.log(await ethers.utils.defaultAbiCoder.decode(["string"], receipt.events[2].data));
    // // console.log(receipt.logs[1].topics);

    // let data;
    // let topics;
    // let event;

    // console.log("1st log");
    // const interface01 = new ethers.utils.Interface([
    //   "event Received(address caller, uint amount, string message)",
    // ]);
    // data = receipt.logs[3].data;
    // topics = receipt.logs[3].topics;
    // event = interface01.decodeEventLog("Received", data, topics);
    // console.log(event);
    // /*
    // [
    //   '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    //   BigNumber { value: "10000000000000000000" },
    //   'call foo',
    //   caller: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    //   amount: BigNumber { value: "10000000000000000000" },
    //   message: 'call foo'
    // ]
    // */

    // // console.log(await ethers.utils.defaultAbiCoder.decode(["uint"], receipt.logs[3].data));

    // console.log("2nd log");
    // data = receipt.logs[4].data;
    // topics = receipt.logs[4].topics;
    // const interface02 = new ethers.utils.Interface([
    //   "event Response(bool success, bytes data)",
    // ]);
    // event = interface02.decodeEventLog("Response", data, topics);
    // console.log(event);
    // /*
    //   [
    //     true,
    //     '0x0000000000000000000000000000000000000000000000000000000000000081',
    //     success: true,
    //     data: '0x0000000000000000000000000000000000000000000000000000000000000081'
    //   ]
    // */

    // console.log(await ethers.utils.defaultAbiCoder.decode(["string"], receipt.logs[4].data));

    // expect(
    //   await contract.testCallDoesNotExist(ReceiverContract.address, { value: ethers.utils.parseUnits("10") })
    // ).to.emit(contract, "Response").withArgs(true, "call foo");

    // https://ethereum.stackexchange.com/questions/110762/testing-arguments-of-contract-events-with-hardhat-chai
    // const tx = await tokenInstance.connect(<signer-account>).transfer(<addr-of-receipent>, <amount-BigNumber>);
    // const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
    // const interface = new ethers.utils.Interface(["event Transfer(address indexed from, address indexed to, uint256 amount)"]);
    // const data = receipt.logs[0].data;
    // const topics = receipt.logs[0].topics;
    // const event = interface.decodeEventLog("Transfer", data, topics);
    // expect(event.from).to.equal(<addr-of-signer-account>);
    // expect(event.to).to.equal(<addr-of-receipent>);
    // expect(event.amount.toString()).to.equal(<amount-BigNumber>.toString());
  });
});
