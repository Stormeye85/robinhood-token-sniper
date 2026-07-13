import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { Contract, ContractFactory, formatUnits, JsonRpcProvider, Wallet, parseUnits } from "ethers";
import type { RobinhoodNetwork } from "../config/networks.js";
import { explorerAddressUrl, explorerTxUrl } from "../config/networks.js";
import { ROBINHOOD_TOKEN_ABI } from "../contracts/robinhood-token.abi.js";
import { logger } from "../lib/logger.js";

export interface CreateTokenParams {
  name: string;
  symbol: string;
  decimals?: number;
  /** Human-readable supply, e.g. "1000000" */
  supply: string;
  owner?: string;
  privateKey: string;
  network: RobinhoodNetwork;
}

export interface DeployedToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: string;
  owner: string;
  deployer: string;
  txHash: string;
  network: RobinhoodNetwork;
  explorerUrl: string;
}

interface Artifact {
  abi: readonly Record<string, unknown>[];
  bytecode: string;
}

function loadArtifact(): Artifact {
  const artifactPath = join(
    process.cwd(),
    "artifacts",
    "contracts",
    "RobinhoodToken.sol",
    "RobinhoodToken.json",
  );

  if (!existsSync(artifactPath)) {
    throw new Error(
      "Contract artifact not found. Run `npm run compile:contracts` first.",
    );
  }

  const raw = JSON.parse(readFileSync(artifactPath, "utf8")) as Artifact;
  if (!raw.bytecode || raw.bytecode === "0x") {
    throw new Error("Bytecode missing in artifact. Re-run `npm run compile:contracts`.");
  }
  return raw;
}

export async function createToken(params: CreateTokenParams): Promise<DeployedToken> {
  const decimals = params.decimals ?? 18;
  const provider = new JsonRpcProvider(params.network.rpcUrl, params.network.chainId);
  const wallet = new Wallet(params.privateKey, provider);
  const owner = params.owner ?? wallet.address;

  const initialSupply = parseUnits(params.supply, decimals);
  const artifact = loadArtifact();

  logger.info(
    {
      network: params.network.name,
      chainId: params.network.chainId,
      deployer: wallet.address,
      owner,
      name: params.name,
      symbol: params.symbol,
      decimals,
      supply: params.supply,
    },
    "Deploying RobinhoodToken",
  );

  const factory = new ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const contract = await factory.deploy(
    params.name,
    params.symbol,
    decimals,
    initialSupply,
    owner,
  );

  const deployTx = contract.deploymentTransaction();
  if (!deployTx) {
    throw new Error("Deployment transaction missing");
  }

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  const result: DeployedToken = {
    address,
    name: params.name,
    symbol: params.symbol,
    decimals,
    initialSupply: params.supply,
    owner,
    deployer: wallet.address,
    txHash: deployTx.hash,
    network: params.network,
    explorerUrl: explorerAddressUrl(params.network, address),
  };

  logger.info(
    {
      address,
      txHash: deployTx.hash,
      explorer: result.explorerUrl,
      txExplorer: explorerTxUrl(params.network, deployTx.hash),
    },
    "Token deployed",
  );

  return result;
}

export async function getTokenInfo(
  tokenAddress: string,
  network: RobinhoodNetwork,
): Promise<{
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  owner: string;
}> {
  const provider = new JsonRpcProvider(network.rpcUrl, network.chainId);
  const contract = new Contract(tokenAddress, ROBINHOOD_TOKEN_ABI, provider);

  const [name, symbol, decimals, totalSupply, owner] = await Promise.all([
    contract.name() as Promise<string>,
    contract.symbol() as Promise<string>,
    contract.decimals() as Promise<number>,
    contract.totalSupply() as Promise<bigint>,
    contract.owner() as Promise<string>,
  ]);

  return {
    address: tokenAddress,
    name,
    symbol,
    decimals: Number(decimals),
    totalSupply: formatUnits(totalSupply, decimals),
    owner,
  };
}
