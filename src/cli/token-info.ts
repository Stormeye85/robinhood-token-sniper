import dotenv from "dotenv";
import { isAddress, type Address } from "viem";
import { fetchTokenInfo } from "../token/info";
import { ROBINHOOD_MAINNET, ROBINHOOD_TESTNET } from "../config/chain";

dotenv.config();

async function main(): Promise<void> {
  const addressArg = process.argv[2] ?? process.env.TOKEN_ADDRESS;
  const networkArg = (process.argv[3] ?? process.env.RH_NETWORK ?? "testnet").toLowerCase();

  if (!addressArg || !isAddress(addressArg)) {
    console.error("Usage: npm run info -- <tokenAddress> [testnet|mainnet]");
    process.exit(1);
  }

  const chainId =
    networkArg === "mainnet" ? ROBINHOOD_MAINNET.chainId : ROBINHOOD_TESTNET.chainId;

  const info = await fetchTokenInfo(addressArg as Address, chainId);

  console.log(JSON.stringify(info, null, 2));
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
