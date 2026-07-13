import { run, ethers } from "hardhat";
import { getChainConfig } from "../src/config/chain";

async function main(): Promise<void> {
  const address = process.argv[2] ?? process.env.TOKEN_ADDRESS;
  const name = process.argv[3] ?? process.env.TOKEN_NAME;
  const symbol = process.argv[4] ?? process.env.TOKEN_SYMBOL;
  const supply = process.argv[5] ?? process.env.TOKEN_SUPPLY;
  const owner = process.argv[6] ?? process.env.TOKEN_OWNER;

  if (!address || !name || !symbol || !supply || !owner) {
    throw new Error(
      "Usage: npx hardhat run scripts/verify-token.ts --network <network> -- <address> <name> <symbol> <supply> <owner>\n" +
        "Or set TOKEN_ADDRESS, TOKEN_NAME, TOKEN_SYMBOL, TOKEN_SUPPLY, TOKEN_OWNER in .env"
    );
  }

  const network = await ethers.provider.getNetwork();
  const chain = getChainConfig(Number(network.chainId));

  console.log("Verifying on", chain.name, "...");
  const decimals = 18;
  const initialSupply = ethers.parseUnits(supply, decimals);

  await run("verify:verify", {
    address,
    constructorArguments: [name, symbol, decimals, initialSupply, owner],
  });
  console.log("Verified:", `${chain.explorerUrl}/address/${address}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
