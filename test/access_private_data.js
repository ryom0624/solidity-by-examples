const { expect } = require("chai");
const { ethers } = require("hardhat");

const fEther = (amount) => {
  return ethers.utils.formatEther(amount, "ether");
};
const pEther = (amount) => {
  return ethers.utils.parseEther(amount);
};

describe("", function () {
  let accounts;
  let contract;
  let attack;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("Vault");
    contract = await Contract.deploy(ethers.utils.formatBytes32String("password"));
    await contract.deployed();

    await contract.addUser(ethers.utils.formatBytes32String("hoge"));
    await contract.addUser(ethers.utils.formatBytes32String("fuga"));
  });

  describe("01", () => {
    it("test", async () => {
      const outputStorage = (address, slot) => {
        return ethers.provider.getStorageAt(address, slot);
      };

      const hexToAscii = (_hex) => {
        const hex = _hex.toString();
        let str = "";
        for (var i = 0; i < hex.length; i += 2) {
          str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return str;
      };

      const slot0 = await outputStorage(contract.address, 0);
      console.log(slot0); // 0x000000000000000000000000000000000000000000000000000000000000007b

      const slot1 = await outputStorage(contract.address, 1);
      console.log(slot1); // 0x000000000000000000001f01f39fd6e51aad88f6f4ce6ab8827279cfffb92266
      const slot1_addr = slot1.substr(26, 66);
      console.log(slot1_addr); // f39fd6e51aad88f6f4ce6ab8827279cfffb92266
      const slot1_bool = slot1.substr(24, 2);
      console.log(slot1_bool); // 01
      const slot1_uint16 = slot1.substr(22, 2);
      console.log(slot1_uint16); // 1f

      const slot2 = await outputStorage(contract.address, 2);
      console.log(slot2); // 0x70617373776f7264000000000000000000000000000000000000000000000000

      // 動的なデータはslot自体にはlengthが入る。
      // userが2なので2が出る。
      const slot6 = await outputStorage(contract.address, 6);
      console.log(slot6); // 0x0000000000000000000000000000000000000000000000000000000000000002

      // データ自体はkeccak256(slot)に格納
      const location = ethers.utils.solidityKeccak256(["uint"], ["6"]);
      // 0xf652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d3f から始まる
      // 末尾を増やしていけばアクセスできる。
      // 3f(user1 id) -> 40(user1 pass) -> 41(user2 id) -> 42(user2 pass)...
      console.log("start slot: ", location);

      const user1LocationId = await contract.getArrayLocation(6, 0, 1); // 0
      // console.log(user1LocationId.toHexString()); // 0xf652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d3f
      const user1LocationPass = await contract.getArrayLocation(6, 1, 1); // 1
      // console.log(user1LocationPass.toHexString()); // 0xf652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d40

      const user2LocationId = await contract.getArrayLocation(6, 2, 1); // 2
      // console.log(user2LocationId.toHexString()); // 0xf652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d41
      const user2LocationPass = await contract.getArrayLocation(6, 3, 1); // 3
      // console.log(user2LocationPass.toHexString()); // 0xf652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d42

      const slot6_user1_id = await outputStorage(
        contract.address,
        user1LocationId.toHexString()
      );
      console.log(slot6_user1_id);
      const slot6_user1_pass = await outputStorage(
        contract.address,
        user1LocationPass.toHexString()
      );
      console.log(slot6_user1_pass);
      console.log(ethers.utils.parseBytes32String(slot6_user1_pass));

      const slot6_user2_id = await outputStorage(
        contract.address,
        user2LocationId.toHexString()
      );
      console.log(slot6_user2_id);
      const slot6_user2_pass = await outputStorage(
        contract.address,
        user2LocationPass.toHexString()
      );
      console.log(slot6_user2_pass);
      console.log(ethers.utils.parseBytes32String(slot6_user2_pass));

      // console.log(await outputStorage(
      //   contract.address,
      //   "0xf652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d3f"
      // ));
      // console.log(ethers.utils.parseBytes32String((await outputStorage(
      //   contract.address,
      //   "0xf652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d40"
      // ))));
      // console.log(await outputStorage(
      //   contract.address,
      //   "0xf652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d41"
      // ));
      // console.log(ethers.utils.parseBytes32String((await outputStorage(
      //   contract.address,
      //   "0xf652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d42"
      // ))));

      expect(parseInt(slot0)).to.be.equal(123);
      expect("0x" + slot1_addr).to.be.equal(accounts[0].address.toLowerCase());
      expect(parseInt(slot1_bool)).to.be.equal(1);
      expect(parseInt(slot1_uint16, 16)).to.be.equal(31);
      expect(ethers.utils.parseBytes32String(slot2)).to.be.equal("password");
      expect(parseInt(slot6, 16)).to.be.equal(2);
      expect(ethers.utils.parseBytes32String(slot6_user1_pass)).to.be.equal(
        "hoge"
      );
      expect(ethers.utils.parseBytes32String(slot6_user2_pass)).to.be.equal(
        "fuga"
      );

      // await outputStorage(contract.address, 7)
      // await outputStorage(contract.address, 8)

      // await contract.getArrayLocation(6, 0, 2);
    });

    it("user3", async () => {
      const outputStorage = (address, slot) => {
        return ethers.provider.getStorageAt(address, slot);
      };

      await contract.addUser(ethers.utils.formatBytes32String("piyo"));
      await contract.addUser(ethers.utils.formatBytes32String("hogepiyo"));

      console.log(ethers.utils.parseBytes32String((await outputStorage(
        contract.address,
        "0xf652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d44"
      ))));

      const user3LocationId = await contract.getArrayLocation(6, 4, 1); // 3
      console.log(user3LocationId.toHexString()); // 0xf652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d43
      const user3LocationPass = await contract.getArrayLocation(6, 5, 1); // 4
      console.log(user3LocationPass.toHexString()); // 0xf652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d44

      const slot6_user3_id = await outputStorage(
        contract.address,
        user3LocationId.toHexString()
      );
      console.log(slot6_user3_id);

      const slot6_user3_pass = await outputStorage(
        contract.address,
        user3LocationPass.toHexString()
      );
      console.log(slot6_user3_pass);
      console.log(ethers.utils.parseBytes32String(slot6_user3_pass));


      const user4LocationId = await contract.getArrayLocation(6, 6, 1); // 3
      console.log(user4LocationId.toHexString()); // 0xf652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d45
      const user4LocationPass = await contract.getArrayLocation(6, 7, 1); // 4
      console.log(user4LocationPass.toHexString()); // 0xf652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d46

      const slot6_user4_id = await outputStorage(
        contract.address,
        user4LocationId.toHexString()
      );
      console.log(slot6_user4_id);

      const slot6_user4_pass = await outputStorage(
        contract.address,
        user4LocationPass.toHexString()
      );
      console.log(slot6_user4_pass);
      console.log(ethers.utils.parseBytes32String(slot6_user4_pass));
    });

    it("private string slot 8 - 11" , async () => {
      const outputStorage = (address, slot) => {
        return ethers.provider.getStorageAt(address, slot);
      };

      // expect(parseInt(await outputStorage(contract.address, 8))).to.be.equal(4);
      const slot8 = await outputStorage(contract.address, 8);

      // 最後尾はlength
      // 動的な長さなので余りがあれば先頭に入る。
      console.log(slot8); // 0x686f676500000000000000000000000000000000000000000000000000000008
      const hexToAscii = (_hex) => {
        const hex = _hex.toString();
        let str = "";
        for (var i = 0; i < hex.length; i += 2) {
          str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return str;
      };

      // 0x686f676500000000000000000000000000000000000000000000000000000008
      expect(hexToAscii("686f6765")).to.be.equal("hoge");

      // slot9 に 文字列 + length が 32byte以内 なのですべてslot9に格納
      // 0x616161616161616161616161616161616161616161616161616161616161613e
      const slot9 = await outputStorage(contract.address, 9);
      console.log(slot9);

      // slot10 に 文字列 + length が 32byte以上 なのですべてslot10は
      // 0x0000000000000000000000000000000000000000000000000000000000000041
      // keccak256(10) -> 0xc65a7bb8d6351c1cf70c95a316cc6a92839c986682d98bc35f958f4883f9d2a8 に文字列を格納する
      // 0x6161616161616161616161616161616161616161616161616161616161616161
      const slot10 = await outputStorage(contract.address, 10);
      console.log(slot10);
      const location = ethers.utils.solidityKeccak256(["uint"], ["10"]);
      console.log(location);
      const slot10Value = await outputStorage(contract.address, location);
      console.log(slot10Value);

      // slot11 に 文字列 + length が 32byte以上 なのですべてslot11は
      // 0x0000000000000000000000000000000000000000000000000000000000000042
      // keccak256(11) -> 0x0175b7a638427703f0dbe7bb9bbf987a2551717b34e79f33b5b1008d1fa01db9 に文字列を格納する
      // 0x6161616161616161616161616161616161616161616161616161616161616161
      // 更にslot(keccak256) でも足りないので slot(keccak256)に1を足したstorageを参照
      // 0x0175b7a638427703f0dbe7bb9bbf987a2551717b34e79f33b5b1008d1fa01dba を参照すると
      // 余りの"a"が格納されている。
      // 0x6100000000000000000000000000000000000000000000000000000000000000
      const slot11location = ethers.utils.solidityKeccak256(["uint"], ["11"]);
      console.log(slot11location); //0x0175b7a638427703f0dbe7bb9bbf987a2551717b34e79f33b5b1008d1fa01db9

      const slot11Value = await outputStorage(contract.address, slot11location);
      console.log(slot11Value);
      const slot11Value2 = await outputStorage(
        contract.address,
        "0x0175b7a638427703f0dbe7bb9bbf987a2551717b34e79f33b5b1008d1fa01dba"
      );
      console.log(slot11Value2);
    })
  });
});
