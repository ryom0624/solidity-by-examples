const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("ERC20",  function() {
    let accounts;
    let contract;
    const funit = async (amount) => {
        return ethers.utils.parseUnits(String(amount), "ether")
    }

    beforeEach(async() => {
        accounts = await ethers.getSigners();
        const ERC20Contract = await ethers.getContractFactory("MYERC20");
        contract = await ERC20Contract.deploy("solidity by example", "SBE");
        await contract.deployed();

        await contract.mint(await funit(500));
    })

    it("basic infomation", async() => {
        expect(await contract.name()).to.be.equal("solidity by example");
        expect(await contract.symbol()).to.be.equal("SBE");
        expect(await contract.totalSupply()).to.be.equal(await funit(500));
        expect(await contract.balanceOf(accounts[0].address)).to.be.equal(await funit(500));
        expect(await contract.decimals()).to.be.equal(18);

        expect(await contract.balanceOf(accounts[0].address)).to.be.equal(await funit(500));
    })

    it("transfer ERC20", async() => {
        await contract.transfer(accounts[1].address, await funit(10))
        expect(await contract.balanceOf(accounts[0].address)).to.be.equal(await funit(490))
        expect(await contract.balanceOf(accounts[1].address)).to.be.equal(await funit(10))
    })

    it("burn token", async() => {
        await contract.burn(await funit(20));
        expect(await contract.totalSupply()).to.be.equal(await funit(480));
        expect(await contract.balanceOf(accounts[0].address)).to.be.equal(await funit(480))

        await expect(contract.burn(await funit(501))).to.be.reverted;
    })

    it("allowance", async() => {
        await contract.approve(accounts[2].address, await funit(30))
        expect(await contract.allowance(accounts[0].address, accounts[2].address)).to.be.equal(await funit(30));
    })

    it("transferFrom", async() => {
        // allowance[accounts[0]][accounts[2]] = 30
        await contract.approve(accounts[2].address, await funit(30))

        // accounts[0] -> accounts[3]（by accounts[2]）
        await contract
            .connect(accounts[2])
            .transferFrom(accounts[0].address,accounts[3].address,await funit(13))

        expect(await contract.allowance(accounts[0].address, accounts[2].address)).to.be.equal(await funit(17));
        expect(await contract.balanceOf(accounts[0].address)).to.be.equal(await funit(487))
        expect(await contract.balanceOf(accounts[3].address)).to.be.equal(await funit(13))
    })

    it("swap", async() => {
        const ERC20Contract = await ethers.getContractFactory("MYERC20");
        token1 = await ERC20Contract.deploy("token1", "ONE");
        token2 = await ERC20Contract.deploy("token2", "TWO");
        await token1.deployed();
        await token2.deployed();


        await token1.connect(accounts[1]).mint(await funit(1000));
        await token2.connect(accounts[2]).mint(await funit(2000));

        console.log(await token1.totalSupply())
        console.log(await token2.totalSupply())

        console.log(await token1.balanceOf(accounts[1].address))
        console.log(await token2.balanceOf(accounts[2].address))

        const SwapContract = await ethers.getContractFactory("TokenSwap");
        swap = await SwapContract.deploy(
            token1.address,
            accounts[1].address,
            await funit(50),
            token2.address,
            accounts[2].address,
            await funit(100),
        );

        await swap.deployed();


        await token1.connect(accounts[1]).approve(swap.address, await funit(50))
        await token2.connect(accounts[2]).approve(swap.address, await funit(100))

        console.log(await token1.allowance(accounts[1].address, swap.address));
        console.log(await token2.allowance(accounts[2].address, swap.address));

        await swap.connect(accounts[1]).swap()

        expect(await token1.balanceOf(accounts[1].address)).to.be.equal(await funit(950))
        expect(await token2.balanceOf(accounts[1].address)).to.be.equal(await funit(100))

        expect(await token2.balanceOf(accounts[2].address)).to.be.equal(await funit(1900))
        expect(await token1.balanceOf(accounts[2].address)).to.be.equal(await funit(50))

    })

});
