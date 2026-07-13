#!/usr/bin/env node
import { Command } from "commander";
import { resolveNetwork } from "../config/env.js";
import { verifyTokenOnBlockscout } from "../services/verify.service.js";
import { logger } from "../lib/logger.js";
import type { RobinhoodNetworkName } from "../config/networks.js";

const program = new Command();

program
  .name("verify-token")
  .description("Verify a deployed RobinhoodToken on Blockscout")
  .requiredOption("-a, --address <address>", "Deployed token contract address")
  .requiredOption("-n, --name <name>", "Token name used at deploy time")
  .requiredOption("-s, --symbol <symbol>", "Token symbol used at deploy time")
  .option("-d, --decimals <decimals>", "Token decimals", "18")
  .requiredOption("--supply <supply>", "Initial supply in whole tokens")
  .requiredOption("-o, --owner <address>", "Owner address used at deploy time")
  .option(
    "--network <network>",
    "mainnet or testnet (overrides RH_NETWORK)",
    (v) => v as RobinhoodNetworkName,
  )
  .action(async (opts) => {
    const network = resolveNetwork(opts.network);
    const result = await verifyTokenOnBlockscout({
      tokenAddress: opts.address,
      name: opts.name,
      symbol: opts.symbol,
      decimals: Number(opts.decimals),
      supply: opts.supply,
      owner: opts.owner,
      network,
    });

    if (result.alreadyVerified) {
      console.log("Contract is already verified.");
      return;
    }

    console.log(`Verification submitted. GUID: ${result.guid}`);
    console.log(`Check status at ${network.explorerUrl}/address/${opts.address}`);
  });

program.parseAsync(process.argv).catch((err: unknown) => {
  logger.error({ err }, "verify-token failed");
  process.exitCode = 1;
});
