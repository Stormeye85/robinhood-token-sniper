import { createPublicClient, formatUnits, http, type Address } from "viem";
import { defineChain } from "viem/chains";
import {
  getChainConfig,
  ROBINHOOD_MAINNET,
  ROBINHOOD_TESTNET,
  type RobinhoodChainConfig,
} from "../config/chain";

const erc20Abi = [
  {
    type: "function",
    name: "name",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    type: "function",
    name: "totalSupply",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
] as const;

function toViemChain(config: RobinhoodChainConfig) {
  return defineChain({
    id: config.chainId,
    name: config.name,
    nativeCurrency: config.nativeCurrency,
    rpcUrls: { default: { http: [config.rpcUrl] } },
    blockExplorers: { default: { name: "Blockscout", url: config.explorerUrl } },
  });
}

export interface TokenInfo {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  owner: Address;
  chain: RobinhoodChainConfig;
}

export async function fetchTokenInfo(
  tokenAddress: Address,
  chainId: number = ROBINHOOD_TESTNET.chainId
): Promise<TokenInfo> {
  const chainConfig = getChainConfig(chainId);
  const client = createPublicClient({
    chain: toViemChain(chainConfig),
    transport: http(chainConfig.rpcUrl),
  });

  const [name, symbol, decimals, totalSupply, owner] = await Promise.all([
    client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: "name" }),
    client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: "symbol" }),
    client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: "decimals" }),
    client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: "totalSupply" }),
    client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: "owner" }),
  ]);

  return {
    address: tokenAddress,
    name,
    symbol,
    decimals,
    totalSupply: formatUnits(totalSupply, decimals),
    owner,
    chain: chainConfig,
  };
}

export async function fetchBalance(
  tokenAddress: Address,
  holder: Address,
  chainId: number = ROBINHOOD_TESTNET.chainId
): Promise<string> {
  const chainConfig = getChainConfig(chainId);
  const client = createPublicClient({
    chain: toViemChain(chainConfig),
    transport: http(chainConfig.rpcUrl),
  });

  const decimals = await client.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "decimals",
  });
  const balance = await client.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [holder],
  });

  return formatUnits(balance, decimals);
}

export { ROBINHOOD_MAINNET, ROBINHOOD_TESTNET };
