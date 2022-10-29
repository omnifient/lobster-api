// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "./NFT.sol";

contract NFTFactory {
    uint256 contractId;
    mapping(uint256 => mapping(uint256 => address)) public childContracts;

    function createNFT(uint256 _clientId, address _clientAddress, string calldata _name, string calldata _symbol) external {
        NFT newNFTContract = new NFT(_clientAddress, _name, _symbol);
        childContracts[_clientId][contractId] = address(newNFTContract);
        contractId += 1;
    }
}
