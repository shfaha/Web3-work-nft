// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(
        string memory name,
        string memory symbol
    ) ERC20("ERC20Mock", "E20M") {}

    // 用于测试目的的 mint 函数
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    // 用于测试目的的 burn 函数
    function burn(address from, uint256 amount) public {
        _burn(from, amount);
    }
}
