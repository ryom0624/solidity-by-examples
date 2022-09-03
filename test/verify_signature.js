const { expect } = require("chai");
const { ethers } = require("hardhat");

// Ref. https://github.com/t4sk/hello-erc20-permit/blob/main/test/verify-signature.js

describe("VerifySignature", function () {
  let accounts;
  let contract;
  beforeEach(async () => {
    accounts = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("VerifySignature");
    contract = await Contract.deploy();
    await contract.deployed();
  });

  describe("success", () => {
    it("success", async () => {
      const signer = accounts[0]
      const signerAddress = signer.address
      const to = accounts[1].address;
      const amount = ethers.utils.parseUnits("1.3");
      const message = "hello solidity";
      const nonce = 4;

      console.log(`signerAddress: ${signerAddress}`);
      console.log(`to: ${to}`);
      console.log(`amount: ${amount}`);
      console.log(`message: ${message}`);
      console.log(`nonce: ${nonce}`);

      const messageHash = await contract.getMessageHash(to, amount, message, nonce);
      console.log(`MessageHash: ${messageHash}`);

      const signedhash = await signer.signMessage(ethers.utils.arrayify(messageHash));
      console.log(`signedhash by ${signerAddress}:
       ${signedhash}`);

      const ethSignedHash = await contract.getEthSignedMessageHash(messageHash);
      console.log("recoverSigner: ", await contract.recoverSigner(ethSignedHash, signedhash));

      expect(await contract.verify(
        signerAddress,
        to,
        amount,
        message,
        nonce,
        signedhash
      )).to.be.equal(true)
    });
  describe("failed", () => {
    it("failed", async () => {
      const signer = accounts[2];
      const signerAddress = signer.address;
      const to = accounts[1].address;
      const amount = ethers.utils.parseUnits("1.3");
      const message = "hello solidity";
      const nonce = 4;

      console.log(`signerAddress: ${signerAddress}`);
      console.log(`to: ${to}`);
      console.log(`amount: ${amount}`);
      console.log(`message: ${message}`);
      console.log(`nonce: ${nonce}`);

      const messageHash = await contract.getMessageHash(
        to,
        amount,
        message,
        nonce
      );
      console.log(`MessageHash: ${messageHash}`);

      const signedhash = await accounts[0].signMessage(ethers.utils.arrayify(messageHash));
      console.log(`signedhash by ${signerAddress}:
       ${signedhash}`);


      console.log(await contract.splitSignature(signedhash));

      expect(
        await contract.verify(
          signerAddress,
          to,
          amount,
          message,
          nonce,
          signedhash
        )
      ).to.be.equal(false);
    });
  });
    });
});
