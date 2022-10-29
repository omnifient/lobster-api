// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import"@openzeppelin/contracts/utils/Counters.sol";


contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address owner;

    modifier isOwner {
        require(msg.sender == owner);
        _;
    }

    constructor(address _clientSender, string memory _name, string memory _symbol) ERC721(_name, _symbol) {        
        owners[_clientSender] = true;
    }
    
    function mint(address _to, string calldata _ifpsURI) external isOwner {
        _tokenIds.increment();

        uint256 tokenId = _tokenIds.current();
        _mint(_to, tokenId);
        _setTokenURI(tokenId, _ifpsURI);        
    }
}
