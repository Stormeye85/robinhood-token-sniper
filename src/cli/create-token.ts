#!/usr/bin/env node
import { Command } from "commander";
import { env, resolveNetwork } from "../config/env.js";
import { createToken } from "../services/token.service.js";
import { verifyTokenOnBlockscout } from "../services/verify.service.js";
import { logger } from "../lib/logger.js";
import type { RobinhoodNetworkName } from "../config/networks.js";

const program = new Command();

program
  .name("create-token")
  .description("Deploy an ERC-20 token on Robinhood Chain")
  .requiredOption("-n, --name <name>", "Token name")
  .requiredOption("-s, --symbol <symbol>", "Token symbol (ticker)")
  .option("-d, --decimals <decimals>", "Token decimals", "18")
  .requiredOption("--supply <supply>", "Initial supply in whole tokens (e.g. 1000000)")
  .option("-o, --owner <address>", "Owner address (defaults to deployer wallet)")
  .option(
    "--network <network>",
    "mainnet or testnet (overrides RH_NETWORK)",
    (v) => v as RobinhoodNetworkName,
  )
  .option("--verify", "Submit contract verification to Blockscout after deploy", false)
  .option("--json", "Print result as JSON", false)
  .action(async (opts) => {
    const network = resolveNetwork(opts.network);
    const decimals = Number(opts.decimals);

    if (!Number.isInteger(decimals) || decimals < 0 || decimals > 18) {
      throw new Error("decimals must be an integer between 0 and 18");
    }

    const deployed = await createToken({
      name: opts.name,
      symbol: opts.symbol,
      decimals,
      supply: opts.supply,
      owner: opts.owner,
      privateKey: env.PRIVATE_KEY,
      network,
    });

    if (opts.verify) {
      try {
        await verifyTokenOnBlockscout({
          tokenAddress: deployed.address,
          name: deployed.name,
          symbol: deployed.symbol,
          decimals: deployed.decimals,
          supply: deployed.initialSupply,
          owner: deployed.owner,
          network: deployed.network,
        });
      } catch (err) {
        logger.warn({ err }, "Verification failed — token is still deployed");
      }
    }

    if (opts.json) {
      console.log(JSON.stringify(deployed, null, 2));
      return;
    }

    console.log("\n✅ Token deployed on Robinhood Chain\n");
    console.log(`  Name:      ${deployed.name}`);
    console.log(`  Symbol:    ${deployed.symbol}`);
    console.log(`  Decimals:  ${deployed.decimals}`);
    console.log(`  Supply:    ${deployed.initialSupply}`);
    console.log(`  Address:   ${deployed.address}`);
    console.log(`  Owner:     ${deployed.owner}`);
    console.log(`  Network:   ${deployed.network.name} (chainId ${deployed.network.chainId})`);
    console.log(`  Explorer:  ${deployed.explorerUrl}`);
    console.log(`  Tx:        ${deployed.network.explorerUrl}/tx/${deployed.txHash}\n`);
  });

program.parseAsync(process.argv).catch((err: unknown) => {
  logger.error({ err }, "create-token failed");
  process.exitCode = 1;
});
