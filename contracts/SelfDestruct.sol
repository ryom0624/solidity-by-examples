pragma solidity ^0.8.13;

/*
    selfdestructを使うとコントラクトを削除できる
    コントラクトにあるEtherを指定したアドレスに送金する。

    address(this).balanceを使うことで
    deposit以外から送られてくる資金量も換算してwinnerが決まってしまう。
    （ただし、winner addressはselfdestructで破壊されている。）

    → 攻撃コントラクトがselfdestrucを発火させて、
    攻撃コントラクトが削除されると同時にEtherGameコントラクトに強制的に送金をする。

    対策:
        address(this).balance ではなく、ゲーム内のbalance変数を作成してそこで管理する。
        → Ether自体はContract内に蓄積されるが強制的な送金がゲームに影響なくなり、ゲーム自体が破壊されることはない。
*/


import "hardhat/console.sol";

contract EtherGame {
    /*
        1回につき1Ether送金できる。
        7Ether貯まったら全てもらえる。
    */

    uint public targetAmount = 7 ether;
    address public winner;


    function deposit() public payable {
        require(msg.value == 1 ether, "You can only send 1 ether");

        uint balance = address(this).balance;
        require(balance <= targetAmount, "Game is over");

        if (balance == targetAmount) {
            winner = msg.sender;
        }
    }

    function claimReward() public {
        require(msg.sender == winner, "not winner");

        (bool sent, ) = msg.sender.call{value: address(this).balance}("");
        require(sent, "failed to sent ether");
    }
}

contract EtherGameAttacker {
    EtherGame etherGame;

    constructor(address _ethergame) {
        etherGame = EtherGame(_ethergame);
    }

    function attack() public payable {
        address payable addr = payable(address(etherGame));
        console.log(addr);
        console.log(address(this).balance);

        // send ether to EtherGame and delete contract
        selfdestruct(addr);
    }
}


contract SafeEthergame {

    uint public targetAmount = 7 ether;
    address public winner;
    uint public balance;


    function deposit() public payable {
        require(msg.value == 1 ether, "You can only send 1 ether");

        require(balance <= targetAmount, "Game is over");

        balance += msg.value;

        if (balance == targetAmount) {
            winner = msg.sender;
        }
    }

    function claimReward() public {
        require(msg.sender == winner, "not winner");

        (bool sent, ) = msg.sender.call{value: balance}("");
        require(sent, "failed to sent ether");
    }
}