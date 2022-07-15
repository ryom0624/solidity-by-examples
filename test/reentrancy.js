const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Re-Entrancy", function () {

  describe("attack to vulnerable contract", () => {
    let accounts;
    let vulnerable;
    let attack;

    beforeEach(async () => {
      accounts = await ethers.getSigners();
      const Contract = await ethers.getContractFactory("vulnerableEtherStore");
      vulnerable = await Contract.deploy();
      await vulnerable.deployed();

      const Attack = await ethers.getContractFactory("Attack");
      attack = await Attack.deploy(vulnerable.address);
      await attack.deployed();

      console.log(
        `etherStore contract has: ${await ethers.provider.getBalance(
          vulnerable.address
        )}`
      );
    });


    it("attack", async () => {
      await vulnerable.connect(accounts[1]).deposit({
        value: ethers.utils.parseEther("135.0"),
        // 136になると失敗しだす。
      });
      await vulnerable.connect(accounts[2]).deposit({
        value: ethers.utils.parseEther("10.0"),
      });

      const attacker = accounts[3]

      await attack.connect(attacker).attack({
        value: ethers.utils.parseEther("1.0"),
      });

      const balance = await ethers.provider.getBalance(attack.address)
      const fbalance = ethers.utils.formatEther(balance, "ether")

      console.log(`attack contract get ${fbalance} ether`);

      expect(balance).to.be.gt(0);
    });
  });


  describe("attack to secure contract", () => {
    let accounts;
    let secure;
    let attack;

    beforeEach(async () => {
      accounts = await ethers.getSigners();
      const Contract = await ethers.getContractFactory("secureEtherStore");
      secure = await Contract.deploy();
      await secure.deployed();

      const Attack = await ethers.getContractFactory("Attack");
      attack = await Attack.deploy(secure.address);
      await attack.deployed();

      console.log(
        `etherStore contract has: ${await ethers.provider.getBalance(
          secure.address
        )}`
      );
    });


    it("attack but failed and reverted because etherStore is secure", async () => {
      await secure.connect(accounts[1]).deposit({
        value: ethers.utils.parseEther("135.0"),
      });
      await secure.connect(accounts[2]).deposit({
        value: ethers.utils.parseEther("10.0"),
      });

      const attacker = accounts[3]

      await expect(
        attack.connect(attacker).attack({
          value: ethers.utils.parseEther("1.0"),
        })
      ).to.be.revertedWith("failed to send Ether");
    });
  });
});
