pragma solidity ^0.8.13;

contract Receiver {
    event Received(address caller, uint amount, string message);

    fallback() external payable {
        emit Received(msg.sender, msg.value, "Fallback was called");
    }
    receive() external payable {
        emit Received(msg.sender, msg.value, "Receive was called");
    }

    function foo(string memory _message, uint _x) public payable returns (uint) {
        emit Received(msg.sender, msg.value, _message); // event[3] addr, value, call foo
        return _x + 4;
    }

}

contract Caller {
    event Response(bool success, bytes data);
    event Hoge(uint amount);
    event Fuga(bytes message);
    event Piyo(string message);

    function testCallFoo(address payable _addr) public payable {
        emit Hoge(9); // event[0]
        emit Fuga(bytes("a")); // event[1]
        emit Piyo("b"); // event[2]

        (bool success, bytes memory data) = _addr.call{value: msg.value, gas:5000}(
            abi.encodeWithSignature("foo(string,uint256)", "call foo", 3)
        );
        emit Response(success, data); // event[4] -> true, 7
    }

    function testCallDoesNotExist(address _addr) public {
        (bool success, bytes memory data) = _addr.call(abi.encodeWithSignature("doseNotExist()"));
        emit Response(success, data);
    }
}