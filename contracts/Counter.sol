// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Counter {
    uint256 public count;
    address public owner;

    event Incremented(uint256 newCount, address by);

    constructor() {
        owner = msg.sender;
    }

    function increment() external {
        count += 1;
        emit Incremented(count, msg.sender);
    }

    function reset() external {
        require(msg.sender == owner, "Only owner");
        count = 0;
    }
}
