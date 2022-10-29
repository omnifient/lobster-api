import { ethers } from "hardhat";

async function main() {
  const NFTFactory = await ethers.getContractFactory("NFTFactory");
  const nftFactory = await NFTFactory.deploy();

  await nftFactory.deployed();

  console.log(`NFTFactory deployed to: ${nftFactory.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
