const { devlopmentChains } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { firstAccount } = await getNamedAccounts();
  const { deploy } = deployments;
  await deploy("MockERC721", {
    from: firstAccount,
    args: ["MockERC721", "MCK"], // 这里是合约的构造函数参数
    log: true,
  });
  console.log("部署成功");
};

module.exports.tags = ["all", "mock721"];
