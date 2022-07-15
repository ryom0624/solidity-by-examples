pragma solidity ^0.8.3;

contract SendEth {
    event Transfer(uint256 amount, address to);

    constructor() payable {}
    receive() external payable {}

    function sendViaTransfer(address payable _to) public payable {
        _to.transfer(123);
        emit Transfer(123, _to);
    }
    function sendViaSend(address payable _to) public payable {
        bool sent = _to.send(123);
        require(sent, "send failed");
    }
    function sendViaCall(address payable _to) public payable {
        (bool success, bytes memory data) = _to.call{value: 123}("");
        require(success, "call failed");
    }
}


contract EthReceiver {
    event Log(uint amount, uint gas);

    receive() external payable {
        emit Log(msg.value, gasleft());
    }
}
