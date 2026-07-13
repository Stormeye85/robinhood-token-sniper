import { ethers } from "hardhat";
import { getChainConfig, parseTokenArgs } from "../src/config/chain";

async function main(): Promise<void> {
  const args = parseTokenArgs();
  const [deployer] = await ethers.getSigners();
  const owner = args.owner ?? deployer.address;
  const network = await ethers.provider.getNetwork();
  const chain = getChainConfig(Number(network.chainId));

  console.log("Network:", chain.name, `(chainId ${chain.chainId})`);
  console.log("Deployer:", deployer.address);
  console.log("Token owner:", owner);
  console.log("Name:", args.name);
  console.log("Symbol:", args.symbol);
  console.log("Initial supply (whole tokens):", args.supply);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer ETH balance:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    throw new Error(
      `Deployer has no ETH for gas on ${chain.name}. Fund ${deployer.address} first.`
    );
  }

  const decimals = 18;
  const initialSupply = ethers.parseUnits(args.supply.toString(), decimals);

  const RobinhoodToken = await ethers.getContractFactory("RobinhoodToken");
  const token = await RobinhoodToken.deploy(
    args.name,
    args.symbol,
    decimals,
    initialSupply,
    owner,
  );
  await token.waitForDeployment();

  const address = await token.getAddress();
  const tx = token.deploymentTransaction();

  console.log("\n--- Token deployed ---");
  console.log("Contract:", address);
  console.log("Tx hash:", tx?.hash ?? "(unknown)");
  console.log("Explorer:", `${chain.explorerUrl}/address/${address}`);
  console.log("\nVerify (after a few blocks):");
  console.log(
    `  npx hardhat verify --network ${chain.hardhatNetwork} ${address} "${args.name}" "${args.symbol}" ${decimals} ${initialSupply} ${owner}`
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
