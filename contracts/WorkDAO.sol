// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

//这是一个简单的DAO治理合约，允许用户通过持有的 ERC-20代币 参与提案和投票。我们假设治理代币是另一个ERC-20代币。
contract WorkDAO is Ownable {
    IERC20 public governanceToken;

    // 提案结构体
    struct Proposal {
        uint256 id;
        string description; //描述
        uint256 voteCount; //票数
        bool executed; //执行
        mapping(address => bool) voted; //投票
    }

    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount; //提案数量

    event ProposalCreated(uint256 id, string description);
    event Voted(uint256 proposalId, address voter);
    event ProposalExecuted(uint256 proposalId);

    constructor(address _governanceToken) Ownable(msg.sender) {
        governanceToken = IERC20(_governanceToken);
    }

    // 创建提案
    function createProposal(string memory description) external onlyOwner {
        uint256 proposalId = proposalCount;
        // proposals[proposalId] = Proposal(proposalId, description, 0, false);
        proposals[proposalId].id = proposalId;
        proposals[proposalId].description = description;
        proposals[proposalId].voteCount = 0;
        proposals[proposalId].executed = false;
        proposalCount += 1;

        emit ProposalCreated(proposalId, description);
    }

    // 投票
    function vote(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.voted[msg.sender], "Already voted.");
        require(governanceToken.balanceOf(msg.sender) > 0, "No voting power.");

        proposal.voted[msg.sender] = true;
        proposal.voteCount += governanceToken.balanceOf(msg.sender); // 基于持有的代币数量计算投票权重

        emit Voted(proposalId, msg.sender);
    }

    // 执行提案
    function executeProposal(uint256 proposalId) external onlyOwner {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Already executed.");

        if (proposal.voteCount > 0) {
            proposal.executed = true;
            emit ProposalExecuted(proposalId);
        }
    }
}
