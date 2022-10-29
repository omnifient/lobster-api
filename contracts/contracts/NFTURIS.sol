// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import"@openzeppelin/contracts/utils/Counters.sol";

// TODO: add ownable library
contract NFTURIS is ERC721URIStorage {
    mapping(uint256 => string) public uriMapping;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address public owner;

    modifier isOwner {
        require(msg.sender == owner, "function must be called by owner");
        _;
    }

    constructor(address _clientSender, string memory _name, string memory _symbol, string[] memory _ipfsURIS) ERC721(_name, _symbol) {        
        owner = _clientSender;
        for (uint256 idx = 0; idx < _ipfsURIS.length; idx++) {
            uriMapping[idx] = _ipfsURIS[idx];
        }
    }
    
    function mint(address _to, uint256 uriKey) external {
        string memory ipfsURI = uriMapping[uriKey];
        _tokenIds.increment();

        uint256 tokenId = _tokenIds.current();
        _mint(_to, tokenId);
        _setTokenURI(tokenId, ipfsURI);        
    }
}
