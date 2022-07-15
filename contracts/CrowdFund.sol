pragma solidity ^0.8.13;

/*
Crowd fund ERC20 token

1. User creates a campaign.
2. Users can pledge, transferring their token to a campaign.
3. After the campaign ends, campaign creator can claim the funds if total amount pledged is more than the campaign goal.
4. Otherwise, campaign did not reach it's goal, users can withdraw their pledge.
*/

interface IERC20 {
    function transfer(address, uint) external returns (bool);

    function transferFrom(
        address,
        address,
        uint
    ) external returns (bool);
}


contract CrowdFund {
    event Launch(
        uint id,
        address indexed creator,
        uint goal,
        uint32 startAt,
        uint32 endAt
    );
    event Cancel(uint id);
    event Pledge(uint indexed id, address indexed caller, uint amount);
    event Unpledge(uint indexed id, address indexed caller, uint amount);
    event Claim(uint id);
    event Refund(uint indexed id, address indexed caller, uint amount);

    struct Campaign {
        address creator;
        uint goal;
        uint pledged; // 誓約額
        uint32 startAt;
        uint32 endAt;
        bool claimed; // ゴール到達してクリエイターがクレームしたらtrue
    }

    IERC20 public immutable token;
    uint public count;

    // campaign_id => campaign
    mapping(uint => Campaign) public campaigns;

    // campaign_id => pledger => amount
    mapping(uint => mapping(address => uint)) public pledgedAmount;


    constructor(address _token) {
        token = IERC20(_token);
    }

    function launch(
        uint _goal,
        uint32 _startAt,
        uint32 _endAt
    ) external {
        require(_startAt >= block.timestamp, "start at < now");
        require(_endAt >= _startAt, "end at < now");
        require(_startAt <= block.timestamp + 90 days, "end at > max duration");

        count++;
        campaigns[count] = Campaign({
            creator: msg.sender,
            goal: _goal,
            pledged: 0,
            startAt: _startAt,
            endAt: _endAt,
            claimed: false
        });
        emit Launch(count, msg.sender, _goal, _startAt, _endAt);
    }

    function cancel(uint _id) external {
        Campaign memory campaign = campaigns[_id];
        require(campaign.creator == msg.sender, "not creator");
        require(block.timestamp < campaign.startAt, "started");
        delete campaigns[_id];
        emit Cancel(_id);
    }


    function pledge(uint _id, uint _amount) external {
        Campaign memory campaign = campaigns[_id];
        require(block.timestamp >= campaign.startAt, "not started");
        require(block.timestamp <= campaign.endAt, "ended");

        campaign.pledged += _amount;
        pledgedAmount[_id][msg.sender] += _amount;
        token.transferFrom(msg.sender, address(this), _amount);

        emit Pledge(_id, msg.sender, _amount);
    }

    function unpledge(uint _id, uint _amount) external {
        Campaign memory campaign = campaigns[_id];
        require(block.timestamp >= campaign.startAt, "not started");
        require(block.timestamp <= campaign.endAt, "ended");
        require(pledgedAmount[_id][msg.sender] >= _amount, "insufficient");

        campaign.pledged -= _amount;
        pledgedAmount[_id][msg.sender] -= _amount;
        token.transferFrom(address(this), msg.sender, _amount);

        emit Unpledge(_id, msg.sender, _amount);
    }

    function claim(uint _id) external {
        Campaign memory campaign = campaigns[_id];
        require(campaign.creator >= msg.sender, "not creator");
        require(block.timestamp >= campaign.endAt, "not ended");
        require(campaign.goal >= campaign.pledged, "not reachs goal");
        require(!campaign.claimed, "already claimed");

        campaign.claimed = true;
        token.transfer(campaign.creator, campaign.goal);
        emit Claim(_id);
    }

    function refund(uint _id) external {
        Campaign memory campaign = campaigns[_id];
        require(block.timestamp > campaign.endAt, "not ended");
        require(campaign.pledged < campaign.goal, "pledged >= goal");

        uint bal = pledgedAmount[_id][msg.sender];
        pledgedAmount[_id][msg.sender] = 0;
        token.transfer(msg.sender, bal);

        emit Refund(_id, msg.sender, bal);
    }

}
