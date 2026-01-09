import type { Wallet } from "./types";
import { APIClient } from "./apiClient";

export async function getWallets(client: APIClient): Promise<Wallet[]> {
  return client.request<Wallet[]>("/wallets");
}

export async function getWalletByChain(client: APIClient, chain: string): Promise<Wallet | null> {
  const wallets = await getWallets(client);
  return wallets.find(w => w.chain.toLowerCase() === chain.toLowerCase()) ?? null;
}
