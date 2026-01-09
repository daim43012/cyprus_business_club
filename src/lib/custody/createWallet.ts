import type { APIClient } from "./apiClient";

export async function createWallet(client: APIClient): Promise<string> {
  const address = await client.request<string>("/wallets", "POST");
  return address;
}
