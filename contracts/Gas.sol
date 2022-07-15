pragma solidity ^0.8.13;

contract Gas {
    uint public i = 0;

    function forever() public {
        i = 0;
        while(true) {
            i++;
        }
    }
    function loop(uint _num) public {
        i = 0;
        for(uint _i; _i < _num; _i++) {
            i++;
        }
    }

    function getNum(uint _num) pure public returns(uint) {
        uint _a = 0;
        for(uint _i; _i < _num; _i++) {
            _a++;
        }
        return _a;
     }
}
