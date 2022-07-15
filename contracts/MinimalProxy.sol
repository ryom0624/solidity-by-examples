pragma solidity ^0.8.13;


// origin: https://github.com/optionality/clone-factory/blob/master/contracts/CloneFactory.sol
contract MinimalProxy {

    // implementationで指定したコントラクトのコピーを作成。
    function createClone(address target) internal returns (address result) {
        bytes20 targetBytes = bytes20(target);
        // actual code //
        // 3d602d80600a3d3981f3363d3d373d3d3d363d73bebebebebebebebebebebebebebebebebebebebe5af43d82803e903d91602b57fd5bf3

        // creation code //
        // copy runtime code into memory and return it
        // 3d602d80600a3d3981f3

        // runtime code //
        // code to delegatecall to address
        // 363d3d373d3d3d363d73 address 5af43d82803e903d91602b57fd5bf3

        // inline assembly
        // ・コンパイラの制約を無視
        // ・ガス代の節約
        assembly {
            /*
            reads the 32 bytes of memory starting at pointer stored in 0x40

            In solidity, the 0x40 slot in memory is special: it contains the "free memory pointer"
            which points to the end of the currently allocated memory.
            */
            // 0x40のポインタから32バイトのメモリを読み出す。
            // 32byteを1スロットとしている。
            // 0x40はfree memory pointerで、自由に使えるメモリポインタを格納している。
            // https://solidity-jp.readthedocs.io/ja/latest/assembly.html#conventions-in-solidity
            let clone := mload(0x40)

            // store 32 bytes to memory starting at "clone"
            mstore(clone, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)

            // clone + 20番目のアドレスにimplを格納。
            /*
              |              20 bytes                |
            0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000
                                                      ^
                                                      pointer
            */
            mstore(add(clone, 0x14), targetBytes)
            /*
              |               20 bytes               |                 20 bytes              |
            0x3d602d80600a3d3981f3363d3d373d3d3d363d73bebebebebebebebebebebebebebebebebebebebe
                                                                                              ^
                                                                                              pointer
            */
            // store 32 bytes to memory starting at "clone" + 40 bytes
            // 0x28 = 40
            mstore(add(clone, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
            /*
              |               20 bytes               |                 20 bytes              |           15 bytes          |
            0x3d602d80600a3d3981f3363d3d373d3d3d363d73bebebebebebebebebebebebebebebebebebebebe5af43d82803e903d91602b57fd5bf3
            */
            // create new contract
            // send 0 Ether
            // code starts at pointer stored in "clone"
            // code size 0x37 (55 bytes)
            result := create(0, clone, 0x37)
        }
    }

    function isClone(address target, address query) internal view returns (bool result) {
        bytes20 targetBytes = bytes20(target);
        assembly {
            let clone := mload(0x40)
            mstore(clone, 0x363d3d373d3d3d363d7300000000000000000000000000000000000000000000)
            mstore(add(clone, 0xa), targetBytes)
            mstore(add(clone, 0x1e), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)

            let other := add(clone, 0x40)
            extcodecopy(query, other, 0, 0x2d)
            result := and(
                eq(mload(clone), mload(other)),
                eq(mload(add(clone, 0xd)), mload(add(other, 0xd)))
            )
        }
    }
}

contract TestCounter {
    uint public num;
    uint public rate;
    bool private _initialized;

    function initialize(uint _start) public {
        require(!_initialized, "already intialized");
        num = _start;
        rate = _start;
        _initialized = true;
    }
    function inc() public {
        num += rate;
    }
}

contract TestCounterFactory is MinimalProxy {
    address public baseContractAddress;
    address[] public counters;

    constructor(address _baseContractAddress) {
        baseContractAddress = _baseContractAddress;
    }

    function createCounter(uint _start) public {
        address clone = createClone(baseContractAddress);
        TestCounter(clone).initialize(_start);
        counters.push(clone);
    }

    function indexOf(uint id) public view returns(address) {
        return counters[id];
    }
}
