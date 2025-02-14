const { devlopmentChains } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { firstAccount } = await getNamedAccounts();
  const { deploy } = deployments;
  console.log("deploy mock");
  const MockERC20 = await deployments.get("MockERC20");
  const tokenAdr = MockERC20.address;
  console.log("get tokenaddress:", tokenAdr);
  await deploy("WorkDAO", {
    from: firstAccount,
    args: [tokenAdr], // 这里是合约的构造函数参数
    log: true,
  });
  console.log("部署成功");
};

module.exports.tags = ["all", "work"];
