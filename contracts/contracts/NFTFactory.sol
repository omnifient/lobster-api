// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "./NFT.sol";
import "./NFTURIS.sol";

contract NFTFactory {
    uint256 contractId;
    mapping(uint256 => mapping(uint256 => address)) public childContracts;

    event CreateNFTEvent(uint256 _clientId, address _clientAddress, string _name, string _symbol, address _contractAddress);

    function createNFT(uint256 _clientId, address _clientAddress, string calldata _name, string calldata _symbol, string[] calldata _ipfsURIS) external {
        NFTURIS newNFTContract = new NFTURIS(_clientAddress, _name, _symbol, _ipfsURIS);
        childContracts[_clientId][contractId] = address(newNFTContract);
        contractId += 1;

        emit CreateNFTEvent(_clientId, _clientAddress, _name, _symbol, address(newNFTContract));     
    }

    // function createNFT(uint256 _clientId, address _clientAddress, string calldata _name, string calldata _symbol) external {
    //     NFT newNFTContract = new NFT(_clientAddress, _name, _symbol);
    //     childContracts[_clientId][contractId] = address(newNFTContract);
    //     contractId += 1;

    //     emit CreateNFTEvent(_clientId, _clientAddress, _name, _symbol, address(newNFTContract));     
    // }
}
