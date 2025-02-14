// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

error Not_Owner();
event Minted(address indexed to, uint256 tokenId);
event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);


contract WorkCredentialNFT is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;
    mapping(address => uint256[]) private _ownerTokens; // 存储每个地址拥有的所有TokenId
    mapping(uint256 => address) private _tokenOwners; // 记录每个 Token 的拥有者

    constructor() ERC721("WorkCredentialNFT", "WCNFT") Ownable(msg.sender){
        tokenCounter = 0;
    }

    // 铸造NFT
    function mintWorkCredential(address to, string memory tokenURI) public returns (uint256) {
        uint256 tokenId = tokenCounter;  // 使用 tokenCounter 作为 tokenId
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI); // 设置NFT的元数据URI
        
        // 更新拥有者的 Token ID 映射
        _ownerTokens[to].push(tokenId);
        _tokenOwners[tokenId] = to;
        
        tokenCounter += 1;  // 增加 tokenCounter，准备下一个 tokenId
        emit Minted(to, tokenId);  // 触发 Minted 事件
        return tokenId;
    }

    // 查看所有NFT的总数
    function totalSupply() public view returns (uint256) {
        return tokenCounter;
    }

    // 获取某个地址拥有的所有TokenId
    function getTokensOfOwner(address owner) public view returns (uint256[] memory) {
        return _ownerTokens[owner];
    }

    // 重写 transferFrom 函数，更新 _ownerTokens 映射
    function transferFrom(address from, address to, uint256 tokenId) public override(IERC721,ERC721) {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "Not approved or owner");
        
        // 调用父类的 transferFrom 完成基础转移逻辑
        super.transferFrom(from, to, tokenId);

        // 更新持有者的 Token ID 映射
        _updateOwnershipMapping(from, to, tokenId);
        emit Transfer(from,to,tokenId);
    }

    // 内部函数：检查调用者是否是 Token 所有者或被批准者
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address owner = _tokenOwners[tokenId];
        return (spender == owner || getApproved(tokenId) == spender || isApprovedForAll(owner, spender));
    }

    // 内部函数：更新 Token ID 的持有者映射
    function _updateOwnershipMapping(address from, address to, uint256 tokenId) internal {
        // 从旧地址移除 Token ID
        uint256 index = _findTokenIndex(from, tokenId);
        _ownerTokens[from][index] = _ownerTokens[from][_ownerTokens[from].length - 1];
        _ownerTokens[from].pop();

        // 将 Token ID 添加到新地址
        _ownerTokens[to].push(tokenId);
    }

    // 内部函数：查找 Token ID 在地址的数组中的索引
    function _findTokenIndex(address owner, uint256 tokenId) internal view returns (uint256) {
        uint256[] memory tokens = _ownerTokens[owner];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == tokenId) {
                return i;
            }
        }
        revert("Token ID not found for owner");
    }
}
