pragma solidity ^0.8.13;

interface IERC20 {
    // tokenの総供給量
    function totalSupply() external view returns(uint);
    // accountのtoken保有量
    function balanceOf(address account) external view returns(uint);
    // recipientにamountのtoken送付
    function transfer(address recipient, uint amount) external returns(bool);
    // ownerからspenderへの権限付与
    function allowance(address owner, address spender) external view returns (uint);
    // spenderに対してamount分の送金権限付与
    function approve(address spender, uint amount) external returns (bool);
    // 送金権限付与されたsenderからrecipientに対してamount分のtokenを送付
    function transferFrom(address sender, address recipient, uint amount) external returns(bool);

}

contract MYERC20 is IERC20 {
    uint public totalSupply;
    mapping(address => uint) public balanceOf;
    mapping(address => mapping(address => uint)) public allowance;
    string public name;
    string public symbol;
    uint8 public decimals = 18;

    uint public count;

    event Transfer(address indexed from, address indexed to, uint value);
    event Approval(address indexed owner, address indexed spender, uint value);

    constructor (string memory _name, string memory _symbol) public {
        name = _name;
        symbol = _symbol;
    }

    function transfer(address recipient, uint amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "insufficient amount");
        balanceOf[msg.sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    function approve(address spender, uint amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }


    function transferFrom(address sender, address recipient, uint amount) public returns (bool) {
        require(allowance[sender][msg.sender] >= amount, "insufficient allowance amount");
        require(balanceOf[sender] >= amount, "insufficient balance");
        allowance[sender][msg.sender] -= amount;
        balanceOf[sender] -= amount;
        balanceOf[recipient] += amount;

        emit Transfer(msg.sender, recipient, amount);

        return true;
    }

    function mint(uint amount) external {
        totalSupply += amount;
        balanceOf[msg.sender] += amount;
        emit Transfer(address(0), msg.sender, amount);
    }

    function burn(uint amount) external {
        require(totalSupply > amount, "totalSupply < amount");
        totalSupply -= amount;
        balanceOf[msg.sender] -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }
}


/*
How to swap tokens
    1. Alice has 100 tokens from AliceCoin, which is a ERC20 token.
    2. Bob has 100 tokens from BobCoin, which is also a ERC20 token.
    3. Alice and Bob wants to trade 10 AliceCoin for 20 BobCoin.
    4. Alice or Bob deploys TokenSwap
    5. Alice approves TokenSwap to withdraw 10 tokens from AliceCoin
    6. Bob approves TokenSwap to withdraw 20 tokens from BobCoin
    7. Alice or Bob calls TokenSwap.swap()
    8. Alice and Bob traded tokens successfully.
*/
contract TokenSwap {
    IERC20 public token1;
    address public owner1;
    uint public amount1;
    IERC20 public token2;
    address public owner2;
    uint public amount2;

    constructor(
        address _token1,
        address _owner1,
        uint _amount1,
        address _token2,
        address _owner2,
        uint _amount2
    ) {
        token1 = IERC20(_token1);
        owner1 = _owner1;
        amount1 = _amount1;

        token2 = IERC20(_token2);
        owner2 = _owner2;
        amount2 = _amount2;
    }


    function swap() public {
        require(msg.sender == owner1 || msg.sender == owner2, "Not Authorized");
        require(token1.allowance(owner1, address(this)) >= amount1, "Token 1 allowance too low");
        require(token2.allowance(owner2, address(this)) >= amount2, "Token 2 allowance too low");

        _safeTransferFrom(token1, owner1, owner2, amount1);
        _safeTransferFrom(token2, owner2, owner1, amount2);
    }

    function _safeTransferFrom(IERC20 token, address sender, address recipient, uint amount) private {
        bool sent  = token.transferFrom(sender, recipient, amount);
        require(sent, "Transaction failed");
    }

}
