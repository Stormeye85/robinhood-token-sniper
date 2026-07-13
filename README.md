# Robinhood Chain Token Creator

TypeScript toolkit to **deploy ERC-20 tokens** on [Robinhood Chain](https://robinhood.com/us/en/chain/) — Robinhood's EVM-compatible Layer 2 (Arbitrum Orbit) that launched mainnet in July 2026.

Deploy a mintable, burnable OpenZeppelin ERC-20 to **testnet** or **mainnet**, verify on Blockscout, and read on-chain token metadata from Node.js.

## Networks

| Network | Chain ID | RPC | Explorer |
|---------|----------|-----|----------|
| Robinhood Chain | `4663` | `https://rpc.mainnet.chain.robinhood.com` | [blockscout](https://robinhoodchain.blockscout.com) |
| Robinhood Chain Testnet | `46630` | `https://rpc.testnet.chain.robinhood.com` | [testnet explorer](https://explorer.testnet.chain.robinhood.com) |

Gas is paid in **ETH**. Start on testnet before mainnet.

## Features

- **Solidity ERC-20** (`RobinhoodToken`) — OpenZeppelin v5, owner-gated mint, burnable
- **Hardhat + TypeScript** deploy scripts for Robinhood mainnet & testnet
- **Blockscout verification** helper
- **viem** read helpers — fetch name, symbol, supply, owner without a wallet
- Wallet **add-chain** params exported for MetaMask / Rabby integration

## Quick start

```bash
cd robinhood-sniper
npm install
cp .env.example .env
# Edit .env — set PRIVATE_KEY (testnet deployer with ETH)
npm run compile
```

### Create a token (testnet)

```bash
# Via npm script (recommended)
npm run create-token:testnet -- "My Token" MTK 1000000

# Or with flags / env vars
TOKEN_NAME="My Token" TOKEN_SYMBOL=MTK TOKEN_SUPPLY=1000000 npm run create-token:testnet
```

### Create a token (mainnet)

```bash
npm run create-token:mainnet -- "My Token" MTK 1000000
```

Output includes the contract address, tx hash, and a ready-to-run verify command.

### Mint additional tokens (owner only)

```bash
TOKEN_ADDRESS=0x... MINT_TO=0x... MINT_AMOUNT=5000 npm run mint -- --network robinhood-testnet
```

### Verify on Blockscout

```bash
npx hardhat run scripts/verify-token.ts --network robinhood-testnet -- 0xTokenAddress "My Token" MTK 1000000 0xOwnerAddress
```

### Read token info (no wallet)

```bash
npm run info -- 0xTokenAddress testnet
```

## Project layout

| Path | Role |
|------|------|
| `contracts/RobinhoodToken.sol` | ERC-20 implementation (OpenZeppelin) |
| `scripts/create-token.ts` | Deploy new token |
| `scripts/mint-token.ts` | Owner mint |
| `scripts/verify-token.ts` | Blockscout verification |
| `src/config/chain.ts` | Chain IDs, RPC URLs, CLI arg parsing |
| `src/token/info.ts` | viem read helpers |
| `hardhat.config.ts` | Network & explorer config |

## Environment

Copy `.env.example` to `.env`:

| Variable | Required | Description |
|----------|----------|-------------|
| `PRIVATE_KEY` | Yes (deploy/mint) | Deployer wallet private key (`0x...`) |
| `RH_RPC_URL` | No | Override default Robinhood RPC |
| `TOKEN_NAME` | No | Default token name |
| `TOKEN_SYMBOL` | No | Default symbol (2–11 chars, uppercase) |
| `TOKEN_SUPPLY` | No | Initial whole-token supply (default `1000000`) |
| `TOKEN_OWNER` | No | Owner address (defaults to deployer) |

**Never commit real private keys.**

## Add Robinhood Chain to your wallet

MetaMask → Add network → use these values (testnet):

- **Network name:** Robinhood Chain Testnet  
- **RPC URL:** `https://rpc.testnet.chain.robinhood.com`  
- **Chain ID:** `46630`  
- **Currency:** ETH  
- **Explorer:** `https://explorer.testnet.chain.robinhood.com`

Or import from code:

```typescript
import { WALLET_ADD_CHAIN_PARAMS } from "./src/config/chain";

// window.ethereum.request({ method: "wallet_addEthereumChain", params: [WALLET_ADD_CHAIN_PARAMS.testnet] })
```

## Programmatic usage

```typescript
import { fetchTokenInfo, ROBINHOOD_TESTNET } from "./src";

const info = await fetchTokenInfo("0xYourToken...", ROBINHOOD_TESTNET.chainId);
console.log(info.name, info.totalSupply);
```

## Security notes

- Use a **dedicated deployer key** with only the ETH you need for gas.
- `RobinhoodToken` grants **mint rights to the owner** — transfer ownership carefully.
- Audit and test on testnet before mainnet launches.
- This repo is a **developer template**, not financial advice.

## References

- [Robinhood Chain docs — Deploy a contract](https://docs.robinhood.com/chain/deploy-smart-contracts/)
- [Robinhood Chain mainnet announcement](https://robinhood.com/us/en/newsroom/robinhood-accelerates-global-expansion-robinhood-chain-mainnet-stock-tokens-agentic-trading/)

## License

MIT
