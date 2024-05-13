// SPDX-License-Identifier: MIT
// Author: @haof0292
// date:2024/5/12
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract HxToken is ERC721 {
    uint256 private _currentTokenId; //tokenId will start from 1
    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {
        
    }

    /**
     * @dev Mints a token to an address with a tokenURI.
     * @param _to address of the future owner of the token
     */
    function mintTo(address _to) public {
        uint256 newTokenId = _getNextTokenId();
        _mint(_to, newTokenId);
        
    }

    /**
     * @dev calculates the next token ID based on value of _currentTokenId
     * @return uint256 for the next token ID
     */
    function _getNextTokenId() private  returns (uint256) {
        return ++_currentTokenId;
    }

    /**
     * @dev return tokenURI, image SVG data in it.
     */
    function tokenURI(uint256 tokenId) override public pure returns (string memory) {
        string[3] memory parts;
        parts[0] = "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: white; font-family: serif; font-size: 300px; }</style><rect width='100%' height='100%' fill='brown' /><text x='100' y='260' class='base'>";
        parts[1] = Strings.toString(tokenId);
        parts[2] = "</text></svg>";
        string memory json = Base64.encode(bytes(string(abi.encodePacked(
            "{\"name\":\"Hx #", Strings.toString(tokenId), "\",\"description\":\"Hx NFT with on-chain SVG image.\",",
            "\"image\": \"data:image/svg+xml;base64,", 
            // Base64.encode(bytes(output)), 
            Base64.encode(bytes(abi.encodePacked(parts[0], parts[1], parts[2]))),     
            "\"}"
            ))));
            
        return string(abi.encodePacked("data:application/json;base64,", json));
    }    
}
