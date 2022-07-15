pragma solidity ^0.8.13;

contract SingleNumRegister {
    uint public storedData;

    function set(uint _x) public{
        storedData = _x;
    }

    function get() public view returns (uint){
        return storedData;
    }
}