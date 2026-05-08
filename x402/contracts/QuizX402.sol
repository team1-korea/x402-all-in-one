// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title QuizX402 Reward Distributor
 * @dev Avalanche APIX L1 Native Reward Engine for X402-Escape.
 * Handles secure distribution of APIX rewards to quiz winners.
 */
contract QuizX402 is Ownable, ReentrancyGuard {
    
    // Events for transparency
    event RewardDistributed(address indexed winner, uint256 amount, bytes32 indexed quizId);
    event FundsDeposited(address indexed sender, uint256 amount);
    event FundsWithdrawn(address indexed admin, uint256 amount);

    uint256 public totalDistributed;
    mapping(address => uint256) public playerRewards;

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Deposit APIX to the reward pool.
     */
    receive() external payable {
        emit FundsDeposited(msg.sender, msg.value);
    }

    /**
     * @dev Distribute reward to a winner. Restricted to the owner (The Backend API).
     * @param _winner Address of the participant.
     * @param _amount Amount of APIX to reward.
     * @param _quizId Reference ID for the quiz stage.
     */
    function distributeReward(address payable _winner, uint256 _amount, bytes32 _quizId) 
        external 
        onlyOwner 
        nonReentrant 
    {
        require(address(this).balance >= _amount, "Insufficient pool balance");
        require(_winner != address(0), "Invalid winner address");

        (bool success, ) = _winner.call{value: _amount}("");
        require(success, "Transfer failed");

        totalDistributed += _amount;
        playerRewards[_winner] += _amount;

        emit RewardDistributed(_winner, _amount, _quizId);
    }

    /**
     * @dev Emergency withdraw funds by the admin.
     */
    function withdraw(uint256 _amount) external onlyOwner nonReentrant {
        require(address(this).balance >= _amount, "Insufficient balance");
        payable(owner()).transfer(_amount);
        emit FundsWithdrawn(owner(), _amount);
    }

    /**
     * @dev Get the current reward pool balance.
     */
    function getPoolBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
