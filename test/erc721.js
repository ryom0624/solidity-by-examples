const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("ERC721",  function() {
    let accounts;
    let contract;

    beforeEach(async() => {
        accounts = await ethers.getSigners();
        const ERC721Contract = await ethers.getContractFactory("MYERC721");
        contract = await ERC721Contract.deploy();
        await contract.deployed();

        await contract.mint(accounts[0].address, 0);
        await contract.mint(accounts[0].address, 1);
        await contract.mint(accounts[1].address, 2);
        await contract.mint(accounts[2].address, 3);
        await contract.mint(accounts[0].address, 4);
        await contract.mint(accounts[0].address, 5);
    })

    it("mint -> ownerOf balanceOf", async() => {
        expect(await contract.balanceOf(accounts[0].address)).to.be.equal(4);
        expect(await contract.ownerOf(0)).to.be.equal(accounts[0].address);
        expect(await contract.ownerOf(1)).to.be.equal(accounts[0].address);
        expect(await contract.ownerOf(4)).to.be.equal(accounts[0].address);
        expect(await contract.ownerOf(5)).to.be.equal(accounts[0].address);

        expect(await contract.balanceOf(accounts[1].address)).to.be.equal(1);
        expect(await contract.ownerOf(2)).to.be.equal(accounts[1].address);

        expect(await contract.balanceOf(accounts[2].address)).to.be.equal(1);
        expect(await contract.ownerOf(3)).to.be.equal(accounts[2].address);
    })

    it("mint but already exists", async() => {
        await expect(contract.mint(accounts[0].address, 0)).to.be.reverted;
    })

    it("burn", async() => {
        await contract.mint(accounts[4].address, 6)
        // console.log(await contract.ownerOf(6))
        await contract.connect(accounts[4]).burn(6)

        expect(await contract.balanceOf(accounts[4].address)).to.be.equal(0)
        await expect(contract.ownerOf(6)).to.be.reverted;
    })

    it("owner can transfer for someone", async() => {
        expect(await contract.ownerOf(0)).to.be.equal(accounts[0].address)
        await contract.transferFrom(accounts[0].address, accounts[4].address, 0)
        expect(await contract.ownerOf(0)).to.be.equal(accounts[4].address)
        expect(await contract.ownerOf(0)).to.be.not.equal(accounts[0].address)
    })

    it("not owner cannot transfer for someone", async() => {
        expect(await contract.ownerOf(0)).to.be.equal(accounts[0].address)
        await expect(contract.transferFrom(accounts[1].address, accounts[4].address, 0)).to.be.reverted;
    })

    it("not owner cannot transfer for someone a token but can transfer after approving by approved function", async() => {
        expect(await contract.ownerOf(2)).to.be.equal(accounts[1].address)
        await expect(contract.transferFrom(accounts[1].address, accounts[4].address, 2)).to.be.reverted;

        // operator is accounts[2]
        await contract.connect(accounts[1]).approve(accounts[2].address, 2)
        expect(await contract.getApproved(2)).to.be.equal(accounts[2].address);

        await contract.connect(accounts[2]).transferFrom(accounts[1].address, accounts[4].address, 2)
        expect(await contract.ownerOf(2)).to.be.equal(accounts[4].address);
    })

    it("not owner cannot transfer for someone all token but can transfer after approving by setApprovedForAll function", async() => {
        const owner = accounts[1];
        const operator = accounts[2];
        const notOperator = accounts[3]
        const reveiver = accounts[4];

        // accounts[1] is owner of 2,6,7,8
        await contract.mint(owner.address, 6);
        await contract.mint(owner.address, 7);
        await contract.mint(owner.address, 8);

        // failed to transfer
        await expect(contract.transferFrom(notOperator.address,reveiver.address, 2)).to.be.reverted;
        await expect(contract.transferFrom(notOperator.address,reveiver.address, 6)).to.be.reverted;
        await expect(contract.transferFrom(notOperator.address,reveiver.address, 7)).to.be.reverted;
        await expect(contract.transferFrom(notOperator.address,reveiver.address, 8)).to.be.reverted;

        // operator is accounts[2]
        await contract.connect(owner).setApprovalForAll(operator.address, true)
        expect(await contract.isApprovedForAll(owner.address, operator.address)).to.be.equal(true);

        // transfer 2,6,7 by accounts[2] who is operator
        await contract.connect(operator).transferFrom(owner.address, reveiver.address, 2)
        await contract.connect(operator).transferFrom(owner.address, reveiver.address, 6)
        await contract.connect(operator).transferFrom(owner.address, reveiver.address, 7)

        expect(await contract.ownerOf(2)).to.be.equal(reveiver.address);
        expect(await contract.ownerOf(6)).to.be.equal(reveiver.address);
        expect(await contract.ownerOf(7)).to.be.equal(reveiver.address);

        expect(await contract.ownerOf(8)).to.be.equal(owner.address);
    })
});
