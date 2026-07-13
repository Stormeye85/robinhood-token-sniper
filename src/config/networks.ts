export type RobinhoodNetworkName = "mainnet" | "testnet";

export interface RobinhoodNetwork {
  name: RobinhoodNetworkName;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  explorerApiUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export const ROBINHOOD_NETWORKS: Record<RobinhoodNetworkName, RobinhoodNetwork> = {
  mainnet: {
    name: "mainnet",
    chainId: 4663,
    rpcUrl: "https://rpc.mainnet.chain.robinhood.com",
    explorerUrl: "https://robinhoodchain.blockscout.com",
    explorerApiUrl: "https://robinhoodchain.blockscout.com/api",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  },
  testnet: {
    name: "testnet",
    chainId: 46630,
    rpcUrl: "https://rpc.testnet.chain.robinhood.com",
    explorerUrl: "https://explorer.testnet.chain.robinhood.com",
    explorerApiUrl: "https://explorer.testnet.chain.robinhood.com/api",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  },
};

export function getNetwork(name: RobinhoodNetworkName, rpcOverride?: string): RobinhoodNetwork {
  const base = ROBINHOOD_NETWORKS[name];
  if (!rpcOverride) return base;
  return { ...base, rpcUrl: rpcOverride };
}

export function explorerAddressUrl(network: RobinhoodNetwork, address: string): string {
  return `${network.explorerUrl}/address/${address}`;
}

export function explorerTxUrl(network: RobinhoodNetwork, txHash: string): string {
  return `${network.explorerUrl}/tx/${txHash}`;
}
