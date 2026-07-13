import { z } from "zod";
import "dotenv/config";
import { getNetwork, type RobinhoodNetwork, type RobinhoodNetworkName } from "./networks.js";

const envSchema = z.object({
  PRIVATE_KEY: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/, "PRIVATE_KEY must be a 32-byte hex string with 0x prefix"),
  RH_NETWORK: z.enum(["mainnet", "testnet"]).default("testnet"),
  RH_RPC_URL: z.string().url().optional(),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    throw new Error(`Invalid environment: ${JSON.stringify(msg)}`);
  }
  return parsed.data;
}

export const env = loadEnv();

export function resolveNetwork(networkOverride?: RobinhoodNetworkName): RobinhoodNetwork {
  const name = networkOverride ?? env.RH_NETWORK;
  return getNetwork(name, env.RH_RPC_URL);
}
