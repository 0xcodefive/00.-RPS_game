// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RPS_game {
    modifier onlyOwner{
        require(msg.sender == owner);
        _;
    }

    address owner;
    event GameIsPlayed(address player, uint256 amount, uint8 choice, uint8 result); 

    constructor() payable {
        owner = msg.sender;
    }

    function letsPlay(uint8 _choice) public payable returns (uint8){
        require(_choice < 3, "Please choose rock scissors or paper");
        require(msg.value > 0, "Your bet must be greater than zero");
        require(msg.value <= address(this).balance, "Your bet should be less than the contract balance");
        uint8 result = uint8(uint256(keccak256(abi.encodePacked(block.difficulty, block.timestamp, _choice)))) % 3;
        emit GameIsPlayed(msg.sender, msg.value, _choice, result);
        if (result == _choice){
            payable(msg.sender).transfer(msg.value);
            return 0;
        }
        if (2 + result - _choice == 0 || result - _choice == 1){
            payable(msg.sender).transfer(msg.value * 2);
            return 1;
        }
        return 2;    
    }

    function maxBet() public view returns(uint256) {
        return address(this).balance;
    }

    function deposit() public payable {
        require(msg.value >= 10**9, "value cannot be less than 1 gwei");
    }

    function withdraw() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }
}