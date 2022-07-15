pragma solidity ^0.8.13;

contract Payable {
    // Etherを受け取れるアドレス
    address payable public owner;

    constructor() {
        // アドレスをキャストしてpayable addressに返還してEtherを受け取れるアドレスをownerにセット。
        owner = payable(msg.sender);
        // owner = msg.sender; // Type address is not implicitly convertible to expected type address payable.
    }

    // receive() external payable {
    //     deposit();
    // }

    // payable修飾子が入っている関数なのでEtherを受け取れる。
    // signer.sendTransactoin({ to: {{contract_address}} ,value: {{amount}} }) のamount分のEther残高がこれだけで増える。
    function deposit() public payable {}

    // payable修飾子がないので受け取り不可。エラーがスローされる。
    function notPayable() public {}

    function withdraw() public {
        uint amount = address(this).balance;

        // ownerに送金する。
        (bool success, ) = owner.call{value: amount}("");
        require(success, "Failed to send Ether");
    }

    function transfer(address payable _to, uint _amount) public {
        require(msg.sender == owner, "not owner");
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "Faild to send Ether");
    }
}