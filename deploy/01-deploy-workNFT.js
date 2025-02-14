const { devlopmentChains } = require("../helper-hardhat-config");
const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { firstAccount } = await getNamedAccounts();
  const { deploy } = deployments;
  await deploy("WorkCredentialNFT", {
    from: firstAccount,
    args: null, // 这里是合约的构造函数参数
    log: true,
  });
  console.log("部署成功");
  // const WorkCredentialNFT = await deployments.get("WorkCredentialNFT");
  // workCredentialNFT = await ethers.getContractAt(
  //   "WorkCredentialNFT",
  //   WorkCredentialNFT.address
  // );
  // const addressFilePath = path.join(
  //   __dirname,
  //   "../my-dao-app/public/addandapi.json"
  // );
  // let addressData = {};
  // console.log(workCredentialNFT.interface); // 检查接口是否加载成功
  // if (fs.existsSync(addressFilePath)) {
  //   // 如果文件已存在，读取文件并解析
  //   addressData = JSON.parse(fs.readFileSync(addressFilePath, "utf8"));
  // }
  // addressData.MyNFT = {
  //   address: WorkCredentialNFT.address,
  //   abi: JSON.parse(
  //     JSON.stringify(
  //       workCredentialNFT.interface.format(ethers.utils.FormatTypes.json)
  //     )
  //   ),
  // };
  // // 写入合约地址和 ABI 到 JSON 文件
  // fs.writeFileSync(addressFilePath, JSON.stringify(addressData, null, 2));
  // console.log("Contract address and ABI saved to contract-address.json");
};

module.exports.tags = ["all", "workNFT"];
