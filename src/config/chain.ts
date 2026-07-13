export interface RobinhoodChainConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  hardhatNetwork: "robinhood" | "robinhood-testnet";
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export const ROBINHOOD_MAINNET: RobinhoodChainConfig = {
  name: "Robinhood Chain",
  chainId: 4663,
  rpcUrl: "https://rpc.mainnet.chain.robinhood.com",
  explorerUrl: "https://robinhoodchain.blockscout.com",
  hardhatNetwork: "robinhood",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
};

export const ROBINHOOD_TESTNET: RobinhoodChainConfig = {
  name: "Robinhood Chain Testnet",
  chainId: 46630,
  rpcUrl: "https://rpc.testnet.chain.robinhood.com",
  explorerUrl: "https://explorer.testnet.chain.robinhood.com",
  hardhatNetwork: "robinhood-testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
};

export const CHAINS: Record<number, RobinhoodChainConfig> = {
  [ROBINHOOD_MAINNET.chainId]: ROBINHOOD_MAINNET,
  [ROBINHOOD_TESTNET.chainId]: ROBINHOOD_TESTNET,
};

export function getChainConfig(chainId: number): RobinhoodChainConfig {
  const chain = CHAINS[chainId];
  if (!chain) {
    throw new Error(
      `Unsupported chainId ${chainId}. Use Robinhood Chain (4663) or Testnet (46630).`
    );
  }
  return chain;
}

export interface TokenCreateArgs {
  name: string;
  symbol: string;
  supply: bigint;
  owner?: string;
}

function readArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1 || idx + 1 >= process.argv.length) return undefined;
  return process.argv[idx + 1];
}

function cliPositionalArgs(): string[] {
  const dashDash = process.argv.indexOf("--");
  return dashDash >= 0 ? process.argv.slice(dashDash + 1) : [];
}

export function parseTokenArgs(): TokenCreateArgs {
  const positional = cliPositionalArgs();

  const name = readArg("--name") ?? process.env.TOKEN_NAME ?? positional[0] ?? "My Token";

  const symbolRaw =
    readArg("--symbol") ?? process.env.TOKEN_SYMBOL ?? positional[1] ?? "MTK";
  const symbol = symbolRaw.toUpperCase();

  const supplyRaw =
    readArg("--supply") ?? process.env.TOKEN_SUPPLY ?? positional[2] ?? "1000000";

  const owner = readArg("--owner") ?? process.env.TOKEN_OWNER ?? undefined;

  if (!/^[A-Za-z0-9 ]+$/.test(name) || name.length > 64) {
    throw new Error("TOKEN_NAME must be 1–64 alphanumeric characters (spaces allowed).");
  }
  if (!/^[A-Z0-9]{2,11}$/.test(symbol)) {
    throw new Error("TOKEN_SYMBOL must be 2–11 letters/numbers.");
  }

  const supply = BigInt(supplyRaw);
  if (supply <= 0n) {
    throw new Error("TOKEN_SUPPLY must be a positive integer (whole tokens, not wei).");
  }

  return { name, symbol, supply, owner };
}

export const WALLET_ADD_CHAIN_PARAMS = {
  mainnet: {
    chainId: "0x1237" as const,
    chainName: ROBINHOOD_MAINNET.name,
    nativeCurrency: ROBINHOOD_MAINNET.nativeCurrency,
    rpcUrls: [ROBINHOOD_MAINNET.rpcUrl],
    blockExplorerUrls: [ROBINHOOD_MAINNET.explorerUrl],
  },
  testnet: {
    chainId: "0xb636" as const,
    chainName: ROBINHOOD_TESTNET.name,
    nativeCurrency: ROBINHOOD_TESTNET.nativeCurrency,
    rpcUrls: [ROBINHOOD_TESTNET.rpcUrl],
    blockExplorerUrls: [ROBINHOOD_TESTNET.explorerUrl],
  },
} as const;
