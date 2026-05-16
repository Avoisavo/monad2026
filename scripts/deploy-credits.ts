import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const address = await deployer.getAddress();
  const balance = await ethers.provider.getBalance(address);

  console.log("Deployer:", address);
  console.log("Balance:", ethers.formatEther(balance), "MON");

  if (balance === 0n) {
    console.error(
      "\nWallet has 0 MON. Get testnet MON from: https://faucet.monad.xyz"
    );
    process.exit(1);
  }

  console.log("\nDeploying AIQueryCredits...");
  const credits = await ethers.deployContract("AIQueryCredits");
  await credits.waitForDeployment();

  const deployedAt = await credits.getAddress();
  console.log("AIQueryCredits deployed to:", deployedAt);
  console.log(
    "Explorer:",
    `https://testnet.monadscan.com/address/${deployedAt}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
