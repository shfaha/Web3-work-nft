// contracts/MockERC721.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MockERC721 is ERC721 {
    constructor(
        string memory name,
        string memory symbol
    ) ERC721("MockERC721", "MCK") {}

    function mint(address to, uint256 nextTokenId) external {
        _safeMint(to, nextTokenId);
        nextTokenId++;
    }
}
