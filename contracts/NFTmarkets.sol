// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "hardhat/console.sol";

contract NFTMarkets {
    ERC721 public nftContract;
    mapping(uint256 => uint256) public nftPrices; // tokenId -> price
    mapping(uint256 => address) public nftSellers; // tokenId -> seller
    mapping(uint256 => NFTListing) public nftListings; //key->NFTListing
    struct NFTListing {
        uint256 tokenId;
        uint256 price;
        address seller;
    }

    event NFTListed(uint256 tokenId, uint256 price, address seller);
    event NFTPurchased(uint256 tokenId, uint256 price, address buyer);
    event NFTRemovedFromSale(uint256 tokenId, address seller);

    constructor(address _nftContract) {
        nftContract = ERC721(_nftContract);
    }

    // 上架NFT
    function listNFTForSale(uint256 tokenId, uint256 price) public {
        require(
            nftContract.ownerOf(tokenId) == msg.sender,
            "Only the owner can list the NFT"
        );
        require(price > 0, "Price must be greater than zero");

        nftPrices[tokenId] = price;
        nftSellers[tokenId] = msg.sender;
        nftContract.transferFrom(msg.sender, address(this), tokenId);

        // 将 NFT 信息添加到上架列表
        nftListings[tokenId] = NFTListing(tokenId, price, msg.sender);
        emit NFTListed(tokenId, price, msg.sender);
    }

    // 购买NFT
    function buyNFT(uint256 tokenId) public payable {
        uint256 price = nftPrices[tokenId];
        address seller = nftSellers[tokenId];

        require(price > 0, "NFT is not for sale");
        require(msg.value == price, "Incorrect payment");

        // 转账给卖家
        payable(seller).transfer(msg.value);
        // 转移NFT给买家

        nftContract.transferFrom(address(this), msg.sender, tokenId);

        // 清除市场记录
        delete nftPrices[tokenId];
        delete nftSellers[tokenId];
        delete nftListings[tokenId];

        emit NFTPurchased(tokenId, price, msg.sender);
    }

    // 取消NFT上架
    function removeNFTFromSale(uint256 tokenId) public {
        require(
            nftSellers[tokenId] == msg.sender,
            "Only the seller can remove the NFT"
        );

        // 退还NFT给卖家
        nftContract.transferFrom(address(this), msg.sender, tokenId);

        // 清除市场记录
        delete nftPrices[tokenId];
        delete nftSellers[tokenId];
        delete nftListings[tokenId];

        emit NFTRemovedFromSale(tokenId, msg.sender);
    }
}
