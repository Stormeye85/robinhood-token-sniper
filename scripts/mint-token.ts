import { ethers } from "hardhat";
import { getChainConfig } from "../src/config/chain";

async function main(): Promise<void> {
  const tokenAddress = process.env.TOKEN_ADDRESS;
  const mintTo = process.env.MINT_TO;
  const mintAmountRaw = process.env.MINT_AMOUNT;

  if (!tokenAddress || !mintTo || !mintAmountRaw) {
    throw new Error(
      "Set TOKEN_ADDRESS, MINT_TO, and MINT_AMOUNT in .env (MINT_AMOUNT is whole tokens, e.g. 1000)"
    );
  }

  const mintAmount = BigInt(mintAmountRaw);
  const [signer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const chain = getChainConfig(Number(network.chainId));

  const token = await ethers.getContractAt("RobinhoodToken", tokenAddress, signer);
  const decimals = await token.decimals();
  const scaled = mintAmount * 10n ** BigInt(decimals);

  console.log("Network:", chain.name);
  console.log("Token:", tokenAddress);
  console.log("Minting", mintAmount.toString(), "tokens to", mintTo);

  const tx = await token.mint(mintTo, scaled);
  const receipt = await tx.wait();

  console.log("Mint tx:", receipt?.hash);
  console.log("Explorer:", `${chain.explorerUrl}/tx/${receipt?.hash}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
