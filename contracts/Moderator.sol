// Moderator.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable2Step.sol";

/**
 * @author raffaeleav
 * 
 * @title an Admin contract for Access Control
 * 
 * @dev Ownable2Step adds an extra check for ownership transfer
*/
contract Moderator is Ownable2Step {
    constructor(address initialOwner) Ownable(initialOwner) {}
}