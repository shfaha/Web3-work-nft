const { expect } = require("chai");
const { ethers, deployments } = require("hardhat");
const { parseEther } = require("ethers");

describe("WorkCredentialNFT", function () {
  let workCredentialNFT;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    await deployments.fixture(["workNFT"]);
    [owner, addr1, addr2] = await ethers.getSigners();
    // const WorkCredentialNFT = await ethers.getContractFactory(
    //   "WorkCredentialNFT"
    // );
    // workCredentialNFT = await WorkCredentialNFT.deploy();
    // console.log(workCredentialNFT.address);
    const WorkCredentialNFT = await deployments.get("WorkCredentialNFT");
    workCredentialNFT = await ethers.getContractAt(
      "WorkCredentialNFT",
      WorkCredentialNFT.address
    );
  });
  //console.log(addr1.address);
  it("Should mint a new NFT", async function () {
    //mint a NFT
    await workCredentialNFT.mintWorkCredential(
      addr1.address,
      "ipfs://some-metadata-uri"
    );
    //get nft supply
    let ts = await workCredentialNFT.totalSupply();
    console.log(ts.toString());
    amount = ts.toString();
    console.log(amount);

    const tokenId = amount - 1;
    const ownerOfToken = await workCredentialNFT.ownerOf(tokenId);
    expect(ownerOfToken).to.equal(addr1.address);
  });

  describe("getTokensOfOwner", function () {
    it("should return the correct tokens of the owner", async function () {
      const tokenURI = "ipfs://some-metadata-uri";

      // Mint NFTs for addr1
      const tx1 = await workCredentialNFT.mintWorkCredential(
        addr1.address,
        tokenURI
      );
      const tx2 = await workCredentialNFT.mintWorkCredential(
        addr1.address,
        tokenURI
      );
      await tx1.wait();
      await tx2.wait();

      // 获取 addr1 所有的 tokens
      const tokens = await workCredentialNFT.getTokensOfOwner(addr1.address);

      // 验证 addr1 拥有的 tokenId 是否正确
      expect(tokens.length).to.equal(2);
    });
  });

  describe("transferFrom", function () {
    it("should transfer token from one address to another", async function () {
      const tokenURI = "ipfs://some-metadata-uri";

      // Mint NFT for addr1
      const tx = await workCredentialNFT.mintWorkCredential(
        addr1.address,
        tokenURI
      );
      const receipt = await tx.wait();
      // 提取事件中的 tokenId（通过事件日志）
      const logs = receipt.logs;
      console.log("交易日志", logs);

      // 假设事件 "Minted" 的索引是0（第一个事件），解析日志
      const parsedLog = workCredentialNFT.interface.parseLog(logs[0]);
      const tokenId = parsedLog.args.tokenId;
      console.log(tokenId);

      //Verify if the nft belong to add1 after mint
      const addTokens = await workCredentialNFT.getTokensOfOwner(addr1.address);
      expect(addTokens).to.include(tokenId);
      // Transfer the token to addr2
      await workCredentialNFT
        .connect(addr1)
        .transferFrom(addr1.address, addr2.address, tokenId);

      // Verify the new owner of the token
      expect(await workCredentialNFT.ownerOf(tokenId)).to.equal(addr2.address);

      // Verify addr1 no longer owns the token
      const addr1Tokens = await workCredentialNFT.getTokensOfOwner(
        addr1.address
      );
      expect(addr1Tokens).to.not.include(tokenId);
      console.log(addr1Tokens);

      // Verify addr2 owns the token
      const addr2Tokens = await workCredentialNFT.getTokensOfOwner(
        addr2.address
      );
      expect(addr2Tokens).to.include(tokenId);
      console.log(addr2Tokens);
    });
  });
});

