import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { AbiCoder, parseUnits } from "ethers";
import { logger } from "../lib/logger.js";
import type { RobinhoodNetwork } from "../config/networks.js";

export interface VerifyTokenParams {
  tokenAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  supply: string;
  owner: string;
  network: RobinhoodNetwork;
}

interface VerifyResponse {
  status: string;
  message: string;
  result?: string;
}

function loadStandardJsonInput(): string {
  const buildInfoPath = join(process.cwd(), "artifacts", "build-info");

  if (!existsSync(buildInfoPath)) {
    throw new Error("Build info not found. Run `npm run compile:contracts` first.");
  }

  const files = readdirSync(buildInfoPath).filter((f) => f.endsWith(".json"));
  if (files.length === 0) {
    throw new Error("No build-info artifacts found.");
  }

  const latest = files.sort().at(-1)!;
  const buildInfo = JSON.parse(
    readFileSync(join(buildInfoPath, latest), "utf8"),
  ) as { input: unknown };

  return JSON.stringify(buildInfo.input);
}

function encodeConstructorArgs(
  name: string,
  symbol: string,
  decimals: number,
  initialSupply: string,
  owner: string,
): string {
  const encoded = AbiCoder.defaultAbiCoder().encode(
    ["string", "string", "uint8", "uint256", "address"],
    [name, symbol, decimals, initialSupply, owner],
  );
  return encoded.slice(2);
}

export async function verifyTokenOnBlockscout(
  params: VerifyTokenParams,
): Promise<{ guid?: string; alreadyVerified: boolean }> {
  const initialSupply = parseUnits(params.supply, params.decimals).toString();

  const query = new URLSearchParams({
    module: "contract",
    action: "verifysourcecode",
    contractaddress: params.tokenAddress,
    sourceCode: loadStandardJsonInput(),
    codeformat: "solidity-standard-json-input",
    contractname: "contracts/RobinhoodToken.sol:RobinhoodToken",
    compilerversion: "v0.8.20+commit.a1b79de6",
    optimizationUsed: "1",
    runs: "200",
    constructorArguments: encodeConstructorArgs(
      params.name,
      params.symbol,
      params.decimals,
      initialSupply,
      params.owner,
    ),
  });

  const url = `${params.network.explorerApiUrl}?${query.toString()}`;
  const res = await fetch(url, { method: "POST" });
  const body = (await res.json()) as VerifyResponse;

  if (body.status === "1") {
    logger.info({ guid: body.result }, "Verification submitted to Blockscout");
    return { guid: body.result, alreadyVerified: false };
  }

  if (body.result?.toLowerCase().includes("already verified")) {
    logger.info("Contract already verified on Blockscout");
    return { alreadyVerified: true };
  }

  throw new Error(`Verification failed: ${body.message} — ${body.result ?? ""}`);
}