describe("WorkDAO", function () {
  let workDAO;
  let governanceToken;
  let addr1;
  let addr2;

  beforeEach(async function () {
    await deployments.fixture(["mock", "work"]);
    [deployer, addr1, addr2] = await ethers.getSigners();
    const MockERC20 = await deployments.get("MockERC20");
    console.log(MockERC20.address);
    governanceToken = await ethers.getContractAt(
      "MockERC20",
      MockERC20.address
    );

    const WorkDAO = await deployments.get("WorkDAO");
    workDAO = await ethers.getContractAt("WorkDAO", WorkDAO.address);

    // 给地址1和地址2一些治理代币
    console.log(addr1.address, addr2.address);
    await governanceToken.mint(deployer, 500);
    await governanceToken.transfer(addr1.address, 100);
    await governanceToken.transfer(addr2.address, 50);
  });

  it("Should allow users to vote", async function () {
    await workDAO.createProposal("Proposal 1");

    // 地址1投票
    await workDAO.connect(addr1).vote(0);
    const proposal = await workDAO.proposals(0);
    const ss = await governanceToken.balanceOf(addr1);
    console.log(ss);
    expect(proposal.voteCount).to.equal(100);

    //地址2投票
    await workDAO.connect(addr2).vote(1);
    const proposal2 = await workDAO.proposals(1);
    expect(proposal2.voteCount).to.equal(50);
  });
});

describe("NFTMarkets", function () {
  let nftContract, nftMarkets, owner, addr1, NFTMarkets, addr2;

  beforeEach(async function () {
    // 部署 ERC721 合约
    await deployments.fixture(["mock721", "market"]);
    [deployer, addr1, addr2] = await ethers.getSigners();
    const MockERC721 = await deployments.get("MockERC721");
    nftContract = await ethers.getContractAt("MockERC721", MockERC721.address);

    // 部署 NFTMarkets 合约
    NFTMarkets = await deployments.get("NFTMarkets");
    nftMarkets = await ethers.getContractAt("NFTMarkets", NFTMarkets.address);
  });

  describe("Listing an NFT", function () {
    it("Should list an NFT for sale", async function () {
      // 铸造一个 NFT 给 addr1
      await nftContract.connect(addr1).mint(addr1.address, 1);
      const owner = await nftContract.ownerOf(1);
      console.log(addr1.address, owner);
      // 授权 NFT 给市场合约
      await nftContract.connect(addr1).approve(NFTMarkets.address, 1);
      // await txApprove.wait();
      console.log(1);
      // 上架 NFT
      await nftMarkets.connect(addr1).listNFTForSale(1, 1);
      // 检查价格和卖家是否正确
      expect(await nftMarkets.nftPrices(1)).to.equal(1);
      expect(await nftMarkets.nftSellers(1)).to.equal(addr1.address);
      const owner1 = await nftContract.ownerOf(1);
    });

    it("Should fail if not the owner tries to list", async function () {
      // 铸造一个 NFT 给 addr1
      await nftContract.connect(addr1).mint(addr1.address, 1);

      // addr2 尝试上架不属于它的 NFT
      await expect(
        nftMarkets.connect(addr2).listNFTForSale(1, 1)
      ).to.be.revertedWith("Only the owner can list the NFT");
    });
  });

  describe("Buying an NFT", function () {
    it("Should buy an NFT successfully", async function () {
      // 铸造一个 NFT 给 addr1 并上架
      await nftContract.connect(addr1).mint(addr1.address, 1);
      // 授权 NFT 给市场合约
      await nftContract.connect(addr1).approve(NFTMarkets.address, 1);
      await nftMarkets.connect(addr1).listNFTForSale(1, 1);
      // addr2 购买 NFT
      await nftMarkets.connect(addr2).buyNFT(1, { value: 1 });

      // 检查 NFT 是否转移到了买家
      console.log(await nftContract.ownerOf(1), addr2.address);
      expect(await nftContract.ownerOf(1)).to.equal(addr2.address);

      // 检查市场记录是否清除
      expect(await nftMarkets.nftPrices(1)).to.equal(0);
      expect(await nftMarkets.nftSellers(1)).to.equal(
        "0x0000000000000000000000000000000000000000"
      );

      // // 检查事件是否触发
      // await expect(nftMarkets.connect(addr2).buyNFT(1, { value: 1 }))
      //   .to.emit(nftMarkets, "NFTPurchased")
      //   .withArgs(1, 1, addr2.address);
    });

    it("Should fail if price is incorrect", async function () {
      // 铸造一个 NFT 给 addr1 并上架
      await nftContract.connect(addr1).mint(addr1.address, 1);
      // 授权 NFT 给市场合约
      await nftContract.connect(addr1).approve(NFTMarkets.address, 1);
      await nftMarkets.connect(addr1).listNFTForSale(1, 1);

      // addr2 尝试用错误的价格购买 NFT
      await expect(
        nftMarkets.connect(addr2).buyNFT(1, { value: 2 })
      ).to.be.revertedWith("Incorrect payment");
    });
  });

  describe("Removing an NFT from sale", function () {
    it("Should remove an NFT from sale", async function () {
      // 铸造一个 NFT 给 addr1 并上架
      await nftContract.connect(addr1).mint(addr1.address, 1);
      // 授权 NFT 给市场合约
      console.log(NFTMarkets.address);
      await nftContract.connect(addr1).approve(NFTMarkets.address, 1);
      console.log(parseEther("1"));
      await nftMarkets.connect(addr1).listNFTForSale(1, parseEther("1"));

      // 取消上架
      await nftMarkets.connect(addr1).removeNFTFromSale(1);

      // 检查 NFT 是否退还给卖家
      expect(await nftContract.ownerOf(1)).to.equal(addr1.address);

      // 检查市场记录是否清除
      expect(await nftMarkets.nftPrices(1)).to.equal(0);
      expect(await nftMarkets.nftSellers(1)).to.equal(
        "0x0000000000000000000000000000000000000000"
      );
    });

    it("Should fail if not the seller tries to remove", async function () {
      // 铸造一个 NFT 给 addr1 并上架
      await nftContract.connect(addr1).mint(addr1.address, 1);
      // 授权 NFT 给市场合约
      await nftContract.connect(addr1).approve(NFTMarkets.address, 1);
      await nftMarkets.connect(addr1).listNFTForSale(1, 1);

      // addr2 尝试取消不属于它的 NFT 上架
      await expect(
        nftMarkets.connect(addr2).removeNFTFromSale(1)
      ).to.be.revertedWith("Only the seller can remove the NFT");
    });
  });
});

// describe("Promise.all", async function () {
//   it("test1", async function () {
//     Promise.all = function (promises) {
//       return new Promise((resolve, reject) => {
//         if (!Array.isArray(promises)) {
//           reject(new TypeError("必须传入一个数组"));
//           return;
//         }
//         var results = [];

//         if (promises.length === 0) {
//           console.log("空数组");
//           resolve(results);
//         }
//         for (var i = 0; i < promises.length; i++) {
//           (function (i) {
//             Promise.resolve(promises[i]).then(
//               (value) => {
//                 results[i] = value;
//                 if (i === promises.length - 1) {
//                   console.log("全部完成");
//                   resolve(results);
//                 }
//               },
//               (error) => reject(error)
//             );
//           })(i);
//         }

//         // promises.forEach((promise, index) => {
//         //   Promise.resolve(promise).then(
//         //     (value) => {
//         //       results[index] = value;
//         //       completed += 1;

//         //       if (completed === promises.length - 1) {
//         //         console.log("全部完成");
//         //         resolve(results);
//         //       }
//         //     },
//         //     (error) => reject(error)
//         //   );
//         // });
//       });
//     };

//     //test
//     const p1 = new Promise((resolve, reject) => {
//       setTimeout(() => resolve("p1"), 1000);
//     });
//     const p2 = new Promise((resolve, reject) => {
//       setTimeout(() => resolve("p2"), 2000);
//     });
//     const p3 = new Promise((resolve, reject) => {
//       setTimeout(() => resolve("p3"), 3000);
//     });
//     Promise.all([p1, p2, p3])
//       .then((values) => {
//         console.log(values);
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//   });
// });

// describe("斐波那锲数列", async function () {
//   it("test2", async function () {
//     function ff(n) {
//       if (n <= 1) {
//         console.log(n);
//       }
//       let a = 0,
//         b = 1,
//         c = 0;
//       for (let i = 2; i <= n; i++) {
//         c = a + b; //ff(n)=ff(n-1)+ff(n-2);
//         a = b; //a=ff(n-2);
//         b = c; //b=ff(n-1);
//       }
//       console.log(c);
//     }
//     ff(20);
//   });

//   it("test3", async function () {
//     for (var i = 0; i < 10; i++) {
//       setTimeout(function () {
//         console.log(i);
//       });
//     }
//     for (var i = 0; i < 10; i++) {
//       (function (i) {
//         setTimeout(function () {
//           console.log(i);
//         });
//       })(i);
//     }
//   });
// });
